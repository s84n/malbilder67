import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { asset, indexImages, loadCatalog } from './catalog';
import { go, useRoute } from './router';
import { actions, useStore } from './store';
import { loadImageFile, printImage, shareImage } from './print';
import { ParentArea } from './parents';
import { BackIcon, LockIcon, PrinterIcon, ArrowIcon, SearchIcon, ShareIcon } from './icons';
import { search } from './search';
import { Logo } from './logo';
import { SeasonCard } from './season';
import { levelInfo, setLevels } from './levels';
import { visibleCatalog } from './visible';
import type { Catalog, Category, ImageRef, Motif, Subcategory } from './types';

/** Feste Farbe je Kategorie – Kinder finden „ihr“ Thema an der Farbe wieder; Unterkategorien und Motive erben sie. */
const CAT_COLORS: Record<string, string> = {
  tiere: '#f7931e', dinos: '#2fb36d', meer: '#1fa2d6', pferde: '#b5651d', fahrzeuge: '#e5383b',
  flugzeuge: '#29b6c8', schiffe: '#1d5fa8', weltraum: '#3d4fb8', fantasie: '#ff5fa2', roboter: '#7a8394',
  gebaeude: '#8d6e63', natur: '#4f9d3a', menschen: '#ef7d57', essen: '#ffb703', feste: '#6b3fa0',
  abenteuer: '#c1440e', sport: '#00a6a6', musik: '#9b5de5', jahreszeiten: '#8bc34a', mandalas: '#d63384',
};
const catColor = (cat: Category) => CAT_COLORS[cat.id] ?? '#ffb703';

export function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { loadCatalog().then((c) => { setLevels(c.levels); setCatalog(c); }, (e) => setError(String(e.message ?? e))); }, []);

  if (error) return <Message emoji="😕" text="Die Bilder konnten nicht geladen werden." detail={error} />;
  if (!catalog) return <Message emoji="🖍️" text="Einen Moment …" />;
  return <Screens catalog={catalog} />;
}

function Screens({ catalog: full }: { catalog: Catalog }) {
  const route = useRoute();
  const store = useStore();
  // Kinder sehen nur, was im Eltern-Bereich freigegeben ist – auch im Verlauf, in der Suche und bei direkten Links.
  const catalog = useMemo(() => visibleCatalog(full, store.settings), [full, store.settings]);
  const index = useMemo(() => indexImages(catalog), [catalog]);
  const [section, ...rest] = route;
  const cats = catalog.categories;
  const findCat = (id: string) => catalog.categories.find((c) => c.id === id);

  if (section === 'eltern') return <ParentArea catalog={full} />;
  if (section === 'zuletzt') return <Recent index={index} />;
  if (section === 'suche') return <Search cats={cats} />;
  if (section === 'bild') {
    const ref = index.get(rest.join('/'));
    if (ref) return <Detail refItem={ref} />;
  }
  if (section === 'k') {
    const cat = findCat(rest[0]);
    if (cat && rest.length === 1) {
      // Nur eine Unterkategorie → direkt die Motive zeigen.
      if (cat.subcategories.length === 1) return <MotifList cat={cat} sub={cat.subcategories[0]} />;
      return <SubList cat={cat} />;
    }
    const sub = cat?.subcategories.find((s) => s.id === rest[1]);
    if (cat && sub && rest.length === 2) return <MotifList cat={cat} sub={sub} />;
    const motif = sub?.motifs.find((m) => m.id === rest[2]);
    if (cat && sub && motif) return <Gallery cat={cat} sub={sub} motif={motif} />;
  }
  return <Home cats={cats} recent={store.recent.map((id) => index.get(id)).filter(Boolean).slice(0, 3) as ImageRef[]} />;
}

/* ---------- Bausteine ---------- */

