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

Erste Abnahme (fremder Prüfer, 2026-09-05). Storybook Port 6107,
Chromium 1440×900; alle sechs `AccountField`-Stories geöffnet, das Feld
fokussiert, getippt, das Kontenblatt-Icon per Tab und Enter ausgelöst.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0, zu Beginn und am Ende — damit ist zugleich belegt, dass die erweiterte `onChange`-Signatur bestehende Aufrufer übersetzbar lässt. `pnpm build` bewusst nicht gestartet (schreibt nach `storybook-static`, parallele Abnahmen); zitiert wird der grüne Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/account/AccountField.tsx` neben `AccountField.stories.tsx`; `AccountField.stories.tsx:8` = `v3/Entitäten/Konto/AccountField` — Entität + Form, Gruppe wie im Skill | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` stehen an `AccountField` (`AccountField.tsx:46–47`), die neuen Props, ihre Typen und ihr JSDoc sind englisch. **Der Rumpf der Datei ist es nicht:** `REIHENFOLGE` (`:43`), `treffer`/`setTreffer` (`:92`), `abgebrochen` (`:111`), `außerhalb` (`:124`), `gruppen` (`:131`), `passt` (`:133`), `aus` (`:135`), `liste` (`:152`), `ruhend` (`:161`), `waehle` (`:163`) — dazu der deutsche Kopf-Block (`:8–22`) und rund ein Dutzend deutscher Kommentare, auch in den von dieser Aufgabe neu geschriebenen Stellen (`:93–94`, `:146–148`, `:159–160`, `:188`, `:220–221`). `CLAUDE.md`: „eine Datei, die ohnehin angefasst wird, bekommt englische Namen"; 0001 hatte Props, interne Namen und Kommentare ausdrücklich auf „beim Anfassen" vertagt. 0013 hat den Rumpf umgebaut und die Namen stehen lassen. Nicht betroffen sind die Werte von `AccountGroup` (`"aehnlich"`, `"belegposition"`) und die Texte in `ACCOUNT_GROUP_LABEL` — Domänenwerte und Nutzer-Strings bleiben laut 0001 deutsch | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" src/ui/v3/entities/account/AccountField.tsx` → keine Zeile. `ACCOUNT_GROUP_LABEL` ist keine Status-Map, sondern die Benennung der fünf Herkunftsgruppen dieser Entität; ein Status kommt in der Komponente nicht vor | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--with-candidates`, `--full-text-only`, `--no-match`, `--invalid`, `--with-ledger`, `--number-and-name` — die zwei neuen der Spec plus die vier bestehenden unverändert. Enum- und Layout-Boolean-Story im Abschnitt „Stories" als „nicht anwendbar" begründet, der Rand-Fall (langer Name) sitzt bewusst in `NumberAndName` und ist dort auch belegt | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, Zahlen in der Ziffernschrift (`.v2kf__num`), nichts zentriert. Fokus: das Feld und der Icon-Knopf sind per Tab erreichbar, `IconButton` bringt seinen Fokusring mit. Icon `width 14`, `stroke-width 1.5` (A8), `aria-hidden`, das Wort steht im `aria-label`/`title` des Knopfes — T8-Ausnahme greift nicht, weil hier gar kein sichtbares Wort verlangt ist: der Knopf ist konventionell, folgenlos und nicht der einzige Weg. Keine Transition in `.v2kf*`. Kein Emoji, kein Unicode-Zeichen. **Ein geerbter Befund:** `.v2kf__grp` (`v3.css:1242`) setzt `text-transform: uppercase`, die Gruppenköpfe stehen also als „ZULETZT BEI DIESER GEGENPARTEI" — A2 verlangt normale Schreibweise. Die Zeile stammt aus der Erstbestückung (`5ec5da6`), nicht aus dieser Aufgabe, und dieselbe Regel steht an 17 Stellen in `v3.css`; das gehört als eigene Aufgabe ans Set | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories geöffnet; Feld fokussiert, getippt, Kandidat gewählt, Icon getabbt und mit Enter ausgelöst (der Drawer ging auf) | ✓ |

