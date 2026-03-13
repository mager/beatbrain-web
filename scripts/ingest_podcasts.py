#!/usr/bin/env python3
"""
BeatBrain Podcast Ingestion Pipeline
Populates 100 brain-focused podcast categories using Spotify API
"""

import os
import sys
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from prisma import Prisma

# 100 Brain-Focused Categories
BRAIN_CATEGORIES = [
    # Cognitive Science & Neuroscience
    "Neuroplasticity",
    "Cognitive Science",
    "Brain Health",
    "Neuroscience",
    "Cognitive Psychology",
    "Mental Models",
    "Cognitive Biases",
    "Decision Making",
    "Memory Improvement",
    "Attention Focus",
    
    # Philosophy & Stoicism
    "Stoicism",
    "Philosophy",
    "Existentialism",
    "Ethics",
    "Critical Thinking",
    "Logic",
    "Rationality",
    "Skepticism",
    "Epistemology",
    "Moral Philosophy",
    
    # Productivity & Deep Work
    "Deep Work",
    "Productivity",
    "Time Management",
    "Focus Techniques",
    "Flow State",
    "Habits",
    "Atomic Habits",
    "Getting Things Done",
    "Personal Organization",
    "Peak Performance",
    
    # Behavioral Economics
    "Behavioral Economics",
    "Behavioral Psychology",
    "Nudge Theory",
    "Choice Architecture",
    "Loss Aversion",
    "Game Theory",
    "Economic Psychology",
    "Decision Fatigue",
    "Present Bias",
    "Anchoring Bias",
    
    # Biohacking & Optimization
    "Biohacking",
    "Nootropics",
    "Sleep Optimization",
    "Circadian Rhythm",
    "Cold Exposure",
    "Intermittent Fasting",
    "Ketogenic Diet",
    "Brain Supplements",
    "Quantified Self",
    "Longevity",
    
    # Learning & Skill Acquisition
    "Accelerated Learning",
    "Skill Acquisition",
    "Deliberate Practice",
    "Language Learning",
    "Memory Techniques",
    "Speed Reading",
    "Learning Science",
    "Knowledge Management",
    "Second Brain",
    "Zettelkasten",
    
    # Mental Health & Wellness
    "Mindfulness",
    "Meditation",
    "Anxiety Management",
    "Stress Reduction",
    "Emotional Intelligence",
    "Resilience",
    "Mental Toughness",
    "Self Compassion",
    "Burnout Prevention",
    "Psychology",
    
    # Creativity & Innovation
    "Creativity",
    "Creative Thinking",
    "Innovation",
    "Design Thinking",
    "Lateral Thinking",
    "Problem Solving",
    "Ideation",
    "Inventing",
    "Artistic Mindset",
    "Imagination",
    
    # Leadership & Communication
    "Leadership Psychology",
    "Influence",
    "Persuasion",
    "Communication Skills",
    "Negotiation",
    "Social Dynamics",
    "Charisma",
    "Storytelling",
    "Public Speaking",
    "Team Psychology",
    
    # Future & Systems Thinking
    "Systems Thinking",
    "Complexity Theory",
    "Futurism",
    "Artificial Intelligence",
    "Consciousness Studies",
    "Mind Uploading",
    "Transhumanism",
    "Singularity",
    "Emergence",
    "Chaos Theory",
]


@dataclass
class PodcastData:
    title: str
    description: Optional[str]
    cover_art_url: Optional[str]
    spotify_uri: str
    spotify_id: str
    category: str


