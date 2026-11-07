import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import prisma from "./prisma";
import { claimInvite } from "./invites";
import { routeNewSpotifyUser } from "./waitlist";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  socialProviders: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      disableSignUp: false,
      scope: ["user-read-email", "user-read-private"],
    },
  },
  user: { validateUserInfo: (data) => routeNewSpotifyUser(data) },
  onAPIError: { errorURL: "/auth/signin" },
  // Existing Spotify members can sign in; only an email invite can create a user.
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          const handle = (user as typeof user & { username?: string }).username;
          if (!handle || !/^[a-zA-Z0-9_]{3,30}$/.test(handle)) {
            throw new APIError("BAD_REQUEST", {
              message:
                "Use a username with 3 to 30 letters, numbers, or underscores.",
            });
          }
          if (
            context?.path !== "/sign-up/email" ||
            !(await claimInvite(
              context.headers?.get("x-invite-token"),
              user.email,
            ))
          ) {
            throw new APIError("FORBIDDEN", {
              message: "A valid invitation for this email is required.",
            });
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [username()],
  session: { cookieCache: { enabled: false } },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
});
