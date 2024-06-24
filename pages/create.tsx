import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import Title from "../components/Title";
import Router from "next/router";

import AsyncSelect from "react-select/async";

const DropdownIndicator = () => {
  return null;
};

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? "1px solid #ccc" : "1px solid #ccc",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid #ccc",
    },
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: 0,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    display: "none",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
};

const Draft: React.FC = () => {
  const [title, setTitle] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [content, setContent] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const handleChange = (option) => {
    setSelectedOption(option);
  };

  const handleClear = () => {
    setSelectedOption(null);
  };

  const noOptionsMessage = ({ inputValue }) => {
    if (inputValue.trim() === "") {
      return "Start typing..";
    }
    return "No songs found";
  };

  const loadOptions = async (inputValue) => {
    try {
      const resp = await fetch(`/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputValue }),
      });

      const data = await resp.json();
      return data.results.map((item) => ({
        value: item.id,
        label: `${item.artist} - ${item.name}`,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { title, content };
      await fetch(`/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/drafts");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="page bg-white py-4">
        <form onSubmit={submitData} className="w-full">
          <Title>Share a beat</Title>
          <div className="py-4">
            <AsyncSelect
              value={selectedOption}
              onChange={handleChange}
              loadOptions={loadOptions}
              defaultOptions={false}
              isClearable={true}
              placeholder="Search for a song..."
              noOptionsMessage={noOptionsMessage}
              cacheOptions
              components={{ DropdownIndicator }}
              styles={customStyles}
            />
          </div>

          <textarea
            cols={50}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How does it make you feel?"
            rows={8}
            value={content}
            className="w-full px-4 py-2 mt-4 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="flex items-center mt-4">
            <button
              disabled={!content || !title}
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mr-4"
            >
              Create
            </button>

            <a
              className="text-blue-500 hover:text-blue-600 cursor-pointer"
              onClick={() => Router.push("/")}
            >
              or Cancel
            </a>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Draft;
