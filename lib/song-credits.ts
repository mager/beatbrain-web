import type { CreditArtist } from "./types";

type Credit = { credit: string; artists: (CreditArtist | string)[] };
export type PersonCredit = { key: string; name: string; id?: string; roles: string[] };

export function groupCreditsByPerson(credits: Credit[]): PersonCredit[] {
  const people = new Map<string, PersonCredit>();
  for (const item of credits) {
    const role = item.credit?.trim();
    if (!role) continue;
    for (const artist of item.artists || []) {
      const name = (typeof artist === "string" ? artist : artist?.name)?.trim();
      if (!name) continue;
      const id = typeof artist === "object" ? artist?.id?.trim() : undefined;
      // A matching name alone does not verify a creator identity.
      const key = id ? `id:${id}` : `name:${name}`;
      const person = people.get(key) || { key, name, ...(id ? { id } : {}), roles: [] };
      if (!person.roles.some((r) => r.toLowerCase() === role.toLowerCase())) person.roles.push(role);
      people.set(key, person);
    }
  }
  return Array.from(people.values());
}
