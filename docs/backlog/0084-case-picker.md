# 0084 · CasePicker — einen bestehenden Sachverhalt auswählen

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-07, ludwig-coordinator im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CasePicker`) und „Heutige Darstellung" (letzte Zeile) |
| Auftrag | Die Auswahl eines bestehenden Sachverhalts, wenn eine Bankzeile ihm zugeordnet wird. Ersetzt den `<select>` in `modules/bank-transactions/ui/BankTransactionAssignmentTable.tsx` (Z. 376–388), der heute „Nummer · Art · 40 Zeichen Zusammenfassung" in eine Optionszeile presst. |
| Warum nicht so lassen | Bei p90 **190 offenen Sachverhalten** je Mandant und Jahr (Staging 2026-09-05) ist ein `<select>` keine Auswahl, sondern eine Liste. Und man wählt blind: Zustand, Betrag und Gegenpart stehen nicht in der Option. |
| Vertagt, weil | die Suchachse offen ist — Offene Frage 3 des Profils. *Ohne Antwort gilt der Default:* `Combobox` mit Suche über Nummer, Gegenpart und Zusammenfassung; die Trefferzeile trägt Rang 1–4. Entschieden wird das hier, nicht im Profil. |
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

**Die Combobox wird nicht erweitert.** Naheliegend wäre Regel Nr. 2 — eine
Prop, damit die Trefferzeile eine Plakette tragen kann. Sie greift nicht: §3
verlangt dafür **zwei** geplante Verwendungen oder eine Design-Vorlage, und
es gibt weder das eine noch das andere; ein zweiter Picker mit Zustand ist
nirgends beauftragt. `ComboboxOption` trägt `label`, `hint` und `group` —
das reicht, wenn der Bearbeitungsstand als **Wort** statt als Plakette
erscheint. V7 verlangt zu jeder Farbe ein Wort oder ein Zeichen; ein Wort
allein ist die zulässige Sparform, und der Zustand kommt aus
`resolveStatus("sachverhalt", …).label`, nicht aus einer lokalen Map. Fällt
später ein zweiter Fall an, ist die Prop an der Combobox die richtige Stelle —
dann für beide.

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
| `onSearch` | `(query: string) => void` (optional) | Serversuche. Ohne sie filtert die Combobox lokal über Anzeigename, Nummer, Gegenpart und Zusammenfassung | `ServerSearch` |
| `loading` | `boolean` (optional) | die Suche läuft; das Feld bleibt bedienbar | `Loading` |
| `error` | `string` (optional) | die Suche ist gescheitert — der Satz steht am Feld, nicht in der Liste | `Error` |
| `currency` | `Currency` (optional) | Währung für den Betrag in der Trefferzeile; ohne sie steht kein Betrag da | `Filled` |
| `disabled` | `boolean` (optional) | die Zeile ist schon zugeordnet oder gesperrt | `Disabled` |
| `emptyText` | `string` (optional) | Vorgabe „Kein Sachverhalt mit diesem Suchbegriff." | `EmptyAfterFilter` |

**Die Trefferzeile** trägt die Ränge 1–4 des Profils, und zwar in dieser
Verteilung:

- `label` = **Anzeigename** (Rang 1) über `caseDisplayTitle({ title, kind, counterpartyName })`.
  Nicht `title` allein: er ist zu 53 % gefüllt, und die Rückfallkette ist die
  eine Regel des Sets (Profil Rang 1, Befund L-52) — die Komponente baut sie
  nicht selbst nach.
- `hint` = **Nummer** (Rang 3) · **Bearbeitungsstand als Wort** (Rang 2) ·
  **Betrag** (Rang 4), getrennt durch „ · ". Die Nummer steht vorn, weil man
  nach ihr sucht; fehlt sie (`caseNumber` kann `null` sein, wenn dem Fall das
  Wirtschaftsjahr fehlt), entfällt sie ersatzlos statt als Gedankenstrich.
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
| `Filled` | Zwölf Sachverhalte, Trefferzeile mit Anzeigename, Nummer, Zustand als Wort und Betrag; darunter einer ohne `title` (Rückfall greift) und einer ohne `caseNumber` |
| `Empty` | Kein Sachverhalt im Jahr — ein Befund über den Bestand, kein Fehler |
| `EmptyAfterFilter` | Suchbegriff ohne Treffer: anderer Satz als `Empty` |
| `Loading` | Die Serversuche läuft; das Feld bleibt bedienbar, die alte Liste verschwindet nicht |
| `Error` | Die Suche ist gescheitert — Satz am Feld, keine leere Liste |
| `Roundtrip` | `useState`: wählen, abwählen, wieder wählen; dazu der Tastaturweg (↓↓ Enter, Escape) |
| `InUse` | In der Zuordnungszeile einer Kontoauszugsposition, neben Betrag und Verwendungszweck — die Breite, in der er wirklich steht |
| `Edges` | 190 Treffer (p90 aus Staging), eine Zusammenfassung über 700 Zeichen, ein Betrag über eine Million, ein Sachverhalt ohne Nummer und ohne Gegenpart |

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
- [ ] Ein Fall ohne `caseNumber` zeigt keine Nummer und keinen Ersatzstrich (Story `Filled`)
- [ ] Ein Fall ohne `totalAmount` zeigt keinen Betrag (Story `Edges`)
- [ ] Der Bearbeitungsstand steht als Wort aus `resolveStatus("sachverhalt", …).label` da; `grep` findet keine lokale Label-Map in der Datei (Story `Filled`)
- [ ] `onChange` liefert die `caseId` und `null` beim Abwählen (Story `Roundtrip`)
- [ ] Tastatur: ↓ ↓ Enter wählt den zweiten Treffer, Escape schließt ohne Änderung — **mit echten Tastendrücken gemessen**, nicht aus dem Code gelesen (Story `Roundtrip`)
- [ ] `onSearch` bekommt den getippten Text; ohne die Prop filtert die Liste lokal über Anzeigename, Nummer, Gegenpart und Zusammenfassung (Story `ServerSearch`, Teil von `Roundtrip`)
- [ ] `Empty` und `EmptyAfterFilter` tragen **verschiedene** Sätze (beide Stories)
- [ ] `Error` zeigt den Satz am Feld und behauptet nicht, die Liste sei leer (Story `Error`)
- [ ] `Loading` lässt das Feld bedienbar (Story `Loading`)
- [ ] Bei 190 Treffern bleibt die Liste scrollbar und die Zeile einzeilig; die Zusammenfassung mit 700 Zeichen sprengt die Zeile nicht (Story `Edges`, gemessen: Zeilenhöhe und Bedarf über einen ungebundenen Klon)
- [ ] Ersetzt den `<select>` in `BankTransactionAssignmentTable.tsx` Z. 376–388 ohne Funktionsverlust — die Zuordnung geht weiter, und zusätzlich sieht man Zustand und Betrag (Story `InUse`)

## Abnahme

## Freigabe (2026-09-07, ludwig-coordinator im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Die Begründung, `Combobox` nicht zu erweitern, trägt für die Plakette — nicht für die Suche: `Combobox` filtert lokal nur `label` und `value`, die Nummer steht im `hint` und wird nicht gefunden, die Zusammenfassung nirgends. Entscheid: **der Picker filtert selbst** (Anzeigename, Nummer, Gegenpart, Zusammenfassung) und reicht `onSearch` durch — der kleinere Schritt; `ComboboxOption.keywords` bleibt Ausbau, bis `AccountField` als zweiter Nutzer kommt. Entscheide: 1 Server oder Client — beides, mit dieser Korrektur · 2 Betrag fehlt → nichts · 3 Gegenpart **im `hint`, wenn `title` gesetzt** (sonst steckt er im Label) — das 47-%-Argument ist widerlegt.

Vor dem Bau in die Spec: Suche (Ort der Filterung plus Kriterium); Kennung über `caseIdentifier()` statt „entfällt ersatzlos" (auch der heutige `<select>` zeigt die Kurz-ID); Registry-Pfad `src/ludwig/ui/status/status-registry.ts` (Achse `sachverhalt`); `currency`-Prop streichen — `CaseListItem.currency` je Fall, `asCurrency()` aus `shared/money.ts` je Treffer; `Edges` auf die Suche umformulieren (die 700-Zeichen-Zusammenfassung steht nicht in der Zeile).
