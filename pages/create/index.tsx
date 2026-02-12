import React, { useState } from "react";
import Input from "@components/Input";
import Router from "next/router";
import Searchbox, { loadOptions } from "@components/Searchbox";
import useDebouncedLoadOptions from "../../lib/hooks/useDebouncedLoadOptions";

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
    <div className="bb-container pt-24 pb-16">
      <form onSubmit={submitData} className="w-full max-w-3xl">
        <h1 className="font-display text-3xl text-white tracking-tight mb-8">Share a beat</h1>
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

        <div className="flex items-center gap-4 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`font-mono text-xs rounded px-6 py-2.5 transition-colors ${
              isSubmitting
                ? "border border-terminal-border text-phosphor-dim cursor-not-allowed"
                : "border border-accent bg-accent/10 text-accent hover:bg-accent/20"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>

          <a
            className="text-phosphor-dim hover:text-phosphor cursor-pointer font-mono text-xs transition-colors"
            onClick={() => Router.push("/create")}
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default Create;
