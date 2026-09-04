# 0044 · `JournalEntryCompact` — Zelle und Karte eines Buchungssatzes

| | |
|---|---|
| Status | Abnahme |
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
