# 0203 · `ProcessStepper` im Kopf: ohne Rohzustände, nicht über die volle Breite

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-25; fremde Abnahme 2026-09-27 nicht bestanden (ein Mangel: fehlgeschlagene Phase nur über Farbe, siehe unten) |
| Stufe | `patterns/` (Änderung an `Process.tsx`, Familie Process) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: ein Vorgang mit Phasen, dessen Kopf zeigt, wo er steht (wie 0137) |
| Quelle | Owner-Befund zur Stapel-Detailseite über ll-cto2 (2026-09-25): „der Balken muss nicht die volle Breite einnehmen, technische Zwischenzustände nicht anzeigen" · Seitenprofil `docs/seiten/stapel-detail.md` (Zweifel 3) |
| Ersetzt | nichts — ändert die Darstellung an der einen App-Stelle `datev-export/ui/StapelDetailScreen.tsx:292` |
| Blockiert | den Kopf der Stapel-Detailseite (`EntityHeader process`, Seitenprofil stapel-detail) |
| Spec von / am | Claude, 2026-09-25 |

## Ziel

Die Sachbearbeiterin sieht im Kopf eines Stapels, in welcher der vier Phasen
er steht und wer dran ist. Heute steht unter jeder Phase zusätzlich die Liste
der Rohzustände (`agent · prepared`, `ready · exporting · inspection · failed`).
Das sind Datenbankwerte, und die sind nach T4 nur in der Technik-Sicht erlaubt.
Außerdem streckt sich das Bild über die ganze Kopfbreite (`flex: 1` je Phase):
bei 1280 px wird eine Phase über 250 px breit, obwohl ein Wort darin steht. Nach
der Änderung zeigt das Bild je Phase Name, wer darin arbeitet und den
Staffelstab. Jede Phase ist gleich breit, das Bild endet dort, wo sein Inhalt
endet.

## Einordnung

