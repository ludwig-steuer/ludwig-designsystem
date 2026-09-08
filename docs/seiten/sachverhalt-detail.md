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

## Detailseiten-Standard (Nachtrag 2026-09-08)

Geprüft gegen `docs/detailseiten-standard.md` (D1–D16).

| | |
|---|---|
| Layout | **D-L1 Zonen untereinander** — Owner-Entscheid 2026-09-08. Die Randspalte fällt, die Ereignisse stehen untereinander. Gebaut war **D-L3** mit dem Strang darin (`CaseDetailView`, 0050); die Zahl trug das nicht — Ereignisse **p50 1 · p90 2 · max 38**, der Richtwert für einen Strang neben der Fläche ist `p90 ≥ 5`, also hätten 90 % der Fälle eine Spalte mit höchstens zwei Einträgen getragen. **Der Rahmen selbst ändert sich nicht:** `CaseDetailView` behält seinen `aside`-Slot, weil andere Entitäten ihn brauchen — die Seite füllt ihn nicht mehr |
| Reiter | **Übersicht** (Rang 1–4) · **Details** · Beleg ↔ Buchung (Rang 5) · Rückfragen (6) · Plausibilität (6) · Saldo & Konten (7) · DATEV-Wahrheit (8) · **Verlauf** (8) · **Rohdaten** (8). Der Standard **ordnet** die Leiste, er kürzt sie nicht — die Frage aus Zweifel 3 („acht Reiter für einen Fall mit einem Ereignis") bleibt offen und gehört in die Spec. |
| Zone 4 (Abrisse) | Ereignisse **4 % ohne · p50 1 · p90 2** → keine eigene Karte, der Strang steht in der Randspalte · Klärungen **87 % ohne · p50 0 · p90 1** → Zahl mit Weg in Zone 3 · Erwartungen **95 % ohne**, Klammern **95 % ohne**, Belegnummern **99 % ohne**, Regel **97 % ohne** → nichts auf der Übersicht |
| Zone 5 (Verlauf) | die Zone nennt als Quelle den **Ereignis-Strang** (`CaseTimeline`, 0040), nicht das Audit-Log: dieses ist bei **43 % der Fälle leer** (p50 3 · p90 9 · max 84) und wäre in fast jedem zweiten Fall eine leere Zone |

## Abweichung vom Detailseiten-Standard

- **D10 (eine Leiste, ein Mechanismus):** Die Leiste mischte zwei URL-Muster —
  drei Einträge als `?tab=uebersicht&view=…`, die übrigen als `?tab=…`
  (`SvTabsBar`), dazu Unterreiter im Detail von Rang 5. Das war **keine
  begründete Ausnahme, sondern ein Befund** (L-259).

  **Entschieden am 2026-09-08 (Owner): Weg 2 — die drei `view`-Einträge werden
  Zonen der Übersicht** (§2.2 des Standards), keine Reiter. Damit bleibt genau
  ein Mechanismus in der Leiste, und die drei Sichten wandern dorthin, wo der
  Standard sie ohnehin vorsieht: untereinander im ersten Reiter, jede mit
  ihrem Weg in die Vertiefung. Die App baut es; Abweichungen kommen als Zeilen
  hierher. Die Unterreiter von Rang 5 lösen sich davon unabhängig in der
  Gegenüberstellung Beleg ↔ Buchung auf.
- **D12 (Rohdaten zuletzt):** Rang 8 bündelt heute Historie, Rohdaten und
  DATEV-Wahrheit in einer Zeile. Der Standard trennt sie: Historie → Verlauf,
  DATEV-Wahrheit → eigene fachliche Sicht, Rohdaten → letzter Reiter.
- **Zweifel 6 ist geschlossen (Owner, 2026-09-08): die Randspalte fällt.**
  Der Zweifel fragte, ob der Zweispalter erst ab zwei Einträgen öffnen soll —
  die Antwort ist eine Ebene darüber: das Layout wechselt **nie** je Datensatz
  (D3), und für diese Entität trägt die Zahl es nicht. Ereignisse p50 1 ·
  p90 2; eine Randspalte hätte in 90 % der Fälle höchstens zwei Einträge
  gezeigt und daneben die Fläche verschmälert.

  **Was das für 0050 heißt: nichts.** `CaseDetailView` ist ein Rahmen mit
  Slots; `aside` bleibt, weil das Konto ihn nach D-L3 weiter braucht. Nur
  diese Seite übergibt ihn nicht mehr — und die Ansicht fällt dann von selbst
  auf eine Spalte, das ist im Rahmen so gebaut (`aside` fehlt → `v2cdv__body`).
