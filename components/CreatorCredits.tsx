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
    <div className="space-y-2">
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
  const maxVisible = 8;
  const visibleRecordings = showAll
    ? credit.recordings
    : credit.recordings.slice(0, maxVisible);
  const remainingCount = credit.recordings.length - maxVisible;

  return (
    <div className="rounded-lg overflow-hidden border border-transparent hover:border-terminal-border/50 transition-colors">
      <button
        onClick={() => setIsGroupExpanded((prev) => !prev)}
        className="flex items-center gap-4 w-full text-left px-4 py-3 group hover:bg-white/[0.02] transition-colors rounded-lg"
      >
        {/* Expand chevron */}
        <span
          className="font-mono text-xs text-phosphor-dim/60 transition-transform duration-200 flex-shrink-0"
          style={{ display: 'inline-block', transform: isGroupExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >
          ▶
        </span>

        {/* Icon */}
        <div className="flex flex-col justify-center items-center w-9 h-9 bg-terminal-surface border border-terminal-border rounded flex-shrink-0">
          <RelationIcon name={credit.type} />
        </div>

        {/* Label + count */}
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-mono text-sm text-phosphor group-hover:text-white transition-colors uppercase tracking-wider">
            {credit.type}
          </span>
          <span className="font-mono text-xs text-phosphor-dim/60">
            {credit.recordings.length}
          </span>
        </div>
      </button>

      {isGroupExpanded && (
        <div className="pl-[4.25rem] pr-4 pb-4 space-y-0.5">
          {visibleRecordings.map((recording) => (
            <div key={recording.id}>
              <Link
                href={`/song/${recording.id}`}
                className="font-mono text-sm text-phosphor/80 hover:text-accent transition-colors inline-block py-0.5 leading-relaxed"
              >
                {recording.title}
              </Link>
            </div>
          ))}
          {remainingCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll((prev) => !prev);
              }}
              className="font-mono text-xs text-accent hover:text-accent/80 transition-colors mt-2 inline-block"
            >
              {showAll ? "↑ Show less" : `+ ${remainingCount} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorCredits;
