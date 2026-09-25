# Stapel — Detailseite · Seitenprofil

| | |
|---|---|
| Status | Entwurf — ungeprüft |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/batches/[batchId]/page.tsx` (Stand App `1947c8d2`, 2026-09-25) |
| Heute gebaut in | `modules/datev-export/ui/StapelDetailScreen.tsx` (1.106 Z.): `Kopf` (`:248`), `Aktionen` (`:318`), acht Reiter (`:75–84`); Knöpfe `BatchActions.tsx` (`TakeOverReviewButton`, `ReturnToAgentButton`, `DiscardBatchButton`), `ResetBatchButton.tsx`; Zustandstabelle `domain/batch-process.ts` (`BATCH_PHASES`, `batchPhaseProgress()`, `batchOwner()`, `batchActions()`) |
| Entitäten | Stapel (`docs/entitaeten/export-batch.md`, geprüft) · Buchungssatz · Beleg · Klärung · Buchungslauf · Audit-Ereignis |
| Baustein in v3 | noch keiner — `BatchView` ist Backlog (0167). Der Rahmen kommt aus dem Standard: `RecordPager` (0047) · `EntityHeader` mit `process` (0048, 0137) · `StatusCallout` (0049) · `Tabs` · `FieldList` · `LogBrowser` (0054) · `BatonBar` · `RawRecord` (0051) |
| Profil von / am | Claude, 2026-09-25 — Anlass: Owner-Befund zur Stapelseite über ll-cto2 (flache Knopfreihe, Kopf ohne Standard) |
| Layout | **D-L1** Zonen untereinander — keine Liste mit Rang ≤ 4 (die Buchungssätze sind Rang 5), nichts wird gegen eine Quelle gestellt |
| Reiter | Übersicht · Buchungen · Belege · Durchgänge · Verlauf · Technik |
| Zonendeckung | Kopf ✓ · Mängel ✓ · Fakten ✓ · Abrisse: Buchungen (p50 44,5) und Belege; **kein** Abriss für Durchgänge (p50 1,5 < 2, D15) · Verlauf ✓ (Audit p50 3, max 23, mit `BatonBar`) |
| Abweichungen vom Standard | eine, siehe unten |

## Job

> Wenn **ein Stapel in einem Zustand steht, der die Kanzlei braucht**, will
> **die Sachbearbeiterin** **sehen, wo er steht und wer dran ist, und den
> nächsten Schritt von hier aus anstoßen**, damit **kein Zeitraum liegen
> bleibt und keiner doppelt bearbeitet wird**.

- **Fertig ist sie, wenn** sie den nächsten Schritt gedrückt hat (Prüfung
  übernehmen, zur Abnahme, zur Übergabe, erneut übertragen, zur Nachlese) oder
  gesehen hat, dass jemand anderes dran ist (Agent, Mandant, DATEV).
- **Misslungen ist die Seite, wenn** sie zwischen fünf gleich lauten Knöpfen
  den falschen drückt — „Zurücksetzen" statt „Zur Abnahme" — oder wenn der
  nächste Schritt fehlt, weil der Zustand ihn nicht zeigen kann (heute bei
  `failed`, L-345).

Die Seite wird selten besucht (etwa einmal je Stapel und Zustand); die Arbeit
im Stapel passiert in der Abnahme. Der Vier-Wochen-Test ist hier das Maß: wer
Ludwig vergessen hat, muss den einen Knopf ohne Suchen finden.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Welcher Stapel ist das?" | Kopf: Stapelnummer, Bezeichnung, Zeitraum, Art (Mandantenstapel, Nachtrag zu …) | `EntityHeader` `overline` · `title` · `meta` (Nachtrag als `BatchCell`, sobald gebaut) |
| 2 | „Wo steht er, und wer ist dran?" | **ein** Zustand + das Prozessbild mit Staffelstab | `StatusBadge` (`export_batch`) · `EntityHeader process` = `ProcessStepper` (kompakt, 0203) |
| 3 | „Was ist mein nächster Schritt?" | Signal mit **einem** Knopf; ist keiner da, sagt der Staffelstab, wer dran ist (D22) | `StatusCallout` — Knopf aus `batchActions()` |
| 4 | „Hakt etwas?" | Zone 2: Soll ≠ Haben · Personenkonten fehlen (nur Mandantenstapel) · DATEV-Fehler · offene Klärungen der Kanzlei · offene Nachforderungen | `StatusCallout` je Zeile; leer = Haken + Satz mit Zahl |
| 5 | „Was ist drin?" | Kopf-Fakten (Buchungen, Klärungen, Belege) · Abrisse Buchungen, Belege · Reiter | `EntityHeader facts` · `Card` + `DataTable` |
| 6 | „Was ist bisher passiert?" | Zone 5 Verlauf mit Staffelstab · Reiter Durchgänge, Verlauf | `BatonBar` · `LogList` · `LogBrowser` |
| 7 | „Was hat DATEV gesagt?" | Reiter Technik | `FieldList` · `RawRecord` |

## Die Slots

| Slot | Inhalt |
|---|---|
| Pager | `RecordPager` ohne Menge, `back` = „Stapel" (die Liste nennen, nie „Zurück", V14). Ersetzt „← Zurück zur Liste" |
| Kopf | `overline` „Stapel 2026-0009" · `title` Bezeichnung · `status` `StatusBadge` · `meta` Zeitraum · Mandantenstapel · Nachtrag zu … · Runde n · `process` Prozessbild **mit** Staffelstab (der Baton rechts oben fällt weg, L-346) · `facts` höchstens vier: Buchungen (freigegeben / Vorschlag), Klärungen offen, Belege erledigt, Durchgänge · `actions` nach der Tabelle unten |
| Signal | nur, wenn die Kanzlei dran ist oder ein Fehler vorliegt: `StatusCallout`, der Titel nennt den Stand in einem Satz („Der Stapel wartet auf Ihre Prüfung"), der Knopf ist `batchActions().primary`; `datevError` als `danger` mit dem Wortlaut von DATEV. Wartet der Stapel auf Agent oder DATEV oder ist er zu Ende, gibt es kein Signal und keinen Satz im Kopf (D22, §3.2) — die Sätze aus `batchActions().info` stehen hinter dem (i) des Zustands |
| Reiter | sechs, siehe unten |
| Körper | D-L1; Übersicht in den fünf Zonen |

### Aktionen je Zustand (D8)

Genau ein nächster Schritt im Signal, höchstens zwei sichtbar im Kopf, der Rest
im Menü „Weitere Aktionen", Zerstörendes dort mit `tone="danger"` und Dialog.
Die Handlungen kommen weiter aus `batchActions()`; die Tabelle sagt nur, **wo**
sie stehen.

| Zustand | Signal (ein Knopf) | Kopf sichtbar | Menü „Weitere Aktionen" |
|---|---|---|---|
| `agent` | — (wartet auf den Agenten, D22) | Ansehen | Verwerfen (danger) |
| `prepared` | Prüfung übernehmen — auch bei offenen Nachforderungen (Staffelstab „Mandant (wartet)"), weil die Kanzlei trotzdem übernehmen kann | Ansehen | An Agenten zurückgeben · Zurücksetzen (danger) · Verwerfen (danger) |
| `review` | Zur Abnahme | — | An Agenten zurückgeben · Zurücksetzen (danger) · Verwerfen (danger) |
| `ready` | Zur Übergabe | Freigabe zurücknehmen | — |
| `exporting`, `exported`, `inspection` | — (wartet auf DATEV, D22) | Transport ansehen | — |
| `failed` | Erneut übertragen + Fehlertext | Protokoll ansehen · Freigabe zurücknehmen | — |
| `confirmed`, `mirrored` | Zur Nachlese | — | — |
| `closed` | — (Endzustand) | Nachlese ansehen | — |
| `cancelled` | — (Endzustand) | Ansehen | — |

„Freigabe zurücknehmen" führt zurück nach `review` und ist damit umkehrbar,
also sichtbar erlaubt. „Zurücksetzen" entfernt die Artefakte des Stapels und
„Verwerfen" den Stapel selbst: beide stehen im Menü. Das Menü steht auch mit
einem einzigen zerstörenden Eintrag (§4.1 geht §11.2 vor). Muster: Eintrag
setzt einen Zustand, der Dialog steht **neben** dem Menü
(`CaseRouteMenu.tsx`).

## Reiter

| # | Reiter | Rang | Inhalt | heute |
|---|---|---|---|---|
| 1 | Übersicht | 1–6 | die fünf Zonen | Übersicht (`KpiGrid` mit sechs Kacheln, zwei `FieldList`, Übergabebericht) |
| 2 | Buchungen | 5 | die gestempelten Sätze nach Status, Σ Soll / Haben im Kartenkopf | Buchungen |
| 3 | Belege | 5 | Belege im Zeitraum, erledigt / offen | Belege |
| 4 | Durchgänge | 6 | Buchungsläufe; der letzte Übergabebericht oben | Durchgänge + Bericht aus der Übersicht |
| 5 | Verlauf | 6 | `LogBrowser` mit Tiefen über `Segmented` (Z6) | Log (heißt künftig „Verlauf", §5.2) |
| 6 | Technik | 7 | DATEV-Seite (Stapel, Vorgang, Festschreibung, Prüfung, zuletzt gesehen, Sendenachweis → Export-Historie) · „Entstanden in diesem Stapel" (Sachverhalte, Klärungen, Notizen, Regeln, Prüf-Quittungen) · Experiment (nur bei Experiment-Mandanten) · Rohdaten zuletzt, eingeklappt | DATEV · Artefakte · Experiment |

Kein Reiter „Details": alle Felder des Stapels passen in Zone 3.
„Artefakte" ist ein Systemwort (T4). Die Menge heißt nach der Anzeige-Regel des
Entitätsprofils „entstanden in" und steht in der Technik; der Dialog von
„Zurücksetzen" verlinkt dorthin, weil genau diese Menge entfernt wird.

## Übersicht — die fünf Zonen

| Zone | Inhalt | Deckung |
|---|---|---|
| 1 Kopf | siehe Slots | — |
| 2 Mängel | Soll ≠ Haben (danger) · Personenkonten ohne Namen (Mandantenstapel, warning, Weg: Konten) · offene Klärungen der Kanzlei (warning, Weg: Abnahme Schritt 2) · offene Nachforderungen mit Frist (info). Leer: „Nichts offen — 46 Buchungen, 0 Klärungen offen." | Klärungen p50 9,5 |
| 3 Fakten | Bezeichnung · Stapelnummer · Zeitraum · Art · Ablageort in DUO (oder „wird beim Push festgelegt") · angelegt von / am · zuletzt bewegt | 100 % bis auf `created_by` 57 % |
| 4 Abrisse | Buchungen (fünf Zeilen, „alle n →") · Belege (fünf Zeilen) | Buchungssätze p50 44,5; Belege im Zeitraum nicht gemessen |
| 5 Verlauf | letzte fünf Audit-Einträge mit `BatonBar`, „ganzer Verlauf →" | Audit p50 3, max 23 |

## Nebenjobs

| Nebenjob | Wie oft (geschätzt) | Darf kosten |
|---|---|---|
| Stapel an den Agenten zurückgeben | selten, je Stapel höchstens einmal | Menü + Dialog |
| Zurücksetzen, Verwerfen | sehr selten | Menü + Dialog mit Folge im Knopf |
| Freigabe zurücknehmen | selten | ein sichtbarer Knopf in `ready`/`failed` |
| Export-Historie ansehen | selten, nach der Übertragung | einen Reiter (Technik) und einen Klick |
| Übergabebericht des Agenten lesen | je Durchgang | einen Reiter (Durchgänge) |

## Was hier nicht hingehört

- **Die Stapelabnahme** (`batches/[id]/review/[step]`, Modul `batch-review`):
  eigene Seite mit `StepRail`, vom Standard ausgenommen. Diese Seite führt
  nur hin (Signal-Knopf). Sie braucht ein eigenes Profil
  (`stapelabnahme.md`, Backlog).
- **Eine Liste der Stapel:** der Pager führt zurück; `BatchList`.
- **Der Fehlertext von DATEV in roter Schrift neben den Knöpfen:** er ist das
  Signal (Zone Signal, `danger`), nicht Beiwerk der Aktionen.
- **„Export-Historie ansehen ↗" im Kopf:** das ist ein Sprung in die Technik,
  kein Tun am Datensatz; der Pfeil ist ein Unicode-Zeichen als Bedeutungsträger.

## Zweifel am heutigen Format

1. **Fünf gleichrangige Knöpfe unter dem Prozessbild** (Owner-Befund): Der
   nächste Schritt, das Zurückgeben, das Zurücksetzen, das Verwerfen und die
   Historie stehen in einer Reihe → Tabelle „Aktionen je Zustand".
2. **Zwei Staffelstäbe:** „Dran ist" rechts oben und der Baton im
   `ProcessStepper` beantworten dieselbe Frage (§3.2) → nur im Prozessbild (L-346).
3. **Das Prozessbild zeigt Rohzustände** (`agent · prepared`) und
   `sub` mit „⇄"/„→" als Bedeutungsträger. Der Owner will es gröber und
   schmaler → Spec 0203; die Phasenliste bleibt Sache der App-Domain.
4. **Der Kopf ist eine `Card` mit Inline-Styles** statt `EntityHeader` →
   D3/D6.
5. **Acht Reiter nach Datenquelle** → sechs nach Frage. „Log" heißt
   „Verlauf", DATEV, Artefakte und Experiment gehen in die Technik.
6. **Sechs KPI-Kacheln** in der Übersicht: Σ Soll ist nur als Mangel eine
   Antwort („geht nicht auf"), sonst eine Zahl ohne Frage → Kopf-Fakten
   und Zone 2.

## Abweichung vom Detailseiten-Standard

| Regel | Was stattdessen gilt | Warum |
|---|---|---|
| D8 / §11.2 „kein Menü bei einer Aktion" | in `agent` steht ein Menü mit dem einen Eintrag „Verwerfen" | §4.1 verlangt Zerstörendes immer im Menü; von zwei Regeln gewinnt die, die vor dem Fehlgriff schützt |
