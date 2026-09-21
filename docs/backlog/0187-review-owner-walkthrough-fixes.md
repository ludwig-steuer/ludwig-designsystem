# 0187 · Fünf Nachträge aus dem Owner-Durchgang der Buchungsabnahme

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/TodoList` · `primitives/Drawer` (+ sechs Entity-Drawer) · `primitives/StatusCallout` · `v3.css` (`.s3zone`) |
| Klassen-Test | jede der fünf: „auch in einer Versicherungs-App?" → ja — Tastenrichtung, Aufklapper, Fußweg, Erfolgston, Textstufe sind fachfrei |
| Quelle | Owner-Durchgang 2026-09-15 (`app/docs/backlog/review-screen-owner-walkthrough-2026-09-15.md` §3.2–3.4), Aufträge F217 · F218 · F219 in `app/docs/backlog/`, weitergereicht über ludwig-cto am 2026-09-15 |
| Ersetzt | in der App: `ui/drawers/AccountLedgerDrawer.tsx:173` (eigener Fußlink), `Step3Single.tsx` (Inline-Stil am Sachverhaltstext), `Step0.tsx` (Ton `neutral` für „Agent fertig") |
| Blockiert | App F218 T218.1 (`collapsed`), F219 Schritt 0 (Erfolgston), F217 Legende (J/K) |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Fünf kleine Stellen, an denen der Owner beim Durchgang durch die
Buchungsabnahme hängen blieb — jede für sich eine Zeile, zusammen ein Commit,
damit die App den Zeiger einmal hebt.

1. **J/K in der `TodoList` laufen verkehrt herum.** Der `RecordPager` (bef654b)
   bindet J = zurück, K = vor, weil die Finger wie die Pfeile stehen. Die
   `TodoList` bindet es bis heute umgekehrt; in Schritt 3 stehen beide auf
   einer Seite, und die Legende (F217) folgt dem Pager.
2. **Eine Gruppe der `TodoList` soll zugeklappt beginnen.** Schritt 2 stellt die
   übergangenen Gates als „Technische Details" ans Ende (F218); sie bleiben
   quittierpflichtig, sollen aber nicht die Sicht auf die Fragen verstellen.
3. **Die Sachverhaltsbeschreibung in der Kopfzone von Schritt 3 ist zu groß.**
   Sie ist ein nacktes `<p>` und erbt `--fs-body` (16 px), während alles um sie
   herum im UI-Register (12,5–15 px) steht.
4. **Jeder Drawer trägt den Weg in die Vollansicht (A10) — aber jeder anders.**
   Sechs Drawer im Set, sechs Wortlaute, drei Varianten, zwei Icons; die App hat
   in `AccountLedgerDrawer` einen siebten. Der Owner will **einen** Knopf.
5. **`StatusCallout` kennt keinen Erfolg.** Schritt 0 sagt „Der Agent ist
   fertig" (F219) und muss dafür `neutral` nehmen.

## Einordnung

- **Erweitert, weil:** alle fünf sind Regel 2 aus `spec-schreiben` §3 — die
  Komponente ist da, es fehlt eine Richtung, eine Prop, eine Klasse, ein
  Export, ein Ton. Nichts Neues, was ein eigenes `@when` bräuchte, außer dem
  Fußknopf: der ist heute sechsmal von Hand gebaut, und genau das ist der
  Befund.
- **Zuschnitt:** eine Spec für fünf Stellen, weil sie aus einem Durchgang
  kommen und die App sie in einem Zeigerzug braucht. Der Fußknopf wohnt bei
  `Drawer` (Familie, eine Datei): er ist Zone 5 des Rahmens, nicht der
  Entität.

## Schnittstelle

| Export / Prop | Typ | Bedeutung | Nachweis (Story) |
|---|---|---|---|
| geändert: `TodoList` Tasten | `J` = voriger, `K` = nächster Punkt | wie `RecordPager` — der Grund steht dort im Code und wird hier zitiert, nicht wiederholt | `Filled` (Text) |
| neu: `TodoGroup.collapsed` | `boolean`, optional, Vorgabe `false` | die Gruppe beginnt zugeklappt; ihr Kopf klappt sie per Klick auf und zu (natives `<details>`, wie `Disclosure`). J/K überspringen, was zugeklappt ist — eine Auswahl, die man nicht sieht, ist keine | `Collapsed` |
| neu: `DrawerFullView` | `({ href } \| { onClick }, children?) => ReactNode` | **der** Knopf in Zone 5: `secondary` · `sm` · `ActionIcon open` · Wortlaut „Vollansicht öffnen". `children` nur, wo der Ausgang ein anderes Verb ist (Bankzeile: „Zahlung zuordnen", 0103) | `Drawer · FullView` |
| geändert: sechs Entity-Drawer | Fuß = `DrawerFullView` | Konto, Sachverhalt, Geschäftspartner, Buchungssatz, Beleg mit dem Standardwort; Bankzeile mit ihren drei Ausgängen | bestehende Drawer-Stories |
| neu: `StatusCallout.tone = "success"` | Ton | Rahmen, Kicker, Nebenzeile und Icon in `--color-success`, wie `Banner`/`Badge` den Erfolg nennen | `Done` |
| neu: Klasse `.s3zone__text` | CSS | der Fließtext einer Kontextzone: `--fs-body-sm`/`--lh-body-sm`, Abstand nach unten `--space-4`. Die App hängt sie an das `<p>` der Sachverhaltsbeschreibung | — (Klasse, kein Export; Aufrufer ist `Step3Single` in der App) |

**Kann bewusst nicht:** `collapsed` gesteuert von außen halten — wer die
Gruppe zu- oder aufklappt, ist die Person am Bildschirm, nicht der Aufrufer
(dieselbe Regel wie `Disclosure`, 0005).

## Verhalten

- `TodoList`: `J` wählt den vorigen, `K` den nächsten Punkt; zugeklappte
  Gruppen sind für beide unsichtbar. Klick auf den Gruppenkopf klappt. Steht
  die Auswahl in einer zugeklappten Gruppe (der Aufrufer hat sie gesetzt),
  springt `J`/`K` auf den ersten sichtbaren Punkt.
- `DrawerFullView`: mit `href` ein Link, mit `onClick` ein Knopf; sonst wie
  `Button`.
- `StatusCallout tone="success"`: nur Farbe; das Wort im Kicker sagt es
  weiter (V7).

## Stories

| Story | Beweist |
|---|---|
| `TodoList · Collapsed` | die zweite Gruppe beginnt zu, klappt per Klick auf; `J`/`K` überspringen sie, solange sie zu ist |
| `Drawer · FullView` | der Fußknopf, einmal als Link, einmal als Knopf |
| `StatusCallout · Done` | der grüne Ton mit Wort im Kicker |
| bestehende Drawer-Stories | der Fuß sieht in allen sechs gleich aus |

## Abnahmekriterien

Fest: wie in 0184.

Variabel (aus dieser Spec):

- [ ] `TodoList`: `J` senkt, `K` hebt den Index — wie `RecordPager.tsx` (Code + Story `Filled` im Browser)
- [ ] `TodoGroup.collapsed` rendert die Gruppe als `<details>` ohne `open`; Klick auf den Kopf öffnet sie (Story `Collapsed`)
- [ ] `J`/`K` erreichen keinen Punkt einer zugeklappten Gruppe (Story `Collapsed`, Auswahl beobachten)
- [ ] `grep -rn "footer={" src/ui/v3/entities` — jeder Fuß setzt `DrawerFullView`, keiner mehr einen eigenen `Button`
- [ ] `DrawerFullView` ohne `children` zeigt „Vollansicht öffnen" mit `ActionIcon open`, `secondary`, `sm` (Story `FullView`, DOM)
- [ ] `StatusCallout tone="success"`: `.v2callout--success` färbt Rahmen, Kicker, Nebenzeile, Icon mit `--color-success` (Story `Done`)
- [ ] `.s3zone__text` steht in `v3.css` mit `--fs-body-sm` (grep)

## Offene Fragen

Keine — Wortlaut „Vollansicht öffnen" kommt vom Owner über ludwig-cto.

## Gebaut (2026-09-15)

`TodoList`: J = voriger, K = nächster Punkt; jede Gruppe ist ein `<details>`
mit dem Kopf als `<summary>` und Chevron, `collapsed` lässt es ohne `open`
beginnen. Ein `closed`-Set spiegelt den Zustand der `<details>` (`onToggle`),
damit `J`/`K` nur Sichtbares erreichen. `MasterDetail` teilt `.v2lp__grp` und
bleibt unverändert (Zähler rechts, kein Hover) — die Klapp-Regeln hängen an
`summary.v2lp__grp`.

`DrawerFullView` in `Drawer.tsx`: `secondary` · `sm` · `ActionIcon open`,
„Vollansicht öffnen", `href` oder `onClick`. Alle sechs Entity-Drawer setzen
ihn; die Bankzeile behält ihre drei Ausgangswörter über `children`. Der
Buchungssatz-Drawer führt weiter auf den Sachverhalt (er hat keine eigene
Seite) — jetzt unter dem Standardwort.

`StatusCallout tone="success"` mit `.v2callout--success` (Rahmen, Kicker,
Nebenzeile, Icon). `.s3zone__text` in `v3.css` für die
Sachverhaltsbeschreibung — die App hängt die Klasse an ihr `<p>`.

Gemessen mit `scripts/cdp.mjs`: `Collapsed` beginnt `[open, closed]`, K/K/K
läuft 0008 → 0014 → 0011 → 0008 (überspringt die zugeklappte Gruppe), J geht
zurück; Klick auf den Kopf öffnet, danach erreicht K „S03". Der Fuß aller
sechs Drawer ist `a|button.v2btn.v2btn--secondary.v2btn--sm` mit Icon.
`Done`: Rahmen und Kicker in `rgb(63, 122, 90)` = `--color-success`.

`pnpm typecheck`, `check:classes`, `check:language`, `check:when`,
`check:mirror` und `pnpm build` (im Worktree) grün. Abnahme durch einen
anderen Agenten steht aus.

## Nachtrag 2026-09-21 — Schritt 0 als eine Box (Owner über `a1`)

**Anlass.** Schritt 0 der Stapelabnahme (`batch-review/ui/Step0.tsx`) stellt
zwei Boxen untereinander: das `StatusCallout` mit dem Ergebnis („Der Agent ist
an 2 Stellen nicht fertig", Knopf „Abnahme beginnen") und darunter eine
`Disclosure` „Was der Agent erledigt hat — 5 von 7 Aufgaben" mit der Tabelle.
Owner: „das ist eigentlich eine Sache, warum zwei Boxen."

**Einordnung.** Regel 2 aus `spec-schreiben` §3: das Callout deckt den Fall
zu vier Fünfteln, es fehlt **eine** Prop. Keine neue Komponente: Kopf und
Beleg sind eine Aussage, und ein zweiter Baustein, der nur beides
zusammensteckt, wäre eine Komposition ohne eigenen Zustand.

**Schnittstelle.** `StatusCallout.details?: { summary: ReactNode; children:
ReactNode; defaultOpen?: boolean }`. Mit ihr steht unter dem Kopf eine Zeile
zum Aufklappen, und der Inhalt klappt **im selben Rahmen** auf; ohne sie
bleibt das Callout, wie es war.

- Der Ton färbt den ganzen Rahmen, auch um den aufgeklappten Teil.
- Der Knopf steht im Kopf, nie im `<summary>` — ein Klick auf ihn klappt
  nichts auf.
- Server-Komponente: die Klappe ist die `Disclosure` (natives `<details>`).
- Zu ist der Standard: der Kopf ist schon die Antwort, die Tabelle der Beleg.
- Der Fall „fertig" (neutral, alle Aufgaben erledigt) nutzt dieselbe Box.

**Abnahmekriterien (Nachtrag)**

1. Story `WithDetails`: drei Callouts (Warnung zu, neutral zu, Warnung offen),
   jedes **ein** Rahmen; kein zweites `.v2callout` und keine lose
   `.v2disc` daneben.
2. Klick auf „Abnahme beginnen" ändert `details.open` nicht; Klick auf die
   Zeile öffnet.
3. `summary` enthält keinen `<button>`.
4. Die aufklappbare Zeile reicht von Rahmenkante zu Rahmenkante; ihr
   Trennstrich gehört zur Karte, nicht zum Text.
5. Ohne `details` rendern alle bisherigen Stories unverändert.

**Stand.** Gebaut 2026-09-21. Gemessen in `--with-details`: vor dem Klick zu,
nach Klick auf den Knopf weiter zu, nach Klick auf die Zeile offen; kein
Knopf im `<summary>`; Rahmen 16–896 px, Zeile 17–895 px (innerhalb der
Rahmenlinie); Rahmenfarbe `rgb(140, 96, 30)` = Warnton. Fremde Abnahme steht
aus.
