import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import Layout from "../../../components/Layout";
import Giant from "../../../components/Giant";
import Subtitle from "../../../components/Subtitle";
import Meta from "../../../components/Meta";
import type { GetTrackResponse, Track } from "../../../lib/types";
import { SERVER_HOST } from "../../api/util";
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
  console.log({ track });
  const { name, artist, image, release_date } = track;
  return (
    <Layout>
      <div className="py-4 flex justify-between">
        <div>
          <Giant>{name}</Giant>
          <Subtitle>{artist}</Subtitle>
          <Meta>
            Released {formatDistanceToNow(new Date(release_date))} ago
          </Meta>
        </div>
        <div>
          <Image
            src={image}
            alt={name}
            width={300}
            height={300}
            className="object-cover"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Track;
