# 0209 · Filter der Belegliste — zwei Ebenen und eine Zeile „was ist gesetzt"

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-28; Owner-Blick und fremde Abnahme stehen aus |
| Stufe | neu `primitives/ActiveFilters.tsx` · erweitert `FilterChips` (`active` als Liste = Umschalter, `ChipOption.icon`) · Seite im Showcase `src/showcase/document-list/` |
| Klassen-Test | `ActiveFilters`: ja — jede Liste zeigt so, was sie eingrenzt. `FilterChips`: ja. Die Seite: entfällt |
| Quelle | Design-Brief **F329** (`app/docs/backlog/F329-document-list-filters-design-brief.md`, Owner 2026-09-28 über ll-cto: „nicht intuitiv") · 0200, 0201, 0195, 0003, 0205 |
| Ersetzt | Vorbild für `modules/invoices/ui/InvoiceFilterForm.tsx` |
| Spec von / am | Claude, 2026-09-28 |

## Ziel

Die Sachbearbeiterin grenzt die Belegliste in einem Griff auf ihre Frage ein
und sieht danach, **was** eingegrenzt ist — ohne dass ihr ein Filter erklärt
werden muss.

## Aufbau

| Rang | Frage | Form |
|---|---|---|
| 1 | Was ist noch zu tun? | Zeile „Stand": `FilterChips` Offen · Hängt · Wartet auf Mandant · Erledigt · Alle, je mit Zahl. **Kein** Kästchen „Nur unerledigte", kein Status-Feld daneben |
| 2 | Welche Art? | Zeile „Einordnung": `FilterChips` mit `active` als Liste (Umschalter, mehrere zugleich) und **denselben Zeichen wie die Spalte** (0205): Leistungsbeleg · Zahlungsbeleg · Nachweisbeleg · Interner Beleg · Auswertung · ohne Einordnung, je mit Zahl |
| 3 | Welcher Beleg? | Suche bleibt sichtbar rechts oben; hinter dem Griff „Filter (n)": Datum **mit Wort und Achse** (Belegdatum · Eingang beim Mandanten), Betrag von/bis mit Hinweis „nur an Rechnungen" |
| 4 | Woran hängt er? | hinter „Filter": Stapel (die Stapel des Jahres, „ohne Stapel"), Sachverhalt alle · mit · ohne; der feine Belegstatus als Kästchen. Geschäftspartner aus der Zeile als Chip mit **Namen** |
| 5 | Was zeigt die Liste gerade? | `ActiveFilters` über der Tabelle: „40 von 335 Belegen", dann jede gesetzte Angabe als Chip in Worten („Eingang beim Mandanten 01.08.2026 – 31.08.2026", „Hartje KG") mit ×; „Alle zurücksetzen" ab zwei. Schnellfilter und Einordnung zeigen sich als gedrückte Chips oben und werden nicht wiederholt; die Zahl steht trotzdem, sobald die Liste eingegrenzt ist |

**„Filter" schließt mit „Anwenden"** (F329 Idee 1): Mehrfachauswahl und
Felder sind ein Entwurf, bis „Anwenden" gedrückt wird — keine Abhängigkeit
von `FilterBar autoSubmit` bei Mehrfachauswahl (Befund F328). Schnellfilter,
Einordnungs-Chips und die Chips in `ActiveFilters` wirken sofort (ein Klick,
ein Zustand).

**Gestrichen:** Kästchen „Mit offener Klärung", Filter „Sachverhalt" nach
`lifecycle_status`, die zwei namenlosen Datumsfelder.

## Bausteine

| Export | Neu/erweitert | Props |
|---|---|---|
| `ActiveFilters` | neu (`primitives/`) | `filters: { key; label; onRemove?; removeHref? }[]`, `result: { shown; total; unit? }`, `onResetAll?`, `resetAllHref?` — rendert nichts, solange nichts eingegrenzt ist |
| `FilterChips` | erweitert | `active: string \| readonly string[]` (Liste = Umschalter, `aria-pressed` je Chip, Gruppe mit Namen); `ChipOption.icon?` — Zeichen vor dem Wort, nie ohne Wort |

## Stories (F329 §4)

`Seiten/Belegliste/Filter`: `NoFilter` (1) · `QuickFilter` (2) ·
`QuickAndCategory` (3) · `AmountAndDate` (4) · `Partner` (5) · `ManySet`
(alles hinter „Filter" gesetzt, „Filter (4)") · `Narrow` (6, 36rem). Die Liste
darunter ist die echte (`DOCUMENT_LIST_COLUMNS` mit Einordnung); Einordnung und
Partner filtern ihre Zeilen, die übrigen Filter zeigen Form und Wörter.

## Owner-Fragen (F329 §7), gebaut mit der Soll-Richtung

1. „Mit offener Klärung" fällt weg — **gebaut so**.
2. Betrag-Filter trotz „nur Rechnungen" — **gebaut, mit Hinweis im Feld**.
3. Datum voreingestellt auf Belegdatum — **gebaut so**; die Achse des
   Jahreszeitraums bleibt Eingang (F296).
4. Stapel-Filter hier — **gebaut** (Moment D des Briefs).

## Datenmodell

„Wartet auf Mandant" als Schnellfilter braucht die ableitbare Nachforderung
(F329 §5); Stapel und Sachverhalt mit/ohne brauchen Filterfelder in der App.
Nichts davon im Set.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |
