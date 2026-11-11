import Image from "next/image";
import { MusicalNoteIcon } from "@heroicons/react/24/outline";
import { resolveRelationIcon } from "../lib/relation-icons";

export default function RelationIcon({ name, decorative = false }: {
  name: string; decorative?: boolean;
}) {
  const icon = resolveRelationIcon(name);
  return (
    <span className="relation-icon" aria-hidden={decorative || undefined}>
      {icon ? (
        <Image src={`/images/icon-${icon}.png`} width={32} height={32}
          alt={decorative ? "" : name} title={decorative ? undefined : name}
          unoptimized className="w-8 h-8 object-contain" />
      ) : (
        <MusicalNoteIcon width={32} height={32} role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : name} />
      )}
    </span>
  );
}
