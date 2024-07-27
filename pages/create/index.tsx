import React, { useState } from "react";
import Layout from "@components/Layout";
import Title from "@components/Title";
import Router from "next/router";
import Searchbox, { loadOptions } from "@components/Searchbox";
import useDebouncedLoadOptions from "../../lib/hooks/useDebouncedLoadOptions";

const Create: React.FC = () => {
  const [content, setContent] = useState("");
  const debouncedLoadOptions = useDebouncedLoadOptions(loadOptions);

  const [option, setOption] = useState(null);
  const handleChange = (option) => {
    setOption(option);
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const track = {
        source: "SPOTIFY",
        sourceId: option.value.id,
        artist: option.value.artist,
        title: option.value.name,
        image: option.value.thumb,
      };
      const body = { content, track };

      await fetch(`/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/feed");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="page bg-white py-8">
        <form onSubmit={submitData} className="w-full">
          <Title>Share a beat</Title>
          <Searchbox
            option={option}
            handleChange={handleChange}
            loadOptions={debouncedLoadOptions}
          />

          <div className="mb-8">
            <input
              onChange={(e) => setContent(e.target.value)}
              placeholder="How does it make you feel?"
              value={content}
              className="w-full px-4 py-4 mt-4 rounded-md border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          <div className="flex items-center">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mr-4"
            >
              Create
            </button>

            <a
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
              onClick={() => Router.push("/create")}
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Create;
