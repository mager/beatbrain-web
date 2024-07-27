import SpotifyProvider from "next-auth/providers/spotify";

export default function CustomSpotifyProvider(options) {
  return {
    ...SpotifyProvider(options),
    profile(profile) {
      // Customize the profile function here
      return {
        id: profile.id,
        name: profile.display_name,
        email: profile.email,
        image: profile.images?.[0]?.url,
        // Add more fields if needed
      };
    },
  };
}
