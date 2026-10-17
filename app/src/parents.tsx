import { useMemo, useState } from 'preact/hooks';
import { go } from './router';
import { actions, useStore } from './store';
import { BackIcon } from './icons';
import { hashPin } from './visible';
import type { Catalog, Category } from './types';

const PIN_LEN = 4;

/** Eltern-Bereich, geschützt durch eine Rechenaufgabe oder – falls festgelegt – eine PIN. */
export function ParentArea({ catalog }: { catalog: Catalog }) {
  const [unlocked, setUnlocked] = useState(false);
  return (
    <>
      <header class="topbar">
        <button class="round-btn" onClick={() => go()} aria-label="Zurück"><BackIcon /></button>
        <h1>Eltern-Bereich</h1>
        <div class="topbar-right" />
      </header>
      {unlocked ? <Settings catalog={catalog} /> : <Gate onOk={() => setUnlocked(true)} />}
    </>
  );
}

function Gate({ onOk }: { onOk: () => void }) {
  const { settings } = useStore();
  const [a, b] = useMemo(() => [3 + Math.floor(Math.random() * 7), 4 + Math.floor(Math.random() * 6)], []);
  const withPin = !!settings.pinHash;
  const answerLen = withPin ? PIN_LEN : String(a * b).length;
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const fail = () => { setWrong(true); setTimeout(() => setInput(''), 600); };
  const press = async (d: string) => {
    const next = (input + d).slice(0, answerLen);
    setInput(next);
    setWrong(false);
    if (next.length < answerLen) return;
    const ok = withPin ? (await hashPin(next)) === settings.pinHash : Number(next) === a * b;
    if (ok) onOk(); else fail();
  };
  return (
    <main class="gate">
      <p class="gate-q">{withPin ? 'Eltern-PIN eingeben' : `Wie viel ist ${a} × ${b}?`}</p>
      <div class={`gate-input ${wrong ? 'wrong' : ''}`}>{(withPin ? '•'.repeat(input.length) : input) || ' '}</div>
      <div class="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k) =>
          k === '' ? <span key="blank" /> : (
            <button key={k} onClick={() => (k === '⌫' ? setInput(input.slice(0, -1)) : press(k))}>{k}</button>
          ))}
      </div>
      {withPin && <p class="hint center">PIN vergessen? In den Browser-Einstellungen die Website-Daten dieser Seite löschen – das setzt alle Einstellungen zurück.</p>}
    </main>
  );
}

