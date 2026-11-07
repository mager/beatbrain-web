import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRightIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";

export default function AlbumArtwork({
  src,
  title,
  href,
  priority = false,
}: {
  src: string;
  title: string;
  href: string;
  priority?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const full = src.replace("ab67616d00001e02", "ab67616d0000b273");
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5,
      y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${-y * 7}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 7}deg`);
    event.currentTarget.style.setProperty("--sleeve-light", `${(x + 0.5) * 100}%`);
  }
  function reset() {
    stage.current?.style.setProperty("--tilt-x", "0deg");
    stage.current?.style.setProperty("--tilt-y", "0deg");
    stage.current?.style.setProperty("--sleeve-light", "50%");
  }
  return (
    <div
      className="artwork-stage"
      ref={stage}
      onPointerMove={tilt}
      onPointerLeave={reset}
    >
      {src && !failed && (
        <img
          src={full}
          className="artwork-light"
          alt=""
          aria-hidden="true"
          loading="lazy"
        />
      )}
      <Link
        href={href}
        className="artwork-link"
        aria-label={title}
        onBlur={reset}
      >
        {src && !failed ? (
          <img
            className="album-art"
            src={full}
            alt={`${title} cover`}
            width={400}
            height={400}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onError={(event) => {
              if (event.currentTarget.src !== src) {
                event.currentTarget.src = src;
              } else setFailed(true);
            }}
          />
        ) : (
          <div className="missing-art">
            <MusicalNoteIcon width={60} />
            <span>{title}</span>
          </div>
        )}
        <span className="artwork-open" aria-hidden="true">
          <span>Explore track</span>
          <ArrowUpRightIcon width={19} />
        </span>
      </Link>
    </div>
  );
}
