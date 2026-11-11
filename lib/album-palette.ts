type RGB = [number, number, number];
type ColorBucket = { sum: RGB; count: number; saturation: number };
export type AlbumPalette = {
  accent: string;
  hover: string;
  surface: string;
  border: string;
  muted: string;
};
const PAGE: RGB = [16, 17, 19];
const hex = (rgb: RGB) =>
  "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const rgb = (color: string): RGB =>
  [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, amount: number): RGB =>
  a.map((v, i) => Math.round(v + (b[i] - v) * amount)) as RGB;
function luminance(color: RGB) {
  const c = color
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
export function contrastRatio(a: string, b: string) {
  const values = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
function palette(color: RGB): AlbumPalette {
  let accent = color;
  // Both the accent on the page and dark text on the button meet 7:1.
  for (let i = 0; i < 40 && contrastRatio(hex(accent), hex(PAGE)) < 7; i++)
    accent = mix(accent, [255, 255, 255], 0.08);
  return {
    accent: hex(accent),
    hover: hex(mix(accent, [255, 255, 255], 0.16)),
    surface: hex(mix(PAGE, color, 0.09)),
    border: hex(mix(PAGE, accent, 0.24)),
    muted: hex(mix(accent, [225, 225, 225], 0.68)),
  };
}
export const FALLBACK_PALETTE: AlbumPalette = palette([216, 213, 207]);

export function paletteForTheme(value: AlbumPalette, theme: "light" | "dark"): AlbumPalette {
  if (theme === "dark") return value;
  const page: RGB = [247, 246, 242];
  let accent = rgb(value.accent);
  for (let i = 0; i < 60 && contrastRatio(hex(accent), hex(page)) < 7; i++)
    accent = mix(accent, [0, 0, 0], 0.08);
  return {
    accent: hex(accent),
    hover: hex(mix(accent, [0, 0, 0], 0.16)),
    surface: hex(mix(page, accent, 0.04)),
    border: hex(mix(page, accent, 0.25)),
    muted: hex(mix(accent, [60, 60, 60], 0.4)),
  };
}

/** Use broad areas of color, not a single bright pixel or black/white borders. */
export function paletteFromPixels(pixels: Uint8ClampedArray): AlbumPalette {
  const buckets = new Map<
    string,
    { sum: RGB; count: number; saturation: number }
  >();
  for (let i = 0; i + 3 < pixels.length; i += 4) {
    const color: RGB = [pixels[i], pixels[i + 1], pixels[i + 2]];
    const max = Math.max(...color),
      min = Math.min(...color);
    const saturation = max ? (max - min) / max : 0;
    if (pixels[i + 3] < 200 || max < 30 || min > 235 || saturation < 0.12)
      continue;
    const key = color.map((v) => v >> 5).join(",");
    const bucket = buckets.get(key) || {
      sum: [0, 0, 0] as RGB,
      count: 0,
      saturation: 0,
    };
    color.forEach((v, channel) => (bucket.sum[channel] += v));
    bucket.count++;
    bucket.saturation += saturation;
    buckets.set(key, bucket);
  }
  let best: ColorBucket | undefined;
  let bestScore = 0;
  for (const bucket of Array.from(buckets.values())) {
    if (bucket.count < Math.max(1, (pixels.length / 4) * 0.005)) continue;
    const score =
      bucket.count * (0.5 + (bucket.saturation / bucket.count) * 0.5);
    if (score > bestScore) {
      best = bucket;
      bestScore = score;
    }
  }
  return best
    ? palette(best.sum.map((v) => v / best.count) as RGB)
    : FALLBACK_PALETTE;
}
