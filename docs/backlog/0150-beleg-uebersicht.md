# 0150 · Die Belegübersicht als Vorschau auf ihre Reiter

| | |
|---|---|
| Status | gebaut 2026-09-10 — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `entities/source-document/` (neu: `SourceDocumentAside.tsx`), dazu eine Prop an `patterns/StatusInfoButton` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Mängel, Umsatzsteuer und Belegverlauf sind Belegfelder. Der klickbare Status-Chip dagegen schon — er ist deshalb eine Prop am Pattern, keine Komponente hier |
| Quelle | Owner, 2026-09-10 — elf Punkte zur Belegansicht, wörtlich im Abschnitt „Auftrag" |
| Ersetzt | drei handgebaute „Zu klären"-Karten in den Showcase-Stories (R8, A5, A5b) und die Kopfzeile `.v2doc__h` über den Belegdaten |
| Spec von / am | Claude, 2026-09-10 (nachgezogen zum Bau) |

## Auftrag

Der Owner hat elf Punkte genannt. Sie stehen hier so, wie sie kamen, mit dem,
was daraus wurde:

| # | Auftrag | Umsetzung |
|---|---|---|
| 1 | „Keine Buchung nötig" braucht einen Tooltip mit der Begründung | Der Chip trug ihn schon (`title` aus der Registry) — was fehlte, war die **sichtbare** Ebene. Beides jetzt: Hover **und** Satz |
| 2 | Der Hinweis auch direkt als Text | `SourceDocumentCompletion explain` — der eigene Grund des Belegs, sonst der Satz der Achse |
| 3 | Erledigungsstand mit Begründung auch im Drawer | Der Drawer ist dieselbe `SourceDocumentCard` (0052, Zone 3) — er bekommt es mit |
| 4 | Link zum verarbeiteten Buchungsstapel — ist der Stapel überhaupt hinterlegt? | **Nein**, es gibt keine Kante Beleg → Zyklus im Modell (Befund **L-280**). Die Prop `batchHref` ist da und wird gefüllt, sobald es die Kante gibt |
| 5 | Befunde **und Klärungen** als Box auf die rechte Seite | `SourceDocumentDefects` — eine Box für beides, weil beides dieselbe Unterbrechung ist |
| 6 | USt-Ergebnisse als eigene Box, vergleichbar mit der Prüfungsansicht | `SourceDocumentVat` |
| 7 | „Offen"/„Erledigt" klickbar, Modal mit den Status-Infos | Der Chip **ist** der Auslöser (`StatusInfoButton children`) und öffnet den `StatusInfoDialog` mit allen acht Stufen der Achse |
| 8 | Box mit Verarbeitungshistorie, Kurz-Timeline, „mehr" → Verlauf | `SourceDocumentHistory` — die vier jüngsten Schritte, darunter der Weg zum Reiter |
| 9 | Die Übersicht ist eine Vorschau auf die unteren Reiter, Problemfälle zuerst | Die Regel dieser Spec; sie ordnet die vier Boxen |
| 10 | „Belegdaten" steht außerhalb der Box — Standardkomponente ohne Titel? | `FieldList` **hat** `title` seit 0006; die Karte schrieb die Zeile daneben. Jetzt in der Box |
| 11 | Gegenpartei auf den Geschäftspartner verlinken | `counterpartyHref` an Fakten und Karte |

## Die Regel dieser Seite

**Die Übersicht ist die Vorschau auf ihre Reiter.** Was einen aufhält, steht
hier; was man nachschlägt, steht im Reiter. Daraus folgt die Ordnung der
rechten Spalte, und sie ist **fest**:

1. **Belegdaten** — was auf dem Papier steht
2. **Befunde und Klärungen** — was jemand tun muss
3. **Umsatzsteuer** — die Kurzfassung des Reiters Vorsteuer
4. **Verarbeitung** — die letzten Schritte, mit dem Weg zum ganzen Verlauf

