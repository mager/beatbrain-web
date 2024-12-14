import React, { useState, useEffect } from "react";
import Searchbox, { loadOptions } from "@components/Searchbox";
import useDebouncedLoadOptions from "../lib/hooks/useDebouncedLoadOptions";
import { useRouter } from "next/router";

const Search: React.FC = () => {
  const [option, setOption] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();
  const debouncedLoadOptions = useDebouncedLoadOptions(loadOptions);

  const goToTrackPage = (option) => {
    router.push(`/ext/spotify/${option.value.id}`);
  };

  useEffect(() => {
    setIsHidden(router.pathname === "/create");
  }, [router.pathname]);

  return (
    <div className="px-8">
      <Searchbox
        option={option}
        handleChange={goToTrackPage}
        loadOptions={debouncedLoadOptions}
      />
    </div>
  );
};

export default Search;