/** Kopfzeile wird nach dem Scrollen kompakt (mit Abstand zwischen den Schwellen, damit sie nicht flackert). */
function useCompact() {
  const [compact, setCompact] = useState(() => window.scrollY > 40);
  useEffect(() => {
    const onScroll = () => setCompact((c) => (c ? window.scrollY > 10 : window.scrollY > 40));
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return compact;
}

function TopBar({ title, up, left, right }: { title?: string; up?: () => void; left?: ComponentChildren; right?: ComponentChildren }) {
  const compact = useCompact();
  return (
    <header class={`topbar ${compact ? 'compact' : ''}`}>
      {up ? <button class="round-btn" onClick={up} aria-label="Zurück"><BackIcon /></button> : <div>{left}</div>}
      {title ? <h1>{title}</h1> : <h1 class="topbar-logo"><Logo /></h1>}
      <div class="topbar-right">{right}</div>
    </header>
  );
}

function Tile({ img, label, color, onClick, square = true, level }: {
  img: string; label: string; color: string; onClick: () => void; square?: boolean; level?: string;
}) {
  const { settings } = useStore();
  return (
    <button class={`tile ${square ? 'tile-square' : 'tile-page'}`} style={{ '--tile': color }} onClick={onClick} aria-label={label}>
      {level && <AgeBadge level={level} />}
      <img src={asset(img)} alt="" loading="lazy" draggable={false} />
      {settings.showLabels && <span class="tile-label">{label}</span>}
    </button>
  );
}

function AgeBadge({ level, big }: { level: string; big?: boolean }) {
  const l = levelInfo(level);
  return <span class={`age-badge ${big ? 'age-big' : ''}`} style={{ '--lv': l.color }}>{l.age}<small> J.</small></span>;
}

function Message({ emoji, text, detail }: { emoji: string; text: string; detail?: string }) {
  return (
    <div class="message">
      <div class="message-emoji">{emoji}</div>
      <p>{text}</p>
      {detail && <small>{detail}</small>}
    </div>
  );
}

/* ---------- Screens ---------- */

function Home({ cats, recent }: { cats: Category[]; recent: ImageRef[] }) {
  return (
    <>
      <TopBar left={cats.length > 0 && <button class="round-btn" onClick={() => go('suche')} aria-label="Suchen"><SearchIcon /></button>} right={<button class="parent-btn" onClick={() => go('eltern')} aria-label="Eltern-Bereich"><LockIcon /><span>Eltern</span></button>} />
      {cats.length === 0 && <Message emoji="🖍️" text="Hier gibt es bald Malbilder!" />}
      {cats.length > 0 && (
        <div class="home-top">
          <SeasonCard cats={cats} />
          {recent.length > 0 && (
            <section class="recent-row" aria-label="Zuletzt gedruckt">
              <h2 class="home-h">Zuletzt gedruckt</h2>
              <div class="recent-list">
                {recent.map((r) => (
                  <button key={r.image.id} class="recent-thumb" onClick={() => go('bild', ...r.image.id.split('/'))} aria-label={r.motif.label}>
                    <img src={asset(r.image.thumb)} alt="" loading="lazy" draggable={false} />
                  </button>
                ))}
                <button class="recent-all" onClick={() => go('zuletzt')}>Alle</button>
              </div>
            </section>
          )}
        </div>
      )}
      {cats.length > 0 && <h2 class="home-h home-themes">Alle Themen</h2>}
      <main class="grid grid-big">
        {cats.map((c) => <Tile key={c.id} img={c.icon} label={c.label} color={catColor(c)} onClick={() => go('k', c.id)} />)}
      </main>
    </>
  );
}

function SubList({ cat }: { cat: Category }) {
  return (
    <>
      <TopBar title={cat.label} up={() => go()} />
      <main class="grid grid-big">
        {cat.subcategories.map((s) => <Tile key={s.id} img={s.icon} label={s.label} color={catColor(cat)} onClick={() => go('k', cat.id, s.id)} />)}
      </main>
    </>
  );
}

function MotifList({ cat, sub }: { cat: Category; sub: Subcategory }) {
  const single = cat.subcategories.length === 1;
  return (
    <>
      <TopBar title={single ? cat.label : sub.label} up={() => (single ? go() : go('k', cat.id))} />
      <main class="grid grid-pages">
        {sub.motifs.map((m) => <Tile key={m.id} img={m.thumb} label={m.label} color={catColor(cat)} square={false} onClick={() => go('k', cat.id, sub.id, m.id)} />)}
      </main>
    </>
  );
}

function LevelFilter({ value, onChange, levels }: { value: string; onChange: (v: string) => void; levels: string[] }) {
  return (
    <div class="level-filter" role="radiogroup" aria-label="Alter">
      <button class={`level-chip chip-all ${value === 'all' ? 'active' : ''}`} onClick={() => onChange('all')} role="radio" aria-checked={value === 'all'}>
        <span class="chip-dots">{levels.map((l) => <i key={l} style={{ background: levelInfo(l).color }} />)}</span>
        <span class="chip-age">Alle</span>
      </button>
      {levels.map((id) => {
        const l = levelInfo(id);
        return (
          <button key={id} class={`level-chip ${value === id ? 'active' : ''}`} style={{ '--lv': l.color }} onClick={() => onChange(id)}
            role="radio" aria-checked={value === id} aria-label={`${l.label}, ${l.age} Jahre`}>
            <span class="chip-age">{l.age}</span>
            <span class="chip-unit">Jahre</span>
          </button>
        );
      })}
    </div>
  );
}

function Gallery({ cat, sub, motif }: { cat: Category; sub: Subcategory; motif: Motif }) {
  const { settings } = useStore();
  const levels = [...new Set(motif.images.map((i) => i.level))];
  const [level, setLevel] = useState(levels.includes(settings.level) ? settings.level : 'all');
  const images = motif.images.filter((i) => level === 'all' || i.level === level);
  const single = cat.subcategories.length === 1;
  return (
    <>
      <TopBar title={motif.label} up={() => (single ? go('k', cat.id) : go('k', cat.id, sub.id))} />
      {levels.length > 1 && <LevelFilter value={level} onChange={setLevel} levels={levels} />}
      <main class="grid grid-pages">
        {images.map((img) => <Tile key={img.id} img={img.thumb} label="" color={levelInfo(img.level).color} level={img.level} square={false} onClick={() => go('bild', ...img.id.split('/'))} />)}
      </main>
    </>
  );
}

function Detail({ refItem }: { refItem: ImageRef }) {
  const { image, motif, sub, cat } = refItem;
  const [celebrate, setCelebrate] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const file = useRef<File | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const pos = motif.images.findIndex((i) => i.id === image.id);
  const several = motif.images.length > 1;
  const neighbour = (d: number) => motif.images[(pos + d + motif.images.length) % motif.images.length];
  const show = (d: number) => go('bild', ...neighbour(d).id.split('/'));

  // Datei fürs Teilen schon beim Öffnen laden, nicht erst beim Tippen
  useEffect(() => {
    file.current = null;
    let alive = true;
    loadImageFile(asset(image.print), `malbild-${motif.id}.png`).then((f) => { if (alive) file.current = f; }, () => {});
    return () => { alive = false; };
  }, [image.id]);

  // Zählt wie Drucken gegen das Tageslimit
  const allowed = () => {
    if (actions.printsLeft() <= 0) { setBlocked(true); return false; }
    actions.recordPrint(image.id);
    return true;
  };

  const onPrint = async () => {
    if (!allowed()) return;
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2500);
    await printImage(asset(image.print));
  };

  const onShare = () => {
    if (allowed()) shareImage(asset(image.print), file.current, motif.label);
  };

  const onTouchStart = (e: TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || !several) return;
    const dx = e.changedTouches[0].clientX - start.x, dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? 1 : -1);
  };

  return (
    <>
      <TopBar title={motif.label} up={() => go('k', cat.id, sub.id, motif.id)} />
      <main class="detail">
        <div class="detail-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {several && <button class="round-btn nav prev" onClick={() => show(-1)} aria-label="Vorheriges Bild"><ArrowIcon dir="left" /></button>}
          <div class="paper">
            <AgeBadge level={image.level} big />
            <img src={asset(image.print)} alt={motif.label} style={{ backgroundImage: `url(${asset(image.thumb)})` }} draggable={false} />
          </div>
          {several && <button class="round-btn nav next" onClick={() => show(1)} aria-label="Nächstes Bild"><ArrowIcon dir="right" /></button>}
        </div>
        {several && (
          <div class="dots" aria-label={`Bild ${pos + 1} von ${motif.images.length}`}>
            {motif.images.map((img, i) => <span key={img.id} class={i === pos ? 'on' : ''} />)}
          </div>
        )}
        <div class="print-bar">
          <button class="print-btn" onClick={onPrint} aria-label="Drucken">
            <PrinterIcon />
            <span>Drucken</span>
          </button>
          <button class="share-btn" onClick={onShare}><ShareIcon /> Teilen oder speichern</button>
        </div>
      </main>
      {celebrate && <div class="celebrate" aria-live="polite"><div class="burst">🎨</div><p>Viel Spaß beim Malen!</p></div>}
      {blocked && (
        <div class="overlay" onClick={() => setBlocked(false)}>
          <div class="overlay-card">
            <div class="message-emoji">🌙</div>
            <p>Für heute ist genug gedruckt.</p>
            <small>Frag deine Eltern.</small>
          </div>
        </div>
      )}
    </>
  );
}

