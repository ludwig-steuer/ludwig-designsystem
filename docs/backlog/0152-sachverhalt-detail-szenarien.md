# 0152 · Die Sachverhaltsseite als Szenarien

| | |
|---|---|
| Status | **Spec** — geschrieben 2026-09-10, Bau in drei Wellen |
| Stufe | `src/showcase/sachverhalt/` (Seiten-Stories) · dazu Erweiterungen an `entities/accounting-case/CaseTimeline.tsx` |
| Klassen-Test | Die Seite gehört der App und lebt in `showcase/` — wie 0144 für den Beleg. Was an Bausteinen fehlt, wird `entities/` bzw. `patterns/`, nicht Teil der Seite |
| Quelle | Design-Brief **F196** (`ludwig/app` staging `672665f8`), überbracht von `ludwig-cto` · Seitenprofil `docs/seiten/sachverhalt-detail.md` · Entitätsprofil `docs/entitaeten/accounting-case.md` |
| Setzt voraus | **0154** (die vier Spaltenmuster) — gebaut · **0127**/`DetailView` — gebaut |
| Präzedenz | `src/showcase/beleg/` (0144) |
| Spec von / am | Claude, 2026-09-10 |

## Ziel

Die komplette Sachverhaltsseite als Seiten-Stories, aus vorhandenen
v3-Bausteinen, mit synthetischen Fixtures — **21 Szenarien** in drei
Story-Dateien. Dort wird das Beispiel zu Ende entwickelt und vom Owner
abgenommen; danach löst die App `SachverhaltScreen.tsx` (1815 Zeilen) samt
acht Reitern dagegen ab.

## Der Rahmen: `DetailView` + `Columns`, nicht `CaseDetailView`

Der Brief nennt `CaseDetailView` als Rahmen. Seit heute gibt es den
gemeinsamen: **`DetailView`** (0127/0138 Weg 1) trägt die Zeilen — Pager ·
Kopf · Signal · Reiter · Körper —, und der Körper trägt das Spaltenmuster
**`Columns`** (0154). Genau die Ordnung, die §5a des Briefs verlangt.

`CaseDetailView` bleibt unangetastet stehen, bis der Owner die Migration der
drei alten Rahmen freigibt. Die Szenarien hier bauen auf dem neuen — sonst
zeigte die Vorschau eine Struktur, die es beim Bauen nicht mehr gibt.

## Was an den Bausteinen fehlt

Gemessen am Brief, nicht geraten. Drei Lücken, alle in `CaseTimeline` (0040):

| Fehlt | Warum der Brief es braucht | Vorschlag |
|---|---|---|
| **Die Jetzt-Zeile** | §5: der Anker zwischen Vergangenheit und Zukunft, und **selbst ein wählbarer Eintrag** — ohne `?event=` ist „Jetzt" gewählt | Ein Eintrag der Art `now`, den die Timeline aus `today` selbst setzt; `selectedId={null}` heißt „Jetzt" |
| **Buchungen als Einträge** | §5: die Timeline trägt Belege, Zahlungen **und Buchungen** | Heute trägt sie Ereignisse; eine Buchung hängt am Ereignis. Zu klären: eigener Eintrag oder zweite Zeile am Ereignis |
| **DATEV-Spiegel-Einträge** | §5/§7 (E1b): gleichrangig eingereiht, mit dem Wort „DATEV" als Quelle, in Spalte 2 lesend | Ein `source`-Feld am Eintrag; das Wort steht in der Zeile, nicht als Icon allein (V7) |

Diese drei sind **Bau an der Entität**, nicht an der Seite — sie gehören in
`CaseTimeline` und werden mit Welle 1 gebaut.

## Zuschnitt: drei Wellen

21 Szenarien sind keine Aufgabe, sondern drei. Der Schnitt folgt dem, was
sich gegenseitig bedingt:

