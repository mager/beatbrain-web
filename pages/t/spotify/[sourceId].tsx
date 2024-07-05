import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";

import Layout from "../../../components/Layout";
import Giant from "../../../components/Giant";
import Subtitle from "../../../components/Subtitle";
import { useSession, getSession } from "next-auth/react";
import type { GetTrackResponse, Track } from "../../../lib/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { sourceId } = context.params;
  const resp = await fetch(
    `https://occipital-cqaymsy2sa-uc.a.run.app/track?source=SPOTIFY&sourceId=${sourceId}`,
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
  const { name, artist, image } = track;
  return (
    <Layout>
      <div className="py-4 flex justify-between">
        <div>
          <Giant>{name}</Giant>
          <Subtitle>{artist}</Subtitle>
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
