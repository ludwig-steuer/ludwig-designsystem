# 0079 · Wizard — der Rahmen eines Ablaufs in nummerierten Schritten

| | |
|---|---|
| Status | spec |
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

Titel `v3/Patterns/Frame/Wizard`.

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

- **B1** — `settings/components/page.tsx` nutzt den `Wizard` noch; die Seite
  ist Rückbau (F111 B2). Erst löschen, dann migrieren.
- **B2** — `OnboardingWizard.tsx` und `OnboardingReviewSteps.tsx` schreiben
  den Fortschrittstext mit der Klasse `wz__progress` direkt. Nach dem
  Umzug ist das Markup im `footer`-Slot; die Klasse gibt es dann nicht mehr.

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

- [ ] Formgleich: die fünf Aufrufer kompilieren mit geändertem Import-Pfad und sonst nichts (Nachweis: Prop-Namen und -Typen gegen `ui/components/wizard/Wizard.tsx` verglichen)
- [ ] `current` trägt `aria-current="step"` (Story `Filled`)
- [ ] `done` zeigt `Check`, `error` zeigt `CircleAlert` plus danger — nie Farbe allein (Story `States`)
- [ ] „Schritt n" ohne `text-transform: uppercase` (Story `Filled`, A2)
- [ ] `footer` fehlt → kein Fuß im DOM (Story `Filled` gegen `WithFooter`)
- [ ] Stile in `v3.css` mit Tokens statt `#fff`/`#FAFBFC`/`rgba(…)`; Klassenpräfix vor dem Benennen gegrept (`v2wiz` ist frei); die `.wz*`-Regeln in `components.css` bleiben, bis die App den v1-`Wizard` gelöscht hat, und fallen dann
- [ ] Geholt mit Skill `aus-app-holen` (Import-Closure: nur `lucide-react`)
- [ ] offen (App): ersetzt `ui/components/wizard/Wizard.tsx` in fünf Dateien; `settings/components` ist vorher gelöscht

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. `states` als zweite Liste neben `current` behalten (formgleich) oder
   gleich `steps[i].state`? *Ohne Antwort: formgleich — Umbau nach der
   Migration, siehe Ausbau.*
2. Fehler-Icon `CircleAlert` oder `StateIcon` aus `Review.tsx`? *Ohne
   Antwort: `StateIcon`, wenn es einen passenden Zustand hat, sonst
   `CircleAlert` — der Bauende prüft und schreibt es in den Kopfkommentar.*
