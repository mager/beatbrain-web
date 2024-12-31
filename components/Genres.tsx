import Tag from "@components/Tag";

type Props = {
  genres: string[];
};

const Genres = ({ genres }: Props) => (
  <div className="my-4">
    {genres.map((genre) => (
      <Tag name={genre}>{genre}</Tag>
    ))}
  </div>
);

export default Genres;
