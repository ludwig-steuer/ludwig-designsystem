# 0084 · CasePicker — einen bestehenden Sachverhalt auswählen

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
| Freigabe | 2026-09-07, ludwig-coordinator im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CasePicker`) und „Heutige Darstellung" (letzte Zeile) |
| Auftrag | Die Auswahl eines bestehenden Sachverhalts, wenn eine Bankzeile ihm zugeordnet wird. Ersetzt den `<select>` in `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (Z. 376–388), der heute „Nummer · Art · 40 Zeichen Zusammenfassung" in eine Optionszeile presst. |
| Warum nicht so lassen | Bei p90 **190 offenen Sachverhalten** je Mandant und Jahr (Staging 2026-09-05) ist ein `<select>` keine Auswahl, sondern eine Liste. Und man wählt blind: Zustand, Betrag und Gegenpart stehen nicht in der Option. |
| Vertagt, weil | die Suchachse offen ist — Offene Frage 3 des Profils. *Ohne Antwort gilt der Default:* `Combobox` mit Suche über Nummer, Gegenpart und Zusammenfassung; die Trefferzeile trägt Rang 1–5. Entschieden wird das hier, nicht im Profil. |
| Setzt voraus | `CaseRow` bzw. `CaseCell` (erste Welle) · `Combobox` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`)

## Ziel

Einen bestehenden Sachverhalt auswählen, wenn eine Bankzeile ihm zugeordnet
wird. Heute steht dort ein `<select>` mit einer Optionszeile aus „Nummer ·
Art · 40 Zeichen Zusammenfassung"
(`modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx`
Z. 376–388). Bei p90 **190 offenen Sachverhalten** je Mandant und Jahr ist das
keine Auswahl, sondern eine Liste ohne Suche — und man wählt blind: Zustand,
Betrag und Gegenpart stehen nicht in der Option.

## Einordnung

**Klasse `entities/accounting-case/`.** Der Test aus §2 („Ergäbe die
Komponente auch in einer Versicherungs-App Sinn?") fällt negativ aus: die
Trefferzeile trägt Sachverhaltsnummer, Art und Bearbeitungsstand, sie liest
`CaseListItem` aus `src/ludwig/` und die Achse `sachverhalt` aus der Registry.
Die allgemeine Form — tippen, eingrenzen, mit den Pfeiltasten laufen, mit
Enter nehmen — ist die Primitive `Combobox` (0009) und bleibt dort.

**Regel aus §3, die griff: Nr. 5** — eine neue Entitäts-Form. Das
Entitätsprofil führt `CasePicker` unter „Formen"; keine vorhandene Form deckt
den Fall ab: `CaseCell` ist ein **Link** in einer fremden Zeile (sie führt
weg, statt zu wählen), `CaseRow` ist die Zeile einer Liste ohne Suche, und
`Combobox` allein kennt keine Sachverhalte.

**Die Combobox wird nicht erweitert — aber der Picker filtert selbst.**
Naheliegend wäre Regel Nr. 2: eine Prop, damit die Trefferzeile eine Plakette
tragen kann. Dafür greift sie nicht — §3 verlangt **zwei** geplante
Verwendungen oder eine Design-Vorlage, und es gibt weder das eine noch das
andere. Der Bearbeitungsstand steht deshalb als **Wort** in der `hint`; V7
verlangt zu jeder Farbe ein Wort oder ein Zeichen, ein Wort allein ist die
zulässige Sparform, und es kommt aus `resolveStatus("sachverhalt", …).label`
(`src/ludwig/ui/status/status-registry.ts`), nicht aus einer lokalen Map.

Für die **Suche** trägt dieselbe Begründung nicht (Freigabe 2026-09-07):
`Combobox` filtert lokal nur `label` und `value`. Die Nummer steht im `hint`
und würde nicht gefunden, die Zusammenfassung steht nirgends — ein Picker, der
nach der Nummer nicht findet, ist keiner. **Der Picker filtert deshalb selbst**
über Anzeigename, Nummer, Gegenpart und Zusammenfassung und reicht der
Combobox nur die Treffer. `ComboboxOption.keywords` wäre der andere Weg; er
bleibt Ausbau, bis `AccountField` als zweiter Nutzer kommt — dann für beide.

**Zuschnitt: eine Datei, ein Export.** `CasePicker.tsx` neben `CaseCell.tsx`
und `CaseRow.tsx`. Kein zweiter Export: die Trefferzeile ist eine Funktion
über `CaseListItem`, kein Baustein, den jemand allein braucht — sie hat kein
eigenes `@when`.

## Schnittstelle

Daten kommen als Props, der Picker lädt nichts. Typen aus `src/ludwig/`:
`CaseListItem` und `caseDisplayTitle()` (`modules/accounting-cases/domain/case.ts`),
`Currency` aus dem Geld-Modul, die Achse `sachverhalt` aus
`patterns/status-registry.ts`.

| Prop | Typ | Bedeutung | Story |
|---|---|---|---|
| `label` | `string` | Beschriftung des Feldes; die Seite entscheidet, ob dort „Sachverhalt" oder „Zuordnen zu" steht | `Filled` |
| `value` | `string \| null` | die gewählte `caseId`, `null` heißt „noch keiner" | `Roundtrip` |
| `onChange` | `(caseId: string \| null) => void` | Auswahl und Abwahl — der Aufrufer schreibt, der Picker hält nichts | `Roundtrip` |
| `cases` | `readonly CaseListItem[]` | die Treffer, fertig sortiert und gefiltert vom Aufrufer | `Filled` |
| `onSearch` | `(query: string) => void` (optional) | Für die Serversuche. Der Picker filtert **immer selbst** über Anzeigename, Nummer, Gegenpart und Zusammenfassung; `onSearch` sagt dem Aufrufer nur, wonach gesucht wird, damit er nachladen kann | `ServerSearch` |
| `loading` | `boolean` (optional) | die Suche läuft; das Feld bleibt bedienbar | `Loading` |
| `error` | `string` (optional) | die Suche ist gescheitert — der Satz steht am Feld, nicht in der Liste | `Error` |
| `disabled` | `boolean` (optional) | die Zeile ist schon zugeordnet oder gesperrt | `Filled` (zweiter Picker) |
| `emptyText` | `string` (optional) | Vorgabe „Kein Sachverhalt mit diesem Suchbegriff." — der Fall **nach** der Suche | `EmptyAfterFilter` |
| `noCasesText` | `string` (optional) | Vorgabe für den Fall **ohne** Bestand: das Jahr hat noch keinen Sachverhalt. Zwei Sätze, weil `cases.length === 0` zwei Dinge heißen kann — „nichts gefunden" ist ein Suchergebnis, „noch keiner da" ein Zustand des Jahres (ergänzt 2026-09-08, M2) | `Empty` |

**Die Trefferzeile** trägt die Ränge 1–5 des Profils *(die Spec sagte an zwei
Stellen „1–4"; gebaut sind fünf, und das Profil führt fünf — berichtigt
2026-09-08)*, und zwar in dieser
Verteilung:

- `label` = **Anzeigename** (Rang 1) über `caseDisplayTitle({ title, kind, counterpartyName })`.
  Nicht `title` allein: er ist zu 53 % gefüllt, und die Rückfallkette ist die
  eine Regel des Sets (Profil Rang 1, Befund L-52) — die Komponente baut sie
  nicht selbst nach.
- `hint` = **Kennung** (Rang 3) · **Bearbeitungsstand als Wort** (Rang 2) ·
  **Betrag** (Rang 4) · **Gegenpart**, wenn er nicht schon im Label steckt,
  getrennt durch „ · ". Die Kennung kommt aus `caseIdentifier()` und steht
  vorn, weil man nach ihr sucht: die Nummer, und wo sie fehlt, die ersten acht
  Zeichen der id — ein Sachverhalt ohne Nummer bleibt so benennbar, und auch
  der heutige `<select>` zeigt die Kurz-ID. Ein Gedankenstrich stünde hier für
  „unbekannt" und wäre falsch. Der **Gegenpart** erscheint genau dann, wenn
  `title` gesetzt ist — sonst steckt er über die Rückfallkette bereits im
  Label (Entscheid 3 der Freigabe). Der **Betrag** entfällt, wo `totalAmount`
  fehlt (48 %); seine Währung kommt aus `case.currency` über `asCurrency()`
  (`shared/money.ts`), nicht aus einer Prop — jeder Fall trägt seine eigene.
- `group` bleibt leer. Eine Gruppierung nach Zustand oder Zuständigkeit wäre
  eine zweite Ordnung neben der Sortierung des Aufrufers; welche gilt, weiß
  die Seite, nicht der Picker (Ausbau).

**Kann bewusst nicht:**

- **Einen Sachverhalt anlegen.** „Neuer Sachverhalt" ist eine Handlung mit
  Folgen, keine Auswahl; sie gehört neben das Feld, nicht hinein.
- **Mehrere wählen.** Eine Bankzeile wird einem Sachverhalt zugeordnet; die
  Aufteilung auf mehrere ist ein eigener Vorgang (`BankTransactionRow`,
  Aufteilungszeile).
- **Laden und sortieren.** Reihenfolge und Grundgesamtheit setzt der Aufrufer;
  der Picker zeigt, was er bekommt.

## Verhalten

Alles Tastaturverhalten erbt er von `Combobox` (0009) und darf es nicht
nachbauen: tippen grenzt ein, ↓/↑ laufen, Enter nimmt, Escape schließt ohne
zu ändern. Die Spec fordert nur, dass es **erhalten** bleibt — der Nachweis
ist eine Story mit echten Tastendrücken, nicht ein Blick in den Code.

Zwei Zustände sind Sache dieser Komponente:

- **Leer heißt zweierlei.** Kein Sachverhalt vorhanden („In diesem
  Wirtschaftsjahr gibt es noch keinen Sachverhalt.") ist etwas anderes als
  kein Treffer zum Suchbegriff — der erste ist ein Befund über den Bestand,
  der zweite ein Filterproblem (§8 des Analyse-Skills).
- **Gescheitert ist nicht leer.** Bricht die Serversuche ab, steht der Satz
  am Feld; die Liste behauptet dann nicht, es gäbe nichts.

## Stories

Titel `v3/Entitäten/Sachverhalt/CasePicker`. Ableitung nach §6: **5
Story-Zustände** (gefüllt · leer · leer nach Filter · lädt · Fehler) + 0
Enum-Props + 0 Layout-Booleans + 1 Callback-Rundlauf + 1 „im Einsatz" + 1 Rand
= **8**. `Disabled` und `ServerSearch` sind keine eigenen Zeilen, sondern
gehören zu `Filled` bzw. `Roundtrip`; würden sie eigene, wären es 10 und der
Zuschnitt wäre zu prüfen.

| Story | Beweist |
|---|---|
| `Filled` | Die Trefferzeile mit Anzeigename, Nummer, Zustand als Wort und Betrag; darunter einer ohne `title` (Rückfall greift) und einer ohne `caseNumber`. **Drei Fälle, nicht zwölf** — die Zahl stand ohne Zweck da, und was die Story beweist, beweisen drei so gut wie zwölf (berichtigt 2026-09-08, M3). Daneben ein **gesperrter** Picker: `disabled` neben bedienbar |
| `Empty` | Kein Sachverhalt im Jahr — ein Befund über den Bestand, kein Fehler |
| `EmptyAfterFilter` | Suchbegriff ohne Treffer: anderer Satz als `Empty` |
| `Loading` | Die Serversuche läuft; das Feld bleibt bedienbar. **Was die alte Liste tut, sagt diese Story nicht** — sie steht geschlossen da, und der Zusatz „die alte Liste verschwindet nicht“ behauptete etwas, das man ihr nicht ansieht (berichtigt 2026-09-08, M7) |
| `Error` | Die Suche ist gescheitert — Satz am Feld, keine leere Liste |
| `Roundtrip` | `useState`: wählen, abwählen, wieder wählen; dazu der Tastaturweg (↓↓ Enter, Escape) |
| `InUse` | In der Zuordnungszeile einer Kontoauszugsposition, neben Betrag und Verwendungszweck — die Breite, in der er wirklich steht |
| `Edges` | **Der Rand ist die Suche**: 191 Fälle — p90 aus Staging ist 190, die Fixture nimmt die drei Grundfälle dazu (berichtigt 2026-09-08, M8) — und die Eingabe findet über alle vier Felder — „Telekom" über den Gegenpart, „0042" über die Nummer, „Klimaanlage" über den Anzeigenamen, ein Wort aus der Zusammenfassung, das in keiner Zeile steht. Dazu ein Betrag über eine Million, ein Sachverhalt ohne Nummer und einer ohne Gegenpart |

Daten aus `src/ludwig/`-Typen, Werte wie echte: Musterbau GmbH, 1.249,90 €,
26.08.2026 — keine „Test 1".

## Ausbau (A12)

- **Gruppierung nach Zuständigkeit.** Sobald eine Seite zwei Ordnungen
  braucht („meine zuerst"), trägt `ComboboxOption.group` das; die Prop dafür
  hieße `groupBy: (c: CaseListItem) => string` und käme vom Aufrufer, weil
  nur er die Rolle kennt. Auslöser: die erste Seite, die danach fragt.
- **„Neuen Sachverhalt anlegen" als Fuß der Liste.** Erst mit einem
  `onCreate`-Callback und erst, wenn die Handlung fachlich geklärt ist (sie
  legt eine Entität an, während man eine andere zuordnet). Ohne Callback kein
  Weg — keine Prop, die nichts tut.
- **Der Zustand als Plakette.** Wenn ein zweiter Picker denselben Bedarf hat,
  bekommt `ComboboxOption` eine Prop für einen Knoten am Zeilenende — dann
  für beide Picker, nicht für diesen allein.

## Offene Fragen

1. **Sucht der Server oder der Client?** *Ohne Antwort:* beides — `onSearch`
   ist optional, ohne sie filtert die Combobox lokal. Bei p90 190 Treffern
   trägt der Client; die Serversuche ist für den Mandanten mit 3.000 Fällen.
2. **Steht der Betrag in der Trefferzeile, wenn er fehlt (48 %)?**
   *Ohne Antwort:* nein — kein Gedankenstrich, kein „0,00 €". Ein fehlender
   Betrag ist keine Null (dieselbe Regel wie in `AmountCell`).
3. **Zeigt die Zeile den Gegenpart, wenn der Anzeigename ihn schon enthält?**
   *Ohne Antwort:* nein. In 47 % der Fälle steckt er über die Rückfallkette
   schon im Anzeigenamen; ihn daneben zu wiederholen macht die Zeile lang,
   ohne etwas zu sagen. Gesucht wird trotzdem über ihn.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` grün (Exit 0); **nicht bauen**, solange parallele Prüfer messen (0117)
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` am Export — `pnpm check:when` Exit 0
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle acht Stories vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook 6107), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `cases` zeigt je Treffer Anzeigename, Nummer, Zustand als Wort und Betrag; der Anzeigename kommt aus `caseDisplayTitle()`, nicht aus einer eigenen Kette (Story `Filled`, an einem Fall ohne `title` gemessen)
- [ ] Ein Fall ohne `caseNumber` zeigt die ersten acht Zeichen seiner id (`caseIdentifier()`), keinen Ersatzstrich — er bleibt benennbar (Story `Filled`)
- [ ] Ein Fall ohne `totalAmount` zeigt keinen Betrag (Story `Edges`)
- [ ] Der Bearbeitungsstand steht als Wort aus `resolveStatus("sachverhalt", …).label` da; `grep` findet keine lokale Label-Map in der Datei (Story `Filled`)
- [ ] `onChange` liefert die `caseId` und `null` beim Abwählen (Story `Roundtrip`)
- [ ] Tastatur: der Fokus öffnet die Liste und markiert den **ersten** Treffer, jedes ↓ geht einen weiter, Enter nimmt den markierten, Escape schließt ohne Änderung — **mit echten Tastendrücken gemessen**, nicht aus dem Code gelesen (Story `Roundtrip`). *(Die Zeile sagte vor dem Bau „↓ ↓ Enter wählt den zweiten Treffer" und beschrieb damit ein Verhalten, das `Combobox` nicht hat: gemessen wählt ↓ ↓ Enter den dritten, weil der Fokus schon den ersten markiert.)*
- [ ] `onSearch` bekommt den getippten Text; gefiltert wird **immer** im Picker, auch mit der Prop (Story `ServerSearch`, Teil von `Roundtrip`)
- [ ] `Empty` und `EmptyAfterFilter` tragen **verschiedene** Sätze (beide Stories)
- [ ] `Error` zeigt den Satz am Feld und behauptet nicht, die Liste sei leer (Story `Error`)
- [ ] `Loading` lässt das Feld bedienbar (Story `Loading`)
- [ ] Die Suche findet über **alle vier** Felder: Anzeigename, Kennung, Gegenpart und Zusammenfassung — die letzten beiden stehen nicht oder nicht immer in der Zeile, und `Combobox` allein fände sie nicht (Story `Edges`, je ein Suchbegriff pro Feld, mit echten Tastendrücken)
- [ ] Bei 190 Treffern bleibt die Liste scrollbar und jede Zeile einzeilig (Story `Edges`, gemessen: Zeilenhöhe und Bedarf über einen ungebundenen Klon)
- [ ] Ersetzt den `<select>` in `BankTransactionAssignmentTable.tsx` Z. 376–388 ohne Funktionsverlust — die Zuordnung geht weiter, und zusätzlich sieht man Zustand und Betrag (Story `InUse`)

## Abnahme

## Freigabe (2026-09-07, ludwig-coordinator im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Die Begründung, `Combobox` nicht zu erweitern, trägt für die Plakette — nicht für die Suche: `Combobox` filtert lokal nur `label` und `value`, die Nummer steht im `hint` und wird nicht gefunden, die Zusammenfassung nirgends. Entscheid: **der Picker filtert selbst** (Anzeigename, Nummer, Gegenpart, Zusammenfassung) und reicht `onSearch` durch — der kleinere Schritt; `ComboboxOption.keywords` bleibt Ausbau, bis `AccountField` als zweiter Nutzer kommt. Entscheide: 1 Server oder Client — beides, mit dieser Korrektur · 2 Betrag fehlt → nichts · 3 Gegenpart **im `hint`, wenn `title` gesetzt** (sonst steckt er im Label) — das 47-%-Argument ist widerlegt.

Vor dem Bau in die Spec: Suche (Ort der Filterung plus Kriterium); Kennung über `caseIdentifier()` statt „entfällt ersatzlos" (auch der heutige `<select>` zeigt die Kurz-ID); Registry-Pfad `src/ludwig/ui/status/status-registry.ts` (Achse `sachverhalt`); `currency`-Prop streichen — `CaseListItem.currency` je Fall, `asCurrency()` aus `shared/money.ts` je Treffer; `Edges` auf die Suche umformulieren (die 700-Zeichen-Zusammenfassung steht nicht in der Zeile).

## Gebaut (2026-09-07)

`src/ui/v3/entities/accounting-case/CasePicker.tsx` samt Stories, Export im
Barrel. Alle acht Stories der Spec stehen. Gemessen gegen den Dev-Server
`http://localhost:6107` über CDP, Aktion und Messung in getrennten Aufrufen.

