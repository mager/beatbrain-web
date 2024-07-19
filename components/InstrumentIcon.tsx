import React from "react";
import Image from "next/image";

type Props = {
  name: string;
};

const supported = [
  "bass",
  "cello",
  "drums",
  "foot-stomps",
  "guitar",
  "handclaps",
  "keyboard",
  "piano",
  "synthesizer",
  "trumpet",
  "violin",
];

const InstrumentIcon: React.FC<Props> = ({ name }) => {
  const unsupported = !supported.includes(name);
  if (unsupported) {
    console.debug("Instrument not supported", name);
    return <div className="mr-2 font-bold">{name}</div>;
  }

  const img = (
    <Image
      src={`/images/icon-${name}.png`}
      width={32}
      height={32}
      alt={name}
      title={name}
    />
  );

  return <div className="mr-2">{img}</div>;
};

export default InstrumentIcon;
