import { useCallback, useEffect, useState } from "react";
import {
  FALLBACK_PALETTE,
  paletteFromPixels,
  type AlbumPalette,
} from "./album-palette";
const cache = new Map<string, AlbumPalette>();

export function useAlbumTheme(source: string) {
  const [sample, setSample] = useState<{
    source: string;
    palette: AlbumPalette;
  } | null>(null);
  const palette =
    sample?.source === source
      ? sample.palette
      : cache.get(source) || FALLBACK_PALETTE;
  const onArtworkLoad = useCallback(
    (image: HTMLImageElement) => {
      if (cache.has(source)) {
        setSample({ source, palette: cache.get(source)! });
        return;
      }
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 40;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0, 40, 40);
        const next = paletteFromPixels(context.getImageData(0, 0, 40, 40).data);
        if (cache.size >= 24) cache.delete(cache.keys().next().value!);
        cache.set(source, next);
        setSample({ source, palette: next });
      } catch {
        /* A cover without CORS permission keeps the readable neutral theme. */
      }
    },
    [source],
  );
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".app-shell");
    if (!shell) return;
    const values = {
      "--room-accent": palette.accent,
      "--accent": palette.accent,
      "--room-accent-hover": palette.hover,
      "--room-on-accent": "#101113",
      "--song-surface": palette.surface,
      "--song-border": palette.border,
      "--song-muted": palette.muted,
    };
    const previous = Object.keys(values).map((key) => [
      key,
      shell.style.getPropertyValue(key),
    ]);
    for (const [key, value] of Object.entries(values))
      shell.style.setProperty(key, value);
    shell.dataset.albumTheme = palette.accent;
    return () => {
      for (const [key, value] of previous) {
        if (value) shell.style.setProperty(key, value);
        else shell.style.removeProperty(key);
      }
      delete shell.dataset.albumTheme;
    };
  }, [palette]);
  return { onArtworkLoad };
}
