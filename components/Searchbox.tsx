import React, { useCallback, useState, useRef } from "react";
import Select from "@components/Select";
import Image from "next/image";

export const loadOptions = async (inputValue) => {
  try {
    const resp = await fetch(`/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: inputValue }),
    });

    const data = await resp.json();
    return data.results.map((item) => ({
      value: item,
      label: (
        <div className="flex items-center">
          <Image src={item.thumb} alt={item.name} width={32} height={32} />
          <span className="ml-2">{`${item.artist} - ${item.name}`}</span>
        </div>
      ),
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const noOptionsMessage = ({ inputValue }) => {
  if (inputValue.trim() !== "") {
    return "No songs found";
  }
  return null;
};

type Props = {
  handleChange: (option: any) => void;
  loadOptions: any;
  option: string;
};

const Searchbox: React.FC<Props> = ({ handleChange, loadOptions, option }) => {
  return (
    <Select
      option={option}
      handleChange={handleChange}
      loadOptions={loadOptions}
      noOptionsMessage={noOptionsMessage}
    />
  );
};

export default Searchbox;
