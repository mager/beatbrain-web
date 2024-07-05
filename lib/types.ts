export type Track = {
  image: string;
  artist: string;
  name: string;
  source_id: string;
  source: string;
};

export type GetFeaturedTracksResp = {
  tracks: Track[];
};

export type GetTrackResponse = {
  track: Track;
};
