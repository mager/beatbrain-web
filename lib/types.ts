export type Track = {
  image: string;
  artist: string;
  name: string;
  source_id: string;
  source: string;
  isrc: string;
  id: string;

  features: Features;
  analysis: Analysis;

  release_date: string;
  genres: string[];
  instruments: Instrument[];
  production_credits: ProductionCredit[];
  song_credits: SongCredit[];
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
  artists: string[];
  instrument: string;
};

export type ProductionCredit = {
  artists: string[];
  credit: string;
};

export type SongCredit = {
  artists: string[];
  credit: string;
};

export type RecommendedTracksResp = {
  tracks: Track[];
  updated: string;
};

export type GetTrackResponse = {
  track: Track;
};

export type Profile = {
  username: string;
};

export type GetTrackResponseV2 = {
  track: TrackV2;
};

export type TrackV2 = {
  artist: string;
  name: string;
  isrc: string;
  image?: string;
  imagefront?: string;
};

export type TrackV3 = {
  id: string;
  artist: string;
  name: string;
  image: string;
  release_date: string;
  genres: string[];
  isrc: string;
  instruments: any | null;
  production_credits: any | null;
  song_credits: SongCredit[];
};

export type GetTrackResponseV3 = {
  track: TrackV3;
};