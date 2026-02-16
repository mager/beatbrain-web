import { GetTrackResponseV3, TrackV3 } from "@types";

export const adaptTrack = ({track}: GetTrackResponseV3): TrackV3 => {
  return {
    id: track.id,
    name: track.name,
    artist: track.artist,
    image: track.image,
    releases: track.releases,
    release_date: track.release_date,
    genres: track.genres,
    isrc: track.isrc,
    instruments: track.instruments,
    production_credits: track.production_credits,
    song_credits: track.song_credits,
    links: track.links,
    meta: track.meta || null,
    features: track.features || null,
    analysis: track.analysis || null,
    popularity: track.popularity ?? null,
    preview_url: track.preview_url || null,
    source_id: track.source_id || null,
  };
};