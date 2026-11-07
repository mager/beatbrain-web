import Link from "next/link";
import type {
  Instrument,
  ProductionCredit,
  SongCredit,
  CreditArtist,
} from "@types";
type Props = {
  instruments: Instrument[];
  production_credits: ProductionCredit[];
  song_credits: SongCredit[];
};
function ArtistName({ artist }: { artist: CreditArtist | string }) {
  const name = typeof artist === "string" ? artist : artist?.name;
  const id = typeof artist === "object" && artist?.id;
  if (!name) return null;
  return id ? <Link href={`/creator/${id}`}>{name}</Link> : <span>{name}</span>;
}
function CreditGroup({
  title,
  items,
}: {
  title: string;
  items: { role: string; artists: (CreditArtist | string)[] }[];
}) {
  const visible = items.filter((item) => item.artists?.length);
  if (!visible.length) return null;
  return (
    <section className="credit-group">
      <h3>{title}</h3>
      <dl>
        {visible.map(({ role, artists }, i) => (
          <div className="credit-row" key={`${role}-${i}`}>
            <dt>{role}</dt>
            <dd>
              {artists.map((artist, j) => (
                <span key={j}>
                  {j > 0 && ", "}
                  <ArtistName artist={artist} />
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
export default function Credits({
  instruments = [],
  production_credits = [],
  song_credits = [],
}: Props) {
  return (
    <div className="credits-list">
      <CreditGroup
        title="Songwriting"
        items={song_credits.map((c) => ({
          role: c.credit,
          artists: c.artists,
        }))}
      />
      <CreditGroup
        title="Performance"
        items={instruments.map((c) => ({
          role: c.instrument,
          artists: c.artists,
        }))}
      />
      <CreditGroup
        title="Production"
        items={production_credits.map((c) => ({
          role: c.credit,
          artists: c.artists,
        }))}
      />
    </div>
  );
}
