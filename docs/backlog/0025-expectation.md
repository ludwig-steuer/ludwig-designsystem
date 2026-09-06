# 0025 · Expectation — die Erwartung als Chip und Zeile

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/expectation/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, „was noch fehlt" hängt am Sachverhalt |
| Quelle | Soll-Katalog §11.7 Stufe 3 „Erwartung — fehlt (§3.1)"; `ui-repraesentationen.md` §3.2 Nr. 2 |
| Ersetzt | `FehltPanel.tsx` (Sachverhalt-Detail) samt seiner lokalen `KIND_LABEL`/`MATURITY_LABEL` und die Erwartungs-Zeilen in `Schritt5Liste.tsx` (Abnahme-Schritt 5). Portal, `document-requests` und die Schritte 1/2 sind mit dem Seiten-Rückbau entfallen |
| Blockiert | Sachverhalt-Detail (`FehltPanel`) und Abnahme-Schritt 5 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

„Es fehlt noch etwas" ist in Ludwig ein Datensatz mit Frist, Reife und
Eskalationsstufe — sichtbar ist davon fast nichts. Die Sachbearbeiterin liest
heute abgeleitete Sätze („3 Nachforderungen"), sieht aber nicht, welche
Erwartung seit wann überfällig ist. Die Statusachse gibt es, die Darstellung
nicht.

## Einordnung

- **Wiederverwenden:** `StatusBadge` zeigt die Reife, sobald jemand sie
  hineinreicht — aber nicht, worauf gewartet wird, seit wann und bei wem.
  `Badge` allein wäre ein Ton ohne Aussage.
- **Neue Entitäts-Form, weil:** Regel 5 — `ui-repraesentationen.md` §3.1
  führt „Erwartung" ohne jede Darstellung, §3.2 stellt sie an Platz 2.
- **Zuschnitt:** Familie in einer Datei: `ExpectationChip` (XS, inline neben
  einem Sachverhalt) und `ExpectationRow` (S, in der Liste der offenen
  Punkte). Beide zeigen dieselben Felder in zwei Dichten.
- **Setzt auf:** `StatusBadge` (Achsen `erwartung` und `erwartung_art` — beide
  im Spiegel vorhanden), `Time`, `AmountCell`, `TextButton` (0011).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `expectation` | `Expectation` | ja | Der Datensatz (Felder unten) | `Row` |
| `today` | `string` | nein | Bezugstag für die Reife; Default heute | `Maturities` |
| `onResolve` | `(id: string) => void` | nein | „Erledigt" — ohne die Prop nur Anzeige | `Interactive` |
| `onOpen` | `(id: string) => void` | nein | Sprung in den Sachverhalt | `Interactive` |

Felder aus `ludwig.client_accounting_case_expectation`: `kind`
(`"document" \| "payment"`, im Spiegel als `ExpectationKind`), `dueDate`,
`escalationLevel`, `resolvedAt`, `expectedAmount`, `expectedCounterpartyName`,
`expectedDocumentKind`, `audience`, `note`.

**Die Reife wird nicht gerechnet, sondern geholt:**
`expectationMaturity({ dueDate, escalationLevel, resolvedAt, today })` steht
bereits in `src/ludwig/modules/accounting-cases/domain/case.ts`. Eine zweite
Ableitung in der Komponente wäre genau die zweite Wahrheit, die der Kommentar
dort verbietet.

Label deutsch, Code englisch: `expectation` im Code, „Erwartung" im UI, in der
mandantengerichteten Ansicht „Nachforderung" (GLOSSARY: `document request`).

Was die Familie **nicht** kann: einen offenen Saldo zeigen (den rechnet
`loadCaseOpenPayments`, nicht die Erwartung), mahnen, und `escalationLevel`
niemals als DATEV-Mahnstufe ausgeben.

## Verhalten

Server-Component ohne Callbacks. Die Reife trägt Farbe **und** Wort (V7):
`pending` neutral, `due` Warnung, `escalated` stark, `resolved` erledigt. Die
Frist steht absolut („fällig 12.07.2026"), nicht relativ (T7). `audience`
entscheidet nur das Wort — „Nachforderung" beim Mandanten, „Erwartung" in der
Kanzlei —, nicht die Farbe. Der Chip ist nicht klickbar, solange kein
Callback kommt, und bekommt dann auch keinen Hover (§2).


## Vor dem Bau eingearbeitet (2026-09-06)

**(b) `currency` ist eine Prop.** Wie bei `CaseTimeline` (L-23): der Betrag
weiß nicht, in welcher Währung er steht, und die Komponente rät nicht.

**(c) `ExpectationVM` liegt lokal**, strukturell gleich dem `ExpectationRow`
der App (`application/expectation-core.ts`). Nicht erfunden, sondern
abgeschrieben — und der Grund steht als **L-70** im Register: der Typ liegt
drüben in `application/`, nicht in `domain/`, und wird deshalb nicht
gespiegelt. Sobald er umzieht, fällt die lokale Definition weg. `CaseTimeline`
(0040) bekommt denselben Typ, wenn es so weit ist.

**(d) `Time` statt `Timestamp`** — das ist der Baustein, der seit 0033 „wann"
sagt.

**(e) „leer" ist beim Chip nicht anwendbar** und deshalb keine Story: der Chip
**ist** eine Erwartung. Keine Erwartung heißt kein Chip, nicht ein leerer —
ein Platzhalter für etwas, das es nicht gibt, wäre eine Behauptung. Die
Leerheit gehört der Liste darüber, und die zeigt sie in `Empty`.

**Zu den Wörtern:** `FehltPanel` trägt heute zwei lokale Maps —
`MATURITY_LABEL` („Frist läuft", „überfällig", …) und `KIND_LABEL`
(„Rechnung", „Beleg / Quittung", …). Die erste ersetzt die Registry-Achse
`erwartung` wortwörtlich („Läuft", „Fällig", „Eskaliert", „Erledigt"); die
zweite hat **keine** Achse — `expectedDocumentKind` ist ein freier String der
DB. Die Komponente zeigt ihn deshalb, wie er kommt, und der Aufrufer reicht
seine Wörter über `documentKindLabel` herein: eine Map in der Komponente wäre
die dritte Wahrheit.
## Stories

Titel `v3/Entitäten/Erwartung/Expectation`. Abgeleitet nach §6: 3 Zustände
(gefüllt, leer, Fehler) + 1 Enum (`kind`) + 1 Callback + 1 „im Einsatz"
+ 1 Rand (Reifen nebeneinander) = 7.

| Story | Beweist |
|---|---|
| `Chip` | vier Chips: Beleg und Zahlung, offen und überfällig |
| `Row` | Zeile mit Art, Gegenpartei, Betrag, Frist, Reife |
| `Maturities` | alle vier Reifen nebeneinander — Wort trägt, nicht Farbe |
| `Empty` | „Nichts offen." in der Liste |
| `Error` | Laden fehlgeschlagen |
| `Interactive` | „Erledigt" nimmt die Zeile aus der Liste |
| `InCase` | drei Erwartungen in der Sachverhalt-Karte, wie im Detail |

Nicht anwendbar: `LeerNachFilter` — filtern tut die Liste darüber.

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

- [ ] Die Reife kommt aus `expectationMaturity`, nicht aus der Komponente (Blick in den Code)
- [ ] Reife steht als Wort, nicht nur als Farbe (Story `Maturities`, Regel V7)
- [ ] Status ausschließlich über die Registry-Achse `erwartung` (Blick in den Code, Regel R1)
- [ ] Frist absolut, nicht „in 3 Tagen" (Story `Row`, Regel T7)
- [ ] `escalationLevel` erscheint nirgends als Mahnstufe (Blick in den Code)
- [ ] Ersetzt `FehltPanel` und die Zeilen in `Schritt5Liste` ohne Funktionsverlust — **offen (App)**

## Offene Fragen

1. Heißt die Zeile beim Mandanten „Nachforderung"? *Ohne Antwort: ja, über
   `audience` gesteuert — ein Wort, keine zweite Komponente.*
2. Zeigt der Chip den Betrag? *Ohne Antwort: nur bei `kind="payment"`; bei
   einem fehlenden Beleg ist die Belegart die Aussage.*
3. Braucht die Zeile eine „Frist ändern"-Handlung? *Ohne Antwort: nein, das
   ist eine Editor-Aufgabe, keine Darstellungsform.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Grundlagen im Spiegel vollständig (`ExpectationKind`, `ExpectationMaturity`, `expectationMaturity()`, Achsen `erwartung` und `erwartung_art`). Bildschirme nach dem Seiten-Rückbau: Sachverhalt-Detail (`FehltPanel`, 0040 `InUse`) und **Abnahme-Schritt 5** (`Schritt5Liste.tsx`, baut seit F123 aus Ludwigs Erwartungen). Portal, `document-requests` und Schritt 1/2 fallen weg.

Entscheide: 1 Wort hängt an `audience`, aber mit der richtigen Bedeutung — `audience` sagt, **wer die Unterlage besorgt** (`client` → „Nachforderung", `accounting` → „Erwartung"), nicht wer sie ansieht · 2 Betrag nur bei `payment` · 3 keine Frist-Handlung, das Quittieren in Schritt 5 ist ein Check.

Vor dem Bau in die Spec: (a) `Ersetzt`/`Blockiert`/Kriterien auf `Schritt5Liste.tsx`, `FehltPanel.tsx`, 0040 `InUse` umschreiben; (b) Prop `currency: Currency` (L-23, wie `CaseTimeline`); (c) Typ: `ExpectationVM` in dieser Datei, strukturell gleich `ExpectationRow` der App; 0040 importiert ihn künftig (kleiner Nachtrag dort); (d) `Timestamp` → `Time`; (e) für den Chip „leer" als nicht anwendbar begründen.

Befunde ins Register: **L-70** — `ExpectationRow` samt `ExpectationAudience`, `DueSource`, `ExpectationDirection` von `application/expectation-core.ts` nach `modules/accounting-cases/domain/` heben (Muster L-09).

## Gebaut (2026-09-06)

`entities/expectation/Expectation.tsx` mit zwei Exporten
(`ExpectationChip`, `ExpectationRow`) und dem Typ `ExpectationVM`, Klassen
`.v2exp*` in `v3.css`, sieben Stories, Server-Component.

### Zwei Dinge, die beim Bauen zu entscheiden waren

**Die Wörter der Belegarten kommen vom Aufrufer.** `FehltPanel` hat dafür
heute eine lokale Map (`invoice` → „Rechnung", `receipt` → „Beleg /
Quittung", …). Für die Reife gibt es eine Achse — die Registry sagt „Läuft",
„Fällig", „Eskaliert", „Erledigt" —, für `expectedDocumentKind` **nicht**: das
ist ein freier String der Datenbank. Eine Map in der Komponente wäre die
dritte Wahrheit neben `FehltPanel` und der DB. Also nimmt sie
`documentKindLabel` als Prop entgegen und zeigt sonst den rohen Wert; die
Stories reichen die vier Wörter herein.

**Die erste Spalte hat eine feste Breite.** Zuerst stand dort `max-content` —
und die Spalte war keine: jede Zeile ist ihr eigenes Raster, `max-content`
misst also nur sich selbst. Gemessen schob die Marke „Zahlung offen" (94 px)
den Titel ihrer Zeile 17 px weiter nach rechts als „Beleg fehlt" (77 px).
Jetzt 104 px fest — die Achse `erwartung_art` hat genau zwei Wörter, beide
passen. Nachgemessen (`InCase`, drei Zeilen mit beiden Arten): alle vier
Spaltenkanten bei 37 · 153 · 478 · 593, in jeder Zeile dieselben.

### Gemessen

| Story | Was |
|---|---|
| `Maturities` | vier Reifen, jede mit ihrem Wort: „Läuft", „Fällig", „Eskaliert", „Erledigt" — keine lebt von der Farbe (V7) |
| `Row`, `InCase` | Frist **absolut** („fällig 20.09.2026"), nie relativ (T7); die Spaltenkanten stehen über alle Zeilen |
| `Chip` | der Betrag steht nur bei `payment`; beim fehlenden Beleg trägt die Belegart die Aussage |
| `Interactive` | „Erledigt" nimmt die Zeile (3 → 2), `onOpen` meldet die Kennung („Geöffnet: e1") |

### Zur Reife

`expectationMaturity()` aus `@/ludwig/modules/accounting-cases/domain/case`
— eine Regel, alle Leser. Die Komponente rechnet nichts; `today` reicht sie
nur durch, damit die Stories nicht mit dem Kalender wandern.

`escalationLevel` erscheint **nirgends** als Zahl: er geht in die Reife ein
und sonst nirgendwohin. Er ist keine DATEV-Mahnstufe, und wer ihn als solche
liest, liest falsch.
