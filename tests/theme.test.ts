import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { THEME_INIT_SCRIPT } from "../lib/theme";
import { paletteForTheme, contrastRatio, FALLBACK_PALETTE } from "../lib/album-palette";

test("first paint follows the system unless a valid theme was saved", () => {
  for (const [stored, dark, expected] of [[null, false, "light"], [null, true, "dark"], ["light", true, "light"], ["dark", false, "dark"], ["invalid", false, "light"]] as const) {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    vm.runInNewContext(THEME_INIT_SCRIPT, { document, localStorage: { getItem: () => stored }, window: { matchMedia: () => ({ matches: dark }) } });
    assert.equal(document.documentElement.dataset.theme, expected);
  }
});
test("blocked storage still uses the system theme", () => {
  const document = { documentElement: { dataset: {} as Record<string, string> } };
  vm.runInNewContext(THEME_INIT_SCRIPT, { document, localStorage: { getItem: () => { throw Error("blocked"); } }, window: { matchMedia: () => ({ matches: false }) } });
  assert.equal(document.documentElement.dataset.theme, "light");
});
test("album accents remain readable on light pages and buttons", () => {
  for (const accent of ["#eeeeee", "#ffccee", "#ccee00", "#6688ff", "#111111"]) {
    const palette = paletteForTheme({ ...FALLBACK_PALETTE, accent }, "light");
    assert.ok(contrastRatio(palette.accent, "#f7f6f2") >= 7);
    assert.ok(contrastRatio(palette.hover, "#f7f6f2") >= 7);
    assert.ok(contrastRatio(palette.muted, "#f7f6f2") >= 4.5);
  }
  assert.deepEqual(paletteForTheme(FALLBACK_PALETTE, "dark"), FALLBACK_PALETTE);
});
