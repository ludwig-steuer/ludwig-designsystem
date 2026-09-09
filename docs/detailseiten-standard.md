# Detailseiten — der Standard für jede Entitäts-Detailseite

| | |
|---|---|
| Status | Entscheid des Owners, 2026-09-08 |
| Gilt für | jede Detailseite **einer** Entität im produktiven Register: Sachverhalt, Beleg, Konto, Partner, Bankkonto, Mandant, Wiederkehr-Regel … |
| Gilt nicht für | Listen- und Katalogseiten · Arbeitsflächen mit Schritt-Rail (Stapelabnahme, Onboarding — L2) · das lesende Register (§1 der Designsprache) |
| Verhältnis | `docs/design-guidelines.md` ist die Designsprache und **führt bei Widerspruch**; dieser Standard wendet sie auf eine Seitengattung an. Die Kurzfassung steht als **D-Block** in `docs/web-ui-regeln.md` — bei Widerspruch zwischen beiden gilt diese Datei, sie ist die Langform mit Herleitung. |
| Abweichung | nur mit einem Satz Begründung im Seitenprofil (§9) |
| Verfasst von / am | Claude, 2026-09-08, im Auftrag des Owners |
| Verallgemeinert aus | Seitenprofile `seiten/beleg-detail.md`, `seiten/sachverhalt-detail.md`, `seiten/konto-detail.md` · gebaute Rahmen `CaseDetailView` (0050), `SourceDocumentView` (0071), `LedgerAccountView` (0063) · Bausteine 0047 `RecordPager`, 0048 `EntityHeader`, 0049 `StatusCallout`, 0051 `RawRecord`, 0120, 0124 `Sparkline`, 0126 `KpiTile href` · Entitätsprofile (die Zahlen in §2.4 und §11.3) · Regeln A7, L2, L3, L6, V5, V7, V9, V14, T4, T6, Z3, Z5, Z6, Z7, I1, I2, I10, I11, I12, R9, R15, R21 |

## 0 Wozu, und was hier nicht steht

Alle Entitäts-Detailseiten haben denselben Aufbau, damit eine Sachbearbeiterin,
die eine Seite bedienen kann, alle bedienen kann — auch nach vier Wochen Pause
(V14). Was eine Seite **zeigt**, entscheidet weiter ihr Seitenprofil; **wie**
sie es anordnet, entscheidet dieser Standard.

Er ist aus dem Bestand abgeleitet, nicht erfunden: §12 nennt je Regel die
Stelle, an der sie schon stand. Drei Profile und drei gebaute Rahmen sagten
dieselben Dinge in drei Formulierungen; hier stehen sie einmal.

**Er regelt nicht, welche Fragen eine Seite beantwortet.** Das ist der
Fragerang des Seitenprofils (Schritt 0b in `docs/backlog/README.md`), und der
Standard verweist immer dorthin — „Rang 1–4 des Profils", nie mit einer
eigenen Kopie des Job-Satzes. Ein Job, der an zwei Orten wörtlich steht, ist
eine zweite Wahrheit. Sobald das Job-Register (`docs/jobs.md`) steht, treten
seine Kennungen an die Stelle dieser Verweise.

**Er entscheidet auch nicht gegen Zahlen.** Wo eine Regel dieses Standards an
einer Entität mit den erhobenen Zahlen ihres Entitätsprofils kollidiert, gilt
die Zahl und die Seite bekommt eine Abweichung (§9). Die drei Stellen, an
denen das heute schon der Fall ist, stehen mit ihren Zahlen in §11.3.

**Die Regeln heißen D1–D16.** Die Tabelle Regel · Verstoß · Baustein steht in
§8 und noch einmal als D-Block in `docs/web-ui-regeln.md`; §1–§7 tragen die
Begründung.

---

## 1 Der Rahmen und die drei Layouts (D3, D5)

### 1.1 Fünf Slots, immer in dieser Reihenfolge

Alle drei gebauten Rahmen haben denselben Aufbau; sie nennen ihn nur
verschieden. Die verbindlichen Namen sind:

| # | Slot | Pflicht | Was | Baustein |
|---|---|---|---|---|
| 1 | **Pager** | wenn eine Liste dahinterliegt | woher die Leserin kam, wo der nächste Datensatz ist, „3 von 117"; `back` **nennt** die Liste (nie „Zurück", V14) | `RecordPager` (0047) |
| 2 | **Kopf** | immer | §3 | `EntityHeader` (0048) |
| 3 | **Signal** | wenn es etwas zu melden gibt, das den ganzen Datensatz betrifft | die eine Meldung über allem: „wird eingeordnet", „Einordnung fehlgeschlagen"; hier steht auch der nächste Schritt (§4.1) und, bis der Kopf einen Platz dafür hat, das Prozessbild (Z7) | `StatusCallout` (0049) · `Banner` |
| 4 | **Reiter** | ab zwei Sichten | §5 | `Tabs` |
| 5 | **Körper** | immer | der aktive Reiter; im ersten die fünf Zonen (§2) | je Layout |

Der dritte Slot heißt seit **0138** in allen Rahmen, die einen haben,
`signal` — bis dahin `nextAction` (0050) und `banner` (0071). Die Kontoseite
(0063) hat **keinen**: ihr `summary` ist der Saldo (Rang 2) und `chart` die
Einordnung (Rang 3), beide Inhalt und kein Signal. Ob sie eins braucht, ist
eine Frage an ihr Seitenprofil, nicht an den Rahmen.

**Verbindlich sind die Namen oben.** Ob aus den drei Rahmen einer wird,
entscheidet **0127** mit einem vierten Fall in der Hand — bis dahin nimmt
jeder neue Detailrahmen diese Namen und begründet jeden zusätzlichen Slot in
seiner Spec.

**Ein Slot ohne Inhalt fällt weg — mit seinem Abstand.** So ist es in allen
drei Rahmen gebaut, und der Grund ist derselbe: eine leere Zeile sieht aus, als
fehle dort etwas.

**Ein Slot mit Inhalt bleibt** — auch mit einem einzigen Eintrag. Eine Seite,
die ihre Form nach der Datenmenge ändert, ist zwei Seiten und muss zweimal
gelernt werden (V14).

### 1.2 Drei Layouts

Der Rahmen ist immer gleich. Für den **Körper des ersten Reiters** gibt es drei
Formen — eine Vorgabe und zwei benannte Varianten. Eine vierte gibt es nicht;
eine Seite, auf die keine passt, ist eine Abweichung nach §9.

| | Layout | Körper | Wann | Gebaut als |
|---|---|---|---|---|
| **D-L1** | **Zonen untereinander** *(Vorgabe)* | die fünf Zonen aus §2, gestapelt, volle Breite | immer, solange keine Variante greift | `SourceDocumentView` (0071) ohne Randspalte; `LedgerAccountView` (0063) mit leerem `aside` |
| **D-L2** | **Gegenüberstellung** | Zone 3 und 4 nebeneinander: die Quelle links und groß, das Abgeleitete rechts | die Aufgabe ist ein **Abgleich gegen eine Quelle** — Original gegen Extraktion, DATEV gegen Ludwig | `SourceDocumentCard`: Vorschau links, Fakten rechts (`MasterDetail`) |
| **D-L3** | **Randspalte** | **eine** der Zonen 3 oder 5 wandert in eine schmale Spalte neben der Arbeitsfläche; die Reihenfolge der übrigen bleibt | es gibt eine **Arbeitsfläche** (eine Liste mit Rang ≤ 4) **und** etwas, das daneben mitgelesen wird: der Strang (Sachverhalt) oder die Fakten (Konto) | `CaseDetailView` (0050): `aside` = `CaseTimeline`, `minDetail={460}` · `LedgerAccountView` (0063): `aside` = `AccountFacts`, `minDetail={960}` |

