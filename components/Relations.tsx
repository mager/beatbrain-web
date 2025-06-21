import React, { useState } from "react";
import RelationIcon from "@components/RelationIcon";
import type {
  Instrument as InstrumentT,
  ProductionCredit as ProductionCreditT,
  SongCredit as SongCreditT,
} from "@types";
import Box from "./Box";

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
    <Box>
      {instruments && instruments.length > 0 && (
        <>
          <div className="font-bold text-xs text-gray-500 mb-2">INSTRUMENTS</div>
          {instruments.map(({ instrument, artists }, index) => (
            <div key={`instrument-${index}`} className="mb-2 flex items-center">
              <div className="flex flex-col justify-center items-center mr-2 w-8 h-8">
                <RelationIcon name={instrument} />
              </div>
              <div className="flex-1 break-words">{renderArtists(artists)}</div>
            </div>
          ))}
        </>
      )}
      {(instruments && instruments.length > 0) && ((production_credits && production_credits.length > 0) || (song_credits && song_credits.length > 0)) && (
        <div className="my-4 border-t-2 border-gray-200" />
      )}
      {(production_credits && production_credits.length > 0) || (song_credits && song_credits.length > 0) ? (
        <div className="font-bold text-xs text-gray-500 mb-2">CREDITS</div>
      ) : null}
      {production_credits && (
        <>
          {production_credits.map(({ credit, artists }, index) => (
            <div key={`production-${index}`} className="mb-2 flex items-center">
              <div className="flex flex-col justify-center items-center mr-2 w-8 h-8">
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
              <div className="flex flex-col justify-center items-center mr-2 w-8 h-8">
                <RelationIcon name={credit} />
              </div>
              <div className="flex-1 break-words">{renderArtists(artists)}</div>
            </div>
          ))}
        </>
      )}
    </Box>
  );
};

export default Relations;