**Die Suche liegt im Picker, wie freigegeben.** `Combobox` grenzt nur über
`label` und `value` ein und hört damit ganz auf, sobald `onSearch` gesetzt
ist. Der Picker hält die Eingabe deshalb selbst, prüft **vier** Felder und
reicht nur die Treffer weiter; `onSearch` läuft trotzdem mit, damit der
Aufrufer nachladen kann. Gemessen in `Edges` (191 Sachverhalte), je ein
Suchbegriff pro Feld, mit echten Tastendrücken:

| Eingabe | trifft über | Treffer |
|---|---|---|
| `Telekom` | Gegenpart | 1 |
| `0042` | Kennung | 1 |
| `Klimaanlage` | Anzeigename | 1 |
| `Quartalsende` | **Zusammenfassung** — steht in keiner Zeile | 1 |
| `xyz` | — | 0 |

Ohne Eingabe stehen alle 191 da. Die letzten beiden Felder sind der Grund für
den Entscheid: `Combobox` allein fände sie nicht.

**Die Trefferzeile.** Gemessen in `Filled`:

| Fall | Zeile |
|---|---|
| mit eigenem Titel | `Wartung der Klimaanlage · 2026-0412 · Zur Prüfung · 1.249,90 € · Bürobedarf Meier GmbH` |
| ohne Titel | `Dauersachverhalt: Telekom Deutschland GmbH · 2026-0413 · Klärung offen · -89,90 €` |
| ohne Betrag | `Umbuchung Verrechnungskonto · 2026-0414 · Wartet auf Unterlagen` |
| ohne Nummer | `Vortrag ohne Jahr · c-9002-a · Zur Prüfung · 18.442,19 € · Musterbau GmbH` |

