import type { Level } from './types';

/** Feste Farbe je Stufe – keine Ampel, damit sie auch bei Rot-Grün-Schwäche (über die Helligkeit) unterscheidbar bleiben. */
const COLORS: Record<string, string> = { klein: '#1679a8', mittel: '#5b35b0', gross: '#b85a00' };
const FALLBACK = ['#1679a8', '#5b35b0', '#b85a00', '#2b2d42'];

let levels: Level[] = [];
export const setLevels = (l: Level[]) => { levels = l; };

export function levelInfo(id: string) {
  const i = Math.max(levels.findIndex((l) => l.id === id), 0);
  const l = levels[i] ?? { id, label: id, age: '' };
  // Sterne zusätzlich zur Farbe: ★ = 3–5, ★★ = 5–8, ★★★ = 8+
  return { ...l, color: COLORS[id] ?? FALLBACK[i % FALLBACK.length], stars: '★'.repeat(i + 1) };
}
