export type Track = {
  image: string;
  artist: string;
  name: string;
  source_id: string;
  source: string;

  features: Features;
  release_date: string;
  genres: string[];
  instruments: Instrument[];
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
  name: string;
  artists: string[];
};

export type RecommendedTracksResp = {
  tracks: Track[];
};

export type GetTrackResponse = {
  track: Track;
};