**Welches Layout — erste zutreffende Frage gewinnt:**

1. Ist die Aufgabe ein **Abgleich gegen eine Quelle**, die auf dem Bildschirm mitlaufen muss? → **D-L2**.
2. Gibt es eine **Arbeitsfläche** (eine Liste, die das Profil bei Rang ≤ 4 führt) und daneben etwas, das mitgelesen wird? → **D-L3**, und das Profil nennt, welche Zone in der Spalte steht — der Strang nur, wenn seine Zahl es trägt (§2.4).
3. Sonst → **D-L1**.

Die Randspalte ist in D-L2 und D-L3 dieselbe Mechanik (`MasterDetail`), aber
nicht dieselbe Breite: was **neben** der Fläche steht, muss lesbar bleiben, und
was **auf** ihr steht, muss vollständig bleiben. Die gemessenen Werte stehen im
Kommentar der beiden Rahmen (460 px neben Fakten, 960 px neben einer
siebenspaltigen Tabelle). Sie sind Messergebnisse, keine Geschmacksfragen, und
werden nicht ohne neue Messung geändert.

## 2 Die erste Ansicht: fünf Zonen (D1, D2, D4)

### 2.1 Sie ist Überblick — und sie schreibt nicht

Wer eine Detailseite öffnet, hat eine Frage mitgebracht, keine Absicht zu
tippen. Die erste Ansicht beantwortet **Rang 1–4 des Seitenprofils ohne
Scrollen und ohne Klick**; alle drei Profile schneiden genau dort, und alle
drei Rahmen halten den Platz frei, indem sie um die oberen Slots keine eigene
Höhe und keinen Scroll-Container legen.

**Die Übersicht schreibt nicht.** Es gibt genau zwei Schreibwege von hier aus:
die **Aktionen oben rechts** (§4.1) und den **Weg hinaus aus einer Mängelzeile**
(§2.3). Alles andere — das Ändern einzelner Werte — steht im Reiter „Details"
(§4.2). Der Grund ist nicht Prinzipienreiterei: eine Fläche, auf der jedes
Feld ein Eingabefeld sein könnte, liest sich langsamer, und die Frage „bin ich
hier im Lesen oder im Ändern" darf auf einer Seite nicht offenbleiben.

### 2.2 Die fünf Zonen, in dieser Reihenfolge

