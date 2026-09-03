# 0013 · AccountField — Nummer und Name, Kontenblatt-Icon

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/account/` |
| Klassen-Test | nein — „Konto" ist ein Fachwort, die Kandidatengruppen sind Buchhaltungslogik |
| Quelle | Anfrage Owner 2026-09-03 („der Konto-Autocomplete ist auch eine extra Komponente … mit Parameter ob es ein Icon haben soll, das Icon öffnet per Klick einen Drawer mit den Kontenbuchungen") · Nachtrag Owner 2026-09-03 („wir wollen im Normalzustand Konto-Nr und Name anzeigen, immer beides") |
| Ersetzt | `onOpenLedger` in `JournalEntryEditor` (heute eine Editor-Prop, die an jeder Kontozelle einzeln verdrahtet ist) |
| Blockiert | 0015 (Editor) |
| Braucht | 0042 (`Drawer`) — nicht zum Bauen, aber damit der Aufrufer ein Ziel für `onOpenLedger` hat |
| Spec von / am | Claude, 2026-09-03 (erweitert am selben Tag um die Anzeige) |
| Gebaut von / am | Claude, 2026-09-03 — `src/ui/v3/entities/account/AccountField.tsx`, Stories `WithLedger` und `NumberAndName` |

## Ziel

Zwei Dinge fehlen dem Feld, beide am selben Ort.

**Erstens sieht man nicht, was man gewählt hat.** Nach der Auswahl steht im
Feld `6815` — die Nummer, weil `value` die Nummer ist. Der Name, an dem die
Buchhalterin ihre Wahl prüft, ist genau in dem Moment weg, in dem sie ihn
braucht: Die Kandidatenliste zeigt „6815 Bürobedarf", das geschlossene Feld
zeigt eine nackte Zahl. Wer die Nummer nicht auswendig kennt, muss das Feld
wieder öffnen, um zu sehen, was drin steht.

**Zweitens fehlt der Weg zum Kontenblatt.** Die Buchhalterin steht auf einem
Konto und will wissen, was dort sonst noch gebucht ist — bevor sie es
übernimmt. Heute kommt sie da nur aus dem Editor heraus, weil der den Weg
selbst trägt (`onOpenLedger`). Jede andere Stelle, die ein Konto auswählen
lässt, hat den Weg nicht.

Das Kontenblatt gehört an das Konto, nicht an den Editor. `AccountField`
bekommt dafür ein Icon am Feld; wer es nicht will, lässt die Prop weg.

## Einordnung

- **Wiederverwenden:** `AccountField` (`@when Choosing an account, with
  candidates from agent, partner, similar and document line.`) deckt den Fall
  schon — es fehlt ein Weg hinaus und die Hälfte der Anzeige.
- **Neu oder erweitert, weil:** `spec-schreiben` §3.2 — **eine** Prop für den
  Weg hinaus; das Fehlende ist eine Designentscheidung, die wiederkommt
  (Editor heute, Kontenauswahl auf jeder weiteren Seite morgen), und sie
  lässt sich in der `@when`-Zeile in einem Halbsatz sagen. Die Anzeige von
  Nummer **und** Name ist keine neue Prop, sondern eine **Korrektur des
  Verhaltens** — das Feld zeigt heute weniger, als es weiß.
- **Zuschnitt:** eine Datei, unverändert. Kein zweiter Export.
- **Setzt auf:** nichts Neues. Das Ziel des Icons (`Drawer`, 0042) baut der
  Aufrufer.

## Schnittstelle

Neu, alles andere bleibt:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `valueName` | `string` | nein | Name des gewählten Kontos für den ersten Render, wenn der Wert von außen kommt (Editor lädt eine Buchung). Danach kennt das Feld ihn aus der Auswahl selbst | `WithLedger` |
| `onOpenLedger` | `(accountNumber: string) => void` | nein | Weg zum Kontenblatt. Gesetzt → Icon erscheint am Feldrand; weggelassen → kein Icon, kein Platzhalter | `WithLedger` |

Geändert:

| Prop | Typ heute | Typ neu | Warum |
|---|---|---|---|
| `onChange` | `(number: string) => void` | `(number: string, account?: AccountCandidate) => void` | Wer den Namen anzeigen will, bekommt ihn zurück, statt ihn erneut nachzuschlagen. Zweites Argument, rückwärtskompatibel: bestehende Aufrufer ignorieren es. Bei freier Eingabe (kein Kandidat getroffen) bleibt es `undefined` |

**Das Icon ist kein eigener Schalter, sondern die Anwesenheit des Callbacks.**
Ein zusätzliches `showLedgerIcon` wäre ein zweites Boolean für dieselbe Frage
(§5: zwei Booleans, die sich ausschließen). Owner hat am 2026-09-03 nach
einer „Flag" gefragt; die Wirkung ist dieselbe, die Zahl der falsch
kombinierbaren Zustände ist kleiner (Flag an ohne Callback gibt es nicht).

Typen: `AccountCandidate` bleibt wie er ist. GLOSSARY: `ledger account`
(Konto) im Code, „Konto" im Label; das Blatt heißt im UI **Kontenblatt**.

**Was die Komponente nicht kann (bewusst):**

- **Den Drawer öffnen.** Das Kontenblatt lädt
  (`AccountLedgerDrawerProvider` in `ui/drawers`, `get_account_sheet`) —
  ladende Komponenten gehören nicht ins Set (`.storybook/main.ts`). Das Feld
  meldet den Wunsch, der Aufrufer führt ihn aus.
- **Den Namen nachschlagen.** Steht ein Wert im Feld, den weder die
  Kandidaten noch `valueName` benennen, zeigt es die Nummer allein. Ein
  stiller Lookup wäre eine Ladung.

## Verhalten

**Anzeige (neu).** Das Feld hat zwei Gesichter:

- **Ruhend** (nicht fokussiert, Wert gesetzt): `6815 Bürobedarf` — Nummer in
  der Ziffernschrift, Name danach in gedämpfter Farbe. Immer beides, sobald
  der Name bekannt ist.
- **In Arbeit** (fokussiert): der reine Suchtext, damit Tippen nicht gegen
  einen zusammengesetzten String läuft. Beim Fokussieren eines gefüllten
  Feldes steht die Nummer da, markiert, sodass Tippen sie ersetzt.
- Der Name kommt aus dem gewählten Kandidaten; für den ersten Render aus
  `valueName`. Ist keiner bekannt, steht die Nummer allein — ohne Platzhalter,
  ohne „—".
- Ist der Wert leer, gilt `placeholder` wie heute.

**Kontenblatt-Icon.**

- Icon sitzt rechts im Feld, nach dem Eingabefeld, vor der Kandidatenliste.
- **Tastatur:** erreichbar per Tab nach dem Feld; `Enter`/`Space` löst aus.
  `aria-label="Kontenblatt zu <Nummer>"`, damit der Screenreader weiß, welches.
- Ist `value` leer, ist das Icon **deaktiviert**, nicht versteckt — sonst
  springt das Layout beim Tippen.
- Ein Klick auf das Icon schließt die Kandidatenliste nicht und ändert `value`
  nicht.

Client-Component (ist sie schon).

## Stories

Nach §6: zwei neue Stories, die anderen bleiben.

| Story | Beweist |
|---|---|
| `WithLedger` | Icon vorhanden, Rundlauf über `onOpenLedger` mit `useState`, leerer Wert → deaktiviert; `valueName` gesetzt |
| `NumberAndName` | ruhend „6815 Bürobedarf", fokussiert der reine Suchtext; daneben ein Wert ohne bekannten Namen — Nummer allein, kein Platzhalter |

Nicht anwendbar: Enum-Story (keine neue Enum-Prop), Layout-Boolean (keins).
Der Rand-Fall (langer Kontenname neben der Nummer im schmalen Feld) gehört zu
`NumberAndName`, nicht in eine eigene Story.

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

Anzeige:

- [ ] Ruhend steht Nummer **und** Name im Feld, sobald der Name bekannt ist (`NumberAndName`)
- [ ] Beim Fokussieren steht der reine Suchtext da, markiert; Tippen ersetzt ihn (`NumberAndName`)
- [ ] Wert ohne bekannten Namen zeigt die Nummer allein — kein Platzhalter, kein Nachschlagen (`NumberAndName`)
- [ ] `valueName` trägt den Namen über den ersten Render, ohne dass jemand die Liste öffnen muss (`WithLedger`)
- [ ] `onChange` gibt den Kandidaten als zweites Argument zurück; bei freier Eingabe `undefined`; bestehende Aufrufer bleiben übersetzbar (`pnpm typecheck`)
- [ ] Langer Kontenname bricht das Feld nicht auf (`NumberAndName`)

Kontenblatt:

- [ ] Ohne `onOpenLedger` erscheint kein Icon und kein leerer Platz (Story `WithCandidates` unverändert)
- [ ] Mit `onOpenLedger` und leerem `value` ist das Icon deaktiviert, nicht versteckt (`WithLedger`)
- [ ] Icon per Tab erreichbar, `Enter` löst aus, `aria-label` nennt die Kontonummer (`WithLedger`)
- [ ] `@when`-Zeile nennt den Weg zum Kontenblatt in einem Halbsatz
- [ ] `JournalEntryEditor` reicht sein `onOpenLedger` an die Felder durch, statt es selbst zu zeichnen — ohne Funktionsverlust (0015) — **offen (App)**

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
