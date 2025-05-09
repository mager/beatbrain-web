import React from "react";
import Image from "next/image";

type Props = {
  name: string;
};

const supported = [
  // Instruments
  "bass",
  "banjo",
  "bell",
  "congas",
  "cello",
  "double-bass",
  "drum-machine",
  "drums",
  "foot-stomps",
  "fretless-bass",
  "glockenspiel",
  "guitar",
  "handclaps",
  "horn",
  "keyboard",
  "piano",
  "saxophone",
  "shakers",
  "synthesizer",
  "tambourine",
  "trombone",
  "trumpet",
  "viola",
  "violin",
  "whistle",

  // Production Credits
  "producer",
  "recording",
  "mix",
  "vocal",

  // Song Credits
  "composer",
  "lyricist",
  "writer",
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
      className="w-8 h-8 object-contain"
    />
  );

  return <div>{img}</div>;
};

export default RelationIcon;