Alle vier Entscheide der Freigabe sind darin sichtbar: der Gegenpart erscheint
nur, wo er nicht schon über die Rückfallkette im Namen steckt (Zeile 2 hat
keinen); der Betrag entfällt, wo keiner ist — kein Strich, keine Null; die
Kennung kommt aus `caseIdentifier()` und wird zur Kurz-ID, wo die Nummer
fehlt; der Bearbeitungsstand ist ein Wort aus
`resolveStatus("sachverhalt", …)`.

**Zwei Leerfälle, zwei Sätze.** „In diesem Wirtschaftsjahr gibt es noch keinen
Sachverhalt." gegen „Kein Sachverhalt mit diesem Suchbegriff." — gemessen je
im geöffneten Feld.

**Tastatur** (`Roundtrip`, echte Anschläge, Maus weggeparkt): der Fokus öffnet
die Liste und markiert den ersten Treffer, jedes ↓ geht einen weiter, Enter
nimmt den markierten (`c-4414` nach zwei ↓), Escape schließt, ohne die Wahl zu
ändern. Der Fokusring am Feld ist `box-shadow rgba(59,143,196,0.14) 0 0 0 3px`
mit Rand `rgb(26,58,92)`.

**Dabei zwei Funde an `Combobox` (0009), beide behoben:**

