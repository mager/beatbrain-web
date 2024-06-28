import React, { useEffect, useState, useRef } from "react";
import debounce from "lodash/debounce";
import Layout from "../../components/Layout";
import Title from "../../components/Title";
import Image from "next/image";
import Router from "next/router";

import AsyncSelect from "react-select/async";

const DropdownIndicator = () => {
  return null;
};
import styles from "./styles";

const Draft: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [sourceId, setSourceId] = useState(null);
  const handleChange = (option) => {
    setSourceId(option);
  };

  const noOptionsMessage = ({ inputValue }) => {
    if (inputValue.trim() !== "") {
      return "No songs found";
    }
    return null;
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
        label: (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image src={item.thumb} alt={item.name} width={32} height={32} />
            <span
              style={{ marginLeft: "10px" }}
            >{`${item.artist} - ${item.name}`}</span>
          </div>
        ),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // const debouncedLoadOptions = debounce(loadOptions, 300);

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { title, content, sourceId };
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

  console.log({ sourceId });

  return (
    <Layout>
      <div className="page bg-white py-4">
        <form onSubmit={submitData} className="w-full">
          <Title>Share a beat</Title>
          <div className="py-4">
            <AsyncSelect
              value={sourceId}
              onChange={handleChange}
              loadOptions={loadOptions}
              defaultOptions={false}
              isClearable={true}
              placeholder="Search for a song..."
              noOptionsMessage={noOptionsMessage}
              cacheOptions
              components={{ DropdownIndicator }}
              styles={styles}
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