| Welle | Inhalt | Warum zuerst |
|---|---|---|
| **1 · Der Rahmen und der Referenzfall** | `SachverhaltSeite` (Rahmen), `fixtures.ts`, die drei `CaseTimeline`-Erweiterungen, **E1** `VorschlagSteht` und **E1b** `MitDatevBuchung` | E1 ist der Fall, an dem sich das Layout entscheidet: drei Spalten, Jetzt ↔ Eintrag, Rang 1–4 über der Falz. Was hier nicht trägt, trägt in keinem der anderen 19 |
| **2 · Die übrigen Einzelfälle** | E2–E9 samt Varianten (10 Exporte) | Sie variieren denselben Rahmen — Zustände, Leerfälle, Eskalation |
| **3 · Sammel, Dauer und die Seite** | S1–S5, P1–P4 | Die Extremfälle (120 Ereignisse, 12 Klärungen) und die Seitenzustände; sie prüfen, was die ersten beiden Wellen gebaut haben |

**Abgenommen wird je Welle**, nicht am Ende — 21 Szenarien auf einmal
abzunehmen hieße, den ersten Fehler 21 mal zu bauen.

## Die Übersicht in drei Spalten

`Columns pattern="list-detail-aside"`:

| Spalte | Inhalt | Baustein |
|---|---|---|
| 1 · Timeline | alle Einträge des Falls samt Jetzt-Zeile, Fuß „vergrößern →" | `CaseTimeline` (erweitert) |
| 2 · Hauptfläche bei „Jetzt" | **Offen** (Mängel mit Weg, Kritikalität absteigend) · **Fehlende Freigaben** · **Log** (letzte fünf) | die Mängel-Zone von 0150, hier zum zweiten Mal → **0153** wird fällig |
| 2 · Hauptfläche bei Eintrag | das Ereignis: Beleg · Zahlung · Buchung als Journal-Sicht, mit `AiBookingNotes` | `JournalEntryGrid`, `AiBookingNotes` (0151) |
| 3 · Notizen | Zusammenfassung, Kommentar-Historie, Rückfragen **lesend** | `ClarificationList`, `Timeline` |

**Die Mängel-Zone erscheint hier zum zweiten Mal.** Das ist der Auslöser aus
0153: was beim Beleg `SourceDocumentDefects` heißt, ist hier dieselbe Zone mit
anderen Zeilen. Sie wird mit Welle 1 zum Pattern gehoben, nicht kopiert.

## Offene Fragen

1. **Ist die Buchung ein eigener Timeline-Eintrag oder eine zweite Zeile am
   Ereignis?** Der Brief sagt „alle Einträge", das Modell hängt die Buchung
   ans Ereignis. *Ohne Antwort:* zweite Zeile am Ereignis — ein Ereignis mit
   seiner Buchung ist **ein** Vorgang, und zwei Zeilen dafür wären zwei
   Behauptungen über dasselbe.
2. **Fällt Spalte 3 nach unten oder klappt Spalte 1 ein?** `ludwig-cto` hat
   „Spalte 3 nach unten" vorgeschlagen, der Owner hat es noch nicht
   bestätigt. *Ohne Antwort:* nach unten — so ist `Columns` gebaut und
   gemessen.
3. **O1 „Verbundene Belege" als Reiter?** *Default aus dem Brief:* nein.

## Abnahmekriterien

Fest (gilt immer): typecheck · build · Code englisch · `@when`/`@instead` ·
keine Hex/px · Status nur über Registry · Prüfliste §9 · im Browser angesehen.

Variabel (je Welle):

- [ ] **W1** Rang 1–4 stehen bei 1440 × 900 ohne Scrollen (gemessen)
- [ ] **W1** Der Wechsel Jetzt ↔ Eintrag ändert **nur** Spalte 2
- [ ] **W1** Ludwig- und DATEV-Einträge stehen in **einer** Reihe; der
      DATEV-Eintrag trägt das Wort „DATEV" und hat in Spalte 2 **keine**
      Handlungen
- [ ] **W1** Die Mängel-Zone ist ein Pattern (0153), keine zweite Kopie
- [ ] **W2** Jeder Leerfall trägt einen Satz mit Grund, keinen Strich
- [ ] **W2** Genau ein Signal oder keins; es entfällt, wenn der Fall auf
      jemand anderen wartet (E4, E5-Variante)
- [ ] **W3** 120 Ereignisse brechen das Layout nicht (Pagination in Spalte 1)
- [ ] **W3** Kein Gegenpart bei `adjustment_only` ist **kein Mangel** —
      NULL heißt dort „hat bewusst keins"

## Abnahme

| Welle | Nachweis | Ergebnis |
|---|---|---|
| | | |
