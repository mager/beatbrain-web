import React from "react";
import Link from "next/link";
import type {
  Instrument as InstrumentT,
  ProductionCredit as ProductionCreditT,
  SongCredit as SongCreditT,
  CreditArtist,
} from "@types";

type Props = {
  instruments: InstrumentT[];
  production_credits: ProductionCreditT[];
  song_credits: SongCreditT[];
};

const roleIcons: Record<string, string> = {
  // Production
  producer: "🎛️",
  mix: "🎚️",
  recording: "⏺️",
  vocal: "🎤",
  // Songwriting
  composer: "🎼",
  lyricist: "✍️",
  writer: "📝",
  // Instruments
  piano: "🎹",
  keyboard: "🎹",
  guitar: "🎸",
  bass: "🎸",
  drums: "🥁",
  percussion: "🥁",
  synthesizer: "🔊",
  violin: "🎻",
  cello: "🎻",
  trumpet: "🎺",
  saxophone: "🎷",
  harmonica: "🎵",
  organ: "🎹",
  strings: "🎻",
};

const getIcon = (role: string): string => {
  const lower = role.toLowerCase();
  return roleIcons[lower] || "🎵";
};

const ArtistName = ({ artist }: { artist: CreditArtist | string }) => {
  const isObject = typeof artist === "object" && artist !== null;
  const name = isObject ? (artist as CreditArtist).name : (artist as string);
  const id = isObject ? (artist as CreditArtist).id : null;

  if (id) {
    return (
      <Link
        href={`/creator/${id}`}
        className="text-phosphor hover:text-accent transition-colors"
      >
        {name}
      </Link>
    );
  }
  return <span className="text-phosphor">{name}</span>;
};

type CreditSectionProps = {
  title: string;
  items: { role: string; artists: (CreditArtist | string)[] }[];
};

const CreditSection = ({ title, items }: CreditSectionProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="data-label mb-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-terminal-border" />
        <span>{title}</span>
        <div className="h-px flex-1 bg-terminal-border" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ role, artists }, index) => (
          <div
            key={`${role}-${index}`}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{getIcon(role)}</span>
            <div className="min-w-0">
              <div className="font-mono text-[10px] text-phosphor-dim uppercase tracking-wider mb-1">
                {role}
              </div>
              <div className="font-mono text-xs space-y-0.5">
                {artists.map((artist, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-phosphor-dim">, </span>}
                    <ArtistName artist={artist} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Credits: React.FC<Props> = ({
  instruments,
  production_credits,
  song_credits,
}) => {
  const hasInstruments = instruments && instruments.length > 0;
  const hasProduction = production_credits && production_credits.length > 0;
  const hasSongwriting = song_credits && song_credits.length > 0;

  if (!hasInstruments && !hasProduction && !hasSongwriting) return null;

  // Count total people
  const allArtists = new Set<string>();
  const countArtists = (artists: (CreditArtist | string)[]) => {
    artists.forEach((a) => {
      const name = typeof a === "object" ? a.name : a;
      allArtists.add(name);
    });
  };
  if (hasInstruments) instruments.forEach((i) => countArtists(i.artists));
  if (hasProduction) production_credits.forEach((p) => countArtists(p.artists));
  if (hasSongwriting) song_credits.forEach((s) => countArtists(s.artists));

  return (
    <div className="space-y-8">
      {/* Summary line */}
      <div className="font-mono text-xs text-phosphor-dim">
        {allArtists.size} {allArtists.size === 1 ? "person" : "people"} credited
      </div>

      {/* Songwriting — the foundation */}
      <CreditSection
        title="Songwriting"
        items={(song_credits || []).map((c) => ({
          role: c.credit,
          artists: c.artists,
        }))}
      />

      {/* Performance */}
      <CreditSection
        title="Performance"
        items={(instruments || []).map((i) => ({
          role: i.instrument,
          artists: i.artists,
        }))}
      />

      {/* Production */}
      <CreditSection
        title="Production"
        items={(production_credits || []).map((p) => ({
          role: p.credit,
          artists: p.artists,
        }))}
      />
    </div>
  );
};

export default Credits;