Keine Box wandert je nach Inhalt. Wer fünfzig Belege hintereinander abarbeitet,
liest die Seite nach Position, nicht nach Überschrift — eine Box, die mal oben
und mal unten steht, kostet bei jedem Beleg einen Suchblick.

**Jede Box ist eine `Card` mit ihrem Kopf innen.** Das war Punkt 10 des
Auftrags, und die Antwort auf die Frage dahinter lautet: doch, die
Standardkomponente hat einen Titel — er wurde nur nicht benutzt.

## Schnittstelle

| Prop | Wo | Bedeutung | Nachweis |
|---|---|---|---|
| `defects` · `vat` · `history` | `SourceDocumentCard` | Die drei Boxen als Slots. Slots und nicht Daten, weil jede aus einer anderen Quelle kommt und die Karte nichts lädt (E2) | `Sauber`, `MitBefunden` |
| `counterpartyHref` | Karte, Fakten | Der Gegenpart als Weg zum Geschäftspartner | `Sauber` |
| `batchHref` | Karte, Fakten, Completion | Der Buchungsstapel, sobald es ihn gibt | `Sauber` |
| `title` | `SourceDocumentFacts` | Der Kopf der Box; `null` im Drawer, wo der Drawer-Titel es sagt | `Sauber` |
| `explainCompletion` | `SourceDocumentFacts` | Der Grund als Satz statt nur im Hover | `Erledigt` |
| `explain` · `href` | `SourceDocumentCompletion` | Dasselbe eine Ebene tiefer | `Erledigt` |
| `children` | `StatusInfoButton` | Der Auslöser selbst statt des (i) — die Marke wird klickbar | `Erledigt` |
| `defects` · `actions` · `clarifications` | `SourceDocumentDefects` | Mängel aus `docDefects()`, je Art ein Weg, dazu die Rückfragen | `MitBefunden`, `KontoauszugKontoWaehlen` |
| `rates` · `deductible` · `specialCase` | `SourceDocumentVat` | Aufteilung nach Satz (erst ab zwei), Vorsteuer mit Grund | `Sauber` |
| `entries` · `total` · `href` | `SourceDocumentHistory` | Die vier jüngsten Schritte, der Rest hinter einem Weg | `Sauber` |

**Kann bewusst nicht:**

- **Rechnen.** Die Mängel kommen aus `docDefects()`, die Beträge und die
  Ereignisse vom Aufrufer. Eine Box, die selbst summiert, wäre die zweite
  Wahrheit neben dem Reiter, den sie zusammenfasst.
- **Die Klärung beantworten.** Die Box zeigt sie über `ClarificationList`;
  antworten kann man im Sachverhalt, und der Weg dorthin steht in der Zeile.
- **Boxen ein- und ausklappen.** Nicht bestellt, und was hier steht, ist die
  Kurzfassung — was man zuklappen will, gehört in den Reiter.

## Befunde für `ludwig/app`

| Nr. | Was fehlt |
|---|---|
| **L-280** | Keine Kante Beleg → Buchungszyklus. „Gebucht" nennt keinen Stapel; `booking-cycle.ts` trägt nur die **Art** eines Zyklus |
| **L-277** | `SourceDocumentVM.counterparty` ist ein String ohne Partner-ID. Der Link auf den Geschäftspartner muss vom Aufrufer gebaut werden |
| **L-278** | Container-Belegarten haben keine eigenen Fakten im Modell: Zeitraum und Zeilenzahl eines Kontoauszugs stehen in keiner Spalte, die das Set erreicht |
| **L-279** | Die USt-Aufteilung nach Steuersatz gibt es nirgends fertig — weder am `InvoiceDetail` noch als Ableitung. Die Box nimmt sie als Prop |

## Stories

