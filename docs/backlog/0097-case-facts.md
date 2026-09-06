# 0097 · CaseFacts — die Fakten eines Sachverhalts, einmal

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/accounting-case/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: fünfzehn Felder genau dieser Entität, zwei davon mit Ludwig-Regeln am Nullwert |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `CaseFacts`; Ränge 11–16, mit `all` bis 25 |
| Ersetzt | die Faktenzeile aus `sachverhalt/parts.tsx` `Hero`, die Portal-Meta-Zeile in `PortalCaseList` und den Kennzahl-Streifen aus `CaseOverviewBox` |
| Voraussetzung | keine — sie steht **vor** dem View, weil 0052 verlangt, dass der Drawer die Kernfakten aus derselben Komponente zeigt |
| Blockiert | `CaseDetailView` (0050), `CaseDrawer` (0098), `CaseCard` (0081) |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Wer einen Sachverhalt aufschlägt, will wissen, was an ihm hängt: gegen
welches Konto er läuft, wer der Partner ist, was der Agent zusammengefasst
hat, ob ein Beleg erwartet wird. Heute stehen diese Fakten an **drei** Orten
in **drei verschiedenen Sätzen** — der Kopf zeigt Eröffnet, Abgeschlossen,
Personenkonto und Geschäftspartner; die Box zeigt vier Kinder-Zähler und
einen aus den Ereignissen errechneten Gegenpart; das Portal zeigt Nummer,
Art, Betrag und Eröffnet. Keiner der drei Sätze ist eine Teilmenge der
anderen.

`CaseFacts` **vereinheitlicht sie — es hebt keine bestehende Liste.** Das ist
der Unterschied zu den meisten Aufgaben dieses Sets und der Grund, warum die
Reihenfolge hier aus dem Profil kommt und nicht aus dem Bestand.

## Einordnung

- **Wiederverwenden:** `FieldList` trägt die Paare, `Amount`, `Time`,
  `MonoCell` die Werte, `StatusBadge` den Belegnummern-Modus, `LongText` die
  Zusammenfassung. Es fehlt die Auswahl und die Reihenfolge.
- **Neu, weil:** `spec-schreiben` §3 Regel 5, und tragend ist nicht die Zahl
  der Fundstellen, sondern **0052**: der Drawer muss die Kernfakten aus
  derselben Komponente zeigen wie der View. Ohne diese Datei hätte der
  `CaseDrawer` keine Zone 3.
- **Zuschnitt:** eine Datei, ein Export. Kein zweiter für den Drawer — der
  Unterschied ist `all`, nicht ein zweiter Baustein.
- **Setzt auf:** `FieldList`, `Amount`, `Time`, `MonoCell`, `StatusBadge`,
  `LongText`, `EntityIcon`.

## Zwei Nullwerte, die etwas bedeuten

Das GLOSSARY sagt es wörtlich, und die Komponente muss es zeigen:

- **`fyPersonalAccountId` = NULL heißt „hat bewusst keins"** —
  Sammel-Sachverhalt, interne Umbuchung, reine Sachbuchung. Nicht
  „unbekannt", also **nicht** „—", sondern das Wort.
- **`counterpartySide` = NULL heißt „bewusst keine"** — dieselbe Regel.
- Dazu, aus dem Spaltenkommentar: **`documentNotRequiredReason` gesetzt
  heißt, dass kein Beleg erwartet wird** — das Feld ist zu 7 % gefüllt, und
  gerade sein Vorhandensein ist die Aussage. Es steht als Zeile „Kein Beleg
  zu erwarten" mit dem Grund als Wert, nicht als leeres Feld.

