import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import SpotifyProvider from "next-auth/providers/spotify";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);

export default authHandler;

// Helper to create a URL-safe username from Spotify display name
const sanitizeUsername = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') // Remove special chars
    .slice(0, 30); // Limit length
};

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: { scope: "streaming user-read-playback-state user-read-email user-read-private" },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url,
          spotifyId: profile.id,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // On sign in, auto-populate username and spotifyId if not set
      if (account?.provider === "spotify" && profile) {
        const spotifyProfile = profile as { id: string; display_name?: string };
        const spotifyId = spotifyProfile.id;
        
        // Find the user and update if username/spotifyId not set
        const existingUser = await prisma.user.findFirst({
          where: { email: user.email },
        });

        if (existingUser) {
          const updates: { username?: string; spotifyId?: string } = {};
          
          // Set spotifyId if not already set
          if (!existingUser.spotifyId) {
            updates.spotifyId = spotifyId;
          }
          
          // Set username if not already set
          if (!existingUser.username) {
            // Prefer display_name, fallback to Spotify ID
            const baseUsername = spotifyProfile.display_name 
              ? sanitizeUsername(spotifyProfile.display_name)
              : spotifyId;
            
            // Check if username is taken, append numbers if needed
            let finalUsername = baseUsername;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
              finalUsername = `${baseUsername}${counter}`;
              counter++;
            }
            updates.username = finalUsername;
          }
          
          if (Object.keys(updates).length > 0) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: updates,
            });
          }
        }
      }
      return true;
    },
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
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
};