| # | Zone | Was | Baustein |
|---|---|---|---|
| 1 | **Kopf** | Kennung + Name, **ein** führender Zustand mit (i), Prozessbild bei Ketten (Z7), Meta-Zeile, Aktionen oben rechts + `OverflowMenu` | `EntityHeader` (0048) — §3 |
| 2 | **Mängel** | je Problem eine Zeile, Kritikalität absteigend (A7), **jede mit einem Weg hinaus**. Leer = Haken + Satz mit Zahl (L6) | `StatusCallout` je Zeile · `EmptyState` |
| 3 | **Fakten** | die Felder von **Rang 1–6 des Entitätsprofils**, lesend. Herkunft und Konfidenz stehen nur **bei einem Wert**, nie als leere Zeile (das Prinzip aus 0120) | `FieldList` |
| 4 | **Abrisse** | je Reiter eine Karte: Kopf = Reitername, 3–5 Zeilen Auszug, Zähler, „alle n →". Reihenfolge = Reiterreihenfolge, MECE. Diagramme **nur hier** (§7.3). Verknüpftes öffnet als Drawer (§6) | `Card` + `DataTable` mit **demselben Spaltensatz** wie der Reiter — §7.2 |
| 5 | **Verlauf** | die letzten fünf Einträge des Objekt-Strangs (Sicht „Verlauf", Z6) mit Staffelstab, „ganzer Verlauf →". Die Zone nennt ihre **Quelle**: das Audit-Log oder der fachliche Strang der Entität | `LogList` · `CaseTimeline` · `BatonBar` |

In **D-L3** steht eine dieser Zonen — 3 oder 5, nie beide — in der Randspalte;
alle übrigen bleiben in ihrer Reihenfolge untereinander.

Die Reihenfolge ist fest. Was in keiner Zone Platz hat, hat auf der Übersicht
nichts verloren — es steht in seinem Reiter.

### 2.3 Zone 2 im Einzelnen: Mängel

Der häufigste Fehler heutiger Seiten ist nicht ein falscher Wert, sondern ein
**unsichtbarer**: ein fehlender Pflichtwert sieht aus wie ein leeres Feld, und
ein Mangel, der in einem Reiter liegt, existiert für die Leserin nicht. Die
Skala A7 entscheidet über den Ton, die **Reichweite** über den Ort:

| Was | Wo | Ton (A7) |
|---|---|---|
| betrifft den ganzen Datensatz, jemand muss handeln, bevor es weitergeht | Zone 2, oben | `danger` |
| betrifft den ganzen Datensatz, quittierbar | Zone 2, darunter | `warning` |
| informiert nur („wird eingeordnet — die Seite aktualisiert sich selbst") | **Signal**-Slot über den Reitern, nicht Zone 2 | `info` |
| hängt an einem einzelnen Wert | Zone 3 **an der Stelle des Werts**, als Mangel statt als Leerzeile | `warning` |
| liegt in einem Reiter | am Reiter als Zähler mit `alarm` | — |
| ohne Kritikalität, Technik | gar nicht auf der Übersicht → Reiter „Rohdaten" | `neutral` |

Drei Sätze, die in der Praxis den Unterschied machen:

- **Jede Mängelzeile hat einen Weg hinaus** — einen Editor, einen Reiter oder
  eine Aktion. Ein Mangel ohne Ausweg ist ein Vorwurf.
- **Dieselbe Sache steht an einem Ort.** Ein Mangel in Zone 2 **und** an seinem
  Wert ist zweimal dieselbe Nachricht; der zweiten glaubt niemand mehr.
- **Leer heißt nicht weg.** Keine Mängel → Haken und ein Satz mit Zahl („Alle
  12 Pflichtangaben stehen.", L6), nicht eine verschwundene Zone.

Die Form für einen Mangel **am Wert** gibt es heute nur an einer Entität
(`SourceDocumentFacts` mit `missing`, `SourceDocumentGap`); der zweite
Konsument hebt sie ins Set (R21: gehoben wird beim zweiten Konsumenten).

### 2.4 Zone 4 und 5 stehen nur mit Deckung

Eine Karte kostet Kopf, Rand und eine Fußzeile — rund vier Zeilen Rahmen. Sie
lohnt sich, wenn regelmäßig etwas darin steht. Der Maßstab ist die
Kardinalitätsspalte des **Entitätsprofils**, die für jede Relation `p50` und
`p90` führt:

| Deckung der Relation | Form auf der Übersicht |
|---|---|
| `p50 ≥ 2` | **Abriss-Karte** in Zone 4 (3–5 Zeilen, Zähler, „alle n →") |
| `p50 ≤ 1`, aber `p90 ≥ 2` | **eine Zeile in Zone 3** — Zahl mit Weg („Teilbelege 3 →"), keine Karte |
| in der Mehrzahl der Fälle leer (`p90 = 0`) | **gar nichts**, auch keine leere Karte; die Liste lebt in ihrem Reiter |
| kein Strang vorhanden (kein `resource_kind`, keine Kante) | **Zone 5 entfällt**, und das Seitenprofil nennt den Befund, der das erklärt |

Steht in der Randspalte von D-L3 der **Strang**, gilt dieselbe Rechnung eine
Stufe schärfer: eine eigene Spalte lohnt erst, wenn er wie eine Liste gelesen
wird — Richtwert **`p90 ≥ 5`**. (Stehen dort die **Fakten**, entscheidet nicht
ihre Zahl, sondern der Rang der Arbeitsfläche: ein Faktenblock über einer
Liste von Rang 4 drückt die Hauptantwort unter die Falz.) Darunter ist der Strang eine Zone, kein
Zweispalter; das ist derselbe Einwand, den `sachverhalt-detail` als Zweifel 6
selbst notiert. Die gemessenen Zahlen der drei heutigen Entitäten stehen in
§11.3 — bei zweien widersprechen sie dem ersten Anschein.

## 3 Der Kopf (D6, D7)

### 3.1 Was immer drin steht

`EntityHeader` (0048) hat acht Plätze. Drei sind auf einer Detailseite Pflicht,
die übrigen stehen, wenn es sie gibt:

| Platz | Prop | Pflicht | Was |
|---|---|---|---|
| Kennung | `overline` | ja | Entität und Nummer — die Identität, die man am Telefon vorlesen kann |
| Name | `title` | ja | wie der Datensatz im Gespräch heißt (Gegenpart, Kontoname). **Einmal**, ohne Punkt (T3) |
| Führender Zustand | `status` | ja, wenn die Entität eine Achse hat | **eine** `StatusBadge` der führenden Achse mit dem Weg in die Erklärung: Label → Hover → (i) → `StatusInfoDialog` mit allen Ausprägungen und dem DB-Wert (Z3). Ein Konto hat keine Achse und bekommt keine Ersatzmarke |
| Prozessbild | — (Platz fehlt, 0137) | wo eine Kette existiert | `ProcessStepper` (Z7) — Beleg, Sachverhalt, Onboarding, Stapel. Bis der Kopf einen Platz hat, steht es im **Signal**-Slot |
| Symbol | `icon` | nein | kommt vom Aufrufer, **nie** aus einer Statusachse |
| Meta-Zeile | `meta` | nein | was der Titel nicht sagt, inline, mit Punkt getrennt: Datum, Kennungen, der Link zur Elternentität |
| Kennzahl | `metric` | nur wenn es eine Zahl gibt | die eine Zahl, die eine Frage von Rang 1–3 beantwortet |
| Faktenzeile | `facts` | nein | bis zu vier kurze Antworten in einer Zeile (`FieldList layout="row"`) |
| Aktionen | `actions` | nein | §4.1 |

### 3.2 Was nie in den Kopf gehört

- **Ein zweiter Zustand derselben Frage.** Ein Fall, der viermal anzeigt, wer am Zug ist, hat keine Antwort, sondern vier. Die Nebenachsen stehen dort, wo sie gelten — am Ereignis, in den Fakten, im Strang.
- **Eine leere Kennzahl.** Ein Kennzahlblock ohne Zahl kostet die beste Position der Seite für eine Antwort, die es nicht gibt.
- **Dieselbe Angabe zweimal.** Der Gegenpart gehört in den Titel; die Meta-Zeile trägt, was der Titel nicht sagt.
- **Ein Formular oder ein mehrfeldriger Editor** (§4.2).
- **Die Erklärung der Zustandslogik als Fließtext.** Sie steht hinter dem (i) (Z3).
- **Die Liste, aus der die Leserin kam.** Der Pager nennt sie und führt zurück.
- **Eine zweite Entität mit eigenem Kopf** (§6).
- **Ein Zähler ohne Deckung** (§7.2).

## 4 Aktionen und Bearbeiten (D8, D9)

### 4.1 Aktionen stehen oben rechts, immer an derselben Stelle

Alles, was man mit dem Datensatz **tun** kann, steht in `EntityHeader actions`
— oben rechts, auf jeder Entität an derselben Stelle. Sichtbar stehen dort
höchstens **zwei** Knöpfe; ab der dritten Handlung bleiben die häufigen
sichtbar und der Rest wandert in ein `OverflowMenu` mit sichtbarem Wort (nie
ein Kebab, T8).

**Bei genau einer Aktion gibt es kein Menü** — ein Menü mit einem Eintrag ist
ein Klick ohne Zweck. Eine lesende Seite hat gar keine Aktionen; das ist kein
Mangel, sondern das Profil (die Kontoseite bucht nicht).

**Die eine benannte Ausnahme:** der **nächste Schritt**, der sich aus dem
Zustand ergibt (I10, Z5), steht im **Signal**-Slot am `StatusCallout` — genau
ein Knopf. Er gehört zum Zustand, nicht zum Repertoire des Objekts. Solange er
dort steht, steht er **nicht** zusätzlich im Kopf: dieselbe Handlung zweimal
auf einem Bildschirm ist keine Betonung, sondern die Frage, ob es dieselbe ist.

Eine zerstörende Handlung (Storno, Löschen) steht nie als sichtbarer Knopf im
Kopf, auch nicht als einzige — sie liegt im Menü mit `tone="danger"` und
bestätigt in einem Dialog (I2).

### 4.2 Bearbeiten: Wert, Aktion oder Formular

Der Vorschlag des Owners lautete: `InlineEdit` für einzelne **Stammfelder**,
Aktion oben rechts für **Zustandswechsel** und Formulare. Am Gebauten hält der
zweite Teil nicht: `CaseEditor` (0083) ist `InlineEdit` — und zwei seiner drei
Exporte sind **Zustandswechsel** (`CaseDispositionEdit`: wer ist am Zug;
`CaseDocumentNumberModeEdit`: Belegnummern-Modus, begründungspflichtig, mit
`ReasonDialog` daran). Die Trennlinie liegt also nicht zwischen Stammdatum und
Zustand, sondern zwischen **Wert und Handlung**. Drei Fragen, erste Antwort
gewinnt:

| Frage | Antwort | Wo | Baustein |
|---|---|---|---|
| Ändert sich **genau ein Wert**, und steht dieser Wert auf der Seite? | Bearbeiten **am Wert** | im Reiter „Details" (und in dem Reiter, in dem der Wert lebt) — **nicht** in der Übersicht (§2.1) | `InlineEdit` — auch für Zustände, auch mit Grund: der `ReasonDialog` hängt am Wert, nicht am Kopf |
| Ändern sich **mehrere Werte zugleich**, entsteht etwas Neues, oder läuft etwas los? | eine **Aktion** | oben rechts (§4.1) | `Button` / `ActionButton`, `OverflowMenu` |
| Ergeben die Werte nur **zusammen** einen Sinn (sie rechnen gegeneinander, sie gehen auf null auf)? | ein **Formular** | im Detail, im Reiter oder im Drawer der Klasse B — nie im Kopf, nie im Dialog (L2, I8) | `JournalEntryEditor` (R18) |

Der Prüfsatz: *Kann die Leserin auf den Wert zeigen, den sie ändern will?* Wenn
ja, wird dort bearbeitet. Kann sie auf nichts zeigen, weil das Ergebnis erst
entsteht, ist es eine Aktion oder ein Formular.

**Die eine erlaubte Ausnahme zu „die Übersicht schreibt nicht":** rangiert das
Seitenprofil die Korrektur eines Werts bei **Rang ≤ 5**, steht dieser Wert mit
seinem `InlineEdit` in Zone 3, und das Profil sagt in einem Satz, warum (§9).
Der Fall ist real und nicht selten — bei der Belegseite ist genau das die
Hauptaufgabe (§11.3, Nr. 1).

## 5 Reiter (D10, D11, D12)

### 5.1 Reiter sind Sichten, nie Filter — und MECE

Ein Reiter ist eine eigene Ansicht: andere Spalten, eine andere Form, eine
andere Handlung, eine andere Entität (Owner-Entscheid 2026-09-08, als Absatz
unter R9). Zwei Reiter, die dieselbe Tabelle mit derselben Sortierung und
denselben Spalten zeigen und sich nur in der Grundgesamtheit unterscheiden,
sind ein Filter in Reiterkleidung.

**MECE:** jeder Inhalt liegt in **genau einem** Reiter — nicht in zweien, und
keiner liegt in keinem. Zwei Reiter, die dieselbe Frage in zwei Tiefen
beantworten, sind ein Reiter mit einer Klappe darin (Z6: Verlauf · Protokoll ·
Technik sind Tiefen **innerhalb** der Log-Ansicht, keine drei Reiter).

Die **Abrisse** in Zone 4 sind keine Ausnahme von MECE, sondern ihre
Gegenprobe: ein Abriss zeigt dieselben Zeilen mit demselben Spaltensatz wie
sein Reiter, nur gekürzt und mit dem Weg dorthin. Er ist eine Vorschau, keine
zweite Fassung.

**Eine Leiste, ein Mechanismus.** Keine Unterreiter: eine zweite Ebene sagt,
dass der erste Schnitt falsch war. Und keine zwei URL-Muster in derselben
Leiste (`?tab=` neben `?tab=x&view=y`) — was so aussieht wie ein Reiter, muss
sich verhalten wie einer.

**Reihenfolge:** nach dem Fragerang des Seitenprofils; der Reiter, der die
niedrigste Rangzahl beantwortet, steht links.

**Der Satz ist eine Eigenschaft der Entität, nicht des Datensatzes.** Ein
Reiter ohne Inhalt behält seinen Platz und zeigt seinen Leerzustand mit Grund
(V9, T6, L6) — eine Leiste, die je nach Datensatz die Form wechselt, muss jedes
Mal neu gelesen werden. Unterscheiden sich **Ausprägungen** einer Entität
wirklich (eine Rechnung hat Positionen, ein Vertrag nicht), darf der Satz je
Ausprägung anders sein; innerhalb einer Ausprägung nicht.

### 5.2 Der Standard-Satz

**Übersicht · Details · [entitätsspezifisch] · Verlauf · Rohdaten**

| Platz | Reiter | Immer? | Inhalt | Baustein |
|---|---|---|---|---|
| 1 | **Übersicht** | ja | die fünf Zonen (§2). Auf **jeder** Detailseite gleich benannt — nicht der Name der Entität und erst recht nicht der Name der Ausprägung (L-92) | je Layout |
| 2 | **Details** | ja, sobald es mehr Felder als Zone 3 gibt | alle Felder, vollständig, **hier** mit `InlineEdit` — der eine Ort, an dem einzelne Werte geändert werden | `FieldList`, `InlineEdit` |
| 3…n | die fachlichen Sichten | je Entität | was die Entität hat: Positionen, Vorsteuer, Bewegungen, Rückfragen, Saldo & Konten, DATEV-Wahrheit, LLM-Profil … Reihenfolge nach Fragerang | `DataTable` + Spaltensatz |
| vorletzt | **Verlauf** | wo es einen Strang gibt (§2.4) | was mit diesem Datensatz passiert ist: Ereignisse, Zustandswechsel, Jobs, Logs — in **einer** Ansicht mit Tiefen (Z6), nicht in dreien | `LogBrowser`, `Timeline` |
| letzt | **Rohdaten** | **ja** | die Zeile, wie sie in der Datenbank steht, Tabelle für Tabelle | `RawRecord` (0051) |

URL-Schlüssel ist `?tab=<slug>`; der erste Reiter trägt keinen Parameter (I1).

**Eine benannte Ausnahme zum Abriss:** rangiert das Seitenprofil eine Liste bei
**Rang ≤ 4**, ist sie die Arbeitsfläche und steht **vollständig** in der
Übersicht — dann hat sie keinen eigenen Reiter (MECE). Das ist der Fall der
Kontoseite (§11.3, Nr. 2).

### 5.3 „Rohdaten" — immer, immer zuletzt, immer leise

Der letzte Reiter heißt auf jeder Detailseite „Rohdaten", zeigt `RawRecord` und
ist **für alle sichtbar** (§11.1). Er trägt keinen Zähler, keinen Punkt und nie
einen Alarm — er fordert nichts. Optisch steht er auf der Debug-Stufe der Skala
(A7 `neutral`), nicht auf der Stufe der fachlichen Reiter; das kann die
`Tabs`-Primitive heute nicht (Aufgabe 0136).

Er ist zugleich die **einzige Technik-Sicht der Seite** (T4): interne Namen
(`source_doc`, Tabellen- und Spaltennamen, Job-Ids) dürfen hier stehen — und
nur hier. Ein interner Name, der in die Übersicht durchschlägt, ist ein
Verstoß, auch wenn er einen Reiter weiter erlaubt wäre.

## 6 Verknüpfte Entitäten (D13)

Eine Detailseite zeigt **eine** Entität. Alles andere ist ein Verweis:

| Fall | Weg | Warum |
|---|---|---|
| Die Leserin will **nachsehen**, ohne ihre Arbeit zu verlassen | **Drawer** aus dem Katalog über einen eigenen Such-Parameter, `Esc` schließt, die Position bleibt (L3, I1, I2, R15) | Der Kontext bleibt sichtbar; sie kommt zurück, wo sie war |
| Es gibt **keinen** Drawer im Katalog | **Link** auf die Detailseite der anderen Entität | Besser ein ehrlicher Ortswechsel als ein halber Nachbau |
| Die Arbeit **geht dort weiter** — diese Seite ist mit ihrem Job fertig | **Link**, als benannte Aktion oben rechts („Zum Sachverhalt") | Der Drawer ist zum Ansehen da (I2). Wo das Profil den Ortswechsel als Ende des Jobs beschreibt, ist der Link richtig und der Drawer eine Sackgasse mit Fußnote |
| **Nie** | eine eingebettete zweite Detailansicht | Zwei Köpfe auf einer Seite sind zwei Seiten. Erkennbar an einem zweiten `EntityHeader` oder an einem Reiter, der Rang 1–4 einer **anderen** Entität beantwortet |

Ein Klasse-A-Drawer schreibt nicht (R15): sein Fuß ist der Weg in die
Vollansicht. Er nimmt nur Kennung und Öffnungsart — eine Zeile mit zwei Quellen
ist **ein** Drawer mit einer Herkunftsangabe, nicht zwei Drawer.

**In jeder Liste auf der Seite gilt I11 unverändert:** die ganze Zeile führt zu
ihrem Ziel. Führt sie in die Vollansicht **und** gibt es daneben einen Drawer,
bekommt der Drawer ein eigenes Zeichen — `ActionIcon action="peek"` als
`RowAction` rechts. Führt die Zeile ohnehin nur in den Drawer, steht dort
**nichts**: ein Zeichen neben einem Klick, der dasselbe tut, ist Rauschen.

## 7 Formen, Zahlen, Diagramme (D14, D15, D16)

### 7.1 Welche Form für welchen Inhalt

| Inhalt | Form | Baustein |
|---|---|---|
| Mehrere Datensätze derselben Art | **Tabelle in einer Karte** mit Kartenkopf und Spaltenkopf — auch bei drei Zeilen, auch im Leerfall (V5, L6) | `DataTable` |
| Label/Wert-Paare, lesend | **Feldliste**: `bare` innerhalb einer Karte, `layout="row"` in der Faktenzeile des Kopfs, `soft`, um eine zweite Wahrheit abzusetzen (DATEV neben Ludwig) ohne zweite Überschrift | `FieldList` |
| Ein Block mit eigenem Namen oder eigenen Aktionen | **Karte mit Kopf** | `Card` + `CardHead` |
| Ein einzelner Wert, oft gelesen, selten geändert | Feldzeile mit `InlineEdit` — im Reiter „Details" (§4.2) | `InlineEdit` |
| Eine Zahl, die eine Frage von Rang 1–3 beantwortet | **Kennzahl-Kachel** | `KpiTile` / `KpiGrid` |
| Eine Zahlenreihe über die Zeit oder gegeneinander | **Diagramm oder Sparkline** in Zone 4 (§7.3) | `BarChart`, `Sparkline` |
| Die Zeile, wie sie in der Datenbank steht | Reiter „Rohdaten" | `RawRecord` |

Karten stapeln nicht: eine Karte in einer Karte ist ein Rahmen ohne Aussage.
Eine Feldliste **in** einer Karte steht `bare`.

### 7.2 Abriss-Karte und Zähler

Eine Abriss-Karte in Zone 4 zeigt 3–5 Zeilen **mit demselben Spaltensatz wie
ihr Reiter**. Dafür gibt es das gebaute Muster: ein Katalog je Entität,
mehrere benannte Sätze daraus — `sourceDocumentColumns()` (0070),
`caseColumns()` (0096), `bankTransactionColumns()` (0101). Der Abriss wählt
einen Satz aus dem Katalog, er schreibt keine eigenen Spalten. Zwei
Spaltensätze für dieselbe Liste sind zwei Vorstellungen davon, was die Zeile
ist, und die schmalere gewinnt beim nächsten Anfassen.

Der Zähler an der Karte („alle 412 →") und jede Kachel mit `href` fallen unter
**I12**: eine Zahl mit Weg zählt mit **derselben Ableitung**, die die Liste
dahinter anwendet — die Regel steht mit ihrem Fall in `design-guidelines.md`
und wird hier nicht wiederholt. Dazu zwei Anwendungen für diese Seitengattung:
eine Kachel ohne Zahl steht nicht (§3.2), und zwei Kacheln, die dieselbe Größe
aus zwei Quellen zeigen, sind **eine** Kachel mit der Differenz.

### 7.3 Diagramm nur in Zone 4, und erst ab genug Punkten

Ein Diagramm gibt es nur für **Verlauf** (über die Zeit) oder **Vergleich**
(mehrere gegeneinander), nur in Zone 4 — nie im Kopf, nie als Schmuck.

| Werte | Form | Warum |
|---|---|---|
| ≤ 3 | die **Zahl allein**, die Veränderung als Wort daneben („+3 gegenüber Vormonat") | Drei Balken sind kein Verlauf. `Sparkline` rendert unter vier Werten nichts (0124) und lässt dem Aufrufer den Platz |
| 4–12 | **Zahl plus `Sparkline`** — ohne Achsen, mit Textalternative aus denselben Daten | Die Reihe beantwortet „viel oder wenig für dieses Konto", nicht „wie viel genau" |
| ab 4, wenn Werte **abgelesen** werden müssen | **`BarChart`** in einer Karte, mit Bezugslinie, wo es eine gibt | Ablesbarkeit verlangt Achse und Maß |

Höchstens zwei Reihen: die Palette gibt für Diagrammflächen zwei
unterscheidbare Töne her (§3 der Designsprache), getrennt wird mit einer
Haarlinie, nicht mit einer dritten Farbe. V7 gilt auch hier — die
Textalternative sagt dasselbe wie das Bild.

---

## 8 Die sechzehn Regeln

| | Regel | Woran man den Verstoß erkennt | Baustein |
|---|---|---|---|
| **D1 Überblick, nicht Bearbeitung** | Rang 1–4 des Seitenprofils stehen ohne Scrollen und ohne Klick. Die Übersicht **schreibt nicht**: Schreibwege sind die Aktionen oben rechts und der Weg hinaus aus einer Mängelzeile. | Ein Eingabefeld auf dem ersten Bildschirm, das niemand angefordert hat; eine Antwort von Rang ≤ 4, für die man einen Reiter öffnen muss; eine Seite, der man nicht ansieht, ob sie liest oder ändert. | Rahmen ohne eigene Höhe/Scroll um Slot 1–4 (0050, 0071, 0063) |
| **D2 Mängel zuerst, mit Weg hinaus** | Zone 2 zeigt jedes Problem, Kritikalität absteigend (A7), jede Zeile mit einem Weg hinaus. Ganzer Datensatz → Zone 2; ein Wert → an seinem Wert als Mangel statt Leerzeile; im Reiter → Zähler mit `alarm`. Leer = Haken + Satz mit Zahl (L6). Dieselbe Sache nur an einem Ort. | Ein leeres Feld, wo ein Pflichtwert fehlt; ein Mangel, der erst im richtigen Reiter sichtbar wird; eine Mängelzeile ohne Ausweg; zwei Meldungen über dieselbe Sache; Rot für etwas, das keine Stufe „Fehler" ist. | `StatusCallout` (0049) · `Banner` · `Tabs count/alarm` · `SourceDocumentFacts missing` |
| **D3 Ein Rahmen, fünf Slots** | Pager · Kopf · Signal · Reiter · Körper, immer in dieser Reihenfolge. Leerer Slot fällt mit seinem Abstand weg; gefüllter Slot bleibt auch mit einem Eintrag. | Eine Detailseite mit eigener Slot-Reihenfolge; eine leere Zeile, wo ein Slot nichts trägt; ein Layout, das je nach Datenmenge die Spaltenzahl wechselt. | `RecordPager` (0047), `EntityHeader` (0048), `StatusCallout` (0049), `Tabs` |
| **D4 Fünf Zonen in fester Reihenfolge** | Der erste Reiter besteht aus Kopf · Mängel · Fakten · Abrisse · Verlauf. Fakten = Rang 1–6 des Entitätsprofils; Herkunft und Konfidenz nur bei einem Wert (0120). Abrisse in Reiterreihenfolge. | Eine Übersicht mit eigener Gliederung; Fakten unter den Abrissen; ein Block, der in keine Zone gehört und trotzdem oben steht; eine Herkunftszeile ohne Wert. | `EntityHeader`, `StatusCallout`, `FieldList`, `Card`+`DataTable`, `LogList` |
| **D5 Drei Layouts, kein viertes** | D-L1 Zonen untereinander (Vorgabe) · D-L2 Gegenüberstellung, wenn gegen eine Quelle abgeglichen wird · D-L3 Randspalte, wenn es eine Arbeitsfläche (Liste mit Rang ≤ 4) gibt und Zone 3 **oder** 5 daneben mitgelesen wird — der Strang nur bei `p90 ≥ 5`. | Ein Körper, der keinem der drei entspricht und keinen Satz im Seitenprofil hat; zwei Zonen zugleich in der Randspalte; ein Strang daneben ohne Zahl aus dem Entitätsprofil. | `MasterDetail`; 0071 / 0050 / 0063 |
| **D6 Der Kopf trägt Kennung, Name, einen Zustand** | Pflicht: `overline`, `title`, `status` (**eine** Achse als `StatusBadge` mit (i) → `StatusInfoDialog`). Dazu, wo es sie gibt: Prozessbild (Z7), Meta-Zeile, Kennzahl, Faktenzeile, Aktionen. | Kein Weg von der Marke zur Erklärung der Achse; eine Kennung, die nur in der URL steht; ein Symbol aus einer Statusachse; eine Kette ohne Prozessbild. | `EntityHeader` (0048), `StatusBadge`, `StatusInfoButton`, `ProcessStepper` (Platz im Kopf: Spec **0137**) |
| **D7 Was nie in den Kopf gehört** | Kein zweiter Zustand derselben Frage · keine leere Kennzahl · nichts zweimal · kein Formular · keine Zustandslogik als Fließtext · nicht die Liste, aus der die Leserin kam · keine zweite Entität mit eigenem Kopf. | „GESAMTBETRAG —" an der stärksten Stelle; derselbe Name in Titel, Meta und Fakten; vier Anzeigen für „wer ist am Zug"; ein „Zurück" ohne Namen des Ziels. | `EntityHeader` (leere Slots fallen weg), `RecordPager back` |
| **D8 Aktionen oben rechts, ab drei ins Menü** | Alles Machbare in `EntityHeader actions`; höchstens zwei sichtbar, ab der dritten Handlung Menü mit sichtbarem Wort; bei genau einer Aktion **kein** Menü; Zerstörendes immer im Menü mit `tone="danger"`. Ausnahme: der nächste Schritt aus dem Zustand steht als **ein** Knopf im Signal-Slot und dann nicht zusätzlich im Kopf. | Drei und mehr Knöpfe nebeneinander im Kopf; ein Menü mit einem Eintrag; ein Kebab ohne Wort; dieselbe Handlung im Kopf und im Callout; „Löschen" als sichtbarer Knopf. | `EntityHeader actions`, `OverflowMenu` (0008), `ActionButton`, `StatusCallout actions` |
| **D9 Wert, Aktion oder Formular** | Ein Wert auf der Seite → `InlineEdit` an seinem Platz, im Reiter „Details" (auch Zustände, auch mit Grund über `ReasonDialog`). Mehrere Werte zugleich, etwas Neues, etwas Laufendes → Aktion oben rechts. Werte, die nur zusammen Sinn ergeben → Formular im Detail/Reiter/Drawer, nie im Kopf und nie im Dialog. Ausnahme: Korrektur mit Rang ≤ 5 steht in Zone 3, mit einem Satz im Profil. | Ein „Bearbeiten"-Knopf, der die Seite in einen Formularmodus schaltet; ein Zustandswechsel, der den Wert nicht dort ändert, wo er steht; ein mehrfeldriges Formular in einem Dialog; ein `InlineEdit` in der Übersicht ohne Satz im Profil. | `InlineEdit` (0020), `CaseEditor` (0083), `ReasonDialog`, `JournalEntryEditor` (R18) |
| **D10 Reiter sind Sichten, MECE, eine Leiste** | Ein Reiter ist eine andere Ansicht, nie ein Filter (R9). Jeder Inhalt in genau einem Reiter; zwei Tiefen derselben Frage sind eine Klappe. Keine Unterreiter, ein URL-Mechanismus. Reihenfolge nach Fragerang. Der Satz gehört der Entität (höchstens der Ausprägung), nicht dem Datensatz. | Zwei Reiter, gleiche Spalten, andere Grundgesamtheit; eine zweite Reiterebene; `?tab=` neben `?tab=x&view=y` in einer Leiste; ein Reiter, der bei manchen Datensätzen verschwindet. | `Tabs` (R9), `?tab=` (I1) |
| **D11 Der Standard-Satz** | **Übersicht · Details · [entitätsspezifisch] · Verlauf · Rohdaten.** „Übersicht" heißt überall gleich; „Details" trägt die Felder samt `InlineEdit`; „Verlauf" steht, wo es einen Strang gibt; eine Liste mit Rang ≤ 4 steht vollständig in der Übersicht und hat dann keinen eigenen Reiter. | Ein erster Reiter, der nach der Entität oder der Ausprägung heißt; ein „Verlauf" ohne Strang dahinter; dieselbe Liste als Abriss **und** in voller Länge in der Übersicht. | `Tabs`, `FieldList`, `LogBrowser`, `RawRecord` |
| **D12 „Rohdaten" ist immer der letzte Reiter** | Jede Detailseite hat ihn, immer zuletzt, überall gleich benannt, für alle sichtbar, ohne Zähler und ohne Alarm, optisch auf der Debug-Stufe (A7). Er ist die einzige Technik-Sicht der Seite (T4). | Eine Detailseite ohne Rohdaten-Reiter; Rohdaten in der Mitte der Leiste; ein interner Name außerhalb dieses Reiters; ein Zähler daran. | `RawRecord` (0051), `Tabs` (leiser Reiter: Spec **0136**) |
| **D13 Verknüpftes öffnet als Drawer, sonst Link** | Nachsehen → Drawer aus dem Katalog über eigenen Such-Parameter (`Esc`, Position bleibt). Kein Drawer, oder die Arbeit geht dort weiter → benannter Link. Nie eine eingebettete zweite Detailansicht. In Listen: `peek` nur, wenn die Zeile ein **zweites** Ziel hat. | Ein zweiter `EntityHeader`; ein Reiter, der Rang 1–4 einer anderen Entität beantwortet; zwei Drawer für zwei Quellen derselben Zeile; ein `peek` neben einer Zeile, die schon in den Drawer führt. | `*Drawer` (R15, I2), `Link`, `RowAction action="peek"` (I11) |
| **D14 Karte, Feldliste, Tabelle — jede an ihrem Platz** | Tabelle immer in einer Karte mit Kopf und Spaltenkopf, auch leer. Feldliste für Label/Wert (`bare` in der Karte, `row` in der Faktenzeile, `soft` für die zweite Wahrheit). Karte mit Kopf für alles mit eigenem Namen oder eigenen Aktionen. Keine Karte in der Karte. | Frei schwebende Zeilen; eine zweite Feldliste für Werte, die eine andere Ansicht schon zeigt; verschachtelte Karten; ein Leerfall ohne Spaltenkopf. | `Card`/`CardHead`, `FieldList` (0006), `DataTable` (0057) |
| **D15 Abriss nur mit Deckung, im Spaltensatz des Reiters** | Abriss-Karte nur bei `p50 ≥ 2` der Relation (Entitätsprofil); `p50 ≤ 1` → Zahl mit Weg in Zone 3; in der Mehrzahl leer → gar nichts. Der Abriss nimmt einen benannten Satz aus dem Spaltenkatalog der Entität. Zähler und Kacheln zählen nach **I12**. | Eine Karte, die bei den meisten Datensätzen leer ist; eigene Spalten im Abriss; Kachel 225, Liste 180; „—" in der Kennzahl; zwei gleich große Salden nebeneinander. | `sourceDocumentColumns()` (0070), `caseColumns()` (0096), `bankTransactionColumns()` (0101), `KpiTile href` (0126) |
| **D16 Diagramm nur in Zone 4, erst ab vier Werten** | Nur Verlauf oder Vergleich. ≤ 3 Werte → Zahl plus Veränderung als Wort. 4–12 → Zahl plus `Sparkline`. Ablesbare Werte → `BarChart` in einer Karte. Höchstens zwei Reihen, Textalternative aus denselben Daten. | Ein Diagramm mit drei Balken; ein Diagramm im Kopf; ein Diagramm ohne Frage dahinter; eine dritte Diagrammfarbe; eine Reihe, die nur als Bild existiert. | `Sparkline` (0124), `BarChart` (0041, 0110), `KpiTile` |

## 9 Was der Standard vom Seitenprofil verlangt

Ein Seitenprofil einer Detailseite (`docs/seiten/<slug>.md`, Vorlage
`TEMPLATE.md`) trägt zusätzlich zu seinen bisherigen Abschnitten:

1. **Das Layout** — `D-L1`, `D-L2` oder `D-L3`, mit einem Halbsatz, welche der
   drei Fragen aus §1.2 gegriffen hat, und bei `D-L3` mit der Zahl aus dem
   Entitätsprofil.
2. **Die Reiter in ihrer Reihenfolge**, jeder mit dem Fragerang, den er
   beantwortet — beginnend mit „Übersicht", endend mit „Rohdaten".
3. **Die Zonen 4 und 5 mit ihrer Deckung** — je Abriss die `p50`/`p90` der
   Relation aus dem Entitätsprofil (§2.4).
4. **Abweichungen** unter der Überschrift
   `## Abweichung vom Detailseiten-Standard`, je Abweichung **eine Zeile**:
   Regelnummer · was stattdessen gilt · warum, in einem Satz.

Ohne Satz keine Abweichung: was dort nicht steht, gilt wie im Standard.

## 10 Prüfliste — abzuhaken vom Seitenprofil und bei der Abnahme

- [ ] **D1** Rang 1–4 ohne Scrollen und ohne Klick beantwortet; die Übersicht schreibt nur über Aktionen oben rechts und Mängelzeilen
- [ ] **D2** Jeder Mangel hat Ort **und** Ausweg; kein fehlender Pflichtwert als Leerzeile; leer = Haken + Satz mit Zahl
- [ ] **D3** Slots in der Reihenfolge Pager · Kopf · Signal · Reiter · Körper; leere Slots fallen weg
- [ ] **D4** Zonen in der Reihenfolge Kopf · Mängel · Fakten · Abrisse · Verlauf; Fakten = Rang 1–6 des Entitätsprofils
- [ ] **D5** Layout benannt (D-L1/2/3) und begründet; bei D-L3 die Zahl genannt
- [ ] **D6** Kennung, Name, **ein** führender Zustand mit Weg zur Erklärung; Prozessbild, wo eine Kette existiert
- [ ] **D7** Keine leere Kennzahl, nichts zweimal, kein zweiter Zustand derselben Frage, kein Formular im Kopf
- [ ] **D8** Höchstens zwei Aktionen sichtbar; kein Menü bei einer Aktion; der nächste Schritt genau einmal; Zerstörendes im Menü
- [ ] **D9** Je Änderung entschieden: Wert · Aktion · Formular; `InlineEdit` in „Details", Ausnahmen mit Satz
- [ ] **D10** Jeder Reiter eine eigene Ansicht, kein Filter, keine Unterreiter, ein URL-Mechanismus, Reihenfolge = Fragerang
- [ ] **D11** Satz = Übersicht · Details · [entitätsspezifisch] · Verlauf · Rohdaten; keine Liste doppelt
- [ ] **D12** Letzter Reiter „Rohdaten", ohne Zähler, leise, für alle sichtbar; kein interner Name außerhalb
- [ ] **D13** Jede fremde Entität: Drawer oder Link — nie eingebettet; `peek` nur bei zwei Zielen
- [ ] **D14** Jede Tabelle in einer Karte mit Spaltenkopf; keine verschachtelten Karten
- [ ] **D15** Jeder Abriss mit `p50 ≥ 2` belegt, im Spaltensatz seines Reiters; jede Zahl mit Weg zählt nach I12
- [ ] **D16** Kein Diagramm unter vier Werten, keines außerhalb Zone 4; höchstens zwei Reihen; Textalternative vorhanden
- [ ] Abweichungen stehen als Zeile im Seitenprofil (§9)

## 11 Entscheide, und wo die Zahlen widersprechen

### 11.1 Der Rohdaten-Reiter ist für alle sichtbar

**Entschieden (Owner, 2026-09-08): sichtbar für jede Rolle, als letzter
Reiter, optisch zurückgenommen.** Drei Gründe, die über die Entscheidung hinaus
tragen und erklären, warum sie auch bei der nächsten Entität gilt:

1. **Eine Rollenabfrage gäbe es im Set nicht — und sie wäre auch keine.** Kein
   Baustein nimmt eine Rolle; Schreibrechte prüft die Server Action (I9: ein
   gedimmter Knopf ist keine Zugriffskontrolle). Ein Reiter, den die Oberfläche
   versteckt, schützt nichts — die Daten kommen mit der Abfrage. Wer Rohdaten
   einschränken will, schränkt die Abfrage ein; dann fehlt der Reiter aus einem
   echten Grund und sagt es (T6).
2. **Der Zweifel ist der Anlass, aus dem jemand die Seite öffnet.** Die
   Belegseite wird laut ihrem Profil nicht hundertmal hintereinander bedient,
   sondern einmal pro Zweifel, und ihre Rangfolge stellt Nachweis vor Tempo.
   Genau dort ist „was steht wirklich in der Zeile" die letzte Frage — Rang 9
   dort — und ein verstecktes Werkzeug wäre ein Anruf.
3. **Er soll aussehen wie ein Debug-Werkzeug** und darf es deshalb auch sein:
   letzter Platz, Debug-Stufe (A7 `neutral`), kein Zähler, kein Alarm.
   Sichtbarkeit ist nicht Prominenz.

T4 bleibt scharf: interne Namen sind **nur dort** erlaubt — nicht eine Ebene
höher, weil sie „einen Klick weiter ohnehin stehen".

### 11.2 Kein Menü bei einer Aktion — mit eigener Zahl, nicht mit E8

**Entschieden wie vorgeschlagen: kein Menü bei einer Aktion.** Zur Prüffrage,
ob E8 wörtlich gilt: **nein, aber die Zahl stimmt.**

E8 (`docs/backlog/0057-data-table.md`, Owner 2026-09-04) sagt: Zeilenaktionen
nach Zahl, bis zwei inline, ab drei ins Menü — begründet mit L1 (feste
Desktop-Breite, kein `ResizeObserver`). Das ist eine **Platzfrage der
Tabellenzeile**; der Seitenkopf hat mehr Platz als eine Zeile. Wörtlich
übernommen bände die Regel im Kopf nichts, und würde E8 eines Tages gelockert,
weil eine Zeile breiter wird, dürfte der Kopf nicht mitziehen.

Der Kopf braucht die Grenze aus einem anderen Grund — deshalb eine eigene
Nummer (D8): oben steht bereits **der nächste Schritt** (I10). Drei Knöpfe im
Kopf plus einer im Callout sind vier Antworten auf „was soll ich jetzt tun".
Die Grenze kommt aus der Entscheidung, nicht aus der Breite, und landet
zufällig bei derselben Zahl.

Zwei Ergänzungen, die E8 nicht hat: der nächste Schritt zählt nicht mit, weil
er nicht im Kopf steht — und eine zerstörende Handlung geht auch als einzige
ins Menü; ein Storno-Knopf neben dem Titel ist ein Fehlgriff, der auf seine
Gelegenheit wartet.

### 11.3 Drei Stellen, an denen die erhobenen Zahlen dem Zonenmodell widersprechen

Alle drei Zahlen stammen aus den Entitätsprofilen (Spalte Kardinalität,
Staging-Erhebung), nicht aus einer Schätzung.

**1. Zone 4 trägt an der Belegseite nicht — und Zone 3 muss dort schreiben
dürfen.**
Die Kinder des Belegs: Teilbelege **97 % ohne · p50 0 · p90 0 · max 23**;
Ereignis → Sachverhalt **12 % ohne · p50 1 · p90 1 · max 2**;
Rechnungspositionen (nur Rechnungen) **1 % ohne · p50 1 · p90 5 · max 22**.
Nach §2.4 heißt das: die Teilbeleg-Karte steht **nie**, der Sachverhalt ist
eine Zeile in Zone 3, und die einzige Abriss-Karte mit Deckung ist
„Positionen" — und die auch nur bei Rechnungen. Zone 4 besteht dort also aus
**einer** Karte für einen Teil des Bestands. Dazu kommt: das Profil rangiert
die Korrektur eines einzelnen Werts bei **Rang 5** und schreibt ausdrücklich,
sie dürfe „nie einen Wechsel der Ansicht" kosten — das steht gegen „die
Übersicht schreibt nicht". **Folge:** die Belegseite bekommt die Ausnahme aus
§4.2 (Rang ≤ 5 schreibt in Zone 3) und Zone 4 mit einer Karte; beides als
Abweichung in `beleg-detail.md`.

**2. Die Kontoseite hat ihre Liste bei Rang 4 — ein Abriss wäre ein
Rückschritt.**
Bewegungen im DATEV-Spiegel **p50 4 · p90 20 · p99 250 · max 3.400** je Konto
und Jahr. Die Deckung trägt eine Abriss-Karte mühelos — aber das Profil
rangiert „Was liegt konkret drauf?" bei **Rang 4** und nennt die Bewegungen
„die Hauptfläche". Ein Abriss von fünf aus 412 Zeilen macht aus der
Hauptaufgabe einen Klick und stellt den Reiter „Buchungen" wieder her, den das
Profil aus gutem Grund gestrichen hatte. **Folge:** die Ausnahme aus §5.2
(Liste mit Rang ≤ 4 steht vollständig in der Übersicht, dann ohne eigenen
Reiter), als Abweichung in `konto-detail.md`. Dass die **Fakten** dabei in
der Randspalte stehen und nicht als Zone 3 über der Liste, ist dagegen keine
Abweichung, sondern D-L3 — ein Faktenblock über einer Liste von Rang 4 drückt
die Hauptantwort unter die Falz (Zweifel 4 des Profils, in der Abnahme von
0063 nachgemessen).

**3. Zone 5 setzt einen Strang voraus, den nicht jede Entität hat.**
Gemessen: Sachverhalt **43 % ohne · p50 3 · p90 9 · max 84**; Beleg **0 % ohne
· p50 2 · p90 3 · max 8**, verteilt auf **drei** `resource_kind`-Werte
(`source_doc` allein trägt 977 von 1 085 Ereignissen — wer nur darauf filtert,
verliert 10 %); Konto **nicht erhoben**; Geschäftspartner **drei**
`resource_kind`-Werte, von denen jeder für sich ein Drittel bis die Hälfte der
Geschichte zeigt (L-226 — deshalb bekommt der Partner vorerst **keinen**
Verlauf); Wiederkehr-Regel **0 Ereignisse** unter eigenem `resource_kind`
(L-250); Kontoauszugsposition, Klärung und Rechnungsposition haben **gar
keine** Audit-Spur.
**Folge:** „die letzten fünf Einträge" ist eine Obergrenze, keine Zusage — beim
Beleg zeigt der Median zwei —, und Zone 5 **entfällt**, wo es keinen Strang
gibt; das Seitenprofil nennt dann den Befund, der es erklärt. Beim Sachverhalt
ist der fachliche Strang außerdem nicht das Audit-Log, sondern der
Ereignis-Strang (`CaseTimeline`, 0040) — die Zone nennt ihre Quelle.

**Und eine vierte Zahl, die eine Frage offenlässt:** die Randspalte (D-L3)
wurde am Sachverhalt gebaut, weil er „viele Kinder" hat. Gemessen hat er
**p50 1 · p90 2 · max 38** Ereignisse — 90 % der Fälle haben höchstens zwei.
Nach dem Richtwert `p90 ≥ 5` aus §2.4 stünde dem Sachverhalt **D-L1** zu, nicht
D-L3; sein Profil notiert denselben Einwand als Zweifel 6. Der Zweispalter ist
also durch den Ausreißer gerechtfertigt, nicht durch den Normalfall. Weil das
Layout nicht je Datensatz wechseln darf (D3), ist es eine Entscheidung mit zwei
vertretbaren Antworten — sie liegt dem Owner vor und steht bis dahin als
Abweichung in `sachverhalt-detail.md`.

## 12 Herkunft — was aus welchem Ist stammt

| Regel | Stand schon in | Verallgemeinert um |
|---|---|---|
| D1 | allen drei Profilen („Rang 1–4 ohne Scrollen und ohne Klick"), im JSDoc aller drei Rahmen | „die Übersicht schreibt nicht" (Owner 2026-09-08) |
| D2 | `beleg-detail` Zweifel 5 (fehlender Wert = Mangel) · `sachverhalt-detail` Rang 3 · A7 · L6 | Ortsregel nach Reichweite, „jede Zeile mit einem Weg hinaus" |
| D3 | den drei Rahmen (gleiche Slots, drei Namen) | ein Namenssatz für alle |
| D4 | `SourceDocumentCard`, `LedgerAccountView` (Kennzahl · Verlauf · Liste · Fakten), 0120 (Herkunft nur bei Wert) | die fünf Zonen als feste Reihenfolge (Owner 2026-09-08) |
| D5 | `MasterDetail` in 0050 und 0063, `SourceDocumentCard` | die Wahl als Frage mit drei Ausgängen und einer Zahl |
| D6, D7 | `EntityHeader` JSDoc (kein leerer Metrik-Block, ein Zustand statt vier) · `sachverhalt-detail` Zweifel 1, 2, 4 · `beleg-detail` Zweifel 1 · Z3, Z7 | aus Zweifeln werden Regeln; Pflichtplätze benannt |
| D8 | `beleg-detail` Nebenjobs („nie ein Knopf in der ersten Reihe") · `sachverhalt-detail` Rang 3 („genau ein Knopf") · E8 (Zahl) | eigene Begründung, Ausschluss des Zerstörenden, kein Menü bei einer Aktion |
| D9 | `CaseEditor` (0083, `InlineEdit` auch für Zustände) · `JournalEntryEditor` (R18) · `InlineEdit` `@when`/`@instead` | drei Fragen statt „Stammdatum vs. Zustand"; der Ort „Details" |
| D10 | R9 (Owner-Entscheid 2026-09-08) · `sachverhalt-detail` Zweifel 3 · `beleg-detail` Zweifel 3 | MECE, eine Leiste, ein URL-Mechanismus, fester Satz je Ausprägung |
| D11 | `DOC_TABS` (ein Katalog, ein Name für alle Belegarten, L-92) · `konto-detail` offene Frage 1 | der Satz für alle Entitäten, „Details" als eigener Ort |
| D12 | `beleg-detail` Rang 9 · `RawRecord` (0051) · T4 | „immer und zuletzt" auf jeder Entität, plus die Sichtbarkeit |
| D13 | L3, I2, I11, R15 · `beleg-detail`/`konto-detail` („keine zweite Ansicht", ein URL-Parameter) | der Fall „die Arbeit geht dort weiter" als benannter Link |
| D14 | V5 · `FieldList` JSDoc · `konto-detail` Zweifel 4 (Fakten in die Randspalte) | eine Tabelle Inhalt → Form |
| D15 | I12 · `konto-detail` Zweifel 2 · Spaltenkataloge 0070/0096/0101 · die Kardinalitäten der Entitätsprofile | die Deckungsschwelle `p50 ≥ 2` |
| D16 | `Sparkline` (0124, unter vier Werten nichts) · `konto-detail` Rang 3/Zweifel 3 · §3 Diagrammreihe | die Stufen ≤ 3 / 4–12 / ablesbar, und „nur in Zone 4" |
