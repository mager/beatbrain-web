export type Track = {
  image: string;
  artist: string;
  name: string;
  source_id: string;
  source: string;

  features: Features;
  analysis: Analysis;

  release_date: string;
  genres: string[];
  instruments: Instrument[];
};

export type Analysis = {
  duration: number;
  segments: Segment[];
};

export type Segment = {
  start: number;
  duration: number;
  loudness_start: number;
  loudness_max: number;
  loudness_end: number;
  confidence: number;
};

export type Features = {
  acousticness: number;
  danceability: number;
  duration_ms: number;
  energy: number;
  happiness: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
};

export type Instrument = {
  artist: string;
  instruments: string[];
};

export type RecommendedTracksResp = {
  tracks: Track[];
};

export type GetTrackResponse = {
  track: Track;
};

export type Profile = {
  username: string;
};
