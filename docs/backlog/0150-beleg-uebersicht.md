# 0150 · Die Belegübersicht als Vorschau auf ihre Reiter

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
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
| `defects` · `vat` · `history` | `SourceDocumentCard` | Die drei Boxen als Slots. Slots und nicht Daten, weil jede aus einer anderen Quelle kommt und die Karte nichts lädt (E2) | `Clean`, `WithFindings` |
| `counterpartyHref` | Karte, Fakten | Der Gegenpart als Weg zum Geschäftspartner | `Clean` |
| `batchHref` | Karte, Fakten, Completion | Der Buchungsstapel, sobald es ihn gibt | `Clean` |
| `title` | `SourceDocumentFacts` | Der Kopf der Box; `null` im Drawer, wo der Drawer-Titel es sagt | `Clean` |
| `explainCompletion` | `SourceDocumentFacts` | Der Grund als Satz statt nur im Hover | `Done` |
| `explain` · `href` | `SourceDocumentCompletion` | Dasselbe eine Ebene tiefer | `Done` |
| `children` | `StatusInfoButton` | Der Auslöser selbst statt des (i) — die Marke wird klickbar | `Done` |
| `defects` · `actions` · `clarifications` | `SourceDocumentDefects` | Mängel aus `docDefects()`, je Art ein Weg, dazu die Rückfragen | `WithFindings`, `StatementChooseAccount` |
| `rates` · `deductible` · `specialCase` | `SourceDocumentVat` | Aufteilung nach Satz (erst ab zwei), Vorsteuer mit Grund | `Clean` |
| `entries` · `total` · `href` | `SourceDocumentHistory` | Die vier jüngsten Schritte, der Rest hinter einem Weg | `Clean` |

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
| `Clean` | Die vier Boxen im Normalfall, Gegenpart verlinkt, „nichts offen" als Aussage |
| `WithFindings` | Vier Mängel aus `docDefects()` mit ihren Wegen, dazu eine offene Rückfrage in derselben Box |
| `Done` | „Keine Buchung nötig" mit dem eigenen Grund als Satz; daneben `superseded` |
| `StatementAssigned` | Die Zeile Zahlungskonto aus `paymentAccount` (L-266) |
| `StatementChooseAccount` | Der Mangel `payment_account` mit `PaymentAccountField` als Weg (L-268) |

## Was die Staging-Erhebung vom 2026-09-10 dazu sagt

Nach dem Bau erhoben (`docs/entitaeten/source-document-staging-erhebung-2026-09-10.md`,
N = 554). Zwei Zahlen gehören in die Abnahme, weil sie die Spec berühren:

- **Die Mängel-Zone trägt im Regelfall eine Zeile, nie mehr als vier.**
  44 % der Belege haben gar keinen Zustand, 35 % einen, 14 % zwei; drei oder
  mehr sind 6 %, mehr als vier gibt es nicht. Die Box muss also **nicht**
  kürzen — und die Story `WithFindings` mit vier Zeilen ist der obere Rand des
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

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: typecheck, build, @when, kein px | Checks oben | ok |
| „Belegdaten" in der Box; `.v2doc__h` über den Fakten nicht mehr im DOM | `beleg-rechnung--clean/--with-findings/--done`, `andere-belegarten--statement-*`: `.v2doc__h` = 0; Fakten-Karte trägt den Kopf innen (Titel = Belegart „Rechnung"/„Kontoauszug") | ok (Hinweis: Kopf heißt Belegart, nicht „Belegdaten") |
| Vier Boxen in fester Reihenfolge | Clean: Rechnung 217 · Befunde und Klärungen 798 · Umsatzsteuer 926 · Verarbeitung 1220; WithFindings: 217 · 798 · 1242 · 1536; Done: gleiche Folge | ok |
| Erledigungs-Chip ist ein Knopf und öffnet den Status-Dialog | `.v2sinfo--wrap` = `BUTTON` („Gebucht", „Offen", „Keine Buchung nötig", „Ersetzt"); Klick → `.v2dlg` „Erledigung" | ok |
| `no_booking_required`: Grund als Text | `--done`: „Erledigung Keine Buchung nötig 20.08.2026 Privatentnahme, gehört nicht in die Buchführung." | ok |
| Gegenpart Link, wo `counterpartyHref` | Clean/Done: `<a href*=partner>` „Musterbau GmbH"; Kontoauszug-Stories ohne Link | ok |
| Jeder Mangel aus `docDefects()` deutscher Satz, Rohtext darunter | WithFindings: 4 `.v3open__row` (Belegdatum · Dublette mit `.v3open__raw` · Gegenpart mehrdeutig · Empfänger), je Satz; Wege bei 3 von 4 (Dublette bewusst ohne) | ok |
| Keine Zeile über die Kartenkante (1440) | `cardOverflow = 0` in fünf Stories; scrollW 1440 | ok |
| `SourceDocumentAside.tsx` ohne `"use client"` | `head -1` = `import type { ReactNode }` | ok |
| Spec beschreibt das Gebaute | Stories `Sauber`/`Erledigt` heißen `Clean`/`Done` (englische Exporte), Schnittstellen-Tabelle nennt `Sauber`, `Erledigt` | Hinweis (Spec-Nachzug wie 0127, Story-Namen) |

