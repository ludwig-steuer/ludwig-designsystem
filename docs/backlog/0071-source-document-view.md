# 0071 · Beleg-Detailansicht — `SourceDocumentView`

| | |
|---|---|
| Status | Abnahme |
| Freigabe | zurück 2026-09-07 — Zuschnitt neu nach Abschnitt „Freigabe" (Rahmen wie 0050 plus Karte), danach ohne zweite Runde freigegeben |
| Stufe | `entities/source-document/` — `SourceDocumentView` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Pipeline, Vorsteuer und Belegart sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Formen-Tabelle · Seitenprofil `docs/seiten/beleg-detail.md` |
| Ersetzt | `SourceDocFamily`, `InvoiceSidebar`, `DocTabsBar`, `SourceDocBelegTab`, den Anzeige-Teil von `ContractDetail`. **Nicht** `SourceDocPipelineTab` und `SourceDocVerlaufTab` — das sind Reiter-Inhalte, die der Rahmen nicht rendert; die fünf Editoren sind eine Folgeaufgabe |
| Blockiert | nichts |
| Setzt voraus | `SourceDocumentCard` (**entsteht hier**, Profil-Prüfung 2026-09-04), `SourceDocumentFacts` mit Ausprägungs-Registry, `SourceDocumentPreview` (alle aus dieser Familie), `EntityHeader`, `Tabs`, `LogList` |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`) |

## Ziel

Die volle Ansicht eines Belegs: Kopf, Original, Fakten der Ausprägung,
Historie — und die sechs Tabs, die `tabs.ts` schon führt (Beleg,
Positionen, Vorsteuer, Verlauf & Befunde, Pipeline, Rohdaten). Zwei davon
setzen eine Rechnungs-Zeile voraus; die Belegart entscheidet nur, **welche**
Tabs sichtbar sind und wie der erste heißt — nicht, welche Ansicht gemountet
wird (decision-log 2026-07-20).

Warum vertagt: der View setzt die Karte voraus (er zeigt dieselben Fakten
aus derselben Komponente, 0052 Zone 3), und er hat eine eigene Route — also
braucht er zuerst ein Seitenprofil `docs/seiten/beleg-detail.md`. Ohne das
würde er Kopfzeile, Aktionsmenü und Vor/Zurück-Navigation der Liste
mitentscheiden, die der Seite gehören.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Einzelwerte ändern (Belegdatum, Einordnung, Erledigung, DATEV-Ablage) | je ein optionaler Callback (`onSetDocumentDate`, `onOverrideClassification`, …) über `InlineEdit` | sobald der View steht — ohne Callback bleibt der Wert lesend |
| Positionen und Vorsteuer | eigener Auftrag 0072 | wenn die Rechnungsposition ihr eigenes Profil hat |

## Spec 2026-09-07 (Skill `spec-schreiben`)

Die Wartebedingung ist weg: das Seitenprofil steht als
`docs/seiten/beleg-detail.md`. Es entscheidet drei Dinge, die diese Spec sonst
geraten hätte — die Rangfolge der Fragen, dass das Original **nicht** hinter
einem Reiter liegt, und dass die Vor/Zurück-Navigation der Seite gehört.

### Einordnung

- **Klasse:** `entities/source-document/`. Der Test aus §2 fällt eindeutig
  aus: Pipeline, Vorsteuer, Belegart sind Ludwig-Fachbegriffe.
- **Regel aus §3:** Nr. 5 — eine neue Entitäts-Form, weil
  `ui-repraesentationen.md` und das Entitätsprofil sie führen und keine
  vorhandene Form sie abdeckt. Der Drawer (0052) beantwortet **die eine
  Frage, die woanders aufkam**; der View beantwortet alle.
- **Zwei Exporte, zwei Dateien** (§4: der eine Teil wird woanders allein
  gebraucht):
  - `SourceDocumentCard.tsx` — M: Kopf, Original, Fakten. Sie wird im View
    gebraucht **und** am Sachverhalt; das Entitätsprofil hat sie deshalb
    2026-09-04 aus dem Jetzt-Satz genommen und 0071 zugeschlagen.
  - `SourceDocumentView.tsx` — L: die Seite ohne den Rahmen der Seite.
- **Setzt auf:** `SourceDocumentPreview` (0075), `SourceDocumentFacts` (0076),
  `SourceDocumentClass`, `SourceDocumentCell` (0074), `EntityHeader` (0048),
  `Tabs`, `Banner`, `StatusBadge`, `LogList`, `SourceDocumentList` (0070).

### Die drei Entscheidungen des Zuschnitts

**1. Der View lädt nichts und kennt keinen Reiter-Inhalt außer dem ersten.**
Fünf der sechs Reiter zeigen Daten, die eigene Server-Aufrufe brauchen
(`getSourceDocExtractionLogs`, `getSourceDocJobs`, `getSourceDocRawBundle` …).
Der View bekommt sie als `tabs: { key, label, content }[]` — er trägt die
Leiste, den aktiven Reiter und den Rahmen. Nur der **erste** Reiter ist seiner:
Original plus Fakten, für jede Belegart dieselbe Ansicht.

**2. Der erste Reiter heißt für jede Belegart gleich.** Heute heißt er
„Buchung", „Vertrag" oder „Beleg" und zeigt in allen drei Fällen dasselbe —
das Original; was sich unterscheidet, ist die Box daneben, und die kommt aus
`SourceDocumentFacts` samt Ausprägungs-Registry. Eine Aufschrift, die sich
ändert, während der Inhalt gleich bleibt, ist eine falsche Fährte (Zweifel 2
des Seitenprofils). Der Reiter heißt **„Beleg"**.

**3. Ein fehlender Pflichtwert ist ein Mangel, keine Leerzeile.** Das fehlende
Belegdatum ist der häufigste Mangel des Bestands (Achse `beleg_haenger`,
Wert `datum_fehlt`) und die Hauptaufgabe dieser Seite. Es steht deshalb nicht
als leeres Feld da, sondern als benannter Mangel mit dem Weg dorthin — das ist
`missing`, eine Prop, keine Fleißarbeit an der Aufrufstelle.

### Schnittstelle — `SourceDocumentCard`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `document` | `SourceDocumentVM` | ja | Kopf und Fakten | `Filled` |
| `preview` | `{ url, unavailableReason }` | nein | Das Original; ohne es steht der Grund da | `WithoutPreview` |
| `href` | `string` | nein | Wohin der Kopf führt (im Kontext einer Liste) | `InUse` |
| `compact` | `boolean` | nein | Ohne Vorschau, nur Kopf und Fakten — der Fall am Sachverhalt | `Compact` |

**Kann bewusst nicht:** bearbeiten. Die Karte ist die lesende Form; die
`InlineEdit`-Werte hängen am View, weil nur dort der Platz für den zweiten
Zustand ist.

### Schnittstelle — `SourceDocumentView`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `document` | `SourceDocumentVM` | ja | Rang 1, 3, 4 | `Invoice` |
| `preview` | `{ url, unavailableReason }` | nein | Rang 2 — das Original, links, ohne Klick | `Invoice`, `WithoutPreview` |
| `tabs` | `{ key, label, content, count? }[]` | nein | Die Reiter **nach** dem ersten; der erste ist der Karte ihrer | `Tabs` |
| `activeTab` | `string` | nein | Aus der URL; ohne ihn steht der erste | `Tabs` |
| `tabHref` | `(key) => string` | nein | Reiter sind Links, kein lokaler Zustand | `Tabs` |
| `missing` | `{ label, hint, action? }[]` | nein | Was fehlt und **wie** es hinkommt — Rang 5 | `Missing` |
| `banner` | `ReactNode` | nein | „wird eingeordnet", „Einordnung fehlgeschlagen" | `Pending` |
| `caseLink` | `{ href, label }` | nein | Rang 6 — „Zum Sachverhalt →" | `Invoice` |
| `family` | `{ parent?, children? }` | nein | Sammel-PDF und Teilbeleg | `Family` |
| `actions` | `ReactNode` | nein | Erledigt-Steuerung, Menü — die Seite bindet sie | `Invoice` |
| `pager` | `{ prevHref?, nextHref?, position? }` | nein | Vor/Zurück; die **Seite** kennt die Liste | `Invoice` |
| `loading` / `error` | wie üblich | nein | Zwei der fünf Zustände | `LoadingAndError` |

**Kann bewusst nicht:**

- **Laden.** Kein Reiter-Inhalt außer dem ersten; alles andere kommt als Prop.
- **Die Liste zeigen.** Vor und Zurück ja, keine eingebettete Tabelle.
- **Buchen.** Der Buchungssatz gehört dem Ereignis am Sachverhalt.
- **Hochladen.** Ein Beleg entsteht in der Inbox oder am Sachverhalt.
- **Entscheiden, welche Reiter es gibt.** Das ist `availableDocTabs()` in der
  App — eine fachliche Ableitung, keine Anzeigefrage.

### Stories

Ableitung nach §6 — je Komponente getrennt.

`SourceDocumentCard` (Titel `v3/Entitäten/Beleg/SourceDocumentCard`):
3 Zustände (gefüllt · ohne Vorschau · Fehler; „leer" entfällt — eine Karte
ohne Beleg wird nicht gerendert, das entscheidet der Aufrufer) + 1 Layout
(`compact`) + 1 „im Einsatz" = **5**.

`SourceDocumentView` (Titel `v3/Entitäten/Beleg/SourceDocumentView`):
4 Zustände (gefüllt · lädt · Fehler · „wird eingeordnet" als eigener Fall;
„leer nach Filter" entfällt — der View hat keinen Filter) + 1 Enum (Belegart:
Rechnung, Vertrag, unklassifiziert nebeneinander) + 1 Layout (`tabs`) +
1 Callback (`missing` mit Aktion) + 1 „im Einsatz" + 1 Rand = **9**.

| Story | Beweist |
|---|---|
| `Invoice` | Der volle Fall: Kopf, Original links, Fakten rechts, Sachverhalts-Weg, Pager |
| `Kinds` | Rechnung, Vertrag, unklassifizierter Scan — **derselbe** erste Reiter, andere Fakten |
| `Tabs` | Die Reiter als Links, der aktive aus `activeTab`, Zähler am Verlauf |
| `Missing` | Das fehlende Belegdatum als **Mangel** mit Weg, nicht als Leerzeile |
| `Pending` | „wird eingeordnet" als Banner, der sagt, dass die Seite sich selbst nachlädt |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und nächsten Schritt |
| `Family` | Sammel-PDF mit Kindern, Teilbeleg mit Verweis aufs Original |
| `WithoutPreview` | Kein Original: der Grund steht da, nicht ein leeres Feld |
| `InUse` | In der `AppShell`, mit dem Zurück-Weg, der die Liste **nennt** |

### Abnahmekriterien

Fest: typecheck · build · Dateien nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 ·
im Browser angesehen.

Variabel:

- [ ] Rang 1–4 des Seitenprofils stehen **ohne Klick und ohne Scrollen** bei 1440 px (gemessen: Kopf, Vorschau und Fakten liegen über der Falz)
- [ ] Der erste Reiter heißt bei allen drei Belegarten gleich (Story `Kinds`, gemessen)
- [ ] Ein fehlender Pflichtwert steht als Mangel mit Weg, nie als leeres Feld (Story `Missing`)
- [ ] Der View lädt nichts: kein Modul-Import, kein `await` (`grep`)
- [ ] Reiter sind Links über `tabHref`, kein lokaler Zustand (`grep`: kein `useState` für den Reiter)
- [ ] Die Karte zeigt dieselben Fakten wie der Drawer — **aus derselben Komponente** (`grep`: beide auf `SourceDocumentFacts`)
- [ ] `compact` lässt die Vorschau weg und nichts anderes (Story `Compact`, gemessen)
- [ ] Vor/Zurück kommt als Prop; der View kennt keine Liste (`grep`)
- [ ] offen (App): ersetzt `SourceDocFamily`, `InvoiceSidebar`, `DocTabsBar`, `SourceDocBelegTab`, den Anzeigeteil von `ContractDetail` — und die fünf Editoren, sobald der Ausbau steht

### Offene Fragen

1. **Sechs Reiter oder vier?** *Ohne Antwort: vier* (Beleg, Positionen,
   Vorsteuer, Verlauf) — Pipeline und Rohdaten werden Tiefe im Verlauf.
   Der View merkt davon nichts: er bekommt die Liste, die er bekommt.
2. **Trägt der View die `InlineEdit`-Werte?** *Ohne Antwort: ja*, je Wert ein
   optionaler Callback; fehlt er, bleibt der Wert lesend.
3. **Wie breit ist die Fakten-Spalte?** *Ohne Antwort: `minmax(400px, 560px)`
   wie heute*, mit dem Original links in `minmax(0, 1fr)`.

### Ausbau (A12)

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Einzelwerte ändern (Belegdatum, Einordnung, Erledigung, DATEV-Ablage) | je ein optionaler Callback (`onSetDocumentDate`, `onOverrideClassification`, `onComplete`, `onImportDatevMeta`) | sobald der View steht — ohne Callback bleibt der Wert lesend |
| Positionen und Vorsteuer als eigene Reiter-Inhalte | 0072 (Rechnungsposition braucht ihr eigenes Profil) | wenn 0072 eine Zeile hat |
| Vertragsfelder bearbeitbar | 0073 | wenn es Verträge im Bestand gibt (heute 0 Zeilen) |

### Befunde für `ludwig/app`

- **Neu (L-82):** `ProcessingProgress` hängt an der Rechnungszeile, nicht am
  Beleg. Ein Vertrag, der in der Extraktion steckt, zeigt keinen Fortschritt —
  nur leere Fakten. Der Fortschritt gehört an den Beleg, wo auch die Achse
  `beleg` hängt.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: zurück — Zuschnitt neu, die drei Entscheidungen der Spec bleiben.** Owner-Entscheid zur neuen Frage: **Rahmen mit Slots wie 0050**, kein datengetriebener View — zwölf Datenprops sind eine zweite Seite. Entscheide: 1 vier Reiter (App-Frage, der View merkt nichts) · 2 `InlineEdit` im View ist eine Folgeaufgabe, nicht Teil dieser (vier Callbacks wären vier Stories über der Grenze, A12 verbietet Props ohne Verhalten) · 3 Fakten-Spalte `minmax(400px, 560px)` in `v3.css`.

Neuer Zuschnitt (vorab freigegeben, wenn die Neufassung dem folgt): (1) `SourceDocumentView` = Rahmen mit den Slots `pager` · `header` · `banner` · `tabs` · `children`, Reihenfolge fest nach Rang 1–9, Server-Component, keine Datenprops; 0050 als Vorbild zitieren; `RecordPager` mit `back` und `total`, `EntityHeader actions`/`facts` für Aktionen und Sachverhaltslink. (2) `SourceDocumentCard` = Inhalt des ersten Reiters: `SourceDocumentPreview` links, `SourceDocumentFacts` rechts, `SourceDocumentList` (Teilbelege) darunter; Props in der Form von `SourceDocumentQuickView` (`document, summary, previewUrl, previewUnavailableReason, excerpt, group`) plus `children`; kein eigener Kopf — Rang 1 trägt der `EntityHeader`, sonst zwei Kopfzeilen (Zweifel 1 des Seitenprofils); `compact` streichen → Ausbau. Zweiter Abnehmer: der Drawer-Body rendert dieselbe Karte mit `tone="bare"` (0052-Kriterium „Zone 3 = dieselbe Komponente wie der View"). (3) `missing` als eine Prop an `SourceDocumentFacts` (§3 Regel 2): `missing?: { field, hint, action? }[]` oder Ableitung aus der Achse `beleg_haenger` — der Mangel steht je Wert an seinem Platz, nicht als Liste im View. (4) Rang 4: im Kopf führt die Erledigung (`beleg_erledigung`), `beleg` nur bei Rechnungszeile in Fakten/Banner, `SourceDocumentClass` in `meta`. (5) Abschnitt „Verhalten" ergänzen (J/K über `RecordPager`, Fokus nach Reiterwechsel, Server/Client). (6) Kopf: Seitenprofil unter „Quelle"; „Ersetzt" bereinigen (`SourceDocPipelineTab`/`SourceDocVerlaufTab` sind Reiter-Inhalte, die der View nicht rendert; die fünf Editoren als Folgeaufgabe). (7) Abnahme: „bei 1440 × 900" statt „bei 1440 px"; Karten-Stories auflisten; den Fehler-Zustand einer Karte mit Pflicht-`document` streichen oder begründen.

Seitenprofil `beleg-detail.md` nachziehen: Rang 4 sagt, welcher Zustand im Kopf führt (die Erledigung); der Nebenjob „Zurück zur Liste" bekommt sein Element (`RecordPager back`); `Link` → `TextButton`, `RawDataView` → `RawRecord`; `compact` hat keine Frage und fällt.

Bau-Reihenfolge: `SourceDocumentFacts` + `missing` → `SourceDocumentCard` (mit Drawer-Nachzug) → `SourceDocumentView`. Befunde ins Register: **L-92** — `belegTabLabel()` in `modules/source-docs/domain/tabs.ts` (Buchung/Vertrag/Beleg) widerspricht Entscheidung 2 („Beleg" für alle); bei vier Reitern auch `DOC_TABS`/`parseDocTab`. **L-93** — `SourceDocumentVM` (`SourceDocument.tsx`) ist v3-lokal ohne Spiegel-Gegenstück; nur das Durchreichen (L-79) steht im Register, nicht der Typ.

## Neufassung 2026-09-07 nach der Freigabe — Rahmen mit Slots

Die erste Fassung schnitt den View als **datengetriebene Ansicht** mit zwölf
Props. Die Freigabe hat das zurückgewiesen, und zwar mit dem Argument, das
diese Spec selbst hätte finden müssen: **zwölf Datenprops sind eine zweite
Seite** — eine, die bei jedem neuen Reiter, jeder neuen Aktion und jedem neuen
Zustand mit der ersten in Schritt gehalten werden muss. Der Zuschnitt ist
jetzt der von 0050: ein Rahmen mit Slots, der ordnet und nichts weiß.

### Drei Bausteine, in dieser Reihenfolge gebaut

**1. `SourceDocumentFacts` bekommt `missing`.** Nach §3 Regel 2: ein `@when`
deckt den Fall zu vier Fünfteln, und was fehlt, ist **eine** Prop.

```ts
missing?: readonly { field: string; hint: string; action?: ReactNode }[]
```

Der Mangel ersetzt den **Wert seiner Zeile**, er steht nicht als Liste
daneben. Das ist die ganze Entscheidung: ein Mangel, der weg von seinem Feld
steht, lässt das Feld bloß leer aussehen — und ein leeres Feld sieht aus wie
nichts zu tun. Ein Eintrag, dessen `field` keine Zeile trifft, wird **nicht**
still verschluckt, sondern steht am Ende: ein Mangel, den niemand sieht, ist
schlimmer als einer in der falschen Zeile.

**2. `SourceDocumentCard` — der Inhalt des ersten Reiters.** Original links,
gelesene Werte rechts, Teilbelege darunter. Props in der Form von
`SourceDocumentQuickView` plus `parts`, `missing`, `tone` und `children`.

Sie hat **keinen eigenen Kopf**: im View sagt der `EntityHeader` darüber
schon, welcher Beleg das ist, im Drawer der Drawer-Titel — zwei Titelzeilen
sind der erste Zweifel des Seitenprofils am heutigen Screen. `compact` ist
gestrichen und in den Ausbau gewandert; es hatte keine Frage, die es
beantwortet.

**Der Drawer rendert dieselbe Karte** mit `tone="bare"`. Das ist die Regel aus
0052 („Zone 3 ist dieselbe Komponente wie der View"), und der sicherste Weg,
sie zu halten, ist, den Drawer den ersten Reiter rendern zu lassen, statt
seine Zonen ein zweites Mal zu bauen.

**3. `SourceDocumentView` — der Rahmen.** Fünf Slots in fester Reihenfolge:

| Slot | Was hineingehört | Rang |
|---|---|---|
| `pager` | `RecordPager` mit `back` (nennt die Liste) und `total` | 9 |
| `header` | `EntityHeader` — Titel, **Erledigung** als Zustand, `SourceDocumentClass` als `meta`, Aktionen und der Sachverhaltsweg in `actions` | 1, 4 |
| `banner` | „wird eingeordnet" (samt dem Satz, dass die Seite sich selbst nachlädt), „Einordnung fehlgeschlagen", der Hinweis auf das Sammel-Original | — |
| `tabs` | `Tabs` — vier, nicht sechs; welche, ist die Frage der App, nicht des Rahmens | 7–9 |
| `children` | der Inhalt des aktiven Reiters; im ersten steht die Karte | 2, 3, 5, 6 |

Keine Datenprops, kein Laden, keine eigene Höhe über den oberen Slots — die
Ränge 1–4 sollen ohne Scrollen dastehen, und wer hier einen Scroll-Container
setzt, nimmt genau das weg.

### Rang 4: welcher Zustand im Kopf führt

Die **Erledigung** (`beleg_erledigung`), nicht die Verarbeitung. Die Achse
`beleg` hängt an der Rechnungszeile und hat für 16 % aller Belege überhaupt
keinen Wert (Befund L-42) — ein Kopf, dessen Zustand bei jedem sechsten Beleg
leer bleibt, ist kein Kopf. `beleg` steht dort, wo sie hingehört: in den
Fakten und, wenn die Pipeline hängt, im Banner. Die vier Einordnungs-Achsen
stehen als `meta` unter dem Titel.

### Verhalten

- **Tastatur:** `J`/`K` für vor und zurück kommen von `RecordPager`; der
  Rahmen bindet nichts.
- **Reiterwechsel:** die Reiter sind Links (`href`), kein lokaler Zustand —
  der Fokus liegt nach dem Wechsel dort, wo der Browser ihn hinlegt, und der
  Inhalt kommt vom Server. Der Rahmen hält keinen Zustand.
- **Server/Client:** Rahmen und Karte sind Server-Komponenten. Was Zustand
  braucht, bringt der Aufrufer mit (`Tabs` mit `href` ist statisch).

### Stories

`SourceDocumentCard` (Titel `v3/Entitäten/Beleg/SourceDocumentCard`):
3 Zustände (gefüllt · ohne Vorschau · mit Mangel — „leer" entfällt, eine
Karte ohne Beleg wird nicht gerendert; „lädt" und „Fehler" gehören dem
Aufrufer, im Drawer bewiesen) + 1 Layout (`parts`) + 1 Enum (`tone`) = **5**.

| Story | Beweist |
|---|---|
| `Filled` | Original links, Fakten rechts, keine eigene Kopfzeile |
| `Missing` | Der Mangel an der Stelle des Wertes, mit dem Weg dorthin |
| `WithoutPreview` | Kein Original: der Grund steht da |
| `WithParts` | Teilbelege **unter** den zwei Spalten, als eigene Form |
| `Bare` | `tone="bare"` — so rendert der Drawer sie |

`SourceDocumentView` (Titel `v3/Entitäten/Beleg/SourceDocumentView`):
4 Zustände (gefüllt · „wird eingeordnet" · lädt · Fehler) + 1 Layout (anderer
Reiter) + 1 Rand (ohne Pager und ohne Reiter) = **5** (Laden und Fehler in
einer Story = 5 Dateien).

| Story | Beweist |
|---|---|
| `Filled` | Die fünf Slots in ihrer Reihenfolge, Ränge 1–4 ohne Scrollen |
| `Pending` | Der Banner gehört dem Beleg, nicht einem Reiter |
| `OtherTab` | Derselbe Rahmen, anderer Inhalt — der View lädt nichts |
| `LoadingAndError` | Kopf und Reiter bleiben stehen; der Fehler nennt den Weg |
| `Bare` | Ohne Pager und Reiter fallen beide Zeilen **samt Abstand** |

### Abnahmekriterien

Fest: typecheck · build · Dateien nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 ·
im Browser angesehen.

Variabel:

- [ ] Der Rahmen hat **keine** Datenprops (`grep`: nur `ReactNode`-Slots)
- [ ] Der View lädt nichts (`grep`: kein Modul-Import, kein `await`, kein `useState`)
- [ ] Die Karte hat **keine** eigene Kopfzeile (`grep`: kein `CardHead`, kein Titel-Element)
- [ ] Der Drawer rendert **dieselbe** Karte (`grep`: `SourceDocumentCard` in `SourceDocumentDrawer.tsx`)
- [ ] Ein fehlender Pflichtwert steht **an der Stelle des Wertes** (Story `Missing`, gemessen)
- [ ] Ein `missing`-Eintrag ohne passende Zeile geht nicht verloren (Story `Missing`, zweiter Eintrag)
- [ ] Die Fakten-Spalte ist `minmax(400px, 560px)`; die Karte misst **sich selbst**, nicht das Fenster (gemessen: im Drawer eine Spalte, auf der Seite zwei)
- [ ] Im Kopf führt die **Erledigung**, nicht die Verarbeitung (Story `Filled`, `grep`)
- [ ] Bei 1440 × 900 stehen Ränge 1–4 ohne Scrollen (gemessen; siehe Vorbehalt unten)
- [ ] Ohne `pager` und ohne `tabs` fallen die Zeilen samt Abstand (Story `Bare`, gemessen)
- [ ] offen (App): ersetzt `SourceDocFamily`, `InvoiceSidebar`, `DocTabsBar`, `SourceDocBelegTab` und den Anzeigeteil von `ContractDetail`

**Der Vorbehalt ist eingelöst (2026-09-07).** Er lautete: die Vorschau steht
auf 795 px, bei 1440 × 900 ist das Original angeschnitten. Der Owner-Entscheid
zur Vorschauhöhe ist umgesetzt (0075) — eine Höhe für jede Stelle,
`clamp(320px, 62vh, 900px)`. Gemessen im View bei 1440 × 900: Vorschau
338–896, Faktenspalte 267–790. Die Ränge 1–4 stehen damit vollständig über der
Falz, ohne Scrollen und ohne Klick.

### Ausbau (A12)

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Einzelwerte ändern (Belegdatum, Einordnung, Erledigung, DATEV-Ablage) | je ein optionaler Callback über `InlineEdit` in den Fakten | **eigene Folgeaufgabe** — vier Callbacks wären vier Stories über der Grenze, und A12 verbietet Props, die nichts tun |
| `compact` an der Karte | eine Prop, die die Vorschau weglässt | wenn eine Stelle die Karte ohne Original braucht; heute gibt es keine |
| Positionen und Vorsteuer | 0072 | wenn die Rechnungsposition ihr Profil hat |

### Befunde für `ludwig/app`

- **L-92** — `belegTabLabel()` benennt den ersten Reiter je nach Belegart
  („Buchung" / „Vertrag" / „Beleg") und widerspricht damit dem Entscheid, dass
  er für jede Belegart gleich heißt: er zeigt in allen drei Fällen dasselbe.
  Bei vier statt sechs Reitern sind zusätzlich `DOC_TABS` und `parseDocTab`
  nachzuziehen.
- **L-93** — `SourceDocumentVM` ist v3-lokal und hat kein Gegenstück im
  Spiegel; im Register stand bisher nur das Durchreichen (L-79), nicht der
  Typ selbst.
- **L-82** (`ProcessingProgress` hängt an der Rechnungszeile) bleibt.
