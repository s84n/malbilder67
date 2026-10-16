import { useEffect, useState } from 'preact/hooks';

/** Hash-Routing (#/c/tiere/dinos) – funktioniert auf GitHub Pages ohne Server-Konfiguration. */
export function useRoute(): string[] {
  const parse = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [parts, setParts] = useState(parse);
  useEffect(() => {
    const onChange = () => { setParts(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parts;
}

export const go = (...parts: string[]) => { location.hash = '/' + parts.map(encodeURIComponent).join('/'); };
