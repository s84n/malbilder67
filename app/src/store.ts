import { useEffect, useState } from 'preact/hooks';

export interface Settings {
  level: string;            // 'all' oder Stufen-ID als Standardfilter
  hidden: string[];         // ausgeblendete Kategorie-IDs („tiere“) und Unterkategorien („tiere/dinos“)
  hiddenLevels: string[];   // ausgeblendete Altersstufen
  pinHash: string;          // SHA-256 der Eltern-PIN, leer = Rechenaufgabe
  dailyLimit: number;       // 0 = unbegrenzt
  showLabels: boolean;
  printFallback: boolean;   // zusätzlicher „Bild öffnen“-Knopf, falls Drucken im Gerät hakt
}

interface State {
  settings: Settings;
  favorites: string[];      // Bild-IDs
  recent: string[];         // zuletzt gedruckt, neueste zuerst
  printsDay: string;        // Datum des Zählers (YYYY-MM-DD)
  printsToday: number;
}

const KEY = 'malbilder:v1';
const defaults: State = {
  settings: { level: 'all', hidden: [], hiddenLevels: [], pinHash: '', dailyLimit: 0, showLabels: true, printFallback: false },
  favorites: [],
  recent: [],
  printsDay: '',
  printsToday: 0,
};

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { ...defaults, ...s, settings: { ...defaults.settings, ...s.settings } };
    }
  } catch { /* privater Modus o.ä. – mit Standardwerten weiter */ }
  return structuredClone(defaults);
}

let state = read();
const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignorieren */ }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return state;
}

const today = () => new Date().toISOString().slice(0, 10);

export const actions = {
  toggleFavorite(id: string) {
    const has = state.favorites.includes(id);
    commit({ ...state, favorites: has ? state.favorites.filter((f) => f !== id) : [id, ...state.favorites] });
  },
  updateSettings(patch: Partial<Settings>) {
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },
  printsLeft(): number {
    const used = state.printsDay === today() ? state.printsToday : 0;
    return state.settings.dailyLimit ? Math.max(state.settings.dailyLimit - used, 0) : Infinity;
  },
  printsUsedToday(): number {
    return state.printsDay === today() ? state.printsToday : 0;
  },
  recordPrint(id: string) {
    const used = actions.printsUsedToday();
    commit({
      ...state,
      recent: [id, ...state.recent.filter((r) => r !== id)].slice(0, 30),
      printsDay: today(),
      printsToday: used + 1,
    });
  },
  resetPrintCounter() { commit({ ...state, printsDay: today(), printsToday: 0 }); },
  clearHistory() { commit({ ...state, recent: [] }); },
  clearFavorites() { commit({ ...state, favorites: [] }); },
  resetAll() { commit(structuredClone(defaults)); },
};
