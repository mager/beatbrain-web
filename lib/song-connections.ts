import type { SongConnection } from './types';

const labels: Record<string, [string, string]> = {
  'samples material': ['Samples', 'Sampled by'],
  remix: ['Remix of', 'Remixed as'],
  edit: ['Edit of', 'Edited as'],
};
export function connectionLabel(connection: { type: string; direction: string }): string {
  if (!Object.hasOwn(labels, connection.type)) return '';
  return connection.direction === 'forward' ? labels[connection.type][0]
    : connection.direction === 'backward' ? labels[connection.type][1] : '';
}
export function normalizeConnections(value: unknown): SongConnection[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item): SongConnection[] => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' ||
      !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(item.id) ||
      typeof item.title !== 'string' || !item.title.trim() || !connectionLabel(item)) return [];
    const key = `${item.type}:${item.direction}:${item.id.toLowerCase()}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{id: item.id.toLowerCase(), title: item.title.trim(),
      artist: typeof item.artist === 'string' ? item.artist.trim() : '',
      disambiguation: typeof item.disambiguation === 'string' ? item.disambiguation.trim() : '',
      type: item.type, direction: item.direction}];
  });
}

// Let the compact preview show the kinds of links available, not just one long group.
export function connectionPreviewOrder(items: SongConnection[]): SongConnection[] {
  const groups = new Set<string>();
  const first = items.filter(item => {
    const label=connectionLabel(item);
    if(groups.has(label))return false;
    groups.add(label);return true;
  }).slice(0,4);
  const selected=new Set(first);
  return [...first,...items.filter(item=>!selected.has(item))];
}
