# 0065 · Wiedervorlage — „nicht jetzt" sichtbar machen

| | |
|---|---|
| Status | fertig (Abnahme 2026-09-07, vierte Runde) |
| Freigabe | 2026-09-07, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/clarification/` — Erweiterung von `ClarificationCard` (0060) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: die Regeln (30 Tage, ab der dritten nur ein Mensch) sind Ludwig-Fachlogik |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` offene Frage 1 · Owner-Entscheid 2026-09-04 („ok, gute Idee") · `docs/topics/sachverhalt.md` S10–S12, F105 |
| Ersetzt | nichts — es gibt heute keinen Weg, eine Frage zurückzustellen |
| Blockiert | nichts |
| Setzt voraus | 0060 `ClarificationCard` (Abnahme), `ReasonDialog`, `DateField` |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`) |

## Ziel

Die Wiedervorlage ist vollständig gebaut — Spalten, Regeln, Registry-Zustand,
die Zeile zeigt sie an — und in **0 von 166** Zeilen benutzt, 0 Audit-
Ereignisse. Sie ist trotzdem nicht tot, sondern unerreichbar: das „nicht
jetzt" passiert, es wird nur nicht aufgeschrieben.

Der Beleg dafür sind die offenen Fragen selbst: **60 Stück, im Median 13 Tage
alt, p90 31 Tage.** Genau dagegen wurde F105 gebaut („ein Gate, das man nicht
schaffen kann, wird umgangen" — Gate und Wiedervorlage sind zusammen
ausgeliefert worden). Was fehlt, ist der Knopf.

Die 57 Auflösungen sind **kein** Ersatz dafür: 35 tragen `resolution =
'answered'` (der Agent hat die Antwort selbst gefunden), 22 `'obsolete'` (die
Frage ist gegenstandslos). Keine davon heißt „später".

## Zuschnitt

Keine neue Komponente. `ClarificationCard` bekommt **eine** Prop:

| Prop | Typ | Bedeutung |
|---|---|---|
| `onDefer` | `(until: string, reason: string) => Promise<void>` | Ohne die Prop kein Knopf — dieselbe Regel wie bei `onResolve`. |

Dazu die Anzeige des Regelwerks, das es schon gibt:

- höchstens **30 Tage** voraus (ein Monatslauf) — das Datumsfeld begrenzt,
  nicht erst der Server
- **Grund ist Pflicht** (`required` am `ReasonDialog`; der Knopf bleibt ohne
  ihn gesperrt). Eine **Mindestlänge** steht in der ursprünglichen Fassung
  dieses Auftrags („mindestens 10 Zeichen, DB-CHECK") und ist im Spiegel
  **nicht belegt** — kein CHECK, keine Domänenregel. Sie ist gestrichen;
  taucht sie doch auf, bekommt `ReasonDialog` eine Prop `minLength`, statt
  dass die Karte selbst zählt
- ab der **dritten** Verschiebung darf nur noch ein Mensch verschieben
  (`deferred_count`) — die Karte zeigt den Zähler und sperrt den Knopf mit
  Grund, statt ihn zu verstecken
- hängt die Wiedervorlage an einer Gegenfrage
  (`deferred_by_clarification_id`), endet sie mit deren Antwort — das steht
  als Satz an der Zeile, nicht nur im Datum

## Warum nicht in 0060

0060 ist gebaut und in der Abnahme. Die Wiedervorlage ist eine eigene
Entscheidung mit eigenem Regelwerk und eigenem Nachweis — sie gehört in eine
Aufgabe, die man einzeln abnehmen kann. Die Karte hat den Platz dafür bereits
(zweiter Ausgang neben „ohne Antwort auflösen").

## Offene Frage

1. Darf der Mandant zurückstellen, oder nur Kanzlei und Agent? — ohne
   Antwort: nur wer die Frage bearbeitet, also nicht das Portal; der
   Aufrufer entscheidet, indem er `onDefer` dort nicht setzt.

## Spec 2026-09-07 (Skill `spec-schreiben`)

### Einordnung

- **Klasse:** bleibt `entities/clarification/` — die 30 Tage und „ab der
  dritten nur ein Mensch" sind Ludwig-Fachlogik.
- **Regel aus §3:** Nr. 2 — ein `@when` deckt den Fall zu vier Fünfteln
  (`ClarificationCard`: „read it, or answer it"), und was fehlt, ist **eine**
  Designentscheidung, die wiederkommt: der zweite Ausgang. Er steht in einem
  Halbsatz am `@when` und braucht genau eine Prop. Keine neue Komponente.
- **Kein neues Primitive.** Der Dialog dafür existiert: `ReasonDialog` nimmt
  den Pflichtgrund, und sein `children`-Schlitz sitzt **über** dem Grundfeld —
  dort steht das `DateField`. Der Tag liegt damit im Zustand der Karte, der
  Grund kommt aus dem Dialog; `onDefer` bekommt beides. Ein eigener
  `DeferDialog` wäre `ReasonDialog` plus ein Feld und würde die Frage „was
  nehme ich?" um eine Antwort verschlechtern.
- **Der Tag wird geklemmt, nicht nur begrenzt.** Startwert **morgen**, `min`
  morgen, `max` heute + 30. Aber `min`/`max` am Feld sind ein Hinweis beim
  Tippen, **keine Zusage**: ein von Hand eingetragenes Datum außerhalb
  erreicht `onChange`, und der Bestätigen-Knopf sieht das Feld nie.

  Dass der Startwert **morgen** ist, ist dabei keine Höflichkeit, sondern
  abgeleitet: `clarificationState()` liefert `deferred` nur für
  `deferredUntil > today`. Eine Zurückstellung auf heute würde gespeichert und
  sofort wieder als `open` gelesen — morgen ist der erste Tag, der den Zustand
  überhaupt erzeugt.

### Schnittstelle — was an `ClarificationCard` dazukommt

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `onDefer` | `(until: string, reason: string) => Promise<void>` | nein | Der dritte Ausgang. **Ohne die Prop kein Knopf** — dieselbe Regel wie bei `onResolve`: fehlt der Callback, fehlt der Weg | `Answering`, `Filled` (ohne Knopf) |
| — | — | — | **`deferMaxDays` gestrichen.** 30 Tage sind Regel, kein Vorschlag: eine Prop dafür lüde ein, sie zu übergehen, und der Server nähme es nicht an. Die Zahl steht einmal in der Karte, weil `DEFERRAL_MAX_DAYS` in `domain/case.ts` fehlt (Befund L-91) | — |
| `deferLockedReason` | `string` | nein | Warum der Knopf gesperrt ist — er wird **gesperrt gezeigt, nicht versteckt**, und der Satz hängt über `aria-describedby` am Knopf. Die Karte errechnet den Text nicht selbst: „ab der dritten Verschiebung nur noch ein Mensch" ist eine Regel über den Betrachter, und den kennt nur der Aufrufer | `Answering` (dritte Karte) |

Am Anzeige-Typ der **Zeile** (`ClarificationVM`) ist nichts Neues nötig:
`deferredUntil` und `state = "deferred"` gibt es, und `ClarificationEventKind`
kennt `deferred` seit 0060. Der Anzeige-Typ der **Karte**
(`ClarificationDetailVM`) bekommt drei Punkte dazu — strukturell
deckungsgleich mit den Spalten, die es in der Tabelle längst gibt:

| Feld | Spalte | Wozu |
|---|---|---|
| `deferredReason?: string \| null` | `deferred_reason` | Pflicht in der Datenbank; ohne ihn ist die Verschiebung eine Zeile, die niemand zurücklesen kann |
| `deferredCount?: number \| null` | `deferred_count` | die Warnung vor der Sperre, bevor die Sperre kommt |
| `deferredBy?: { id, title, href }` | `deferred_by_clarification_id` | dann ist **die Antwort auf jene Frage** die Bedingung, nicht das Datum |

Alle drei sind Befund **L-83** (im Register um `deferred_reason` erweitert):
die Spalten gibt es, das View-Model der App führt sie nicht.

### Was die Karte zeigt, wenn zurückgestellt ist

Vier Sätze, keine Rechnung:

1. **„Zurückgestellt bis 12.09.2026"** — absolut, nie „in 5 Tagen" (T7). Der
   Zustand kommt aus der Registry (`klaerung_status`, Wert `deferred`), nicht
   aus einem eigenen Wort.
2. **Der Grund** steht dabei. Eine Verschiebung ohne sichtbaren Grund ist
   genau das, was der DB-CHECK verhindern will — und was ihn im UI hohl
   machte, wäre ein Grund, der nur im Protokoll landet.
3. **Die Zahl der Verschiebungen**, sobald sie größer als 1 ist: „zum zweiten
   Mal zurückgestellt". Sie ist die Warnung vor der Sperre, bevor die Sperre
   kommt.
4. **Hängt sie an einer Gegenfrage**, steht das als Satz mit Link: „endet mit
   der Antwort auf «…»" — nicht nur ein Datum, denn dieses Datum ist dann
   nicht die eigentliche Bedingung.

### Drei Sätze, die sonst geraten würden

- **Der Knopf erscheint nur bei `mode="answer"`.** Zurückstellen ist eine
  Handlung an einer offenen Frage; im Lesemodus gibt es sie nicht.
- **Der Antwortbereich bleibt im Zustand `deferred` stehen.** Eine frühe
  Antwort beendet die Wiedervorlage — sie ist kein Verbot, sondern ein
  „nicht jetzt", und wer doch jetzt kann, soll nicht erst warten müssen.
- **Der Gegenfrage-Link führt zur Sachverhaltsseite**, nicht in einen Drawer.
  Eine Klärung hat keinen eigenen View (Entitätsprofil); ihr Detail *ist* der
  Sachverhalt — dasselbe Ergebnis wie in 0058.

### Stories

Titel `v3/Entitäten/Klärung/ClarificationCard`. Der Bestand ist **9**, nicht
6 — die Obergrenze aus §6 ist 10, also kommt genau **eine** Story dazu, und
der Rundlauf zieht in die Callback-Story ein, die es schon gibt:

| Story | Beweist |
|---|---|
| `Answering` (bestehend, erweitert) | Der Rundlauf: Knopf → `ReasonDialog` mit `DateField` darüber → `onDefer(until, reason)`. **Und** in derselben Story die dritte Karte mit `deferLockedReason`: der Knopf steht sichtbar und gesperrt da, mit dem Grund daneben |
| `Deferred` (neu) | Die drei Lagen nebeneinander: einmal · zum dritten Mal · an einer Gegenfrage. Datum absolut, Grund dabei, Zähler ab der zweiten |

Der Fall „ohne `onDefer` kein Knopf" braucht keine eigene Story: er ist in
jeder anderen bewiesen, weil keine von ihnen die Prop setzt — die Abnahme
prüft ihn an `Filled`.

**Die Export-Namen sind bei dieser Gelegenheit englisch geworden**
(`Gefuellt` → `Filled`, `Antworten` → `Answering`, …): CLAUDE.md verlangt es,
und die Datei wird ohnehin angefasst. Die Story-IDs im Storybook ändern sich
damit — wer auf `--gefuellt` verlinkt hat, findet jetzt `--filled`.

### Abnahmekriterien

Fest: typecheck · build · Code englisch mit `@when`/`@instead` · kein Hex,
keine lokale Label-Map · alle Stories · §9 · im Browser angesehen.

Variabel:

- [ ] Ohne `onDefer` erscheint kein Knopf (Story `Filled`, `grep`)
- [ ] Das Datumsfeld startet **morgen** und reicht 30 Tage (Story `Answering`, gemessen: `value` und `min` = morgen, `max` = heute + 30)
- [ ] Ein Tag außerhalb wird **geklemmt**, nicht nur am Feld verhindert (`grep`: `clampDeferralDay` im Bestätigungspfad)
- [ ] Der Grund ist Pflicht; der Knopf im Dialog bleibt ohne ihn gesperrt (Story `Answering`, gemessen: `disabled === true`)
- [ ] Die Sperre ist **sichtbar und begründet**, nicht versteckt (Story `Answering`, dritte Karte, gemessen: Knopf `disabled` mit Satz daneben)
- [ ] Das Wiedervorlage-Datum steht absolut, nie relativ (Story `Deferred`, gemessen: „Zurückgestellt bis 15.09.2026")
- [ ] Der Zustand kommt aus der Registry (`klaerung_status`), kein eigenes Wort (`grep`)
- [ ] Eine Wiedervorlage an einer Gegenfrage nennt sie und verlinkt auf den **Sachverhalt** (Story `Deferred`, dritte Karte)
- [ ] Der Knopf erscheint nur bei `mode="answer"`; der Antwortbereich bleibt im Zustand `deferred` stehen (`grep`, Story `Deferred`)
- [ ] `ReasonDialog` bleibt unverändert — das Datumsfeld steht in seinem `children` (`git diff`: keine Änderung an `ReasonDialog.tsx`)
- [ ] offen (App): der Knopf ist an `RueckfragenListe` und an der Sachverhaltsseite gebunden, und die 0 Audit-Ereignisse werden nach einem Monat nachgezählt

### Offene Fragen

1. **Darf der Mandant zurückstellen?** *Ohne Antwort: nein* — nur wer die
   Frage bearbeitet. Der Aufrufer entscheidet, indem er `onDefer` im Portal
   nicht setzt. (Aus dem Auftrag übernommen.)
2. **Zählt die Karte die Verschiebungen selbst?** *Ohne Antwort: nein.* Sie
   zeigt, was der Anzeige-Typ trägt; die Regel „ab der dritten" ist eine
   Aussage über den Betrachter und gehört dem Aufrufer (`deferLockedReason`).
3. **Was passiert am Stichtag?** *Ohne Antwort: nichts im Set.* Die Frage wird
   serverseitig wieder offen; die Karte zeigt nur den Zustand, den sie bekommt.

### Befunde für `ludwig/app`

- **Neu (L-83):** `deferred_count` und `deferred_by_clarification_id` stehen
  in der Tabelle, aber nicht im Anzeige-Typ der Klärung. Ohne den Zähler kann
  die Karte die Warnung vor der Sperre nicht zeigen; ohne den Verweis wird aus
  „endet mit der Antwort auf «…»" ein nacktes Datum.
- **B8** (der Klärungs-Faden fehlt) bleibt bestehen und ist die Voraussetzung
  dafür, dass die Gegenfrage überhaupt verlinkt werden kann.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Die Sperre ab der dritten Verschiebung ist App-Regel (GLOSSARY „Deferral", Registry `KLAERUNG_STATUS`, F105), keine Set-Erfindung; ob der Server sie durchsetzt, ist im Spiegel nicht sichtbar — Befund. Der Schnitt (eine Prop `onDefer` an der Karte, Datumsfeld im `children`-Schlitz von `ReasonDialog`) ist der kleinste und passt zu `onResolve`. Entscheide: 1 Mandant darf nicht zurückstellen · 2 die Karte zählt nicht selbst, `deferLockedReason` kommt vom Aufrufer · 3 am Stichtag passiert im Set nichts.

Vor dem Bau in die Spec: (a) `ClarificationDetailVM` um `deferredReason?`, `deferredCount?`, `deferredBy?: { id, title, href }` ergänzen — strukturell deckungsgleich, L-83 wird um `deferred_reason` erweitert; (b) `deferMaxDays` streichen, 30 ist Regel (Befund L-91: `DEFERRAL_MAX_DAYS` in `domain/case.ts`); (c) Datumsfeld mit Startwert morgen, `min` morgen, `max` heute + 30, Wert wird geklemmt — der Dialog-Knopf sieht das Datum nicht, das `max`-Attribut allein reicht nicht; (d) „mindestens 10 Zeichen (DB-CHECK)" ist nicht belegt — streichen, sofern keine Quelle; gilt sie, bekommt `ReasonDialog` eine Prop `minLength`; (e) Stories: Bestand ist 9, nicht 6 — `onDefer`-Rundlauf in die Callback-Story, eine Story `Deferred` mit den drei Zuständen nebeneinander, gesamt 10; Kriterium „Story `Read`" → `Filled`; Exportnamen englisch, da die Datei angefasst wird; (f) sagen: Knopf nur bei `mode="answer"`, der Antwortbereich bleibt im Zustand `deferred` (eine frühe Antwort beendet die Wiedervorlage); der Gegenfrage-Link führt zur Sachverhaltsseite, nicht in einen Drawer.

Befunde ins Register: L-83 um `deferred_reason` ergänzen; **L-91** — `DEFERRAL_MAX_DAYS = 30` (und ggf. Mindestlänge des Grundes) fehlt in `modules/accounting-cases/domain/case.ts`; Hinweis: `overview-vm.ts` liegt trotz „L-09 erledigt" nicht im Spiegel — Sync prüfen.

## Nach der Abnahme vom 2026-09-07

Die Abnahme kam **zurück, auf kurzem Weg**: alle variablen Kriterien erfüllt,
das feste „Code englisch" nicht — und zwei Punkte, die eine Entscheidung
brauchten statt einer Korrektur.

**Die Klemmung war stumm (M-2).** Sie griff, aber erst im Bestätigungspfad:
gemessen wurde aus `2027-01-01` beim Speichern `2026-10-07`, ohne dass im
Feld etwas darauf hindeutete. Ein Wiedervorlagedatum, das sich unbemerkt
verschiebt, fällt genau dann auf, wenn die Frage am falschen Tag zurückkommt.
Jetzt klemmt es **am `onChange`** — die Korrektur steht im Feld — und im
Bestätigungspfad bleibt sie als Netz. Gemessen: `2027-01-01` wird sofort zu
`2026-10-07`, `2020-01-01` zu `2026-09-08`, ein gültiger Tag bleibt stehen.

**Der dritte Ausgang hing am ersten (M-3).** Beide Ausgänge standen im
`canAnswer`-Block, und `canAnswer` verlangt `onAnswer` **und** eine
beantwortbare Frageart. Wer `onDefer` ohne `onAnswer` setzte, bekam keinen
Knopf — und die acht Altlast-Fragen (`answer_kind = "document_upload"`)
verloren beide Wege, ausgerechnet die Fragen, die man zurückstellt, **weil**
man sie nicht mehr beantworten kann. Jetzt hängen sie an `canExit`
(`mode === "answer"` und kein Kommentar). Der Fehler war von `onResolve` aus
0060 geerbt und ist dort mitbehoben.

**Der gesperrte Knopf war mit 2,11:1 kaum lesbar (M-5).** `opacity: .5` auf
der Linkfarbe — und damit war der Weg nicht „sichtbar und begründet", sondern
nur zu ahnen. Die Regel gehört dem Primitive: `.v2link:disabled` nimmt jetzt
die gedämpfte Textfarbe statt Deckkraft. Gemessen **6,69:1**, und der
Unterschied zum aktiven Link bleibt deutlich, weil dieser blau ist. Dazu hängt
der Grund über `aria-describedby` am Knopf.

Dazu: die zwei deutschen Kommentarblöcke sind englisch (M-1), die Story
`Deferred` zeigt ihre erste Karte im Antwortmodus und beweist damit den Satz
„der Antwortbereich bleibt im Zustand `deferred` stehen" (M-4), die Ids kommen
aus `useId()` statt fest verdrahtet (M-6), und der Hinweis „höchstens 30 Tage"
hängt über `aria-describedby` am Datumsfeld — dafür hat `DateField` eine Prop
bekommen, die dem ganzen Set gefehlt hat (M-7).

**Offen und benannt:** M-9 — die Umbenennung der Story-Exporte macht die
Nachweise der abgeschlossenen Abnahme 0060 tot (`--gefuellt`, `--antworten`,
…). Sie stehen dort als Story-IDs in der Abnahmetabelle; wer 0060 nachprüft,
findet sie nicht mehr. M-10 (`void onDefer(...)` verschluckt einen Fehler) ist
seit 0060 so und gehört in eine eigene Runde für beide Ausgänge.

## Zweite Runde, 2026-09-07 — die Klemmung war nicht mehr stumm, sondern laut an der falschen Stelle

Acht der neun Punkte hielten der Nachprüfung stand; zurück ging es an dem
einen, der aus der ersten Korrektur entstanden ist.

**Das Klemmen am `onChange` kämpfte gegen das Tippen (N-1).** Ein natives
Datumsfeld meldet **jede Ziffer der Jahreszahl einzeln**, so dass „2026" durch
0002, 0020 und 0202 läuft. Wer auf jedem dieser Werte korrigiert, schreibt
Segmente um, die niemand angefasst hat: gemessen sprang beim ersten Anschlag
der Jahreszahl der **Tag** von 20 auf 8. Dieses Repo hat denselben Fehler
schon einmal gefunden — im Review von 0024, an `DateRangeField`, das seither
auf den Blur wartet.

Die Lösung hier ist enger und braucht den Umweg nicht: **ein Jahr unter 1000
ist ein Tastenanschlag, kein Datum** und geht unverändert durch; alles andere
wird sofort korrigiert, wo die Korrektur sichtbar ist. Gemessen:

| Eingabe | Feld zeigt danach |
|---|---|
| `2026-09-20` | 2026-09-20 |
| `0002-09-20` · `0020-09-20` · `0202-09-20` | unverändert — der Tag bleibt der 20. |
| `2027-01-01` | **2026-10-07** |
| `2020-01-01` | **2026-09-08** |

Dazu bleiben zwei Netze: `DateField` hat eine Prop `onBlur` bekommen (die dem
Set gefehlt hat — dieselbe Stelle, an der `DateRangeField` seinen Tausch
macht), und `clampDeferralDay` steht weiter im Bestätigungspfad.

**Der Fix für die Ausgänge hat jetzt seine Story (N-2).** Die Altlast-Karte in
`Answering` (`answer_kind = "document_upload"`) bekommt `onDefer` und
`onResolve` — sie ist genau der Fall, für den die Entkopplung gemacht ist:
beantworten kann man diese Frage nicht mehr, auflösen und zurückstellen schon.

**Und der Kontrast-Fix hatte eine Nebenwirkung, die die Abnahme gefunden hat
(N-3):** mit `--color-text-muted` waren „quiet + aktiv" und „quiet + gesperrt"
**pixelgleich** — übrig blieb `cursor: not-allowed`, also nichts, was man ohne
Maus sieht. Gesperrt hat jetzt eine eigene Stufe (`--color-text-subtle`,
4,88:1): über der Schwelle und von beiden aktiven Tönen unterscheidbar.

**Nicht geändert:** N-4 (der Umzug der Ausgänge verschiebt den senkrechten
Rhythmus um 4–5 px). Das ist Geschmack, und ein eigener `margin-top` an
`.v2clc__exit` wäre eine Regel mehr für einen Unterschied, den niemand
gemeldet hat. **M-11:** das CSS zu dieser Aufgabe liegt im Vor-Commit
`680653c` — wer den 0065-Diff liest, findet die Formatierung dort.

## Dritte Runde, 2026-09-07 — die engere Regel deckte nur das Jahr

Die Nachabnahme hat zwei Dinge geliefert, und beide waren mehr wert als eine
Freigabe.

**Sie hat gemessen, was ich für unmessbar hielt.** Der Weg ist eine Zeile:
React hängt `onBlur` nicht an `blur`, sondern an das bubbelnde **`focusout`**.
Ein synthetisches `new FocusEvent("blur")` läuft ins Leere; `element.blur()`
löst nativ `focusout` aus, und React feuert. Meine „das ist nicht nachweisbar,
der Blur ist nur der Gürtel"-Notiz war also nicht Vorsicht, sondern ein
Werkzeugfehler — der Satz ist gestrichen.

**Und sie hat gezeigt, dass die engere Regel nur das Jahr deckt.** Ein Jahr
unter 1000 ist als Tastenanschlag erkennbar. Monat und Tag sind es **nicht**:
„01" ist ein legitimer Monat, und in einem Fenster vom 08.09. bis 07.10. muss
jeder, der den Oktober tippt, durch den Januar. Gemessen sprang dabei der
**Tag** von 20 auf 08 — derselbe Fehler wie zuvor, eine Ebene tiefer und ohne
Regel, die ihn erkennen könnte.

`clampTyped` ist deshalb **ersatzlos gestrichen**. Der Blur trägt allein, und
das ist jetzt nachgemessen — mit dem Werkzeug der Abnahme, nicht mit meinem:

| Eingabe, dann Feld verlassen | Feld zeigt danach | `onDefer` bekam |
|---|---|---|
| `0202-09-20` (Tippwert) | 2026-09-08 | 2026-09-08 |
| `2027-01-01` | 2026-10-07 | 2026-10-07 |
| `2020-01-01` | 2026-09-08 | 2026-09-08 |
| `2026-09-25` | unverändert | 2026-09-25 |

Und beim Tippen bleibt jetzt jedes Segment stehen: Jahr, Monat und Tag gehen
unangetastet durch.

**Die Lehre:** eine Regel, die einen Sonderfall erkennt („Jahr < 1000"), ist
keine Lösung, sondern eine Wette darauf, dass die anderen Fälle sich genauso
verhalten. Sie taten es nicht. Die richtige Stelle war die ganze Zeit die, an
der `DateRangeField` seit 0024 steht — beim Verlassen des Feldes.

**Restmaß, benannt statt behoben (aus der Nachabnahme):** zwischen „quiet +
aktiv" (rgb 92) und „quiet + gesperrt" (rgb 113) liegt ein Verhältnis von
**1,37:1**. Jeder Ton steht über der Textschwelle; als Unterscheidungsmerkmal
zweier Zustände ist das dünn. Für diese Karte ohne Folge (der Grund-Satz ist
das Wort, V7); für die Vorgabeknöpfe von `DateRangeField` wäre die Farbe das
einzige Merkmal — dort ist es latent, weil keine Story einen gesperrten
Zeitraum zeigt. Das ist die Zahl, an der eine eigene Runde am Primitive
ansetzt.

## Freigegeben (2026-09-07, vierte Runde) — und zwei Dinge, die über 0065 hinausreichen

Alle festen und alle variablen Kriterien stehen auf ✓, jedes mit einem
Messwert statt einer Behauptung; die Kriterienliste ist über vier Runden nicht
angerührt worden.

**1. `DateField.onBlur` ist die eigentliche Ausbeute fürs Set.** Die Lücke war
set-weit — es gab keinen Ort, an dem ein Datumsfeld eine Korrektur anbringen
kann, ohne gegen das Tippen zu kämpfen. Sie ist jetzt an einem Primitive
geschlossen, mit dem Grund im JSDoc.

**2. „Nicht nachweisbar" war ein Werkzeugfehler, keine Eigenschaft der Sache.**
Zweimal in dieser Aufgabe stand in einer Notiz, etwas lasse sich headless nicht
messen — und beide Male stimmte es nicht. Für die Werkzeugkiste der nächsten
Abnahme:

- **React hängt `onBlur` an das bubbelnde `focusout`**, nicht an `blur`. Ein
  synthetisches `new FocusEvent("blur")` läuft ins Leere; `element.blur()`
  löst nativ `focusout` aus und React feuert. Ebenso wirkt „ein anderes
  Element fokussieren".
- **Mehrere Schritte in einem `Runtime.evaluate` sehen das Re-Render nicht.**
  Wer Wert setzen, Ereignis auslösen und Ergebnis lesen in einen Ausdruck
  packt, misst den Zustand *vor* Reacts Arbeit. Je Fall frisch laden und
  zwischen den Schritten warten.

Offen und benannt, außerhalb dieser Aufgabe: **M-10** (`void onDefer(…)`
verschluckt einen Fehler — gilt seit 0060 für beide Ausgänge), **M-11** (das
CSS dieser Aufgabe liegt im Vor-Commit `680653c`) und das **Restmaß zu N-3**
(1,37:1 zwischen „quiet + aktiv" und „quiet + gesperrt"; latent für die
Vorgabeknöpfe von `DateRangeField`).
