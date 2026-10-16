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
