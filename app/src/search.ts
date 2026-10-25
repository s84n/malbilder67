import type { Category, Motif, Subcategory } from './types';

export interface Hit { cat: Category; sub: Subcategory; motif: Motif }

/** Klein, ohne Umlaute/Akzente: „Bär“, „Baer“ und „bar“ finden dasselbe. */
const norm = (s: string) => s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
  .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Motive, bei denen jedes Suchwort im Motiv-, Unterkategorie- oder Kategorienamen vorkommt; Treffer im Motivnamen zuerst. */
export function search(cats: Category[], query: string): Hit[] {
  const words = norm(query).split(/[^a-z0-9]+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { hit: Hit; score: number }[] = [];
  for (const cat of cats)
    for (const sub of cat.subcategories)
      for (const motif of sub.motifs) {
        const own = norm(motif.label);
        const all = `${own} ${norm(sub.label)} ${norm(cat.label)}`;
        if (!words.every((w) => all.includes(w))) continue;
        const score = words.filter((w) => own.includes(w)).length * 2 + (words.some((w) => own.startsWith(w)) ? 1 : 0);
        scored.push({ hit: { cat, sub, motif }, score });
      }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.hit);
}