- **Wiederverwenden:** `ProcessStepper` (`@when` „Process state in the detail
  header with raw states and loops") deckt den Fall bis auf die Rohzustände und
  die Breite. `ProcessMini` (Listenzeile, nur Punkte) reicht nicht: ohne Wörter
  besteht es den Vier-Wochen-Test im Kopf nicht.
- **Geändert statt erweitert, weil** die Rohzustände im Kopf **immer** gegen T4
  verstoßen. Ein Schalter `showRawStates` hätte keinen Aufrufer, der ihn
  einschaltet; der Zustand selbst ist über `StatusBadge` → (i) →
  `StatusInfoDialog` erreichbar. Regel §3.2, ohne neue Prop: eine Zeile fällt
  weg und eine CSS-Regel ändert sich.
- **Zuschnitt:** bleibt in `Process.tsx`; `ProcessPhase.states` bleibt im Typ
  (die App liefert ihn, `batchPhaseProgress()`), der Stepper liest ihn nicht mehr.
- **Setzt auf:** `Baton`, `ActionIcon`, `Link` wie bisher.
- **Die Phasenliste gehört der App-Domain** (`BATCH_PHASES`), nicht dem Set
  (0137: „der Kopf rechnet nichts"). Gröber wird die Kette dort.

## Schnittstelle

Keine Prop ändert sich. Geändert wird die Darstellung:

| Was | vorher | nachher | Nachweis (Story) |
|---|---|---|---|
| Zeile `.raw` je Phase | `p.states.join(" · ")` | entfällt | `InHeader`, `Failed` |
| Breite je Phase | `flex: 1` (füllt den Kopf) | feste Spalte `--pz-phase` (komponentenlokal, wie `--v3period-col` in 0162), Bild so breit wie seine Phasen | `InHeader` bei 1280 px |
| `@when` | „… with raw states and loops" | „Process state in the detail header — phases, owner, loops." | — |
| Kopfkommentar `Process.tsx:14` | „with raw states, owner, loops" | „with owner and loops" | — |

`--pz-phase`: Vorschlag `10rem` (160 px). Das längste Phasenwort („Übertragen",
„Angekommen") passt samt Staffelstab („Mandant (wartet)") hinein. Vier Phasen
ergeben 640 px, der Rest der Kopfbreite bleibt frei.

Was der Stepper **nicht** kann (bewusst): Rohzustände zeigen (→ `StatusBadge` (i),
Reiter Technik) und Phasen selbst bündeln (→ App-Domain).

## Verhalten

Keine Interaktion außer dem Link auf die Schleifen (`logHref`), unverändert.
Server-tauglich wie bisher. Bricht bei 200 % Zoom oder schmaler Kopfbreite
um: `flex-wrap: wrap`, die Phasen behalten ihre Breite und laufen in eine
zweite Zeile, statt zu schrumpfen.

## Stories

Die bestehenden Stories in `Process.stories.tsx` reichen, sie werden nur neu
angesehen. Mindestens vier für ein Pattern:

| Story | Beweist |
|---|---|
| `InHeader` | vier Phasen, aktive mit Staffelstab, ohne Rohzustände, Breite 4 × `--pz-phase` |
| `Failed` | fehlgeschlagene Phase rot, mit Wort, ohne Rohzustände |
| `Empty` | unverändert |
| `EntityHeader` › Story mit `process` (0137) | im Einsatz: Kopf eines Stapels bei 1280 px, das Bild links, keine gestreckten Phasen |

Nicht anwendbar: lädt und Fehler beim Laden gehören dem Kopf, nicht dem Bild;
„leer nach Filter" gibt es nicht.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zeit seit Eintritt je Phase auch in der aktiven Phase | `phaseSince` (vorhanden) | die App liefert `phaseSince` für den Stapel |
| mehr als fünf Phasen | keine — Umbruch reicht | eine Kette mit sechs Phasen wird gebaut (Onboarding?) |

## Offene Fragen

1. **Breite 160 px fest oder nach Inhalt?** Ohne Antwort: fest (`--pz-phase`
   `10rem`). Gleich breite Phasen lesen sich als Folge, eine Phase nach Inhalt
   springt je Zustand (Staffelstab kommt und geht).
2. **Die Zeile „wer arbeitet" (`sub`) bleibt?** Ohne Antwort: ja. Die App
   liefert dort heute „Agent ⇄ bereit", „Bridge → DATEV" mit Pfeilen als
   Bedeutungsträgern (T9) → Befund L-347; sie soll Wörter liefern
   („Agent", „Kanzlei", „DATEV", „Spiegel und Nachlese").

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

- [ ] Kein `.raw` mehr im DOM des Steppers (`InHeader`, `Failed`, gemessen)
- [ ] Breite je Phase = `--pz-phase`, gemessen bei 1280 px; das Bild füllt den Kopf nicht
- [ ] Bei 200 % Zoom bricht das Bild um, statt Phasen zu stauchen oder waagrecht zu scrollen
- [ ] `@when` und Kopfkommentar nennen keine Rohzustände mehr
- [ ] Staffelstab und Schleifen-Link unverändert (Story `InHeader` mit `loops`)

## Abnahme

Eigene Messung (Bauer, keine fremde Abnahme), 2026-09-25:

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| kein `.raw` im DOM | `v3-patterns-rahmen-entityheader--with-process`: `querySelectorAll('.pz-stepper .raw').length` = 0 | ✓ |
| Breite je Phase = `--pz-phase` | bei 1280 px: 160 · 160 · 160 · 160 px; die Linie endet nach 640 px, Kopf 940 px | ✓ |
| Umbruch statt Stauchen | Viewport 640 px (entspricht 200 % Zoom bei 1280): drei Phasen in Zeile 1, die vierte in Zeile 2, je 160 px; keine waagrechte Scrollleiste | ✓ |
| `@when` und Kopfkommentar ohne Rohzustände | `Process.tsx` | ✓ |
| Staffelstab und Schleifen-Link unverändert | `WithProcess`: Baton „Kanzlei" in „Prüfen", „2× zurück an den Agenten · 1× neuer Beleg" | ✓ |
| `pnpm typecheck`, `pnpm build` | grün | ✓ |

Offene Fragen mit Default entschieden: feste 160 px (`10rem`), `sub` bleibt (L-347 an die App).
Fremde Abnahme, 2026-09-27 (Storybook :6107, Playwright, Viewport 1280 × 900 und 640 × 900; Kontrast aus `getComputedStyle` gegen den ersten deckenden Hintergrund):

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` | beide am Stand `2063c21` ausgeführt: tsc ohne Fehler, „Storybook build completed successfully" | ✓ |
| Datei nach Familie, Story daneben, Titel | `patterns/Process.tsx` + `Process.stories.tsx`, Titel `v3/Patterns/Prozess/Process` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `git show 5ba915c`: alle angefassten Kommentare, JSDoc und die Story-Beschreibung von `InHeader` englisch; `@when`/`@instead` an `ProcessStepper` vorhanden, stimmt mit dem Code (keine `.raw`-Zeile mehr). Unberührt deutsch geblieben: Abschnittskopf `v3.css` „Stepper: vier Phasen im Detail-Kopf", Story-Kommentare „Im Detail-Header…"/„In der Listenzeile…" und Literal-Schlüssel `mandant`, `bereit`, `spiegel`, `niemand` in `Process.stories.tsx` — nicht Teil von 0203, Nebenbefund | ✓ |
| Kein Hex, kein px, keine Label-Map | Diff: kein Hex; neue Werte `10rem`, `var(--space-3)`; px nur in `v3.css` (erlaubt) und dort unverändert | ✓ |
| Alle Stories vorhanden, Ausschlüsse begründet | `…process--in-header`, `…--failed`, `…--empty`, `v3-patterns-rahmen-entityheader--with-process` rendern; lädt/Fehler/leer nach Filter in der Spec begründet | ✓ |
| Prüfliste §9 | V7 „jeder farbige Zustand hat Wort oder Icon" verletzt, siehe Mangel 1 | ✗ |
| Im Browser angesehen | Screenshots `.playwright-mcp/0203-inheader-1280.png`, `0203-failed-1280.png`, `0203-entityheader-640.png` | ✓ |
| Kein `.raw` im DOM | `querySelectorAll('.pz-stepper .raw').length` = 0 in `in-header`, `failed`, `empty`, `with-process`; kein Rohwert (`queued`, `review`, `exporting` …) als Text im Stepper | ✓ |
| Breite je Phase = `--pz-phase`, Bild füllt den Kopf nicht | 1280: `--pz-phase` = `10rem`, Phasen 160 · 160 · 160 · 160 px; `with-process`: Linie endet bei 640 px, Kopf (`.v2ehead__process`) 898 px | ✓ |
| Umbruch bei 200 % Zoom | Viewport 640: `in-header` und `with-process` je Phasen bei x = 0/160/320 in Zeile 1, vierte bei (0, 92), alle 160 px, kein Inhalt läuft über; `scrollWidth` = 640, kein Element mit waagrechtem Scroll | ✓ |
| `@when` und Kopfkommentar ohne Rohzustände | `Process.tsx:14` „with owner and loops"; `@when` „phases, owner, loops. Raw states stay out …" | ✓ |
| Staffelstab und Schleifen-Link unverändert | `in-header`: Baton „Kanzlei" in „Prüfen", Link `href="#"` „2× zurück an den Agenten · 1× neuer Beleg"; `with-process`: dieselben Texte (ohne `logHref`, kein Link); Code dieser Zeilen im Diff unberührt | ✓ |
| Kontrast der Phasentexte | `in-header`: `.phase` aktiv/erledigt 10,75:1, ausstehend 4,51:1, `.who` 4,51:1; `failed`: `.phase` 5,60:1; `with-process` (weiße Karte): 11,64 / 4,88 / 4,88 | ✓ (ausstehend knapp über 4,5) |
| Kein anderer Aufrufer erwartet Rohzustände | `grep` `\.raw`, `pz-stepper` in `src/`: nur `Process.tsx` und `v3.css`; `StateMachine.stories.tsx` (`InUse`) übergibt `states`, liest sie nicht | ✓ |

**Mangel 1 (blockiert):** In `…--failed` unterscheidet sich die fehlgeschlagene
Phase von der aktiven nur durch Farbe: roter Balken, rotes Phasenwort
„Übergeben", roter Staffelstab. Der Staffelstab trägt das Owner-Icon
(`lucide-share-2`) und das Owner-Wort „Übertragung", kein Wort und kein Zeichen
für „fehlgeschlagen"; `aria-label`/`title` fehlen. Die Spec verspricht für
`Failed` „rot, mit Wort" (§ Stories), §9 V7 und CLAUDE.md („Farbe niemals
allein") verlangen es. In der App trug bisher die Rohzeile (`… · failed`) als
einziges Element das Wort — mit ihrem Wegfall bleibt dort nur die Farbe.
Vorschlag an den Bauer: in der Phase mit `status="failed"` eine Zeile mit dem
Wort aus der Registry (oder dem Alarm-Icon aus `ACTION_ICON`/Registry plus Wort),
dann `Failed` neu messen.

**Nebenbefunde (blockieren 0203 nicht, gehören nicht zu dieser Änderung):**
- Schleifen-Link in `in-header` ist 275 × 14,5 px hoch — unter der Hausregel
  24 × 24 (§9, WCAG 2.5.8 wäre durch den Abstand erfüllt, da einziges Ziel). Vorbestehend.
- App `batch-review/ui/Step9.tsx` nutzt die Klasse `.pz-stepper` direkt, ohne
  `ProcessStepper`, und schreibt dort Rohzustände als Phasenwort (T4). Sie erbt
  jetzt die festen 160-px-Spalten. Befund für die App, nicht für das Set.

Abgenommen von / am: fremder Abnahme-Agent, 2026-09-27 · Ergebnis: nicht bestanden (Mangel 1) · Offene Punkte: Mangel 1; L-347 in der App

**Nacharbeit 2026-09-27 (Bauer), zur Nachprüfung:** V7 — die fehlgeschlagene Phase trägt jetzt eine eigene Zeile `StateIcon error` + „Fehler" (Wort aus `LEVEL_ICON`, keine neue Vokabel), Farbe `--color-danger`, gemessen 5,6:1 auf dem Seitengrund (Story `Failed`). Nebenbefunde des Abnehmers: Schleifen-Link 14,5 px hoch (älter als 0203, Hausregel 24 px) → offen im Set; App `batch-review/ui/Step9.tsx` nutzt `.pz-stepper` direkt mit Rohzuständen → L-348.
