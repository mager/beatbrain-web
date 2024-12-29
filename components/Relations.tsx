import type {
  Instrument as InstrumentT,
  ProductionCredit as ProductionCreditT,
} from "@types";
import React from "react";
import RelationIcon from "@components/RelationIcon";

type Props = {
  instruments: InstrumentT[];
  production_credits: ProductionCreditT[];
};

const Relations: React.FC<Props> = ({ instruments, production_credits }) => {
  return (
    <div className="mt-4 mb-2">
      {instruments && (
        <>
          {instruments.map(({ instrument, artists }) => (
            <div className="mb-2 flex items-center">
              <div className="flex justify-center items-start mr-2 w-8 h-8">
                <RelationIcon name={instrument} />
              </div>
              <div className="flex-1">
                <div className="break-words">{artists.join(", ")}</div>
              </div>
            </div>
          ))}
        </>
      )}
      {production_credits && (
        <>
          {production_credits.map(({ credit, artists }) => (
            <div className="mb-2 flex items-center">
              <div className="flex justify-center items-start mr-2 w-8 h-8">
                <RelationIcon name={credit} />
              </div>
              <div className="flex-1">
                <div className="break-words">{artists.sort().join(", ")}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Relations;
