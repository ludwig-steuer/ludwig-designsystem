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

- **Tastatur: keine.** Der Rahmen bindet nichts, und `RecordPager` bindet
  seine Tasten **nur in der Callback-Ausprägung** — hier steht er mit
  `prevHref`/`nextHref`, also als Server-Link ohne Zustand. Der Nebenjob des
  Seitenprofils („darf kosten: eine Taste") ist damit nicht eingelöst; er
  steht im Ausbau, weil er `RecordPager` betrifft und nicht diesen Rahmen.
  Eine gedruckte Taste ohne Wirkung wäre der Verstoß, den V14 meint — der
  Pager druckt hier keine.
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
Reiter) + 1 Rand (ohne Pager und ohne Reiter) + **1 „im Einsatz"** = **6**
(Laden und Fehler stehen in einer Story). Der Summand „im Einsatz" ist nach
der Abnahme vom 2026-09-07 nachgetragen: er fehlte, und genau dadurch wurde
ein Layout-Kriterium im Story-Rahmen gemessen statt an der Stelle, an der die
Komponente steht.

| Story | Beweist |
|---|---|
| `Filled` | Die fünf Slots in ihrer Reihenfolge, Ränge 1–4 ohne Scrollen |
| `Pending` | Der Banner gehört dem Beleg, nicht einem Reiter |
| `OtherTab` | Derselbe Rahmen, anderer Inhalt — der View lädt nichts |
| `LoadingAndError` | Kopf und Reiter bleiben stehen; der Fehler nennt den Weg |
| `Bare` | Ohne Pager und Reiter fallen beide Zeilen **samt Abstand** |
| `InUse` | Der Rahmen in der `AppShell` — Sidebar, Kopfleiste, der Beleg darin. Hier hat die Karte die Breite, die sie auf der Seite bekommt (1.136 px bei 1440 × 900), nicht die 1.400 der übrigen Stories |

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
- [ ] Bei 1440 × 900 stehen Ränge 1–4 ohne Scrollen (gemessen) — **die Bedingung ist die Fensterhöhe**: die Vorschau ist 62 vh, also gilt der Satz ab ≈ 890 px. Darunter ist das Original angeschnitten; das ist die Grenze, nicht ein Fehler
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

## Abnahme 2026-09-07 (fremder Abnehmer, nur Spec und Code gelesen)

**Urteil: zurück.** Zwei Kriterien sind gemessen nicht erfüllt, eines davon
kostet die Hauptaussage der Seite. Der Zuschnitt selbst ist eingehalten: der
Rahmen ist ein Rahmen, die Karte ist einmal gebaut und wird zweimal benutzt.

Gemessen im laufenden Storybook (Dev-Server 6107, CDP, `deviceScaleFactor` 1,
Fenster 1440 × 900 wo nicht anders genannt).

