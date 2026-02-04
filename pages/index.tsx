import React, { useState, useEffect } from "react";
import type { RecommendedTracksResp, Track } from "@types";
import Link from "next/link";
import Image from "next/image";
import Box from "@components/Box";
import TrackItem from "../components/TrackItem";
import { SparklesIcon, FireIcon, ClockIcon } from "@heroicons/react/24/solid";

type Props = {};

const Home: React.FC<Props> = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeFilter, setActiveFilter] = useState<'hot' | 'new'>('new');
  const [updated, setUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);

  const fetchTracks = async (filter: 'hot' | 'new') => {
    try {
      const res = await fetch(`/api/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: filter }),
      });
      if (!res.ok) {
        console.error(`Failed to fetch discover: ${res.status} ${res.statusText}`);
        setUpdated(null);
        return;
      }
      const resp: RecommendedTracksResp = await res.json();
      setTracks(resp.tracks);
      setFeaturedTrack(resp.tracks[0] || null);
      setUpdated(resp.updated || null);
    } catch (err) {
      console.error("Error fetching tracks:", err);
      setUpdated(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks('new');
  }, []);

  const handleFilterChange = (filter: 'hot' | 'new') => {
    if (filter === activeFilter) return;
    setTracks([]);
    setIsLoading(true);
    setUpdated(null);
    setActiveFilter(filter);
    setTimeout(() => fetchTracks(filter), 0);
  };

  const formattedDate = (() => {
    if (!updated || isNaN(new Date(updated).getTime())) return "recently";
    try {
      return new Date(updated).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (e) {
      return "recently";
    }
  })();

  const restTracks = tracks.slice(1);

  return (
    <Box className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-8">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative px-4 md:px-8 py-8">
          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => handleFilterChange('new')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                activeFilter === 'new'
                  ? 'bg-green-500 text-black shadow-lg shadow-green-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <SparklesIcon className="w-4 h-4" />
              Fresh Finds
            </button>
            <button
              onClick={() => handleFilterChange('hot')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                activeFilter === 'hot'
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FireIcon className="w-4 h-4" />
              Hot Right Now
            </button>
          </div>

          {/* Featured Track */}
          {isLoading ? (
            <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/5 animate-pulse rounded-2xl" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded" />
                <div className="h-6 w-1/2 bg-white/5 animate-pulse rounded" />
              </div>
            </div>
          ) : featuredTrack ? (
            <Link 
              href={`/song/${featuredTrack.id}`}
              className="group flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto"
            >
              {/* Album Art with glow */}
              <div className="relative">
                <div className="absolute -inset-4 bg-green-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
                  <Image
                    src={featuredTrack.image}
                    alt={featuredTrack.name}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                  {/* Vinyl peek effect */}
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-700 shadow-inner">
                    <div className="absolute inset-4 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900">
                      <div className="absolute inset-0 rounded-full border border-zinc-700/50" style={{ 
                        background: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)'
                      }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                </div>
                {/* Now Playing badge */}
                <div className="absolute -top-2 -left-2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  #1 {activeFilter === 'new' ? 'FRESH' : 'HOT'}
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-300 leading-tight">
                  {featuredTrack.name}
                </h1>
                <p className="text-xl md:text-2xl text-white/60 mb-4">
                  {featuredTrack.artist}
                </p>
                {featuredTrack.genres && featuredTrack.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {featuredTrack.genres.slice(0, 3).map((genre, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/50 border border-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-6 inline-flex items-center gap-2 text-green-500 font-medium group-hover:gap-3 transition-all duration-300">
                  <span>Explore Track</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Grid Section */}
      <div className="px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white/80 uppercase tracking-wider">
            {activeFilter === 'new' ? 'Fresh Discoveries' : 'Trending Now'}
          </h2>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ClockIcon className="w-4 h-4" />
            <span>Updated {formattedDate}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
            {[...Array(80)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white/5 animate-pulse rounded-sm"
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        ) : restTracks && restTracks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
            {restTracks.map((track, index) => (
              <div 
                key={track.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TrackItem track={track} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/40 py-20">
            <p className="text-lg">No tracks found</p>
            <p className="text-sm mt-2">Check back soon for fresh discoveries</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="mt-16 mb-8 px-4 md:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block p-px bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl">
            <div className="bg-black rounded-2xl px-8 py-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Join the Community
              </h3>
              <p className="text-white/50 text-sm mb-4">
                Share your discoveries and see what others are listening to
              </p>
              <Link 
                href="/feed"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200"
              >
                <span>View Feed</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Home;
