import { ArrowUpRightIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { SongStudio } from '@types';
import { normalizeStudios, studioDateRange, studioLabel } from '../lib/song-studios';
function StudioRows({studios}:{studios:SongStudio[]}) {
  return <ul className="song-studios-list">{studios.map(studio => <li key={`${studio.id}:${studio.type}:${studio.begin}:${studio.end}:${studio.additional}`}>
    <MapPinIcon width={19} aria-hidden="true" />
    <div>
      <span className="song-studio-role">{studioLabel(studio)}</span>
      <a href={`https://musicbrainz.org/place/${studio.id}`} target="_blank" rel="noreferrer">{studio.name}<ArrowUpRightIcon width={13} aria-hidden="true" /></a>
      {(studio.area || studioDateRange(studio)) && <span className="song-studio-detail">{[studio.area, studioDateRange(studio)].filter(Boolean).join(' · ')}</span>}
    </div>
  </li>)}</ul>;
}
export default function SongStudios({studios}:{studios?:SongStudio[]}) {
  const items=normalizeStudios(studios);
  if (!items.length) return null;
  return <section className="song-studios" aria-labelledby="song-studios-title">
    <h2 id="song-studios-title">Studios &amp; places</h2>
    <StudioRows studios={items.slice(0,3)} />
    {items.length>3 && <details className="song-connections-more"><summary><span className="connections-show">Show {items.length-3} more places</span><span className="connections-hide">Show fewer places</span></summary><StudioRows studios={items.slice(3)} /></details>}
  </section>;
}
