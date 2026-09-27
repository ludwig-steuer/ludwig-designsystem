# Stapel — Detailseite · Seitenprofil

| | |
|---|---|
| Status | **geprüft** — fremde Prüfung am 2026-09-27 gegen App `41681e93` (siehe „Prüfung"); Reiter-Neuschnitt vom Owner freigegeben (2026-09-25). Offen, nicht grundsätzlich: Messung der Belege je Stapel (Zone 4) und die Owner-Bestätigung der Abweichungen 2 und 3 |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/batches/[batchId]/page.tsx` (Stand App `origin/staging` `41681e93`, 2026-09-27 — F302 und F303 umgesetzt) |
| Heute gebaut in | `modules/datev-export/ui/StapelDetailScreen.tsx` (1.230 Z.): sechs Reiter (`:88`), `Kopf` (`:254`), `kopfFakten` (`:309`), `Signal` (`:330`), `Aktionen` (`:378`), `TabUebersicht` (`:418`), `TabTechnical` (`:799`); Menü `BatchActionsMenu.tsx`; `TakeOverReviewButton` in `BatchActions.tsx`; Zustandstabelle `domain/batch-process.ts` (`BATCH_PHASES`, `batchPhaseProgress()`, `batchOwner()`, `batchActions()`, `batchActionHref()`, `batchMenuEntries()`, `batchSignalTitle()`); Mängel `domain/batch-defects.ts` |
| Entitäten | Stapel (`docs/entitaeten/export-batch.md`, geprüft) · Buchungssatz · Beleg · Klärung · Buchungslauf · Audit-Ereignis |
| Baustein in v3 | noch keiner — `BatchView` ist Backlog (0167). Der Rahmen kommt aus dem Standard: `RecordPager` (0047) · `EntityHeader` mit `process` (0048, 0137) · `StatusCallout` (0049) · `Tabs` · `FieldList` · `LogBrowser` (0054) · `BatonBar` · `RawRecord` (0051) |
| Profil von / am | Claude, 2026-09-25 — Anlass: Owner-Befund zur Stapelseite über ll-cto2 (flache Knopfreihe, Kopf ohne Standard) |
| Layout | **D-L1** Zonen untereinander — keine Liste mit Rang ≤ 4 (die Buchungssätze sind Rang 5), nichts wird gegen eine Quelle gestellt |
| Reiter | Übersicht · Buchungen · Belege · Durchgänge · Verlauf · Technik |
| Zonendeckung | Kopf ✓ · Mängel ✓ · Fakten ✓ · Abrisse: Buchungen (p50 44,5) und Belege (**ungemessen**, vorläufig — Messung nachholen, siehe Zone 4); **kein** Abriss für Durchgänge (p50 1,5 < 2, D15), die Zahl steht als Kopf-Fakt · Verlauf ✓ (Audit p50 3, max 23, mit `BatonBar`) |
| Abweichungen vom Standard | drei, siehe unten |

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
| 4 | „Hakt etwas?" | Zone 2: Soll ≠ Haben · Personenkonten fehlen (nur Mandantenstapel) · offene Klärungen der Kanzlei. Der DATEV-Fehler steht im Signal (einmal, §2.3); offene Nachforderungen beim Mandanten sind Warten auf eine andere Partei und stehen als Staffelstab „Mandant (wartet)" im Kopf (D22) | `StatusCallout` je Zeile; leer = Haken + Satz mit Zahl |
| 5 | „Was ist drin?" | Kopf-Fakten (Buchungen, Klärungen, Belege, Durchgänge) · Abrisse Buchungen, Belege · Reiter | `EntityHeader facts` · `Card` + `DataTable` |
| 6 | „Was ist bisher passiert?" | Zone 5 Verlauf mit Staffelstab · Reiter Durchgänge, Verlauf | `BatonBar` · `LogList` · `LogBrowser` |
| 7 | „Was hat DATEV gesagt?" | Reiter Technik | `FieldList` · `RawRecord` |

## Die Slots

| Slot | Inhalt |
|---|---|
| Pager | `RecordPager` ohne Menge, `back` = „Stapel" (die Liste nennen, nie „Zurück", V14). Ersetzt „← Zurück zur Liste" |
| Kopf | `overline` „Stapel 2026-0009" · `title` Bezeichnung · `status` `StatusBadge` · `meta` Zeitraum · Mandantenstapel · Nachtrag zu … · Runde n · `process` Prozessbild **mit** Staffelstab (der Baton rechts oben fällt weg, L-346) · `facts` höchstens vier: Buchungen (freigegeben / Vorschlag), Klärungen offen, Belege erledigt, Durchgänge · `actions` nach der Tabelle unten |
| Signal | nur, wenn die Kanzlei dran ist oder ein Fehler vorliegt: `StatusCallout`, der Titel nennt den Stand in einem Satz („Der Stapel wartet auf Ihre Prüfung"), der Knopf ist `batchActions().primary`; `failed` immer als `danger` — mit dem Wortlaut von DATEV aus `datevError`, ohne ihn mit „DATEV hat den Stapel abgelehnt". Wartet der Stapel auf Agent oder DATEV oder ist er zu Ende, gibt es kein Signal und keinen Satz im Kopf (D22, §3.2) — die Sätze aus `batchActions().info` stehen hinter dem (i) des Zustands |
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
| `ready`, Übergabeweg CSV (Staffelstab Kanzlei) | Zur Übergabe | Freigabe zurücknehmen | — |
| `ready`, Übergabeweg Bridge (Staffelstab Bridge) | — (wartet auf die Bridge, D22) | Transport ansehen · Freigabe zurücknehmen | — |
| `exporting`, `inspection` | — (wartet auf Bridge bzw. DATEV, D22) | Transport ansehen | — |
| `failed` | Erneut übertragen + Fehlertext (`danger`) | Protokoll ansehen · Freigabe zurücknehmen | — |
| `confirmed` (Staffelstab Spiegel) | — (wartet auf den Spiegel, D22) | Transport ansehen | — |
| `mirrored` (Staffelstab Agent) | — (der Agent macht die Nachlese, D22) | Nachlese ansehen | — |
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
| 3 | Belege | 5 | Belege, die dieser Stapel bearbeitet hat — über den Stempel am Ereignis (Herkunft, nicht Zugehörigkeit), **nicht** der Zeitraum; Spaltensatz der Belegliste. Reiterzähler, Abriss-Zähler und Kopf-Fakt zählen dieselbe Menge (I12) | Belege |
| 4 | Durchgänge | 6 | Buchungsläufe; der letzte Übergabebericht oben | Durchgänge + Bericht aus der Übersicht |
| 5 | Verlauf | 6 | `LogBrowser` mit Tiefen über `Segmented` (Z6) | Log (heißt künftig „Verlauf", §5.2) |
| 6 | Technik | 7 | DATEV-Seite (Stapel, Vorgang, Festschreibung, Prüfung, zuletzt gesehen, Sendenachweis → Export-Historie) · Personenkonten des Mandantenstapels (Konto · Was fehlt · Sätze; der Mangel selbst steht in Zone 2 mit Weg in die Konten) · „Entstanden in diesem Stapel" (Sachverhalte, Klärungen, Notizen, Regeln, Prüf-Quittungen) · Experiment (nur bei Experiment-Mandanten) · Rohdaten zuletzt, eingeklappt | DATEV · Artefakte · Experiment |

Kein Reiter „Details": alle Felder des Stapels passen in Zone 3.
„Artefakte" ist ein Systemwort (T4). Die Menge heißt nach der Anzeige-Regel des
Entitätsprofils „entstanden in" und steht in der Technik; der Dialog von
„Zurücksetzen" verlinkt dorthin, weil genau diese Menge entfernt wird.

## Übersicht — die fünf Zonen

| Zone | Inhalt | Deckung |
|---|---|---|
| 1 Kopf | siehe Slots | — |
| 2 Mängel | Soll ≠ Haben (danger, Weg: Buchungen) · Personenkonten ohne Namen (Mandantenstapel, warning, Weg: Konten) · offene Klärungen der Kanzlei (warning, Weg: Abnahme Schritt 2). **Keine** Zeile für Nachforderungen beim Mandanten: Warten auf eine andere Partei steht nirgends als Satz (§2.3, D22). Leer: „Nichts offen — Soll und Haben gehen mit 12.345,67 € auf, keine Klärung wartet auf die Kanzlei." Der Satz wiederholt keine Zahl aus den Kopf-Fakten (D24) | Klärungen p50 9,5 |
| 3 Fakten | nur, was der Kopf nicht trägt (D24): Ablageort in DUO (oder „wird beim Push festgelegt") · angelegt von / am (ohne `created_by`: „vom Server") · zuletzt bewegt. Stapelnummer, Bezeichnung, Zeitraum und Art stehen in Overline, Titel und Meta-Zeile und nicht noch einmal hier; beim regulären Zyklus, dessen Art die Meta-Zeile nicht nennt, steht „Art: Buchungszyklus" | 100 % bis auf `created_by` 57 % |
| 4 Abrisse | Buchungen (fünf Zeilen, „alle n →") · Belege (fünf Zeilen, „alle n →") | Buchungssätze p50 44,5 (`percentile_disc` 43) · Belege je Stapel **nicht gemessen** — das Entitätsprofil führt keine Relation Beleg → Stapel (Belege tragen keinen Stempel); gezählt werden müssen die Belege über den Ereignis-Stempel (Ereignisse 411 an 6 von 14 Stapeln). Bis zur Messung steht der Abriss vorläufig; liegt p50 unter 2, wird er eine Zeile in Zone 3 (§2.4) |
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
| D22 „kein Signal, wenn der Datensatz auf jemand anderen wartet" | in `prepared` mit offenen Nachforderungen (Staffelstab „Mandant (wartet)") steht trotzdem das Signal „Prüfung übernehmen" | Die Kanzlei kann die Prüfung jederzeit übernehmen (Registry `prepared`), und ohne das Signal fehlte ihr der einzige nächste Schritt. Eingetragen bei der fremden Prüfung 2026-09-27; Owner-Bestätigung offen |
| §2.4 / D15 „p50 ≤ 1 → Zeile in Zone 3" | die Zahl der Durchgänge (p50 1,5, zwischen den Stufen) steht als Kopf-Fakt „Durchgänge", nicht als Zeile in Zone 3; der Weg ist der Reiter mit Zähler | Die vier Zähler des Stapels stehen zusammen in der Faktenzeile; dieselbe Zahl in Zone 3 wäre sie zweimal auf dem ersten Bildschirm (D24). Eingetragen bei der fremden Prüfung 2026-09-27; Owner-Bestätigung offen |

**Nachtrag 2026-09-27 (L-349, entschieden von ll-cto nach `app/docs/topics/datev.md`, gebaut in F304 `a16f89bd`):** Staffelstab und Signal sagen in jedem Zustand dasselbe — ein Hauptknopf steht genau dann, wenn die Kanzlei dran ist. `ready` hängt am Übergabeweg (`platform_clients.datev_export_method`).

## Prüfung

Fremde Prüfung gegen §10 und §9 des Standards, das Entitätsprofil
`export-batch.md` und die gebaute App (`origin/staging` `41681e93`, F302 und
F303 umgesetzt). Nicht im Browser gemessen: D1 (Rang 1–4 ohne Scrollen) und
die Breite bei 1280 px bleiben für die Abnahme.

| Stelle | Einwand | Ergebnis | geprüft von / am |
|---|---|---|---|
| Kopftabelle „Route", „Heute gebaut in" | Stand `1947c8d2` mit acht Reitern, `ResetBatchButton`, `ReturnToAgentButton` — alles seit F302/F303 ersetzt | geändert auf `41681e93` mit den heutigen Funktionen und Zeilen | fremder Prüf-Agent, 2026-09-27 |
| §9 Pflichtteile | Layout D-L1 mit Frage 3 aus §1.2 begründet · Reiter mit Rang, beginnend mit Übersicht, endend mit Technik (D19) · Zonen 4/5 mit p50 · Abweichungen je eine Zeile — vollständig; kein „Details" ist keine Abweichung (§5.2: nur, sobald es mehr Felder als Zone 3 gibt) | bestätigt | fremder Prüf-Agent, 2026-09-27 |
| Aktionen je Zustand ↔ `batchActions()` | alle elf Zustände Zeile für Zeile verglichen: Signal = `primary`, Kopf = `secondary` + `tertiary`, Menü = `batchMenuEntries()` (`agent` → Verwerfen; `prepared`/`review` → Zurückgeben · Zurücksetzen · Verwerfen; sonst keins) — deckungsgleich. Aber `exported` ist kein Zustand (CHECK und Registry kennen ihn nicht; „exportiert" ist das Label von `confirmed`) | geändert: Zeile heißt `exporting`, `inspection` | fremder Prüf-Agent, 2026-09-27 |
| Aktionen je Zustand ↔ D8 | höchstens zwei sichtbar (am meisten in `failed`: Protokoll ansehen · Freigabe zurücknehmen), der nächste Schritt nur im Signal, Zerstörendes nur im Menü mit `danger` und Dialog; App baut es so (`Aktionen`, `BatchActionsMenu`, Dialoge neben dem Menü) | bestätigt | fremder Prüf-Agent, 2026-09-27 |
| Abweichung 1 (Menü mit einem Eintrag in `agent`) | Satz vorhanden, §4.1 vor §11.2 schlüssig; App folgt (`menu.length > 0`) | bestätigt | fremder Prüf-Agent, 2026-09-27 |
| Aktionen `prepared` ↔ D22 | Signal trotz Staffelstab „Mandant (wartet)" ist ein Bruch von D22, im Profil begründet, aber ohne Zeile unter „Abweichung" | geändert: Abweichung 2 eingetragen, Owner-Bestätigung offen | fremder Prüf-Agent, 2026-09-27 |
| Aktionen `ready`, `confirmed`, `mirrored` ↔ D7/D22 | Der Staffelstab (`batchOwner()`) nennt Bridge, DATEV bzw. Spiegel, das Signal zugleich eine Handlung der Kanzlei (Zur Übergabe, Zur Nachlese); die Registry sagt bei `ready` „die Bridge holt den Stapel beim nächsten Poll". Zwei Antworten auf „wer ist dran" — entweder `batchOwner()` oder `batchActions()` ist in diesen Zuständen falsch | Befund App | fremder Prüf-Agent, 2026-09-27 |
| Signal `failed` | Ohne `datevError` baut die App das Signal mit `tone="neutral"`; ein abgelehnter Stapel ist die Stufe Fehler (A7, Registry `failed` = `danger`) | geändert (Profil: „`failed` immer `danger`"); Befund App | fremder Prüf-Agent, 2026-09-27 |
| Signal `prepared`, Nebensatz | Die App setzt den `info`-Satz („Bis zur Übernahme landen nachgereichte Belege …") als zweite Zeile ins Signal (T302.6). Das ist Zustandslogik und gehört laut Profil-Slot „Signal" und §3.2 hinter das (i) | Befund App | fremder Prüf-Agent, 2026-09-27 |
| Staffelstab im Kopf | Die App rechnet `batchOwner(state, counts.clarificationsOpen)` — alle offenen Klärungen, auch die der Kanzlei — statt der offenen Nachforderungen (`openDocumentRequests`, wie Liste und `OpenBatchCard`). Derselbe `prepared`-Stapel heißt in der Liste „bereit", im Detail „Mandant (wartet)"; ebenso `staffelSegmenteFuer` für die `BatonBar` | Befund App | fremder Prüf-Agent, 2026-09-27 |
| Reiter ↔ Fragerang, MECE | Übersicht 1–6 · Buchungen 5 · Belege 5 · Durchgänge 6 · Verlauf 6 · Technik 7 — aufsteigend, Verlauf vorletzt, Technik zuletzt (D19); jede Sicht eine andere Entität oder Form, keine Grundgesamtheit-Filter; Übergabebericht nur noch in Durchgänge. Lücke: die Personenkonten-Tabelle, die F303 in die Technik legt, stand in keinem Reiter des Profils | geändert: Reiter bestätigt, Technik um die Personenkonten ergänzt | fremder Prüf-Agent, 2026-09-27 |
| Reiter Belege | Das Profil sagte „Belege im Zeitraum"; die App zeigt die Belege, die der Stapel über den Ereignis-Stempel bearbeitet hat, und sagt ausdrücklich, dass der Zeitraum nicht das Kriterium ist — das folgt der Anzeige-Regel „Stempel = Herkunft" | geändert auf die Stempel-Menge | fremder Prüf-Agent, 2026-09-27 |
| Belege-Zähler (I12) | Auf einer Seite drei Belegmengen: Kopf-Fakt `docsCompleted / docsInPeriod` (Zeitraum), Abriss-Kopf `belege.total` (Stempel), Abriss-Fuß „alle `docsInPeriod` →" und Reiterzähler `docsInPeriod` (Zeitraum) über einer Liste der Stempel-Menge | Befund App | fremder Prüf-Agent, 2026-09-27 |
| Zone 4 Deckung | Buchungen p50 44,5 (disc 43) aus dem Entitätsprofil ✓. Belege: „nicht gemessen", und das Entitätsprofil führt keine Relation — D15 ist für diesen Abriss nicht belegt. Von 14 Stapeln tragen nur 6 Stempel, der p50 kann unter 2 liegen | geändert: Abriss vorläufig, Messung nachholen, Regel für den Fall p50 < 2 genannt | fremder Prüf-Agent, 2026-09-27 |
| Zone 4 Durchgänge | p50 1,5 fällt zwischen die Stufen von §2.4; kein Abriss ist richtig, aber die Zahl steht als Kopf-Fakt statt als Zeile in Zone 3 — ohne Satz | geändert: Abweichung 3 eingetragen, Owner-Bestätigung offen | fremder Prüf-Agent, 2026-09-27 |
| Zone 5 Deckung | Audit p50 3, max 23, Quelle Audit-Log mit `BatonBar`; App baut die letzten fünf der Sicht „Verlauf" mit „ganzer Verlauf →" | bestätigt | fremder Prüf-Agent, 2026-09-27 |
| Zone 2 Nachforderungen | „offene Nachforderungen mit Frist (info)" als Mängelzeile widerspricht §2.3 (Warten auf eine andere Partei: nirgends als Satz) und D22; der Staffelstab trägt es schon. Die App baut die Zeile („n Nachforderungen beim Mandanten offen", `neutral`, zählt dazu die Mandanten-Klärungen) | geändert; Befund App | fremder Prüf-Agent, 2026-09-27 |
| Rang 4 DATEV-Fehler | Rang 4 nannte den DATEV-Fehler in Zone 2, der Slot „Signal" ebenfalls — dieselbe Sache an zwei Orten (§2.3) | geändert: nur im Signal | fremder Prüf-Agent, 2026-09-27 |
| Zone 2 Leersatz | „Nichts offen — 46 Buchungen, 0 Klärungen offen." wiederholt die Kopf-Fakten (D24) und ist falsch, sobald Klärungen des Mandanten offen sind | geändert: Satz mit der Summe, die sonst nirgends steht; Befund App (gebaut mit dem alten Satz) | fremder Prüf-Agent, 2026-09-27 |
| Zone 3 Fakten ↔ D24 | Bezeichnung, Stapelnummer, Zeitraum und Art stehen schon in Titel, Overline und Meta-Zeile — dieselbe Angabe zweimal auf dem ersten Bildschirm (D7, D24); D4 „Rang 1–6" ist durch den Kopf erfüllt | geändert; Befund App (baut alle vier noch einmal) | fremder Prüf-Agent, 2026-09-27 |
| Kopf ↔ D3, D6, D7 | Pager „Stapel", `EntityHeader` mit Overline, Titel, `StatusBadge` mit (i), Meta, Prozessbild mit Staffelstab, kein zweiter Baton (L-346), vier Fakten — App baut es so | bestätigt | fremder Prüf-Agent, 2026-09-27 |
| Technik ↔ D12, D19 | Profil verlangt „Rohdaten zuletzt, eingeklappt"; die App zeigt nur den Rohdaten-Drawer des DATEV-Stapels (`?raw=`), keine Rohzeile des Stapels selbst (`RawRecord`) — F303 hat das als Nicht-Scope gesetzt | Befund App | fremder Prüf-Agent, 2026-09-27 |
| Verlauf ↔ D26 | ein Reiter, drei Tiefen über `Segmented`, Fehlerfilter, `BatonBar`; `protokoll` und `logHref` zeigen auf `?tab=timeline`, alte Schlüssel über die Alias-Schicht | bestätigt | fremder Prüf-Agent, 2026-09-27 |
