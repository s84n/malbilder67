# 🖍️ Malbilder

Stand, Entscheidungen und nächste Schritte: [PLAN.md](PLAN.md)

Eine kindgerechte PWA zum Aussuchen und Drucken von Ausmalbildern – am Tablet oder Smartphone,
komplett ohne Lesen: große bunte Bild-Kacheln, ein riesiger Drucken-Knopf, A4 in Schwarzweiß.

Die Bilder werden **vorab lokal** mit [Fooocus](https://github.com/lllyasviel/Fooocus) (SDXL) erzeugt,
automatisch gefiltert, von Eltern freigegeben und als statische Seite auf GitHub Pages veröffentlicht.

```
catalog/*.yaml ─expand─▶ Jobs (SQLite) ─generate (Fooocus)─▶ Rohbilder
  ─postprocess + Auto-Filter─▶ A4-Druckseiten ─Review (Eltern)─▶ freigegeben
  ─build─▶ app/public ─git push─▶ GitHub Actions ─▶ GitHub Pages (PWA)
```

## Für Kinder (und Eltern) – die App

- **Hauptmenü → Unterkategorie → Motiv → Bild**, z. B. Tiere → Dinos → Ankylosaurus
- **3 Schwierigkeitsstufen** pro Motiv, als 1–3 Buntstifte dargestellt (Klein 3–5 J., Mittel 5–8 J., Groß 8+)
- **Drucken**: öffnet den System-Druckdialog (AirPrint auf iPad/iPhone, Mopria/Standard-Druckdienst auf Android).
  Beim ersten Mal den WLAN-Drucker, A4 und Schwarzweiß wählen – das Gerät merkt sich das.
- **Meine Lieblinge**: Herz-Favoriten und „Zuletzt gedruckt“ (lokal auf dem Gerät)
- **Eltern-Bereich** (Schloss oben rechts, Freischaltung per Rechenaufgabe): Standard-Stufe, Tages-Drucklimit,
  Kategorien ausblenden, Beschriftungen, Verlauf löschen, Ersatz-Druckweg „Bild öffnen“
- **Offline-fähig** und installierbar: im Browser „Zum Home-Bildschirm“ wählen

## Bilder erzeugen

Voraussetzungen: Fooocus 2.5.5 unter `~/Fooocus` (sonst `FOOOCUS_DIR` setzen), NVIDIA-GPU, Python 3, Node 24.

```bash
make setup        # Projekt-venv + npm-Pakete
make expand       # Katalog → Jobs (idempotent)
make icons        # bunte Menü-Icons rendern (~25 min)
make generate     # alle Malbilder rendern (~3–4 h für ~1.150 Seiten auf einer RTX 4080)
make review       # http://localhost:8765 – J freigeben, N verwerfen, R neu rendern, U rückgängig
make build        # Freigegebenes nach app/public übernehmen
git add -A && git commit -m "Neue Bilder" && git push   # → automatischer Deploy
```

`make generate` kann jederzeit mit Strg+C abgebrochen werden und macht beim nächsten Start weiter.
Rendern und Review können parallel laufen.

Zum lokalen Ausprobieren: `make preview && make dev` (nimmt auch ungeprüfte Bilder auf – so nicht committen,
vorher `make build` ausführen).

### Neue Motive hinzufügen

1. In `catalog/categories/*.yaml` ein Motiv ergänzen (deutsches Label, englisches `subject`, optional eigene `scenes`)
   oder eine neue Kategorie-Datei anlegen
   (optional `variation`: eigene Liste statt Blickwinkel/Posen, auch je Stufe als `{klein: [...], default: [...]}` – siehe Mandalas)
2. `make expand && make generate && make review && make build`

Nur neue Jobs werden gerendert. Prompts, Stufen, Negativ-Prompt, Modell und Filter-Schwellwerte stehen in
`catalog/styles.yaml`. Nach Änderungen an den Schwellwerten wendet `make reprocess` den Auto-Filter neu an.

### Wie die Pipeline arbeitet

| Schritt | Datei | Was passiert |
|---|---|---|
| Katalog | `catalog/` | 12 Kategorien, ~130 Motive, je 3 Stufen × 3 Varianten |
| Jobs | `pipeline/expand.py` | Deterministische IDs und Seeds, Status in `work/state.sqlite` |
| Rendern | `pipeline/fooocus_adapter.py` | Startet Fooocus ohne Web-UI und reicht Tasks direkt an dessen Worker (832×1216, Styles/Prompt-Expansion aus) |
| Aufbereiten | `pipeline/postprocess.py` | Zuschneiden, auf A4 @ 300 dpi skalieren, binarisieren, Krümel entfernen → 1-Bit-PNG (~100 KB) + WebP-Vorschau |
| Auto-Filter | `pipeline/postprocess.py` | Verwirft leere Bilder, Schwarzflächen, Graustufen-Schattierung, Rauschen – und rendert mit neuem Seed (max. 4 Versuche) |
| Review | `pipeline/review/` | Lokale Seite für die Freigabe durch Eltern |
| Build | `pipeline/build.py` | Kopiert Freigegebenes nach `app/public/img`, schreibt `catalog.json` und die App-Icons |

`work/` (Rohbilder, Datenbank) ist nicht im Repo.

## App entwickeln

```bash
cd app
npm run dev       # http://localhost:5173/malbilder67/ (auch im WLAN erreichbar)
npm run build     # Produktions-Build nach app/dist
```

Vite + Preact + TypeScript, `vite-plugin-pwa` für Manifest und Service Worker, Hash-Routing.
`.github/workflows/pages.yml` baut und veröffentlicht bei jedem Push auf `main`.
In den Repo-Einstellungen unter **Pages → Source** einmalig **GitHub Actions** wählen.

## Hinweis zu den Bildern

Alle Malbilder und Icons sind KI-generiert (Stable Diffusion XL, Checkpoint Juggernaut XL v8) und
für die private, nicht-kommerzielle Nutzung gedacht. Es werden keine Rechte an den Bildern beansprucht.
Vor einer kommerziellen Nutzung die Lizenz des verwendeten Modells prüfen.
