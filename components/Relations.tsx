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
          {instruments.map(({ artist, instruments }) => (
            <div key={artist} className="mb-2 flex items-center">
              <div className="flex justify-center items-center">
                {instruments.map((instrument) => (
                  <RelationIcon name={instrument} />
                ))}
              </div>
              <div>{artist}</div>
            </div>
          ))}
        </>
      )}
      {production_credits && (
        <>
          {production_credits.map(({ artist, credits }) => (
            <div className="mb-2 flex items-center">
              <div className="flex justify-center items-center">
                {credits.map((credit) => (
                  <RelationIcon name={credit} />
                ))}
              </div>
              <div>{artist}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Relations;
