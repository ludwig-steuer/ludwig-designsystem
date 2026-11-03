# 0245 · BankTransactionRow: Teilbeträge außerhalb des Sichtbereichs

| | |
|---|---|
| Status | spec — **niedrige Priorität** (llcto 2026-11-03) |
| Stufe | `entities/bank-transaction/` — bestehende Form, keine neue |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, die Zeile eines Kontoauszugs |
| Quelle | Fund der fremden Abnahme von 0244 (H11), llcto 2026-11-03: „Teilbeträge außerhalb des Sichtbereichs sind ein echter Mangel“ |
| Ersetzt | — |
| Blockiert | nichts; die App rendert `BankTransactionRow` heute nicht (grep 2026-11-03: der Kontoauszug nutzt `DataTable` mit `BankTransactionFoldout`) |
| Spec von / am | Claude, 2026-11-03 |

## Befund (gemessen 2026-11-03, 1280 px)

- Alle Stories von `BankTransactionRow` rendern eine Tabelle mit 1400 px Breite im 1246 px breiten
  Rahmen, mit Querscroll. Die Ursache ist der Story-Rahmen: `Frame` setzt `Table minWidth={1400}` und
  `maxWidth: 1400` (`BankTransactionRow.stories.tsx:56–59`), nicht die Spuren der Spalten.
- `Expanded`: Die Unterzeile je Sachverhalt (`.v2btxrow__splitrow`, `120px 1fr 160px 130px`) liegt in
  einer Zelle über alle Spalten (`colSpan={999}`). Ihr Teilbetrag steht deshalb am rechten Rand der
  **Tabelle** (x = 1269) und nicht am rechten Rand des **Sichtbereichs**. Wer die Summe prüft („geht es
  auf?"), muss erst querscrollen.
- Daneben: `.v2case__link` wird in der Zeile gekürzt (163/130, 281/130 px).

## Ziel

Die Teilbeträge und die Summe „zugeordnet" stehen ohne Querscrollen dort, wo das Auge den Betrag der
Zeile sucht.

## Lösungsweg (Default)

1. **Story-Rahmen ohne feste Breite:** `minWidth` aus den Spuren (`bankTransactionTracks`), wie
   `DataTable` sie seit 0147 selbst rechnet, statt 1400.
2. **Unterzeile im Sichtbereich:** Der Block der Unterzeilen bekommt `position: sticky; left: 0` und
   die Breite des Sichtbereichs des Scroll-Containers (`max-width: var(--v2tbl-viewport)` o. ä.),
   damit der Teilbetrag am sichtbaren rechten Rand steht, auch wenn die Tabelle scrollt. Die
   Alternative, Unterzeilen über `subgrid` an die Spalte „Betrag" zu binden, ist nicht möglich: eine
   Tabellenzelle mit `colSpan` trägt kein Raster der Zeile.
3. Messen bei 1280 und 1440 px, mit und ohne Querscroll.

## Abnahme

| # | Kriterium | Prüfung |
|---|---|---|
| 1 | Bei 1280 px kein Querscroll in den Stories, deren Spalten hineinpassen | alle `BankTransactionRow`-Stories |
| 2 | In `Expanded` stehen Teilbeträge und Summe im Sichtbereich, auch wenn die Tabelle scrollt | `getBoundingClientRect().right` ≤ Scroll-Container rechts |
| 3 | Zeilenhöhen und die übrigen Spalten unverändert | Vorher/Nachher-Messung |

## Offene Fragen

1. Soll die Unterzeile statt am Sichtrand unter der Spalte „Betrag" stehen? Ohne Antwort: am
   Sichtrand. Das ist mit `colSpan` sicher, die Spaltenbindung wäre ein Umbau der Zeile.
