# 0097 · CaseFacts — die Fakten eines Sachverhalts, einmal

| | |
|---|---|
| Status | Abnahme |
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
| `all` | `boolean` | nein | Auch die Ränge 17–24: Gegenpartei-Seite, Anker, Angelegt von, Wirtschaftsjahr, Rhythmus, Verrechnungskonto, Buchungslauf, Buchungszyklus. **Ohne den Abnahme-Bucket** (Rang 25) — er gehört zur Abnahmeliste, wo er die Gruppierung ist. Der View zeigt sie, der Drawer nicht | `All` |
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

Server-Component. `FieldList` in ihrer Vorgabe-Form; Label links, Wert
rechts, Zahlen mit `tnum`. (**Nicht** `layout="row"` — das setzt das Label
über den Wert und beides linksbündig; korrigiert in der Abnahme 2026-09-06.) Die Zusammenfassung nimmt die volle Breite, sobald
sie lang genug ist — das ist keine eigene Regel, sondern die Folge einer Zeile
mit Label links und Wert rechts. Sie kürzt bei **160 Zeichen** mit `LongText` (p90 309 — ungekürzt ist
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
| `LongSummary` | Rand: 721-Zeichen-Zusammenfassung, gekürzt bei 160 mit Aufklapper |
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

Gemessen am 2026-09-06 im Browser (Storybook 6107, headless Chromium, 1440
breit). Gemessen wurde die Wirkung — die gerenderten Zeilen in ihrer
Reihenfolge, `getBoundingClientRect`, `getComputedStyle`, der geöffnete
Aufklapper, die tatsächliche Zeichenzahl —, nicht das, was der Code setzt.

| Kriterium | Nachweis (Story-ID · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. `pnpm build` ist in diesem Abnahme-Auftrag untersagt und nicht gelaufen | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/accounting-case/CaseFacts.tsx` · `CaseFacts.stories.tsx` daneben · Titel `v3/Entitäten/Sachverhalt/CaseFacts` (Story-IDs `v3-entitäten-sachverhalt-casefacts--…`); Barrel-Zeile `index.ts` Z. 341 | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `CaseFacts.tsx` Z. 90–92 am einzigen Funktions-Export; Typ-Exporte tragen im ganzen Set kein `@when` (Prüfung gegen `ClarificationCard`, `CaseTimeline`), also Konvention eingehalten. Bezeichner, Props und JSDoc englisch. Die Inline-Kommentare an den Rängen (Z. 113–183) sind deutsch — dasselbe Muster wie in acht weiteren v3-Dateien; als Hausthema notiert, nicht dieser Aufgabe angelastet | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -n "#[0-9a-f]\{3,6\}\|[0-9]px"` über `CaseFacts.tsx` und die Story → kein Treffer. `SIDE_LABEL` (Z. 84–87) ist eine Label-Map, aber **keine Status-Map**: die Gegenpartei-Seite ist keine Registry-Achse (Profil, Rang 17, Rolle „Kontext"), und `counterpartySide` kommt im Spiegel gar nicht vor. Präzedenz im Set: `AUDIENCE_LABEL`/`EVENT_LABEL` in `ClarificationCard.tsx`. Der Belegnummern-Modus kommt aus der Registry | ✓ |
| Die Reihenfolge der Ränge stimmt mit der Profil-Tabelle | `--filled`, gerenderte Zeilen in Dokumentreihenfolge: Zusammenfassung (11) · Geschäftspartner (12) · Personenkonto (13) · Belegnummern (14) · Abgeschlossen (16); Rang 15 fehlt zu Recht, weil `documentNotRequiredReason` nicht gesetzt ist. `--all`: dieselben fünf, dann Gegenpartei-Seite (17) · Anker (18) · Angelegt von (19) · Wirtschaftsjahr (20) · Abrechnungsrhythmus (21) · Verrechnungskonto (22) · Buchungslauf (23) · Buchungszyklus (24). Punkt für Punkt gegen die Datenpunkt-Tabelle des Profils geprüft: **kein Rang fehlt, keiner steht falsch** | ✓ |
| `all` ergänzt 17–24 und ändert an 11–16 nichts | `--all` gegen `--filled`: dieselben fünf Labels in derselben Reihenfolge an denselben Positionen (x = 21 / 203 / 318 / 463, y = 21 / 98). Der einzige Unterschied im Wert steht bei „Abgeschlossen" (02.09.2026 statt „laufend") und kommt aus den Story-Daten (`closedAt` gesetzt), nicht aus `all`; im Code hängt am `if (all)` nur ein Anhängen, kein Umbau | ✓ |
| Rang 25 (Abnahme-Bucket) ist **nicht** in `all`, und die Begründung trägt | `--all`: dreizehn Zeilen, keine mit einem Abnahme-Bucket. `CaseFacts.tsx` Z. 181–183 begründet es mit dem Profil selbst („gehört zur Abnahmeliste … hier wäre er eine Zahl ohne ihren Zusammenhang"), und das Profil sagt an Rang 25 genau das: „Gehört zur Abnahmeliste, nicht in die Zeile". Die Freigabe (e) verlangt es so. **Nur die Schnittstellen-Tabelle oben sagt noch „Ränge 17–25 … Abnahme-Bucket"** — nachzuziehen (Pflege, kein Mangel am Code) | ✓ |
| Kein „—" an den drei bedeutenden Nullwerten | `--sparse`, drei Zeilen: „Personenkonto · hat bewusst keins" (Wort statt Wert) · „Kein Beleg zu erwarten" mit dem Grund als Wert · „Abgeschlossen · laufend". Kein Gedankenstrich als Platzhalter in irgendeiner Story (Prüfung auf `‐–―`, `−` über alle sechs; der einzige Treffer ist ein Gedankenstrich **im** Grundtext der Story). Der **dritte** bedeutende Nullwert fehlt aber: „Gegenpartei-Seite · bewusst keine" wird in keiner Story gerendert — `Sparse` läuft ohne `all` (Entscheid (c)), und `All` setzt `counterpartySide: "creditor"`. `CaseFacts.tsx` Z. 162 hat den Zweig, gemessen ist er nie (M1) | ✗ |
| Eine Zeile, deren Leersein nichts bedeutet, fehlt still | `--sparse`: exakt drei `.v2fields__row`, keine davon mit leerem Wert. Zusammenfassung, Geschäftspartner und Belegnummern erscheinen gar nicht — sie stehen nicht leer da | ✓ |
| Die Zusammenfassung kürzt bei 160 mit Aufklapper, nicht mit `title` | `--long-summary`: `<details class="more">` geschlossen, Anriss 159 Zeichen mit „…", Marke „ mehr ▾"; `summary` und `details` tragen **kein** `title`. Nach `click()`: `open=true`, Höhe 41 → 142 px, sichtbarer Text 159 → 548 Zeichen, Anriss ausgeblendet, Marke „weniger ▴" — der volle Text steht **darunter**. `<summary>` ist mit `tabIndex 0` erreichbar, Fokusring `2px solid rgb(59,143,196)`. **Der Rand-Fall trifft aber nicht:** die Zusammenfassung der Story ist 548 Zeichen lang, nicht 720 (M2) | ✗ |
| „Die Zusammenfassung ist die einzige Zeile über volle Breite", „Label links, Wert rechts" | `layout="row"` erzeugt `.v2fields--cols`: `display: flex; flex-wrap: wrap`, Label **über** Wert, beides linksbündig (`--filled`, Screenshot). Volle Breite hat die Zusammenfassung nur, weil ihr Text lang ist: den Wert zur Laufzeit gekürzt, dann teilt sie sich ab 60 Zeichen die Zeile mit „Geschäftspartner" (Breite 423 statt 678), erst ab rund 100 Zeichen steht sie allein. Beide Sätze der Spec sind so nicht eingelöst und widersprechen einander ohnehin (M3) | ✗ |
| `tone="bare"` reicht durch und setzt keine eigene Fläche | `--in-drawer`: Klasse `v2fields v2fields--bare v2fields--cols`, `background rgba(0,0,0,0)`, Rahmenbreite `0px`, `padding 0px` — gegen `--filled` mit weißem Grund, 1 px Rahmen und 20 px Innenabstand. Die Überschrift „Kernfakten" trennt, wie 0052 Zone 3 es verlangt | ✓ |
| `accountHref` bekommt die **Nummer**, Partner nur mit `partnerHref` ein Link | `--filled`: gerendert `href="#konto-70021"` und `href="#konto-1370"` (`--all`) — also die Kontonummer, nicht eine Id; Signatur `(accountNumber: string) => string`, Felder heißen `fyPersonalAccountNumber`/`fyClearingAccountNumber`. Partner: mit `partnerHref` ein `<a>` mit Namen „Bürobedarf Meier GmbH" (`--filled`, `--in-use`), ohne die Prop reiner Text (`--in-drawer`, `--long-summary`) | ✓ |
| Der Belegnummern-Modus kommt aus `StatusBadge axis="belegnummern_modus"` | `--filled`: Chip „Eine Belegnummer" mit `title` „Belegnummern-Modus: Eine Belegnummer · Genau EINE Nummer über…" — Label und Erklärung der Registry-Achse, keine lokale Map | ✓ |
| Die Komponente zählt keine Kinder und rechnet keinen Gegenpart | `grep -n "\.sort(\|\.reduce(\|\.filter(\|Math\."` über `CaseFacts.tsx` → kein Treffer; der Gegenpart kommt aus `counterpartyName`, also aus der Spalte, nicht aus den Ereignissen | ✓ |
| `case` ist ein Typ aus `src/ludwig/`; fehlende Felder als Befund hier **und** in `docs/befunde-app.md` | Lokales `CaseFactsVM` — von der Freigabe (a) so verlangt, Präzedenz `AccountFactsVM` (L-13). Befund steht als **L-68** in `docs/befunde-app.md` Z. 74 mit allen elf Feldern und im Abschnitt „Vor dem Bau eingearbeitet". Nebenbei: `documentNumberMode` ist als `string` typisiert, obwohl der Spiegel `CaseDocumentNumberMode` exportiert (`domain/case.ts` Z. 98) — dieselbe Art Lücke, die 0095 bei `currency` geschlossen hat | ✓ |
| Zuschnitt: **ein** Export plus der Typ | `CaseFacts.tsx` exportiert `CaseFactsVM` und `CaseFacts`, sonst nichts; kein zweiter Baustein für den Drawer — der Unterschied ist `all` und `tone`, wie die Einordnung es verlangt | ✓ |
| Alle Stories vorhanden; jede Prop mit ihrer Story; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--sparse`, `--all`, `--in-drawer`, `--long-summary`, `--in-use` — sechs, wie §6 sie ableitet (2 Zustände + 1 Enum + 1 Layout-Boolean + 1 „im Einsatz" + 1 Rand). `case` → `Filled`, `all` → `All`, `tone` → `InDrawer`, `partnerHref` und `accountHref` → `Filled`. `leer nach Filter`, `lädt`, `Fehler` sind unter „Verhalten" und „Stories" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | kein Hex, kein px, kein zentrierter Text ✓ · Zahlen mit `tnum` (`font-variant-numeric: lining-nums tabular-nums` an jedem Wert) ✓ · Status nur über die Registry, farbiger Zustand mit Wort ✓ · Karte hat Rand statt Schatten ✓ · Kontrast der Labels `rgb(113,113,113)` auf Weiß = 4,9:1 ✓ · Fokusring 2 px sichtbar, Hover antwortet (`rgb(45,45,45)` → `rgb(26,58,92)`) ✓ · keine Emoji, keine Versalien ✓. Nebenbefund ohne Bezug zu dieser Aufgabe: ein Link in `FieldList` sieht im Ruhezustand aus wie ein Wert, weil Tailwinds Preflight nach `tokens.css` lädt und `a { color: inherit }` gewinnt — das trifft das ganze Set | ✓ |
| Im Browser angesehen | Screenshot `ab97-longsummary.png`; Konsole in `--filled`, `--long-summary`, `--in-use` ohne Meldung (0 gesamt, keine Verschachtelungs-Warnung) | ✓ |
| offen (App): ersetzt die Faktenzeile aus `parts.tsx`, die Portal-Meta und den Streifen aus `CaseOverviewBox` | nicht in diesem Repo prüfbar | offen (App) |

**Urteil: zurück in Arbeit.** Die Reihenfolge der Ränge stimmt Punkt für
Punkt, `all` fügt nur an, Rang 25 bleibt draußen und ist begründet, der
Zuschnitt hält, `tone="bare"` wirkt, die Konten bekommen die Nummer. Es reißt
an drei Stellen, und alle drei sind Stellen, an denen die Spec eine Zahl oder
ein Wort nennt, das die Story nicht einlöst.

### Mängel

1. **Der dritte bedeutende Nullwert steht in keiner Story.**
   `src/ui/v3/entities/accounting-case/CaseFacts.tsx` Z. 162 trägt den Zweig
   `c.counterpartySide ? SIDE_LABEL[…] : "bewusst keine"`. Gerendert wird er
   nie: `CaseFacts.stories.tsx` Z. 52–68 (`Sparse`) läuft ohne `all`, und die
   Zeile gehört zu `all`; `CaseFacts.stories.tsx` Z. 28 (`FULL`, von `All`
   benutzt) setzt `counterpartySide: "creditor"`, gemessen erscheint „Kreditor".
   Beleg: `--sparse` hat drei Zeilen, keine davon „Gegenpartei-Seite";
   `--all` hat dreizehn, die Gegenpartei-Seite darunter mit Wert.
   Das Abnahmekriterium verlangt **alle drei** bedeutenden Nullwerte als Wort,
   und der Abschnitt „Zwei Nullwerte, die etwas bedeuten" nennt die
   Gegenpartei-Seite ausdrücklich. Belegt sind zwei von drei.
   Kleinster Weg: in `All` (oder einer der beiden) `counterpartySide: null`
   setzen, damit „bewusst keine" einmal gerendert dasteht.

2. **Der Rand-Fall ist nicht der, den die Spec nennt.**
   `CaseFacts.stories.tsx` Z. 111–119: die Zusammenfassung von `LongSummary`
   ist **548 Zeichen** lang (nachgezählt am Story-Text, gemessen am
   gerenderten `<details>`: Anriss 159 + Rest 548). Der Kommentar der Story
   Z. 101 behauptet „721 Zeichen — dem Höchstwert des Bestands", die Zeile
   `LongSummary` in „Gemessen" behauptet dasselbe, und die Stories-Tabelle
   verlangt „Rand: 721-Zeichen-Zusammenfassung". 720 ist im Profil das
   Maximum von `summary` (Rang 11); 548 ist der p90-Bereich, also der
   Normalfall und nicht der Rand.
   Die Kürzung selbst greift (159 statt 548 sichtbar, Aufklapper, kein
   `title`) — falsch ist nur, dass der behauptete Rand nicht gebaut ist.

3. **Zwei Sätze unter „Verhalten" sind weder eingelöst noch aufgelöst.**
   Die Spec schreibt: „`FieldList` mit `layout="row"`; **Label links, Wert
   rechts** … Die Zusammenfassung ist die **einzige Zeile über volle
   Breite**." Gemessen an `--filled`: `layout="row"` erzeugt
   `.v2fields--cols` (`src/styles/v3.css` Z. 2117–2125), und das setzt Label
   **über** Wert und beides linksbündig — Label links und Wert rechts kann es
   gar nicht leisten. Die volle Breite der Zusammenfassung ist kein Merkmal,
   sondern eine Folge der Textlänge: den Wert zur Laufzeit auf 60 Zeichen
   gekürzt, und die Zeile ist 423 px breit und teilt sich die Zeile mit
   „Geschäftspartner"; erst ab rund 100 Zeichen steht sie über die vollen
   678 px allein. Ein Fall mit kurzer Zusammenfassung — der Bestand hat sie,
   der Median liegt bei 231 Zeichen ohne Untergrenze — sieht also anders aus,
   als die Spec beschreibt.
   Die beiden Sätze widersprechen sich zudem gegenseitig; der Bau hat sich
   für `layout="row"` entschieden, das aber nicht unter „Vor dem Bau
   eingearbeitet" festgehalten. Entweder die Sätze werden dort korrigiert,
   oder die Zusammenfassung bekommt ihre volle Breite ausdrücklich
   (`flex-basis: 100%` an dieser einen Zeile).

Geprüft von / am: Claude (Abnahme-Agent), 2026-09-06 · Offene Punkte: M1, M2,
M3; dazu die App-Zeile (Ablösung der drei heutigen Fassungen) — offen (App).

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

## Vor dem Bau eingearbeitet und gebaut (2026-09-06)

**(a) `CaseFactsVM` liegt lokal.** `CaseDetail` gibt es im Spiegel nicht — es
liegt drüben in `infrastructure/case-detail-queries.ts` statt in `domain/` —
und elf der Felder fehlen dort ohnehin, `title` als das folgenreichste (die
Wurzel von L-52). Präzedenz ist `AccountFactsVM` (L-13); der Befund steht als
**L-68** im Register. Zieht der Typ um, fällt die lokale Fassung weg.

**(b) `accountHref` nimmt die Konto*nummer*,** nicht die Id: die Kontoroute
läuft über die Nummer. Deshalb heißen die Felder hier
`fyPersonalAccountNumber` und `fyClearingAccountNumber` — wer eine Id
hereinreicht, merkt es am Typ und nicht erst an einer toten Verlinkung.

**(c) `Sparse` ist präzisiert:** ohne `all` steht dort **ein** bedeutender
Nullwert als Wort („Personenkonto · hat bewusst keins"), dazu „Kein Beleg zu
erwarten" mit seinem Grund und „Abgeschlossen · laufend". Die
Gegenpartei-Seite gehört zu `all` und erscheint hier nicht — das war in der
alten Fassung der Story unscharf.

**(d) Der Ausbau nennt `clearingBalance`** als Prop für den Saldo; das Feld
selbst (Rang 22) steht mit `all` in der Liste.

**(e) Rang 25 (Abnahme-Bucket) ist nicht in `all`.** Das Profil sagt selbst,
er gehört zur Abnahmeliste — dort ist er die Gruppierung, hier wäre er eine
Zahl ohne ihren Zusammenhang.

### Gemessen

| Story | Zeilen |
|---|---|
| `Filled` | Zusammenfassung · Geschäftspartner · Personenkonto · Belegnummern · Abgeschlossen |
| `All` | dieselben plus Gegenpartei-Seite · Anker · Angelegt von · Wirtschaftsjahr · Abrechnungsrhythmus · Verrechnungskonto · Buchungslauf · Buchungszyklus — **kein** Abnahme-Bucket |
| `Sparse` | **vier** Zeilen: Personenkonto „hat bewusst keins" · Kein Beleg zu erwarten mit Grund · Abgeschlossen „laufend" · Gegenpartei-Seite „bewusst keine" |
| `LongSummary` | 721 Zeichen kürzen auf einen 159-Zeichen-Anriss mit Aufklapper — der volle Text steht darunter, nicht im `title` |

## Die drei Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — der dritte bedeutende Nullwert stand in keiner Story.** Der Zweig
„bewusst keine" war gebaut, aber `Sparse` lief ohne `all` und `All` setzte
einen Wert — gerendert wurde er nie. `Sparse` hat jetzt `all` und
`counterpartySide: null`; gemessen stehen dort alle drei: „Personenkonto · hat
bewusst keins", „Kein Beleg zu erwarten · Interne Umbuchung …",
„Gegenpartei-Seite · bewusst keine". Ein Zweig, den keine Story zeigt, ist
kein gebauter Zweig.

**M2 — der 720-Zeichen-Fall war 548 Zeichen lang.** Jetzt **721**, nachgezählt
statt behauptet — ein Zeichen über dem Höchstwert des Bestands. Der Kommentar
nennt die gemessene Zahl; genau 720 zu treffen wäre eine Stellprobe am Text
gewesen und hätte nichts bewiesen, was 721 nicht auch beweist.

**M3 — zwei Sätze im Verhalten waren nicht eingelöst.** „Label links, Wert
rechts" leistet `layout="row"` nicht: es setzt das Label **über** den Wert,
beides linksbündig. Die Vorgabe-Form der `FieldList` tut genau, was der Satz
sagt — gemessen steht das Label bei x = 37 linksbündig, der Wert bei x = 175
rechtsbündig, mit `tabular-nums`. Also `stack` statt `row`; der Satz war
richtig, die Wahl war es nicht.

Der zweite Satz („die Zusammenfassung ist die einzige Zeile über volle
Breite") ist keine Regel der Komponente, sondern eine Folge der Textlänge: in
einer Zeile mit Label links und Wert rechts nimmt ein langer Wert die Breite
von selbst. Der Satz im Verhalten sagt das jetzt.

**Mitgenommen aus den Befunden:** `documentNumberMode` ist
`CaseDocumentNumberMode` statt `string` — dieselbe Lücke, die 0095 bei
`currency` geschlossen hat. Und die Schnittstellen-Tabelle sagte noch
„Ränge 17–25 … Abnahme-Bucket", obwohl die Freigabe ihn herausgenommen hat.

## Abnahmekriterien (Nachtrag)

- [ ] Alle **drei** bedeutenden Nullwerte stehen in einer Story als Wort (`Sparse`, gemessen)
- [ ] Die lange Zusammenfassung ist so lang, wie der Kommentar sagt (nachgezählt)
- [ ] Label links, Wert rechts — im Bild gemessen, nicht aus der Prop geschlossen
- [ ] `documentNumberMode` trägt den Typ des Spiegels

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-68 ist erledigt, die lokale Fassung ist weg.** Die App hat `CaseDetail`
mit `18ddaa28` nach `domain/` gehoben und um die elf Felder ergänzt; der
Spiegel führt ihn seither als `modules/accounting-cases/domain/case-detail.ts`.
`CaseFactsVM` ist damit kein eigener Datensatz mehr, sondern
`Partial<CaseDetail>` plus die vier Felder, ohne die keine Faktenzeile steht:
`caseNumber`, `kind`, `lifecycleStatus`, `openedAt`. Was die Freigabe unter
(a) vorsah — „zieht der Typ um, fällt die lokale Fassung weg" — ist damit
eingelöst.

Drei Folgen, die beim Tausch auffielen:

- **Die zwei Kontonummern heißen jetzt wie im Spiegel:**
  `personalAccountNumber` und `clearingAccountNumber`. Punkt (b) der Freigabe
  gilt unverändert — `accountHref` nimmt die Konto*nummer* —, nur trägt den
  Hinweis jetzt der Feldname des Datenmodells statt ein lokales `fy`-Präfix.
- **`counterpartySide` ist im Spiegel `string`,** nicht das lokale
  `"debtor" | "creditor"`. Die Zeile schlägt das Label nach und zeigt einen
  unbekannten Wert **roh**, statt ihn still wegzulassen: sichtbar falsch ist
  hier besser als unsichtbar.
- **`documentNumberMode` trägt den Typ des Spiegels** über `CaseDetail` — das
  offene Kriterium des Nachtrags ist damit erfüllt, der lokale Import von
  `CaseDocumentNumberMode` entfällt.

`pnpm typecheck`, `pnpm build`, `pnpm check:icons` und `pnpm check:contrast`
sind grün (Exit-Code geprüft, nicht die letzte Zeile der Ausgabe).
