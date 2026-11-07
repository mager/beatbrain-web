import assert from "node:assert/strict";
import test from "node:test";
import {
  paletteFromPixels,
  contrastRatio,
  FALLBACK_PALETTE,
} from "../lib/album-palette";
const pixels = (colors: number[][]) =>
  new Uint8ClampedArray(colors.flatMap((c) => [...c, 255]));
test("album palettes keep dark-text controls and page links readable", () => {
  for (const rgb of [
    [220, 35, 40],
    [10, 40, 180],
    [0, 70, 20],
    [200, 160, 0],
    [255, 140, 180],
  ]) {
    const palette = paletteFromPixels(pixels(Array(80).fill(rgb)));
    assert.ok(contrastRatio(palette.accent, "#101113") >= 7);
    assert.ok(contrastRatio(palette.hover, "#101113") >= 7);
  }
});
test("dominant album color wins over a small vivid detail", () => {
  const pink = Array(90).fill([210, 110, 140]),
    green = Array(10).fill([10, 255, 40]);
  const p = paletteFromPixels(pixels([...pink, ...green]));
  const n = parseInt(p.accent.slice(1), 16);
  assert.ok(n >> 16 > ((n >> 8) & 255), "pink remains the accent");
});
test("plain and missing covers use a neutral fallback", () => {
  for (const colors of [
    [],
    Array(20).fill([0, 0, 0]),
    Array(20).fill([255, 255, 255]),
    Array(20).fill([90, 90, 90]),
  ])
    assert.deepEqual(paletteFromPixels(pixels(colors)), FALLBACK_PALETTE);
  assert.deepEqual(
    paletteFromPixels(new Uint8ClampedArray([255, 0, 0, 0])),
    FALLBACK_PALETTE,
  );
});
test("different covers produce different accents", () => {
  assert.notEqual(
    paletteFromPixels(pixels(Array(20).fill([200, 20, 20]))).accent,
    paletteFromPixels(pixels(Array(20).fill([20, 50, 200]))).accent,
  );
});
