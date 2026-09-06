# 0071 · Beleg-Detailansicht — `SourceDocumentView`

| | |
|---|---|
| Status | spec |
| Stufe | `entities/source-document/` — `SourceDocumentView` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Pipeline, Vorsteuer und Belegart sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Formen-Tabelle |
| Ersetzt | `SourceDocFamily`, `InvoiceSidebar`, `DocTabsBar`, `SourceDocBelegTab`, `SourceDocPipelineTab`, `SourceDocVerlaufTab`, den Anzeige-Teil von `ContractDetail` |
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