**Variabel — Anzeige**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Ruhend steht Nummer **und** Name im Feld, sobald der Name bekannt ist | `--number-and-name`, erstes Feld: `input.className` endet auf `v2kf__in--ruhend`, daneben `.v2kf__shown` mit `.v2kf__num` = „6815" und `.v2kf__nm` = „Bürobedarf", `aria-hidden="true"` (der Wert steht im `input`, die Anzeige ist Fassade). Im Bild „**6815** Bürobedarf" | ✓ |
| Beim Fokussieren steht der reine Suchtext da, markiert; Tippen ersetzt ihn | `--number-and-name`, erstes Feld per `focus()`: `input.value` = „6815" (nicht „6815 Bürobedarf"), `selectionStart 0 / selectionEnd 4` — vollständig markiert; `.v2kf__shown` ist aus dem DOM. „68" getippt → `input.value` = „68", die Nummer ist ersetzt, nicht ergänzt | ✓ |
| Wert ohne bekannten Namen zeigt die Nummer allein — kein Platzhalter, kein Nachschlagen | `--number-and-name`, zweites Feld (`value="4980"`, `candidates={{}}`): `.v2kf__shown` fehlt, `input.value` = „4980", kein „—", kein sichtbarer Platzhalter. `AccountField.tsx:149–157` schlägt nur in `chosen` und `candidates` nach und gibt sonst `undefined` zurück — keine Ladung | ✓ |
| `valueName` trägt den Namen über den ersten Render | `--number-and-name`, drittes Feld: `value="6825"`, `candidates={{}}`, `valueName="Reinigung und Pflege der Geschäftsräume"` → ruhend steht „6825 Reinigung und Pflege der Geschäftsräume", ohne dass die Liste je offen war. (In `--with-ledger` ist `valueName` ebenfalls gesetzt, dort aber nicht beweiskräftig, weil die Kandidaten denselben Namen tragen) | ✓ |
| `onChange` gibt den Kandidaten als zweites Argument zurück; bei freier Eingabe `undefined`; bestehende Aufrufer bleiben übersetzbar | `AccountField.tsx:165` — `waehle()` ruft `onChange(k.number, k)`; `AccountField.tsx:197` — `onBlur` ruft `onChange(query.trim())`, das zweite Argument bleibt `undefined`. Typ `(number: string, account?: AccountCandidate) => void` (`:72`); `pnpm typecheck` grün, die Stories übergeben weiter einen einstelligen `setV` | ✓ |
| Langer Kontenname bricht das Feld nicht auf | `--number-and-name`, drittes Feld (Breite 300 px, Name 39 Zeichen): `.v2kf__box` bleibt 34 px hoch — dieselbe Höhe wie die beiden Felder darüber; `.v2kf__nm` hat `text-overflow: ellipsis` und kürzt („Reinigung und Pflege der Gesc…"); das Kontenblatt-Icon steht bei `right 313` innerhalb der Box (`right 316`), wird also nicht hinausgeschoben | ✓ |

**Variabel — Kontenblatt**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Ohne `onOpenLedger` erscheint kein Icon und kein leerer Platz | `--with-candidates` (unverändert, ohne `onOpenLedger`): `.v2kf__ledger` nicht im DOM, `input.className` ohne `v2kf__in--ledger`, `padding-right` 10 px wie an jedem Feld, Eingabefeld 380 px = volle Boxbreite. Kein reservierter Streifen | ✓ |
| Mit `onOpenLedger` und leerem `value` ist das Icon deaktiviert, nicht versteckt | `--with-ledger`, zweites Feld (`value=""`): der Knopf ist im DOM, Breite > 0, `disabled = true`, `aria-label` = „Kontenblatt". Das Layout springt beim ersten Zeichen also nicht | ✓ |
| Icon per Tab erreichbar, `Enter` löst aus, `aria-label` nennt die Kontonummer | `--with-ledger`, erstes Feld: Fokus ins Feld, Escape, Tab → `document.activeElement` ist `button.v2ibtn.v2ibtn--sm` mit `aria-label="Kontenblatt zu 6815"` (und demselben Text im `title`). Enter darauf → der Drawer geht auf, im Text steht „Kontenblatt 6815 · Saldo 4.208,55 €". Bei leerem Wert heißt es nur „Kontenblatt" | ✓ |
| `@when`-Zeile nennt den Weg zum Kontenblatt in einem Halbsatz | `AccountField.tsx:46`: „… — and, with `onOpenLedger`, the way to its account sheet." | ✓ |
| `JournalEntryEditor` reicht sein `onOpenLedger` an die Felder durch, statt es selbst zu zeichnen (0015) | In der Spec bereits als **offen (App)** ausgewiesen; gehört zu 0015. `src/ui/v3/entities/journal-entry/JournalEntryEditor.tsx` wird zudem gerade von einer anderen Sitzung bearbeitet und war für diese Abnahme kein Prüfgegenstand | offen (App) |

Abgenommen von / am: — · Status zurück auf **in Arbeit**. Ein Mangel:

1. **Die Datei ist beim Umbau nicht auf Englisch mitgezogen worden.** Zehn
   interne Bezeichner (`REIHENFOLGE`, `treffer`, `abgebrochen`, `außerhalb`,
   `gruppen`, `passt`, `aus`, `liste`, `ruhend`, `waehle`), der Kopf-Block und
   rund ein Dutzend Kommentare stehen weiter auf Deutsch — auch an den
   Stellen, die 0013 selbst neu geschrieben hat. `CLAUDE.md` und der Umfang
   von 0001 verlangen genau hier die Umbenennung: „werden je Datei beim
   Anfassen mitgenommen". Nutzer-Strings (`ACCOUNT_GROUP_LABEL`, der
   Leertext, `ariaLabel`) und die Domänenwerte von `AccountGroup` bleiben
   selbstverständlich deutsch.

