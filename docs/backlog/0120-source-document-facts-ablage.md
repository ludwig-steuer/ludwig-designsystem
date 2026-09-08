# 0120 · Beleg-Fakten: DATEV-Ablage, Konfidenz, manuelle Korrektur

| | |
|---|---|
| Status | fertig — schlanke Abnahme 2026-09-08, M1–M4 nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/source-document/` — Nachtrag an `SourceDocumentFacts` (0076) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: DATEV-Ablage und Einordnungs-Konfidenz sind Ludwig-Fachbegriffe |
| Quelle | Anfrage `ludwig-manager` 2026-09-08 nach dem Umbau von `documents/[sourceDocId]` (App-Commit `c9fca3aa`); Entitätsprofil `docs/entitaeten/source-document.md` Ränge 13, 14, 16; Seitenprofil `docs/seiten/beleg-detail.md` Rang 5 |
| Ersetzt | die `FieldList`, die die App heute unter die zwei Spalten setzt |
| Setzt voraus | `SourceDocumentFacts` (0076, fertig) — und für zwei der drei Punkte **L-217** |
| Spec von / am | Claude, 2026-09-08 |

## Warum das ins Set gehört und nicht in die Seite

Die Frage von `ludwig-manager` war: kleines Paket an 0076, oder bleibt es
App-Komposition? Drei Gründe für das Set, alle aus dem, was schon
entschieden ist:

1. **Das Entitätsprofil führt alle drei mit Rang und Form** — Konfidenz 13
   (100 % gefüllt, ab M), manuell korrigiert 14 (3 %, ab L), DATEV-Ablage 16
   (65 %, ab L). Ein Datenpunkt mit Rang und Form ist Sache der Form.
2. **`SourceDocFactsCard` zeigt sie heute schon** (Profil §4: „Konfidenz,
   DATEV-Ablage"), und 0076 ist genau deren Ablösung. Eine `FieldList`
   daneben löst sie nicht ab, sie verdoppelt sie.
3. **Das Seitenprofil nennt die DATEV-Ablage in Rang 5** („Kann ich den
   einen falschen Wert hier korrigieren?") — zusammen mit Belegdatum,
   Einordnung und Erledigung, die alle drei schon in `SourceDocumentFacts`
   stehen. Ein Wert dieser Reihe, der woanders wohnt, ist die zweite
   Wahrheit, gegen die die Dreiteilung gebaut ist.

**Kein neuer Baustein**: `spec-schreiben` §3 Regel 2 — ein `@when` deckt den
Fall zu vier Fünfteln, das Fehlende ist eine Designentscheidung, die
wiederkommt (Karte **und** Drawer zeigen dieselben Fakten).

## Was dazukommt

| Punkt | Quelle | Ab Form | Darstellung |
|---|---|---|---|
| Einordnungs-Konfidenz (`classConfidence`) | steht im VM | M | Eine **Zahl** mit Prozentzeichen, kein Badge: die Achse `konfidenz` gehört dem Buchungsvorschlag (L-80, entschieden mit 0070) |
| Von Hand korrigiert (`classOverriddenAt`) | **fehlt im VM → L-217** | L | Ein Datum mit Wort: „Einordnung am 30.08.2026 von Hand korrigiert." Der Spaltenkommentar sagt „is not null → Hinweis", also ist die Zeile nur da, wenn der Wert steht |
| DATEV-Ablage (`datevRefSystem` · `datevRefFolder` · `datevRefId`) | **fehlen im VM → L-217** | L | Eine Zeile, drei Teile mit Trenner; die Kennung `mono` (sie wird Zeichen für Zeichen gelesen). Fehlt sie ganz (35 %), fehlt die Zeile |

## Schnittstelle

Eine Prop, nicht drei — die drei Punkte sind **eine** Frage („woher kommt
die Einordnung, wo liegt der Beleg"), und drei Booleans wären der Zuschnitt,
den §5 verbietet:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `provenance` an `SourceDocumentFacts` | `boolean` | nein, ohne sie kein Block | Zeigt die drei Punkte als vierten Block unter den generischen Zeilen | `WithProvenance` (`SourceDocumentFacts.stories.tsx:59`) |
| `provenance` an `SourceDocumentCard` | `boolean` | nein | Reicht durch — ohne sie wäre der Block von außen nicht erreichbar (Nacharbeit) | `WithProvenance` (`SourceDocumentCard.stories.tsx:109`) |
| `provenance` an `SourceDocumentDrawer` | `boolean` | nein | Reicht durch, an beide Formen des Drawers | über die Karte belegt |

**Keine der drei trägt eine geschriebene Vorgabe.** Ohne die Prop ist der
Block weg, und wer ihn will, setzt sie — die Form entscheidet das nicht für
den Aufrufer. Die frühere Fassung dieser Zeile behauptete eine Staffelung
nach Größe (`false` in der Karte, `true` im Detail); die gibt es nicht und
gab es nie.

Die Werte kommen aus `document`, nicht als eigene Props: sie stehen im VM
(bzw. werden es mit L-217), und eine Form, die ihre Werte von außen bekommt,
obwohl sie die Zeile schon hat, ist eine Durchreiche.

**Kann bewusst nicht:**

- **Die Einordnung ändern.** Das ist eine Folgeaufgabe zu 0071, wie schon in
  `beleg-detail.md` Rang 5 vermerkt.
- **Die DATEV-Meta importieren.** Das ist `DatevMetaImportPanel`, ein Menüweg
  der Seite (`beleg-detail.md`, Nebenjobs).
- **Die Konfidenz einfärben.** Sie ist eine Zahl ohne Achse (L-80).

## Stories

Abgeleitet nach §6: 0 neue Zustände (die fünf hat 0076) + 1 Layout-Boolean
(`provenance`) + 1 Rand (alle drei leer — die Zeilen fehlen, es steht kein
Gedankenstrich da) = **2**.

| Story | Beweist |
|---|---|
| `WithProvenance` | Die drei Zeilen unter den generischen, in der Ordnung des Profils |
| `ProvenanceEmpty` | 35 % ohne DATEV-Ablage und 97 % ohne Korrektur: die Zeilen **fehlen**, statt leer dazustehen |
| `WithProvenance` an der Karte (`SourceDocumentCard.stories.tsx:109`) | Dass die Prop durch die Karte kommt — die Nacharbeit desselben Tages |

## Abnahmekriterien (variabler Block)

- `provenance` verhält sich wie Zeile 1 der Schnittstelle (`WithProvenance`)
- Die Konfidenz steht als Zahl ohne Badge und ohne Farbe (`WithProvenance`)
- Eine fehlende DATEV-Ablage lässt die Zeile weg, sie zeigt keinen Strich
  (`ProvenanceEmpty`)
- „Von Hand korrigiert" erscheint nur bei gesetztem Wert (`ProvenanceEmpty`)
- Die Kennung der Ablage ist `mono` (`WithProvenance`)
- Ersetzt die `FieldList` unter den zwei Spalten in
  `documents/[sourceDocId]` ohne Funktionsverlust

## Offene Fragen

1. Trägt die DATEV-Ablage ein Etikett je Teil (System · Ordner · Kennung)
   oder eine Zeile mit Trennern? *Ohne Antwort: eine Zeile mit `·`, wie die
   Einordnung sie schon setzt.*
2. Wartet der Bau auf L-217 oder wird die Konfidenz vorgezogen? *Ohne
   Antwort: warten — zwei Drittel der Aufgabe hängen daran, und eine Form,
   die einen Punkt zeigt und zwei schuldig bleibt, wird zweimal abgenommen.*

## Ausbau

`provenance` ist der Platz, an dem später die Herkunft **je Feld** stünde
(`field_provenance`, heute im Schema unbeschrieben — L-214). Käme sie, würde
aus dem Boolean ein Enum (`"summary" | "per-field"`); vorher nicht.

## Gebaut 2026-09-08

`provenance?: boolean` an `SourceDocumentFacts`; die drei Punkte stehen als
vierter Block „Herkunft und Ablage" unter den allgemeinen Zeilen. Zwei
Stories, beide im Browser gemessen.

**Jeder Punkt entscheidet für sich, ob er eine Zeile bekommt** — das ist die
eine Entscheidung dieses Nachtrags:

| Punkt | Wann eine Zeile | Warum |
|---|---|---|
| Konfidenz | immer (100 % gefüllt) | Eine **Zahl** mit Prozentzeichen, kein Badge: die Achse `konfidenz` gehört dem Buchungsvorschlag (L-80) |
| Von Hand korrigiert | nur bei gesetztem Wert (3 %) | Der Spaltenkommentar sagt es so. Eine leere Zeile machte aus „niemand hat es angefasst" ein „wir wissen es nicht" |
| DATEV-Ablage | nur wenn mindestens ein Teil steht (65 %) | Drei Spalten, **eine** Zeile mit `·` — sonst müsste der Leser sie zusammensetzen. Ein Beleg ohne Ablage ist kein Beleg mit unbekannter Ablage |

**Gemessen** (`scripts/cdp.mjs`):

| Story | Gemessen |
|---|---|
| `WithProvenance` | Block da, „Konfidenz 94 %", „Von Hand korrigiert", „DATEV-Ablage DUO · 2026/08 · DOC-4471-0088" |
| `ProvenanceEmpty` | Block da mit **einer** Zeile: nur die Sicherheit. Kein Gedankenstrich, keine leere Zeile |
| `Filled` | Ohne die Prop kein Block — die Karte (M) bleibt, wie sie war |

**Die Felder stehen vorerst lokal.** `classOverriddenAt` und die drei
`datevRef*` sind mit App-Commit `ae0e1a63` gebaut (L-217, erledigt), aber der
Spiegel ist bis zur Migration eingefroren. Sie liegen deshalb in
`SourceDocumentVM` neben den vier anderen Feldern, die dort aus demselben
Grund stehen, und fallen beim nächsten `pnpm sync:ludwig` — vermerkt in
`docs/spiegel-vormerkungen.md`. **Nicht** in `docs/ludwig/README.md`: die
Datei wird von `scripts/sync-ludwig.sh` bei jedem Lauf neu geschrieben, ein
Vermerk darin hielte genau bis zu dem Lauf, vor dem er warnen soll.

Offene Frage 1 ist damit beantwortet (eine Zeile mit `·`, wie die Vorgabe);
Frage 2 hat sich erledigt, weil L-217 vor dem Bau kam.

**Was die App wissen muss:** nur `sourceDocumentFromDispatch` füllt die vier
Felder, die Listen-Mapper nicht. Das reicht — `provenance` ist eine Prop der
Detailform, und in der Liste hat keiner der drei Punkte einen Rang unter 13.

## Nacharbeit 2026-09-08 — die Prop war von außen nicht erreichbar

**Befund der App:** `provenance` hing an `SourceDocumentFacts`, aber weder
`SourceDocumentCard` noch `SourceDocumentDrawer` reichten sie durch. Von der
Belegseite aus war der Block damit nicht zu erreichen.

Der Befund stimmt, und die Ursache ist eine falsche Annahme dieser Spec.
Sie schrieb „`false` in der Karte (M), `true` im Detail und im Drawer (L)" —
als stünde die Karte neben der Detailform. Die Kette ist aber:

```
SourceDocumentView  →  (Aufrufer setzt)  SourceDocumentCard  →  SourceDocumentFacts
SourceDocumentDrawer  →                  SourceDocumentCard  →  SourceDocumentFacts
```

**Jeder** Weg zu den Fakten läuft über die Karte — sie ist nicht die Form M
neben dem Detail, sondern dessen Rumpf. „Die Karte zeigt es nicht" war
deshalb keine Größenregel, sondern ein Denkfehler.

**Gebaut (Vorschlag (a) des Managers):**

- `SourceDocumentCard.provenance?: boolean`, durchgereicht an die Fakten.
  Vorgabe `false`, **weil die Karte nicht weiß, wo sie steht** — nicht, weil
  eine Karte den Block nicht zeigen dürfte. Der Aufrufer entscheidet.
- `SourceDocumentDrawer.provenance?: boolean`, durchgereicht an die Karte.
  Vorgabe ebenfalls `false`, und das ist hier zusätzlich eine **Empfehlung**:
  der Drawer beantwortet die eine Frage, die woanders aufkam (0052), und „wo
  liegt der Beleg in DATEV" ist nicht diese Frage — wer sie stellt, ist schon
  auf dem Beleg. Sie ist trotzdem eine Prop und kein festes `false`, weil der
  Drawer dieses Urteil nicht besitzt: eine Seite, deren Arbeit die Ablage
  **ist**, darf ihn hier wollen.
- `SourceDocumentView` bekommt **nichts**: er baut die Karte nicht selbst,
  sondern nimmt sie als `children`. Wer den View füllt, setzt die Prop an der
  Karte.

**Story `WithProvenance` an der Karte**, gemessen: Block da, „94 %",
„DOC-4471-0088"; in `Filled` keins davon. Der Drawer bekommt keine eigene
Story — er reicht die Prop nur weiter, wie er es mit `group` und `tone` schon
tut, und eine Story, die sie dort auf `true` setzt, würde der Empfehlung
widersprechen.

`pnpm typecheck` und die fünf Wächter auf Exit 0.

## Abnahme (2026-09-08) — schlanke Abnahme (Schnittstelle)

Von einem Agenten geprüft, der nicht gebaut hat, gegen Spec und Code. **Kein
Storybook, nichts gemessen**: Pixel, Abstände und Farbwirkung sind auf **0119**
vertagt (Owner-Entscheid 2026-09-08).

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `typecheck` und die Wächter grün | `pnpm typecheck` Exit 0; `check:icons`, `check:contrast`, `check:when`, `check:language`, `check:jobs`, `check:mirror` alle Exit 0 (`pnpm build` nicht gelaufen — schlanke Abnahme) | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `SourceDocumentFacts.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Beleg/SourceDocumentFacts` (Story-Datei Z. 11); Karte ebenso (`SourceDocumentCard.stories.tsx:9`); Barrel `src/ui/v3/index.ts:337, 351, 355` | ✓ |
| Code englisch, `@when`/`@instead` an jedem Export | `check:language` und `check:when` Exit 0; `SourceDocumentFacts.tsx:77`, `SourceDocumentCard.tsx:69`, `SourceDocumentDrawer.tsx:65` | ✓ |
| Kein Hex, kein px, keine Label-Map, Status nur über Registry | `provenanceBlock` (`SourceDocumentFacts.tsx:226–244`) trägt keine Farbe, keine Klasse, kein Hex; die Konfidenz bleibt bewusst eine Zahl und kein Achsenwert (L-80) | ✓ |
| Alle Stories vorhanden, ausgeschlossene begründet | `WithProvenance` und `ProvenanceEmpty` (`SourceDocumentFacts.stories.tsx:59, 74`) stehen; die dritte Story der Nacharbeit (`SourceDocumentCard.stories.tsx:109`) steht in keiner Tabelle | **M2** |
| Prüfliste §9 | siehe unten | ✓ bis auf **M3** |
| Im Browser angesehen | vertagt | vertagt auf 0119 |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `provenance` verhält sich wie Zeile 1 der Schnittstelle (`WithProvenance`) | Prop da und richtig getippt (`SourceDocumentFacts.tsx:121` — `provenance?: boolean`, optional), der Block steht als vierter unter den allgemeinen Zeilen (Z. 203–205), Reihenfolge 13 · 14 · 16 wie im Profil (Z. 228, 231, 239). **Aber** Zeile 1 beschreibt eine Kette, die es nicht gibt („`false` in der Karte (M), `true` im Detail"), und nennt die zwei Props der Nacharbeit nicht | **M1** |
| Konfidenz als Zahl, ohne Badge und ohne Farbe (`WithProvenance`) | `SourceDocumentFacts.tsx:228–230` — `${Math.round(v * 100)} %` als Text, kein `StatusBadge`, keine Klasse; `tnum` und rechtsbündig bringt die Wertespalte mit (`src/styles/v3.css:761`) | ✓ |
| Fehlende DATEV-Ablage lässt die Zeile weg, kein Strich (`ProvenanceEmpty`) | `SourceDocumentFacts.tsx:239–242` (`filter(Boolean)`, `length > 0`); die Story setzt alle drei Felder auf `null` (`SourceDocumentFacts.stories.tsx:74–89`) und rendert keinen Ersatzwert | ✓ |
| „Von Hand korrigiert" nur bei gesetztem Wert (`ProvenanceEmpty`) | `SourceDocumentFacts.tsx:231` — `if (d.classOverriddenAt)`, sonst keine Zeile | ✓ (Wortlaut: **M3**) |
| Die Kennung der Ablage ist `mono` (`WithProvenance`) | `SourceDocumentFacts.tsx:241` — `MonoCell` über die ganze Zeile (`DUO · 2026/08 · DOC-4471-0088`), nicht nur über die Id; die Vorgabe aus Offener Frage 1 (eine Zeile mit `·`) ist damit umgesetzt | ✓ |
| Ersetzt die `FieldList` unter den zwei Spalten in `documents/[sourceDocId]` | nicht Gegenstand dieses Repos (`docs/backlog/README.md`) | offen (App) |

**Prüfliste §9** (die zwei App-Punkte übersprungen, die gemessenen auf 0119)

Stufe und Importrichtung stimmen (Fakten → `primitives/`, `patterns/`, sonst
nur der Spiegel) · kein Hex, kein px, keine lokale Label-Map · Zahlen rechts
mit `tnum` durch `.v2fields__row > span:last-child` (`v3.css:761`), Text links
· kein farbiger Zustand im neuen Block, also keine Registry-Pflicht — die
Konfidenz ist absichtlich keine Achse (L-80) · kein Icon ohne Wort (der Block
trägt keins) · Sie-Form nicht berührt, drei Substantiv-Etiketten · GLOSSARY:
„DATEV-Ablage" folgt dem Eintrag *DATEV-Ablage-Referenz*, „Konfidenz"
folgt nichts — **M3**.

**Story-Deckung.** §6 auf die **gebaute** Schnittstelle: 0 neue Zustände + 1
Layout-Boolean an den Fakten + 1 Rand + 1 Layout-Boolean an der Karte
(Nacharbeit) = **3**. Gebaut sind 3, die Zusammensetzung stimmt. Dass der
Drawer keine eigene Story bekommt, ist begründet (er reicht durch, wie bei
`group` und `tone`). Die Tabelle „Stories" nennt weiter 2 — **M2**.

### Mängel

**M1 — die Schnittstellen-Tabelle beschreibt eine Prop, gebaut sind drei, und
die eine steht falsch da.** Die Tabelle (Abschnitt „Schnittstelle") führt nur
`SourceDocumentFacts.provenance` und sagt dazu „`false` in der Karte (M),
`true` im Detail und im Drawer (L)". Die Nacharbeit desselben Tages widerlegt
genau diesen Satz — jeder Weg zu den Fakten läuft über die Karte — und baut
zwei weitere Props: `SourceDocumentCard.tsx:64` und
`SourceDocumentDrawer.tsx:104`, beide `provenance?: boolean`, beide
durchgereicht (`SourceDocumentCard.tsx:116`, `SourceDocumentDrawer.tsx:140`).
Sie stehen nur im Fließtext der Nacharbeit, nicht in der Tabelle. Wer von
außen gegen das Set baut, liest die Tabelle: er sieht eine Prop an der
falschen Stelle und den Satz, dass die Karte den Block nicht zeigt. Kleinster
Weg: drei Zeilen in der Tabelle (Fakten · Karte · Drawer), Spalte „Bedeutung"
der ersten Zeile auf „der Aufrufer entscheidet" korrigiert.
*Nebenbefund derselben Zeile:* „Vorgabe `false`" ist nirgends geschrieben —
alle drei Stellen destrukturieren `provenance` ohne Vorgabewert
(`SourceDocumentFacts.tsx:90`, `SourceDocumentCard.tsx:87`,
`SourceDocumentDrawer.tsx:81`). Das Verhalten ist dasselbe (`undefined` ist
falsy), der Vertrag steht aber nur in der Prosa.

**M2 — die Story-Tabelle nennt zwei Stories, gebaut sind drei.**
`SourceDocumentCard.stories.tsx:109` (`WithProvenance` an der Karte) ist die
Story, die die Prop der Nacharbeit beweist — die Tabelle „Stories" kennt sie
nicht. Praktisch: die Ableitung nach §6 geht nicht mehr auf, und wer die
Story-Deckung nachrechnet, meldet eine Story zu viel statt eine Zeile zu
wenig.

**M3 — derselbe Wert heißt im Set jetzt zweimal anders.**
`SourceDocumentFacts.tsx:229` beschriftet `classConfidence` mit
„Erkennungssicherheit"; die Spaltenfassung derselben Entität schreibt
„Konfidenz" (`source-document-columns.tsx:485`), ebenso das Muster
`Confidence` (`Confidence.stories.tsx:66, 115`), das Entitätsprofil
(„Einordnungs-Konfidenz", Rang 13) und diese Spec selbst (Abschnitt „Was
dazukommt"). „Erkennungssicherheit" kommt genau einmal im ganzen `src/` vor.
Wer Liste und Beleg nebeneinander sieht, hält zwei Prozentzahlen für zwei
Größen. Dasselbe in klein: die Zeile heißt im Code „Von Hand korrigiert",
Spec und Abnahmekriterium sagen „Manuell korrigiert", und die Darstellung
ist eine Etikett-Wert-Zeile mit Datum, nicht der Satz „Einordnung am
30.08.2026 von Hand korrigiert.", den „Was dazukommt" beschreibt. Kleinster
Weg: ein Wort wählen (die Mehrheit im Set sagt „Konfidenz") und Spec und Code
darauf ziehen.

**M4 — der Vermerk über die lokalen Spiegelfelder steht in der falschen
Datei.** Der Abschnitt „Gebaut" sagt, die vier vorgezogenen Felder seien „in
`docs/ludwig/README.md`" vermerkt. Dort steht nichts davon, und dort könnte
auch nichts stehen: `scripts/sync-ludwig.sh:92` macht `rm -rf docs/ludwig`
und schreibt die README bei jedem Lauf neu — die Datei sagt das selbst und
verweist auf `docs/spiegel-vormerkungen.md`. Genau dort steht der Vermerk
tatsächlich (Z. 37–38, mit `classOverriddenAt` und den drei `datevRef*`).
Praktisch: wer beim nächsten `pnpm sync:ludwig` nachliest, was verloren geht,
schaut an die Stelle, die gerade gelöscht wurde. Kleinster Weg: den Dateinamen
in der Spec austauschen.

Abgenommen von / am: fremder Agent (Claude), 2026-09-08 · Offene Punkte: M1,
M2, M3, M4 — alle in der Spec bzw. im Wortlaut, keiner im Verhalten. Kein
Kriterium ist am Gebauten gescheitert.

## Nacharbeit zur Abnahme, 2026-09-08

Vier Mängel, keiner im Verhalten. Dreimal gab die Spec nach, einmal der Code.

| Mangel | Wer gab nach | Was jetzt dasteht |
|---|---|---|
| **M1** die Tabelle nannte eine Prop, gebaut sind drei | Spec | Drei Zeilen. Der Satz über die Vorgaben ist gestrichen: er beschrieb eine Staffelung nach Größe, die es nie gab |
| **M2** die Story der Nacharbeit stand in keiner Tabelle | Spec | Sie steht in „Stories"; die Ableitung nach §6 geht wieder auf |
| **M3** derselbe Wert hieß zweimal anders | **Code** | `SourceDocumentFacts.tsx` schreibt „Konfidenz" wie die Spalte, das Muster und das Profil. „Von Hand korrigiert" bleibt und heißt jetzt auch in der Spec so |
| **M4** der Vermerk stand in einer generierten Datei | Spec | `docs/spiegel-vormerkungen.md`, mit dem Grund daneben |

**Warum bei M3 der Code nachgab und nicht die Spec.** „Erkennungssicherheit"
kam genau einmal im ganzen `src/` vor, „Konfidenz" überall sonst — in der
Spalte derselben Entität, im Muster `Confidence`, in der Registry-Achse
`konfidenz`, im GLOSSARY („Konfidenz-Band") und im Entitätsprofil. Bei einer
Mehrheit dieser Größe ist das einzelne Wort der Fehler, auch wenn es das
schönere ist.

**Warum umgekehrt „Von Hand korrigiert" blieb.** Hier stand kein Hausbegriff
gegen einen Ausreißer, sondern ein Datenpunkt-Name („Manuell korrigiert", so
heißt die Spalte im Profil) gegen ein UI-Etikett. Der Datenpunkt darf im
Profil heißen, wie die Spalte heißt; was der Mensch liest, ist die andere
Frage, und dort gewinnt das gewöhnlichere Deutsch. Die Spec sagte beides —
das war der eigentliche Mangel.

**Was M1 nicht war.** „Eine Prop, nicht drei" im Kopf des Abschnitts bleibt
richtig: gemeint sind die drei *Punkte* (Konfidenz, Korrektur, Ablage), die
sich eine Prop teilen, nicht die drei *Formen*, die sie durchreichen.
