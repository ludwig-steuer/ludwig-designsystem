# 0013 · AccountField — Nummer und Name, Kontenblatt-Icon

| | |
|---|---|
| Status | fertig |
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

## Abnahme des Nachtrags, 2026-09-05

Dritte Abnahme, fremder Prüfer; gebaut hat jemand anders, geprüft wurde gegen
Spec und Code. Storybook auf `localhost:6107`, Chromium headless 1440 × 900
über CDP gefahren — echte Tastendrücke (`Input.dispatchKeyEvent`), echte
Zeichen (`Input.insertText`), gemessen im DOM. Alle sechs Stories geöffnet,
keine Konsolenmeldung in einer davon. Die Story-IDs stehen hier lesbar; in der
URL sind die Umlaute kodiert (`entitäten` → `entit%C3%A4ten`).

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, Exit 0. `pnpm build` bewusst nicht gestartet: er schreibt nach `storybook-static`, und hier arbeiten mehrere Sitzungen parallel — dieselbe Begründung wie in den beiden Abnahmen davor | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/account/AccountField.tsx` neben `AccountField.stories.tsx`; Titel `v3/Entitäten/Konto/AccountField` (`AccountField.stories.tsx:8`) — Entität + Form | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | jetzt vollständig, siehe die Nachtragstabelle unten. `@when`/`@instead` an `AccountField` (`AccountField.tsx:46–48`), ein Export | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px\|fontSize" AccountField.tsx` → keine Zeile. `ACCOUNT_GROUP_LABEL` benennt die fünf Herkunftsgruppen dieser Entität, keinen Status | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--with-candidates`, `--full-text-only`, `--no-match`, `--invalid`, `--with-ledger`, `--number-and-name`; Enum- und Layout-Boolean-Story im Abschnitt „Stories" begründet ausgeschlossen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Nummer in der Ziffernschrift (`.v2kf__num`), Text links, nichts zentriert · Icon Lucide `width 14`, `stroke-width 1.5`, `aria-hidden`, das Wort steht im `aria-label` und im `title` des Knopfes · Fokusring bringt `IconButton` mit · kein Emoji. Der geerbte Befund steht unverändert da: `.v2kf__grp` (`v3.css:1237`) setzt `text-transform: uppercase`, die Gruppenköpfe lesen sich als Versalien — A2. Die Regel steht an 17 Stellen in `v3.css` und gehört als eigene Aufgabe ans Set, nicht hierher | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sechs Stories geöffnet, Feld fokussiert, getippt, Icon getabbt und mit Enter ausgelöst (der Drawer ging auf); Konsole in allen dreien der geprüften Stories leer | ✓ |

**Nachtrag (die vier Kriterien dieser Runde)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Kein deutscher Bezeichner und kein deutscher Kommentar mehr in `AccountField.tsx` | die zehn gerügten Namen sind weg: `grep -nE '(REIHENFOLGE\|treffer\|waehle\|liste\|gruppen\|passt\|außerhalb\|abgebrochen\|ruhend)' AccountField.tsx` → keine Zeile. `grep -nE '[äöüÄÖÜß]'` findet nur noch zwei Zeilen, und beide sind Nutzer-Text (`:39` „Ähnliche Belege", `:238` der Leertext). Der Kopf-Block (`:7–24`) und alle Kommentare sind englisch gelesen | ✓ |
| Nutzer-Strings und die Domänenwerte von `AccountGroup` sind unverändert deutsch | `git show 4e505a9 -- AccountField.tsx` fasst weder `AccountGroup` (`:34`, `aehnlich`, `belegposition`) noch `ACCOUNT_GROUP_LABEL` (`:36–42`) an — die einzige Zeile mit diesen Namen im Diff ist die Umbenennung `REIHENFOLGE` → `GROUP_ORDER`. Im Browser stehen weiter „Vorschlag des Agenten", „Zuletzt bei dieser Gegenpartei", „Kontenblatt zu 6815", „Nummer oder Name" | ✓ |
| Zwei Kontofelder auf einer Seite zeigen mit `aria-controls` auf verschiedene Listen | `--number-and-name`, drei Felder: `aria-controls` = `_r_0_`, `_r_1_`, `_r_2_` — drei Werte, drei verschieden (`new Set(...).size === 3`). Die feste `id="v2kf-liste"` ist durch `useId()` ersetzt (`AccountField.tsx:103`, benutzt `:188` und `:235`) | ✓ |
| Anzeige und Tastaturweg unverändert | siehe die beiden Tabellen darunter — jedes Kriterium der ersten Abnahme neu gemessen, keins ist durch die Umbenennung verrutscht | ✓ |

**Variabel — Anzeige (neu gemessen, weil die Umbenennung den Rumpf angefasst hat)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Ruhend steht Nummer **und** Name im Feld | `--number-and-name`, erstes Feld: `input.className` = `v2in v2kf__in v2kf__in--rest`, daneben `.v2kf__shown` mit `.v2kf__num` „6815" und `.v2kf__nm` „Bürobedarf". Die Klasse heißt jetzt `--rest` statt `--ruhend` (`v3.css:1260`), die Wirkung ist dieselbe | ✓ |
| Beim Fokussieren steht der reine Suchtext da, markiert; Tippen ersetzt ihn | `--number-and-name`, erstes Feld fokussiert: `input.value` = „6815" (nicht „6815 Bürobedarf"), `selectionStart 0 / selectionEnd 4`, `.v2kf__shown` aus dem DOM, Liste offen. Danach „68" über `Input.insertText` getippt → `input.value` = „68"; die Nummer ist ersetzt, nicht ergänzt | ✓ |
| Wert ohne bekannten Namen zeigt die Nummer allein | `--number-and-name`, zweites Feld (`value="4980"`, `candidates={{}}`): `.v2kf__shown` fehlt, `input.value` = „4980", kein „—". `AccountField.tsx:155–163` schlägt nur in `chosen` und `candidates` nach | ✓ |
| `valueName` trägt den Namen über den ersten Render | `--with-ledger`, erstes Feld: `.v2kf__shown` = „6815Bürobedarf", ohne dass die Liste je offen war; zweites Feld (leer) hat keine. Gegenprobe `--number-and-name`, drittes Feld: `value="6825"`, `candidates={{}}`, `valueName` gesetzt → „6825 Reinigung und Pflege der Geschäftsräume" | ✓ |
| `onChange` gibt den Kandidaten als zweites Argument zurück; bestehende Aufrufer bleiben übersetzbar | `AccountField.tsx:169–174` — `choose()` ruft `onChange(c.number, c)`; `:201–204` — `onBlur` ruft `onChange(query.trim())`, das zweite Argument bleibt `undefined`. Typ `(number: string, account?: AccountCandidate) => void` (`:73`), `pnpm typecheck` grün mit den einstelligen `setV` der Stories | ✓ |
| Langer Kontenname bricht das Feld nicht auf | `--number-and-name` (Feldbreite 300 px, Name 39 Zeichen): alle drei `.v2kf__box` sind 34 px hoch, auch das mit dem langen Namen; `.v2kf__nm` kürzt mit Ellipse | ✓ |

**Variabel — Kontenblatt**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Ohne `onOpenLedger` erscheint kein Icon und kein leerer Platz | `--with-candidates`: `.v2kf__ledger` nicht im DOM, `input.className` ohne `v2kf__in--ledger`, `padding-right` 10 px, Eingabefeld 380 px = volle Boxbreite | ✓ |
| Mit `onOpenLedger` und leerem `value` ist das Icon deaktiviert, nicht versteckt | `--with-ledger`, zweites Feld (`value=""`): Knopf im DOM, Breite 24 px, `disabled = true`, `aria-label` = „Kontenblatt" | ✓ |
| Icon per Tab erreichbar, `Enter` löst aus, `aria-label` nennt die Kontonummer | `--with-ledger`: Fokus ins erste Feld, `Escape`, `Tab` → `document.activeElement` = `button.v2ibtn.v2ibtn--sm` mit `aria-label="Kontenblatt zu 6815"`. `Enter` darauf → der Drawer geht auf: „Kontenblatt 6815 · Saldo 4.208,55 € · 31 Buchungen im Zeitraum". Beide Tastendrücke echt über CDP | ✓ |
| `@when`-Zeile nennt den Weg zum Kontenblatt in einem Halbsatz | `AccountField.tsx:47`: „… — and, with `onOpenLedger`, the way to its account sheet." | ✓ |
| `JournalEntryEditor` reicht sein `onOpenLedger` an die Felder durch (0015) | in der Spec selbst als **offen (App)** ausgewiesen und Gegenstand von 0015; `JournalEntryEditor.tsx` wird zudem gerade von einer anderen Sitzung bearbeitet | offen (App) |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Das Kontenblatt-Zeichen** kommt über `ActionIcon action="ledger"` (0087); im
  DOM steht `lucide-book-open-text`, `width 14`, `stroke-width 1.5` — dasselbe
  Zeichen an derselben Stelle wie vorher.
- **Die Story-Datei ist noch nicht mitgezogen.** `AccountField.stories.tsx`
  trägt deutsche Bezeichner (`leer`/`setLeer`, `blatt`/`setBlatt`,
  `bekannt`, `fremd`, `lang`, `:110–111`, `:161–163`). Das Kriterium des
  Nachtrags nennt ausdrücklich `AccountField.tsx`, und die Story-Exportnamen
  sind englisch; die Hausregel „Code nur Englisch" gilt aber auch dort. Kein
  Mangel dieser Aufgabe — ein Satz für die nächste Sitzung, die die Datei
  ohnehin öffnet.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05

## Nachtrag 2026-10-01 — die Kontenliste in der obersten Ebene (llcto, Owner-Demo)

Befund bei der Abnahme der Editor-Spurbreiten (0015, H1), **vorbestehend seit 0044
(7390c50)**: Im `JournalEntryEditor` scrollt die Tabelle (`.bse__tbl`) quer und
damit auch senkrecht. Die Liste des `AccountField` stand absolut unter dem Feld
und wurde abgeschnitten — sichtbar blieb nur „Vorschlag von Ludwig", die Tabelle
scrollte senkrecht. Wer in der Fall-Ansicht ein Konto ändert, sah das.

Behoben:

- Die Liste ist ein `popover="manual"` in der obersten Ebene (wie die
  Popover-Familie 0038): `position: fixed`, links und unten am Feld, **mindestens
  so breit wie das Feld, wenigstens 20 rem** (in einer Journal-Zelle ist das Feld
  148 px — Nummer, Name und Grund passen dort nicht), nie über den Fensterrand;
  ohne Platz darunter klappt sie nach oben. Beim Scrollen eines beliebigen
  Vorfahren (und beim Größenändern) läuft sie mit.
- Schließen unverändert: Klick außerhalb des Felds (die Liste bleibt im DOM unter
  dem Feld, `contains` trifft sie), Escape, Wahl.

Gemessen (1280 × 900): `JournalEntryEditor --s-2-split-full`, Fokus ins erste
Kontofeld → Liste offen in der obersten Ebene, 320 × 168 px ab 4 px unter dem Feld,
beide Gruppen und alle Einträge sichtbar, kein Name gekürzt; die Tabelle bleibt
210 px hoch (kein senkrechtes Scrollen); nach scrollLeft 100 steht die Liste wieder
bündig am Feld (339 = 339); Klick auf „6600" setzt den Wert und schließt;
Escape schließt. `AccountField --with-candidates` (380 px Feld): Liste 380 px breit,
4 px unter dem Feld; keine Konsolenfehler.

Kriterien für die fremde Abnahme:

- [x] Im Editor (`--s-2-split-full`, `BookingReview --case-editable`) ist die Kontenliste ganz sichtbar, nicht abgeschnitten, und die Tabelle scrollt nicht senkrecht
- [x] Liste mindestens feldbreit, ≥ 20 rem, nie über den Fensterrand; klappt nach oben, wenn unten kein Platz ist (Fenster flach machen)
- [x] läuft beim Querscrollen der Tabelle und beim Scrollen der Seite mit
- [x] Tastatur und Wahl wie vorher: Enter wählt den ersten Treffer, Escape schließt, Klick auf einen Eintrag setzt ihn, Klick außerhalb schließt, Tippen öffnet
- [x] eigene Stories `AccountField --*` unverändert bedienbar

### Fremde Abnahme Nachtrag Kontenliste 2026-10-01

Stand `82090ad`. Bedient in einem eigenen Playwright-Kontext (1280 × 900, `de-DE`)
gegen Storybook 6107, mit Klicks, Mausrad und Tasten; gemessen über
`getBoundingClientRect` und `elementFromPoint` (Mitte jedes Gruppenkopfs und
jedes Eintrags).

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| 1 Im Editor ganz sichtbar, Tabelle scrollt nicht senkrecht | `--s-2-split-full`, erstes Kontofeld (148 px) angeklickt, geleert: Liste `:popover-open`, `position: fixed`, 320 × 190 px, 4 px unter dem Feld; beide Gruppen und beide Einträge per `elementFromPoint` getroffen, kein Name gekürzt; `.bse__tbl` scrollHeight 210 = clientHeight 210, scrollTop 0. Zweites Feld (Wert 6600): 320 × 74, „Alle Konten · 6600" getroffen, Tabelle 210 = 210. `BookingReview --case-editable` (ein Kontofeld, 148 px): Liste 320 × 80, 4 px unter dem Feld, ganz getroffen; `.bse__tbl` 143 = 143. Gegenprobe mit der alten absoluten Liste (im Browser nachgestellt): `.bse__tbl` 359 zu 210 — der Befund ist damit wirklich weg | ✓ |
| 2 Breite ≥ Feld und ≥ 20 rem, nie über den Fensterrand; klappt nach oben | Editor: 320 px = 20 rem bei 148-px-Feld; `AccountField --with-candidates` 380 → 380; `--number-and-name` 300 → 320. Fenster 900 px, `scrollLeft` 0 / 108 / 216: Liste links 439 / 331 / 223, rechts 759 / 651 / 543 — immer im Fenster. Fenster 700 px (Klemme geprüft): Feld bei 439, Liste bei 372, rechts 692 = 700 − 8. Fenster 1280 × 400, zweites Feld (235–264) geleert: Liste 41–231, also **über** dem Feld, 4 px Abstand; erstes Feld (unten Platz): unter dem Feld | ✓ |
| 3 Läuft beim Querscrollen und beim Scrollen der Seite mit | Mausrad quer über der Tabelle: `scrollLeft` 120, Feld 439 → 319, Liste 439 → 319, Abstand 4 px; zurück auf 0 → beide 439. Fenster 1280 × 400, Mausrad senkrecht neben der Liste: `scrollY` 60, Feld oben 168 → 108, Liste 202 → 142, Abstand 4 px | ✓ |
| 4 Tastatur und Wahl wie vorher | Editor: von „Umsatz" 3 × Tab ins Kontofeld → Liste offen; Escape → zu; „Porto" getippt → offen, gefiltert auf 6820 (dazu 6600 aus der Volltextsuche); Enter → 6820, zu; Tab → ruhend „6820 Porto". Frei „6820" getippt, Tab → ruhend „6820 Porto": der Fokusverlust meldet den Wert (`onChange`). Klick auf „6820" im zweiten Feld → Wert 6820, zu. „6600" getippt, Klick außerhalb → zu. Tab vom Feld auf einen Eintrag: Fokusring 2 px solid `rgb(59, 143, 196)`, `:focus-visible`; Enter darauf → „6600 Werbekosten" | ✓ |
| 5 Eigene Stories unverändert bedienbar, keine Konsolenfehler | Alle sechs `AccountField --*`, jedes Feld: Fokus öffnet (4 px unter dem Feld, Breite ≥ Feld, alles getroffen), Escape schließt, Tippen „68" öffnet, Enter wählt den ersten Treffer (6815 / 6805 / 6815 / 6815), Klick außerhalb schließt; 0 Konsolenfehler. `--with-ledger`: Kontenblatt-Knopf (24 × 24) bei offener Liste geklickt → „Kontenblatt 6815", Liste bleibt. `PaymentAccountField` (6 Stories): `<select>`, kein `AccountField`, Wahl geht, 0 Fehler | ✓ |
| Prüfliste Bedienung (`CLAUDE.md` §2) | Einträge 37,9–59,7 px hoch, 320 px breit (≥ 24 px); Hover `rgb(244, 246, 248)` nur auf Einträgen, Gruppenköpfe ohne Hover. Keine Tastaturfalle: Tab vom Feld → beide Einträge → „Belegfeld 1", Shift+Tab zurück bis ins Feld. Fokusring an Feld und Eintrag sichtbar. Verdeckter Fokus siehe B1 — vorbestehend | ✓ |
| `pnpm typecheck`, `check:language`, `check:when` | alle drei Exit 0 („0 German comment lines left", „in Ordnung"). `pnpm build` auftragsgemäß nicht gestartet | ✓ |

**Befunde ohne Mangel dieses Nachtrags** (alle vorbestehend, nicht durch `82090ad`):

- **B1 — die Liste bleibt offen, wenn der Fokus per Tab das Feld verlässt.**
  Geschlossen wird nur über Klick außerhalb (`AccountField.tsx:138`), Escape
  oder Wahl; `onBlur` (`:242`) meldet nur den Wert. Im Editor: Tab aus dem
  ersten Kontofeld → die Liste steht weiter; erreicht Tab das Kontofeld und
  „Belegfeld 1" der zweiten Zeile, sind beide **ganz verdeckt**
  (`elementFromPoint` an fünf Punkten 0 von 5), zwei Listen sind offen. Das
  verletzt „Fokus nicht verdeckt" (2.4.11). Mit der alten absoluten Liste
  nachgestellt: dasselbe Bild (0 von 5) — also nicht neu. Vorschlag als eigene
  Aufgabe: bei `focusout`, dessen `relatedTarget` außerhalb des Felds liegt,
  schließen.
- **B2 — doppelter React-Schlüssel „all".** Bringt der Aufrufer `candidates.all`
  mit und liefert die Suche Treffer, gibt es zwei Gruppen mit `key="all"`
  (`AccountField.tsx:155`, `:283`). Gesehen bei der Gegenprobe in
  `RecurringRuleEditor --filled`, `--modes`, `--error`, `--in-use`, `--edges`:
  Konsolenfehler beim Fokussieren. Die eigenen Stories sind sauber.
- **B3 — kein Platz unten und keiner oben.** Bei 1280 × 330 hängt die Liste
  im Editor unter dem Feld bis 392 px, der letzte Eintrag liegt unter dem
  Fensterrand; nach 80 px Seitenscrollen ist alles erreichbar (Abstand bleibt
  4 px). `max-height` wird nicht auf den freien Platz gekürzt — außerhalb
  des Desktop-Ziels, nur notiert.
- **B4 — nach der Wahl steht der Fokus auf `body`.** Klick oder Enter auf
  einen Eintrag (`:292`) entfernt den Knopf; der Fokus kehrt nicht ins Feld
  zurück, der nächste Tab beginnt am Seitenanfang.
- **B5 — `BookingReview --case-editable` reicht keine Kandidaten.** Die Liste
  zeigt dort auch bei leerem Feld `Kein Konto zu „" — weder unter den
  Vorschlägen noch im Kontenrahmen.` — der Leertext für „nie befüllt" fehlt.
  Story- bzw. Datenfrage, für dieses Kriterium ohne Belang (der Kasten ist ganz
  sichtbar).

**Urteil: abgenommen.** Alle fünf Kriterien erfüllt, abgehakt. B1 sollte als
eigene Aufgabe ans Set (Bedienung, WCAG 2.4.11); B2 als Hinweis an den, der
`AccountField` oder `RecurringRuleEditor` als Nächstes öffnet.

Abgenommen von / am: Claude (fremder Abnehmer), 2026-10-01

### Nacharbeit Kontenliste 2026-10-01 (Befunde der Abnahme, vorbestehend)

| Punkt | Änderung | Stand |
|---|---|---|
| B1 Tab aus dem Feld ließ die Liste offen (verdeckte die nächste Zeile, WCAG 2.4.11) | `onBlur` (focusout) am Rahmen `.v2kf`: verlässt der Fokus Feld **und** Liste, schließt sie. Tab geht weiter erst durch die Einträge. Gemessen `--s-2-split-full`: Feld → Tab → Eintrag 1 → Tab → Eintrag 2 (Liste offen) → Tab → „Belegfeld 1", Liste zu | behoben |
| B2 doppelter React-Schlüssel „all" | Gruppen- und Eintragsschlüssel mit Index | behoben |
| B4 Fokus nach der Wahl auf `body` | Einträge mit `onMouseDown` ohne Fokuswechsel: das Feld behält den Fokus, auch nach der Wahl (gemessen: Wahl „6600", Fokus im Feld, Liste zu) | behoben |
| B3 weder unten noch oben Platz | außerhalb des Desktop-Ziels | offen |
| B5 Leertext bei nie befülltem Feld ohne Kandidaten | eigener Punkt (drei Leertexte, T6) | offen |

### Nachprüfung Kontenliste 2026-10-01 (Stand d1bb70a)

Fremder Nachprüfer, nichts gebaut. Bedient in eigenen Playwright-Kontexten
(1280 × 900, `de-DE`) gegen Storybook 6107, mit Klicks, Mausrad und Tasten;
Fokus über `document.activeElement`, Verdeckung über `elementFromPoint` (Mitte
und vier Ecken des fokussierten Elements), offene Listen über
`.v2kf__pop:popover-open`. `AccountField.tsx` im Arbeitsbaum = `d1bb70a`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| B1 Tab aus Feld und Liste schließt | `--s-2-split-full`, erstes Kontofeld geleert: Liste offen (beide Gruppen, 6815 und 6820) → Tab „6815" offen → Tab „6820" offen → Tab „Belegfeld 1": **zu**, Fokus 5 von 5 Punkten sichtbar. Shift+Tab aus dem Feld → „Steuerschlüssel", zu. Shift+Tab von einem Eintrag zurück ins Feld → bleibt offen. Ganze Seite 40 × Tab vom Anfang: jedes fokussierte Element 5/5 sichtbar, höchstens **eine** Liste offen; Klick ins erste, dann ins zweite Kontofeld → eine offen | ✓ |
| B2 doppelter Schlüssel | `RecurringRuleEditor --new`, `--filled`, `--modes`, `--invalid`, `--error`, `--interactive`, `--in-use`, `--edges` (`--pending` gesperrt): jedes Kontofeld fokussiert und „68" getippt; der Fall tritt auf (zwei Gruppen „Alle Konten"), **0** Konsolenmeldungen „same key", 0 sonstige Fehler | ✓ |
| B4 Klick auf einen Eintrag | Editor: Klick auf „6820" → Wert 6820, Liste zu, `activeElement` = Kontofeld; Tab → „Belegfeld 1", ruhend „6820 Porto". `AccountField --with-candidates`, `--with-ledger`, `--number-and-name`: Klick auf den ersten Eintrag → Wert gesetzt, zu, Fokus im Feld | ✓ |
| B4 Enter auf einen Eintrag (Tastaturweg, Teil des Befunds B4) | Editor, Feld geleert, Tab auf „6815", Enter → Wert 6815, Liste zu, **`activeElement` = `body`**; dasselbe in `AccountField --with-candidates` (Leertaste danach landet nirgends). Kein Fokusring mehr sichtbar | ✗ |
| Kriterium 1 im Editor ganz sichtbar | Liste 320 × 190 bei 148-px-Feld, 4 px darunter, beide Gruppenköpfe und beide Einträge per `elementFromPoint` getroffen; `.bse__tbl` 210 = 210 | ✓ |
| Kriterium 3 läuft beim Querscrollen mit | Mausrad quer über der Tabelle: `scrollLeft` 120, Feld 439 → 319, Liste 439 → 319, Abstand 4 px | ✓ |
| Kriterium 4 Tastatur und Wahl | Escape → zu; „Porto" getippt → offen, 6820 und 6600; Enter → 6820, zu, Fokus im Feld; „6820" frei getippt, Tab → ruhend „6820 Porto" (Fokusverlust meldet den Wert); „6600" getippt, Klick außerhalb → zu, Wert 6600 gemeldet | ✓ |
| Kriterium 5 eigene Stories | alle sechs `AccountField --*`: Fokus öffnet, Wahl bzw. Leertext, Shift+Tab schließt, 0 Konsolenfehler; `--with-ledger`: Kontenblatt-Knopf 24 × 24 bei offener Liste → „Kontenblatt 6815" | ✓ |
| `pnpm typecheck`, `check:language`, `check:when` | alle drei Exit 0 („0 German comment lines left", „in Ordnung"); `pnpm build` auftragsgemäß nicht gestartet | ✓ |

**Mangel**

- **M1 — B4 nur für die Maus behoben.** Der Befund lautete „Klick **oder Enter**
  auf einen Eintrag"; die Nacharbeit verhindert nur den Fokuswechsel beim
  Mausdruck (`onMouseDown` mit `preventDefault`, `AccountField.tsx:305`). Wer
  per Tab auf einen Eintrag geht und Enter drückt, hat den Fokus auf dem Knopf;
  `choose()` (`:209`) schließt die Liste, der Knopf verschwindet, der Fokus fällt
  auf `body`. Folge: kein sichtbarer Fokus mehr (2.4.7), Tippen geht ins Leere.
  Die Zeile „das Feld behält den Fokus, auch nach der Wahl" in der Nacharbeit
  stimmt damit nur für den Klick. Abhilfe: nach der Wahl den Fokus ans Feld
  zurückgeben — ohne dass `onFocus` die Liste wieder öffnet.

**Hinweise ohne Mangel**

- **H1 — Klick auf einen Gruppenkopf schließt die Liste.** Der Kopf ist nicht
  fokussierbar, der Fokus fällt auf `body`, `relatedTarget` ist `null`, das neue
  `onBlur` schließt. Folgerichtig zu B1 und unschädlich; wer es ruhig will, setzt
  das `preventDefault` beim Mausdruck an die ganze Liste statt an jeden Eintrag.
- **H2 — zwei Gruppen „Alle Konten" mit demselben Konto.** `RecurringRuleEditor
  --filled`, erstes Kontofeld: „Alle Konten: 10001 | Alle Konten: 10001". Der
  Index im Schlüssel beseitigt die React-Warnung, die Doppelung bleibt sichtbar
  (die Treffer der Suche gehören in die Gruppe des Aufrufers oder werden gegen
  sie abgeglichen). Eigener Punkt, nicht Teil von B2.
- **H3 — `--with-ledger`: die Liste schließt jetzt, wenn das Kontenblatt
  aufgeht** (der Fokus wandert in den Drawer). Die Abnahme vom Stand `82090ad`
  sah „Liste bleibt"; das neue Verhalten ist das richtige.
- Den Klick auf die Bildlaufleiste einer langen Liste (sieben Einträge, 378 zu
  318 px) konnte der Prüfbrowser nicht messen: er blendet Bildlaufleisten aus.

**Urteil: nicht abgenommen — ein Mangel (M1, Tastaturweg von B4).** B1 und B2
sind behoben, die fünf Kriterien des Nachtrags halten. Nach M1 genügt eine
Nachprüfung des Tastaturwegs (Tab auf Eintrag, Enter → Fokus im Feld, Liste zu)
und eine Stichprobe von B1. B3 und B5 bleiben offen.

Nachgeprüft von / am: Claude (fremder Nachprüfer), 2026-10-01

### Nacharbeit 2 2026-10-01 (nach der Nachprüfung, Stand d1bb70a)

| Punkt | Was getan |
|---|---|
| **M1** | Nach der Wahl per Tastatur (Tab auf den Eintrag, Enter) stand der Fokus auf dem Eintrag, der verschwindet — er fiel auf `body`. `choose()` gibt ihn jetzt ans Feld zurück, wenn er nicht schon dort ist; ein Merker hält `onFocus` davon ab, die Liste wieder zu öffnen. Der Satz „das Feld behält den Fokus, auch nach der Wahl" gilt damit für Klick **und** Enter |
| **H1** | `preventDefault` beim Mausdruck sitzt an der ganzen Liste statt an jedem Eintrag: Gruppenkopf und Bildlaufleiste lassen den Fokus im Feld, die Liste bleibt offen |
| H2 | zweimal „Alle Konten" mit demselben Konto in `RecurringRuleEditor --filled` — eigener Punkt, offen |

Nachzuprüfen: Tab auf Eintrag, Enter → Wert gesetzt, Liste zu, Fokus sichtbar im Feld, Tippen geht ins Feld; Klick auf Gruppenkopf → Liste bleibt offen; B1 stichprobenartig.

### Nachprüfung 2 Kontenliste 2026-10-01 (Stand 2704864)

Fremder Nachprüfer, nichts gebaut. Bedient in eigenen Playwright-Kontexten
(1280 × 900, `de-DE`) gegen Storybook 6107, mit echten Tasten
(`keyboard.press`) und echten Mausklicks auf die Mitte des Ziels; jeder Schritt
in einem eigenen Aufruf, gemessen 50–750 ms danach. Fokus über
`document.activeElement` und `:focus-visible`, Ring über `getComputedStyle`,
Verdeckung über `elementFromPoint` (Mitte und vier Ecken), offene Listen über
`.v2kf__pop:popover-open`, gemeldeter Wert über die ruhende Anzeige
(`.v2kf__shown` zeigt Nummer und Name erst, wenn `value` gesetzt ist).
`AccountField.tsx` im Arbeitsbaum (HEAD `61d24cb`) = `2704864`; der Unterschied
zu `6af4375` ist genau die Nacharbeit 2 (Feld-Ref mit Merker `quiet` in
`choose()` und `onFocus`, `onMouseDown` mit `preventDefault` von den Einträgen
an die Liste verlegt).

| Kriterium | Messung | Urteil |
|---|---|---|
| M1 im Editor (`JournalEntryEditor --s-2-split-full`) | Erstes Kontofeld (148 px, Wert 6815) angeklickt, geleert: Liste mit „Vorschlag von Ludwig · 6815" und „Zuletzt bei dieser Gegenpartei · 6820". Tab → „6815" (Ring 2 px solid `rgb(59, 143, 196)`, `:focus-visible`). Enter → Feld „6815", 0 Listen offen, `aria-expanded="false"`, **`activeElement` = Kontofeld**, `:focus-visible`, Ring Rand `rgb(26, 58, 92)` + 3 px `rgba(59, 143, 196, 0.14)` (derselbe wie beim gewöhnlichen Fokus), 5 von 5 Punkten sichtbar. Nach 650 ms weiter zu — die Rückgabe öffnet nicht. „68" getippt → steht im Feld („681568", siehe H6), Liste öffnet erst jetzt. Zweiter Weg: Tab, Tab auf „6820", Enter → 6820, Fokus im Feld; Tab → „Belegfeld 1" (nicht der Seitenanfang), ruhend „6820 Porto". Leertaste auf einem Eintrag wirkt wie Enter (6815, Fokus im Feld) | ✓ |
| M1 in `AccountField --with-candidates` (380 px) | Geleert: vier Gruppen. Tab, Tab auf „6820", Enter → 6820, zu, `activeElement` = Feld, `:focus-visible`, Ring wie oben; nach 750 ms weiter zu; „Inter" getippt → steht im Feld, Liste offen. Dreimal Tab auf „6800", Enter → 6800, Fokus im Feld, 5 von 5 sichtbar. Gegenprobe in den übrigen Stories mit Einträgen: `--full-text-only` („68", Tab, Enter → 6805), `--number-and-name` (→ 6815), `--with-ledger` (über den Kontenblatt-Knopf hinweg auf „6815", Enter → 6815): jedes Mal Fokus im Feld, Liste zu | ✓ |
| H1 Klick auf Gruppenkopf | Editor: beide Gruppenköpfe angeklickt → Liste offen, Fokus im Feld, Wert unverändert. `--with-candidates`: alle vier Gruppenköpfe nacheinander → offen, Fokus im Feld; Mausrad in der Liste (`scrollTop` 0 → 58,5, Liste 376 zu 318 px) → offen, Fokus im Feld; Klick auf den klebenden Kopf nach dem Scrollen → offen | ✓ |
| H1 Klick auf Eintrag wie vorher | Editor: Klick auf „6820" → 6820, zu, Fokus im Feld; Tab → „Belegfeld 1", ruhend „6820 Porto". `--with-candidates`: Klick auf „6800" und auf den letzten Eintrag „6845" (nach dem Scrollen) → gesetzt, zu, Fokus im Feld | ✓ |
| B1 Stichprobe | Editor, Feld geleert: Tab „6815" offen → Tab „6820" offen → Tab „Belegfeld 1": **zu**, Fokus 5 von 5 sichtbar. Shift+Tab → Kontofeld (öffnet durch den Fokus, wie vorgesehen) → Shift+Tab → „Steuerschlüssel": zu. `--number-and-name`: Tab aus dem zweiten Feld ins dritte → genau eine Liste offen (die des dritten) | ✓ |
| Escape, Klick außerhalb, Fokusverlust melden den Wert | Editor: „6820" getippt, Escape → zu, Fokus bleibt; Tab → „Belegfeld 1", ruhend „6820 Porto". `--with-candidates`: „6800" getippt, Klick außerhalb → zu, ruhend „6800 Sonstige Betriebsausgaben"; „6845" getippt, Tab auf den Eintrag, Tab hinaus → zu, ruhend „6845 EDV-Zubehör". Alle sechs `AccountField`-Stories, jedes Feld (neun): Fokus öffnet, Escape schließt, „68" öffnet (Treffer bzw. Leertext), Klick außerhalb schließt und meldet (z. B. ruhend „6805 Telefon") | ✓ |
| Keine Konsolenfehler | `--with-candidates`, `--full-text-only`, `--no-match`, `--invalid`, `--with-ledger`, `--number-and-name` und alle Editor-Läufe: 0 Fehler, 0 Warnungen | ✓ |
| Prüfliste Bedienung (`CLAUDE.md` §2) | Nach jeder Wahl sichtbarer Fokus im Feld (2.4.7), nicht verdeckt (5/5, 2.4.11); keine Tastaturfalle: Tab und Shift+Tab verlassen Feld und Liste. In Stories mit einem einzigen Feld verlässt Tab das Dokument, der nächste Tab kehrt ins Feld zurück — Verhalten des Prüfbrowsers, nicht des Felds (`window blur`/`focus` mitgeschrieben) | ✓ |
| `pnpm typecheck`, `check:language`, `check:when` | alle drei Exit 0 („0 German comment lines left", „in Ordnung"); `pnpm build` auftragsgemäß nicht gestartet | ✓ |

**Hinweise ohne Mangel** (vorbestehend, nicht durch `2704864`)

- **H4 — Escape auf einem Eintrag tut nichts.** Steht der Fokus per Tab auf
  einem Eintrag, bleibt die Liste bei Escape offen und der Fokus auf dem
  Eintrag; Escape hört nur am Feld (`AccountField.tsx:268`). „Esc schließt"
  (`CLAUDE.md` §2) gilt damit nur im Feld. Abhilfe: Escape am Rahmen `.v2kf`
  (oder an der Liste) behandeln — schließen und den Fokus über denselben
  Merker `quiet` ans Feld zurückgeben.
- **H5 — `--with-ledger`: Fokus fällt auf `body`, wenn das geleerte Feld per
  Tab verlassen wird.** Tab geht auf „Kontenblatt zu 6815"; das `onBlur` des
  Felds meldet den leeren Wert, der Knopf wird `disabled={!value}` (`:287`) und
  verliert den Fokus ohne `focusout` — die Liste bleibt offen, kein Fokus
  sichtbar (2.4.7); der nächste Tab landet auf dem ersten Eintrag. Betrifft
  jeden Aufrufer mit `onOpenLedger` (`JournalEntryGrid`). Ohne Leeren bleibt
  der Fokus auf dem Knopf. Seit `6fa8a53`. Abhilfe: `aria-disabled` statt
  `disabled` (Knopf bleibt fokussierbar, Klick wird ignoriert).
- **H6 — nach der Wahl steht der Cursor hinter der Nummer, nicht markiert.**
  Das `select()` in `onFocus` (`:257`) läuft bei der Rückgabe auf dem alten
  Text, bevor die Nummer gesetzt ist; Tippen hängt an („6815" + „68" →
  „681568"). Nach Klick-Wahl und nach Enter im Feld ist es ebenso — also
  einheitlich, und „Tippen geht ins Feld" hält. Wer auch nach der Wahl
  „Tippen ersetzt" will, markiert nach dem Setzen des Werts.
- H2 (zweimal „Alle Konten"), B3 und B5 bleiben offen wie notiert.

**Urteil: abgenommen.** M1 ist behoben — Enter und Leertaste auf einem per Tab
erreichten Eintrag setzen den Wert, schließen die Liste und geben den Fokus
sichtbar ans Feld zurück, ohne die Liste wieder zu öffnen; Tippen geht ins Feld,
Tab setzt am Feld fort. H1 ist behoben — Gruppenkopf, Mausrad und klebender
Kopf lassen Liste und Fokus stehen. B1 hält in der Stichprobe, Escape, Klick
außerhalb und Fokusverlust melden den Wert wie vorher, 0 Konsolenfehler. H4 und
H5 sollten als eigener Punkt ans Set (Bedienung, Tastaturweg).

Nachgeprüft von / am: Claude (fremder Nachprüfer), 2026-10-01

### Nacharbeit 3 2026-10-01 (Hinweise der Nachprüfung 2, vorbestehend)

| Punkt | Was getan | Selbst gemessen (with-candidates, with-ledger, 1280 × 900) |
|---|---|---|
| **H4** | Escape wird am Rahmen `.v2kf` behandelt, nicht nur am Feld: auch von einem Eintrag aus schließt die Liste, der Fokus geht über denselben Weg wie nach der Wahl ans Feld (`backToField`, Merker `quiet`) | Tab auf Eintrag, Escape → Fokus im Feld, Liste zu |
| **H5** | Der Kontenblatt-Knopf ist bei leerem Feld `aria-disabled`, nicht `disabled`: er behält den Fokus, wenn das Feld geleert und per Tab verlassen wird; `onClick` prüft den Wert. `.v2ibtn[aria-disabled="true"]` sieht aus wie `:disabled` und bekommt kein Hover | Feld leeren, Tab → Fokus auf „Kontenblatt", `:focus-visible`, Deckkraft 0,5; Enter öffnet nichts |
| **H6** | Nach der Wahl steht die Nummer markiert, wie beim Fokus — Tippen ersetzt sie. `select()` nach dem Render (`requestAnimationFrame`), vorher hielt das Feld noch den alten Text | Klick und Enter auf Eintrag → Auswahl 0–4 von „6815"; Tippen „6800" ersetzt |

Offen (vorbestehend, eigener Punkt): Nach Escape öffnet ein Klick in das schon fokussierte Feld die Liste nicht wieder, Pfeil runter auch nicht — nur Tippen. H2 (zweimal „Alle Konten"), B3, B5.

### Nachprüfung 3 Kontenliste 2026-10-01 (Stand 68086f2)

Fremder Nachprüfer, nichts gebaut. Bedient in eigenen Playwright-Kontexten
(1280 × 900, `de-DE`) gegen Storybook 6107, mit echten Tasten
(`keyboard.press`/`type`) und echten Mausklicks auf die Mitte des Ziels; jeder
Schritt ein eigener Aufruf, gemessen 100–700 ms danach. Fokus über
`document.activeElement` und `:focus-visible`, Verdeckung über
`elementFromPoint` (Mitte und vier Ecken), offene Listen über
`.v2kf__pop:popover-open`, Markierung über `selectionStart`/`selectionEnd`,
Ringfarbe über Bildschirmfoto-Pixel. Alte CSS-Regeln zum Vergleich im Browser
per CSSOM zurückgesetzt (die drei geänderten `.v2ibtn`-Regeln auf den Stand
`b773348`). Arbeitsbaum sauber, `AccountField.tsx` und `v3.css` = `68086f2`.

| Punkt | Messung | Urteil |
|---|---|---|
| H4 Escape auf einem Eintrag | `--with-candidates`: Klick ins Feld (6815), Tab → Eintrag „6815" (`:focus-visible`), Escape → 0 Listen offen, `aria-expanded="false"`, `activeElement` = Feld, `:focus-visible`, 5/5 sichtbar; nach 700 ms weiter zu. Geleert, dreimal Tab auf „6800", Escape → ebenso; „Inter" getippt → steht im Feld, die Liste öffnet erst jetzt. Editor `JournalEntryEditor --s-2-split-full` (148-px-Feld), geleert, zweimal Tab auf „6820", Escape → zu, Fokus im Feld, 5/5, nach 600 ms zu. Escape mit dem Fokus auf dem Kontenblatt-Knopf (`--with-ledger` beide Felder, `--number-and-name` drittes Feld) → zu, Fokus im Feld | ✓ |
| H4 Escape im Feld wie vorher | „68" getippt → offen; Escape → zu, Fokus und Text bleiben, nach 500 ms zu; zweites Escape bei geschlossener Liste → nichts. Alle neun Felder der sechs Stories: Fokus öffnet, Escape schließt | ✓ |
| H5 Knopf behält den Fokus | `--with-ledger`, Feld „Konto" (6815) angeklickt, geleert, Tab → `BUTTON` „Kontenblatt", `aria-disabled="true"`, `disabled` false, `:focus-visible`, Ring `2px solid rgb(59, 143, 196)` Offset 2 px, Deckkraft 0,5, Cursor `not-allowed`, 24 × 24, 5/5 sichtbar; die Liste bleibt offen (Fokus noch im Rahmen). Maus darauf: Hintergrund `rgba(0, 0, 0, 0)`. Enter, Leertaste, Klick → kein Drawer, Fokus bleibt. Feld „Gegenkonto" (von Anfang an leer): Tab → derselbe Zustand, Enter öffnet nichts, Tab weiter → Liste zu | ✓ |
| H5 Fokusring am gesperrten Knopf | Pixel des Rings: `#9DC7E1` auf Weiß — `opacity: 0.5` am Knopf blasst auch `outline` ab. **1,80:1** (rechts über dem Feldrand `#80ADCD` auf `#F4F6F8`: 2,21:1). Gegenprobe derselbe Knopf mit Wert: `#3B8FC4`, 3,55:1 | ✗ M1 |
| H5 mit Wert wie vorher | Wahl „6820" per Enter, Tab → „Kontenblatt zu 6820", kein `aria-disabled`, Deckkraft 1, Cursor `pointer`; Enter → Drawer „Kontenblatt 6820", Escape → Fokus zurück auf den Knopf. Ruhend (6815): Maus darauf `rgb(244, 246, 248)`, Klick → „Kontenblatt 6815" | ✓ |
| H5 andere `IconButton` mit echtem `disabled` | `IconButton --sizes` („Gesperrt, solange der Stapel läuft") und `--interactive` („Vorherige Seite" auf Seite 1): Deckkraft 0,5, Cursor `not-allowed`, Hover ohne Hintergrund — mit den alten Regeln gleich. Aktive „Nächste Seite": Hover `rgb(244, 246, 248)` wie vorher | ✓ |
| Nebenwirkung `RecordPager` | `RecordPager --first-record`: der tote Pfeil ist `<span class="v2ibtn v2ibtn--md v2pager__off" aria-disabled>` (`RecordPager.tsx:139`), also trifft ihn die neue Regel. Neu Deckkraft **0,5**, Cursor **`not-allowed`**; mit den alten Regeln 0,35 und `default`. `.v2ibtn[aria-disabled="true"]` (Spezifität 0,2,0, `v3.css:2133`) schlägt `.v2pager__off` (0,1,0, `v3.css:2719`, „visibly paler, no pointer"). Dazu Hover: alt `rgb(244, 246, 248)` und Textfarbe auf dem toten Pfeil, neu keiner — das ist richtig | ✗ M2 |
| H6 Nummer nach der Wahl markiert | `--with-candidates`: Klick auf „6820" → „6820", Auswahl 0–4, Fokus im Feld; „6800" getippt → „6800" (ersetzt). Enter im Feld → erster Treffer „6800", 0–4; „68" → „68". Tab, Tab auf „6820", Enter → 0–4, nach 500 ms weiter 0–4; „6845" → „6845". Tab + Leertaste auf Eintrag → 0–4; Backspace → leer, Liste offen. `--with-ledger`: Klick auf „6800" → 0–4, „6820" ersetzt. Editor: Tab + Enter → „6815" 0–4, „6820" ersetzt, Enter → 0–4. Alle sechs Stories: „68" + Enter → 0–4 markiert | ✓ |
| M1 Tab + Enter → Fokus im Feld | Editor, geleert: Tab → „6815", Enter → Wert 6815, 0 Listen, `activeElement` = Feld, `:focus-visible`, 5/5; nach 600 ms zu; später Tab hinaus → „Belegfeld 1", ruhend „6820 Porto" | ✓ |
| H1 Klick auf Gruppenkopf | Editor, geleert: Klick auf „Vorschlag von Ludwig", dann „Zuletzt bei dieser Gegenpartei" → Liste offen, Fokus im Feld, Wert unverändert | ✓ |
| B1 Tab durch die Einträge, Tab hinaus | Editor, anschließend: Tab „6815" offen → Tab „6820" offen → Tab „Belegfeld 1": zu, 5/5 sichtbar | ✓ |
| Fokusverlust meldet den Wert | Editor: „6820" frei getippt, Escape, Tab → „Belegfeld 1", ruhend „6820 Porto". Alle sechs Stories: Klick außerhalb → zu, Wert bleibt (z. B. „6805" in `--full-text-only`) | ✓ |
| Keine Konsolenfehler | alle sechs `AccountField --*` (neun Felder, je Fokus, Escape, „68", Tab, Escape, „68" + Enter, Klick außerhalb), alle Editor-Läufe, `IconButton`, `RecordPager`: 0 Fehler, 0 Warnungen | ✓ |
| `pnpm typecheck`, `check:language`, `check:when` | alle drei Exit 0 („0 German comment lines left", „in Ordnung"); `pnpm build` auftragsgemäß nicht gestartet | ✓ |

