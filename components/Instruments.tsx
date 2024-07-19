import type { Instrument as InstrumentT } from "@types";
import React from "react";
import { listToString } from "@util";
import InstrumentIcon from "./InstrumentIcon";

type Props = {
  instruments: InstrumentT[];
};

const Instruments: React.FC<Props> = ({ instruments }) => {
  return (
    <div className="mt-4 mb-2">
      {instruments.map(({ artist, instruments }) => (
        <div className="mb-2 flex items-center">
          <div className="flex justify-center items-center">
            {instruments.map((instrument) => (
              <InstrumentIcon name={instrument} />
            ))}
          </div>
          <div>{artist}</div>
        </div>
      ))}
    </div>
  );
};

export default Instruments;
