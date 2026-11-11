import { resolveRelationIcon } from "../lib/relation-icons";

export default function RelationIcon({ name, decorative = false }: {
  name: string; decorative?: boolean;
}) {
  const icon = resolveRelationIcon(name) || "note";
  return (
    <span className="relation-icon" aria-hidden={decorative || undefined}>
      <svg className="relation-drawing" width={32} height={32} viewBox="0 0 48 48"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        role={decorative ? undefined : "img"} aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : name} focusable="false">
        <use href={`/images/instruments.svg#${icon}`} />
      </svg>
    </span>
  );
}
