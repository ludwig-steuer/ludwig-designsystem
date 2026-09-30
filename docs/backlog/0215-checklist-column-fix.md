# 0215 · Checklist: Spalte Stand und Sprung-Pfeil (Abnahme)

| | |
|---|---|
| Status | Fremde Abnahme 2026-09-30 — abgenommen, ein kleiner Mangel an der Deck-Seite |
| Quelle | 30e8b48 — `patterns/Review.tsx` (Spalte „Stand" 76 → 96 px), `styles/v3.css` (`.v2chk__jump` `inline-flex`), neu `showcase/deck/DeckScreens.stories.tsx` (Seiten/Deck: Questions, Protocol) |
| Gemessen | Playwright, Storybook :6107, jede Story in einem eigenen Frame zu 1280 × 900 und 1440 × 900; Rechtecke per `getBoundingClientRect`, Text über `Range` |
| Stories | `seiten-deck--protocol`, `seiten-deck--questions`, `seiten-stapelabnahme--bookings` (Schritt 1 „Vollständigkeit", zweimal „Zurück"), `v3-patterns-prüfen-checklist--filled`, `--all-passed`, `--not-counted`, `--loading`, `--loading-empty` |

## Kriterien

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Zähler überlappt den Balken nicht | Abstand Textende „Stand" → linke Kante `.v2bar`, alle Zeilen mit Balken, beide Breiten: überall 10 px, auch „231 von 231" und „118 von 118" (Deck) und „106 von 118" (Filled). Spalte „Stand" 96 px, `scrollWidth ≤ clientWidth` in jeder Zeile | erfüllt |
| Pfeil und Wort auf einer Zeile | Mitte Icon vs. Mitte Text < 4 px, Icon rechts vor dem Text; Abstand 4 px (`--space-1`), Höhe `.v2chk__jump` 18 px — alle 9 Deck-Zeilen, 4 Filled-, 4 NotCounted-Zeilen, beide Breiten | erfüllt |
| Tabelle scrollt nicht quer | Kein Vorfahr der Tabelle mit `scrollWidth > clientWidth`, Dokument ohne Querscroll — Deck 662 / 822 px, Filled 806 / 966 px, AllPassed/NotCounted/Loading 1246 / 1406 px, Stapelabnahme 996 / 1156 px (je 1280 / 1440) | erfüllt |
| Gegenprobe: kein Label gekürzt | `.v2chk__label` `scrollWidth ≤ clientWidth` in allen Checklist-Stories; schmalste Spalte „Prüfung" 296 px (Deck bei 1280), längstes Label dort 241 px („Konventionen der Kanzlei eingehalten") | erfüllt |
| Gegenprobe: Ladezustand | Loading und LoadingEmpty: Kopf steht mit 20 · 804/964 · 96 · 100 · 150 px, kein Querscroll | erfüllt |
| Sprung-Wort ungekürzt | Längster Sprung „Schritt 7: Konventionen" 142 px in 150 px Spalte | erfüllt |
| Deck: nur ein Mandant, keine echten Personen | Kopfzeile „Fakir Technology Consultants GmbH · DATEV 42606 · 2026"; sonst nur erfundene Sachnamen („Restaurant am Markt", Stapel 09-2026-Ludwig), keine Personennamen in Datei und Screenshot | erfüllt |
| Deck: Sprache | Kein Du, kein Ausrufezeichen, keine Versalien außer dem Eigennamen DATEV; Sätze im Infinitiv bzw. dritte Person für Ludwig | erfüllt |
| Deck: Sprünge stimmen mit dem Rail | Prüfprotokoll-Sprünge 1…7 zeigen auf die gleichnamigen Schritte der Leiste | erfüllt |
| Prüfskripte | `pnpm typecheck`, `pnpm check:language`, `pnpm check:when`, `pnpm check:type` — alle Exit 0 | erfüllt |

## Mängel

- **M1 (klein, Logik) · Seiten/Deck/Questions, Primärbutton.** „Weiter zu
  Schritt 3" nennt eine Nummer statt des Schritts; die Leiste daneben heißt an
  der Stelle „3 · Buchungsvorschläge". CLAUDE.md §2 Logik: der nächste Schritt
  ist benannt. Vorschlag: „Weiter zu Buchungsvorschläge" (Protocol macht es mit
  „Weiter zur Übergabe" schon richtig).

## Hinweise (keine Regression dieses Commits)

- **H1 · `.v2chk__jump`: `text-overflow: ellipsis` greift nicht.** Weder am
  früheren Inline-Span noch am jetzigen `inline-flex` (der Text ist ein
  anonymes Flex-Kind). Gemessen mit einem künstlich langen Sprung „Schritt 10:
  Übergabe an DATEV mit Nachlese" (Protocol, 1440): Span 258 px in 150 px
  Zelle, läuft 89 px über den Kartenrand hinaus und wird dort von `.v2card`
  (`overflow: clip`) ohne „…" abgeschnitten. Keine heutige Story erreicht das
  (längster Sprung 142 px). Abhilfe bei Bedarf: Text in ein eigenes Span mit
  `min-width: 0; overflow: hidden; text-overflow: ellipsis`, `.v2chk__jump`
  mit `max-width: 100%`.
- **H2 · ClarificationRow (auf Deck/Questions sichtbar):** „Gefragt vor 4
  Tagen" steht ohne absolute Zeit daneben (§2 Sprache: relative Zeit nur neben
  der absoluten). Baustein-Befund, nicht aus 30e8b48.

## Urteil

**Abgenommen.** Beide Korrekturen am `Checklist` wirken wie beschrieben: der
Zähler hält 10 px Abstand zum Balken, Pfeil und Wort stehen auf einer Zeile,
und die breitere Spalte kürzt kein Label und erzeugt in keiner der sieben
Checklist-Stories einen Querscroll, weder bei 1280 noch bei 1440 px. Die
Deck-Seite ist vorführbar; M1 ist ein Ein-Wort-Fix und blockiert die
Abnahme nicht.

## Nachbesserung 2026-09-30

- **M1:** Der Primärbutton der Deck-Seite nennt den nächsten Schritt: „Weiter zu den Buchungsvorschlägen".
- **H1:** Der Sprungtext steht in einer eigenen Box (`.v2chk__jumptext`) mit Ellipse; Pfeil fest, Zelle `max-width: 100%` — ein langer Sprung wird mit „…" gekürzt statt über den Kartenrand zu laufen.
- **H2** (relative Zeit ohne absolute in `ClarificationRow`) bleibt als Befund am Baustein: die Zeile zeigt das Alter, die genaue Zeit steht im Tooltip (Entscheid T7 der Zeile). Ob das der Regel „relative Zeit nur neben der absoluten" genügt, ist offen.
