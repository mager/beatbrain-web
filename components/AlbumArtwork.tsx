import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowUpRightIcon, MusicalNoteIcon } from "@heroicons/react/24/outline";

export default function AlbumArtwork({
  src,
  title,
  href,
  priority = false,
  sizes,
}: {
  src: string;
  title: string;
  href: string;
  priority?: boolean;
  sizes?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [retrySource, setRetrySource] = useState<string | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = src === failedSource;
  const full = src.replace("ab67616d00001e02", "ab67616d0000b273");
  const spotifyCover = /^https:\/\/i\.scdn\.co\/image\/ab67616d0000(?:1e02|b273)[a-f0-9]+$/i.test(src);
  const thumb = src.replace("ab67616d0000b273", "ab67616d00001e02");
  const responsive = sizes && spotifyCover && retrySource !== src;
  const imageProps = {
    src: retrySource === src ? src : full,
    srcSet: responsive ? `${thumb} 300w, ${full} 640w` : undefined,
    sizes: responsive ? sizes : undefined,
  };
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
          {...imageProps}
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
            {...imageProps}
            alt={`${title} cover`}
            width={400}
            height={400}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            onError={(event) => {
              if (retrySource !== src && event.currentTarget.currentSrc !== new URL(src, document.baseURI).href) {
                setRetrySource(src);
              } else {
                setFailedSource(src);
              }
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