1. **52 von 191 Trefferzeilen brachen um.** Name und Hinweis stehen in einem
   Kasten, der nicht kürzte — eine Liste, die man von oben nach unten
   überfliegt, verträgt keine zwei Zeilenhöhen. Jetzt kürzt `.v2cmb__text`,
   und der ganze Wert steht im `title` am Knopf: gemessen **0** zweizeilige
   Treffer bei denselben 191.
2. Die Liste hält ihre 280 px und scrollt (`scrollHeight` 6296) — das war
   schon richtig; meine erste Messung hatte den falschen Kasten gelesen und
   „scrollt nicht" gemeldet. Hier steht es korrigiert, weil eine falsche
   Messung im Protokoll schlimmer ist als keine.

**Eine Zeile der Spec ist nachgezogen:** sie forderte „↓ ↓ Enter wählt den
zweiten Treffer" und beschrieb damit ein Verhalten, das `Combobox` nicht hat.
Gemessen wählt ↓ ↓ Enter den **dritten**, weil der Fokus bereits den ersten
markiert. Die Zeile sagt jetzt, was die Primitive tut — geändert **vor** der
Abnahme und mit Grund, nicht während ihr.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0.

**Status: Abnahme** — gebaut habe ich, abnehmen muss ein anderer.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Fremde Abnahme, Owner-Entscheid 2026-09-08: geprüft wurde die **Schnittstelle**,
nicht die Darstellung. Spurbreiten, Zeilenhöhen, Überläufe, Kontraste,
Trefferflächen, Hover, Fokusringe und Tastaturwege als Ergonomie stehen in
`docs/backlog/0119-visuelle-pruefung-nachholen.md` — die Kriterien „Zeilenhöhe
und Bedarf bei 190 Treffern" und „Prüfliste `design-guidelines.md` §9" sind
deshalb **nicht** geprüft.

**Gelesen:** `src/ui/v3/entities/accounting-case/CasePicker.tsx` (125 Z.) und
`CasePicker.stories.tsx` (279 Z.) Zeile für Zeile · die Primitive
`src/ui/v3/primitives/Combobox.tsx` (226 Z.), weil der Picker sein ganzes
Verhalten von ihr erbt · `case-title.ts` (`caseIdentifier`) ·
`src/ludwig/modules/accounting-cases/domain/case.ts` (`CaseListItem`,
`caseDisplayTitle`) · `src/ludwig/shared/money.ts` (`asCurrency`, `formatMoney`) ·
`src/ludwig/ui/status/status-registry.ts` (`resolveStatus`, `UNKNOWN`) ·
`docs/entitaeten/accounting-case.md` (Datenpunkte, Formen, Offene Frage 3) ·
`.claude/skills/spec-schreiben/SKILL.md` §5/§6 · `docs/backlog/0009-combobox.md`.

