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
  "harp",
  "horn",
  "keyboard",
  "piano",
  "saxophone",
  "shakers",
  "strings",
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

// Map variant instrument names to their closest supported icon
const iconAliases: Record<string, string> = {
  "pedal steel guitar": "guitar",
  "steel guitar": "guitar",
  "acoustic guitar": "guitar",
  "electric guitar": "guitar",
  "classical guitar": "guitar",
  "slide guitar": "guitar",
  "lap steel guitar": "guitar",
  "bass guitar": "bass",
  "electric bass": "bass",
  "upright bass": "double-bass",
  "electric piano": "piano",
  "rhodes": "piano",
  "wurlitzer": "piano",
  "organ": "keyboard",
  "mellotron": "keyboard",
  "synth": "synthesizer",
  "moog": "synthesizer",
  "synth bass": "synthesizer",
  "drum programming": "drum-machine",
  "programming": "drum-machine",
  "percussion": "drums",
  "timpani": "drums",
  "bongos": "congas",
  "djembe": "congas",
  "harmonica": "horn",
  "flugelhorn": "trumpet",
  "cornet": "trumpet",
  "french horn": "horn",
  "clarinet": "saxophone",
  "oboe": "saxophone",
  "flute": "whistle",
  "fiddle": "violin",
  "mandolin": "banjo",
  "ukulele": "banjo",
  "sitar": "banjo",
  "marimba": "glockenspiel",
  "vibraphone": "glockenspiel",
  "xylophone": "glockenspiel",
  "celesta": "glockenspiel",
  "chimes": "bell",
  "tubular bells": "bell",
  "finger snaps": "handclaps",
  "claps": "handclaps",
};

const resolveIcon = (name: string): string | null => {
  if (supported.includes(name)) return name;
  if (iconAliases[name]) return iconAliases[name];
  // Try partial match — e.g. "12-string guitar" contains "guitar"
  for (const s of supported) {
    if (name.includes(s)) return s;
  }
  return null;
};

const RelationIcon: React.FC<Props> = ({ name }) => {
  const iconName = resolveIcon(name);
  if (!iconName) {
    console.debug("Relation not supported", name);
    return <div className="mr-2 font-bold text-xs">{name}</div>;
  }

  const img = (
    <Image
      src={`/images/icon-${iconName}.png`}
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
