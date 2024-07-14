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
  if (!supported.includes(name)) {
    console.debug("Instrument not supported", name);
    return null;
  }

  return (
    <div className="mr-2">
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

export default InstrumentIcon;
