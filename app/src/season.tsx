import { asset } from './catalog';
import { go } from './router';
import { ArrowIcon } from './icons';
import type { Category } from './types';

interface Pick { cat: string; sub: string; overline: string; title: string }

/** Ostersonntag nach der Gauß'schen Osterformel (gregorianisch). */
function easter(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const DAY = 24 * 60 * 60 * 1000;
const soon = (cat: string, sub: string, title: string): Pick => ({ cat, sub, overline: 'Bald ist es so weit', title });
const season = (sub: string, title: string): Pick => ({ cat: 'jahreszeiten', sub, overline: 'Passend zur Jahreszeit', title });

/** Fest oder Jahreszeit zum Datum – das Fest zuerst, die Jahreszeit als Ersatz, falls das Fest ausgeblendet ist. */
export function seasonPicks(now = new Date()): Pick[] {
  const m = now.getMonth() + 1, d = now.getDate();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const ostern = easter(now.getFullYear()).getTime();
  const picks: Pick[] = [];
  if (m === 10) picks.push(soon('feste', 'halloween', 'Halloween-Bilder'));
  else if ((m === 11 && d >= 15) || (m === 12 && d <= 26)) picks.push(soon('feste', 'weihnachten', 'Weihnachts-Bilder'));
  else if (m <= 2) picks.push(soon('feste', 'fasching', 'Fasching-Bilder'));
  else if (today >= ostern - 21 * DAY && today <= ostern + DAY) picks.push(soon('feste', 'ostern', 'Oster-Bilder'));

  if (m >= 3 && m <= 5) picks.push(season('fruehling', 'Frühlings-Bilder'));
  else if (m >= 6 && m <= 8) picks.push(season('sommer', 'Sommer-Bilder'));
  else if (m >= 9 && m <= 11) picks.push(season('herbst', 'Herbst-Bilder'));
  else picks.push(season('winter', 'Winter-Bilder'));
  return picks;
}

/** Große Karte auf der Startseite, die direkt zum passenden Fest bzw. zur Jahreszeit führt. */
export function SeasonCard({ cats }: { cats: Category[] }) {
  for (const p of seasonPicks()) {
    const sub = cats.find((c) => c.id === p.cat)?.subcategories.find((s) => s.id === p.sub);
    if (!sub) continue;
    return (
      <button class="season-card" onClick={() => go('k', p.cat, p.sub)} aria-label={p.title}>
        <span class="season-icon"><img src={asset(sub.icon)} alt="" draggable={false} /></span>
        <span class="season-text">
          <small>{p.overline}</small>
          <b>{p.title}</b>
        </span>
        <span class="season-arrow" aria-hidden="true"><ArrowIcon dir="right" /></span>
      </button>
    );
  }
  return null;
}
