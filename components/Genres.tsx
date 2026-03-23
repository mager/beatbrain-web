import Tag from "@components/Tag";

type Props = {
  genres: string[];
  light?: boolean;
};

const Genres = ({ genres, light = false }: Props) => (
  <div className="flex flex-wrap gap-0">
    {genres.map((genre) => (
      <Tag key={genre} name={genre} light={light}>{genre}</Tag>
    ))}
  </div>
);

export default Genres;