| Story | Beweist |
|---|---|
| `Sauber` | Die vier Boxen im Normalfall, Gegenpart verlinkt, „nichts offen" als Aussage |
| `MitBefunden` | Vier Mängel aus `docDefects()` mit ihren Wegen, dazu eine offene Rückfrage in derselben Box |
| `Erledigt` | „Keine Buchung nötig" mit dem eigenen Grund als Satz; daneben `superseded` |
| `KontoauszugZugeordnet` | Die Zeile Zahlungskonto aus `paymentAccount` (L-266) |
| `KontoauszugKontoWaehlen` | Der Mangel `payment_account` mit `PaymentAccountField` als Weg (L-268) |

## Was die Staging-Erhebung vom 2026-09-10 dazu sagt

Nach dem Bau erhoben (`docs/entitaeten/source-document-staging-erhebung-2026-09-10.md`,
N = 554). Zwei Zahlen gehören in die Abnahme, weil sie die Spec berühren:

- **Die Mängel-Zone trägt im Regelfall eine Zeile, nie mehr als vier.**
  44 % der Belege haben gar keinen Zustand, 35 % einen, 14 % zwei; drei oder
  mehr sind 6 %, mehr als vier gibt es nicht. Die Box muss also **nicht**
  kürzen — und die Story `MitBefunden` mit vier Zeilen ist der obere Rand des
  Bestands, nicht der Alltag. (Die erste Fassung der Erhebung nannte 35 % für
  „drei oder mehr"; das war ein NULL-Fehler in der Abfrage und ist dort
  richtiggestellt.)
- **Der Mangel `partner` zeigt einen Fall, den es auf Staging nicht gibt.**
  `docDefects()` kennt ihn nur für `partner_match_outcome = 'ambiguous'` — und
  der Wert kommt in 554 Belegen **null**mal vor. Häufigster Zustand überhaupt
  ist „ohne Partner" mit 30,5 %, und zwar als `not_found` (162) und `skipped`
  (149); für den hat die Domäne bewusst keinen Mangel, weil es keinen Weg
  hinaus gibt. Das ist kein Fehler dieser Komponente — sie zeigt, was die
  Domäne liefert —, aber wer 0150 abnimmt, sollte wissen, dass diese eine
  Zeile im Bestand nie erscheint.

Ebenfalls aus der Erhebung: die 53 Container-Belege (Kontoauszug,
Kreditkarte) sind zu **null** Prozent an ein Zahlungskonto gebunden. Die Zeile
„Zahlungskonto" ist gebaut und richtig, hat aber bis zur ersten Zuordnung
keinen Wert zu zeigen.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente; Status nur über Registry
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] „Belegdaten" steht **in** der Box; `.v2doc__h` über den Fakten kommt im
      DOM nicht mehr vor
- [ ] Die vier Boxen stehen in fester Reihenfolge, unabhängig vom Inhalt
- [ ] Der Erledigungs-Chip ist ein Knopf und öffnet den Status-Dialog
- [ ] Bei `no_booking_required` steht der Grund als **Text**, nicht nur im
      Hover; trägt der Beleg einen eigenen, gewinnt dieser
- [ ] Der Gegenpart ist ein Link, wo `counterpartyHref` gesetzt ist — und
      bleibt Text, wo nicht
- [ ] Jeder Mangel aus `docDefects()` hat einen deutschen Satz; der Rohtext
      der Quelle steht als solcher erkennbar darunter
- [ ] Keine Zeile läuft über die Kartenkante (gemessen bei 1440)
- [ ] `SourceDocumentAside.tsx` trägt **kein** `"use client"`

## Offen

- **Vertragsdaten als Key-Value-Block** (Owner, 2026-09-10): Verträge tragen
  einen Vorrat an Angaben, der heute nur als `bookingFacts` in der Registry
  steht. Wie viele, welche, wie gefüllt — dazu läuft eine Frage an
  `ludwig-worker`.
- **Sub- und Elternbelege**: die Zeile (`SourceDocumentRow`) zeigt bereits
  Gegenpart, Datum, Betrag und ist klickbar; die Stories `SammelPdf` und
  `Teilbeleg` zeigen beide Richtungen. Ob das der Standard bleibt, entscheidet
  die Abnahme.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
