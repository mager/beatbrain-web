import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";

export type LoveState = { loved: boolean; loveCount: number };
export default function LoveButton({
  postId,
  title,
  lovedByViewer,
  loveCount,
  onChange,
}: {
  postId: number;
  title: string;
  lovedByViewer: boolean;
  loveCount: number;
  onChange?: (postId: number, state: LoveState) => void;
}) {
  const [state, setState] = useState({ loved: lovedByViewer, loveCount });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  useEffect(
    () => setState({ loved: lovedByViewer, loveCount }),
    [lovedByViewer, loveCount],
  );
  async function react() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/reactions/${postId}`, {
        method: state.loved ? "DELETE" : "POST",
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "Your reaction could not be saved. Try again.",
        );
      setState(result);
      onChange?.(postId, result);
    } catch (cause) {
      setError(
        cause instanceof Error && cause.name === "Error"
          ? cause.message
          : "Your reaction could not be saved. Try again.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div className="post-love" data-post-love={postId}>
      <button
        type="button"
        className="love-button"
        aria-pressed={state.loved}
        aria-label={`${state.loved ? "Remove love from" : "Love"} ${title}. ${state.loveCount} ${state.loveCount === 1 ? "love" : "loves"}`}
        aria-busy={pending}
        disabled={pending}
        onClick={react}
      >
        <HeartIcon width={19} aria-hidden="true" />
        <span aria-live="polite">{state.loveCount || "Love"}</span>
      </button>
      {error && (
        <p role="alert" className="love-error">
          {error}
        </p>
      )}
    </div>
  );
}
