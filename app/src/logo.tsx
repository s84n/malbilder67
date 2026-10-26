/** Bildzeichen: Malblatt mit bunter Linie und Wachsmalstift (Vorlage: public/logo-mark.svg). */
export const LogoMark = () => (
  <svg class="logo-mark" viewBox="0 0 72 64" aria-hidden="true">
    <rect x="8" y="8" width="40" height="48" rx="6" fill="#ffffff" stroke="#2b2d42" stroke-width="3" transform="rotate(-6 28 32)" />
    <path d="M14 44 q5 -10 10 0" fill="none" stroke="#1fa2d6" stroke-width="4" stroke-linecap="round" />
    <path d="M24 44 q5 10 10 0" fill="none" stroke="#2fb36d" stroke-width="4" stroke-linecap="round" />
    <g transform="translate(47 29) rotate(45)">
      <rect x="-6" y="-24" width="12" height="32" rx="2.5" fill="#f7931e" stroke="#2b2d42" stroke-width="3" />
      <rect x="-6" y="-15" width="12" height="5" fill="#ffffff" stroke="#2b2d42" stroke-width="2" />
      <path d="M-6 8 L6 8 L0 18 Z" fill="#f7931e" stroke="#2b2d42" stroke-width="3" stroke-linejoin="round" />
    </g>
  </svg>
);

/** Stiftlinie unter dem Wort: vier Wellen in Rot, Orange, Grün, Blau. */
const WAVE_COLORS = ['#e5383b', '#f7931e', '#2fb36d', '#1fa2d6'];
const Wave = () => (
  <svg class="logo-wave" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
    {WAVE_COLORS.map((c, i) => (
      <path key={c} d={`M${4 + i * 48} 6 q12 ${i % 2 ? 5 : -5} 24 0 t24 0`} fill="none" stroke={c} stroke-width="5" stroke-linecap="round" />
    ))}
  </svg>
);

/** Logo „Malbilder“ mit „67“-Sticker. Die kompakte Kopfzeile verkleinert es per CSS auf die Variante `small`. */
export function Logo({ size = 'big' }: { size?: 'big' | 'small' }) {
  return (
    <span class={`logo logo-${size}`} role="img" aria-label="Malbilder67">
      <LogoMark />
      <span class="logo-text">
        <span class="logo-line">
          <span class="logo-word" aria-hidden="true">Malbilder</span>
          <span class="logo-badge" aria-hidden="true">67</span>
        </span>
        <Wave />
      </span>
    </span>
  );
}
