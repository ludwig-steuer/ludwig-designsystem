# 0025 · Expectation — die Erwartung als Chip und Zeile

| | |
|---|---|
| Status | in Arbeit — freigegeben 2026-09-06, Entscheide und Pflichtänderungen im Abschnitt „Freigabe" |
| Stufe | `entities/expectation/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, „was noch fehlt" hängt am Sachverhalt |
| Quelle | Soll-Katalog §11.7 Stufe 3 „Erwartung — fehlt (§3.1)"; `ui-repraesentationen.md` §3.2 Nr. 2 |
| Ersetzt | die abgeleiteten Texte in `ClarificationsBanner`, die Nachforderungs-Zeilen der Abnahme-Schritte 1 und 2, die Portal-Karte |
| Blockiert | Sachverhalt-Detail, Abnahme-Schritt 1, Portal, Beleg-Nachforderung |
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
  in der Registry vorhanden), `Timestamp`, `AmountCell`, `TextButton` (0011).

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
- [ ] Ersetzt die Nachforderungs-Zeile in Abnahme-Schritt 1 ohne Funktionsverlust

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
