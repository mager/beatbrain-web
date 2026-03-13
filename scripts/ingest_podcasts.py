#!/usr/bin/env python3
"""
BeatBrain Podcast Ingestion Pipeline
Populates 100 brain-focused podcast categories using Spotify API

Rate limiting: Spotify allows ~1 request/second for Client Credentials flow.
We use a conservative 1.2s delay between requests to stay well under limits.
"""

import os
import sys
import time
import random
from datetime import datetime
from typing import List, Dict, Optional, Set
from dataclasses import dataclass

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from spotipy.exceptions import SpotifyException
from prisma import Prisma

# Spotify rate limiting config
REQUEST_DELAY_SECONDS = 1.2  # Conservative delay between requests
MAX_RETRIES = 3
BACKOFF_BASE = 2  # Exponential backoff base

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


class RateLimiter:
    """Simple rate limiter with exponential backoff"""
    def __init__(self, delay_seconds: float = REQUEST_DELAY_SECONDS):
        self.delay = delay_seconds
        self.last_request = 0
    
    def wait(self):
        """Wait until we can make the next request"""
        elapsed = time.time() - self.last_request
        if elapsed < self.delay:
            sleep_time = self.delay - elapsed
            time.sleep(sleep_time)
        self.last_request = time.time()


class PodcastIngestor:
    def __init__(self, dry_run: bool = False):
        self.sp = None
        self.prisma = None
        self.rate_limiter = RateLimiter()
        self.dry_run = dry_run
        self.stats = {
            "total_categories": len(BRAIN_CATEGORIES),
            "processed": 0,
            "shows_added": 0,
            "shows_skipped": 0,
            "errors": [],
            "by_category": {},
            "api_requests": 0,
            "start_time": None,
            "end_time": None,
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
            self.sp = spotipy.Spotify(
                client_credentials_manager=client_credentials_manager,
                retries=MAX_RETRIES,
                status_retries=MAX_RETRIES,
            )
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
    
    async def get_existing_spotify_ids(self) -> Set[str]:
        """Fetch all existing Spotify IDs from database"""
        if self.dry_run:
            return set()
        podcasts = await self.prisma.podcast.find_many()
        return {p.spotifyId for p in podcasts}
    
    def search_podcasts_with_retry(self, category: str) -> List[PodcastData]:
        """Search Spotify for podcasts with exponential backoff on rate limit"""
        for attempt in range(MAX_RETRIES):
            try:
                self.rate_limiter.wait()
                self.stats["api_requests"] += 1
                
                results = self.sp.search(
                    q=category,
                    type='show',
                    limit=10,
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
                
            except SpotifyException as e:
                if e.http_status == 429:  # Rate limited
                    retry_after = int(e.headers.get('Retry-After', BACKOFF_BASE ** attempt))
                    print(f"    ⚠️  Rate limited. Waiting {retry_after}s...")
                    time.sleep(retry_after)
                else:
                    self.stats["errors"].append(f"Search error for '{category}' (attempt {attempt + 1}): {str(e)}")
                    if attempt == MAX_RETRIES - 1:
                        return []
                    time.sleep(BACKOFF_BASE ** attempt)
            except Exception as e:
                self.stats["errors"].append(f"Search error for '{category}' (attempt {attempt + 1}): {str(e)}")
                if attempt == MAX_RETRIES - 1:
                    return []
                time.sleep(BACKOFF_BASE ** attempt)
        
        return []
    
    async def save_podcast(self, podcast: PodcastData, existing_ids: Set[str]) -> bool:
        """Save a podcast to the database if it doesn't exist"""
        if podcast.spotify_id in existing_ids:
            return False
        
        if self.dry_run:
            print(f"    [DRY RUN] Would add: {podcast.title}")
            return True
        
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
    
    async def process_category(self, category: str, existing_ids: Set[str]) -> int:
        """Process a single category and return count of new shows added"""
        print(f"  {category}...", end=" ", flush=True)
        
        podcasts = self.search_podcasts_with_retry(category)
        added = 0
        
        for podcast in podcasts:
            if await self.save_podcast(podcast, existing_ids):
                added += 1
        
        skipped = len(podcasts) - added
        self.stats["shows_added"] += added
        self.stats["shows_skipped"] += skipped
        self.stats["by_category"][category] = {"added": added, "found": len(podcasts)}
        
        print(f"+{added} new, {skipped} dup")
        return added
    
    async def run(self, categories: Optional[List[str]] = None):
        """Main ingestion pipeline"""
        self.stats["start_time"] = datetime.now()
        
        print("=" * 60)
        print("🧠 BeatBrain Podcast Ingestion Pipeline")
        if self.dry_run:
            print("   [DRY RUN MODE - No DB writes]")
        print("=" * 60)
        print()
        
        # Initialize connections
        if not self.init_spotify():
            return
        
        if not await self.init_db():
            return
        
        # Use provided categories or all
        categories_to_process = categories or BRAIN_CATEGORIES
        
        print()
        print(f"Processing {len(categories_to_process)} categories...")
        print(f"Rate limit: {REQUEST_DELAY_SECONDS}s between requests")
        print("-" * 60)
        
        # Get existing IDs for deduplication
        existing_ids = await self.get_existing_spotify_ids()
        print(f"Found {len(existing_ids)} existing podcasts in database")
        print()
        
        # Process each category
        for i, category in enumerate(categories_to_process, 1):
            self.stats["processed"] += 1
            print(f"[{i:3d}/{len(categories_to_process)}]", end=" ")
            await self.process_category(category, existing_ids)
        
        # Disconnect from DB
        await self.prisma.disconnect()
        self.stats["end_time"] = datetime.now()
        
        # Print final report
        self.print_report()
    
    def print_report(self):
        """Print final status report"""
        duration = (self.stats["end_time"] - self.stats["start_time"]).total_seconds()
        
        print()
        print("=" * 60)
        print("📊 INGESTION REPORT")
        print("=" * 60)
        print(f"Categories processed: {self.stats['processed']}/{self.stats['total_categories']}")
        print(f"API requests made:    {self.stats['api_requests']}")
        print(f"New shows added:      {self.stats['shows_added']}")
        print(f"Shows skipped (dup):  {self.stats['shows_skipped']}")
        print(f"Duration:             {duration:.1f}s ({duration/60:.1f} min)")
        print()
        
        print("Top categories by additions:")
        print("-" * 60)
        sorted_categories = sorted(
            self.stats["by_category"].items(),
            key=lambda x: x[1]["added"],
            reverse=True
        )[:20]  # Top 20
        
        for category, counts in sorted_categories:
            if counts["added"] > 0:
                print(f"  {category:.<40} +{counts['added']}")
        
        if self.stats["errors"]:
            print()
            print(f"⚠️  {len(self.stats['errors'])} errors encountered:")
            print("-" * 60)
            for error in self.stats["errors"][:5]:  # Show first 5 errors
                print(f"  • {error}")
            if len(self.stats["errors"]) > 5:
                print(f"  ... and {len(self.stats['errors']) - 5} more")
        
        print()
        print("=" * 60)
        print(f"✓ Ingestion complete at {self.stats['end_time'].strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)


async def main():
    import argparse
    parser = argparse.ArgumentParser(description="BeatBrain Podcast Ingestion")
    parser.add_argument("--dry-run", action="store_true", help="Run without writing to DB")
    parser.add_argument("--categories", nargs="+", help="Specific categories to process")
    args = parser.parse_args()
    
    ingestor = PodcastIngestor(dry_run=args.dry_run)
    await ingestor.run(categories=args.categories)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