Ein „—" an einer dieser drei Stellen wäre eine Falschaussage. Das ist ein
Abnahmekriterium.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `case` | `CaseDetail` | ja | Der Fall. Typ aus `src/ludwig/`; fehlt dort ein Feld, ist das ein Befund, keine lokale Erweiterung | `Filled` |
| `all` | `boolean` | nein | Auch die Ränge 17–25: Gegenpartei-Seite, Anker, Angelegt von, Wirtschaftsjahr, Rhythmus, Verrechnungskonto, Buchungslauf, Buchungszyklus, Abnahme-Bucket. Der View zeigt sie, der Drawer nicht | `All` |
| `tone` | `"surface" \| "bare"` | nein, Default `surface` | Durchgereicht an `FieldList`: im Drawer trennt die Überschrift, nicht eine Fläche | `InDrawer` |
| `partnerHref` | `string` | nein | Der Geschäftspartner wird ein Link (47 % haben einen) | `Filled` |
| `accountHref` | `(accountId: string) => string` | nein | Personen- und Verrechnungskonto werden Links | `Filled` |

**Kann bewusst nicht:**

- **Die Zusammenfassung bearbeiten.** Das ist `CaseEditor` (0083) mit
  `InlineEdit`; hier steht sie nur.
- **Kinder zählen.** Ereignisse, Klärungen und Erwartungen sind Relationen
  und gehören in `CaseTimeline` (0040) bzw. an die Zeile — der
  Kennzahl-Streifen der `CaseOverviewBox` wandert **nicht** mit, er wird
  ohnehin nirgends gerendert.
- **Den Gegenpart aus den Ereignissen errechnen.** Die `CaseOverviewBox` tut
  das heute, obwohl der Fall eine eigene Spalte dafür hat. Die Spalte gilt.

## Verhalten

Server-Component. `FieldList` mit `layout="row"`; Label links, Wert rechts,
Zahlen mit `tnum`. Die Zusammenfassung ist die einzige Zeile über volle
Breite und kürzt bei **160 Zeichen** mit `LongText` (p90 309 — ungekürzt ist
sie ein Absatz und keine Faktenzeile); die volle Fassung steht aufklappbar
darunter, nicht in einem `title`.

Eine Zeile erscheint nicht, wenn ihr Feld leer ist **und** das Leersein nichts
bedeutet. Die drei Ausnahmen oben erscheinen immer.

Zustände: gefüllt · leer (ein frisch gegründeter Fall trägt nur Nummer, Art
und Eröffnet) · alles (`all`). Lädt und Fehler gehören dem Aufrufer.

## Stories

