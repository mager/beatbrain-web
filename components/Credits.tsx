import Link from "next/link";
import type { ProductionCredit, SongCredit } from "@types";
import { groupCreditsByPerson } from "../lib/song-credits";
import RelationIcon from "./RelationIcon";

export default function Credits({ production_credits = [], song_credits = [] }: {
  production_credits: ProductionCredit[]; song_credits: SongCredit[];
}) {
  const people = groupCreditsByPerson([...song_credits, ...production_credits]);
  return (
    <ul className="credit-people">
      {people.map((person) => (
        <li className="credit-person" key={person.key}>
          <h3>{person.id ? <Link href={`/creator/${person.id}`}>{person.name}</Link> : person.name}</h3>
          <ul className="credit-person-roles" aria-label={`${person.name} roles`}>
            {person.roles.map((role) => (
              <li key={role}><RelationIcon name={role} decorative /><span>{role}</span></li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
