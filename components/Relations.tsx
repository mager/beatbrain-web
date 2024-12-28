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
            <div key={instrument} className="mb-2 flex items-center">
              <div className="flex justify-center items-center mr-2">
                <RelationIcon name={instrument} />
              </div>
              <div>{artists.join(", ")}</div>
            </div>
          ))}
        </>
      )}
      {production_credits && (
        <>
          {production_credits.map(({ credit, artists }) => (
            <div className="mb-2 flex items-center">
              <div className="flex justify-center items-center mr-2">
                <RelationIcon name={credit} />
              </div>
              <div>{artists.sort().join(", ")}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Relations;
