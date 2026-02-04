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
    <Box className="min-h-screen relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="fixed inset-0 pointer-events-none grid-overlay opacity-50" />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col justify-center px-4 md:px-8 lg:px-12 pt-20">
        {/* Giant Terminal Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-phosphor-dim">root@beatbrain:~$</span>
            <span className="font-mono text-xs text-phosphor-dim animate-flicker">discover --init</span>
          </div>
          <h1 className="font-display text-massive text-matrix text-glow-green leading-none tracking-wider cursor-blink">
            BEATBRAIN
          </h1>
          <p className="font-mono text-sm text-phosphor-dim mt-4 max-w-lg">
            {'>'} music_discovery_engine v2.0 — scanning frequencies, indexing sound
          </p>
        </div>

        {/* Filter Toggle - Terminal Commands */}
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => handleFilterChange('new')}
            className={`font-mono text-xs px-4 py-2 border transition-all duration-300 ${
              activeFilter === 'new'
                ? 'border-matrix text-matrix bg-matrix/5 shadow-glow-green text-glow-green'
                : 'border-terminal-border text-phosphor-dim hover:border-phosphor-dim hover:text-phosphor'
            }`}
          >
            <span className="text-phosphor-dim mr-1">{'>'}</span>
            fresh --mode=new
          </button>
          <button
            onClick={() => handleFilterChange('hot')}
            className={`font-mono text-xs px-4 py-2 border transition-all duration-300 ${
              activeFilter === 'hot'
                ? 'border-hotpink text-hotpink bg-hotpink/5 shadow-glow-pink text-glow-pink'
                : 'border-terminal-border text-phosphor-dim hover:border-phosphor-dim hover:text-phosphor'
            }`}
          >
            <span className="text-phosphor-dim mr-1">{'>'}</span>
            hot --mode=trending
          </button>
        </div>

        {/* Featured Track - Terminal Window */}
        {isLoading ? (
          <div className="terminal-window max-w-3xl">
            <div className="terminal-titlebar">loading_featured.process</div>
            <div className="p-6 flex flex-col sm:flex-row gap-6">
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-terminal-bg animate-pulse border border-terminal-border" />
              <div className="space-y-3 flex-1">
                <div className="h-4 w-3/4 bg-terminal-border animate-pulse" />
                <div className="h-3 w-1/2 bg-terminal-border animate-pulse" />
                <div className="h-3 w-1/3 bg-terminal-border animate-pulse" />
              </div>
            </div>
          </div>
        ) : featuredTrack ? (
          <Link 
            href={`/song/${featuredTrack.id}`}
            className="group terminal-window max-w-3xl hover:border-matrix/30 transition-all duration-500"
          >
            <div className="terminal-titlebar">
              <span>now_playing.exe</span>
              <span className="ml-auto text-matrix">● LIVE</span>
            </div>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
              {/* Album Cover - Surveillance style */}
              <div className="relative flex-shrink-0">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 border border-terminal-border overflow-hidden">
                  <Image
                    src={featuredTrack.image}
                    alt={featuredTrack.name}
                    fill
                    className="object-cover transition-all duration-500 group-hover:opacity-90"
                    priority
                    unoptimized
                  />
                  {/* Surveillance corners */}
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-matrix/60" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-matrix/60" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-matrix/60" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-matrix/60" />
                  
                  {/* Rank badge */}
                  <div className={`absolute top-2 right-2 font-mono text-[10px] px-2 py-1 ${
                    activeFilter === 'new' 
                      ? 'bg-matrix/90 text-terminal-bg' 
                      : 'bg-hotpink/90 text-terminal-bg'
                  }`}>
                    RANK:01
                  </div>
                </div>
              </div>

              {/* Track Data Readout */}
              <div className="flex-1 flex flex-col justify-center font-mono">
                <div className="data-label mb-1">
                  {activeFilter === 'new' ? '// FRESH DISCOVERY' : '// TRENDING NOW'}
                </div>
                <h2 className="text-xl sm:text-2xl text-phosphor font-bold leading-tight mb-2 group-hover:text-matrix transition-colors duration-300">
                  {featuredTrack.name}
                </h2>
                <p className="text-sm text-phosphor-dim mb-4">
                  {featuredTrack.artist}
                </p>
                
                {/* Data fields */}
                <div className="space-y-1 text-[11px] border-t border-terminal-border pt-3">
                  {featuredTrack.isrc && (
                    <div className="flex gap-2">
                      <span className="text-phosphor-dim">ISRC:</span>
                      <span className="text-cyber">{featuredTrack.isrc}</span>
                    </div>
                  )}
                  {featuredTrack.source && (
                    <div className="flex gap-2">
                      <span className="text-phosphor-dim">SOURCE:</span>
                      <span className="text-phosphor">{featuredTrack.source}</span>
                    </div>
                  )}
                  {featuredTrack.genres && featuredTrack.genres.length > 0 && (
                    <div className="flex gap-2">
                      <span className="text-phosphor-dim">GENRES:</span>
                      <span className="text-phosphor">
                        [{featuredTrack.genres.slice(0, 3).join(', ')}]
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className={`mt-4 text-xs ${
                  activeFilter === 'new' ? 'text-matrix' : 'text-hotpink'
                } group-hover:animate-pulse`}>
                  {'>'} EXPLORE_TRACK →
                </div>
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      {/* Track Grid Section */}
      <section className="relative px-4 md:px-8 lg:px-12 py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 border-b border-terminal-border pb-3">
          <div className="font-mono">
            <span className="text-[10px] text-phosphor-dim block mb-1">
              // MONITORING {restTracks.length} SIGNALS
            </span>
            <h3 className="text-sm text-phosphor">
              <span className="text-matrix mr-2">$</span>
              {activeFilter === 'new' ? 'scan --fresh --limit=24' : 'scan --hot --limit=24'}
            </h3>
          </div>
          {updated && (
            <p className="font-mono text-[10px] text-phosphor-dim">
              LAST_SYNC: {new Date(updated).toISOString().replace('T', ' ').substring(0, 19)}
            </p>
          )}
        </div>

        {/* Grid - Surveillance Wall */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="aspect-square bg-terminal-surface border border-terminal-border animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        ) : restTracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            {restTracks.map((track, index) => (
              <Link
                key={track.id}
                href={`/song/${track.id}`}
                className="group relative aspect-square overflow-hidden border border-terminal-border hover:border-matrix/50 transition-all duration-300 bg-terminal-surface opacity-0 animate-fadeUp"
                style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'forwards' }}
                onMouseEnter={() => setHoveredTrack(track.id)}
                onMouseLeave={() => setHoveredTrack(null)}
              >
                <Image
                  src={track.image}
                  alt={track.name}
                  fill
                  className="object-cover transition-all duration-500 group-hover:opacity-70 group-hover:scale-105"
                  unoptimized
                />
                
                {/* Scanline on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
                  }}
                />
                
                {/* Bottom overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-terminal-bg via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Track info */}
                <div className="absolute inset-x-0 bottom-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <p className="font-mono text-[11px] text-phosphor line-clamp-1">
                    {track.name}
                  </p>
                  <p className="font-mono text-[9px] text-phosphor-dim line-clamp-1">
                    {track.artist}
                  </p>
                </div>

                {/* Rank number */}
                <div className="absolute top-1 left-1 font-mono text-[9px] text-matrix/70 bg-terminal-bg/70 px-1 py-0.5">
                  {String(index + 2).padStart(2, '0')}
                </div>

                {/* Corner brackets on hover */}
                <div className="absolute top-0.5 left-0.5 w-2 h-2 border-t border-l border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                <div className="absolute top-0.5 right-0.5 w-2 h-2 border-t border-r border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-b border-l border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-b border-r border-matrix/0 group-hover:border-matrix/50 transition-all duration-300" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 font-mono">
            <p className="text-phosphor-dim text-sm">NO_SIGNALS_DETECTED</p>
          </div>
        )}
      </section>

      {/* Bottom CTA - Terminal Prompt */}
      <section className="relative px-4 md:px-8 lg:px-12 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="terminal-window">
            <div className="terminal-titlebar">system_prompt.sh</div>
            <div className="p-6 md:p-8 font-mono">
              <div className="text-xs text-phosphor-dim mb-4">
                <span className="text-matrix">$</span> cat /etc/beatbrain/motd
              </div>
              <h3 className="text-lg text-phosphor mb-3">
                Save your discoveries.
              </h3>
              <p className="text-sm text-phosphor-dim mb-6">
                Build your collection. Share signals. Find your frequency.
              </p>
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-matrix text-matrix font-mono text-xs hover:bg-matrix/10 hover:shadow-glow-green transition-all duration-300"
              >
                <span>{'>'}</span>
                <span>cd /feed</span>
                <span className="animate-blink">_</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Box>
  );
};

export default Home;
