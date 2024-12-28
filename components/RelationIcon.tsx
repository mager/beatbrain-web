import React from "react";
import Image from "next/image";

type Props = {
  name: string;
};

const supported = [
  // Performers
  "bass",
  "bell",
  "cello",
  "double-bass",
  "drums",
  "foot-stomps",
  "horn",
  "guitar",
  "handclaps",
  "keyboard",
  "piano",
  "synthesizer",
  "drum-machine",
  "shakers",
  "trumpet",
  "violin",

  // Production Credits
  "producer",
  "recording",
  "mix",
  "vocal",
];

const RelationIcon: React.FC<Props> = ({ name }) => {
  const unsupported = !supported.includes(name);
  if (unsupported) {
    console.debug("Relation not supported", name);
    return <div className="mr-2 font-bold">{name}</div>;
  }

  const img = (
    <Image
      src={`/images/icon-${name}.png`}
      width={32}
      height={32}
      alt={name}
      title={name}
      unoptimized
    />
  );

  return <div className="mr-2">{img}</div>;
};

export default RelationIcon;
