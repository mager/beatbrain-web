import React, { useState } from "react";
import Link from "next/link";
import RelationIcon from "@components/RelationIcon";
import type { CreatorCredit } from "@types";

type Props = {
  credits: CreatorCredit[];
};

const CreatorCredits: React.FC<Props> = ({ credits }) => {
  if (!credits || credits.length === 0) return null;

  return (
    <div>
      {credits.map((credit, index) => (
        <CreditGroup key={`credit-${index}`} credit={credit} defaultExpanded={index < 3} />
      ))}
    </div>
  );
};

const CreditGroup: React.FC<{ credit: CreatorCredit; defaultExpanded: boolean }> = ({
  credit,
  defaultExpanded,
}) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  const maxVisible = 5;
  const visibleRecordings = showAll
    ? credit.recordings
    : credit.recordings.slice(0, maxVisible);
  const remainingCount = credit.recordings.length - maxVisible;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsGroupExpanded((prev) => !prev)}
        className="flex items-center gap-2 mb-3 w-full text-left group"
      >
        <span className="font-mono text-[10px] text-phosphor-dim transition-transform duration-200"
          style={{ display: 'inline-block', transform: isGroupExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>
        <div className="flex flex-col justify-center items-center w-8 h-8 bg-terminal-surface border border-terminal-border rounded">
          <RelationIcon name={credit.type} />
        </div>
        <span className="data-label group-hover:text-accent transition-colors">
          {credit.type.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-phosphor-dim">
          ({credit.recordings.length})
        </span>
      </button>
      {isGroupExpanded && (
        <div className="ml-10 space-y-1">
          {visibleRecordings.map((recording) => (
            <div key={recording.id}>
              <Link
                href={`/song/${recording.id}`}
                className="font-mono text-xs text-phosphor hover:text-accent transition-colors"
              >
                {recording.title}
              </Link>
            </div>
          ))}
          {remainingCount > 0 && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="font-mono text-xs text-accent hover:text-accent/80 transition-colors"
            >
              {showAll ? "Show less" : `+${remainingCount} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorCredits;
