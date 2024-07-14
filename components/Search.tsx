import React, { useState } from "react";
import Searchbox, { loadOptions } from "@components/Searchbox";
import useDebouncedLoadOptions from "../lib/hooks/useDebouncedLoadOptions";
import { useRouter } from "next/router";

const Search: React.FC = () => {
  const [option, setOption] = useState(null);
  const router = useRouter();
  const debouncedLoadOptions = useDebouncedLoadOptions(loadOptions);

  const goToTrackPage = (option) => {
    router.push(`/t/spotify/${option.value.id}`);
  };

  return (
    <div className="px-8 py-2 border-b-2 bg-gray-200">
      <Searchbox
        option={option}
        handleChange={goToTrackPage}
        loadOptions={debouncedLoadOptions}
      />
    </div>
  );
};

export default Search;
