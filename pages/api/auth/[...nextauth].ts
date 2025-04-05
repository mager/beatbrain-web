import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import SpotifyProvider from "next-auth/providers/spotify";
import prisma from "../../../lib/prisma";

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);

export default authHandler;

export const options: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: { scope: "streaming user-read-playback-state user-read-email user-read-private" },
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Add access token to the session
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.user.id = token.sub;

      return session;
    },
    async jwt({ token, account }) {
      // Persist the access token to the token object
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
};
