export const SERVER_HOST =
  process.env.NODE_ENV === "production"
    ? "https://occipital-cqaymsy2sa-uc.a.run.app"
    : "http://localhost:8080";

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

export const colors = [
  "bg-red-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-green-500",
  "bg-lime-500",
  "bg-yellow-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-gray-500",

  "bg-red-400",
  "bg-pink-400",
  "bg-purple-400",
  "bg-indigo-400",
  "bg-blue-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-green-400",
  "bg-lime-400",
  "bg-yellow-400",
  "bg-amber-400",
  "bg-orange-400",
  "bg-gray-400",
];
export const getRandomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];

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

export const hexColorMap = {
  "bg-red-500": "#ef4444",
  "bg-pink-500": "#ec4899",
  "bg-purple-500": "#8b5cf6",
  "bg-indigo-500": "#6366f1",
  "bg-blue-500": "#3b82f6",
  "bg-teal-500": "#14b8a6",
  "bg-cyan-500": "#06b6d4",
  "bg-green-500": "#22c55e",
  "bg-lime-500": "#84cc16",
  "bg-yellow-500": "#eab308",
  "bg-amber-500": "#f5b041",
  "bg-orange-500": "#f97316",
  "bg-gray-500": "#6b7280",

  "bg-red-400": "#fca5a5",
  "bg-pink-400": "#f9a8d4",
  "bg-purple-400": "#c084fc",
  "bg-indigo-400": "#a5b4fc",
  "bg-blue-400": "#93c5fd",
  "bg-teal-400": "#6ee7b7",
  "bg-cyan-400": "#38bdf8",
  "bg-green-400": "#65a30d",
  "bg-lime-400": "#a3e635",
  "bg-yellow-400": "#facc15",
  "bg-amber-400": "#fbbf24",
  "bg-orange-400": "#fb923c",
  "bg-gray-400": "#a1a1aa",
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
