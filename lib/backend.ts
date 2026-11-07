/** Server-only boundary. Never call this function from a browser component. */
export function backendFetch(url: string, init: RequestInit = {}) {
  if (typeof window !== "undefined")
    throw new Error("Backend access is server-only");
  const headers = new Headers(init.headers);
  headers.set("X-Beatbrain-Key", process.env.BEATBRAIN_API_KEY || "");
  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
    signal: init.signal || AbortSignal.timeout(10000),
  });
}
