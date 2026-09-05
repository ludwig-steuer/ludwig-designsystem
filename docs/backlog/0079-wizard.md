# 0079 · Wizard — der Rahmen eines Ablaufs in nummerierten Schritten

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` — Gruppe Rahmen (neben `StepRail`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald es dort einen Schrittprozess gibt; kennt „Schritt", keine Entität |
| Quelle | Soll-Katalog §11.7 Stufe 2 „Wizard (Schritte, Zurück/Weiter, Zusammenfassung) → heben" · `docs/v3-backlog.md` („Offen bleiben `Assistent` (Wizard) …") · `ludwig/app` `F147-luecken-fuer-design-agent.md` §4 Nr. 20 |
| Ersetzt | `ui/components/wizard/Wizard.tsx` (71 Z.) mit fünf lebenden Aufrufern: `CsvImportWizard`, `DatevMetaImportPanel`, `OnboardingWizard`, `OnboardingReviewSteps`, `DatevExportWizard` (über Schritt 9 der Stapelabnahme). Der sechste (`settings/components/page.tsx`) ist Rückbau (F111 B2). Dazu die Regeln `.wz*` in `src/styles/components.css` |
| Blockiert | Welle 2 (`documents/datev-import`, Stapelabnahme Schritt 9), Welle 3 (`configuration/bankkonten/import`, Admin-Onboarding) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Ein Ablauf mit mehreren Schritten — Import, Export, Onboarding — zeigt, wo
man steht, was erledigt ist und was fehlgeschlagen ist; darunter der Inhalt
des Schritts, darunter Zurück und Weiter. Die App hat dafür heute genau
diese Hülle in v1, mit drei Hex-Literalen, einem `text-transform: uppercase`
auf „Schritt n" (A2) und einem Fehlerzustand, der nur Farbe ist (V7). Die
Abläufe selbst — welcher Schritt, was passiert beim Weiter — bleiben in den
Modulen; hierher kommt nur die Hülle. Der Baustein wird mit dem Skill
`aus-app-holen` geholt und dabei auf die Hausregeln gezogen.

## Einordnung

- **Wiederverwenden:** `StepRail` („Multi-step review with a traffic light and
  counter per step, on the left") ist der Rahmen einer Prüfung, in der jeder
  Schritt jederzeit erreichbar ist — ein Wizard ist linear, die Schritte
  stehen oben, erreichbar nur rückwärts über den Fuß. `ProcessStepper` zeigt
  Phasen, die das System durchläuft, nicht Schritte, die ein Mensch geht.
  `Tabs` sind zwei bis vier Sichten, keine Reihenfolge. `ProgressBar` aus
  `StepRail` könnte „Schritt 2 von 4" tragen, nicht die nummerierten Schritte
  mit Zustand.
- **Neu, weil:** `spec-schreiben` §3 Regel 3 — kein `@when` passt, fünf
  Verwendungen heute, und die Hülle ist nicht in ~15 Zeilen an der
  Aufrufstelle zu komponieren. Pattern statt Primitive nach §2, weil sie
  den Prozessbegriff „Schritt" trägt.
- **Zuschnitt:** eine Datei, ein Export plus die Typen `WizardStep` und
  `WizardStepState`. Die Schnittstelle bleibt **formgleich** mit v1, damit
  die fünf Aufrufer per Import-Tausch wandern (Etappe E1 der App). Die
  Typografie-Regeln für `h2` und `.sub` **im** Body kommen nicht mit — was
  im Schritt steht, ist Sache des Aufrufers.
- **Setzt auf:** nichts aus dem Set; Icons Lucide `Check` (erledigt) und
  `CircleAlert` (Fehler), Maß und Strich aus der Leiter (A8).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `steps` | `WizardStep[]` — `{ label: string }` | ja | Die Schritte in Reihenfolge; die Nummer ist Index + 1 | `Filled` |
| `current` | `number` | ja | 0-basiert; der Schritt bekommt `aria-current="step"` | `Filled` |
| `states` | `WizardStepState[]` — `pending` · `active` · `done` · `error` | ja | Zustand je Schritt, genau `steps.length` Einträge | `States` |
| `children` | `ReactNode` | ja | Der Inhalt des aktuellen Schritts | `Filled` |
| `footer` | `ReactNode` | nein | Zurück/Weiter (`Button`), Fortschrittstext; ohne `footer` kein Fuß | `WithFooter` |

Keine Typen aus `src/ludwig/` — die Hülle trägt keine Fachdaten.
`WizardStepState` ist bewusst nicht `RailTone` (`open`/`blocked`/`dimmed`
sind Prüfbegriffe) und nicht `StateKind` (Prüfergebnisse): ein Schritt ist
offen, dran, erledigt oder gescheitert.

**Kann bewusst nicht:**

- **Den Schritt wechseln.** Kein `onStepClick` — ein Wizard ist linear,
  zurück geht über den Fuß. Siehe Ausbau.
- **Den Zustand ableiten.** Ob ein Schritt gescheitert ist, weiß der
  Aufrufer; die Hülle zeigt es nur.
- **Validieren oder zusammenfassen.** Eine Zusammenfassung ist ein Schritt
  wie jeder andere, sein Inhalt ist `children`.

## Verhalten

Server-Component: die Hülle hat keinen Zustand; die fünf Aufrufer sind
Client-Komponenten und geben `current` und `states`. Tastatur: nichts
Eigenes — die Knöpfe im Fuß sind `Button`s des Aufrufers, die Schritte oben
sind nicht fokussierbar, weil sie nicht klicken. Jeder Zustand hat Wort oder
Icon, nie nur Farbe (V7): `done` zeigt `Check` statt der Nummer, `error`
zeigt `CircleAlert` und färbt danger, `active` ist primary mit Nummer,
`pending` gedämpft mit Nummer. „Schritt n" steht in normaler Schreibung, nicht
in Versalien (A2). Lange Labels kürzen mit Ellipse, die Spalten sind gleich
breit.

Zustände leer, lädt, Fehler auf Ebene der Hülle gibt es nicht — ein Wizard
ohne Schritte ist ein Programmierfehler; „lädt" und „Fehler" gehören zum
Schritt (`states`) oder in `children`.

## Stories

Titel `v3/Patterns/Rahmen/Wizard` — die Spec schrieb „Frame", die Gruppen des
Baums sind deutsch (siehe Befund beim Bauen).

| Story | Beweist |
|---|---|
| `Filled` | Drei Schritte, der zweite aktiv, ein Formular als Inhalt |
| `States` | Alle vier Zustände in einer Leiste: erledigt, aktiv, gescheitert, offen — jeder mit Wort oder Icon |
| `WithFooter` | Fuß mit „Zurück" (secondary), „Weiter" (primary, `hotkey`) und Fortschrittstext „Schritt 2 von 4" |
| `ManySteps` | Rand: sieben Schritte mit langen Labels — Ellipse, gleiche Spalten, keine Umbrüche |
| `InUse` | Wie `CsvImportWizard`: Datei wählen → Vorschau → Ergebnis, mit `useState` im Story-Rahmen, damit Weiter und Zurück laufen |

Nicht anwendbare Zustände: leer, lädt, Fehler (Begründung im Verhalten).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zurückspringen über die Leiste | `onStepSelect?: (index: number) => void` — nur für erledigte Schritte | ein Aufrufer will zwei Schritte zurück statt zweimal „Zurück" |
| Ein Fortschrittstext, den alle gleich schreiben | `progress?: string` im Fuß | heute schreiben ihn zwei Aufrufer (`wz__progress`); beim dritten |
| `states` aus `steps[i].state` statt zweiter Liste | `steps: { label, state? }[]` | die fünf Aufrufer sind migriert und die Formgleichheit ist nicht mehr nötig |

## Befunde für `ludwig/app`

- **B1** — ~~`settings/components/page.tsx` nutzt den `Wizard` noch; die Seite
  ist Rückbau (F111 B2). Erst löschen, dann migrieren.~~ **Erledigt** (Seiten-
  Rückbau vom 2026-09-05): die Seite existiert nicht mehr, `find` über
  `apps/web/src` findet keinen Pfad `settings/components`. Damit ist die
  Vorbedingung des Kriteriums „offen (App)" erfüllt; es bleiben die fünf
  lebenden Aufrufer.
- **B2** — `OnboardingWizard.tsx` und `OnboardingReviewSteps.tsx` schreiben
  den Fortschrittstext mit der Klasse `wz__progress` direkt. Nach dem
  Umzug ist das Markup im `footer`-Slot; die Klasse gibt es dann nicht mehr.
- **B3** (Abnahme) — **Der Import-Tausch ist nicht überall ein Pfad-Tausch.**
  Zwei der fünf Aufrufer importieren direkt
  (`bank-transactions/ui/CsvImportWizard.tsx:4`,
  `source-docs/ui/DatevMetaImportPanel.tsx:6`), drei aber über das Barrel
  `@/ui/components` (`admin/ui/OnboardingWizard.tsx:4`,
  `admin/ui/OnboardingReviewSteps.tsx:3`,
  `datev-export/ui/DatevExportWizard.tsx:21`). Bei diesen dreien muss der
  Eintrag **im Barrel** umgehängt werden — sonst zieht der v1-`Wizard` still
  weiter mit, obwohl die Aufrufer unverändert aussehen.
- **B4** (Abnahme) — **Namenskollision auf `WizardStep`.**
  `bank-transactions/ui/CsvImportWizard.tsx:35` hält einen lokalen
  `type WizardStep = "select" | …`, also einen ganz anderen Typ als der
  gleichnamige Export des Sets (`{ label: string }`). Heute kollisionsfrei,
  weil die Datei nur `Wizard` und `type WizardStepState` importiert — beim
  Umzug eine Falle, sobald jemand `WizardStep` mit dazuholt. Vor dem Tausch
  den lokalen Typ umbenennen.

## Abnahmekriterien

Fest (gilt immer):

- [x] `pnpm typecheck` und `pnpm build` grün
- [x] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [x] Code englisch; `@when`/`@instead` an jedem Export
- [x] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [x] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [x] Prüfliste `design-guidelines.md` §9 durchgegangen (Kontrast: M1 in der ersten Runde gerissen, behoben und nachgemessen)
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] Formgleich: die fünf Aufrufer kompilieren mit geändertem Import-Pfad und sonst nichts (Nachweis: Prop-Namen und -Typen gegen `ui/components/wizard/Wizard.tsx` verglichen)
- [x] `current` trägt `aria-current="step"` (Story `Filled`)
- [x] `done` zeigt `Check`, `error` zeigt `CircleAlert` plus danger — nie Farbe allein (Story `States`)
- [x] „Schritt n" ohne `text-transform: uppercase` (Story `Filled`, A2)
- [x] `footer` fehlt → kein Fuß im DOM (Story `Filled` gegen `WithFooter`)
- [x] Stile in `v3.css` mit Tokens statt `#fff`/`#FAFBFC`/`rgba(…)`; Klassenpräfix vor dem Benennen gegrept (`v2wiz` ist frei); die `.wz*`-Regeln in `components.css` bleiben, bis die App den v1-`Wizard` gelöscht hat, und fallen dann
- [x] Geholt mit Skill `aus-app-holen` (Import-Closure: nur `lucide-react`)
- [ ] offen (App): ersetzt `ui/components/wizard/Wizard.tsx` in fünf Dateien; `settings/components` ist vorher gelöscht

