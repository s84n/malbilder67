import type { Category } from './types';

const fmtDate = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Laufschrift auf der Startseite: Bilderzahl, Version, Veröffentlichungsdatum. */
export function Ticker({ cats }: { cats: Category[] }) {
  const images = cats.reduce((n, c) => n + c.subcategories.reduce((k, s) => k + s.motifs.reduce((l, m) => l + m.images.length, 0), 0), 0);
  const items = [
    `🖍️ ${images.toLocaleString('de-DE')} Malbilder`,
    `📦 Version ${__APP_VERSION__}`,
    `📅 Veröffentlicht am ${fmtDate(new Date(__BUILD_DATE__))}`,
  ];
  const text = items.join('   •   ');
  // Tempo gleich bleibend lesbar, egal wie lang der Text ist.
  const seconds = Math.max(20, Math.round(text.length / 6));
  return (
    <div class="ticker" role="marquee" aria-label={items.join('. ')}>
      <div class="ticker-track" style={{ animationDuration: `${seconds}s` }} aria-hidden="true">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
