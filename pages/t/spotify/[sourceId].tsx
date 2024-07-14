import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import Layout from "@components/Layout";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Instruments from "@components/Instruments";
import Meta from "@components/Meta";
import Tag from "@components/Tag";
import type { GetTrackResponse, Track } from "@types";
import { SERVER_HOST, listToString } from "@util";
// import { PlusIcon } from "@heroicons/react/24/solid";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  const resp = await fetch(
    `${SERVER_HOST}/track?source=SPOTIFY&sourceId=${sourceId}`
  );
  const response: GetTrackResponse = await resp.json();
  return {
    props: { track: response.track },
  };
};

type Props = {
  track: Track;
};

const Track: React.FC<Props> = ({ track }) => {
  const { name, artist, image, release_date, genres, instruments } = track;
  return (
    <Layout>
      <div className="pt-4 pb-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="col-span-1 xl:col-span-3">
          <GiantTitle>{name}</GiantTitle>
          <Subtitle>{artist}</Subtitle>
          <Meta>
            Released {formatDistanceToNow(new Date(release_date))} ago
          </Meta>
          {genres.length > 0 && (
            <div className="mb-2">
              {genres.map((genre) => (
                <Tag name={genre}>{genre}</Tag>
              ))}
            </div>
          )}
          {instruments && instruments.length > 0 && (
            <Instruments instruments={instruments} />
          )}
        </div>
        <div className="col-span-1 xl:col-span-1">
          <div className="border-4 border-black">
            <Image
              src={image}
              alt={name}
              width={300}
              height={300}
              className="object-cover w-full"
            />
          </div>
          {/* <div>
            <button
              className="cursor-pointer focus:outline-none text-white bg-green-400 hover:bg-green-500 focus:bg-green-600 rounded-lg text-xl p-4 me-2 mb-2"
              onClick={() => console.log("click")}
              disabled
            >
              Post
            </button>
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default Track;
