import Link from "next/link";
import type { Instrument } from "@types";
import RelationIcon from "./RelationIcon";

export default function TrackInstruments({ instruments }: { instruments: Instrument[] }) {
  const visible = instruments.filter((item) => item.instrument?.trim());
  if (!visible.length) return null;
  return (
    <section className="track-instruments" aria-label="Instruments and players">
      <h2>Instruments & voices</h2>
      <ul>
        {visible.map(({ instrument, artists }, index) => (
          <li className="track-instrument" key={`${instrument}-${index}`}>
            <RelationIcon name={instrument} decorative />
            <div>
              <h3>{instrument}</h3>
              <ul className="instrument-players">
                {(artists || []).map((artist, i) => {
                  const name = typeof artist === "string" ? artist : artist?.name;
                  const id = typeof artist === "object" && artist?.id;
                  if (!name?.trim()) return null;
                  return <li key={`${id || name}-${i}`}>
                    {id ? <Link href={`/creator/${id}`}>{name}</Link> : name}
                  </li>;
                })}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
