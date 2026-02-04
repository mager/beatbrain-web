import React, { useState, useEffect } from "react";
import type { RecommendedTracksResp, Track } from "@types";
import Link from "next/link";
import Image from "next/image";
import Box from "@components/Box";

const Home: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeFilter, setActiveFilter] = useState<'hot' | 'new'>('new');
  const [updated, setUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  const fetchTracks = async (filter: 'hot' | 'new') => {
    try {
      const res = await fetch(`/api/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: filter }),
      });
      if (!res.ok) return;
      const resp: RecommendedTracksResp = await res.json();
      setTracks(resp.tracks);
      setFeaturedTrack(resp.tracks[0] || null);
      setUpdated(resp.updated || null);
    } catch (err) {
      console.error("Error fetching tracks:", err);
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
    setFeaturedTrack(null);
    setActiveFilter(filter);
    fetchTracks(filter);
  };

  const restTracks = tracks.slice(1, 25);

  return (
    <Box className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex flex-col justify-center px-4 md:px-8 lg:px-12 pt-20">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-massive text-phosphor leading-none tracking-tight">
            beatbrain<span className="text-accent">.</span>
          </h1>
          <p className="font-mono text-sm text-phosphor-dim mt-4 max-w-md">
            discover music · dig deeper
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => handleFilterChange('new')}
            className={`font-mono text-xs px-4 py-2 border rounded transition-all duration-300 ${
              activeFilter === 'new'
                ? 'border-accent text-accent bg-accent/5'
                : 'border-terminal-border text-phosphor-dim hover:border-terminal-border-bright hover:text-phosphor'
            }`}
          >
            fresh
          </button>
          <button
            onClick={() => handleFilterChange('hot')}
            className={`font-mono text-xs px-4 py-2 border rounded transition-all duration-300 ${
              activeFilter === 'hot'
                ? 'border-warm text-warm bg-warm/5'
                : 'border-terminal-border text-phosphor-dim hover:border-terminal-border-bright hover:text-phosphor'
            }`}
          >
            trending
          </button>
        </div>

        {/* Featured Track */}
        {isLoading ? (
          <div className="terminal-window max-w-3xl">
            <div className="terminal-titlebar">loading</div>
            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-terminal-bg animate-pulse rounded" />
              <div className="space-y-3 flex-1">
                <div className="h-4 w-3/4 bg-terminal-border animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-terminal-border animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-terminal-border animate-pulse rounded" />
              </div>
            </div>
          </div>
        ) : featuredTrack ? (
          <Link 
            href={`/song/${featuredTrack.id}`}
            className="group terminal-window max-w-3xl hover:border-accent/30 transition-all duration-500"
          >
            <div className="terminal-titlebar">
              <span>now playing</span>
              <span className={`ml-auto ${activeFilter === 'new' ? 'text-accent' : 'text-warm'}`}>●</span>
            </div>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
              {/* Album Cover */}
              <div className="relative flex-shrink-0">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded overflow-hidden">
                  <Image
                    src={featuredTrack.image}
                    alt={featuredTrack.name}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-[1.03]"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {/* Track Data */}
              <div className="flex-1 flex flex-col justify-center font-mono">
                <div className="data-label mb-1">
                  {activeFilter === 'new' ? 'fresh discovery' : 'trending now'}
                </div>
                <h2 className="text-xl sm:text-2xl text-phosphor font-semibold leading-tight mb-2 group-hover:text-accent transition-colors duration-300">
                  {featuredTrack.name}
                </h2>
                <p className="text-sm text-phosphor-dim mb-4">
                  {featuredTrack.artist}
                </p>
                
                {/* Metadata */}
                <div className="space-y-1.5 text-[11px] border-t border-terminal-border pt-3">
                  {featuredTrack.isrc && (
                    <div className="flex gap-2">
                      <span className="text-phosphor-dim">isrc</span>
                      <span className="text-cool">{featuredTrack.isrc}</span>
                    </div>
                  )}
                  {featuredTrack.source && (
                    <div className="flex gap-2">
                      <span className="text-phosphor-dim">source</span>
                      <span className="text-phosphor">{featuredTrack.source}</span>
                    </div>
                  )}
                  {featuredTrack.genres && featuredTrack.genres.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-phosphor-dim">genres</span>
                      <span className="text-phosphor">
                        {featuredTrack.genres.slice(0, 3).join(' · ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className={`mt-4 text-xs ${
                  activeFilter === 'new' ? 'text-accent' : 'text-warm'
                } opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
                  explore →
                </div>
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      {/* Track Grid */}
      <section className="relative px-4 md:px-8 lg:px-12 py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 border-b border-terminal-border pb-3">
          <div className="font-mono">
            <span className="text-[10px] text-phosphor-dim block mb-1 uppercase tracking-wider">
              {restTracks.length} tracks
            </span>
            <h3 className="text-sm text-phosphor">
              {activeFilter === 'new' ? 'latest discoveries' : 'what\'s hot'}
            </h3>
          </div>
          {updated && (
            <p className="font-mono text-[10px] text-phosphor-dim">
              updated {new Date(updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="aspect-square bg-terminal-surface rounded animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        ) : restTracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {restTracks.map((track, index) => (
              <Link
                key={track.id}
                href={`/song/${track.id}`}
                className="group relative aspect-square overflow-hidden rounded bg-terminal-surface opacity-0 animate-fadeUp"
                style={{ animationDelay: `${index * 25}ms`, animationFillMode: 'forwards' }}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                  unoptimized
                />
                
                {/* Bottom overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Track info */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <p className="font-mono text-[11px] text-phosphor line-clamp-1">
                    {track.name}
                  </p>
                  <p className="font-mono text-[9px] text-phosphor-dim line-clamp-1 mt-0.5">
                    {track.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 font-mono">
            <p className="text-phosphor-dim text-sm">no tracks found</p>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="relative px-4 md:px-8 lg:px-12 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="terminal-window">
            <div className="terminal-titlebar">beatbrain</div>
            <div className="p-6 md:p-8 font-mono">
              <h3 className="text-lg text-phosphor mb-3">
                Save your discoveries.
              </h3>
              <p className="text-sm text-phosphor-dim mb-6">
                Build your collection. Share what you find. Dig deeper.
              </p>
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-accent/40 text-accent font-mono text-xs hover:bg-accent/5 hover:border-accent transition-all duration-300 rounded"
              >
                browse feed →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Box>
  );
};

export default Home;