class PodcastIngestor:
    def __init__(self):
        self.sp = None
        self.prisma = None
        self.stats = {
            "total_categories": len(BRAIN_CATEGORIES),
            "processed": 0,
            "shows_added": 0,
            "shows_skipped": 0,
            "errors": [],
            "by_category": {}
        }
    
    def init_spotify(self) -> bool:
        """Initialize Spotify API client"""
        client_id = os.getenv("SPOTIPY_CLIENT_ID")
        client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            print("❌ Error: SPOTIPY_CLIENT_ID and SPOTIPY_CLIENT_SECRET must be set in .env")
            return False
        
        try:
            client_credentials_manager = SpotifyClientCredentials(
                client_id=client_id, 
                client_secret=client_secret
            )
            self.sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
            print("✓ Spotify API initialized")
            return True
        except Exception as e:
            print(f"❌ Error initializing Spotify: {e}")
            return False
    
    async def init_db(self) -> bool:
        """Initialize Prisma database connection"""
        try:
            self.prisma = Prisma()
            await self.prisma.connect()
            print("✓ Database connected")
            return True
        except Exception as e:
            print(f"❌ Error connecting to database: {e}")
            return False
    
    async def get_existing_spotify_ids(self) -> set:
        """Fetch all existing Spotify IDs from database"""
        podcasts = await self.prisma.podcast.find_many()
        return {p.spotifyId for p in podcasts}
    
    def search_podcasts(self, category: str) -> List[PodcastData]:
        """Search Spotify for podcasts in a category"""
        try:
            results = self.sp.search(
                q=category,
                type='show',
                limit=5,
                market='US'
            )
            
            podcasts = []
            for show in results.get('shows', {}).get('items', []):
                if not show:
                    continue
                    
                podcast = PodcastData(
                    title=show.get('name', 'Unknown'),
                    description=show.get('description'),
                    cover_art_url=show.get('images', [{}])[0].get('url') if show.get('images') else None,
                    spotify_uri=show.get('uri', ''),
                    spotify_id=show.get('id', ''),
                    category=category
                )
                podcasts.append(podcast)
            
            return podcasts
            
        except Exception as e:
            self.stats["errors"].append(f"Search error for '{category}': {str(e)}")
            return []
    
    async def save_podcast(self, podcast: PodcastData, existing_ids: set) -> bool:
        """Save a podcast to the database if it doesn't exist"""
        if podcast.spotify_id in existing_ids:
            return False
        
        try:
            await self.prisma.podcast.create({
                'title': podcast.title,
                'description': podcast.description,
                'coverArtUrl': podcast.cover_art_url,
                'spotifyUri': podcast.spotify_uri,
                'spotifyId': podcast.spotify_id,
                'category': podcast.category
            })
            existing_ids.add(podcast.spotify_id)
            return True
        except Exception as e:
            self.stats["errors"].append(f"Save error for '{podcast.title}': {str(e)}")
            return False
    
    async def process_category(self, category: str, existing_ids: set) -> int:
        """Process a single category and return count of new shows added"""
        print(f"  Searching: {category}...", end=" ")
        
        podcasts = self.search_podcasts(category)
        added = 0
        
        for podcast in podcasts:
            if await self.save_podcast(podcast, existing_ids):
                added += 1
        
        skipped = len(podcasts) - added
        self.stats["shows_added"] += added
        self.stats["shows_skipped"] += skipped
        self.stats["by_category"][category] = {"added": added, "found": len(podcasts)}
        
        print(f"+{added} new, {skipped} skipped")
        return added
    
    async def run(self):
        """Main ingestion pipeline"""
        print("=" * 60)
        print("🧠 BeatBrain Podcast Ingestion Pipeline")
        print("=" * 60)
        print()
        
        # Initialize connections
        if not self.init_spotify():
            return
        
        if not await self.init_db():
            return
        
        print()
        print(f"Processing {len(BRAIN_CATEGORIES)} brain-focused categories...")
        print("-" * 60)
        
        # Get existing IDs for deduplication
        existing_ids = await self.get_existing_spotify_ids()
        print(f"Found {len(existing_ids)} existing podcasts in database")
        print()
        
        # Process each category
        for i, category in enumerate(BRAIN_CATEGORIES, 1):
            self.stats["processed"] += 1
            print(f"[{i:3d}/{len(BRAIN_CATEGORIES)}]", end="")
            await self.process_category(category, existing_ids)
        
        # Disconnect from DB
        await self.prisma.disconnect()
        
        # Print final report
        self.print_report()
    
    def print_report(self):
        """Print final status report"""
        print()
        print("=" * 60)
        print("📊 INGESTION REPORT")
        print("=" * 60)
        print(f"Categories processed: {self.stats['processed']}/{self.stats['total_categories']}")
        print(f"New shows added:      {self.stats['shows_added']}")
        print(f"Shows skipped (dup):  {self.stats['shows_skipped']}")
        print()
        
        print("Breakdown by category:")
        print("-" * 60)
        for category, counts in self.stats["by_category"].items():
            added = counts["added"]
            found = counts["found"]
            if added > 0:
                print(f"  {category:.<40} +{added} (found {found})")
        
        if self.stats["errors"]:
            print()
            print("⚠️  Errors encountered:")
            print("-" * 60)
            for error in self.stats["errors"][:10]:  # Show first 10 errors
                print(f"  • {error}")
            if len(self.stats["errors"]) > 10:
                print(f"  ... and {len(self.stats['errors']) - 10} more errors")
        
        print()
        print("=" * 60)
        print(f"✓ Ingestion complete at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)


async def main():
    ingestor = PodcastIngestor()
    await ingestor.run()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
