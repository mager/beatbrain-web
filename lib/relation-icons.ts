const supported = [
  // Instruments
  "acoustic-guitar",
  "pedal-steel",
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
  "vocals": "vocal",
  "songwriter": "writer",
  "engineer": "recording",
  "engineering": "recording",
  "mastering": "mix",
  "mixing": "mix",

  "pedal steel guitar": "pedal-steel",
  "steel guitar": "pedal-steel",
  "acoustic guitar": "acoustic-guitar",
  "electric guitar": "guitar",
  "classical guitar": "acoustic-guitar",
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

export const resolveRelationIcon = (value: string): string | null => {
  const name = value.trim().toLowerCase();
  const slug = name.replace(/\s+/g, "-");
  if (supported.includes(slug)) return slug;
  if (iconAliases[name]) return iconAliases[name];
  // Prefer specific multi-word instruments before their shorter families.
  return [...supported].sort((a, b) => b.length - a.length)
    .find((icon) => slug.includes(icon)) || null;
};
