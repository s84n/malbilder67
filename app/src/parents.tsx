import { useMemo, useState } from 'preact/hooks';
import { go } from './router';
import { actions, useStore } from './store';
import { BackIcon } from './icons';
import type { Catalog } from './types';

/** Eltern-Bereich, geschützt durch eine Rechenaufgabe, die kleine Kinder nicht lösen. */
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
  const [a, b] = useMemo(() => [3 + Math.floor(Math.random() * 7), 4 + Math.floor(Math.random() * 6)], []);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const press = (d: string) => {
    const next = (input + d).slice(0, 3);
    setInput(next);
    setWrong(false);
    if (Number(next) === a * b) onOk();
    else if (next.length >= String(a * b).length) { setWrong(true); setTimeout(() => setInput(''), 600); }
  };
  return (
    <main class="gate">
      <p class="gate-q">Wie viel ist {a} × {b}?</p>
      <div class={`gate-input ${wrong ? 'wrong' : ''}`}>{input || ' '}</div>
      <div class="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k) =>
          k === '' ? <span key="blank" /> : (
            <button key={k} onClick={() => (k === '⌫' ? setInput(input.slice(0, -1)) : press(k))}>{k}</button>
          ))}
      </div>
    </main>
  );
}

function Settings({ catalog }: { catalog: Catalog }) {
  const { settings, favorites, recent } = useStore();
  const used = actions.printsUsedToday();
  const total = catalog.categories.reduce((n, c) => n + c.subcategories.reduce((m, s) => m + s.motifs.reduce((k, mo) => k + mo.images.length, 0), 0), 0);
  const toggleHidden = (id: string) =>
    actions.updateSettings({ hidden: settings.hidden.includes(id) ? settings.hidden.filter((h) => h !== id) : [...settings.hidden, id] });

  return (
    <main class="settings">
      <section>
        <h2>Schwierigkeit</h2>
        <p class="hint">Welche Stufe in der Bildauswahl zuerst angezeigt wird.</p>
        <div class="seg">
          {[{ id: 'all', label: 'Alle', age: '' }, ...catalog.levels].map((l) => (
            <button key={l.id} class={settings.level === l.id ? 'active' : ''} onClick={() => actions.updateSettings({ level: l.id })}>
              {l.label}{l.age && <small> {l.age} J.</small>}
            </button>
          ))}
        </div>
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

      <section>
        <h2>Kategorien</h2>
        <p class="hint">Ausgeblendete Kategorien erscheinen nicht im Hauptmenü.</p>
        {catalog.categories.map((c) => (
          <label class="row" key={c.id}>
            <span>{c.label}</span>
            <input type="checkbox" checked={!settings.hidden.includes(c.id)} onChange={() => toggleHidden(c.id)} />
          </label>
        ))}
      </section>

      <section>
        <h2>Verlauf</h2>
        <div class="row"><span>{favorites.length} Favoriten</span><button class="small" onClick={() => actions.clearFavorites()}>Löschen</button></div>
        <div class="row"><span>{recent.length} zuletzt gedruckt</span><button class="small" onClick={() => actions.clearHistory()}>Löschen</button></div>
      </section>

      <p class="hint center">Alle Bilder sind KI-generiert (Stable Diffusion XL / Juggernaut XL) – private, nicht-kommerzielle Nutzung, es werden keine Rechte beansprucht.</p>
      <p class="hint center">{total} Malbilder · Stand {new Date(catalog.version * 1000).toLocaleDateString('de-DE')}</p>
    </main>
  );
}
