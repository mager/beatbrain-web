import React from "react";
import Image from "next/image";

type Props = {
  name: string;
};

const supported = [
  "bass",
  "cello",
  "drums",
  "guitar",
  "keyboard",
  "piano",
  "synthesizer",
  "trumpet",
];

const Instrument: React.FC<Props> = ({ name }) => {
  if (!supported.includes(name)) {
    return <div className="font-bold">{name}</div>;
  }

  return (
    <div>
      <Image
        src={`/images/icon-${name}.png`}
        width={32}
        height={32}
        alt={name}
        title={name}
      />
    </div>
  );
};

export default Instrument;
