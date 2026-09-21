# 0191 · MirrorEntry — die DATEV-Spiegelbuchung bekommt ein Gesicht

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-21, fremde Abnahme steht aus |
| Stufe | `entities/datev-mirror-entry/` — neue Familie |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: `match_state`, Belegfeld 1, DATEV-Stapel und die Regel „gelesen, nie geschrieben" sind Ludwig- und DATEV-Fachlogik |
| Quelle | Owner-Entscheid vom 2026-09-21, überbracht von `ludwig-worker3` („Ja zu B-08") · Befund B-08 aus 0190 · Entitätsprofil `docs/entitaeten/datev-mirror-entry.md` (2026-09-11, fremd geprüft) |
| Ersetzt | `DatevHistoryCard` (`modules/accounting-cases/ui/sachverhalt/DatevHistoryCard.tsx`) samt der dort deklarierten `CaseDatevEntryVM` und `summarizeMirrorEntry`; später die Zeilen von `BuchungenTab` (zweite Welle) |
| Blockiert | die vier Spiegel-Stories 31–34 in 0190, die heute als Behelfs-Liste stehen |
| Setzt voraus | `AccountCell` ✓ · `StatusBadge` (Achse `mirror_match`) ✓ · `AmountCell`/`MonoCell` ✓ · `EntityIcon` `datev-mirror` ✓ |
| Spec von / am | Claude, 2026-09-21 |

## Ziel

Die Spiegelbuchung ist das, **was in DATEV steht** — gelesen, nie geschrieben.
Am Sachverhalt beantwortet sie eine Frage, die sonst niemand beantwortet: „was
hat die Kanzlei drüben aus unserem Export gemacht, und was hat sie ohne uns
gebucht?" Heute hat sie im Set kein Gesicht; die vier Fälle aus 0190 stehen als
Behelfs-Liste.

Diese Aufgabe baut die **erste Welle** der Familie: Vorschau, Zeile, Liste.

## Einordnung

**Regel 5 aus §3 greift** („neue Entitäts-Form, wenn das Profil sie führt"):
`docs/entitaeten/datev-mirror-entry.md` §Formen führt fünf Formen mit der Marke
**jetzt** — `MirrorEntryCell`, `MirrorEntryRow`, `MirrorEntryFacts`,
`MirrorEntryDrawer`, `MirrorEntryList`. Gebaut ist keine. `grep -rn "@when"
src/ui/v3` kennt keinen Export, der den Fall deckt: `JournalEntryCell` zeigt
**unsere** Buchung, nicht die drüben; `ReconciliationTable` (0161) stellt
Paare nebeneinander und braucht diese Form als rechte Seite.

## Zuschnitt

**Diese Welle: Cell, Row, List** in **einer** Datei
`src/ui/v3/entities/datev-mirror-entry/MirrorEntry.tsx` — eine Familie nach §4:
die drei teilen das Markup-Vokabular (Konten, Betrag, Abgleich-Badge) und die
Ableitung „welche Konten stehen im Soll, welche im Haben". Alle drei sind
Server-Komponenten; geschrieben wird hier nichts.

**Nicht in dieser Welle**, mit Grund:

| Form | warum später |
|---|---|
| `MirrorEntryFacts` (L) | braucht Ränge 10–14: Steuer je Zeile, Buchungssatz, Beleg in DATEV, Snapshot-Stichtage, Export-Referenz. Drei davon hängen an Relationen, die am Sachverhalt niemand aufmacht. Eigene Aufgabe, sobald das Konto-Detail sie zieht (J-27) |
| `MirrorEntryDrawer` (L) | ist `Drawer` + `MirrorEntryFacts`, also nach Facts |
| `MirrorEntryList` als **Listenseite** (`BuchungenTab`, J-20) | braucht `DataTable`, Serverfilter und Pagination bei 46.056 Sätzen — ein anderer Job als die Handvoll Zeilen am Fall. Kommt als `mirror-entry-columns.tsx`, wie bei Beleg und Zahlungskonto |

Die Liste dieser Welle ist die **kleine**: die Sätze zu **einem** Sachverhalt
(p50 1 · p90 2 · max 25 Nummern je Sachverhalt, Profil §Relationen). Keine
Pagination, kein Filter, keine Sortierung durch die Komponente.

## Schnittstelle

### `MirrorEntryVM` und `MirrorEntryLine`

Die Formen des Spiegelsatzes liegen in der App in der **Infrastruktur**
(`TruthEntryRow`, `TruthEntryDetail` in `datev-truth/infrastructure/`) und
werden deshalb nicht gespiegelt — das ist Befund **L-302**, bereits im
Register. Bis er erledigt ist, führt das Set die Sicht selbst, mit den Namen
der Spalten:

| Feld | Typ | Rang | Was |
|---|---|---|---|
| `id` | `string` | — | Schlüssel der Zeile |
| `description` | `string` | 1 | Buchungstext, max 60 Zeichen (DATEV schneidet selbst) |
| `amount` | `number` | 2 | Σ Soll, aus den Zeilen |
| `currency` | `Currency` | — | aus `src/ludwig/shared/money` |
| `lines` | `MirrorEntryLine[]` | 3 | p50 2 · p90 3 · max 5 |
| `postingDate` | `string` | 4 | Buchungstag, Kalendertag |
| `matchState` | `string` | 5 | Wert der Achse `mirror_match`; `string`, bis der Spiegel den Typ trägt (L-302) |
| `externalDocumentNumber` | `string \| null` | 6 | Belegfeld 1, nie gekürzt |
| `sequenceId` | `string \| null` | 7 | DATEV-Stapel |
| `sequenceCommitted` | `boolean` | 7 | festgeschrieben ja/nein |
| `caseNumber` | `string \| null` | 8 | Sachverhaltsnummer, 2 % gefüllt |
| `markOfOrigin` | `string \| null` | 9 | DATEV-Herkunft, **als Code**, bis L-304 die Wortliste vollständig in die Domäne bringt |
| `exportRef` | `string \| null` | 14 | LudwigAI-Referenz; ab L, in dieser Welle nur im Typ |
| `href` | `string \| null` | — | ohne ihn ist die Vorschau Text, kein Weg |

`MirrorEntryLine`: `side: "debit" \| "credit"` · `accountNumber: string` ·
`accountName?: string \| null` · `amount: number` ·
`contraAccountNumber?: string \| null` · `taxKey?: string \| null` ·
`taxRatePercent?: number \| null`. Die Zeile passt strukturell auf
`JournalLine` — dieselbe Grid-Form wie der Buchungssatz, sobald Facts kommt.

**`mirrorEntryAccounts(lines)`** gibt `{ debit: string[]; credit: string[] }`:
die Konten im Soll und im Haben, Gegenkonten eingerechnet und ohne Dubletten.
Die App rechnet das heute in `summarizeMirrorEntry` **in einer UI-Datei**
(`DatevHistoryCard.tsx:36`) — Befund **L-339**: die Ableitung gehört in die
Domäne, damit Liste, Nachlese und Konto dasselbe rechnen.

### `MirrorEntryCell` (XS)

| Prop | Typ | Vorgabe | Was | Nachweis |
|---|---|---|---|---|
| `entry` | `MirrorEntryVM` | — | Konten → Gegenkonten und Betrag (Ränge 2–3); Belegfeld 1 im `title` | `Filled` |
| `href` | `string` | `entry.href` | Weg zum Satz; ohne ihn ist die Zelle Text | `Filled` |

Zeigt **kein** Badge: in einer fremden Zeile ist der Abgleich nicht die
Aussage, sondern der Satz. Das DATEV-Zeichen steht davor, mit seinem Wort.

### `MirrorEntryRow` (S)

| Prop | Typ | Vorgabe | Was | Nachweis |
|---|---|---|---|---|
| `entry` | `MirrorEntryVM` | — | Ränge 1–7: Buchungstext, Betrag, Konten, Tag, Abgleich, Belegfeld 1, Stapel | `States` |
| `showCase` | `boolean` | `false` | Sachverhaltsnummer voran — nur in Listen außerhalb eines Falls (Rang 8) | `States` |
| `href` | `string` | `entry.href` | macht die Zeile zum Weg | `Interactive` |

### `MirrorEntryList` (L)

| Prop | Typ | Vorgabe | Was | Nachweis |
|---|---|---|---|---|
| `entries` | `readonly MirrorEntryVM[]` | — | die Sätze; **die Liste sortiert nicht**, der Aufrufer besitzt die Ordnung | `AtCase` |
| `showCase` | `boolean` | `false` | durchgereicht an die Zeile | `AtCase` |
| `empty` | `{ title: string; hint?: string }` | „Nichts in DATEV." | Leerfall als Satz mit Grund (L6) | `Empty` |
| `href` | `(entry) => string` | — | Weg je Zeile | `AtCase` |

**Was sie bewusst nicht tut:** keine Pagination, kein Filter, keine Sortierung
(das ist die Listenseite, zweite Welle) · keine Nachlese, also kein
Nebeneinander von Ludwig und DATEV (das ist `ReconciliationTable`, 0165) ·
**kein Schreibweg** — der Spiegel wird importiert, nicht bearbeitet, und
unscharfe Treffer bestätigt der Agent, nicht die Oberfläche (Profil, Frage 3).

### Dazu: B-09 — `CaseFacts` liest die Freigabe „Vorsteuer ohne Beleg"

Das Feld liegt bereits im Spiegel: `CaseDetail.vatWithoutDocumentApproval`
(`accounting-cases/domain/case-detail.ts`, Typ `VatWithoutDocumentApproval` mit
`approvedAt`, `approvedBy`, `reason`, `clarificationId`), und `CaseFactsVM`
erbt es über `Partial<CaseDetail>`. `CaseFacts` zeigt es nur nicht — reine
Set-Arbeit (Hinweis von `ludwig-worker3`, 2026-09-21).

Eine Zeile in den Stammdaten: **„Vorsteuer ohne Beleg"** → Tag der Freigabe,
dahinter der Grund; ohne Freigabe steht die Zeile **nicht** da (kein „—", denn
die Freigabe ist die Ausnahme, nicht ein leeres Feld). Die Rückfrage dazu
(`clarificationId`) bleibt in dieser Welle außen vor: der Weg dorthin gehört
der Seite, nicht den Fakten.

## Stories

Ableitung nach §6, Familie mit drei Formen:

| Form | Stories | warum |
|---|---|---|
| `MirrorEntryCell` | `Filled` · `Multileg` · `Edge` | gefüllt · der 41-%-Fall mit mehreren Konten je Seite · lange Texte und 60-Zeichen-Grenze |
| `MirrorEntryRow` | `States` · `WithCase` · `Interactive` | alle Werte der Achse nebeneinander (Enum-Prop) · `showCase` · `href` als Rundlauf |
| `MirrorEntryList` | `AtCase` · `Empty` · `Split` · `InUse` | gefüllt · leer mit Grund · das aufgeteilte Paar, das nur zusammen eine Aussage ist · im Einsatz in der Karte am Sachverhalt |

Zehn Stories, die Obergrenze. „Lädt" und „Fehler" entfallen mit Grund: die
Liste lädt nicht selbst (Daten kommen als Props, der Rahmen trägt das
Skelett), und einen Fehlerzustand hat ein gelesener Spiegel nicht — fehlt der
Import, ist die Liste leer und sagt das.

Dazu in `CaseFacts.stories.tsx` **eine** Story `VatWithoutDocument` für B-09.

## Abnahmekriterien

1. `MirrorEntryCell` zeigt Soll- und Habenkonten mit `AccountCell` und den
   Betrag; Belegfeld 1 steht im `title`, nicht in der Zeile (`Filled`).
2. Mehrere Konten je Seite stehen alle, ohne Dublette und mit den Gegenkonten
   verrechnet (`Multileg`) — `mirrorEntryAccounts` ist der Nachweis.
3. `MirrorEntryRow` zeigt die Ränge 1–7 und das Badge der Achse
   `mirror_match`; die Wörter kommen aus der Registry, nicht aus einer lokalen
   Map (`grep -n "KIND_META\|matched_ludwig:" src/ui/v3/entities/datev-mirror-entry` findet keine Wortliste).
4. `showCase` stellt die Sachverhaltsnummer voran, sonst steht sie nicht da
   (`WithCase` gegen `States`).
5. Ohne `href` enthält weder Zelle noch Zeile ein `<a>` (`States`).
6. `MirrorEntryList` mit leerer Liste zeigt den Satz mit Grund, keinen Strich
   (`Empty`).
7. Die Liste ändert die Reihenfolge der übergebenen Sätze nicht (`AtCase`:
   Reihenfolge der Fixture = Reihenfolge im DOM).
8. Kein Schreibweg: die Datei enthält kein `onChange`, kein `onSubmit`, keinen
   Button (`grep`).
9. `CaseFacts` zeigt „Vorsteuer ohne Beleg" mit Tag und Grund, wenn
   `vatWithoutDocumentApproval` gesetzt ist, und **keine Zeile**, wenn nicht
   (`VatWithoutDocument` gegen `Filled`).
10. Die vier Spiegel-Stories in 0190 (31–34) nutzen die neue Form statt der
    Behelfs-Liste; Eintrag 35 nutzt `CaseFacts`.
11. `pnpm typecheck`, `check:when`, `check:classes`, `check:language`,
    `check:icons` grün; jede Story im Browser angesehen, nichts in der Konsole.

## Offene Fragen

1. **Zeigt die Liste am Fall die aufgeteilten Teile als Gruppe?** Ohne
   Antwort: nein — jeder Teil ist eine Zeile mit seinem Badge, die Gruppe ist
   die Aussage der Nachlese (0165). Die Story `Split` zeigt, dass beide Teile
   zusammen den Ludwig-Betrag ergeben.
2. **Wird der DATEV-Stapel in der Zeile genannt oder nur in Facts?** Ohne
   Antwort: in der Zeile, wie im Profil (Rang 7, ab S) — festgeschriebene
   Stapel mit Zusatz, offene ohne.
3. **Nimmt die Zelle das DATEV-Zeichen oder das Wort „DATEV"?** Ohne Antwort:
   beides — Zeichen plus Wort, denn ein Icon ohne Wort gibt es hier nicht (T8).

## Ausbau

- `MirrorEntryFacts` und `MirrorEntryDrawer` (Ränge 10–14, Snapshots, Beleg in
  DATEV) als eigene Aufgabe, sobald das Konto-Detail sie zieht (J-27).
- Die Listenseite `BuchungenTab` als `mirror-entry-columns.tsx` mit
  `DataTable`, sobald der Filter „nur in DATEV" geklärt ist (Profil, Frage 1).
- `markOfOrigin` bekommt sein Wort, sobald L-304 die Liste vollständig in die
  Domäne bringt; bis dahin steht der Code.
- Die Nachlese (0165) setzt `MirrorEntryCell` als rechte Seite ein — damit ist
  die Vorschau schon jetzt für zwei Aufrufer gebaut.

## Stand des Baus (2026-09-21)

`src/ui/v3/entities/datev-mirror-entry/MirrorEntry.tsx` mit `MirrorEntryVM`,
`MirrorEntryLine`, `mirrorEntryAccounts`, `MirrorEntryCell`, `MirrorEntryRow`,
`MirrorEntryList`; Stile unter `.v3mir*`; zehn Stories unter
`v3/Entitäten/DATEV-Spiegel/MirrorEntry`. Barrel ergänzt.

Gemessen in `--states`: die fünf Beträge enden alle bei x = 564 — Betrag und
Badge haben je ihre Spalte (96 px / 160 px), sonst wandern die Zahlen mit der
Breite des Badges, wie in der Abnahme von 0040 gemessen.

**B-09 ist mit drin:** `CaseFacts` zeigt „Vorsteuer ohne Beleg · freigegeben am
20.03.2026 · <Grund>", wenn `vatWithoutDocumentApproval` gesetzt ist, und keine
Zeile, wenn nicht. Story `VatWithoutDocument`.

**0190 nachgezogen:** die Stories 31–34 nutzen `MirrorEntryList`, 35 nutzt
`CaseFacts`. Die Behelfs-Liste ist weg, Befund B-08 damit geschlossen.

Neuer Befund: **L-339** — die App rechnet die Konten einer Spiegelbuchung in
einer UI-Datei (`summarizeMirrorEntry` in `DatevHistoryCard.tsx`); die
Ableitung gehört in die Domäne, sonst rechnen Liste, Nachlese und Konto-Sicht
sie je selbst.

**Nächster Schritt, nicht in dieser Welle:** die Sachverhaltsseite zeigt die
Karte „In DATEV gebucht" noch nicht — dafür braucht das Szenario ein Feld
`mirrorEntries`, und das ist eine Änderung an 0152. Auf Zuruf.

## Nachtrag 2026-09-21 — die App bildet auf diese Sicht ab (F251)

Mit F251 (App `9048bce1`) liegt `CaseMirrorEntry` in
`datev-truth/domain/mirror-entry-vm.ts`, und `toMirrorEntryVM` übersetzt ihn
**in `MirrorEntryVM` dieses Sets**. Die Sicht bleibt also die des Sets; eine
zweite Form entsteht nicht. `summarizeMirrorEntry` ist drüben weg — **L-339
erledigt**, und L-302 für den Fall am Sachverhalt ebenso.

Owner-Entscheid (über `acto`): die App blendet die Karte „In DATEV gebucht"
bei leerer Liste aus (App `ad17bc98`). Der Leerzustand von `MirrorEntryList`
bleibt für andere Aufrufer; am Sachverhalt wird er nicht gebraucht.