## Abnahme

Abgenommen gegen diese Spec, nicht gegen den Chat: gelesen wurden
`src/ui/v3/patterns/Wizard.tsx`, `Wizard.stories.tsx`, der Abschnitt 0079 in
`src/styles/v3.css` und — nur lesend — `../app/apps/web/src/ui/components/wizard/Wizard.tsx`
samt den fünf Aufrufern. Storybook auf `http://localhost:6107`, Story-IDs aus
`index.json`.

**Story-Deckung.** Fünf Stories gefordert, fünf vorhanden und gebaut:
`…--filled`, `…--states`, `…--with-footer`, `…--many-steps`, `…--in-use`
(`curl -s localhost:6107/index.json` → alle unter Titel
`v3/Patterns/Rahmen/Wizard`). Jede Prop hat ihre Story: `steps`/`current`/
`children` → `Filled`, `states` → `States`, `footer` → `WithFooter`. Die drei
ausgeschlossenen Zustände (leer, lädt, Fehler) sind im Abschnitt „Verhalten"
begründet — ein Wizard ohne Schritte ist ein Programmierfehler, „lädt" und
„Fehler" gehören an `states` oder in `children`.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | Erste Runde: `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; `pnpm build` → „Storybook build completed successfully", `Vite ✓ built in 12.82s`. Nach der M1-Korrektur beide erneut gelaufen: Typecheck Exit 0, Build „Storybook build completed successfully", `Vite ✓ built in 9.37s`; nur die bekannte Chunk-Size-Warnung | ✓ |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/Wizard.tsx` + `Wizard.stories.tsx` daneben; Titel `v3/Patterns/Rahmen/Wizard` (`Wizard.stories.tsx:10`); „Rahmen" ist der Gruppen-Kommentar `src/ui/v3/index.ts:208`, unter dem der Export steht (`index.ts:218–222`) | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Props, Typen, Kommentare, Story-Exportnamen englisch; deutsch nur in sichtbaren Strings („Schritt n", Labels, `aria-label`). `@when`/`@instead` am Komponenten-Export `Wizard.tsx:43–45`. Die drei Typ-Exporte tragen keins — so wie `RailTone` (`StepRail.tsx:15`), `StateKind` (`Review.tsx:31`), `ListItem` (`MasterDetail.tsx:41`): die Regel gilt dem Bauteil, nicht dem Typ | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}|[0-9]+px" src/ui/v3/patterns/Wizard.tsx` → keine Treffer (v1 hatte `color: "#fff"` inline, `Wizard.tsx:53`). px nur in `v3.css` (§9 erlaubt „kein px **außerhalb** v2.css"), `size={14}` liegt auf der Icon-Leiter (zweithäufigstes Maß im Set). `STATE_ICON` (`Wizard.tsx:24–27`) ist keine Status-Label-Map, sondern das `aria-label` zweier Icons — die Registry führt Entitäts-Status (`status-registry.ts`), `WizardStepState` ist laut Spec bewusst kein `StateKind` | ✓ |
| **Fest** — alle Stories vorhanden; ausgeschlossene Zustände begründet | Siehe Story-Deckung oben | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe/Import abwärts ✓ (`patterns/`, importiert nur `lucide-react`+`react`). Kein Hex/px/Label-Map ✓. Nichts zentriert, `tnum` an Nummer (`v3.css:2698`) und Fortschritt (`WithFooter`: `font-variant-numeric: lining-nums tabular-nums`) ✓. Rot nur Fehler ✓. Jeder farbige Zustand mit Wort oder Icon (V7) ✓. Icons Lucide `strokeWidth 1.5`, `size 14` ✓ (v1: 2). Keine Versalien ✓. Rand **oder** Schatten: `boxShadow: "none"`, `border: 1px rgb(221,226,232)` ✓. Bewegung: keine, `prefers-reduced-motion` gegenstandslos ✓. Tastatur/Fokus: die Schritte sind nicht fokussierbar (per Spec), die Knöpfe gehören dem Aufrufer ✓. Kontrast: siehe eigene Zeile M1 | ✓ |
| **Fest** — Kontrast Text ≥ 4.5:1 (§9) — *war M1* | Erste Runde: „Schritt n" im Fehler-Schritt stand als `--color-text-subtle` `#717171` auf `--color-danger-bg` `#F4E6E5` = **4.02:1**. Behoben in `v3.css:2705–2709` (`.v2wiz__step[data-state="error"] .v2wiz__n { color: var(--color-danger); }`, mit Begründung im Kommentar). Zweite Runde, Story `v3-patterns-rahmen-wizard--states` im Browser nachgemessen — jetzt alle vier Zustände über der Schwelle: `done` „Schritt n" 4.71 · Wort 13.29 · Plakette 5.07 · `error` **4.99** · 4.99 · 6.06 · `active` 4.71 · 11.24 · 11.64 · `pending` 4.71 · 6.45 · 5.80. Die drei anderen Zustände sind unverändert (Regel greift nur auf `[data-state="error"]`) | ✓ |
| **Fest** — im Browser angesehen | Alle fünf Stories auf `localhost:6107` geöffnet und geprüft: `Filled` (kein Fuß, `aria-current`), `States` (vier Zustände nebeneinander), `WithFooter` (Zurück/Weiter/Fortschritt), `ManySteps` (Ellipse, gleiche Spalten), `InUse` (Zurück/Weiter wirklich laufend, siehe unten) | ✓ |
| **Variabel** — Formgleich: die fünf Aufrufer wandern über den Import-Pfad | Selbst verglichen gegen `../app/apps/web/src/ui/components/wizard/Wizard.tsx:4–19`: `WizardStepState` = `"pending"\|"active"\|"done"\|"error"` (v3 `Wizard.tsx:5` identisch), `WizardStep` = `{ label: string }` (`:7–10` identisch), und Prop für Prop `steps: WizardStep[]`, `current: number`, `states: WizardStepState[]`, `children: ReactNode`, `footer?: ReactNode` — gleiche Namen, gleiche Typen, gleiche Optionalität (nur `footer` optional, hier wie dort). Gegenprobe an den Aufrufern: `CsvImportWizard.tsx:118`, `DatevMetaImportPanel.tsx:99`, `OnboardingWizard.tsx:115`, `OnboardingReviewSteps.tsx:28`, `DatevExportWizard.tsx:442` reichen ausschließlich diese fünf Props; importiert wird überall nur `Wizard` und `type WizardStepState`. Die Prop-Tabelle „Formgleichheit (Nachweis)" stimmt. Import-Closure geprüft: `lucide-react` + `react`-Typen, sonst nichts | ✓ |
| **Variabel** — `current` trägt `aria-current="step"` | Story `v3-patterns-rahmen-wizard--filled`, im DOM gelesen: `[...document.querySelectorAll('.v2wiz__step')].map(s=>s.getAttribute('aria-current'))` → `[null,"step",null]` bei `current={1}`. In `States` (`current={2}`) sitzt es am dritten Schritt. Quelle `Wizard.tsx:62` | ✓ |
| **Variabel** — `done` zeigt `Check`, `error` `CircleAlert` plus danger — nie Farbe allein | Story `…--states`, im DOM gelesen: `done` → `<svg aria-label="erledigt" role="img" width=14 stroke-width=1.5>`, Plakette `rgb(63,122,90)`/weiß, kein Ziffern-Text; `error` → `<svg aria-label="Fehler">`, Plakette `rgb(168,64,60)`/weiß, Schritt-Fläche `rgb(244,230,229)`, Wort in danger fett; `active` → Ziffer „3" auf `rgb(26,58,92)`; `pending` → Ziffer „4" gedämpft. Vier unterscheidbare Zustände, keiner nur Farbe (V7) | ✓ |
| **Variabel** — „Schritt n" ohne `text-transform: uppercase` (A2) | Story `…--filled`, `getComputedStyle('.v2wiz__n')` → `textTransform: "none"`, `letterSpacing: "normal"`, Text „Schritt 1/2/3". Im Bild in normaler Schreibung. v1 hatte `text-transform: uppercase; letter-spacing: 0.06em` (`components.css:135`) | ✓ |
| **Variabel** — `footer` fehlt → kein Fuß im DOM | `Filled` (ohne `footer`): `document.querySelectorAll('.v2wiz__foot').length` → **0**. `WithFooter`: → **1**, Inhalt „Zurück / Schritt 2 von 4 / Weiter ⏎", Knöpfe `v2btn--secondary` und `v2btn--primary`. Quelle `Wizard.tsx:80` (`footer ? … : null`) | ✓ |
| **Variabel** — Tokens statt `#fff`/`#FAFBFC`/`rgba(…)`; Präfix gegrept; `.wz*` bleiben | `awk 'NR>=2653' src/styles/v3.css \| grep -nE "#[0-9a-fA-F]{3,8}\|rgba?\(\|text-transform\|box-shadow"` → einziger Treffer ist das Wort `#fff` **im Kommentar**, keine Regel. Alle 15 benutzten Tokens existieren in `tokens.css` (einzeln gegrept). Präfix: `grep -rn "v2wiz" src/` trifft nur `v3.css` und `Wizard.tsx` — frei. `.wz*`: `git log --oneline --all -- src/styles/components.css` → nur `5ec5da6` (Erstbestückung), `git status` zeigt die Datei nicht; die 17 Regeln `components.css:127–143` stehen unangetastet | ✓ |
| **Variabel** — geholt mit `aus-app-holen` (Import-Closure nur `lucide-react`) | `Wizard.tsx:1–2` importiert `lucide-react` (`Check`, `CircleAlert`) und `react` (nur Typen `CSSProperties`, `ReactNode`) — nichts aus `src/ludwig/`, kein Fachmodul, kein anderes v3-Bauteil. Commit `99784f8` nennt den Skill und die Herkunft (71 Z.) | ✓ |
| **Variabel** — ersetzt `ui/components/wizard/Wizard.tsx` in fünf Dateien; `settings/components` vorher gelöscht | Betrifft `ludwig/app`, hier nicht erfüllbar | offen (App) |
| **Zusatz** — `InUse` läuft wirklich | Story `…--in-use`, Knöpfe im DOM geklickt: Schritt 1 (`["active","pending","pending"]`, „Schritt 1 von 3", Zurück disabled) → Weiter → Schritt 2 (`["done","active","pending"]`, Vorschau-Tabelle) → Weiter → Schritt 3 (`["done","done","active"]`, Weiter disabled) → Zurück → Schritt 2. Zustand liegt beim Aufrufer, die Hülle bleibt zustandslos | ✓ |
| **Zusatz** — `ManySteps`: Ellipse, gleiche Spalten, keine Umbrüche | Story `…--many-steps`, gemessen: `gridTemplateColumns` → siebenmal exakt `186.57px`, alle Schritte 60 px hoch, jedes Label einzeilig mit `white-space: nowrap` + `text-overflow: ellipsis`, alle sieben tatsächlich gekürzt (`scrollWidth > clientWidth`). `minmax(0, 1fr)` (`v3.css:2668`) ist der Grund | ✓ |

### Mängel — behoben

- **M1 (erste Runde, erledigt) — „Schritt n" im Fehler-Schritt unter 4.5:1.**
  `.v2wiz__n` erbte `--color-text-subtle` (`#717171`) auch dort, wo
  `.v2wiz__step[data-state="error"]` die Fläche auf `--color-danger-bg`
  (`#F4E6E5`) setzt: **4.02:1** statt der geforderten 4.5:1 (§9 „Kontrast:
  Text ≥ 4.5:1"). Der Token trägt seine Budgetgrenze selbst im Kommentar
  (`tokens.css:41` — „4.88:1 auf Weiss, 4.51:1 auf bg-soft"); `danger-bg` ist
  keiner der beiden. Überall sonst in `v3.css` steht auf `danger-bg` der Token
  `--color-danger` (`.v2note--danger`, `.v2msg--error`, `.v2pill--danger`) —
  der Wizard war die einzige Ausnahme.

  **Behoben** (`v3.css:2705–2709`): eine Regel mit dem Argument im Kommentar,
  `.v2wiz__step[data-state="error"] .v2wiz__n { color: var(--color-danger); }`.
  Der Diff enthält genau diese Regel und den Kommentar, sonst nichts; kein Hex,
  Token wie überall. Zweite Runde nachgemessen: **4.99:1**, alle vier Zustände
  über der Schwelle, die drei anderen unverändert (die Regel ist auf
  `[data-state="error"]` verengt). `ManySteps` gegengeprüft — Spalten weiter
  siebenmal `186.57px`, eine Zeilenhöhe, alle sieben Labels weiter gekürzt:
  keine Nebenwirkung auf die Leiste.

  Der Fehler-Schritt trägt damit beide Zeilen in danger, während der aktive
  Schritt „Schritt n" grau lässt und nur das Wort in primary setzt. Das ist
  kein Bruch, sondern folgt der Fläche: nur der Fehler-Schritt hat einen
  getönten Grund, und die Kachel liest sich als ein Block — wie
  `.v2note--danger` und `.v2msg--error`. Die Hierarchie hält über die Größe
  (11 px gegen 13 px), im Browser angesehen.

### Die vier Abweichungen unter „Befund beim Bauen"

| Abweichung | Urteil |
|---|---|
| Schatten fällt weg | **Gedeckt, sogar gefordert.** §9: „Karte: Rand **oder** Schatten". v1 gab `.wz` beides (`components.css:127`). `.v2wiz` (`v3.css:2660–2665`) nimmt denselben Rand wie `.v2card` (`v3.css:15–19`) — im Browser bestätigt: `boxShadow: "none"` |
| Schein um die aktive Nummer fällt weg | **Gedeckt.** Es war `box-shadow: 0 0 0 3px rgba(26,58,92,0.14)` (`components.css:133`) — genau das rgba-Literal, das die Spec verbietet („Tokens statt … `rgba(…)`"). Der Zustand geht dadurch nicht verloren: die gefüllte primary-Plakette (`rgb(26,58,92)`, weiße Ziffer, 11.64:1) und das fette Wort in primary tragen ihn — in `States` neben den drei anderen Zuständen unterscheidbar |
| Zustand als `data-state` statt `.done`/`.active` | **Gedeckt und besser.** Die Spec schreibt kein DOM vor. v1 brauchte für `error` zwei Inline-Styles, einer davon mit `color: "#fff"` (`Wizard.tsx:46–55`) — ein Hex im Bauteil, das §9 verbietet. Vier Zustände an einem Attribut lösen genau das auf; keine Regel und kein Aufrufer greift auf `.v2wiz`-Klassen zu |
| `CircleAlert` statt `StateIcon` | **Gedeckt.** Offene Frage 2 nennt `CircleAlert` als Ausweg, wenn `StateIcon` nicht passt, und verlangt die Begründung im Kopfkommentar — sie steht dort (`Wizard.tsx:38–41`) und hält: `StateIcon` setzt `--color-danger` selbst, das wäre Rot auf der roten Plakette. Das Kriterium der Spec nennt `CircleAlert` ohnehin wörtlich. Im DOM bestätigt: das Icon erbt `currentColor` und rendert weiß, wie der `Check` daneben |

Nicht unter „Befund beim Bauen" vermerkt, aber richtig: `strokeWidth` geht von
`2` (v1) auf `1.5` — §9 „Icons Lucide 1.5 px".

Abgenommen von / am: **Claude, Abnahme-Agent, 2026-09-05** — in zwei Runden:
erste Runde `in Arbeit` wegen M1, nach der Korrektur in `v3.css` nachgemessen
und abgenommen. · Offene Punkte: keine im Set. Offen bleibt nur das mit
„offen (App)" markierte Kriterium — der Import-Tausch in den fünf Aufrufern
fällt in `ludwig/app` (siehe B3 und B4).

## Offene Fragen

1. `states` als zweite Liste neben `current` behalten (formgleich) oder
   gleich `steps[i].state`? *Ohne Antwort: formgleich — Umbau nach der
   Migration, siehe Ausbau.*
   **Entschieden (Bauender, 2026-09-05, Default):** formgleich. Die fünf
   Aufrufer wandern über den Import-Pfad, sonst nichts (Nachweis unten).
2. Fehler-Icon `CircleAlert` oder `StateIcon` aus `Review.tsx`? *Ohne
   Antwort: `StateIcon`, wenn es einen passenden Zustand hat, sonst
   `CircleAlert` — der Bauende prüft und schreibt es in den Kopfkommentar.*
   **Entschieden (Bauender, 2026-09-05):** `CircleAlert`. `StateIcon`
   („error" → `XCircle`) setzt seine Farbe selbst (`--color-danger`) — in der
   gefüllten danger-Plakette wäre das Rot auf Rot. Das Icon im Kreis erbt
   `currentColor`, genau wie der `Check` daneben. Steht im Kopfkommentar.

## Formgleichheit (Nachweis)

Prop für Prop gegen `apps/web/src/ui/components/wizard/Wizard.tsx` verglichen:

| Prop | v1 | v3 |
|---|---|---|
| `steps` | `WizardStep[]` (`{ label: string }`) | gleich |
| `current` | `number`, 0-basiert | gleich |
| `states` | `WizardStepState[]` (`pending`/`active`/`done`/`error`) | gleich |
| `children` | `ReactNode` | gleich |
| `footer` | `ReactNode`, optional | gleich |

Unterschied nur im Namen des Props-Typs: v1 hält ihn lokal (`interface
Props`), v3 exportiert ihn als `WizardProps`. Import-Closure wie erwartet:
`lucide-react` und `react`, sonst nichts.

## Befund beim Bauen

- **Story-Gruppe heißt „Rahmen", nicht „Frame".** Die Spec schreibt
  `v3/Patterns/Frame/Wizard`; die Gruppen des Storybook-Baums sind die Wörter
  aus dem Gruppen-Kommentar in `src/ui/v3/index.ts` und die sind deutsch
  (Arbeitsfläche · Rahmen · Prüfen · Prozess). Titel ist
  `v3/Patterns/Rahmen/Wizard`.
- **Der Schatten fällt weg.** v1 gibt `.wz` Rand **und** zwei Schatten; die
  Prüfliste erlaubt eins von beiden. `.v2wiz` behält den Rand, wie `.v2card`.
- **Der Schein um die aktive Nummer fällt weg** (`box-shadow: 0 0 0 3px
  rgba(26,58,92,0.14)`): ein rgba-Literal ohne Token. Die gefüllte
  primary-Plakette und das fette Wort tragen den Zustand allein.
- **Der Zustand steht an der Plakette als `data-state`**, nicht als
  `.done`/`.active`-Klassen wie in v1 — vier Zustände, ein Attribut, und
  `error` bekommt damit dieselbe Behandlung wie die anderen drei statt eines
  Inline-Styles.
- **Die `.wz*`-Regeln in `src/styles/components.css` bleiben unangetastet**,
  wie die Spec sagt: sie fallen, wenn die App ihren v1-`Wizard` löscht.
