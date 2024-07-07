import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import Layout from "@components/Layout";
import GiantTitle from "@components/GiantTitle";
import Subtitle from "@components/Subtitle";
import Meta from "@components/Meta";
import Tag from "@components/Tag";
import type { GetTrackResponse, Track } from "@types";
import { SERVER_HOST } from "@util";

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
  const { name, artist, image, release_date, genres } = track;
  return (
    <Layout>
      <div className="py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="col-span-1 xl:col-span-3">
          <GiantTitle>{name}</GiantTitle>
          <Subtitle>{artist}</Subtitle>
          <Meta>
            Released {formatDistanceToNow(new Date(release_date))} ago
          </Meta>
          {genres.length && (
            <div className="mb-2">
              {genres.map((genre) => (
                <Tag>{genre}</Tag>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-1 xl:col-span-1">
          <Image
            src={image}
            alt={name}
            width={300}
            height={300}
            className="object-cover w-full"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Track;
