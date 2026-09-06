# 0065 · Wiedervorlage — „nicht jetzt" sichtbar machen

| | |
|---|---|
| Status | spec |
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
- **Grund ist Pflicht**, mindestens 10 Zeichen (DB-CHECK)
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

### Schnittstelle — was an `ClarificationCard` dazukommt

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `onDefer` | `(until: string, reason: string) => Promise<void>` | nein | Der zweite Ausgang. **Ohne die Prop kein Knopf** — dieselbe Regel wie bei `onResolve`: fehlt der Callback, fehlt der Weg | `Defer`, `Read` (ohne Knopf) |
| `deferMaxDays` | `number` | nein | Voreinstellung **30**. Das Datumsfeld begrenzt, nicht erst der Server | `Defer` |
| `deferLockedReason` | `string` | nein | Warum der Knopf gesperrt ist — er wird **gesperrt gezeigt, nicht versteckt**. Die Karte errechnet den Text nicht selbst: „ab der dritten Verschiebung nur noch ein Mensch" ist eine Regel über den Betrachter, und den kennt nur der Aufrufer | `DeferLocked` |

Am Anzeige-Typ (`ClarificationVM`, `Clarification.tsx`) ist nichts Neues
nötig: `deferredUntil` und `state = "deferred"` gibt es, die Zeile zeigt sie
schon, und `ClarificationEventKind` kennt `deferred` seit 0060.

Zwei Punkte fehlen dort und kommen als Befund (siehe unten): der **Zähler**
(`deferred_count`) und die **Gegenfrage** (`deferred_by_clarification_id`).

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

### Stories

Titel `v3/Entitäten/Klärung/ClarificationCard` — die bestehende Datei bekommt
**vier** Stories dazu (die Karte steht heute bei 6; §6 erlaubt 10):

| Story | Beweist |
|---|---|
| `Defer` | Der Rundlauf: Knopf → `ReasonDialog` mit `DateField` darüber → `onDefer(until, reason)`; das Feld lässt keinen Tag über 30 zu |
| `Deferred` | Der Zustand: Datum absolut, Grund dabei, Zähler ab der zweiten |
| `DeferLocked` | Der Knopf **gesperrt mit Grund**, nicht versteckt |
| `DeferredByQuestion` | Die Gegenfrage als Satz mit Link statt eines nackten Datums |

Der Fall „ohne `onDefer` kein Knopf" braucht keine eigene Story: er ist in
jeder bestehenden Story bewiesen, weil keine von ihnen die Prop setzt — die
Abnahme prüft ihn dort (Story `Read`).

### Abnahmekriterien

Fest: typecheck · build · Code englisch mit `@when`/`@instead` · kein Hex,
keine lokale Label-Map · alle Stories · §9 · im Browser angesehen.

Variabel:

- [ ] Ohne `onDefer` erscheint kein Knopf (Story `Read`, `grep`)
- [ ] Das Datumsfeld lässt keinen Tag mehr als 30 Tage voraus zu (Story `Defer`, gemessen: `max`-Attribut am `input`)
- [ ] Der Grund ist Pflicht; der Knopf im Dialog bleibt ohne ihn gesperrt (Story `Defer`, gemessen)
- [ ] Die Sperre ab der dritten Verschiebung ist **sichtbar und begründet**, nicht versteckt (Story `DeferLocked`)
- [ ] Das Wiedervorlage-Datum steht absolut, nie relativ (Story `Deferred`, gemessen)
- [ ] Der Zustand kommt aus der Registry (`klaerung_status`), kein eigenes Wort (`grep`)
- [ ] Eine Wiedervorlage an einer Gegenfrage nennt die Gegenfrage (Story `DeferredByQuestion`)
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