Alles Fachliche der Aufgabe — Nummer und Name, `valueName`, das erweiterte
`onChange`, das Kontenblatt-Icon samt Tastaturweg und deaktiviertem Zustand —
ist gebaut und belegt; es fehlt nur der Sprachschnitt.

**Beiläufig geprüft (0087).** Das Kontenblatt-Zeichen kommt jetzt über
`ActionIcon action="ledger"`; im DOM steht weiter `lucide-book-open-text`,
`width 14`, `stroke-width 1.5` — dasselbe Zeichen an derselben Stelle wie vor
`f58caa2`. Nichts verschwunden, nichts gesprungen.

## Der Mangel der Abnahme vom 2026-09-05 — behoben

**Die Datei ist jetzt auf Englisch.** Zehn Bezeichner umbenannt
(`REIHENFOLGE` → `GROUP_ORDER`, `treffer` → `hits`, `abgebrochen` →
`cancelled`, `außerhalb` → `outside`, `gruppen` → `groups`, `passt` →
`matches`, `aus` → `out`, `liste` → `list`, `ruhend` → `resting`, `waehle` →
`choose`), dazu der Kopf-Block und die zwölf Kommentare. Nutzer-Strings
bleiben deutsch: `ACCOUNT_GROUP_LABEL`, der Leertext, `ariaLabel`, das Label
des Kontenblatt-Knopfes — und die Domänenwerte von `AccountGroup`
(`aehnlich`, `belegposition`), die kein Anzeigetext sind, sondern Schlüssel
des Bestands.

Mitgenommen, weil die Datei ohnehin offen war:

- Die eine deutsche Klasse heißt jetzt `.v2kf__in--rest` statt
  `--ruhend` (eine Zeile in `v3.css`). Die übrigen `v2kf__*` sind
  Abkürzungen ohne Sprache.
- Die Liste trug eine feste `id="v2kf-liste"`, auf die `aria-controls`
  zeigte — zwei Kontofelder auf einer Seite verwiesen damit auf dieselbe
  Liste. Jetzt `useId()`, derselbe Punkt wie in 0021 und 0028. Gemessen in
  `NumberAndName`: drei Felder, drei verschiedene `aria-controls`
  (`_r_0_`, `_r_1_`, `_r_2_`).

Nachgemessen (Chromium headless, Story `NumberAndName`): ruhend steht
„6815 Bürobedarf" im Feld, beim Fokussieren „6815" allein und die Liste
öffnet — das Verhalten hat sich durch die Umbenennung nicht verschoben.

## Abnahmekriterien (Nachtrag)

- [ ] Kein deutscher Bezeichner und kein deutscher Kommentar mehr in `AccountField.tsx` (`grep`)
- [ ] Nutzer-Strings und die Domänenwerte von `AccountGroup` sind unverändert deutsch
- [ ] Zwei Kontofelder auf einer Seite zeigen mit `aria-controls` auf verschiedene Listen (Story `NumberAndName`, im DOM gemessen)
- [ ] Anzeige und Tastaturweg unverändert (Stories `NumberAndName`, `WithLedger`)
