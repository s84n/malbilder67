import type { Level } from './types';

/** Feste Farbe je Stufe: grün = leicht → orange → rot = knifflig. */
const COLORS: Record<string, string> = { klein: '#2fb36d', mittel: '#f7931e', gross: '#e5383b' };
const FALLBACK = ['#2fb36d', '#f7931e', '#e5383b', '#7b5cd6'];

let levels: Level[] = [];
export const setLevels = (l: Level[]) => { levels = l; };

export function levelInfo(id: string) {
  const i = Math.max(levels.findIndex((l) => l.id === id), 0);
  const l = levels[i] ?? { id, label: id, age: '' };
  return { ...l, color: COLORS[id] ?? FALLBACK[i % FALLBACK.length] };
}
