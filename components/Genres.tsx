import Tag from "@components/Tag";

type Props = {
  genres: string[];
};

const Genres = ({ genres }: Props) => (
  <div className="my-4 flex flex-wrap">
    {genres.map((genre) => (
      <Tag key={genre} name={genre}>{genre}</Tag>
    ))}
  </div>
);

export default Genres;