### Feste Kriterien

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` | Exit 0 | erfüllt |
| `pnpm build` | „Storybook build completed successfully", Exit 0 | erfüllt |
| `pnpm check:icons` | „in Ordnung. 53 Zeichen in der Registry" | erfüllt |
| Dateien nach der Familie | `SourceDocumentView.tsx`, `SourceDocumentCard.tsx` samt Stories unter `entities/source-document/`; beide über `src/ui/v3/index.ts:330–333` exportiert | erfüllt |
| Code englisch mit `@when`/`@instead` | View Z. 22–25, Karte Z. 61–65; Bezeichner und Kommentare englisch, Deutsch nur in Nutzertexten | erfüllt |
| Kein Hex, keine lokale Label-Map | `grep -E '#[0-9a-fA-F]{3,8}|[0-9]+px'` in beiden Dateien: nichts; die Belegart kommt aus `sourceDocTypeLabel()`, die Zustände aus der Registry (`StatusBadge`, `SourceDocumentCompletion`) | erfüllt |
| Alle Stories | View 5 (`Filled`, `Pending`, `OtherTab`, `LoadingAndError`, `Bare`), Karte 5 (`Filled`, `Missing`, `WithoutPreview`, `WithParts`, `Bare`) — genau die Tabelle der Neufassung; Titel `v3/Entitäten/Beleg/…` | erfüllt, mit Anmerkung (siehe M3) |
| §9 | Zahl rechts mit `tnum`, Fließtext links (`.v2doc__prose`, `.v2doc__gap` mit `text-align: left`); jeder farbige Zustand trägt ein Wort („Gebucht", „Offen", „fehlt" am Warnzeichen); Karte hat Rand statt Schatten; keine Versalien | erfüllt |
| Im Browser angesehen | 10 Stories geladen, **0** Konsolenmeldungen (weder Fehler noch Warnung); Bildbelege im Scratchpad (`ab71-view-filled.png`, `ab71-view-pending.png`, `ab71-view-le.png`, `ab71-card-missing.png`) | erfüllt |

### Variable Kriterien

**1. Der Rahmen hat keine Datenprops.** `SourceDocumentView.tsx` Z. 27–53:
fünf Props, alle `ReactNode` (`pager`, `header`, `banner`, `tabs`,
`children`). Kein Typ aus `src/ludwig/`, kein Import außer
`import type { ReactNode }`. **Erfüllt.**

**2. Der View lädt nichts.** Einziger Import ist der Typ-Import in Z. 1; kein
`await`, kein `useState`, kein `"use client"` (grep über die Datei leer).
**Erfüllt.**

**3. Die Karte hat keine eigene Kopfzeile.** Kein `CardHead`, kein `h1`–`h6`
in `SourceDocumentCard.tsx`. Was sie trägt, sind zwei Blockaufschriften
(`.v2doc__h` „Belegdaten", „Teilbelege") über je einem Block — kein Titel des
Belegs. Im Bild (`ab71-view-filled.png`) steht der Name des Belegs genau
einmal, im `EntityHeader`. **Erfüllt.**

**4. Der Drawer rendert dieselbe Karte.**
`SourceDocumentDrawer.tsx:20, 189–203` — `SourceDocumentCard` mit
`tone="bare"`, Zone 4 als `children`. Gemessen in
`sourcedocumentdrawer--geoeffnet`: die Fakten tragen `v2fields v2fields--bare`,
also wirkt der Ton. **Erfüllt.**

**5. Ein fehlender Pflichtwert steht an der Stelle des Wertes.** Gemessen in
`sourcedocumentcard--missing`, Zeilen der Feldliste in Reihenfolge:
Belegart (y 76) · **Gegenpart** (y 107, Mangel) · **Belegdatum** (y 138,
Mangel mit „Datum setzen") · Eingang (169) · Kennung (200) · Erledigung (231).
Der Mangel ersetzt den Wert seiner Zeile, es gibt keine Mangel-Liste daneben.
Der Weg (`action`) hängt im Wert. **Erfüllt.**

**6. Ein `missing`-Eintrag ohne passende Zeile geht nicht verloren
(Story `Missing`, zweiter Eintrag). NICHT ERFÜLLT.** Der zweite Eintrag der
Story hat `field: "Gegenpart"` — und „Gegenpart" **ist** eine der acht
generischen Zeilen (`SourceDocumentFacts.tsx:120`). Gemessen: der Mangel sitzt
in Zeile 2 (y 107), also im *getroffenen* Fall; der Anhang-Pfad
(`SourceDocumentFacts.tsx:164–166`) wird von keiner Story ausgeführt —
`SourceDocumentFacts.stories.tsx` kennt `missing` überhaupt nicht. Der Code
tut vermutlich das Richtige, aber das Kriterium verlangt den Nachweis, und den
gibt es nirgends. Siehe M2.

**7. Die Fakten-Spalte ist `minmax(400px, 560px)`; die Karte misst sich
selbst, nicht das Fenster. Halb erfüllt.**
*Selbstmessung: erfüllt.* Gemessen im Drawer bei 1440 **und** 1920 px
Fensterbreite: Kartenbreite beide Male 1060, Spuren beide Male `1060px` —
eine Spalte, unabhängig vom Fenster. In der Story auf der Seite bei 1440:
Karte 1400, Spuren `824px 560px` — zwei Spalten. Container-Query, nicht Media
Query.
*Wertebereich: nicht erfüllt.* Die untere Schranke der Spur ist unerreichbar.
Gemessen über den ganzen Bereich, in dem es zwei Spalten gibt
(Kartenbreite 1400 / 1240 / 1180): Spuren `824px 560px` · `664px 560px` ·
`604px 560px` — die Faktenspalte steht **immer** auf 560, weil das Tor
`@container doccard (min-width: 1180px)` (v3.css:2420) schon vorher auf eine
Spalte schaltet. `minmax(400px, 560px)` verhält sich damit wie `560px`. Das
ist die Ursache von M1.

**8. Im Kopf führt die Erledigung, nicht die Verarbeitung.**
`SourceDocumentView.stories.tsx:84` — `status={<SourceDocumentCompletion …>}`;
die vier Einordnungs-Achsen stehen als `meta`. Im Bild: „Gebucht" neben dem
Titel, „Leistungsbeleg"/„Eingangsrechnung" darunter; im `Pending`-Fall „Offen"
und keine Chips. **Erfüllt.**

**9. Bei 1440 × 900 stehen Ränge 1–4 ohne Scrollen. NICHT ERFÜLLT im Rahmen,
in dem die Seite läuft.**
*In der Story:* pager 20–48 · Kopf 68–184 · Reiter 204–247 · Fakten 267–790 ·
Original 338–896 — Ränge 1–4 über der Falz, die Zahlen der Spec sind
bestätigt.
*Auf der Seite:* die Story gibt der Karte 1400 px, die Seite gibt ihr 1104.
Gemessen an `casedetailview--in-use` (die einzige v3-Story in der `AppShell`)
bei 1440 × 900: `.app__main` 1168 breit, Inhalt **1104** (Sidebar 240 +
2 × 32 Padding; `--container-app` 1440 greift erst ab 1920). Bei 1104 fällt
die Karte auf eine Spalte. Gemessen im laufenden View, dessen Rahmen auf
1144 px verengt wurde (Karte damit 1104): Spuren `1104px`, „Belegdaten"
beginnt bei **y = 933**, die Fakten enden bei 1456, `scrollHeight` 1476 statt
937. Rang 3, 5 und 6 stehen unter der Falz. Auch voll ausgebrochen
(`.bd-page`, `margin-inline: -32px`) sind es nur 1168 px — 12 px unter dem
Tor. Zwei Spalten gibt es erst ab ≈ 1484 px Fensterbreite. Siehe M1.

**10. Ohne `pager` und ohne `tabs` fallen die Zeilen samt Abstand.** Gemessen
in `sourcedocumentview--bare`: die View hat genau zwei Kinder
(`__head` y 20–136, `__body` y 156–806), Zeilenabstand 20 px — derselbe wie
zwischen zwei vorhandenen Slots in `Filled` (pager 20–48, Kopf 68–184: 20 px).
Kein leerer Kasten, kein doppelter Abstand, kein Vorlauf über dem Kopf.
**Erfüllt.**

**11. Offen (App):** Ersatz von `SourceDocFamily`, `InvoiceSidebar`,
`DocTabsBar`, `SourceDocBelegTab` und dem Anzeigeteil von `ContractDetail` —
nicht Gegenstand dieser Abnahme, bleibt offen.

### Mängel

**M1 (blockiert) — das Tor der zweiten Spalte ist gegen die Story gemessen,
nicht gegen die Seite.** Kriterium 9 und 7. `@container doccard
(min-width: 1180px)` (v3.css:2420) folgt der Rechnung 560 + 600 + 16; 1180
gibt es aber nur im Story-Rahmen (`maxWidth: 1500`). Auf der Seite sind es
1104 (gemessen), voll ausgebrochen 1168 — beide unter dem Tor. Folge: bei
1440 × 900, genau der Größe, die das Kriterium nennt, steht Rang 3 bei y 933
statt bei 267. Vorschlag: die Faktenspalte ihren Bereich wirklich benutzen
lassen und das Tor auf die Summe der Minima setzen —
`grid-template-columns: minmax(600px, 1fr) minmax(400px, 560px)` mit
`@container doccard (min-width: 1016px)`. Bei Kartenbreite 1104 ergibt das
Original 600 / Fakten 488, also zwei Spalten auf der Seite, und
`minmax(400px, 560px)` tut endlich etwas. Danach bei 1280 und 1440 **in der
`AppShell`** nachmessen, nicht im Story-Rahmen.

**M2 (blockiert, ein Einzeiler) — der zweite `missing`-Eintrag trifft eine
Zeile.** Kriterium 6. `field: "Gegenpart"` ist eine der acht generischen
Zeilen; gemessen sitzt der Mangel in Zeile 2. Der Fall, den das Kriterium
verlangt, wird nirgends gezeigt. Vorschlag: den zweiten Eintrag auf ein Feld
setzen, das keine Zeile hat (z. B. „DATEV-Ablage" oder „Fälligkeit"), dann
steht er sichtbar am Ende der Liste.

**M3 (blockiert nicht) — zwei Props der Karte ohne eigene Story.** `excerpt`
und die Teilbeleg-Ausprägung von `group` („beim Teilbeleg der Hinweis auf das
Original", Rang 6 des Seitenprofils) kommen in keiner Karten-Story vor.
Beide sind reine Durchreichen und eine Stufe tiefer bewiesen
(`sourcedocumentpreview--excerpt`, die Gruppen-Stories von 0076) — deshalb
kein Blocker. Vorschlag: `WithParts` um den Teilbeleg-Fall ergänzen oder im
Story-Kommentar sagen, wo der Nachweis steht.

**M4 (blockiert nicht) — J/K gibt es in dieser Bauart nicht.** Der Abschnitt
„Verhalten" sagt: „`J`/`K` für vor und zurück kommen von `RecordPager`; der
Rahmen bindet nichts." Gemessen in `Filled`: `j` und `k` bewegen nichts
(`location.hash` bleibt leer), es steht kein `Kbd` in der Pager-Zeile.
Grund: `RecordPager` bindet die Tasten nur in der Callback-Ausprägung
(`RecordPager.tsx:37, 44–45, 64–70` — „a key cannot follow an `href`"), die
Story benutzt `prevHref`/`nextHref`. Der Nebenjob des Seitenprofils („darf
kosten: eine Taste") ist damit nicht eingelöst. Vorschlag: entweder die Story
zeigt den Pager in der Ausprägung, die Tasten hat, oder der Satz im Abschnitt
„Verhalten" sagt, dass die Seite dafür die Callback-Ausprägung nehmen muss.

### Befunde am Set (kein Kriterium)

- **Rang 4 ist nur zur Hälfte beantwortet.** Das Seitenprofil legt die
  Verarbeitung (Achse `beleg`) in die Fakten. `SourceDocumentFacts` liest
  `processingStatus` nirgends; die Achse erscheint allein in
  `source-document-columns.tsx:385`. Ein Beleg, der in der Pipeline hängt,
  zeigt in der Karte nichts davon — dieselbe Lücke, die Befund L-82 für die
  App beschreibt, hier auf der v3-Seite.
- **„Rechnung" steht viermal auf einem Schirm:** Chip „Eingangsrechnung" im
  Kopf, Kartenkopf der Vorschau „Rechnung", Faktenzeile „Belegart: Rechnung",
  Blocktitel der Ausprägung „Rechnung". Jede Wiederholung kostet Höhe über
  der Falz, die nach M1 knapp ist.
- **Die Story-Ableitung der Neufassung lässt „im Einsatz" weg** (§6 führt es
  als festen Summanden), ohne den Grund zu nennen; die erste Fassung hatte
  `InUse` „in der `AppShell`". Genau diese Story hätte M1 gezeigt.
- **Der untere Rand des Vorschau-Rahmens ist bei 900 px Fensterhöhe
  angeschnitten** (Karte bis y 917, `scrollHeight` 937). Das Original selbst
  endet bei 896. Die Spec nennt das die Grenze, nicht den Fehler — hier nur
  festgehalten.

## Nacharbeit zur Abnahme vom 2026-09-07

**M1 erledigt — das Zwei-Spalten-Tor war gegen die Fixture gerechnet.** Es
stand auf 1.180 px Kartenbreite; die Karte bekommt auf der Seite aber weniger,
weil Sidebar und Polster abgehen. Neu: Tor bei **960 px**, Spuren
`minmax(560px, 1fr) minmax(384px, 560px)` — die Summe der Minima. Gemessen in
der neuen Story `InUse`, also in der `AppShell`, nicht im Story-Rahmen:

| Fensterbreite | Karte | Spuren | Fakten beginnen bei |
|---|---|---|---|
| 1280 (Untergrenze L1) | 976 px | 560 / 400 | y = 335 |
| 1440 | 1.136 px | 560 / 560 | y = 335 |
| 1600 | 1.296 px | 720 / 560 | y = 335 |

Vorher fiel die Karte bei 1280 **und** 1440 auf eine Spalte, und die Fakten
begannen bei y = 1.001 — Rang 3, 5 und 6 standen unter der Falz. Kein Überlauf
in der Karte bei keiner der drei Breiten. Die Faktenspur ist jetzt auch
wirklich veränderlich (400 bei 1280, 560 ab 1440); die Abnahme hatte zu Recht
angemerkt, dass sie vorher immer auf 560 stand.

**M2 erledigt.** Der zweite `missing`-Eintrag der Story hieß „Gegenpart" — eine
der acht generischen Zeilen, also traf er den Zuordnungs-Pfad und nie den
Anhang. Er heißt jetzt „Fälligkeit". Gemessen in `SourceDocumentCard` →
`Missing`: die Zeilen enden auf „Fälligkeit · Steht auf dem Beleg, ist aber
nicht gelesen worden.", der Mangel steht also am Ende der Liste, wie der
Anhang-Pfad ihn setzt.

**M4 erledigt — am Text, nicht am Code.** Der Abschnitt „Verhalten" behauptete
`J`/`K` über `RecordPager`. Das stimmt nur für dessen Callback-Ausprägung;
hier steht er mit `prevHref`/`nextHref`. Der Satz ist berichtigt, der fehlende
Weg steht im Ausbau — er gehört `RecordPager` (0047), nicht diesem Rahmen.

**M3 bleibt bewusst offen.** `excerpt` und die Teilbeleg-Ausprägung von
`group` sind reine Durchreichen; ihre Wirkung ist eine Stufe tiefer bewiesen
(0075 für den Auszug, 0076 für die Teilbelege). Eine Karten-Story dafür würde
dieselbe Sache ein zweites Mal zeigen.

**Der dritte Befund der Abnahme war der wichtigste.** Die Story-Ableitung der
Neufassung hatte „im Einsatz" weggelassen, obwohl `spec-schreiben` §6 sie als
festen Summanden führt — und genau diese Story hätte M1 gezeigt. Sie ist
nachgebaut (`InUse`, der View in der `AppShell` mit Sidebar und Kopfleiste)
und steht in der Ableitung. Das ist die Lehre, nicht der Zahlenwert: **ein
Layout-Kriterium, das nur im Story-Rahmen gemessen wird, misst die Fixture.**

**Die zwei übrigen Befunde am Set** stehen ohne Nacharbeit, mit Adresse:

- **Rang 4 nur halb beantwortet:** `SourceDocumentFacts` liest
  `processingStatus` nirgends — die Achse `beleg` steht allein in
  `source-document-columns.tsx`. Ein hängender Beleg zeigt in der Karte
  nichts. Das gehört zu **0076** (die Fakten), nicht zum Rahmen.
- **„Rechnung" viermal auf einem Schirm** (Kopf-Chip, Kartenkopf der Vorschau,
  Faktenzeile „Belegart", Blocktitel der Ausprägung). Kostet Höhe über der
  Falz. Gehört zu **0075/0076**, wo die Köpfe entstehen.
