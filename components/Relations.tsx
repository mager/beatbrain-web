import React, { useState } from "react";
import RelationIcon from "@components/RelationIcon";
import type {
  Instrument as InstrumentT,
  ProductionCredit as ProductionCreditT,
  SongCredit as SongCreditT,
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
  const renderArtists = (artists: string[]) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxVisible = 2;

    const toggleExpanded = () => setIsExpanded((prev) => !prev);

    const visibleArtists = isExpanded ? artists : artists.slice(0, maxVisible);
    const remainingCount = artists.length - visibleArtists.length;

    return (
      <div onClick={toggleExpanded} className="cursor-pointer">
        {visibleArtists.join(", ")}
        {remainingCount > 0 && (
          <>
            {" "}
            <button className="text-gray-500">
              {isExpanded ? "Show less" : `+${remainingCount} more`}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4 mb-2">
      {instruments && (
        <>
          {instruments.map(({ instrument, artists }, index) => (
            <div key={`instrument-${index}`} className="mb-2 flex items-center">
              <div className="flex justify-center items-start mr-2 w-8 h-8">
                <RelationIcon name={instrument} />
              </div>
              <div className="text-sm flex-1 break-words">
                {renderArtists(artists)}
              </div>
            </div>
          ))}
        </>
      )}
      {production_credits && (
        <>
          {production_credits.map(({ credit, artists }, index) => (
            <div key={`production-${index}`} className="mb-2 flex items-center">
              <div className="flex justify-center items-start mr-2 w-8 h-8">
                <RelationIcon name={credit} />
              </div>
              <div className="text-sm flex-1 break-words">
                {renderArtists(artists)}
              </div>
            </div>
          ))}
        </>
      )}
      {song_credits && (
        <>
          {song_credits.map(({ credit, artists }, index) => (
            <div key={`song-${index}`} className="mb-2 flex items-center">
              <div className="flex justify-center items-start mr-2 w-8 h-8">
                <RelationIcon name={credit} />
              </div>
              <div className="text-sm flex-1 break-words">
                {renderArtists(artists)}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Relations;
