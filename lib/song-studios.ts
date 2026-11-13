import type { SongStudio } from './types';
import { formatReleaseDate } from './track-details';

export const studioLabels: Record<string,string> = {
  'recorded at':'Recorded at', 'mixed at':'Mixed at', 'produced at':'Produced at', 'engineered at':'Engineered at',
};
function validDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}(-\d{2})?(-\d{2})?$/.test(value) || value.startsWith('0000')) return '';
  const full = value.length===4 ? `${value}-01-01` : value.length===7 ? `${value}-01` : value;
  const date = new Date(`${full}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10)===full ? value : '';
}
export function normalizeStudios(value: unknown): SongStudio[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((item): SongStudio[] => {
    if (!item || typeof item.id!=='string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(item.id) ||
      typeof item.name!=='string' || !item.name.trim() || !Object.hasOwn(studioLabels,item.type)) return [];
    const begin=validDate(item.begin), end=validDate(item.end), additional=item.additional===true;
    const key=`${item.id.toLowerCase()}:${item.type}:${begin}:${end}:${additional}`;
    if (seen.has(key)) return []; seen.add(key);
    return [{id:item.id.toLowerCase(),name:item.name.trim(),type:item.type,begin,end,additional,area:typeof item.area==='string'?item.area.trim():''}];
  });
}
export function studioDateRange(studio: {begin?:string;end?:string}): string {
  const begin=formatReleaseDate(validDate(studio.begin)), end=formatReleaseDate(validDate(studio.end));
  if (begin && end) return begin===end ? begin : `${begin} – ${end}`;
  return begin ? `From ${begin}` : end ? `Until ${end}` : '';
}

export function studioLabel(studio: SongStudio): string {
  if (!studio.additional) return studioLabels[studio.type] || '';
  const labels: Record<string,string> = {'recorded at':'Additional recording at','mixed at':'Additional mixing at','produced at':'Additional production at','engineered at':'Additional engineering at'};
  return labels[studio.type] || '';
}