Titel `v3/Entitäten/Sachverhalt/CaseFacts`. Abgeleitet nach §6: 2 anwendbare
Zustände + 1 Enum (`tone`) + 1 Layout-Boolean (`all`) + 0 Callbacks +
1 „im Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Filled` | Ränge 11–16 mit Werten, Partner und Konto als Links |
| `Sparse` | Ein frisch gegründeter Fall: die drei bedeutenden Nullwerte stehen als Wort, der Rest fehlt still |
| `All` | `all` — alle fünfzehn Punkte bis Rang 25, in der Reihenfolge des Profils |
| `InDrawer` | `tone="bare"` unter einer Überschrift, wie 0052 Zone 3 es verlangt |
| `LongSummary` | Rand: 720-Zeichen-Zusammenfassung, gekürzt bei 160 mit Aufklapper |
| `InUse` | Unter einem `EntityHeader` — der Kopf trägt Rang 1–4, die Fakten setzen bei 11 an, nichts steht zweimal |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Der Saldo des Verrechnungskontos („ausgeglichen" / „Rest x") | `clearingBalance?: number \| null` | ein Fall mit `fyClearingAccountId` erscheint im Bestand (heute 2 von 915) |
| Bearbeiten je Wert | `onEdit?: (field: CaseEditableField) => void` | 0083 `CaseEditor` wird gebaut |

## Befunde für `ludwig/app`

- **B1 (L-64)** — `CaseOverviewBox` und `EventStack` sind exportiert, werden
  aber nirgends gerendert; `ui-repraesentationen.md` §1 führt beide weiter
  als aktive Komponenten. Vor der Ablösung klären, ob sie tot sind — sonst
  zählt die Migration Arbeit, die es nicht gibt.
- **B2** — `CaseDetail` trägt in `src/ludwig/` nicht alle fünfzehn Felder;
  was fehlt, gehört dort ergänzt und nicht hier definiert. Der Bauende trägt
  die Lücke beim Bauen nach — als Zeile hier und in `docs/befunde-app.md`.
- **B3** — Der Kopf zeigt den Gegenpart heute **viermal** (Titel-Rückfall,
  Meta-Zeile, Faktenzeile, Personenkonto-Name). Mit `CaseFacts` steht er
  einmal; das ist Zweifel 4 des Seitenprofils, hier eingelöst.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] **Kein „—" an den drei bedeutenden Nullwerten**: Personenkonto ohne Wert sagt „bewusst keins", Gegenpartei-Seite „bewusst keine", und „Kein Beleg zu erwarten" erscheint nur, wenn der Grund gesetzt ist (Story `Sparse`)
- [ ] `all` ergänzt die Ränge 17–25 und ändert an 11–16 nichts (Story `All` gegen `Filled`)
- [ ] Die Zusammenfassung kürzt bei 160 Zeichen mit Aufklapper, nicht mit `title` (Story `LongSummary`)
- [ ] `tone="bare"` reicht an `FieldList` durch und setzt keine eigene Fläche (Story `InDrawer`)
- [ ] Der Belegnummern-Modus kommt aus `StatusBadge axis="belegnummern_modus"`
- [ ] Die Komponente zählt keine Kinder und rechnet keinen Gegenpart (`grep`: kein `.filter(` über Ereignisse)
- [ ] `case` ist ein Typ aus `src/ludwig/`; fehlende Felder stehen als Befund in dieser Spec **und** in `docs/befunde-app.md`
- [ ] offen (App): ersetzt die Faktenzeile aus `parts.tsx`, die Portal-Meta und den Streifen aus `CaseOverviewBox`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Welcher Satz gilt, wo die drei heutigen sich widersprechen? *Ohne
   Antwort: der des Profils — Ränge 11–16 im Kern, 17–25 mit `all`. Die drei
   bestehenden Sätze sind gewachsen, nicht entschieden.*
2. Gehört der Betrag (Rang 4) in die Fakten? *Ohne Antwort: nein — er steht
   im `EntityHeader` als Kennzahl, und zweimal wäre er die Dopplung, die
   diese Aufgabe gerade beseitigt.*
3. Aufklappen oder abschneiden bei der Zusammenfassung? *Ohne Antwort:
   aufklappen. 25 % der Fälle haben gar keine, und wer eine hat, hat im
   Median 231 Zeichen — das ist zu viel zum Wegwerfen und zu wenig für einen
   eigenen Reiter.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Entscheide: 1 Profilsatz gilt · 2 Betrag nicht in den Fakten (er steht im `EntityHeader metric`; im Drawer trägt ihn Zone 1, siehe 0098) · 3 Aufklappen.

Vor dem Bau in die Spec: (a) B2 konkret: `CaseDetail` existiert im Spiegel **nicht** (liegt in `infrastructure/case-detail-queries.ts`, nicht `domain/`) und trägt `title` nicht — lokales `CaseFactsVM` benennen (Präzedenz `AccountFactsVM`, L-13), Befund L-68; (b) `accountHref(accountNumber)` statt Id — die Kontoroute läuft über die Nummer; (c) `Sparse` präzisieren (ohne `all` steht nur das Personenkonto als Wort); (d) Ausbau-Zeile `clearingBalance` ersetzen — das Feld existiert (F104), Anzeige mit `all`; (e) Rang 25 (Abnahme-Bucket) aus `all` nehmen, das Profil sagt selbst „gehört zur Abnahmeliste".

Befunde ins Register: **L-68** — `CaseDetail` nach `domain/` heben (spiegelbar) und um `title`, `disposition`, `openClarificationsCount`, `exportStatus`, `counterpartySide`, `batchOposReference`, `createdByKind/Label`, `expectedInterval`, `agentRunId`, `exportBatchId` ergänzen (Muster L-08/L-09). Dass `title` fehlt, ist die Wurzel von L-52.
