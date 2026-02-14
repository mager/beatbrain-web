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

export type CreditArtist = {
  id: string;
  name: string;
};

export type Instrument = {
  artists: (CreditArtist | string)[];
  instrument: string;
};

export type ProductionCredit = {
  artists: (CreditArtist | string)[];
  credit: string;
};

export type SongCredit = {
  artists: (CreditArtist | string)[];
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

// Post-related types (formerly in components/Post.tsx)
export type TrackProps = {
  id?: number;
  title?: string;
  artist?: string;
  image?: string;
  source?: string;
  sourceId?: string;
};

export type AuthorProps = {
  name?: string;
  email?: string;
  image?: string;
  username?: string;
};

export type PostProps = {
  id: number;
  title?: string;
  createdAt: Date | string;
  author: AuthorProps | null;
  track: TrackProps | null;
  content: string;
};

export type Release = {
  id: string;
  date: string;
  country: string;
  title: string;
  disambiguation: string;
  image: string;
  images: ReleaseImage[];
};

export type ReleaseImage = {
  id: number;
  type: string;
  image: string;
};

export type Link = {
  type: string;
  url: string;
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
  releases: Release[];
  release_date: string;
  genres: string[];
  isrc: string;
  instruments: any | null;
  production_credits: any | null;
  song_credits: SongCredit[];
  links: Link[];
};

export type GetTrackResponseV3 = {
  track: TrackV3;
};

export type Creator = {
  id: string;
  name: string;
  type: string;
  disambiguation?: string;
  country?: string;
  area?: string;
  begin_area?: string;
  active_years?: ActiveYears;
  genres: string[];
  links: Link[];
  credits: CreatorCredit[];
  highlights?: CreatorHighlight[];
};

export type CreatorHighlight = {
  id: string;
  title: string;
  artist: string;
  image: string;
};

export type ActiveYears = {
  begin?: string;
  end?: string;
  ended: boolean;
};

export type CreatorCredit = {
  type: string;
  recordings: CreatorRecording[];
};

export type CreatorRecording = {
  id: string;
  title: string;
};

export type GetCreatorResponse = {
  creator: Creator;
};