export function parsePostInput(body: unknown) {
  if (!body || typeof body !== "object")
    throw new Error("Choose a track to post.");
  const { content = "", track } = body as Record<string, any>;
  if (typeof content !== "string" || content.length > 1000)
    throw new Error("Keep your note under 1,000 characters.");
  if (
    !track ||
    track.source !== "SPOTIFY" ||
    typeof track.sourceId !== "string" ||
    !/^[A-Za-z0-9]{22}$/.test(track.sourceId)
  )
    throw new Error("Choose a valid Spotify track.");
  for (const field of ["title", "artist"]) {
    if (
      typeof track[field] !== "string" ||
      !track[field].trim() ||
      track[field].length > 300
    )
      throw new Error("The track is missing its title or artist.");
  }
  if (
    typeof track.image !== "string" ||
    (track.image !== "" &&
      !/^https:\/\/i\.scdn\.co\/image\/[A-Za-z0-9]+$/.test(track.image))
  )
    throw new Error("The album image is not valid.");
  return {
    content: content.trim(),
    track: {
      source: "SPOTIFY" as const,
      sourceId: track.sourceId as string,
      title: track.title.trim() as string,
      artist: track.artist.trim() as string,
      image: track.image as string,
    },
  };
}