**Urteil: fertig** — mit dem Hinweis, die Story-Namen in der Nachweis-Spalte nachzuziehen (`Sauber`→`Clean`, `Erledigt`→`Done`).

## Nachtrag 2026-09-15 — die Karte ist jetzt `Columns split` (0185)

Die zwei Spalten der Belegkarte kommen nicht mehr aus `.v2doccard__cols` mit
eigener Container-Query, sondern aus dem Muster (D17). Die beiden gemessenen
Böden dieser Abnahme leben als benannte Schritte weiter: `document` 560 für das
Original, `record` 384 für die Belegdaten — samt der Begründung, warum 384 und
nicht 400. Was sich ändert: bei 1136 px Kartenbreite teilen sich die Hälften
den Platz gleichmäßig (646 / 470 statt 560 / 560). Messung in 0185.

## Nachtrag 2026-09-24 — Satz des Mangels vom Aufrufer (F288)

Quelle: ll-cto für ll-dev2 (App b3206dc1). Ein Kontoauszug auf
`awaiting_input` hat seit F288 zwei Ursachen: Zahlungskonto fehlt, oder die
Prüfkette findet, dass die Salden nicht aufgehen. Beides ist `DocDefectKind`
`payment_account`; der feste Satz „Das Zahlungskonto fehlt." war im zweiten
Fall falsch.

- Neue Prop `SourceDocumentDefects.wording?: Partial<Record<DocDefectKind, { title?; hint? }>>`
  — der Satz und die Folgezeile je Art vom Aufrufer; was fehlt, bleibt der
  Haussatz (Default unverändert).
