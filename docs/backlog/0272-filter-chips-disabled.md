# 0272 · Zählzeile eines Durchgangs — `FilterChips` mit leerer, gesperrter Option

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` — Erweiterung von `FilterChips` (`primitives/Nav.tsx`), dazu eine Seitenaufgabe |
| Klassen-Test | ja: Eine Liste von Policen nach Zustand („Offen 4 · In Prüfung 0 · Abgelehnt 2“) braucht dieselbe Zeile |
| Quelle | Owner 2026-11-27 (Simon über plugin-mananger, Feedback zu den Entwürfen 17e044a): „Oben eine Übersicht mit Zahlen … die Mandanten mit Problemen oben“; Seitenprofil `docs/seiten/duo-connect.md`, Nachtrag 2, Zeile A8/A13; Entwurf `src/showcase/duo-connect/drafts.tsx` `CountLine` (Kennzeichen „ohne Spec“) |
| Ersetzt | im Set nichts; in den Entwürfen den Stellvertreter `CountLine` |
| Blockiert | Plugin: A8 (Durchgang läuft), A13 (Ergebnis Durchgang) |
| Spec von / am | Claude (designsystem), 2026-11-27 |

## Ziel

Im Durchgang über 140 Mandanten will die Mitarbeiterin auf einen Blick
sehen, wie viele Mandanten in welchem Zustand sind, und mit einem Klick nur
die mit Problemen sehen. Die Zeile zählt je Zustand der Achse `duo_sync`
und filtert die Liste darunter. Sie springt nie: Ein Zustand mit 0 bleibt an
seinem Platz, grau und nicht klickbar.

## Einordnung

- **§3 Regel 2 greift.** `FilterChips` (`@when` „Narrowing down by
  dimension, above the card“) trägt Wort, Zahl, aktive Option und den Klick
  schon. Es fehlt genau eins: eine Option, die da ist, aber nicht wählbar,
  weil sie nichts übrig ließe. Das ist eine Designentscheidung, die
  wiederkommt (jede Zustandszeile mit Nullen) und sich im `@when` in einem
  Halbsatz sagen lässt. Deshalb **eine** Prop an der Option, kein neuer
  Baustein.
- Verworfen: Nullen ausblenden. Dann rückt die Zeile bei jedem Wechsel, und
  „Abgebrochen 0“ ist selbst eine Auskunft („nichts abgebrochen“).
- Verworfen: `Segmented` (gleiche Daten, andere Ordnung) und `Tabs`
  (Sichten mit eigener Form) — die Zustände sind überschneidungsfreie
  Teilmengen derselben Liste, also ein Filter (R9).
- Die Wörter kommen aus der Registry (`STATUS_REGISTRY.duo_sync`, gespiegelt
  seit 93e2791), keine lokale Liste. Die Reihenfolge ist Sache der Seite
  (Aufmerksamkeit zuerst), nicht der Registry.

## Schnittstelle

Neu an `ChipOption`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `disabled` | `boolean` | nein | Option steht an ihrem Platz, ist aber nicht wählbar: grau, ohne Hover, `disabled` am Knopf bzw. ohne `href` beim Link; eine aktive Option wird nie gesperrt | `FilterChipsDisabled` |

Alles andere an `FilterChips` bleibt (`label`, `options`, `active`,
`onPick`, `count`, `icon`, `href`).

**Seitenaufgabe Zählzeile** (Plugin, A8/A13; Story `StateCountLine`):

| Teil | Belegung |
|---|---|
| `label` | „Stand“ |
| erste Option | `all` „Alle“ mit der Gesamtzahl |
| weitere Optionen, feste Reihenfolge | `succeeded_with_issues` · `cancelled` · `running` · `queued` · `succeeded` · `skipped`; `label` aus `STATUS_REGISTRY.duo_sync[key].label`; `count` gezählt aus der Liste selbst (I12); `disabled: count === 0 && active !== key` |
| `icon` | das Zeichen der Stufe, wie es der `StatusBadge` derselben Zeile zeigt — nie ohne Wort |
| Liste darunter | Gruppe „Mit Problemen“ (`succeeded_with_issues`, `cancelled`) zuerst, dann „Alle übrigen“ in fester Reihenfolge; die Gruppenköpfe nennen ihre Zahl |

## Verhalten

- Gesperrte Option: `disabled` am `button` (nicht fokussierbar, keine
  Tastaturfalle), Text in `--color-text-subtle` (Kontrast der Zahl bleibt
  ≥ 4,5:1 gegen den Grund, gemessen), kein Hover. Als Link: `span` statt
  `a`, damit nichts klickbar aussieht, was nicht klickt.
- Fällt die Zahl einer aktiven Option auf 0 (der letzte abgebrochene
  Mandant wurde erneut abgeglichen), bleibt sie aktiv und wählbar, die Liste
  zeigt „leer nach Filter“ mit dem Weg zurück — sonst säße die Nutzerin in
  einem Filter fest, den sie nicht lösen kann.
- Die Zahlen ändern sich während des Durchgangs; die Zeile wird **nicht**
  angesagt (die Seite sagt den Wechsel des Mandanten an, 0265).
- Schmal (L1): Die Chips brechen um, die Reihenfolge bleibt.

## Stories

| Story | Beweist |
|---|---|
| `FilterChipsDisabled` | eine Zeile mit gesperrten Optionen neben wählbaren und einer aktiven mit 0 |
| `StateCountLine` | die Zählzeile der Seitenaufgabe über einer Liste mit 12 Mandanten, Klick filtert, Gruppen „Mit Problemen“/„Alle übrigen“ (in `Nav.stories.tsx`, Daten aus dem Showcase) |

Ausgeschlossen: leer (eine Zeile ohne Optionen gibt es nicht), lädt und
Fehler (die Zeile zählt, was die Liste hat; lädt die Liste, gibt es keine
Zahlen — Sache der Liste).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Grund für eine gesperrte Option als Tooltip | `disabledReason?: string` an `ChipOption` | eine Option ist aus einem anderen Grund als „0“ gesperrt |

## Offene Fragen

1. Erste Option „Alle“ mit Gesamtzahl — oder ohne „Alle“ und Abwählen durch
   zweiten Klick (wie im Entwurf)? **Ohne Antwort:** mit „Alle“, wie jede
   `FilterChips`-Zeile im Set; ein zweiter Klick als einziger Weg zurück
   wäre nicht lernbar.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `disabled` an einer Option: `button[disabled]`, nicht per Tab erreichbar, kein Hover-Wechsel, Kontrast der Zahl ≥ 4,5:1 gemessen (`FilterChipsDisabled`)
- [ ] Eine aktive Option mit 0 bleibt wählbar (`FilterChipsDisabled`)
- [ ] Bestehende Aufrufer von `FilterChips` (10 Stellen im Set) unverändert: Bildvergleich ihrer Stories ≤ 0,5 %
- [ ] `StateCountLine`: Wörter aus `STATUS_REGISTRY.duo_sync`, keine lokale Liste; Reihenfolge wie in der Seitenaufgabe; Klick filtert, „Alle“ hebt auf, „x von y“ steht über der Liste
- [ ] Der Entwurf `CountLine` in `src/showcase/duo-connect/` ist durch `FilterChips` ersetzt, Kennzeichen „ohne Spec“ entfällt

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |
