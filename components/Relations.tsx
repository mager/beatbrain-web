import React, { useState } from "react";
import Link from "next/link";
import RelationIcon from "@components/RelationIcon";
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

const Relations: React.FC<Props> = ({
  instruments,
  production_credits,
  song_credits,
}) => {
  const renderArtists = (artists: CreditArtist[]) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxVisible = 2;

    const toggleExpanded = () => setIsExpanded((prev) => !prev);

    const visibleArtists = isExpanded ? artists : artists.slice(0, maxVisible);
    const remainingCount = artists.length - visibleArtists.length;

    return (
      <div onClick={toggleExpanded} className="cursor-pointer text-phosphor font-mono text-xs">
        {visibleArtists.map((artist, i) => (
          <span key={artist.id}>
            {i > 0 && ", "}
            <Link
              href={`/creator/${artist.id}`}
              className="text-phosphor hover:text-accent transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {artist.name}
            </Link>
          </span>
        ))}
        {remainingCount > 0 && (
          <>
            {" "}
            <button className="text-accent hover:text-accent/80 transition-colors">
              {isExpanded ? "Show less" : `+${remainingCount} more`}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      {instruments && instruments.length > 0 && (
        <>
          <div className="data-label mb-3">INSTRUMENTS</div>
          {instruments.map(({ instrument, artists }, index) => (
            <div key={`instrument-${index}`} className="mb-2 flex items-center">
              <div className="flex flex-col justify-center items-center mr-3 w-8 h-8 bg-terminal-surface border border-terminal-border rounded">
                <RelationIcon name={instrument} />
              </div>
              <div className="flex-1 break-words">{renderArtists(artists)}</div>
            </div>
          ))}
        </>
      )}
      {(instruments && instruments.length > 0) && ((production_credits && production_credits.length > 0) || (song_credits && song_credits.length > 0)) && (
        <div className="my-4 border-t border-terminal-border" />
      )}
      {(production_credits && production_credits.length > 0) || (song_credits && song_credits.length > 0) ? (
        <div className="data-label mb-3">CREDITS</div>
      ) : null}
      {production_credits && (
        <>
          {production_credits.map(({ credit, artists }, index) => (
            <div key={`production-${index}`} className="mb-2 flex items-center">
              <div className="flex flex-col justify-center items-center mr-3 w-8 h-8 bg-terminal-surface border border-terminal-border rounded">
                <RelationIcon name={credit} />
              </div>
              <div className="flex-1 break-words">{renderArtists(artists)}</div>
            </div>
          ))}
        </>
      )}
      {song_credits && (
        <>
          {song_credits.map(({ credit, artists }, index) => (
            <div key={`song-${index}`} className="mb-2 flex items-center">
              <div className="flex flex-col justify-center items-center mr-3 w-8 h-8 bg-terminal-surface border border-terminal-border rounded">
                <RelationIcon name={credit} />
              </div>
              <div className="flex-1 break-words">{renderArtists(artists)}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Relations;
