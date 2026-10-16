import type { Catalog, ImageRef } from './types';

export async function loadCatalog(): Promise<Catalog> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/catalog.json`);
  if (!res.ok) throw new Error(`Katalog nicht gefunden (${res.status})`);
  return res.json();
}

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/** Index Bild-ID → Fundstelle, für Favoriten, Verlauf und Detailseite. */
export function indexImages(catalog: Catalog): Map<string, ImageRef> {
  const map = new Map<string, ImageRef>();
  for (const cat of catalog.categories)
    for (const sub of cat.subcategories)
      for (const motif of sub.motifs)
        for (const image of motif.images) map.set(image.id, { image, motif, sub, cat });
  return map;
}
