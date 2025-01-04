const GenreSelector = () => {
  return (
    <div className="flex gap-2">
      <button className="p-2 bg-green-500 text-white text-md">HOT</button>
      <button
        disabled
        className="p-2 bg-gray-200 text-md text-gray-400 cursor-not-allowed"
      >
        HIP-HOP
      </button>
      <button
        disabled
        className="p-2 bg-gray-200 text-md text-gray-400 cursor-not-allowed"
      >
        ELECTRONIC
      </button>
    </div>
  );
};

export default GenreSelector;
