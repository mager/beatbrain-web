import React, { useState } from "react";
import Input from "@components/Input";
import Title from "@components/Title";
import Router from "next/router";
import Searchbox, { loadOptions } from "@components/Searchbox";
import useDebouncedLoadOptions from "../../lib/hooks/useDebouncedLoadOptions";
import Box from "@components/Box";

const Create: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const debouncedLoadOptions = useDebouncedLoadOptions(loadOptions);

  const [option, setOption] = useState(null);
  const handleChange = (option) => {
    setOption(option);
  };

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const track = {
        source: "SPOTIFY",
        sourceId: option.value.id,
        artist: option.value.artist,
        title: option.value.name,
        image: option.value.thumb,
      };
      const body = { content, track };

      // TODO: Send JWT

      await fetch(`/api/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await Router.push("/feed");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <div className="page bg-white py-8 mt-12">
        <form onSubmit={submitData} className="w-full">
          <Title>Share a beat</Title>
          <div className="flex flex-col lg:flex-row justify-between my-4 gap-4">
            <div className="w-full lg:w-1/2 flex items-center">
              <Searchbox
                option={option}
                handleChange={handleChange}
                loadOptions={debouncedLoadOptions}
              />
            </div>
            <div className="w-full lg:w-1/2 flex items-center">
              <Input
                placeholder="How does it make you feel?"
                value={content}
                setValue={setContent}
              />
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline mr-4 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create"}
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
    </Box>
  );
};

export default Create;