- Nachweis: `Seiten/Beleg/Andere Belegarten` → `StatementDoesNotBalance`
  (neu) neben `StatementWithoutAccount` (unverändert „Das Zahlungskonto fehlt.").

- [ ] `wording.payment_account.title`/`hint` ersetzen Satz und Folgezeile (Story `StatementDoesNotBalance`)
- [ ] Ohne `wording` unverändert (Story `StatementWithoutAccount`)


## Nachtrag 2026-09-29 (Owner, über ll-dev)

Die rechte Spalte hat eine neue feste Reihenfolge: **Belegdaten → Weg des
Belegs (`history`, 0210) → Befunde und Klärungen → Umsatzsteuer →
Teilbelege**. Die Teilbelege stehen nicht mehr unter beiden Spalten, sondern
als eigene Box mit Kopf in der Spalte (`id="parts"` bleibt für den
Prozess-Dialog und den Bündel-Link der Einordnung). Weil die Spalte bei 1280 px
nur 522 px breit ist, zeigt die Box die schmale Kompaktzeile
(`SourceDocumentList variant="narrow"`, `NARROW_VIEW`): Beleg mit „Belegart ·
Datum" darunter, Betrag, Fortschritt — nichts fällt weg. Gemessen: Box 520 =
520, kein Querscroll, kein Stand-Wort gekürzt. Die Props der Karte bleiben
gleich; im Drawer (`tone="bare"`) wandern die Teilbelege mit.

## Fremde Abnahme Nachtrag 2026-09-29 (Stand 004d2d3)

Abnehmer: Claude (fremde Sitzung). Code `SourceDocumentCard.tsx`,
`SourceDocumentList.tsx`, `source-document-columns.tsx` (`NARROW_VIEW`),
Storybook 6107 bei 1280 × 900 mit Playwright.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Reihenfolge rechte Spalte | `Seiten/Beleg/Rechnung/Clean` | ✓ Belegdaten (y 240) → Weg des Belegs (757) → Befunde und Klärungen (1003) → Umsatzsteuer (1131); keine Teilbelege, weil Einzelrechnung; Seite 1280 = 1280 |
| Teilbelege als Box in der Spalte, `id="parts"` | `SourceDocumentCard/WithParts` | ✓ Box „Teilbelege" mit Anzahl in der rechten Spalte (x 739, unter Belegdaten/Dokumentgruppe), `#parts` genau einmal im DOM |
| Box ohne Querscroll | `WithParts` | ✓ Box 522 px, Tabelle 520 = 520; Spuren Beleg 190 · Betrag 104 · Fortschritt 170 px |
| „Belegart · Datum" unter dem Namen | `WithParts` | ✓ „Bürobedarf Meier GmbH / Rechnung · 26.08.2026", Zeilen 64–65 px |
| kein gekürztes Stand-Wort | `WithParts`; Sonde | ✗ nicht nachweisbar in der Story: sie gibt kein `partProcessPicture`, die Spalte zeigt „—". Sonde mit der Fortschritt-Spur 170 px (Dichte `narrow`): Platz für das Wort 75 px; „Vorgeschlagen" 88, „Bereit zur Buchung" 113, „Keine Buchung nötig" 122 px → gekürzt → M1 |
| Sprung auf `#parts` | `WithParts`, Link `#parts` geklickt | ✓ Hash gesetzt, Seite scrollt (262 px), Box im Blick (oben bei 632 px, Rest der Seite zu kurz, um sie ganz nach oben zu holen) |
| Drawer-Form (`tone="bare"`): Teilbelege wandern mit | `SourceDocumentCard/Bare`; Code | ✓ im Code: die Box hängt am selben Zweig wie die übrigen Boxen, unabhängig von `tone`. ✗ in der Story nicht zu sehen: `Bare` hat keine `parts` → M2 |
| Gegenprobe K | `Seiten/Belegzeile/Compact` | ✓ 720 = 720 |

**M1 — blockierend.** Die schmale Kompaktzeile kürzt das Stand-Wort. Die Box
misst 520 px; `NARROW_VIEW` verteilt Beleg `minmax(130px, 1.4fr)` · Betrag 104 ·
Fortschritt `minmax(170px, 1fr)`, und die Fortschritt-Spur bleibt auf ihrem
Boden von 170 px (gemessen). Darin hat das Wort neben dem Balken 75 px. Die
Stand-Wörter der Dokumentachse brauchen 88–122 px („Vorgeschlagen",
„Bereit zur Buchung", „Keine Buchung nötig"). Die Spec-Messung „kein Stand-Wort
gekürzt" beruht auf einer Story ohne Prozessbild. Auflage: der Fortschritt
bekommt den größeren Anteil (z. B. Boden 220 px, Beleg `minmax(120px, 1fr)`),
und `WithParts` gibt `partProcessPicture` mit den langen Wörtern; danach bei
1280 nachmessen.

**M2 — nicht blockierend.** Keine Story zeigt die Teilbelege in der
Drawer-Form. `Bare` hat keine `parts`, und der Kommentar über `WithParts`
(`SourceDocumentCard.stories.tsx:170–174`) sagt noch „die Liste steht **unter**
den zwei Spalten". Das ist falsch und steht dazu auf Deutsch im Quellcode.
Auflage: `Bare` mit Teilbelegen und den Kommentar auf Englisch nachziehen.

**Hinweis.** Die schmale Zeile ersetzt das Einordnungsbild durch das Wort der
Belegart. Warnung, Korrektur-Stift und Verbund-Wort aus 0205 fallen damit in
der Box weg. Fehlt das Belegdatum, steht nur die Belegart, ohne den
gedämpft-kursiven Rückfall aus 0212 (E5). „Nichts fällt weg" stimmt für die
Spalten, nicht für diese beiden Angaben.

### Urteil

**Nicht abgenommen** wegen M1. Reihenfolge, Box, `#parts` und Breite stimmen;
nach Behebung genügt die Nachmessung von `WithParts` mit Prozessbild.

## Fremde Abnahme 2026-09-29 (Nachtrag)

Abnehmer: Claude (fremde Sitzung, unabhängig von der vorigen). Stand 72a10d3
(`git diff 004d2d3..HEAD -- src/ui/v3/entities/source-document/` ist leer —
Code seit der letzten Prüfung unverändert). Code `SourceDocumentCard.tsx`,
`SourceDocumentList.tsx`, `source-document-columns.tsx` (`NARROW_VIEW`),
`document-classification.ts`, `Classification.tsx`; Storybook 6107 bei
1280 × 900 mit Playwright neu gemessen, nicht aus dem Vorbefund übernommen.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Reihenfolge rechte Spalte | `Seiten/Beleg/Rechnung/Clean`, `.v2doccard__facts` Kinder | ✓ Belegdaten (y 219) → Weg des Belegs (756) → Befunde und Klärungen (1002) → Umsatzsteuer (1130); Seite `scrollWidth` 1280 = 1280 |
| Teilbelege als Box, `id="parts"` einmal im DOM | `SourceDocumentCard/WithParts` | ✓ `document.querySelectorAll('#parts').length === 1`; Box bei x 738, direkt unter Belegdaten (die anderen drei Boxen sind Slots und in dieser Story nicht befüllt) |
| Box ohne Querscroll | `WithParts`, `.v2tbl__scroll` | ✓ 520 = 520; Spuren Beleg 190 · Betrag 104 · Fortschritt 170 px (per `getBoundingClientRect` der `<td>`, nicht geschätzt) |
| „Belegart · Datum" unter dem Namen | `WithParts` | ✓ „Bürobedarf Meier GmbH" / „Rechnung · 26.08.2026"; Zeilen 65, 65, 64 px |
| kein gekürztes Stand-Wort | Sonde: reales `.pz-cell`/`.pz-cell__word`-Markup in die lebende Fortschritt-Zelle der Box eingefügt (170 px Spur, wie gemessen), `scrollWidth` vs. `clientWidth` gelesen, wieder entfernt | ✗ Wortplatz 75 px; „Vorgeschlagen" 88 px, „Bereit zur Buchung" 113 px, „Keine Buchung nötig" 122 px — alle drei `scrollWidth > clientWidth` → **M1 weiterhin offen**, unverändert zum Vorbefund |
| Drawer-Form (`tone="bare"`): Teilbelege wandern mit | `SourceDocumentCard/Bare` | ✗ `document.getElementById('parts')` → `null`, `Bare` übergibt weiterhin keine `parts` → **M2 weiterhin offen**; der JSDoc-Kommentar über `WithParts` (Zeile 171–174) behauptet noch „die Liste steht **unter** den zwei Spalten" — sachlich falsch (sie steht seit dem Owner-Nachtrag als Box **in** der Spalte). Deutsch im Kommentar selbst ist nach `check-language.mjs` zulässig (Story-Beschreibungen sind laut Regel 0098 M10 ausgenommen) — der Mangel ist der veraltete Inhalt, nicht die Sprache |
| Sprung auf `#parts` | Code-Grep, `WithParts` | Kein Story und keine Produktzeile ruft `href="#parts"` derzeit auf — weder `WithParts` noch eine Seiten-Story verlinkt dorthin; die einzige Fundstelle mit dem Text „Zu den n Teilbelegen" ist ein Kommentar in `SourceDocumentCard.tsx:188`. Die Mechanik selbst ist verkabelt (`document-classification.ts:141` baut `${links.self}#parts` für `bundle.href`, `Classification.tsx:324–326` rendert ihn als `<Link>`) und wurde direkt geprüft: `location.hash = "parts"` auf `WithParts` gesetzt → Box springt von y 869 auf y 632 (Rest der Seite zu kurz, um sie ganz nach oben zu holen) — der native Anker-Sprung funktioniert. Es gibt aber **keine** Storybook-Story, die einen echten Klick auf einen solchen Link bis zur Box durchspielt; der frühere Nachweis „Link `#parts` geklickt" lässt sich in dieser Form nicht reproduzieren |
| Gegenprobe K | `Seiten/Belegzeile/Compact` | ✓ 720 = 720 |
| `pnpm typecheck` · `check:language` · `check:when` · `check:type` | CLI | ✓ alle vier Exit 0 |

**M1 — weiterhin blockierend**, unverändert (siehe Vorbefund für die
vorgeschlagene Auflage: Fortschritt-Spur vergrößern, `WithParts` mit
`partProcessPicture` ausstatten, danach bei 1280 nachmessen).

**M2 — weiterhin nicht blockierend**, unverändert.

**Hinweis (neu).** Der Sprung auf `#parts` ist als Mechanik in Ordnung, aber
in keiner Story von Anfang bis Ende (Klick auf einen echten Link) belegt. Wer
das für die nächste Abnahme prüfbar machen will, braucht eine Story, die
`classificationPicture` mit einem `bundle.href` aus der echten Domänenfunktion
(oder einem äquivalenten Fixture mit `href: "#parts"`) an dieselbe Karte
übergibt, die auch die `parts` zeigt — heute liegen beide in getrennten
Stories (`DocumentClassification`-Fixtures nutzen `#children`/`#parent`, nicht
`#parts`).

### Urteil

**Nicht abgenommen** — unverändert wegen M1. Der Code ist seit dem letzten
Prüfstand (004d2d3) nicht angefasst worden; diese Sitzung bestätigt den
Befund unabhängig und mit einer direkten Messung der Wortbreite (statt einer
Schätzung).

**Nachbesserung 2026-09-29 (nach der fremden Abnahme):** M1 — Fortschritt in der schmalen Kompaktzeile `minmax(224px, …)` statt 170: Strip + Zeichen + das längste Stand-Wort („Keine Buchung nötig", 122 px). Gemessen: Wort 122 von 122 px, Box 520 = 520. M2 — der Story-Kommentar über `WithParts` beschreibt die Box in der Spalte. Die Story „ITEMS" im Faden war ein Fixture-Export; er liegt jetzt in `clarification/thread-fixtures.ts`.

## Nachprüfung 2026-09-29 (M1)

Abnehmer: Claude (fremde Sitzung). Stand a3c41bc. Storybook 6107 bei
1280 × 900 mit Playwright, dieselbe Sonde wie in der vorigen Nachtrags-Abnahme
(echtes `.pz-cell`/`.pz-cell__word`-Markup in die lebende Fortschritt-Zelle
von `SourceDocumentCard/WithParts` eingefügt, `scrollWidth` gegen
`clientWidth` gelesen, wieder entfernt — die Story liefert weiterhin kein
`partProcessPicture`, also kein echtes Stand-Wort von sich aus).

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fortschritt-Spur 224 px | `WithParts`, `<td>` der dritten Spalte | ✓ 224 px (`--v2-cols: minmax(130px, 1.4fr) 104px minmax(224px, 1fr)`); Beleg-Spalte dafür auf 136 px geschrumpft |
| „Vorgeschlagen" ungekürzt | Sonde | ✓ 88 = 88 px |
| „Bereit zur Buchung" ungekürzt | Sonde | ✓ 113 = 113 px |
| „Keine Buchung nötig" ungekürzt | Sonde | ✓ 122 = 122 px (Zelle 217 px, Spur 224 px) |
| Box ohne Querscroll | `.v2tbl__scroll` | ✓ 520 = 520, unverändert vor und nach der Sonde |
| M2: Story-Kommentar korrigiert | `SourceDocumentCard.stories.tsx:170–173` | ✓ „eine eigene Box als letzte in der rechten Spalte … in der schmalen Kompaktzeile" — die falsche Behauptung „unter den zwei Spalten" ist weg |
| `pnpm typecheck` · `check:language` · `check:when` · `check:type` | CLI | ✓ alle vier Exit 0 |

M1 und M2 sind behoben. Der Hinweis zum `#parts`-Sprung aus dem letzten
Nachtrag (keine Story spielt einen echten Klick von einem Klassifikations-Link
bis zur Box durch) ist unverändert und war nicht Teil dieses Auftrags.

### Urteil (neu)

**Abgenommen.**
