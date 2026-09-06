# 0044 · `JournalEntryCompact` — Zelle und Karte eines Buchungssatzes

| | |
|---|---|
| Status | in Arbeit |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Soll/Haben, Konto, Steuerschlüssel sind Buchhaltung, nicht Layout |
| Quelle | Anfrage vom 2026-09-03 („eine simplere Version, um einen Buchungssatz nur anzuzeigen, ohne Extras") · `docs/v3-backlog.md` „Nicht `primitives`" (`BookingProposalView`/`-Compact`, `BookingLineRow` fehlen v3) · `docs/ui-repraesentationen.md` §4.4 (Form `Card` für „Buchung") |
| Ersetzt | `BookingProposalCompact` in `ludwig/app` (`ui/booking/BookingProposalCompact.tsx`, 1 Verwendung: `modules/accounting-cases/ui/EventStack.tsx:127`, dazu `app/dev/gallery/BookingDemo.tsx`) · **hier im Repo**: den privaten Zeilenblock `Journal()` in `src/ui/v3/entities/journal-entry/JournalEntryEditor.tsx:697` |
| Blockiert | jede Stelle, die einen Buchungssatz neben einer anderen Entität zeigt (Ereignis-Stapel, Kreditor-Karte, Dauerbuchungs-Vorschau) und heute den vollen Editor laden müsste |
| Spec von / am | Claude, 2026-09-03 |
| Freigegeben | Owner, 2026-09-04 („ok los gehts") |
| Gebaut von / am | Claude, 2026-09-04 — `JournalEntryCompact.tsx`, acht Stories, CSS-Block `.v2je*` am Ende von `v3.css` |

## Ziel

Die Sachbearbeiterin sieht an einem Ereignis, einem Kreditor oder einer
Dauerbuchungsregel, **was gebucht wird** — Soll-Konto, Haben-Konto, Betrag —
und liest das in einer Sekunde, ohne den Satz zu öffnen. Heute gibt es dafür
in v3 nur `JournalEntryEditor`: der bringt Statuskopf, Meldungsblock,
Beleg-Rest-Rechnung, Steuerassistenz und die KI-Notizen mit, also fünf Blöcke,
die an dieser Stelle niemand liest. In der App steht dafür
`BookingProposalCompact` — eine zweite Wahrheit mit eigenen Hex-Farben und
eigenem `px`-Raster.

## Einordnung

**Wiederverwenden — geprüft, reicht nicht:**

| `@when`-Treffer | warum er nicht reicht |
|---|---|
| `JournalEntryEditor` — „Viewing or editing a booking entry — one grid for both" (`JournalEntryEditor.tsx:141`) | Deckt die **volle** read-only Sicht ab (Form `View`, L) — dafür wird nichts Neues gebaut, `editable={false}` ist der Weg, und das JSDoc der Datei begründet das (`:26`). Deckt **nicht** die kompakte Sicht: das Fehlende ist nicht eine Designentscheidung, sondern das Weglassen von fünf Blöcken → §3.2 („um eine Prop erweitern") greift nicht. |
| `Table`/`TableRow`, `AmountCell`, `MonoCell`, `Amount` | tragen Geometrie und Zahlenformat, kennen aber nicht die Ordnung des Satzes (was ist Soll, was Haben, wie liest sich „an", was heißt ein Split) |
| `FieldList` — „Master data and properties of an item, read-only" | Feld/Wert-Paare, nicht Soll-gegen-Haben |
| `Review.MessageList` (`Review.tsx:254`), `StatusBadge` | genau die Extras, die hier **nicht** mitkommen sollen — sie stehen weiter daneben, nicht darin |

**Neu, weil:** Regel §3.5 — `ui-repraesentationen.md` §4.4 führt die Form
`Card` („kompakt, im Kontext einer anderen Entität") ausdrücklich für
„Buchung", und `v3-backlog.md` hält fest: „`JournalEntryEditor` deckt den
Editor ab, nicht die Anzeige-Varianten."

Für die **Zelle** greift §3.5 nur halb: §4.4 führt `Cell` für Sachverhalt,
Konto, Beleg und Partner — nicht für die Buchung, und die App hat heute keine
Liste, die einen Satz einzeilig zeigt. Sie kommt als **Angebot** nach §5
(„Optionen ja, eigene Wahrheit nein") auf demselben Datenmodell mit; sie ist
zugleich der Kern, den `BookingProposalCompact` heute als `CompactRow` inline
trägt. Fällt sie in der Freigabe weg, bleibt die Karte davon unberührt.

**Zuschnitt: Familie, eine Datei** `JournalEntryCompact.tsx`, zwei Exporte
(`JournalEntryCell`, `JournalEntryCard`), eine Story-Datei daneben. Grund nach
§4: gemeinsames Markup-Vokabular (Konto-Referenz aus Nummer + Name, Betrag
rechts mit `tnum`, dieselbe Soll-vor-Haben-Ordnung) und kein Trenn-Trigger —
zusammen 8 Stories, je Export ≤ 4 Props, geschätzt ~180 Zeilen, beide ohne
eigenen Zustand.

**Setzt auf:** `MonoCell` (Kontonummer), `AmountCell` (Betrag),
`formatAmount` aus `src/ui/v3/format.ts`. Kein `"use client"` — reine
Prop-in/JSX-out-Komponenten; der Editor darf sie aus seinem Client-Modul
importieren.

## Schnittstelle

```ts
/** Eine Zeile des Satzes. Strukturelle Teilmenge von `BookingLineVM` der App —
 *  `BookingLineVM[]` passt ohne Mapping herein. */
export interface JournalLine {
  side: "debit" | "credit";
  accountNumber: string;
  accountName?: string | null;
  amount: number;
  taxKey?: string | null;
  /** Buchungstext der Zeile — Spalte 3 des Stapels. */
  text?: string | null;
}
```

`JournalEntryCell` — XS, eine Zeile, für fremde Listen und Fließtext:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `lines` | `readonly JournalLine[]` | ja | Die Zeilen des Satzes, unverändert wie gespeichert | `Filled` |
| `currency` | `Currency` | ja | Währung des Satzes (`@/ludwig/shared/money`) | `Filled` |
| `showNames` | `boolean` (Default `true`) | nein | Kontoname neben der Nummer; `false` = nur Nummern, für enge Spalten | `WithoutNames` |

`JournalEntryCard` — M, im Kontext einer anderen Entität:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `lines` | `readonly JournalLine[]` | ja | dieselben Zeilen, jede für sich | `Filled` |
| `currency` | `Currency` | ja | Währung des Satzes | `Filled` |
| `caption` | `string` | nein | Überschrift über den Zeilen (Buchungstext oder „Buchungsvorschlag") | `InUse` |
| `totals` | `boolean` (Default `true`) | nein | Σ Soll / Σ Haben unter den Zeilen; `false`, wenn der Aufrufer die Summe schon trägt (so der Editor in seinem Journal-Kopf) | `WithoutTotals` |

**Typen:** `Currency` aus `@/ludwig/shared/money`. **GLOSSARY:** englisch im
Code (`debit`/`credit`, `accountNumber`, `taxKey`), deutsch im Label
(„Soll", „Haben", „an", „Σ Soll", „Σ Haben").

**Befunde an `ludwig/app`** (keine lokale Erfindung, keine Blocker):

1. In `src/ludwig/` fehlt ein kanonisches Zeilenmodell des Buchungssatzes.
   Es existiert als `BookingLineVM` in der App (`ui/booking/types.ts`) und
   liegt hier als Kopie unter `src/ui/legacy/booking/types.ts` — die Aufgabe
   0043 löscht diese Kopie. `JournalLine` ist deshalb hier definiert, aber
   strukturell deckungsgleich, damit die App ohne Mapping zuweisen kann.
2. `JournalEntryVM.currency` ist in der App `string`, `Currency` hier ein
   Union aus vier Werten. Die Aufrufstelle in der App braucht heute einen
   Cast; sauber wäre `Currency` auch dort.

**Was die Familie bewusst nicht kann:**

- **nicht rechnen** — keine Steuerableitung (`deriveTax`), keine
  Gegenkonto-Konsolidierung, keine Brutto/Netto-Trennung. Der Aufrufer
  liefert die Zeilen, die gespeichert würden. (`@instead`: der Editor rechnet.)
- **nicht prüfen** — keine Fehler, Warnungen, Hinweise, kein
  „Rest offen". (`@instead`: `Review.MessageList`, `StatusCallout`.)
- **keinen Zustand zeigen** — kein Status, keine Konfidenz, keine Herkunft,
  kein „gesperrt". (`@instead`: `StatusBadge` + Registry daneben.)
- **nichts aufklappen** — die Zelle fasst Splits zusammen, statt sie
  ausklappbar zu machen. Wer alle Zeilen will, nimmt die Karte.
- **keine DATEV-Nebenfelder** — Belegfeld 1/2, KOST1/2, Buchungsdatum.
  (`@instead`: `FieldList` daneben, oder der Editor.)
- **nicht bearbeiten, nichts laden.**

## Verhalten

**Server-Component** (kein State, kein Handler, kein Effekt).

**Zelle**, eine Zeile, in Leserichtung Soll vor Haben:

- Standardfall (genau eine Soll- und eine Haben-Zeile):
  `1200 Bank an 4400 Erlöse · 1.475,60 €`
- Split auf einer Seite (eine Zeile gegen mehrere): die Einzelseite steht,
  die andere wird gezählt — `1200 Bank an 3 Konten · 1.475,60 €`
- Split auf beiden Seiten: `5 Zeilen · 1.475,60 €`
- Der Betrag ist die Summe der Sollseite; er steht rechts, `tnum`.
- Kontonummer in `MonoCell`, Name gedämpft daneben, gekürzt mit Ellipse —
  der volle Name hängt im `title`.
- `lines: []` → em-Strich, wie `AmountCell` bei `null`. Kein Kasten, keine
  Meldung: die Zelle steht in fremdem Markup.

**Karte:**

- Zeilen in der **Spaltenordnung des DATEV-Stapels**, mit Kopfzeile:
  `Konto · Kontoname · Buchungstext · Soll Umsatz · Haben Umsatz`. Die Seite
  steht nicht als Kennzeichen daneben, sondern darin, in welcher der beiden
  Betragsspalten die Zahl steht — so liest die Zielgruppe seit Jahren.
  Kontonummer und beide Betragsspalten rechtsbündig (`tnum`).
  Vorbild ist der Journalblock in `JournalEntryEditor.tsx` (Stand
  2026-09-04), den die Karte ersetzt.
- `totals` → darunter `Σ Soll 1.475,60 € = Σ Haben 1.475,60 €`, mit `≠`,
  wenn die Differenz ≥ 0,005 ist. Das `≠` ist der einzige Befund, den die
  Karte selbst zeigt — sie prüft nichts weiter, sie rechnet nur zusammen,
  was dasteht.
- `lines: []` → eine Zeile „Keine Buchungszeilen." im Kartenkörper, kein
  `EmptyState` mit Knopf: die Karte ist ein Ausschnitt, kein Screen.
- Rand **oder** Schatten, nie beides; linksbündig (L2–L4).

**Nicht anwendbare Zustände:** „lädt" und „Fehler beim Laden" — die Familie
lädt nichts und ruft nichts; beides gehört dem Aufrufer (`Skeleton`,
`ErrorRow`). „leer nach Filter" gibt es nicht, sie filtert nicht. An die
Stelle von „Fehler" tritt der einzige Befund, den sie kennt: der
**unstimmige Satz** (Story `Unbalanced`).

**Tastatur:** keine — kein Element ist fokussierbar, die Familie trägt keine
Aktion. Ein Aufrufer, der die Zeile klickbar will, nimmt `ClickRow`/`TableRow`
mit `href` außen herum.

**CSS:** neue Wurzel `.v2je` in `src/styles/v3.css` (`.bse` gehört dem
Editor, `.v2je` ist frei). Kein Hex, kein `px` außerhalb der Datei.

## Stories

Titel `v3/Entitäten/Buchungssatz/JournalEntryCompact`. Jede Story zeigt beide
Exporte untereinander, damit die Stufen im Vergleich lesbar sind.

| Story | Beweist |
|---|---|
| `Filled` | Standardsatz 1 Soll / 1 Haben mit echten Werten (`1200 Bank` an `4400 Erlöse`, 1.475,60 €) — `lines`, `currency` |
| `Split` | Satz mit drei Haben-Zeilen: Zelle zählt („an 3 Konten"), Karte zeigt alle |
| `Empty` | `lines: []` — Zelle em-Strich, Karte „Keine Buchungszeilen." |
| `Unbalanced` | Σ Soll ≠ Σ Haben, das `≠` steht da; die Karte meldet sonst nichts |
| `WithoutNames` | `showNames={false}` — nur Nummern, für enge Spalten |
| `WithoutTotals` | `totals={false}` — die Karte, wie der Editor sie in seinem Journal einsetzt |
| `InUse` | Zelle in einer `Table`-Zeile, Karte mit `caption` neben einem Beleg — wie auf der Seite |
| `Edges` | langer Kontoname (Ellipse + `title`), 0,00 €, negativer Betrag, zwölf Zeilen |

Acht Stories: 4 Zustände (gefüllt, Split, leer, unstimmig) + 2
Layout-Booleans + 1 „im Einsatz" + 1 Rand. Keine Callbacks, keine Enum-Props.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt (`JournalEntryCompact.tsx`), Story daneben, Titel `v3/Entitäten/Buchungssatz/JournalEntryCompact`
- [ ] Code englisch; `@when`/`@instead` an **jedem** der beiden Exporte
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle acht Stories vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `lines`/`currency` wie Zeile 1–2 der Schnittstelle (Story `Filled`)
- [ ] `showNames={false}` zeigt nur Nummern (Story `WithoutNames`)
- [ ] `totals={false}` lässt die Σ-Zeile weg (Story `WithoutTotals`)
- [ ] `caption` steht über den Zeilen (Story `InUse`)
- [ ] Zelle fasst Splits zusammen: eine Seite mehrzeilig → „an n Konten", beide → „n Zeilen" (Story `Split`)
- [ ] Karte zeigt `≠` bei Differenz ≥ 0,005 und **sonst keine** Meldung (Story `Unbalanced`)
- [ ] Leer: Zelle em-Strich, Karte „Keine Buchungszeilen." (Story `Empty`)
- [ ] Langer Kontoname wird gekürzt, voller Name im `title` (Story `Edges`)
- [ ] Zahlen rechts mit `tnum`, Text links, nichts zentriert (Story `Edges`)
- [ ] Karte in Stapelordnung: Kopfzeile `Konto · Kontoname · Buchungstext · Soll Umsatz · Haben Umsatz`, Kontonummer rechtsbündig, Betrag in genau einer der beiden Spalten (Story `Filled`)
- [ ] Kein Element fokussierbar — Tab läuft an der Zelle vorbei (Story `InUse`)
- [ ] **Herauslösen:** `JournalEntryEditor` rendert sein Journal über `JournalEntryCard` (`totals={false}`); `grep -n "bse__journal__row" src` findet die Klasse nur noch in `v3.css`, kein eigenes Zeilen-Markup mehr in `JournalEntryEditor.tsx`
- [ ] Steuerableitung (`deriveTax`) und Gegenkonto-Einrechnung sind **im Editor** geblieben; die Familie importiert weder `tax-assist` noch `format` aus `legacy/`
- [ ] Die Stories von `JournalEntryEditor` sehen nach dem Herauslösen unverändert aus (Screenshot-Vergleich `v3/Entitäten/Buchungssatz/JournalEntryEditor`)
- [ ] Ersetzt `BookingProposalCompact` in `EventStack.tsx:127` ohne Funktionsverlust — bis auf Status, Herkunft, Konfidenz und Belegfeld 1, die dort künftig **neben** der Karte stehen (`StatusBadge`, `FieldList`) → **offen (App)**

## Offene Fragen

1. **Kommt die Zelle mit?** Sie hat heute keine Verwendung in der App und
   steht nicht in §4.4. — *Ohne Antwort: ja, sie wird mitgebaut; sie ist der
   Kern, den `BookingProposalCompact` schon inline trägt, und kostet in der
   Familie ~40 Zeilen.*
2. **Reihenfolge zu 0043** (`legacy/` auflösen): 0043 löscht
   `legacy/booking/types.ts` und `format.ts`. — *Ohne Antwort: 0044 wartet
   nicht, sondern importiert von vornherein `formatAmount` aus
   `src/ui/v3/format.ts` und definiert `JournalLine` selbst — dann fällt sie
   0043 nicht in den Rücken.*
3. **Kein Entitätsprofil** — `docs/entitaeten/journal-entry.md` fehlt, der
   Ablauf (`docs/backlog/README.md`, Schritt 0) sieht es für `entities/` vor.
   — *Ohne Antwort: ohne Profil bauen. Der Editor legt Datenpunkte und
   Spaltenordnung bereits fest, und diese Spec leitet aus ihm ab. Das Profil
   wird nachgezogen, bevor weitere Formen der Familie (`Row`, `Picker`,
   `Drawer`) spezifiziert werden.*

## Abweichungen von der Spec

| Punkt | Spec | Gebaut | Grund |
|---|---|---|---|
| `taxKey` in `JournalLine` | im Interface geführt, damit `BookingLineVM[]` ohne Mapping passt | **weggelassen** | Kein Export zeigt ihn — die Karte hat die fünf Stapelspalten, die Zelle eine Zeile. Ein Feld, das nichts rendert, ist tote Fläche; die Struktur-Kompatibilität bleibt, weil TypeScript überschüssige Felder bei Variablenzuweisung erlaubt (`lines={vm.lines}`). Wer ihn zeigen will, braucht ohnehin eine sechste Spalte und damit eine Spec-Änderung. |
| Σ-Zeile | „`Σ Soll 1.475,60 € = Σ Haben 1.475,60 €`" als ein Satz | Text `Σ Soll = Σ Haben` in der Buchungstext-Spalte, die beiden Beträge in **ihren** Spalten | So bleibt die Stapelordnung erhalten: die Summe steht senkrecht unter den Zahlen, die sie summiert. Der Journalblock, den die Karte ersetzt, macht es genauso (dort „Summe"). |
| Betrag der Zelle | „die Summe der Sollseite" | Sollseite, und wenn die leer ist, die Habenseite | Ein einseitiger Satz hat keine Sollsumme; „0,00 €" wäre eine Aussage („nichts gebucht"), die nicht stimmt. Im Code kommentiert. |

## Offen (nicht gebaut)

**Das Herauslösen aus `JournalEntryEditor` fehlt** — das letzte Kriterium der
Liste oben (`grep -n "bse__journal__row" src` findet die Klasse nur noch in
`v3.css`). Grund: eine parallele Claude-Sitzung hat zum Bauzeitpunkt
unkommittierte Änderungen in genau dieser Datei (`JournalEntryEditor.tsx`, 84
geänderte Zeilen, Rückbau des Warnungs-Quittierens). Ein Eingriff dort hätte
ihre Arbeit überschrieben — die Hausregel „nur eigene Dateien stagen" gilt
sinngemäß auch fürs Schreiben. `JournalEntryCard` ist so gebaut, dass der
Austausch danach eine kleine Änderung ist: `totals={false}`, die Zeilen aus
`Journal()` unverändert übergeben, `.bse__journal__*` löschen. Der
Screenshot-Vergleich der Editor-Stories gehört zu diesem Schritt.

## Abnahme

Abnahme am 2026-09-05 (zweiter Agent, gegen Spec und Code). Alle acht Stories
auf `localhost:6107` geöffnet; Zeilen, Ausrichtung, Kürzung und Tab-Weg im DOM
gemessen.

**Story-Deckung.** Acht Stories in der Spec, acht Exporte in
`JournalEntryCompact.stories.tsx`, acht IDs in `index.json` (`--filled`,
`--split`, `--empty`, `--unbalanced`, `--without-names`, `--without-totals`,
`--in-use`, `--edges`) — die Ableitung (4 Zustände + 2 Layout-Booleans + 1 „im
Einsatz" + 1 Rand) geht auf. Jede Prop beider Exporte hat ihre Story:
`JournalEntryCell.lines`/`currency` (`Filled`), `showNames` (`WithoutNames`) ·
`JournalEntryCard.lines`/`currency` (`Filled`), `caption` (`InUse`), `totals`
(`WithoutTotals`). Jede Story zeigt beide Exporte untereinander (`Pair`,
`:30–53`), wie die Spec es verlangt. „lädt", „Fehler" und „leer nach Filter"
sind begründet ausgeschlossen; an die Stelle von „Fehler" tritt `Unbalanced`.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme). `pnpm build` **nicht** neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel `v3/Entitäten/Buchungssatz/JournalEntryCompact` | `src/ui/v3/entities/journal-entry/JournalEntryCompact.tsx` mit beiden Exporten, Story daneben; Titel stimmt und deckt sich mit der Barrel-Gruppe (`src/ui/v3/index.ts:356` „Buchungssatz — die eine Buchungs-Oberfläche", Export `:367–370`) | ✓ |
| Code englisch; `@when`/`@instead` an **jedem** der beiden Exporte | `@when`/`@instead` an beiden ✓ (`JournalEntryCell` `:62–65`, `JournalEntryCard` `:124–127`), beide englisch und aufeinander verweisend. **Der Rest der Datei ist gemischt:** das Datei-JSDoc `:6–20` („Zelle und Karte eines Buchungssatzes (0044) — die Anzeige-Formen der Familie …"), das Interface-JSDoc `:22–25`, der Feldkommentar `:31` („Buchungstext der Zeile — Spalte 3 des Stapels") und `:35` („Ab hier gilt ein Satz als unstimmig — ein halber Cent ist Rundung") stehen auf Deutsch, während `:38`, `:45`, `:77–78`, `:83–84`, `:111–112`, `:149` und `:181` englisch sind. `CLAUDE.md` verlangt Englisch für Kommentare und JSDoc; die Datei ist am 2026-09-04 neu entstanden | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}' JournalEntryCompact.tsx` = 0, `grep -cE '[0-9]+px'` = 0. `NAME_LIMIT = 40` ist eine Zeichenzahl, `BALANCE_EPSILON = 0.005` ein Betrag — keine Maße. Keine Label-Map, kein Status: die Familie zeigt bewusst keinen (`@instead` schickt an `StatusBadge`). Die Maße stehen in `v3.css:2414–2449`, wo px erlaubt sind | ✓ |
| Alle acht Stories vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Kontonummer und beide Betragsspalten `text-align: right`, Kontoname und Buchungstext `start`, **nichts** zentriert (0 Elemente mit `text-align: center` unter `.v2je`) · `font-variant-numeric: lining-nums tabular-nums` an jeder Zahlenzelle · keine Farbe, kein Rot — das `≠` ist ein Zeichen, kein Farbsignal · die Karte hat **weder** Rand **noch** Schatten (`border-top-width: 0px`, `box-shadow: none`); sie ist ein Ausschnitt in fremdem Markup, kein Kasten, und verletzt „Rand oder Schatten, nie beides" damit nicht · kein Icon, keine Versalien · die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle acht IDs am 2026-09-05 geöffnet, Zeileninhalte und `getComputedStyle` je Spalte gemessen, Tab-Weg geprüft. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `lines`/`currency` wie Zeile 1–2 der Schnittstelle (`Filled`) | `--filled`: Zelle „1200 Bank an 4400 Erlöse 19 % USt · 1.475,60 €", Karte mit zwei Zeilen und Σ-Zeile. `currency="EUR"` schlägt bis in `formatAmount` durch (`1.475,60 €`) | ✓ |
| `showNames={false}` zeigt nur Nummern (`WithoutNames`) | `--without-names`: die Zelle liest „1200 an 4400 · 1.475,60 €" — die Namen „Bank" und „Erlöse 19 % USt" sind weg, die Nummern bleiben. Die Karte darunter zeigt sie weiter (die Prop gehört nur der Zelle) | ✓ |
| `totals={false}` lässt die Σ-Zeile weg (`WithoutTotals`) | `--without-totals`: fünf Zeilen (Kopf + vier Buchungszeilen), **keine** `.v2je__row--sum`. Gegenprobe `--split` mit denselben Daten: sechs Zeilen, die letzte „Σ Soll = Σ Haben · 1.475,60 € · 1.475,60 €" (Spaltentrenner hier als · geschrieben) | ✓ |
| `caption` steht über den Zeilen (`InUse`) | `--in-use`: `div.v2je__caption` „Buchungsvorschlag zu RE-4471" steht als erstes Kind der Karte, über der Kopfzeile | ✓ |
| Zelle fasst Splits zusammen: eine Seite mehrzeilig → „an n Konten", beide → „n Zeilen" (`Split`) | `--split`: „1200 Bank **an 3 Konten** · 1.475,60 €", während die Karte alle vier Zeilen einzeln zeigt. `--edges` deckt den anderen Fall ab: zwei Soll- und zehn Haben-Zeilen → „**12 Zeilen** · -19,00 €" | ✓ |
| Karte zeigt `≠` bei Differenz ≥ 0,005 und **sonst keine** Meldung (`Unbalanced`) | `--unbalanced`: Σ-Zeile „Σ Soll **≠** Σ Haben · 1.475,60 € · 1.400,00 €" — kein zweiter Text, keine Farbe, kein Badge im ganzen `.v2je`. Gegenprobe `--filled`: dasselbe Markup mit `=`. Schwelle `BALANCE_EPSILON = 0.005` (`:36`) | ✓ |
| Leer: Zelle em-Strich, Karte „Keine Buchungszeilen." (`Empty`) | `--empty`: kein `.v2je__cell` im Baum, stattdessen `span.v2muted` mit „—" (`:79`); die Karte zeigt `div.v2je__empty` „Keine Buchungszeilen." und **keine** Kopfzeile, keinen Knopf | ✓ |
| Langer Kontoname wird gekürzt, voller Name im `title` (`Edges`) | `--edges`, Karte: die Zelle mit „Betriebs- und Geschäftsausstattung, geringwertige Wirtschaftsgüter" hat `scrollWidth 404` bei `clientWidth 129` — also tatsächlich abgeschnitten —, `text-overflow: ellipsis` und den vollen Namen im `title`. Dasselbe für den Buchungstext (347 gegen 181). In der Zelle greift zusätzlich die Zeichenschranke `NAME_LIMIT = 40` (`:39`, `:51–56`); in dieser Story ist sie nicht zu sehen, weil `Edges` der Fall „12 Zeilen" ist und keinen Kontonamen ausgibt | ✓ |
| Zahlen rechts mit `tnum`, Text links, nichts zentriert (`Edges`) | `--edges`, `getComputedStyle` der fünf Kopfspalten: `right, start, start, right, right`; `font-variant-numeric` der Zahlenzellen „lining-nums tabular-nums"; 0 Elemente mit `text-align: center` | ✓ |
| Karte in Stapelordnung: Kopfzeile `Konto · Kontoname · Buchungstext · Soll Umsatz · Haben Umsatz`, Kontonummer rechtsbündig, Betrag in genau einer der beiden Spalten (`Filled`) | `--filled`, Zeilen im DOM: „Konto · Kontoname · Buchungstext · Soll Umsatz · Haben Umsatz" — dann „1200 · Bank · Reparatur März · **1.475,60 €** · (leer)" und „4400 · Erlöse 19 % USt · Reparatur März · (leer) · **1.475,60 €**" (Spaltentrenner hier als · geschrieben). Die Seite steht also in der Spalte, nicht als Kennzeichen daneben; „Konto" ist rechtsbündig | ✓ |
| Kein Element fokussierbar — Tab läuft an der Zelle vorbei (`InUse`) | `--in-use`: fünfmal `Tab` gedrückt, `document.activeElement` bleibt jedes Mal `body`; `document.querySelectorAll('.v2tbl button, .v2tbl a, .v2tbl [tabindex]').length` = 0. Dasselbe in `--edges` | ✓ |
| **Herauslösen:** `JournalEntryEditor` rendert sein Journal über `JournalEntryCard` (`totals={false}`); `grep -n "bse__journal__row" src` findet die Klasse nur noch in `v3.css` | Nicht gebaut. `grep -rn "bse__journal" src` trifft weiter `JournalEntryEditor.tsx:747, 748, 756, **757**, **765**, 768, **773**` — das eigene Zeilen-Markup steht unverändert dort, `JournalEntryCard` wird vom Editor nicht importiert. Der Abschnitt „Offen (nicht gebaut)" dieser Spec sagt es selbst und nennt den Grund (parallele Sitzung mit unkommittierten Änderungen in derselben Datei). Der Grund ist nachvollziehbar, das Kriterium bleibt offen — und es zielt auf dieses Repo, nicht auf die App | ✗ |
| Steuerableitung (`deriveTax`) und Gegenkonto-Einrechnung sind **im Editor** geblieben; die Familie importiert weder `tax-assist` noch `format` aus `legacy/` | `JournalEntryCompact.tsx` hat genau drei Importe (`:1`, `:3`, `:4`): `Currency` aus `@/ludwig/shared/money`, `formatAmount` aus `../../format` (v3, nicht `legacy/`), `AmountCell`/`MonoCell` aus den Primitives. `grep -c "legacy/"` = 0, kein `deriveTax`, keine Konsolidierung — die Karte summiert nur, was dasteht (`:41–43`, `:141–143`) | ✓ |
| Die Stories von `JournalEntryEditor` sehen nach dem Herauslösen unverändert aus | Nicht prüfbar, weil das Herauslösen nicht stattgefunden hat. (Nebenbefund: `JournalEntryEditor.tsx` und seine Story-Datei sind derzeit uncommitted verändert — ein Vergleich wäre ohnehin gegen einen wandernden Stand gelaufen) | ✗ |
| Ersetzt `BookingProposalCompact` in `EventStack.tsx:127` ohne Funktionsverlust | Betrifft `ludwig/app`; in diesem Repo nicht erfüllbar | offen (App) |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Die dokumentierten Abweichungen stimmen mit dem Gebauten überein.**
  `taxKey` fehlt im Interface (`:26–33`) · die Σ-Zeile steht in der
  Stapelordnung, nicht als Satz (`--filled`: leer | leer | „Σ Soll = Σ Haben" |
  Betrag | Betrag) · der Betrag der Zelle nimmt die Habenseite, wenn die
  Sollseite leer ist (`:85`, `total = sum(debits) || sum(credits)`).
- **`Edges` ist zugleich der zweite unstimmige Satz.** Soll −19,00 € gegen
  Haben 1.045,00 € → die Σ-Zeile trägt das `≠`, ohne dass die Story es
  ankündigt. Kein Fehler, aber die Story beweist damit `Unbalanced` ein
  zweites Mal.
- **0,00 € wird als Wert gezeigt, nicht als Leere.** `--edges`, erste
  Kartenzeile: „0,00 €" steht in der Soll-Spalte — die Karte unterschlägt die
  Nullbuchung nicht (anders als die Zelle, die bei leeren `lines` den
  em-Strich nimmt).

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`.

**Offene Punkte**

1. **Das Herauslösen aus `JournalEntryEditor` fehlt weiter** — das Kriterium
   ist eines dieses Repos, nicht der App, und der Editor trägt sein
   `.bse__journal__row`-Markup unverändert (`:757`, `:765`, `:773`). Danach
   fällt auch der Screenshot-Vergleich der Editor-Stories an.
2. **Datei-JSDoc und drei weitere Kommentare in `JournalEntryCompact.tsx`
   sind deutsch** (`:6–20`, `:22–25`, `:31`, `:35`) — `CLAUDE.md` verlangt
   Englisch, und die Datei ist neu. Die Story-Datei daneben ist bereits
   durchgehend englisch, die Umstellung ist also klein.

Alles Übrige — beide Exporte, alle acht Stories, Stapelordnung, Kürzung,
`≠`, Leerfall und die Zusicherung „nichts ist fokussierbar" — ist erfüllt und
oben belegt.

## Die zwei offenen Punkte — einer behoben, einer bleibt liegen

**2 — die deutschen Kommentare sind weg.** Datei-JSDoc, der Kommentar an
`JournalLine`, der an `text` und der an `BALANCE_EPSILON` stehen auf Englisch;
Nutzer-Strings der Karte bleiben deutsch. Die Story-Datei war es schon.

**1 — das Herauslösen aus `JournalEntryEditor` bleibt offen, und zwar mit
Grund.** `JournalEntryEditor.tsx` und seine Story sind in dieser Arbeitskopie
**von einer anderen Sitzung geändert**; im selben Zug wächst `v3.css` um
`.bse__journal__row--head`, `--sum` und `.bse__journal__text` — also genau die
Klassen, die das Herauslösen braucht. Zwei Sitzungen, die dieselbe Datei
umbauen, erzeugen einen Konflikt, den hinterher niemand auflösen kann.

Diese Aufgabe bleibt deshalb auf `in Arbeit`. Sie wird fertig, sobald die
fremden Änderungen an `JournalEntryEditor.tsx` eingecheckt sind: dann rendert
der Editor sein Journal über `JournalEntryCard` (`totals={false}`), und
`grep -n "bse__journal__row" src` findet die Klasse nur noch in `v3.css`.

## Abnahmekriterien (Nachtrag)

- [ ] Kein deutscher Kommentar mehr in `JournalEntryCompact.tsx` (`grep`)
- [ ] offen: das Herauslösen aus `JournalEntryEditor.tsx` — wartet auf die parallele Sitzung

## Befund aus der Abnahme von 0089 (2026-09-06)

**Ein Spaltenkopf druckt über seinen Nachbarn.** In
`JournalEntryEditor --s-2-split-full` steht die Spalte „Text" auf
`minmax(0, 1fr)` und fällt auf **0 px** zusammen; der Kopf wird trotzdem
gerendert und läuft **26 px** in „Kost" hinein — im Bild steht dort „TKost".

Kein Rückschritt aus 0089: mit der alten Typografie waren es 21 px, derselbe
Überdruck fünf Pixel schmaler. Es ist die einzige solche Stelle im Set, und
sie gehört zu dieser Familie — wer das Journal-Markup herauslöst (Punkt 1
dieser Aufgabe), sollte den Spaltensatz gleich mitprüfen: eine Spalte, die auf
null fallen darf, braucht entweder eine Mindestbreite oder einen Kopf, der
mitschrumpft.

## Das Herauslösen — nachgeholt am 2026-09-06

Das letzte offene Kriterium ist erfüllt: `JournalEntryEditor` zeichnet sein
Journal nicht mehr selbst, sondern über `JournalEntryCard` mit
`totals={false}`. `grep -rn "bse__journal__row" src` findet die Klasse nirgends
mehr — die CSS-Regel ist gestrichen, der Rumpf `.bse__journal__body` bleibt,
weil er die Klapp-Fläche trägt.

**Eine Änderung im Bild, und sie ist der Gewinn.** Der Editor zeigte vier
Spalten (Konto · Name · S/H · Betrag), die Karte zeigt fünf (Konto · Name ·
Buchungstext · Soll · Haben). Das waren **zwei Bilder desselben
Buchungssatzes**, und das des Editors war das, das niemand pflegte — die
Buchungstext-Spalte fehlte dort ganz. Jetzt ist es eines. Gemessen an
`s-2-split-full`: sechs Zeilen, Kopf „Konto · Kontoname · Buchungstext · Soll
Umsatz · Haben Umsatz", null `.bse__journal__row`.

**Die Summe bleibt, wo sie war** — in der Klappzeile („Σ S 1.475,60 € = Σ H
1.475,60 €"), deshalb `totals={false}`. Sie steht dort sichtbar, während der
Rumpf zugeklappt ist, und das ist der Grund, warum der Editor sie oben trägt
und nicht unten.

Konsole in allen geprüften Editor-Stories ohne Meldung.
