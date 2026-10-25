import { useEffect, useMemo, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { asset, indexImages, loadCatalog } from './catalog';
import { go, useRoute } from './router';
import { actions, useStore } from './store';
import { printImage } from './print';
import { ParentArea } from './parents';
import { BackIcon, LockIcon, PrinterIcon, ArrowIcon, SearchIcon } from './icons';
import { search } from './search';
import { Logo } from './logo';
import { Ticker } from './ticker';
import { levelInfo, setLevels } from './levels';
import { visibleCatalog } from './visible';
import type { Catalog, Category, ImageRef, Motif, Subcategory } from './types';

const TILE_COLORS = ['#ffb703', '#8ecae6', '#90be6d', '#f28482', '#cdb4db', '#f4a261', '#4cc9f0', '#ffafcc'];

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
  return <Home catalog={full} cats={cats} hasRecent={store.recent.some((id) => index.has(id))} />;
}

/* ---------- Bausteine ---------- */

function TopBar({ title, up, left, right }: { title?: string; up?: () => void; left?: ComponentChildren; right?: ComponentChildren }) {
  return (
    <header class="topbar">
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

const color = (i: number) => TILE_COLORS[i % TILE_COLORS.length];

/* ---------- Screens ---------- */

function Home({ catalog, cats, hasRecent }: { catalog: Catalog; cats: Category[]; hasRecent: boolean }) {
  return (
    <>
      <TopBar left={cats.length > 0 && <button class="round-btn" onClick={() => go('suche')} aria-label="Suchen"><SearchIcon /></button>} right={<button class="parent-btn" onClick={() => go('eltern')} aria-label="Eltern-Bereich"><LockIcon /><span>Eltern</span></button>} />
      {cats.length > 0 && <Ticker cats={cats} />}
      {cats.length === 0 && <Message emoji="🖍️" text="Hier gibt es bald Malbilder!" />}
      <main class="grid grid-big">
        {hasRecent && (catalog.recentIcon
          ? <Tile img={catalog.recentIcon} label="Zuletzt gedruckt" color="#2a9d8f" onClick={() => go('zuletzt')} />
          : (
            <button class="tile tile-square tile-recent" onClick={() => go('zuletzt')} aria-label="Zuletzt gedruckt">
              <span class="tile-emoji"><PrinterIcon /></span>
              <span class="tile-label">Zuletzt gedruckt</span>
            </button>
          ))}
        {cats.map((c, i) => <Tile key={c.id} img={c.icon} label={c.label} color={color(i)} onClick={() => go('k', c.id)} />)}
      </main>
    </>
  );
}

function SubList({ cat }: { cat: Category }) {
  return (
    <>
      <TopBar title={cat.label} up={() => go()} />
      <main class="grid grid-big">
        {cat.subcategories.map((s, i) => <Tile key={s.id} img={s.icon} label={s.label} color={color(i + 2)} onClick={() => go('k', cat.id, s.id)} />)}
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
        {sub.motifs.map((m, i) => <Tile key={m.id} img={m.thumb} label={m.label} color={color(i + 4)} square={false} onClick={() => go('k', cat.id, sub.id, m.id)} />)}
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
  const store = useStore();
  const { image, motif, sub, cat } = refItem;
  const [celebrate, setCelebrate] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const pos = motif.images.findIndex((i) => i.id === image.id);
  const neighbour = (d: number) => motif.images[(pos + d + motif.images.length) % motif.images.length];

  const onPrint = async () => {
    if (actions.printsLeft() <= 0) { setBlocked(true); return; }
    actions.recordPrint(image.id);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2500);
    await printImage(asset(image.print));
  };

  return (
    <>
      <TopBar title={motif.label} up={() => go('k', cat.id, sub.id, motif.id)} />
      <main class="detail">
        <div class="detail-stage">
          {motif.images.length > 1 && <button class="round-btn nav prev" onClick={() => go('bild', ...neighbour(-1).id.split('/'))} aria-label="Vorheriges Bild"><ArrowIcon dir="left" /></button>}
          <div class="paper">
            <AgeBadge level={image.level} big />
            <img src={asset(image.print)} alt={motif.label} style={{ backgroundImage: `url(${asset(image.thumb)})` }} draggable={false} />
          </div>
          {motif.images.length > 1 && <button class="round-btn nav next" onClick={() => go('bild', ...neighbour(1).id.split('/'))} aria-label="Nächstes Bild"><ArrowIcon dir="right" /></button>}
        </div>
        <button class="print-btn" onClick={onPrint} aria-label="Drucken">
          <PrinterIcon />
          <span>Drucken</span>
        </button>
        {store.settings.printFallback && (
          <a class="fallback-link" href={asset(image.print)} target="_blank" rel="noopener">Bild öffnen (zum Drucken über „Teilen“)</a>
        )}
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
            {recent.map((r, i) => <Tile key={r.image.id} img={r.image.thumb} label={r.motif.label} color={color(i)} square={false} onClick={() => go('bild', ...r.image.id.split('/'))} />)}
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
        {hits.slice(0, 60).map(({ cat, sub, motif }, i) => (
          <Tile key={`${cat.id}/${sub.id}/${motif.id}`} img={motif.thumb} label={motif.label} color={color(i + 4)} square={false}
            onClick={() => go('k', cat.id, sub.id, motif.id)} />
        ))}
      </main>
    </>
  );
}
