import { GetTrackResponseV3, TrackV3 } from "@types";
import { normalizeConnections } from "../song-connections";
import { normalizeStudios } from "../song-studios";

export const adaptTrack = ({ track }: GetTrackResponseV3): TrackV3 => {
  return {
    connections: normalizeConnections(track.connections),
    studios: normalizeStudios(track.studios),
    id: track.id || "",
    artists: track.artists || [],
    explicit: track.explicit === true,
    track_number: track.track_number || 0,
    disc_number: track.disc_number || 0,
    credits_status: track.credits_status || null,
    metadata_status: track.metadata_status || null,
    album: track.album || null,
    name: track.name,
    artist: track.artist,
    image: track.image,
    releases: track.releases || [],
    release_date: track.release_date,
    genres: track.genres || [],
    isrc: track.isrc,
    instruments: track.instruments || [],
    production_credits: track.production_credits || [],
    song_credits: track.song_credits || [],
    links: track.links || [],
    meta: track.meta || null,
    features: track.features || null,
    analysis: track.analysis || null,
    popularity: track.popularity ?? null,
    preview_url: track.preview_url || null,
    source_id: track.source_id || null,
  };
};