function Recent({ index }: { index: Map<string, ImageRef> }) {
  const store = useStore();
  const recent = store.recent.map((id) => index.get(id)).filter(Boolean) as ImageRef[];
  return (
    <>
      <TopBar title="Zuletzt gedruckt" up={() => go()} />
      {recent.length
        ? (
          <main class="grid grid-pages">
            {recent.map((r) => <Tile key={r.image.id} img={r.image.thumb} label={r.motif.label} color={catColor(r.cat)} square={false} onClick={() => go('bild', ...r.image.id.split('/'))} />)}
          </main>
        )
        : <Message emoji="🖨️" text="Noch nichts gedruckt." />}
    </>
  );
}

function Search({ cats }: { cats: Category[] }) {
  const [query, setQuery] = useState(() => sessionStorage.getItem('suche') ?? '');
  const hits = useMemo(() => (query.trim().length >= 2 ? search(cats, query) : []), [cats, query]);
  const update = (q: string) => {
    setQuery(q);
    try { sessionStorage.setItem('suche', q); } catch { /* ignorieren */ }
  };
  return (
    <>
      <TopBar title="Suchen" up={() => go()} />
      <div class="search-box">
        <SearchIcon />
        <input type="search" value={query} onInput={(e) => update(e.currentTarget.value)} placeholder="z. B. Bagger, Pferd, Drache"
          autoFocus enterKeyHint="search" autoComplete="off" aria-label="Suchbegriff" />
      </div>
      {query.trim().length >= 2 && !hits.length && <Message emoji="🔍" text="Dazu gibt es leider kein Bild." />}
      <main class="grid grid-pages">
        {hits.slice(0, 60).map(({ cat, sub, motif }) => (
          <Tile key={`${cat.id}/${sub.id}/${motif.id}`} img={motif.thumb} label={motif.label} color={catColor(cat)} square={false}
            onClick={() => go('k', cat.id, sub.id, motif.id)} />
        ))}
      </main>
    </>
  );
}