**Mängel**

- **M1 — der Fokusring am gesperrten Kontenblatt-Knopf hat 1,80:1.** H5 macht
  den Knopf fokussierbar, die Regel `.v2ibtn[aria-disabled="true"] { opacity:
  0.5 }` (`v3.css:2132–2133`) blasst aber den ganzen Knopf ab, Ring
  eingeschlossen: aus `--color-focus` (3,55:1) wird gemessen `#9DC7E1`. V10 und
  `CLAUDE.md` §2 verlangen für den Fokus ≥ 3:1 ohne Ausnahme; dass WCAG 1.4.11
  inaktive Bedienelemente ausnimmt, hilft hier nicht, die Hausregel ist
  strenger, und gerade wer per Tab auf dem gesperrten Knopf steht, muss sehen,
  wo er ist. (Mit echtem `disabled` tritt das nicht auf — dort gibt es keinen
  Fokus.) Abhilfe: beim fokussierbaren gesperrten Knopf nur das Zeichen
  abblassen, nicht den Knopf, etwa
  `button.v2ibtn[aria-disabled="true"] { cursor: not-allowed; }` und
  `button.v2ibtn[aria-disabled="true"] > * { opacity: 0.5; }`;
  `.v2ibtn:disabled` bleibt wie es ist.
- **M2 — stille Änderung am `RecordPager`.** Die neue Regel trifft auch den
  toten Pfeil des `RecordPager` (Span mit `.v2ibtn` und `aria-disabled`): 0,35 →
  0,5, `default` → `not-allowed`, gegen die eigene Regel von 0047. Die
  Nacharbeit nennt das nicht; nach `CLAUDE.md` §3 ist eine Farbänderung an
  einem anderen Baustein ein Systementscheid, keine Nebenwirkung. Abhilfe: die
  Regel auf `button.v2ibtn[aria-disabled="true"]` beschränken (wie bei M1 —
  dieselbe Zeile behebt beide); den Hover-Ausschluss
  `:not(:disabled, [aria-disabled="true"])` behalten, er nimmt dem toten Pfeil
  den Hover, den er vorher fälschlich hatte. Wer die beiden Gesperrt-Bilder
  lieber angleicht, schreibt es in 0047 und an `.v2pager__off`, mit Datum.

