# Sachverhalt — Detailseite · Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/cases/[caseId]/page.tsx` (418 Z.) |
| Heute gebaut in | `modules/accounting-cases/ui/sachverhalt/` — `SachverhaltScreen.tsx` (1815 Z.), `parts.tsx` (522 Z., `Hero` · `NextActionBar` · `SvTabsBar`), `FehltPanel.tsx`, `RaiseClarificationForm.tsx` |
| Entitäten | Sachverhalt (`accounting-case`, Profil fehlt noch) · Ereignis · Klärung · Erwartung · Buchung · Beleg |
| Baustein in v3 | noch keiner — Aufgabe 0050 |
| Fachliche Quelle | `ludwig/app`: `docs/topics/sachverhalt.md` (Zustände, Regeln S1–S3) |
| Profil von / am | Claude, 2026-09-03 · Screenshot der heutigen Implementierung |

## Job

> Wenn **ein Sachverhalt in ihrem Vorrat liegt**, will **die Sachbearbeiterin
> der Kanzlei** **ihn zur Buchung bringen — oder begründet weglegen**, damit
> **der Vorgang die Kette Beleg → Ereignis → Sachverhalt → Buchung verlässt
> und nicht ein zweites Mal angefasst werden muss**.

- **Fertig ist sie, wenn** jedes Ereignis des Falls gebucht ist, eine Klärung
  gestellt oder ein Beleg erwartet wird — der Fall also entweder geschlossen
  ist oder nachweislich auf jemand anderen wartet.
- **Misslungen ist die Seite, wenn** sie bucht, ohne den Widerspruch gesehen
  zu haben, der auf einem der acht Reiter lag — oder wenn sie den Fall zurück
  in den Vorrat legt, weil sie nicht erkennt, dass sie selbst am Zug ist.

Der Vorrat ist der Rahmen, nicht der Einzelfall: `1/117` im Kopf sagt, dass
diese Seite 117-mal hintereinander bedient wird. Jeder Klick zählt mal 117.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Worum geht es — wer, was, wie viel?" | Kopf-Karte: Art, Gegenpart, Gesamtbetrag | 0048 `EntityHeader` |
| 2 | „Bin ich dran, oder wartet der Fall auf jemanden?" | `disposition` + `lifecycle_status`, heute vier Anzeigen (s. u.) | `StatusBadge` (Achse `sachverhalt`) |
| 3 | „Was ist der nächste Schritt, und kann ich ihn von hier aus tun?" | Nächste-Aktion-Leiste mit genau einem Knopf | `StatusCallout` + `icon` (0049) |
| 4 | „Was ist bisher passiert?" | Strang aus Ereignissen, Klärungen, Erwartungen | `CaseTimeline` (0040, fertig) |
| 5 | „Stimmt das Bild — deckt sich der Beleg mit der Buchung?" | Detailspalte: Beleg ↔ Buchung nebeneinander | `MasterDetail` + Unterreiter |
| 6 | „Was hakt — welche Frage ist offen, was ist unplausibel?" | Reiter Rückfragen, Plausibilität | `Tabs` mit Zähler |
| 7 | „Wie steht das Konto?" | Reiter Saldo & Konten | `AccountField`, `Amount` |
| 8 | „Wer hat wann was entschieden?" | Reiter Historie, Rohdaten, DATEV-Wahrheit | `Timeline`, `FieldList` |
| 9 | „Und der nächste Fall?" | Pager im Kopf, ohne Umweg über die Liste | 0047 `RecordPager` |

Rang 1–4 müssen ohne Scrollen und ohne Klick beantwortet sein. Rang 5–8 dürfen
je einen Klick kosten. Rang 9 ist eine Taste (`J`/`K`, `Hotkeys` gibt es).

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Beleg nachträglich anhängen | selten (geschätzt) | einen Knopf im Kopf |
| Belegnummern-Modus umstufen (S3) | selten, begründungspflichtig | einen Klick + Dialog mit Grund |
| Zusammenfassung schreiben | selten | einen Bleistift, keine eigene Zeile im Ruhezustand |
| Fall an die Kanzlei zurückgeben | mittel | einen Eintrag im Überlaufmenü |

## Was hier nicht hingehört

- **Filter und Sortierung des Vorrats** → Listenseite. Hier zählt nur der Pager.
- **Mandanten-Stammdaten** → Mandantenseite; hier nur als Link.
- **Der DATEV-Exportlauf** → Batch-Seite. Der Reiter „DATEV-Wahrheit" beantwortet
  Rang 8 für *diesen* Fall, nicht den Lauf.
- **Erklärungen zur Statuslogik** → `StatusInfoDialog` hinter dem Info-Punkt,
  nicht als Text auf der Seite.

## Zweifel am heutigen Format

1. **Die stärkste Stelle im Kopf ist leer.** „GESAMTBETRAG —" steht oben rechts,
   trägt aber nichts, weil der Fall noch keinen Betrag hat. → Wenn Rang 1 keine
   Zahl hat, gehört dorthin die Zahl, die es gibt (Betrag des Belegs), oder
   nichts. Ein leerer Kennzahlblock kostet die beste Position.
2. **Frage 2 wird viermal beantwortet.** „Klärung offen" (Meta), „STATUS
   laufend" (Faktenzeile), „Noch nicht ausgeglichen" (rechts), „Buchung fehlt"
   (Timeline und Detail) sind vier Anzeigen auf drei Achsen. → Eine Achse führt,
   die anderen erscheinen dort, wo sie hingehören (am Ereignis, nicht am Fall).
3. **Acht Reiter plus zwei Unterreiter für einen Fall mit einem Ereignis.**
   Die Reiterleiste ist auf den größten denkbaren Fall geschnitten. → Reiter
   ohne Inhalt gehören ausgeblendet oder gedämpft; der Zähler entscheidet.
4. **„DomainFactory GmbH" steht dreimal** (Titel, Meta-Zeile, Faktenzeile
   „Geschäftspartner") und das Personenkonto trägt den Namen ein viertes Mal.
   → Der Gegenpart gehört einmal in den Titel; die Faktenzeile trägt, was der
   Titel nicht sagt.
5. **Die Zusammenfassung belegt eine Zeile, um mitzuteilen, dass sie leer ist.**
   → Im Ruhezustand ein Bleistift in der Kopfzeile; die Zeile erscheint, wenn
   Text da ist (`InlineEdit` kann das, `EmptyState` V9 „noch nichts angelegt").
6. **Die Timeline-Spalte ist eine Karte mit einem Eintrag** und nimmt ein
   Drittel der Breite. → Bei ≤ 1 Ereignis ist der Zweispalter kein Gewinn; die
   View sollte den Strang erst ab zwei Einträgen aufmachen.

Punkt 1–6 sind Vorschläge an die Spec, keine beschlossenen Änderungen. Die
Reihenfolge oben ist die Prüfliste: jedes Element des Screens muss eine der
neun Fragen beantworten, sonst fliegt es.
