import Link from 'next/link';
import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import type { SongConnection } from '@types';
import { connectionLabel, normalizeConnections, connectionPreviewOrder } from '../lib/song-connections';

function ConnectionRows({ connections }: { connections: SongConnection[] }) {
  return <ul className="song-connections-list">
    {connections.map(connection => <li key={`${connection.type}:${connection.direction}:${connection.id}`}>
      <Link href={`/song/${connection.id}`} prefetch={false}>
        <span className="song-connection-label">{connectionLabel(connection)}</span>
        <span className="song-connection-track">
          <strong>{connection.title}</strong>
          {connection.artist && <span>{connection.artist}</span>}
          {connection.disambiguation && <span className="song-connection-version">{connection.disambiguation}</span>}
        </span>
        <ArrowRightIcon width={17} aria-hidden="true" />
      </Link>
    </li>)}
  </ul>;
}
export default function SongConnections({ connections, recordingID }: { connections?: SongConnection[]; recordingID: string }) {
  const items = connectionPreviewOrder(normalizeConnections(connections).filter(item => item.id !== recordingID.toLowerCase()));
  if (!items.length) return null;
  return <section className="song-connections" aria-labelledby="song-connections-title">
    <header>
      <h2 id="song-connections-title">Song connections</h2>
      {/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(recordingID) && <a className="song-connections-source" href={`https://musicbrainz.org/recording/${recordingID}/relationships`} target="_blank" rel="noreferrer">MusicBrainz <ArrowUpRightIcon width={13} aria-hidden="true" /></a>}
    </header>
    <ConnectionRows connections={items.slice(0,4)} />
    {items.length > 4 && <details className="song-connections-more">
      <summary><span className="connections-show">Show {items.length - 4} more connections</span><span className="connections-hide">Show fewer connections</span></summary>
      <ConnectionRows connections={items.slice(4)} />
    </details>}
  </section>;
}