**Hinweise ohne Mangel**

- **H7 — Escape im Feld innerhalb eines Drawers schließt auch den Drawer**
  (gelesen, nicht in einer Story gemessen): `Drawer` hört auf `keydown` am
  `window` (`Drawer.tsx:140–151`), der neue Escape-Handler am Rahmen
  (`AccountField.tsx:244`) hält das Ereignis nicht an. Vorbestehend (der alte
  Handler am Feld tat es auch nicht), mit H4 gilt es nun auch auf einem
  Eintrag. Wer `AccountField` in einen Drawer setzt (`RecurringRuleEditor`,
  `PaymentAccountEditor` prüfen), sollte bei offener Liste
  `e.stopPropagation()` ergänzen — „Esc schließt die innerste Ebene".
- Offen wie notiert: Klick ins schon fokussierte Feld nach Escape öffnet die
  Liste nicht wieder; H2, B3, B5.

**Urteil: nicht abgenommen — zwei Mängel (M1 Fokusring am gesperrten Knopf
1,80:1, M2 Nebenwirkung auf `RecordPager`), beide in denselben zwei Zeilen
`v3.css:2132–2133`.** Die Mechanik hält: H4 (Escape auf Eintrag und Knopf →
Fokus sichtbar im Feld, Liste bleibt zu), H5 (Fokus bleibt auf dem Knopf, kein
Hover, Enter/Leertaste/Klick tun nichts, mit Wert wie vorher) und H6 (Nummer
nach Klick, Enter im Feld, Tab + Enter/Leertaste markiert, Tippen ersetzt) sind
behoben; M1, H1, B1 und der Fokusverlust halten, 0 Konsolenfehler. Nach der
Abhilfe genügt eine Nachprüfung der CSS: Ringpixel am gesperrten fokussierten
Knopf ≥ 3:1, toter Pfeil in `RecordPager --first-record` 0,35 / `default` ohne
Hover, `IconButton --sizes`/`--interactive` unverändert.

Nachgeprüft von / am: Claude (fremder Nachprüfer), 2026-10-01
