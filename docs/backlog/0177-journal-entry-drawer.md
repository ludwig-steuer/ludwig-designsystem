# 0177 · JournalEntryDrawer — den Buchungssatz nachschlagen, ohne die Arbeit zu verlassen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: ein Buchungssatz mit Teilbuchungen und DATEV-Weg |
| Quelle | Entitätsprofil `docs/entitaeten/journal-entry.md` (geprüft), Abschnitte „Formen" (`JournalEntryDrawer`, §7 Nr. 5), „Zuschnitt" (jetzt, Bau-Reihenfolge 3); Drawer-Regeln aus 0052 und A10 |
| Ersetzt | in `ludwig/app` `LudwigEntryDrawer` (`ui/drawers/server.tsx`) samt `JournalEntryDetail` (`accounting-cases/ui`, 99 Z.) |
| Blockiert | J-27 („was liegt auf diesem Konto" — heute zwei Drawer für eine Frage), die Bankzeile und die Erwartung, die beide auf einen Satz zeigen |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Die Buchhalterin sieht im Kontoblatt eine Zeile, in der Erwartung einen
Ursprung, in der Bankzeile eine Buchung — und hat **eine** Frage: was ist das
für ein Satz? Der Drawer beantwortet sie neben der Arbeit; die halb getippte
Zeile dahinter bleibt stehen.

## Einordnung

- **Wiederverwenden:** `JournalEntryFacts` (0176) ist Zone 3 — dieselbe
  Komponente wie in der vollen Ansicht, das ist die Regel aus 0052; sonst
  laufen die beiden auseinander. `Drawer` (0042) trägt Rahmen, Escape, Scrim
  und den Fokus.
- **Neu, weil:** Regel 5 aus `spec-schreiben` §3 — die Komposition trägt
  eigenen Zustand (offen, lädt, Fehler) und kommt auf mindestens drei Screens
  vor.
- **Zuschnitt:** eine Datei `JournalEntryDrawer.tsx`, `"use client"` — wie
  `AccountDrawer` (0068) und `BusinessPartnerDrawer` (0143).
- **Setzt auf:** `Drawer`, `JournalEntryFacts`, `Button`, `Banner`,
  `EmptyState`, `Skeleton`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | offen oder nicht | `InUse` |
| `onClose` | `() => void` | ja | Escape, Scrim und Kreuz melden dasselbe (0042) | `InUse` |
| `entry` | `JournalEntryVM \| null` | ja | der Satz; `null` heißt „lädt" oder „gibt es nicht" | `Open`, `NotFound` |
| `context` | `JournalEntryFactsContext` | nein | wie in 0176 — was die Detail-Sicht nicht trägt (L-336) | `Open` |
| `judgeReasoning` | `string \| null` | nein | wie in 0176 | `Open` |
| `sources` | `readonly AiSource[]` | nein | wie in 0176 | `Open` |
| `caseHref` | `string` | nein | **der eine Weg hinaus** (A10), im Fuß; ohne ihn hat der Drawer keinen Fuß | `Open`, `WithoutCase` |
| `batchHref` | `(batchId: string) => string` | nein | Weg zum Stapel, durchgereicht an die Fakten | `Open` |
| `loading` | `boolean` | nein | Zone 3 als Skelett in der Form des Inhalts (0052 M2) | `Loading` |
| `error` | `string` | nein | ein Banner statt der Fakten | `Error` |

**Zonen** (0052): 1 Kopf — Titel ist die Belegnummer der führenden Zeile, sonst
„Buchungssatz"; die Meta-Zeile trägt den Buchungstext, gekürzt. 3 Fakten —
`JournalEntryFacts` mit `tone="bare"`. 5 Fuß — „Sachverhalt öffnen →".
**Zone 2 entfällt ohne Ersatz**: ein Buchungssatz hat kein eigenes Dokument;
der Beleg ist eine Beziehung und steht in „Zusammenhang". Zone 4 (Grenze)
entfällt: die Fakten sind vollständig, es gibt kein „mehr davon".

**Kann bewusst nicht:** bearbeiten, annehmen, stornieren — der Drawer liest
(0052); die Aktionen stehen auf der Seite, von der er geöffnet wird. Er lädt
nichts selbst: der Aufrufer reicht `entry`, `loading` und `error` herein.

**Der Weg zum Sachverhalt steht einmal**: hat der Drawer `caseHref`, bekommen
die Fakten **kein** `caseHref` — die Nummer steht dann als Text in
„Zusammenhang", und der Weg ist der Knopf im Fuß (A10, D24).

## Verhalten

Client-Component, weil `Drawer` Zustand und Fokus führt. Lädt: Skelett in der
Form des Inhalts. Fehler: `Banner tone="danger"` mit der Meldung und der Id.
Kein Satz und kein Fehler: `EmptyState` „Diesen Buchungssatz gibt es nicht
mehr." — ein Satz kann storniert und ersetzt worden sein, und dann ist die
ehrliche Antwort, dass er weg ist. In allen drei Fällen **kein Fuß**: ein toter
Knopf über einer Fehlermeldung ist schlimmer als keiner.

## Stories

Titel `v3/Entitäten/Buchungssatz/JournalEntryDrawer`. Abgeleitet nach §6: vier
Zustände (gefüllt, lädt, Fehler, nicht gefunden), ein Callback-Rundlauf,
dazu der Fall ohne Weg hinaus.

| Story | Beweist |
|---|---|
| `Open` | der volle Satz mit Kontext, Quellen und Weg zum Sachverhalt |
| `Loading` | Skelett in der Form des Inhalts, kein Fuß |
| `Error` | Banner mit Meldung und Id, kein Fuß |
| `NotFound` | „gibt es nicht mehr" als Satz, kein Fuß |
| `WithoutCase` | ohne `caseHref`: kein Fuß, die Sachverhalts-Zeile steht trotzdem als Text |
| `InUse` | Rundlauf: ein Knopf im Kontoblatt öffnet, Escape schließt, der Fokus kehrt zurück |

Nicht anwendbar: „leer nach Filter" — der Drawer zeigt einen Satz, er filtert
nichts.

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

- [ ] Zone 3 ist `JournalEntryFacts`, nicht eine zweite Fassung derselben Zeilen (Grep)
- [ ] Der Weg zum Sachverhalt steht **einmal**: mit `caseHref` im Fuß, und die Fakten bekommen keinen (Story `Open`, DOM)
- [ ] Lädt, Fehler und „gibt es nicht mehr" haben **keinen** Fuß (Stories `Loading`, `Error`, `NotFound`, DOM)
- [ ] Der Titel ist die Belegnummer, sonst „Buchungssatz"; der Buchungstext steht in der Meta-Zeile, gekürzt (Story `Open`)
- [ ] Escape, Scrim und Kreuz schließen; der Fokus kehrt zum Öffner zurück (Story `InUse`, gemessen)
- [ ] Ersetzt `LudwigEntryDrawer` und `JournalEntryDetail` ohne Funktionsverlust — außer dem rohen Satz-Zustand neben der Stufe, der nichts sagt, was die Stufe nicht sagt (Begründung in der Abnahme)

## Offene Fragen

1. Trägt der Fuß auch den Weg zum Stapel? — ohne Antwort: **nein**, A10 gibt
   dem Fuß genau einen Weg; der Stapel steht als Link in den Fakten.
2. Soll der Drawer den Satz selbst laden dürfen? — ohne Antwort: **nein**, der
   Aufrufer lädt; das Set kennt keinen Loader (Hausregel).

## Gebaut (2026-09-15)

`JournalEntryDrawer.tsx` (`"use client"`), im Barrel. Zone 3 ist
`JournalEntryFacts` mit `tone="bare"` — dieselbe Komponente wie in der vollen
Ansicht, kein zweiter Satz Zeilen. Die Fakten bekommen **kein** `caseHref`:
der Weg steht einmal, im Fuß.

Gemessen (CDP, Storybook 6107, 1200 px):

| Story | Beobachtung |
|---|---|
| `Open` | Titel „RE-4471", Meta „Meier Bürobedarf August 2026"; Gruppen Der Satz · Export und Stapel · Zusammenhang; Fuß „Sachverhalt öffnen →" mit genau einem Link |
| `Loading` | Titel „Buchungssatz", Skelett in der Form des Inhalts, **kein** Fuß |
| `Error` | Banner „Der Buchungssatz konnte nicht geladen werden." samt Id, kein Fuß |
| `NotFound` | „Diesen Buchungssatz gibt es nicht mehr." mit dem Hinweis auf den Sachverhalt, kein Fuß |
| `WithoutCase` | kein Fuß; „Zusammenhang" fällt hier ganz weg, weil der Kontext nur die Satzart trägt |
| `InUse` | der Knopf öffnet, Escape schließt (`stillOpen` false) |

Der Fokus-Rücksprung nach dem Schließen ließ sich hier nicht messen — die
Story läuft im Storybook-Rahmen, dessen eigene Tabelle den Fokus fängt. Er
gehört dem `Drawer` (0042) und ist dort abgenommen.

`pnpm typecheck`, `check:classes`, `check:language`, `check:when` und
`pnpm build` grün; Screenshots angesehen. Abnahme durch einen anderen Agenten
steht aus.
