import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import Title from "../components/Title";
import Router from "next/router";

const Draft: React.FC = () => {
  const [title, setTitle] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [content, setContent] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = async (query: string) => {
    try {
      const resp = await fetch(`/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await resp.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTitle(value);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (value.length > 2) {
        search(value);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    }, 500);
  };

  const selectResult = (result: any) => {
    console.log("selecting result", result);
    setTitle(result.title);
    setShowDropdown(false);
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

          <input
            ref={inputRef}
            autoFocus
            onChange={handleInputChange}
            placeholder="Search for a song"
            type="text"
            value={title}
            className="w-full px-4 py-2 mt-4 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          {showDropdown && searchResults.length > 0 && (
            <ul className="absolute bg-white shadow-md w-full mt-1 rounded-md z-10">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  onClick={() => selectResult(result)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {result.name}
                </li>
              ))}
            </ul>
          )}

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
