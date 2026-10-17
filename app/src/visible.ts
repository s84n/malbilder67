import type { Catalog } from './types';
import type { Settings } from './store';

/** Katalog ohne die im Eltern-Bereich ausgeblendeten Kategorien, Unterkategorien und Altersstufen. */
export function visibleCatalog(catalog: Catalog, settings: Settings): Catalog {
  const hidden = new Set(settings.hidden);
  const hiddenLevels = new Set(settings.hiddenLevels);
  const categories = catalog.categories
    .filter((c) => !hidden.has(c.id))
    .map((c) => ({
      ...c,
      subcategories: c.subcategories
        .filter((s) => !hidden.has(`${c.id}/${s.id}`))
        .map((s) => ({
          ...s,
          motifs: s.motifs
            .map((m) => ({ ...m, images: m.images.filter((i) => !hiddenLevels.has(i.level)) }))
            .filter((m) => m.images.length > 0),
        }))
        .filter((s) => s.motifs.length > 0),
    }))
    .filter((c) => c.subcategories.length > 0);
  return { ...catalog, levels: catalog.levels.filter((l) => !hiddenLevels.has(l.id)), categories };
}

/** PIN nur als Hash speichern – sie verlässt das Gerät nie. */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode('malbilder67:' + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
