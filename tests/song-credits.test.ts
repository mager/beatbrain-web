import assert from "node:assert/strict";
import test from "node:test";
import { groupCreditsByPerson } from "../lib/song-credits";
import { resolveRelationIcon } from "../lib/relation-icons";

test("credits combine verified identity and preserve distinct roles", () => {
  assert.deepEqual(groupCreditsByPerson([
    { credit: "Writer", artists: [{ id: "joe", name: "Joe Reeves" }] },
    { credit: "Producer", artists: [{ id: "joe", name: "Joe Reeves" }] },
    { credit: "writer", artists: [{ id: "joe", name: "Joe Reeves" }] },
  ]), [{ key: "id:joe", name: "Joe Reeves", id: "joe", roles: ["Writer", "Producer"] }]);
});

test("same names with different IDs and unverified names remain separate", () => {
  const people = groupCreditsByPerson([
    { credit: "Writer", artists: [{ id: "a", name: "Alex" }, { id: "b", name: "Alex" }, "Alex"] },
    { credit: "Mix", artists: ["Alex", "Alexander"] },
  ]);
  assert.deepEqual(people.map(({ id, name, roles }) => ({ id, name, roles })), [
    { id: "a", name: "Alex", roles: ["Writer"] },
    { id: "b", name: "Alex", roles: ["Writer"] },
    { id: undefined, name: "Alex", roles: ["Writer", "Mix"] },
    { id: undefined, name: "Alexander", roles: ["Mix"] },
  ]);
});

test("empty names and empty roles do not produce empty credit entries", () => {
  assert.deepEqual(groupCreditsByPerson([
    { credit: " ", artists: ["Someone"] },
    { credit: "Writer", artists: [" ", { id: "x", name: "" }] },
  ]), []);
  assert.deepEqual(groupCreditsByPerson([]), []);
});

test("instrument and role icons accept source casing and preserve specific instruments", () => {
  for (const [name, expected] of [
    ["Pedal Steel Guitar", "guitar"], [" Vocals ", "vocal"],
    ["Programming", "drum-machine"], ["Fretless Bass", "fretless-bass"],
    ["Double Bass", "double-bass"], ["Songwriter", "writer"],
    ["Engineer", "recording"], ["Mastering", "mix"], ["Unknown instrument", null],
  ]) assert.equal(resolveRelationIcon(name as string), expected, name as string);
});
