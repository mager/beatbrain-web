import type { Features } from "@types";
const featuresList = [
  ["energy", "Energy"],
  ["danceability", "Danceability"],
  ["happiness", "Positivity"],
  ["acousticness", "Acoustic"],
  ["instrumentalness", "Instrumental"],
  ["liveness", "Liveness"],
  ["speechiness", "Speech"],
] as const;
export default function AudioDNA({ features }: { features: Features }) {
  return (
    <div className="audio-features">
      {featuresList.map(([key, label]) => {
        const value = features[key];
        if (!Number.isFinite(value) || value < 0 || value > 1) return null;
        const percent = Math.round(value * 100);
        return (
          <div className="audio-feature" key={key}>
            <span>{label}</span>
            <div
              className="audio-meter"
              role="meter"
              aria-label={label}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <i style={{ width: `${percent}%` }} />
            </div>
            <span>{percent}%</span>
          </div>
        );
      })}
      {Number.isFinite(features.loudness) && (
        <p className="audio-loudness">
          Average loudness <strong>{features.loudness.toFixed(1)} dB</strong>
        </p>
      )}
    </div>
  );
}
