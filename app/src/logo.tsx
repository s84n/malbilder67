const LETTER_COLORS = ['#e5383b', '#f7931e', '#ffc300', '#2fb36d', '#1fa2d6', '#7b5cd6', '#ff5fa2', '#e5383b', '#f7931e'];

/** Schriftzug „MALBILDER67“: bunte Buchstaben, weiße Kontur, 3D-Schatten, „67“ als Sticker. */
export function Logo({ size = 'big' }: { size?: 'big' | 'small' }) {
  return (
    <span class={`logo-word logo-${size}`} role="img" aria-label="Malbilder67">
      {'MALBILDER'.split('').map((ch, i) => (
        <span key={i} class="logo-letter" style={{ color: LETTER_COLORS[i], '--tilt': `${i % 2 ? 4 : -4}deg` }} aria-hidden="true">{ch}</span>
      ))}
      <span class="logo-badge" aria-hidden="true">67</span>
    </span>
  );
}
