export const SERVER_HOST = "http://localhost:8080";
// export const SERVER_HOST =
//   process.env.NODE_ENV === "production"
//     ? "https://occipital-cqaymsy2sa-uc.a.run.app"
//     : "http://localhost:8080";

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
export const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const colorClasses = [
  "bg-red-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-indigo-400",
  "bg-teal-400",
  "bg-orange-400",
];

export const getRandomColorClass = () => {
  const randomIndex = Math.floor(Math.random() * colorClasses.length);
  return colorClasses[randomIndex];
};

export const listToString = (list: string[]) => {
  if (list.length === 0) {
    return "";
  }
  if (list.length === 1) {
    return list[0];
  }
  const allButLast = list.slice(0, -1).join(", ");
  const last = list[list.length - 1];
  return `${allButLast} & ${last}`;
};

export const getSpotifyTrackURL = (id: string) => {
  return `https://open.spotify.com/track/${id}`;
};