function Settings({ catalog }: { catalog: Catalog }) {
  const { settings, favorites, recent } = useStore();
  const used = actions.printsUsedToday();
  const total = catalog.categories.reduce((n, c) => n + c.subcategories.reduce((m, s) => m + s.motifs.reduce((k, mo) => k + mo.images.length, 0), 0), 0);
  const shownLevels = catalog.levels.filter((l) => !settings.hiddenLevels.includes(l.id));
  const toggleLevel = (id: string) => {
    const hiddenLevels = settings.hiddenLevels.includes(id) ? settings.hiddenLevels.filter((h) => h !== id) : [...settings.hiddenLevels, id];
    if (hiddenLevels.length >= catalog.levels.length) return;   // mindestens eine Stufe bleibt sichtbar
    actions.updateSettings({ hiddenLevels, level: hiddenLevels.includes(settings.level) ? 'all' : settings.level });
  };

  return (
    <main class="settings">
      <Categories catalog={catalog} />

      <section>
        <h2>Alter</h2>
        <p class="hint">Ausgeblendete Stufen erscheinen nirgends in der App.</p>
        {catalog.levels.map((l) => (
          <label class="row" key={l.id}>
            <span>{l.label} <small class="hint">{l.age} Jahre</small></span>
            <input type="checkbox" checked={!settings.hiddenLevels.includes(l.id)} onChange={() => toggleLevel(l.id)}
              disabled={shownLevels.length === 1 && !settings.hiddenLevels.includes(l.id)} />
          </label>
        ))}
        {shownLevels.length > 1 && (
          <>
            <p class="hint">Welche Stufe in der Bildauswahl zuerst angezeigt wird:</p>
            <div class="seg">
              {[{ id: 'all', label: 'Alle', age: '' }, ...shownLevels].map((l) => (
                <button key={l.id} class={settings.level === l.id ? 'active' : ''} onClick={() => actions.updateSettings({ level: l.id })}>
                  {l.label}{l.age && <small> {l.age} J.</small>}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <section>
        <h2>Drucken</h2>
        <label class="row">
          <span>Tageslimit</span>
          <select value={settings.dailyLimit} onChange={(e) => actions.updateSettings({ dailyLimit: Number(e.currentTarget.value) })}>
            {[0, 1, 2, 3, 5, 10, 20].map((n) => <option key={n} value={n}>{n === 0 ? 'unbegrenzt' : `${n} Bilder`}</option>)}
          </select>
        </label>
        <div class="row">
          <span>Heute gedruckt: <b>{used}</b></span>
          <button class="small" onClick={() => actions.resetPrintCounter()}>Zähler zurücksetzen</button>
        </div>
        <label class="row">
          <span>„Bild öffnen“-Knopf zeigen<br /><small class="hint">Falls der Druckdialog auf einem Gerät nicht erscheint: Bild öffnen und über „Teilen → Drucken“ drucken.</small></span>
          <input type="checkbox" checked={settings.printFallback} onChange={(e) => actions.updateSettings({ printFallback: e.currentTarget.checked })} />
        </label>
        <p class="hint">Tipp: Im Druckdialog einmal den WLAN-Drucker, A4 und „Schwarzweiß“ wählen – iPad und Android merken sich das.</p>
      </section>

      <section>
        <h2>Anzeige</h2>
        <label class="row">
          <span>Beschriftung unter den Bildern</span>
          <input type="checkbox" checked={settings.showLabels} onChange={(e) => actions.updateSettings({ showLabels: e.currentTarget.checked })} />
        </label>
      </section>

      <PinSetup />

      <section>
        <h2>Verlauf</h2>
        <div class="row"><span>{favorites.length} Favoriten</span><button class="small" onClick={() => actions.clearFavorites()}>Löschen</button></div>
        <div class="row"><span>{recent.length} zuletzt gedruckt</span><button class="small" onClick={() => actions.clearHistory()}>Löschen</button></div>
      </section>

      <section>
        <h2>Datenschutz</h2>
        <p class="hint">
          Die App hat keine Konten, keine Werbung, keine Cookies und keine Statistik-Dienste. Einstellungen, Favoriten,
          Druckzähler und PIN (nur als Prüfsumme) bleiben ausschließlich auf diesem Gerät gespeichert und werden nirgendwohin
          gesendet. Geladen werden nur die Bilder selbst – von GitHub Pages, wo die App liegt.
        </p>
        <div class="row">
          <span>Alles auf diesem Gerät zurücksetzen</span>
          <button class="small danger" onClick={() => { if (confirm('Wirklich alle Einstellungen, Favoriten, den Verlauf und die PIN löschen?')) { actions.resetAll(); go(); } }}>Zurücksetzen</button>
        </div>
      </section>

      <p class="hint center">Alle Bilder sind KI-generiert (Stable Diffusion XL / Juggernaut XL) – private, nicht-kommerzielle Nutzung, es werden keine Rechte beansprucht.</p>
      <p class="hint center">{total} Malbilder · Stand {new Date(catalog.version * 1000).toLocaleDateString('de-DE')}</p>
    </main>
  );
}

/** Kategorien und ihre Unterkategorien einzeln ein-/ausblenden. */
function Categories({ catalog }: { catalog: Catalog }) {
  const { settings } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const hidden = new Set(settings.hidden);
  const set = (ids: string[], show: boolean) => {
    const next = new Set(hidden);
    ids.forEach((id) => (show ? next.delete(id) : next.add(id)));
    actions.updateSettings({ hidden: [...next] });
  };
  const allIds = catalog.categories.map((c) => c.id);
  const subIds = (c: Category) => c.subcategories.map((s) => `${c.id}/${s.id}`);

  return (
    <section>
      <h2>Kategorien</h2>
      <p class="hint">Ausgeblendetes erscheint nicht in der App. Mit ▸ lassen sich einzelne Bereiche wählen, z. B. nur Halloween ausblenden.</p>
      <div class="seg">
        <button onClick={() => actions.updateSettings({ hidden: [] })}>Alle an</button>
        <button onClick={() => actions.updateSettings({ hidden: allIds })}>Alle aus</button>
      </div>
      {catalog.categories.map((c) => {
        const subs = c.subcategories.length > 1 ? subIds(c) : [];
        const shownSubs = subs.filter((id) => !hidden.has(id)).length;
        return (
          <div key={c.id}>
            <div class="row">
              <span class="cat-name">
                {subs.length > 0 && (
                  <button class={`expand ${open === c.id ? 'open' : ''}`} onClick={() => setOpen(open === c.id ? null : c.id)}
                    aria-label={`${c.label}: Bereiche zeigen`} aria-expanded={open === c.id}>▸</button>
                )}
                {c.label}
                {subs.length > 0 && !hidden.has(c.id) && shownSubs < subs.length && <small class="hint"> {shownSubs}/{subs.length}</small>}
              </span>
              <input type="checkbox" checked={!hidden.has(c.id)} onChange={(e) => set([c.id], e.currentTarget.checked)} />
            </div>
            {open === c.id && c.subcategories.map((s) => (
              <label class="row sub-row" key={s.id}>
                <span>{s.label}</span>
                <input type="checkbox" checked={!hidden.has(`${c.id}/${s.id}`)} disabled={hidden.has(c.id)}
                  onChange={(e) => set([`${c.id}/${s.id}`], e.currentTarget.checked)} />
              </label>
            ))}
          </div>
        );
      })}
    </section>
  );
}

function PinSetup() {
  const { settings } = useStore();
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const valid = new RegExp(`^\\d{${PIN_LEN}}$`).test(pin) && pin === pin2;
  const save = async () => {
    actions.updateSettings({ pinHash: await hashPin(pin) });
    setEditing(false); setPin(''); setPin2('');
  };
  const digits = (v: string) => v.replace(/\D/g, '').slice(0, PIN_LEN);
  return (
    <section>
      <h2>Zugang</h2>
      <p class="hint">
        {settings.pinHash
          ? 'Der Eltern-Bereich ist mit einer PIN geschützt.'
          : 'Der Eltern-Bereich ist mit einer Rechenaufgabe geschützt. Ältere Kinder können die lösen – eine PIN ist sicherer.'}
      </p>
      {editing ? (
        <>
          <label class="row"><span>Neue PIN ({PIN_LEN} Ziffern)</span>
            <input class="pin" type="password" inputMode="numeric" autoComplete="off" value={pin} onInput={(e) => setPin(digits(e.currentTarget.value))} /></label>
          <label class="row"><span>PIN wiederholen</span>
            <input class="pin" type="password" inputMode="numeric" autoComplete="off" value={pin2} onInput={(e) => setPin2(digits(e.currentTarget.value))} /></label>
          <div class="row">
            <button class="small" onClick={() => { setEditing(false); setPin(''); setPin2(''); }}>Abbrechen</button>
            <button class="small primary" disabled={!valid} onClick={save}>PIN speichern</button>
          </div>
        </>
      ) : (
        <div class="row">
          <button class="small" onClick={() => setEditing(true)}>{settings.pinHash ? 'PIN ändern' : 'PIN festlegen'}</button>
          {settings.pinHash && <button class="small" onClick={() => actions.updateSettings({ pinHash: '' })}>PIN entfernen</button>}
        </div>
      )}
    </section>
  );
}