**Gemessen:** alle acht Stories im Browser über `scripts/cdp.mjs` gegen den
Dev-Server 6107, Story-IDs aus `http://localhost:6107/index.json`; Aktion und
Messung in **getrennten** `Runtime.evaluate`-Aufrufen, der Zeiger nach jedem
Klick auf (5, 850) geparkt, damit `onMouseEnter` die Markierung nicht
verschiebt. Vier Messläufe (Tastatur-Rundlauf · Suche je Feld mit je einem
frischen Seitenaufbau · die fünf Zustände · der Weg „wählen, dann suchen, dann
weggehen").

**Wächter, je Exit-Code:** `pnpm typecheck` 0 · `check:when` 0 · `check:icons` 0
· `check:contrast` 0 · `check:mirror` (`--test`) 0 · `check:language` 0. Die
Gegenprobe `check:language --all` gibt **1**, meldet aber nur den Bestand (377
deutsche Kommentarzeilen in 136 Dateien) und **keine** Zeile aus `CasePicker`;
der Wächter liest ausschließlich Kommentare, keine Bezeichner (siehe M9).

### Je Kriterium

| Kriterium | Nachweis | Urteil |
|---|---|---|
| `typecheck` grün | Exit 0 | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/accounting-case/CasePicker{,.stories}.tsx`; Titel `v3/Entitäten/Sachverhalt/CasePicker`; Barrel `src/ui/v3/index.ts:397` | ✓ |
| Code englisch; `@when`/`@instead` am Export | `check:when` Exit 0, Zeilen stehen an `CasePicker` (`CasePicker.tsx:56–58`). Englisch **nicht** erfüllt — vier deutsche Bezeichner | ✗ **M9** |
| Kein Hex, kein px, keine lokale Label-Map | `grep` in `CasePicker.tsx`: kein Hex, kein `px`, keine Map; das Wort kommt aus `resolveStatus("sachverhalt", …)` (Z. 25). Einziges `px` im Set: `gridTemplateColumns` der `InUse`-Story (Z. 212), Spurbreite einer Story-Bühne | ✓ |
| Alle acht Stories vorhanden | `index.json`: filled · empty · empty-after-filter · loading · error · roundtrip · in-use · edges | ✓ |
| Anzeigename, Nummer, Zustand als Wort, Betrag; Name aus `caseDisplayTitle()` | `Filled` geöffnet, vier Zeilen gemessen: `Wartung der Klimaanlage · 2026-0412 · Zur Prüfung · 1.249,90 € · Bürobedarf Meier GmbH` und, ohne `title`, `Dauersachverhalt: Telekom Deutschland GmbH · 2026-0413 · Klärung offen · -89,90 €` — die Rückfallkette kommt aus dem Spiegel (`CasePicker.tsx:102`), nicht aus einer zweiten Kette | ✓ (Umfang: **M3**) |
| Fall ohne `caseNumber` zeigt acht Zeichen der id | gemessen `Vortrag ohne Jahr · c-9002-a · …` — `caseIdentifier()` (`case-title.ts:68–70`), kein Ersatzstrich | ✓ |
| Fall ohne `totalAmount` zeigt keinen Betrag | gemessen `Umbuchung Verrechnungskonto · 2026-0414 · Wartet auf Unterlagen` — nichts, kein Strich, keine Null (`CasePicker.tsx:30–32`) | ✓ |
| Bearbeitungsstand als Wort aus der Registry | „Zur Prüfung", „Klärung offen", „Wartet auf Unterlagen" — alle drei stehen so in `status-registry.ts` unter der Achse `sachverhalt`; keine lokale Map in der Datei | ✓ |
| `onChange` liefert die `caseId` und `null` beim Abwählen | `Roundtrip`, echte Anschläge: Enter → „Gewählt: c-4412"; Backspace im leeren Feld → „Gewählt: —". Der Rückruf bekommt nur `option.value` (`Combobox.tsx:108`) oder `null` (Z. 140) — **nie** einen leeren String und nie einen Wert, den es nicht gibt | ✓ |
| Tastatur: Fokus markiert den ersten Treffer, ↓ geht einen weiter, Enter nimmt den markierten | gemessen: Fokus → `activeIndex 0`, ↓ → 1, ↓ → 2, Enter → `c-4414` („Umbuchung Verrechnungskonto", der **dritte**). Die korrigierte Spec-Zeile stimmt; die Story sagt weiter etwas anderes | ✓ (**M5**) |
| `onSearch` bekommt den getippten Text; gefiltert wird immer im Picker | `Roundtrip` mit `onSearch`: der getippte Text steht unter „An `onSearch` gegangen"; `Edges` filtert bei gesetzter Prop weiter selbst (`Loading`-Story mit `onSearch` zeigt dieselbe Liste). Aber der Picker erfährt **nie**, wenn die Combobox ihren Suchbegriff selbst leert | ✗ **M1** |
| `Empty` und `EmptyAfterFilter` tragen verschiedene Sätze | gemessen: „In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt." gegen (nach „xyz") „Kein Sachverhalt mit diesem Suchbegriff." | ✓ (Achse: **M7**) |
| `Error` zeigt den Satz am Feld, die Liste bleibt | gemessen: vier Treffer stehen weiter in der Liste, der Satz steht darunter am Feld | ✓ |
| `Loading` lässt das Feld bedienbar | gemessen: `input.disabled` false, „Tele" wird angenommen. Die alte Liste **verschwindet** aber (0 Treffer, nur „Suche läuft …") | ✓ / ✗ **M6** |
| Suche über alle vier Felder | `Edges`, je ein frischer Seitenaufbau, echte Anschläge: `Telekom` → 1 (Gegenpart) · `0042` → 1 (Kennung, „Sanierung des Serverraums") · `Klimaanlage` → 1 (Anzeigename) · `Quartalsende` → 1 (**Zusammenfassung**, steht in keiner Zeile) · `xyz` → 0 mit dem Filtersatz · ohne Eingabe **191** | ✓ (Zahl: **M8**) |
| Liste bei 190 Treffern scrollbar, Zeilen einzeilig | **nicht geprüft** — vertagt nach 0119 | — |
| Ersetzt den `<select>` ohne Funktionsverlust | `InUse` gemessen: Betrag, Verwendungszweck, Picker in einer Zeile, Liste öffnet über der Karte. Der `<select>` selbst liegt in `ludwig/app` und ist hier nicht spiegelbar — mehr, als die Story zeigt, ist in diesem Repo nicht prüfbar; der Einbau ist ohnehin auf 0121 vertagt | ✓ soweit prüfbar |

**Ohne Befund geprüft** (die Fallen dieser Welle): kein lokal nachgebauter Typ
und keine lokale Verschärfung — `grep "\bas [A-Z]"` findet in beiden Dateien
nichts, `CaseListItem`, `caseDisplayTitle` und `asCurrency` kommen aus dem
Spiegel · kein Pflichtfeld, das die Komponente nicht liest · der Rückruf wird
nie mit einem ungültigen Wert gerufen · leere Eingabe zeigt alle 191 Treffer
(`matches` Z. 48–49) · `resolveStatus` mit `null` gäbe „—" statt eines Wortes
(`status-registry.ts:2213`, und `if (stand)` fängt das nicht ab, weil „—"
wahr ist), das trifft aber keinen echten Fall: `lifecycleStatus` ist im Profil
zu **100 %** gefüllt (`accounting-case.md` Z. 78) — kein Mangel, nur eine tote
Bedingung · die Zahlen der Spec stimmen gegen das Profil (`title` 53 %,
`totalAmount` 52 % ⇒ 48 % ohne Betrag, p90 190 offene Fälle).

### Mängel

**M1 · Der Suchbegriff des Pickers überlebt das Feld — blockiert**
Kriterium: „`onSearch` bekommt den getippten Text; gefiltert wird **immer** im
Picker" · und die Nutzung als kontrollierte Eingabe mit `value`/`onChange`.
Ort: `CasePicker.tsx:98` und `112–115`, zusammen mit `Combobox.tsx:107–111`
(`pick`), `133–138` (Escape) und `149–154` (`onBlur`).
Befund: Der Picker hält den Suchbegriff selbst, weil er selbst filtert. Die
Combobox leert **ihren** Suchbegriff an drei Stellen — beim Nehmen, bei Escape
und beim Verlassen — und ruft dabei `onSearch` nicht. Der Picker erfährt davon
nichts und filtert weiter. Gemessen in `Edges` (191 Fälle), Aktion und Messung
getrennt:

- tippen „Telekom" → 1 Treffer; **Escape** → Feld leer; verlassen und wieder
  hineingehen → Feld leer, Liste **1 von 191**.
- tippen „Telekom", **Enter** → gewählt; verlassen und wieder hinein → Liste
  **1 von 191**.
- Der schwerste Fall (`Roundtrip`, vier Fälle): wählen (`Gewählt: c-4412`,
  Feld zeigt „Wartung der Klimaanlage") → hineingehen → „Tele" tippen (1
  Treffer) → **ohne zu wählen weggehen** → das Feld zeigt **nichts** mehr,
  obwohl `value` unverändert `c-4412` ist; beim nächsten Hineingehen steht ein
  leeres Feld über einer Liste mit einem von vier Einträgen.

Der Grund für den letzten Punkt steht in derselben Primitive: `chosen` wird aus
den **gefilterten** Optionen aufgelöst (`Combobox.tsx:92`), und der Text des
geschlossenen Feldes ist `chosen?.label ?? ""` (Z. 105). Fällt der gewählte
Fall aus dem stehengebliebenen Filter, ist die Auswahl unsichtbar. Die
Primitive kennt die Absicht — Z. 96/97: „While the query is still the
pre-filled choice, everything stays visible — otherwise focusing the field
would narrow it to one hit" —, aber die Kurzschluss-Bedingung `if (onSearch ||
…)` in Z. 97 macht genau diesen Schutz für jeden Aufrufer unerreichbar, der
selbst filtert. Für 0121 (`ask.render`, Sammelaktion) ist das der Zustand, der
nicht auftreten darf: das Feld behauptet „keiner gewählt", während der Aufrufer
eine `caseId` hält.
Kleinster Weg: Die Combobox sagt, wenn sie ihren Suchbegriff selbst leert —
`onSearch?.("")` an denselben drei Stellen, an denen `setQuery("")` steht (drei
Zeilen in `Combobox.tsx`), und ein Satz dazu in 0009. Im Picker allein ist es
nicht behebbar: er erfährt nichts vom Schließen, und ohne `onSearch` fiele die
Suche über Nummer und Zusammenfassung weg — der Grund, aus dem er selbst
filtert.
Blockiert: **ja**.

**M2 · Die Schnittstelle der Spec kennt `noCasesText` nicht — blockiert nicht**
Kriterium: Schnittstelle (§5 `spec-schreiben`: „Jede Prop bekommt in der
Tabelle die Story, die sie beweist").
Ort: Spec Z. 71–81 gegen `CasePicker.tsx:70` und `87–91`.
Befund: Die Komponente hat **zehn** Props, die Tabelle führt neun. `noCasesText`
(Vorgabe „In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt.") trägt
genau die Unterscheidung, die der Abschnitt „Verhalten" zur Sache dieser
Komponente erklärt, und steht nirgends in der Schnittstelle. Dieselbe Lücke
hatte 0009 bei `name` (offener Punkt 5 dort).
Kleinster Weg: eine Tabellenzeile, Story `Empty`.
Blockiert: nein.

**M3 · `Filled` zeigt vier Sachverhalte, die Spec verlangt zwölf — blockiert nicht**
Kriterium: Story `Filled` („Zwölf Sachverhalte …").
Ort: Spec Z. 142 gegen `CasePicker.stories.tsx:40–75` und `93–99`; gemessen
vier Treffer im geöffneten Feld.
Befund: Die vier Fälle decken alle **Eigenschaften** ab, die die Zeile daneben
verlangt (mit Titel, ohne Titel, ohne Nummer, ohne Betrag) — nicht aber das,
wofür die Zwölf da waren: zu sehen, wie sich die Liste liest, wenn sie eine
ist. Vier Zeilen sind noch ein `<select>`.
Kleinster Weg: die Fixture auf zwölf ziehen (die `Edges`-Schleife gibt es
schon) — oder die Zahl in der Spec streichen und begründen.
Blockiert: nein.

**M4 · `disabled` hat keine Story — blockiert nicht**
Kriterium: §5 — eine Prop ohne Story-Nachweis.
Ort: Spec Z. 80 (Story `Filled`) und Z. 137–138 („`Disabled` … gehört zu
`Filled`") gegen `CasePicker.stories.tsx:93–99`: `Filled` setzt `disabled`
nicht, keine andere Story auch.
Befund: Die Prop wird unverändert durchgereicht (`CasePicker.tsx:118`), und die
Primitive zeigt den gesperrten Zustand in ihrer Story `Invalid`
(`Combobox.stories.tsx:168–175`) — das Risiko ist klein, der benannte Nachweis
fehlt trotzdem.
Kleinster Weg: ein zweiter, gesperrter Picker in `Filled` (vier Zeilen).
Blockiert: nein.

**M5 · Die `Roundtrip`-Story behauptet den Tastaturweg, den es nicht gibt — blockiert nicht**
Kriterium: Tastatur (Spec Z. 200 in der korrigierten Fassung).
Ort: `CasePicker.stories.tsx:168–169` („↓ ↓ Enter nimmt den zweiten Treffer").
Befund: Gemessen nimmt ↓ ↓ Enter den **dritten** (`c-4414`), weil der Fokus
schon den ersten markiert — genau das, was die Spec vor dem Bau nachgezogen
hat. Die Story sagt weiter das Alte, und sie ist der Text, den ein Leser in
Storybook vor sich hat: zwei Texte für denselben Zustand.
Kleinster Weg: „zweiten" → „dritten", mit dem Halbsatz zum Grund.
Blockiert: nein.

**M6 · `Loading`: die Spec verspricht die stehenbleibende Liste, gemessen verschwindet sie — blockiert nicht**
Kriterium: Story `Loading` („das Feld bleibt bedienbar, die alte Liste
verschwindet nicht").
Ort: Spec Z. 145 gegen `Combobox.tsx:184–187`; gemessen: Feld offen, **0**
Treffer, nur „Suche läuft …".
Befund: Das bindende variable Kriterium („`Loading` lässt das Feld bedienbar")
ist erfüllt — der Eingabe wurde „Tele" angenommen. Der Satz in der Story-Tabelle
ist es nicht, und er kann es nicht sein: die Primitive setzt den Ladehinweis
**an die Stelle** der Liste. Eines von beidem muss weichen.
Kleinster Weg: den halben Satz in der Spec streichen — oder in 0009 den
Hinweis über die Liste setzen statt an ihre Stelle.
Blockiert: nein.

**M7 · Ein Wert, zwei Bedeutungen: `cases.length === 0` — blockiert nicht**
Kriterium: „Leer heißt zweierlei" (Spec Z. 124–127).
Ort: `CasePicker.tsx:122` gegen Spec Z. 76 („die Treffer, fertig sortiert und
**gefiltert** vom Aufrufer") und Z. 77 (`onSearch`).
Befund: Der Picker unterscheidet den Befund über den Bestand vom Filterproblem
allein an der Länge von `cases`. Nach der eigenen Schnittstelle ist `cases`
aber das, was der Aufrufer schon gefiltert hat: im Serversuch-Pfad liefert eine
leere Antwort deshalb den **Bestandssatz** für ein Filterproblem — die
Verwechslung, gegen die der Abschnitt „Verhalten" geschrieben ist. Ohne
`onSearch` tritt der Fall nicht auf, mit ihm zuverlässig.
Kleinster Weg: in der Spec festschreiben, dass `cases` immer der ganze Bestand
ist und `onSearch` nur sein Nachladen anstößt — oder eine eigene Angabe für den
Bestandsbefund.
Blockiert: nein.

**M8 · `Edges` sagt 190 und enthält 191 — blockiert nicht**
Kriterium: Story `Edges` (190 Treffer, p90 aus Staging).
Ort: `CasePicker.stories.tsx:248–268` (4 + 1 + 186) gegen den Satz in Z. 272
(„190 Sachverhalte"); gemessen ohne Eingabe **191** Treffer.
Befund: Die Fixture widerspricht ihrer eigenen Bildunterschrift. Das
Bau-Protokoll nennt 191 offen — nur die Story sagt etwas anderes.
Kleinster Weg: 185 statt 186 in der Schleife, oder die Zahl im Satz.
Blockiert: nein.

**M9 · Deutsche Bezeichner in einer neuen Datei — blockiert**
Kriterium: fest — „Code englisch".
Ort: `CasePicker.tsx:24` (`teile`), `25` (`stand`), `51` (`feld`), `99`
(`treffer`); in den Stories `77` (`Rahmen`), `175/184` (`suche`, `setQuery`,
`alt`), `176` (`gewaehlt`), `248` (`viele`). Dazu ein deutsches Wort in einem
englischen Kommentar (Z. 119: „because leer means two things").
Befund: CLAUDE.md sagt „Code nur Englisch. **Bezeichner**, Props, Typen,
Kommentare, JSDoc … Englisch"; die Ausnahme gilt dem Bestand, nicht einer am
2026-09-07 neu angelegten Datei. Der Wächter deckt das nicht ab — er liest
ausschließlich Kommentarzeilen (`check-language.mjs`, `kommentarZeilen`) und
ohne `--all` nur die zuletzt geänderten Dateien; deshalb steht er auf 0 und die
Gegenprobe `--all` nennt `CasePicker` nicht. Im übrigen v3-Code außerhalb der
Stories tragen genau zwei Dateien deutsche Bezeichner
(`JournalEntryEditor.tsx:832` und diese) — es ist kein Bestandsmuster, sondern
ein Ausrutscher. Die Regel ist die, die in dieser Welle am häufigsten
zurückfiel (0025 M3, 0044, 0063 M1, 0086).
Kleinster Weg: vier Umbenennungen in der Komponente (`parts`, `state`, `field`,
`hits`) und das eine Wort im Kommentar; die Story-Bezeichner beim nächsten
Anfassen.
Blockiert: **ja**.

**M10 · Die Trefferzeile trägt Rang 1–5, die Spec sagt 1–4 — blockiert nicht**
Kriterium: „Die Trefferzeile trägt die Ränge 1–4 des Profils" (Spec Z. 83).
Ort: Spec Z. 83 gegen `docs/entitaeten/accounting-case.md` Z. 81 (Gegenpart =
**Rang 5**), Z. 204 und Z. 309 („trägt jetzt Rang 1–5 statt 1–4").
Befund: Die Aufzählung direkt darunter führt den Gegenpart selbst mit auf, und
gemessen steht er in der Zeile („… · 1.249,90 € · Bürobedarf Meier GmbH").
Gebaut ist also 1–5, wie das Profil es seit dem 2026-09-05 sagt; nur die
Überschrift der Spec zählt noch die alte Zahl.
Kleinster Weg: „1–4" → „1–5".
Blockiert: nein.

**M11 · Ein Pfad der Freigabe ist nur halb nachgezogen — blockiert nicht**
Kriterium: Freigabe 2026-09-07 („Vor dem Bau in die Spec: … Registry-Pfad
`src/ludwig/ui/status/status-registry.ts` (Achse `sachverhalt`)").
Ort: Spec Z. 69 nennt weiter `patterns/status-registry.ts`; Z. 49 nennt den
richtigen Pfad, und der Code importiert aus `@/ludwig/ui/status/status-registry`
(`CasePicker.tsx:8`).
Befund: Zwei Stellen derselben Spec nennen zwei Orte für dieselbe Registry.
Kleinster Weg: Z. 69 auf den Pfad aus Z. 49 ziehen.
Blockiert: nein.

### Gesamturteil

**Zurück.** Zwei blockierende Punkte:

1. **M1** — der Suchbegriff des Pickers wird nie zurückgesetzt, weil die
   Combobox ihr eigenes Leeren nicht meldet. Gemessen führt das zu einem leeren
   Feld über einer gefilterten Liste und, schlimmer, zu einem Feld, das nichts
   anzeigt, obwohl `value` gesetzt ist. Genau die Frage, die für 0121 zählt.
2. **M9** — deutsche Bezeichner in einer neu angelegten Datei; das feste
   Kriterium „Code englisch" ist nicht erfüllt, und der Wächter kann es nicht
   sehen.

Alles andere trägt: die vier Suchfelder finden nachweislich auch über
Zusammenfassung und Gegenpart, die Trefferzeile löst alle vier Entscheide der
Freigabe ein, der Rückruf bekommt nie einen ungültigen Wert, und die beiden
Leersätze sind verschieden. Die neun übrigen Mängel sind Spec-Pflege und
Story-Deckung — sie gehören in denselben Zug wie die Behebung von M1, halten
die Aufgabe aber allein nicht auf.

Abgenommen von / am: Claude (fremder Abnahme-Agent), 2026-09-08.

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

**M1 (blockierte) — der Suchbegriff überlebte das Feld, und der Fix sitzt in
`Combobox`.** Sie leert ihren `query` an drei Stellen (Nehmen, Escape,
Verlassen) und rief dabei nie `onSearch`. Wer außen filtert — und der Picker
tut das, weil `Combobox` nur `label` und `value` kennt —, filterte danach auf
ein Wort, das niemand mehr sehen konnte.

Der schwerste Fall war nicht die stehengebliebene Liste, sondern ein
**widersprüchlicher Zustand**: `chosen` wird in `options` gesucht, und solange
die noch gefiltert sind, hat ein gewählter Wert kein Label — das Feld stand
leer, obwohl `value` gesetzt war. Genau der Zustand, den 0121 als
kontrollierte Eingabe nicht haben darf.

Alle drei Wege gehen jetzt durch **eine** Funktion (`clearQuery`), damit keiner
die zweite Hälfte wieder vergessen kann. Gemessen im `Roundtrip`: wählen →
„Tele" tippen → weggehen ⇒ das Feld zeigt „Wartung der Klimaanlage", `value`
bleibt `c-4412`, und `onSearch` bekam „Klima", „", „Tele", „".

*(Zwei Messungen zuvor sahen anders aus — ich hatte `blur()` statt `focusout`
ausgelöst, und Reacts `onBlur` hängt an `focusout`. Der Fehler lag in der
Messung, nicht im Code.)*

| Weiterer Punkt | Was getan |
|---|---|
| **M9** (blockierte) | Vier deutsche Bezeichner in einer neu angelegten Datei (`teile`, `stand`, `feld`, `treffer`) plus zwei in den Stories heißen jetzt englisch. `check:language` sieht sie nicht — er liest Kommentare, keine Bezeichner |
| **M2** | `noCasesText` steht in der Schnittstellen-Tabelle. Zehn Props, neun Zeilen — und gerade die fehlte, die den **zweiten** Leerfall trägt |
| **M3** | `Filled` verspricht keine zwölf Fälle mehr, sondern nennt die drei, die es zeigt: die Zahl stand ohne Zweck da |
| **M4** | `disabled` hat seinen Nachweis — als zweiter, gesperrter Picker in `Filled`. Die Spec nannte eine Story `Disabled`, die es nie gab |
| **M6** | Die Story-Prosa behauptete „↓ ↓ Enter nimmt den zweiten Treffer". Gemessen ist es der dritte, weil der Fokus schon den ersten markiert — die Spec-Zeile war am 2026-09-07 berichtigt worden, die Story nicht |
| **M7** | `Loading` behauptete, die alte Liste verschwinde nicht. Die Story steht geschlossen da; man sieht es ihr nicht an, also sagt sie es nicht mehr |
| **M8** | `Edges` nennt 191 statt 190 — p90 ist 190, die Fixture nimmt die drei Grundfälle dazu |
| **M10** | Die Ränge der Trefferzeile heißen 1–5, wie im Profil und im Bau; die Spec sagte an zwei Stellen 1–4 |

**Nicht geändert: `cases.length === 0` trägt zwei Bedeutungen** — das ist der
Grund, warum es `emptyText` **und** `noCasesText` gibt. „Nichts gefunden" ist
ein Suchergebnis, „noch keiner da" ein Zustand des Jahres, und welcher gilt,
weiß nur der Aufrufer. Beide Sätze stehen jetzt in der Tabelle.

`pnpm typecheck` und die fünf Wächter auf Exit 0.
