import { GetTrackResponseV2, TrackV2 } from "@types";

export const adaptTrack = ({track}: GetTrackResponseV2): TrackV2 => {
  return {
    name: track.name,
    artist: track.artist,
    image: track.image  ? `https://coverartarchive.org/release/${track.image}/front-500.jpg` : "https://placehold.co/300",
    isrc: track.isrc,
  };
};