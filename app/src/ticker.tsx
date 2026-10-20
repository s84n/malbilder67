import type { Catalog, Category } from './types';

const fmtDate = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Laufschrift auf der Startseite: Bilderzahl, Neuigkeiten aus dem Katalog, Version. */
export function Ticker({ catalog, cats }: { catalog: Catalog; cats: Category[] }) {
  const images = cats.reduce((n, c) => n + c.subcategories.reduce((k, s) => k + s.motifs.reduce((l, m) => l + m.images.length, 0), 0), 0);
  const items = [
    `🖍️ ${images.toLocaleString('de-DE')} Malbilder in ${cats.length} Kategorien`,
    ...(catalog.news ?? []).map((n) => `✨ ${n.text} (${fmtDate(new Date(n.date))})`),
    `📦 Version ${__APP_VERSION__} · Bilder-Stand ${fmtDate(new Date(catalog.version * 1000))}`,
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
