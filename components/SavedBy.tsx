import Link from "next/link";

const SavedBy = ({ author, othersCount }) => (
  <div className="py-2">
    <p>
      Saved by{" "}
      <Link
        href={`/u/${author.name}`}
        className="border-b-2 hover:border-green-300"
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
