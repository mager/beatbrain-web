import Link from "next/link";

const SavedBy = ({ author, othersCount }) => (
  <div className="py-2 font-mono text-xs text-phosphor-dim">
    <p>
      Saved by{" "}
      <Link
        href={`/u/${author.name}`}
        className="text-cool hover:text-accent transition-colors"
      >
        {author.name}
      </Link>
      {othersCount > 0 && (
        <>
          , and {othersCount} {othersCount === 1 ? "other" : "others"}
        </>
      )}
    </p>
  </div>
);

export default SavedBy;
