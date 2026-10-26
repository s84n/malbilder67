/**
 * Drucken über den System-Druckdialog (AirPrint auf iPad/iPhone, Mopria/Standard-Druckdienst auf Android).
 * Das Druckbild wird in #print-root gelegt; die Print-CSS blendet alles andere aus und
 * skaliert das Bild auf eine A4-Seite im Hochformat.
 */
export async function printImage(url: string): Promise<void> {
  const root = document.getElementById('print-root')!;
  root.innerHTML = '';
  const img = new Image();
  img.alt = '';
  img.src = url;
  root.appendChild(img);
  try {
    await img.decode();
  } catch {
    await new Promise((resolve) => { img.onload = img.onerror = resolve; });
  }
  // Ein Frame Zeit geben, damit das Layout steht, bevor der Dialog aufgeht.
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  window.print();
}

/** Druckbild als Datei laden – vorab, damit `navigator.share` noch innerhalb der Nutzergeste läuft (Safari ist da streng). */
export async function loadImageFile(url: string, name: string): Promise<File> {
  const blob = await (await fetch(url)).blob();
  return new File([blob], name, { type: blob.type || 'image/png' });
}

/**
 * Teilen-Menü des Geräts öffnen (Drucken, in Fotos/Dateien sichern, an Oma schicken …).
 * Ohne Datei-Teilen (z. B. Desktop-Firefox) wird das Bild in einem neuen Tab geöffnet.
 */
export async function shareImage(url: string, file: File | null, title: string): Promise<void> {
  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;   // Menü vom Nutzer geschlossen
    }
  }
  window.open(url, '_blank', 'noopener');
}
