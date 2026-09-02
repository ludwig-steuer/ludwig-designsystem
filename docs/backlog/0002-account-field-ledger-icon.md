# 0002 · AccountField — Kontenblatt-Icon

| | |
|---|---|
| Status | spec |
| Stufe | `entities/account/` |
| Klassen-Test | nein — „Konto" ist ein Fachwort, die Kandidatengruppen sind Buchhaltungslogik |
| Quelle | Anfrage Owner 2026-09-03 („der Konto-Autocomplete ist auch eine extra Komponente … mit Parameter ob es ein Icon haben soll, das Icon öffnet per Klick einen Drawer mit den Kontenbuchungen") |
| Ersetzt | `onOpenLedger` in `JournalEntryEditor` (heute eine Editor-Prop, die an jeder Kontozelle einzeln verdrahtet ist) |
| Blockiert | 0004 (Editor) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Buchhalterin steht auf einem Konto und will wissen, was dort sonst noch
gebucht ist — bevor sie es übernimmt. Heute kommt sie da nur aus dem Editor
heraus, weil der den Weg zum Kontenblatt selbst trägt (`onOpenLedger`). Jede
andere Stelle, die ein Konto auswählen lässt, hat den Weg nicht.

Das Kontenblatt gehört an das Konto, nicht an den Editor. `AccountField`
bekommt dafür ein Icon am Feld; wer es nicht will, lässt die Prop weg.

## Einordnung

- **Wiederverwenden:** `AccountField` (`@when Choosing an account, with
  candidates from agent, partner, similar and document line.`) deckt den Fall
  schon — es fehlt genau ein Weg hinaus.
- **Neu oder erweitert, weil:** `spec-schreiben` §3.2 — **eine** Prop, das
  Fehlende ist eine Designentscheidung, die wiederkommt (Editor heute,
  Kontenauswahl auf jeder weiteren Seite morgen), und sie lässt sich in der
  `@when`-Zeile in einem Halbsatz sagen.
- **Zuschnitt:** eine Datei, unverändert. Kein zweiter Export.
- **Setzt auf:** nichts Neues.

## Schnittstelle

Neu, alles andere bleibt:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `onOpenLedger` | `(accountNumber: string) => void` | nein | Weg zum Kontenblatt. Gesetzt → Icon erscheint am Feldrand; weggelassen → kein Icon, kein Platzhalter | `WithLedger` |

**Das Icon ist kein eigener Schalter, sondern die Anwesenheit des Callbacks.**
Ein zusätzliches `showLedgerIcon` wäre ein zweites Boolean für dieselbe Frage
(§5: zwei Booleans, die sich ausschließen).

Typen: `AccountCandidate` bleibt wie er ist. GLOSSARY: `ledger account`
(Konto) im Code, „Konto" im Label; das Blatt heißt im UI **Kontenblatt**.

**Was die Komponente nicht kann (bewusst):** den Drawer öffnen. Das Kontenblatt
lädt (`AccountLedgerDrawerProvider` in `ui/drawers`, `get_account_sheet`) —
ladende Komponenten gehören nicht ins Set (`.storybook/main.ts`). Das Feld
meldet den Wunsch, der Aufrufer führt ihn aus.

## Verhalten

- Icon sitzt rechts im Feld, nach dem Eingabefeld, vor der Kandidatenliste.
- **Tastatur:** erreichbar per Tab nach dem Feld; `Enter`/`Space` löst aus.
  `aria-label="Kontenblatt zu <Nummer>"`, damit der Screenreader weiß, welches.
- Ist `value` leer, ist das Icon **deaktiviert**, nicht versteckt — sonst
  springt das Layout beim Tippen.
- Ein Klick auf das Icon schließt die Kandidatenliste nicht und ändert `value`
  nicht.
- Client-Component (ist sie schon).

## Stories

Nach §6: eine neue Story, die anderen bleiben.

| Story | Beweist |
|---|---|
| `WithLedger` | Icon vorhanden, Rundlauf über `onOpenLedger` mit `useState`, leerer Wert → deaktiviert |

Nicht anwendbar: Enum-Story (keine neue Enum-Prop), Layout-Boolean (keins),
Rand (die Prop formatiert nichts).

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

- [ ] Ohne `onOpenLedger` erscheint kein Icon und kein leerer Platz (Story `Gefuellt` unverändert)
- [ ] Mit `onOpenLedger` und leerem `value` ist das Icon deaktiviert, nicht versteckt (`WithLedger`)
- [ ] Icon per Tab erreichbar, `Enter` löst aus, `aria-label` nennt die Kontonummer (`WithLedger`)
- [ ] `@when`-Zeile nennt den Weg zum Kontenblatt in einem Halbsatz
- [ ] `JournalEntryEditor` reicht sein `onOpenLedger` an die Felder durch, statt es selbst zu zeichnen — ohne Funktionsverlust (0004)

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
