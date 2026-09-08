# 0099 · BankTransactionPurpose — der Verwendungszweck, lesbar

| | |
|---|---|
| Status | fertig (Schnittstelle) — die gemessene Prüfung steht in 0119 aus |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` — erste Datei dieser Familie |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: SEPA-Tags sind der Zahlungsverkehr dieser Domäne, und die sieben Schlüssel sind ihr Vokabular |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionPurpose`; Ränge 1 und 11 |
| Ersetzt | `modules/bank-transactions/ui/PurposeDisplay.tsx` (174 Z.) samt `src/styles/purpose.css` — benutzt in **fünf** Dateien und **zwei** Modulen |
| Blockiert | `BankTransactionCell` (0100), `BankTransactionRow` (0101), `BankTransactionFacts` (0102) — alle drei zeigen den Zweck |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Der Rohwert einer SEPA-Zahlung ist für Menschen unlesbar:

```
EREF+NOTPROVIDED MREF+ZR17631 CRED+DE8811100000108092
SVWZ+SKS ABR.648346 29.01.26
```

**90 % der Positionen** tragen mindestens eine Referenz (1156 von 1281).
Angezeigt gehört der SVWZ-Freitext; die Referenzen gehören daneben, greifbar,
aber nicht als Erstes. Der unveränderte Originalblock bleibt erreichbar —
nichts geht verloren, es ist nur nicht mehr das, was zuerst ins Auge fällt.

Das ist **Rang 1** der Entität, und es ist die einzige Stelle der Familie,
an der die App schon eine geteilte Komponente hat. Sie wandert fast
unverändert; was diese Spec ändert, ist der Ort und die Reichweite.

## Einordnung

- **Wiederverwenden:** `LongText` kürzt, `Badge` trägt einen Chip, `Popover`
  öffnet das Original, `Kbd` zeigt die Taste. Was fehlt, ist die Zerlegung —
  und die ist keine Darstellung, sondern eine Ableitung.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — die Form gehört der Entität,
  fünf Dateien in zwei Modulen brauchen sie, und keine vorhandene Form deckt
  sie ab. Regel 3 greift nicht: sie trägt ein Fachwort (SEPA), also keine
  Primitive.
- **Zuschnitt:** eine Datei, ein Export. Die Ableitung `derivePurposeParts()`
  liegt seit dem 06.09. im **Spiegel** (`modules/bank-transactions/domain/statement-line.ts`,
  Commit `cc141f7b`) — sie wird auch allein gebraucht (die Suche der Liste
  sucht über die Referenzwerte, ohne etwas zu zeichnen), und genau deshalb
  gehört sie dorthin und nicht ein zweites Mal hierher.
- **Setzt auf:** `Popover`, `ActionIcon` (`info`, 0087), `Link`.
  **Nicht** `LongText` (der Freitext wird nicht gekürzt, er ist die Antwort)
  und **nicht** `Badge` (ein Abzeichen heißt in diesem Set ein Zustand, ein
  SEPA-Schlüssel ist eine Kennung und bekommt seinen eigenen stillen Chip) —
  beide standen hier, obwohl sie bewusst nicht verwendet werden
  (berichtigt 2026-09-08, M4).

## Die sieben Schlüssel

Das Profil hat sie nachgezählt; die Reihenfolge ist die ihrer Häufigkeit,
und sie ist die Anzeigereihenfolge der Chips:

| Schlüssel | Bedeutung | Anteil |
|---|---|---|
| `EREF` | End-to-End-Referenz des Auftraggebers | 82 % |
| `KREF` | Kundenreferenz | 34 % |
| `MREF` | Mandatsreferenz (Lastschrift) | 31 % |
| `CRED` | Gläubiger-Identifikation | 30 % |
| `ABWA` | abweichender Auftraggeber | 11 % |
| `PURP` | ISO-20022-Zweckcode, als Wort („Miete", „Gehalt") | 3 % |
| `OAMT` | ursprünglicher Betrag | < 1 % |

`PURP` ist der einzige, der übersetzt wird (`PURP_LABELS`); die anderen sechs
sind Kennungen und bleiben, wie sie sind — mono, ungekürzt, kopierbar.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `purpose` | `string \| null` | ja | Der Rohwert aus der Spalte. `null` → „—" | `Inline`, `Empty` |
| `tags` | `SepaTags \| null` | nein | Beim Import geparste Tags (`raw_payload.parsed_sepa_tags`). Sie gewinnen gegen das Nachparsen — aber der Aufrufer darf sie weglassen, dann parst die Ableitung nach | `TagsWin` |
| `variant` | `"inline" \| "block"` | nein, Default `inline` | `inline`: eine Zeile, Referenzen hinter dem (i). `block`: Freitext plus Chips darunter — für Fakten und Drawer | `Inline`, `Block` |
| `href` | `string` | nein | Wohin der Freitext führt; ohne sie ist er Text. `BankTransactionCell` setzt sie, damit die ganze Zelle ein Ziel hat (ergänzt 2026-09-08, M1 — gebaut und belegt, aber nie in der Tabelle geführt) | `Block` |

**Kann bewusst nicht:**

- **Den Originalblock verstecken.** Er ist über dasselbe (i) erreichbar wie
  die Referenzen. Was die Bank geschrieben hat, bleibt nachlesbar.
- **Suchen.** Die Suche gehört der Liste; sie ruft `derivePurposeParts()`
  und liest die Werte — deshalb ist die Ableitung eine eigene Datei.
- **Nachparsen erzwingen.** Sind `tags` gesetzt, gelten sie; das Nachparsen
  ist der Rückfall für Bestandsdaten, kein zweiter Weg.
- **Kürzen entscheiden.** Wie lang eine Zeile sein darf, weiß die Spalte.
  `inline` kürzt auf eine Zeile mit Ellipse, `block` kürzt nicht.

## Verhalten

Der Freitext steht als normaler Text, nie mono — er ist ein Satz und keine
Kennung (p50 35 · p90 84 · max 447 Zeichen). Die Referenzen sind Chips mit
Schlüssel und Wert; in `inline` liegen sie hinter einem (i), das per Tastatur
erreichbar ist und mit Enter öffnet (T8, V14). Das Original steht im selben
Popover, unter einer Überschrift und in mono.

Ist gar kein Tag-Block erkannt worden — 10 % der Zeilen —, gibt es kein (i):
der Rohwert **ist** der Freitext, und ein Info-Punkt ohne Inhalt wäre ein
Versprechen ohne Deckung.

Zustände: gefüllt mit Tags · gefüllt ohne Tags · leer (`purpose = null`).
Lädt und Fehler gibt es nicht.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionPurpose`. Abgeleitet
nach §6: 3 anwendbare Zustände + 1 Enum (`variant`) + 0 Callbacks + 1 „im
Einsatz" + 1 Rand = 6. Gebaut sind **8**: zwei Props tragen je einen eigenen
Nachweis, den die Rechnung nicht vorsieht — `tags` (gesetzte gewinnen gegen
das Nachparsen) und der Fall, in dem **nur** Tags da sind. Beide sind eigene
Kriterien, beide unter der Obergrenze 10. *(Die Zeile sagte bis zur
Wiederabnahme 2026-09-07 „= 6" und zählte die zwei nicht mit.)*

| Story | Beweist |
|---|---|
| `Inline` | Eine Zeile mit Ellipse, Referenzen hinter dem (i); Tastatur öffnet es |
| `Block` | Freitext plus die Chips darunter, `PURP` als **Wort** mit dem Code im `title`; die zweite Fläche derselben Story zeigt `href` im Block-Zweig |
| `WithoutTags` | Ein Zweck ohne Tag-Block: kein (i), der Rohwert ist der Text |
| `Empty` | `purpose={null}` → „—" |
| `TagsWin` | Gesetzte `tags` gewinnen gegen das Nachparsen — die Referenz aus dem Import steht im Chip, nicht die aus dem Text |
| `TagsOnly` | Nur Tags, kein Freitext |
| `Raw` | Rand: 509-Zeichen-Rohblock — inline eine Zeile, im Popover vollständig und mono |
| `InUse` | In einer `Table` als breiteste Spalte neben Datum, Gegenpartei und Betrag |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Eine Referenz kopieren | `onCopy?: (key: string, value: string) => void` am Chip | jemand tippt eine EREF von Hand ab |
| Treffer der Volltextsuche hervorheben | `highlight?: string` | die Liste bekommt Serversuche über die Referenzwerte |

## Befunde für `ludwig/app`

- **B1 (L-56)** — Die Ableitung fehlt im Spiegel. `src/ludwig/modules/bank-transactions/domain/`
  existiert, trägt aber nur die **Import**-Seite; `extractSepaTags()`,
  `derivePurposeParts()` und `PURP_LABELS` liegen in `ui/` bzw.
  `infrastructure/`. Das Set definiert sie deckungsgleich lokal.
- **B2 (L-59)** — `KontoauszugView` benutzt `PurposeDisplay` **gar nicht**:
  die Hauptliste rendert `deriveSepa(row).text` als nacktes `<span>`, ohne
  Chips und ohne Zugang zum Originalblock. Bei 90 % Referenz-Anteil heißt
  das: der Auszug verschluckt sie. Der Umzug behebt es nebenbei — deshalb
  steht `KontoauszugView` unter „Ersetzt" der Zeile (0101), nicht hier.

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

- [ ] Der Rohblock erscheint **nie** als Erstes; sichtbar ist der SVWZ-Freitext (Story `Raw`)
- [ ] Alle sieben Schlüssel werden erkannt und in der Reihenfolge oben gezeigt; `PURP` als Wort (Story `Block`)
- [ ] Ohne erkannten Tag-Block gibt es **kein** (i) (Story `WithoutTags`)
- [ ] Das Original ist über dasselbe (i) erreichbar wie die Referenzen (Story `Inline`)
- [ ] Das (i) ist per Tastatur erreichbar und öffnet mit Enter (Story `Inline`)
- [ ] `derivePurposeParts()` steht in einer eigenen Datei und rendert nichts (`grep`: kein JSX darin)
- [ ] Gesetzte `tags` gewinnen gegen das Nachparsen (Story `TagsWin` gegen `Block` — `Block` setzt keine `tags`, der alte Verweis ging ins Leere)
- [ ] Der Freitext steht nicht mono (Story `Inline`)
- [ ] offen (App): ersetzt `PurposeDisplay.tsx` und `purpose.css` in fünf Dateien; `KontoauszugView` bekommt sie überhaupt erst (L-59)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Chips oder Definitionsliste für die Referenzen im `block`? *Ohne Antwort:
   Chips, wie heute — sechs Kennungen untereinander wären eine Tabelle für
   Werte, die niemand vergleicht.*
2. Gehört `OAMT` (ursprünglicher Betrag, < 1 %) überhaupt gezeigt? *Ohne
   Antwort: ja, aber als letzter Chip. Wo er steht, erklärt er eine
   Betragsabweichung — genau die Frage, die sonst offen bliebe.*
3. Kürzt `inline` auf eine Zeile oder auf eine Zeichenzahl? *Ohne Antwort:
   auf eine Zeile mit CSS-Ellipse. Eine Zeichenzahl stimmt bei einer
   Grid-Spalte nie.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben.** Entscheide: 1 Chips · 2 `OAMT` als letzter Chip · 3 CSS-Ellipse. Ein Satz in die Spec: `PURP_LABELS` ist eine Code-Übersetzung der SEPA-Schlüssel, kein Status — sonst liest der Abnehmende das feste Kriterium „keine lokale Label-Map" als verletzt.

**Nachtrag 2026-09-06, vor dem Bau:** B1 ist **erledigt** — die App hat die Ableitungen mit `cc141f7b` in den Spiegel gehoben (`modules/bank-transactions/domain/statement-line.ts`: `derivePurposeParts()`, `PurposeParts`, `PurposeRef`, `PURP_LABELS`, dazu `extractSepaTags()`/`SepaTags` in `sepa-tags.ts`). Die Spec verlangte unter „Zuschnitt" eine eigene Datei `purpose-parts.ts`; **die entfällt.** Der Baustein ruft die Ableitung aus dem Spiegel, und das Kriterium „`derivePurposeParts()` steht in einer eigenen Datei und rendert nichts" ist damit über den Spiegel erfüllt — eine deckungsgleiche zweite Fassung wäre der R1-Verstoß, den L-52 schon einmal gekostet hat.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — `PURP` stand als Code, nicht als Wort.** Der Chip zeigte `PURP RINP`,
mono wie die sechs Kennungen; das deutsche Wort lag nur im `title`, also nur
per Maus. Genau das ist die eine Ausnahme, die das Profil benennt: `PURP` ist
ein **Code**wort, und `RINP` sagt niemandem etwas. Jetzt steht dort
„wiederkehrende Rate", der Code im `title` — übersetzt wird mit `PURP_LABELS`
aus dem Spiegel, es entsteht keine Map hier.

**M2 — ein Tag-Block ohne SVWZ wurde zum Freitext.** Die Ableitung fällt
ohne SVWZ auf den ganzen Block zurück, und der stand damit an genau der
Stelle, an der der Rohwert nie stehen soll. Die Komponente erkennt den Fall
jetzt (`parts.text === parts.raw` nach Whitespace-Normalisierung) und zeigt
„—": es gibt keinen Freitext, und die Referenzen liegen hinter dem (i). Neue
Story `TagsOnly`.

**M3 — die Rand-Story unterschritt den Bestandswert.** Sie hatte 373 Zeichen
roh, die Spec verlangt 447. Jetzt **509 roh, 360 Freitext** — über dem
Höchstwert und dem Vierfachen von p90; gemessen, nicht behauptet.

**M4 — der gekürzte Freitext hatte keine lesbare Vollform.** `title` auf der
Inline-Zeile, wie es die App-Fassung hatte und Z3 für genau diesen Fall
erlaubt. Gemessen: 360 Zeichen im `title`, die Zeile kürzt.

**M5 — `href` wirkte nur im `inline`-Zweig.** Jetzt in beiden, und die
Prop-JSDoc nennt die Story, die sie beweist
(`BankTransactionCell --without-counterparty`).

**M6 — zwei Kommentare standen gegen den Code.** Beide richtiggestellt.

**M7 — die Trefferfläche des (i) war 14 × 14 px.** Jetzt 22 × 22, mit
negativem Rand **nur senkrecht** — waagerecht hätte der Knopf 4 px über die
rechte Kante geragt und die Zelle überlaufen lassen (gemessen).

**M8 — `.v2purp__key` hatte Sperrung auf Versalien.** Gestrichen; 0089 hat sie
im Set abgeschafft.

Offen, weil Owner-Sache: die Spec-Zeile „Setzt auf: `LongText`, `Badge` …"
stimmt nicht mehr — `LongText` kürzt nach Zeichenzahl und widerspricht
Entscheid 3, `Badge` heißt im Set „Zustand" und ist durch eine stille Marke
ersetzt.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

**Urteil: zurück.** Alle acht variablen Kriterien der Spec sind erfüllt und
gemessen. Zurück geht es an zwei Punkten der Prüfliste §9 — und an **M7 der
Vorrunde, dessen Behauptung die Messung widerlegt**: das (i) misst 22 × 22
statt der im eigenen Kommentar genannten 24, und es macht die Zeile 2,46 px
höher.

Gemessen gegen den laufenden Dev-Server `http://localhost:6107` (Quelle),
headless über CDP auf eigenem Port 9381. **Nicht gebaut** (Befund 0117: ein
Build leert `storybook-static/` unter den parallelen Sitzungen weg). Bedarf
immer am ungebundenen Klon (`position:absolute; visibility:hidden; width:auto;
max-width:none; white-space:nowrap`), nie geschätzt.

### 1 · Story-Deckung

Ableitung nach `spec-schreiben` §6: 3 anwendbare Zustände + 1 Enum (`variant`)
+ 0 Callbacks + 1 „im Einsatz" + 1 Rand = **6**. Im `index.json` stehen **8**:
die sechs der Spec (`Inline`, `Block`, `WithoutTags`, `Empty`, `Raw`, `InUse`)
plus `TagsWin` und `TagsOnly`. Beide tragen je ein Kriterium (Vorrang der
gesetzten Tags · Tag-Block ohne SVWZ, M2), beide liegen unter der Obergrenze
von 10. Der Abschnitt „Stories" der Spec nennt weiter 6 und listet 6 — das ist
ein **Mangel der Spec**, keine Kürzung durch diese Abnahme.

| Prop | Story | Ergebnis |
|---|---|---|
| `purpose` | `Inline`, `Empty` | ✓ |
| `tags` | `TagsWin` (die Spec nennt `Block` — dort werden gar keine `tags` gesetzt) | ✓, Spec-Zeile falsch |
| `variant` | `Inline` / `Block` | ✓ |
| `fallback` | keine | ✗ M13 |
| `href` | `BankTransactionCell --without-counterparty` (nur `inline`) | halb, M12 |

Ausgeschlossene Zustände (`leer nach Filter`, `lädt`, `Fehler`) sind in der
Spec begründet. ✓

### 2 · Kriterien

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit 0 | ✓ |
| `pnpm build` grün | **nicht gelaufen** (Befund 0117, Owner-Regel für parallele Sitzungen). Ersatz: alle acht Stories rendern auf dem Dev-Server, `Runtime.consoleAPICalled`/`exceptionThrown` je 1,2 s nach dem Laden: **0 Warnungen, 0 Ausnahmen** | offen, unter der geltenden Regel nicht prüfbar |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/bank-transaction/BankTransactionPurpose.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionPurpose` (index.json); Export `src/ui/v3/index.ts:400` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 · `pnpm check:when` Exit 0. Ein Export, beide Zeilen da. Deutsche Story-JSDoc sind ausgenommen (Hausentscheid 0098 M10) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `check:contrast` Exit 0 · `check:icons` Exit 0 · `check:mirror` Exit 0. `PURP_LABELS` kommt aus dem Spiegel (Freigabe-Nachtrag). Einziger px-Wert: `.v2purp__key { padding: 1px … }` — steht in `v3.css` und ist dort erlaubt; `size={14}` ist die Leiter A8 | ✓ |
| Alle Stories vorhanden; ausgeschlossene begründet | siehe §1 | ✓ (Spec-Zahl veraltet) |
| Prüfliste §9 durchgegangen | **zwei Punkte reißen: M9 (V1, Zeilenhöhe) und M10 (Hover)** | ✗ |
| Im Browser angesehen | acht Stories, vier Breiten (700/1100/1400/1920) | ✓ |

**Variabel**

| Kriterium | Nachweis (gemessen) | Ergebnis |
|---|---|---|
| Rohblock **nie** als Erstes | `Raw`: sichtbar sind 360 Zeichen SVWZ-Freitext; Bedarf am Klon 2255 px gegen 346 px Kastenbreite → gekürzt. Der 509-Zeichen-Rohblock liegt hinter dem (i) unter „Originalwert" | ✓ |
| Alle sieben Schlüssel, Reihenfolge, `PURP` als Wort | `Raw`, Popover offen: **EREF · KREF · MREF · CRED · ABWA · PURP · OAMT** — genau die Reihenfolge der Spec-Tabelle. `PURP` zeigt „Lieferantenzahlung", `title="SUPP"`. In `Block` sechs davon (der Rohwert trägt kein ABWA) mit „wiederkehrende Rate" / `title="RINP"` | ✓ |
| Ohne Tag-Block **kein** (i) | `WithoutTags`: `.v2purp__info` nicht im DOM | ✓ |
| Original über dasselbe (i) | ein Panel `#_r_0_`, 358 × 157 px, darin die Chips **und** `<details><summary>Originalwert</summary>` | ✓ |
| (i) per Tastatur, öffnet mit Enter | ein Tab-Stopp bis zum Knopf; Fokusring `2px solid rgb(59,143,196)`, `outline-offset: 2px`, `:focus-visible` trifft. Enter: `aria-expanded` false → true, `:popover-open` 0 → 1, genau **ein** Klick-Ereignis. Weiter mit Tab auf `summary`, Enter öffnet den Rohblock: 509 Zeichen, mono, 352 × 256 px sichtbar | ✓ |
| `derivePurposeParts()` eigene Datei, rendert nichts | `src/ludwig/modules/bank-transactions/domain/statement-line.ts`; `grep -nE "</\|/>\|from \"react\""` → **Exit 1** (kein Treffer) | ✓ |
| Gesetzte `tags` gewinnen | `TagsWin` gegen `Block`: derselbe Rohwert, MREF im Chip `AUS-DEM-IMPORT-4711` statt `D-VR-50411866-0-001`, dazu ABWA `Musterbau GmbH & Co. KG`, das im Text gar nicht vorkommt | ✓ |
| Freitext nicht mono | `.v2purp__text` computed `font-family: Inter …`, 12,5 px, Kontrast 13,77:1 | ✓ |
| offen (App): ersetzt `PurposeDisplay.tsx` … | außerhalb dieses Repos | bleibt offen |

### 3 · Mängel

**M9 — das (i) macht die Zeile höher, und seine Trefferfläche ist 22 × 22. Blockiert.**
Kriterium: §9 „Zeilenhöhe ≤ `.v2tbl__row` (V1)" — und die Behauptung aus M7 der
Vorrunde.
Ort: `src/styles/v3.css:3269` (`.v2purp--inline { align-items: baseline }`) und
`:3285–3291` (`.v2purp__info`).
Messung (`--in-use`, 1400 px): Zeilen **mit** (i) 48,38 px, die Zeile **ohne**
(i) 45,92 px. Gegenprobe durch Ausblenden des Knopfs: 48,38 → 45,92 und
47,38 → 44,92. In der echten Liste (`BankTransactionList --in-use`, 1400 px)
dasselbe Muster: 48,38 → 47,09. `getBoundingClientRect()` des Knopfs:
**22 × 22** — der Kommentar zwei Zeilen darüber sagt „der Knopf 24" und beruft
sich auf WCAG 2.5.8 (24 × 24), und 0113 hat 24 × 24 als Hausmaß gesetzt (dort
war 22,9 × 24 ein Mangel). Der negative Rand hält die Zeilenhöhe **nicht**:
`line-height: 0` legt die Grundlinie des Knopfs auf seine untere Randkante, bei
`align-items: baseline` wandert er dadurch 4 px über die Textoberkante.
Kleinster Weg, im Browser eingespielt und gemessen:
`.v2purp--inline { align-items: center }` plus
`.v2purp__info { width: 24px; height: 24px; padding: 0; margin-block: -4px;
display: inline-flex; align-items: center; justify-content: center }`
→ Zeilen 45,92 / 45,92 / 45,92 / 44,92, Knopf 24 × 24. Noch kleiner: den
Knopf gegen `IconButton size="sm"` tauschen — `.v2ibtn--sm` ist genau 24 × 24.

**M10 — „Originalwert" ist klickbar und antwortet nicht auf Hover. Blockiert.**
Kriterium: §9 „Jedes klickbare Element antwortet auf Hover".
Ort: `src/styles/v3.css:3299` (`.v2purp__raw summary`).
Messung: `CSS.forcePseudoState` `:hover` auf dem `summary` (Story `Block`) —
`color` bleibt `rgb(113,113,113)`, `background-color` bleibt transparent, keine
Unterstreichung, bei `cursor: pointer`. Zum Vergleich antwortet `.v2purp__info`
sauber (`rgb(113,113,113)` → `rgb(26,58,92)`).
Kleinster Weg: eine Zeile —
`.v2purp__raw summary:hover { color: var(--color-text); }`.

**M11 — drei Kommentare stehen gegen den gemessenen Code. Blockiert nicht, gehört aber in dieselbe Runde.**
a) `BankTransactionPurpose.stories.tsx:34–38`: die Story `Block` beschreibt
„`PURP` steht als Code, sein `title` trägt das Wort" — gemessen steht dort
„wiederkehrende Rate" mit `title="RINP"`, also genau das Gegenteil. Diese Story
ist der **benannte Nachweis** genau dieses Kriteriums.
b) `v3.css:3283` „der Knopf 24" — gemessen 22.
c) `v3.css:3283–3284` „der negative Rand hält die Zeilenhöhe, damit die Tabelle
nicht wächst" — gemessen wächst sie (M9).
M6 der Vorrunde hat zwei Kommentare richtiggestellt; diese drei sind übrig.

**M12 — `href` im `block`-Zweig hat keinen Nachweis. Blockiert nicht.**
Die Prop-JSDoc sagt „Works in both variants" und nennt als Beweis
`BankTransactionCell --without-counterparty`. Gemessen beweist die Story nur
den `inline`-Zweig: `.v2purp--inline`, darin `<a href="#bt-3">` mit dem ganzen
Freitext (357 × 15 px). Keine Story im Set rendert `variant="block"` mit
`href` (grep über `src/ui/v3`). M5 der Vorrunde ist damit halb belegt.
Kleinster Weg: den Satz auf `inline` einschränken oder eine Zeile in `Block`.

**M13 — `fallback` ist eine Prop ohne Spec-Zeile und ohne Story. Blockiert nicht.**
`BankTransactionPurpose.tsx:42,57`. Die Schnittstelle der Spec kennt drei
Props; `fallback` steht in keiner, und kein Aufrufer im Set setzt sie (grep über
`src/ui/v3`, **Exit 1**). Kleinster Weg: streichen — „—" steht schon als
Kriterium fest.

**M14 — das (i) hat kein `title`. Blockiert nicht.**
`aria-label="Referenzen und Originalwert"` ist da, ein `title` nicht. Das
Hausmuster `StatusInfoButton` trägt beides; mit der Maus bekommt hier niemand
das Wort zum Icon (V11, T8). Kleinster Weg: dasselbe Wort zusätzlich als
`title`.

### 4 · Die Mängel der Runde vom 2026-09-06, nachgemessen

| | Behauptung | Gemessen | |
|---|---|---|---|
| M1 | `PURP` als Wort, Code im `title` | Chip „wiederkehrende Rate" / `title="RINP"` (Block), „Lieferantenzahlung" / `title="SUPP"` (Raw); Schrift Inter, nicht mono; Übersetzung aus dem Spiegel, keine Map in der Datei | ✓ |
| M2 | Tag-Block ohne SVWZ zeigt „—" | `TagsOnly`: sichtbarer Text „—", (i) da, im Panel EREF/MREF/CRED und 64 Zeichen Rohblock | ✓ |
| M3 | 509 roh, 360 Freitext | `pre` 509 Zeichen, `.v2purp__text` 360 Zeichen | ✓ |
| M4 | `title` trägt die Vollform | `title` 360 Zeichen = der ganze Freitext; die Zeile kürzt (2255 px Bedarf gegen 346 px Kasten) | ✓ |
| M5 | `href` wirkt in beiden Zweigen | nur `inline` gemessen, `block` unbelegt | halb (M12) |
| M6 | zwei Kommentare richtiggestellt | drei stehen weiter gegen den Code | ✗ (M11) |
| M7 | „Jetzt 22 × 22", Zeilenhöhe gehalten | 22 × 22 gegen das Hausmaß 24 × 24 aus 0113, und die Zeile wächst um 2,46 px | ✗ (M9) |
| M8 | Sperrung auf Versalien gestrichen | `.v2purp__key`: `letter-spacing: normal`, `text-transform: none` | ✓ |

### 5 · Befunde am Set (gehört nicht zu dieser Aufgabe)

1. **`1fr` im Spaltensatz der `InUse`-Story.** `Table cols="110px 200px 1fr
   120px"` ist `minmax(auto, 1fr)` — der Fehler, den e7439fb, 399b38a und
   64e3fd9 an fünf Stellen gefunden haben. Hier **hält** er, weil
   `.v2purp--inline` selbst `min-width: 0` setzt: bei 700/1100/1400/1920 px
   kein Überlauf, `scrollWidth == clientWidth == 898`. Er hält also am
   Baustein, nicht am Satz. Ein Wächter über `cols=`-Zeichenketten mit nacktem
   `1fr` würde die nächste Familie billiger schützen als die nächste Abnahme.
2. **`Popover`-Vertrag gegen Gebrauch.** Die JSDoc des Primitivs sagt
   „`trigger`: A button **with a word** (T8)". Das (i) ist icon-only — und das
   ist im Set die Regel (0087, `StatusInfoButton`), nicht die Ausnahme. Die
   Vertragszeile beschreibt ihren eigenen Gebrauch nicht mehr.
3. **Drei Familien bauen sich ihr eigenes (i).** `.v2purp__info` (hier),
   `StatusInfoButton` (Inline-Styles im TSX) und `.v2ibtn--sm` sind drei
   Fassungen desselben Knopfs mit drei Maßen (22, 12-Icon ohne Polster, 24).
   Genau daraus entsteht M9. Ein einziger Icon-Knopf für alle wäre eine Stelle
   statt drei, an denen das Maß abdriftet.
4. **Die Spec kennt ihren eigenen Nachweis nicht mehr.** „Gesetzte `tags`
   gewinnen (Story `Block` gegen `WithoutTags`)" — `Block` setzt gar keine
   `tags`; der Beweis liegt in `TagsWin`. Dazu die Zeile „Setzt auf: `LongText`,
   `Badge` …", die schon die Vorrunde als überholt vermerkt hat. Beides ist
   Owner-Sache; eine Abnahme ändert keine Kriterien.

**Abgenommen von / am:** fremde Sitzung, 2026-09-07 — **zurück**.
**Blockierend:** M9, M10. **Mit derselben Runde zu erledigen:** M11–M14.

## Nach der Wiederabnahme (2026-09-07): beide Blocker und die vier kleinen

Gemessen gegen den Dev-Server `http://localhost:6107` über CDP; der Hover mit
`CSS.forcePseudoState`, nicht mit einem Blick ins Stylesheet.

**M9 — der Knopf misst jetzt 24 × 24, und die Zeile wächst nicht mehr.** Zwei
Ursachen, beide behoben: `.v2purp--inline` stand auf `align-items: baseline`,
und der Knopf hat `line-height: 0` — an der Grundlinie ausgerichtet zog er die
Zeile auseinander. Jetzt `center`. Und das Polster allein ergab 22 × 22 (14 +
2 × 4); die Trefferfläche steht jetzt über `min-width`/`min-height:
var(--space-6)` auf dem Hausmaß aus 0113.

Gemessen in `InUse` bei 1400 px: Knopf **24 × 24**; die Zeilen **mit** (i)
messen **45,92 px** — genau so viel wie die Zeilen ohne. Vorher waren es
48,38 gegen 45,92.

**M10 — der Zeiger hat jetzt eine Deckung.** `.v2purp__raw summary:hover`
setzt Textfarbe und Unterstreichung. Mit `CSS.forcePseudoState` gemessen:
ruhend `rgb(113,113,113)` ohne Dekoration, im Hover `rgb(45,45,45)` mit
`underline`. Vorher änderte sich nichts.

**M11 — die drei Kommentare stimmen.** (a) Der Story-Kommentar von `Block`
sagte „`PURP` steht als Code, sein `title` trägt das Wort" — gemessen ist es
umgekehrt, und diese Story ist der benannte Nachweis genau dieses Kriteriums.
Er sagt jetzt, was dasteht: „wiederkehrende Rate" mit `title="RINP"`
(nachgemessen). (b) und (c) sind mit M9 weggefallen — die Zahl 24 stimmt
jetzt, und die Zeile wächst nicht mehr.

**M12 — `href` im Block-Zweig hat seinen Nachweis.** Die Story `Block` zeigt
zwei Flächen, die zweite mit `href`. Gemessen: zwei `.v2purp--block`, davon
eine mit `<a href>`, dessen Text der Freitext ist — und **kein** Knopf
innerhalb eines Ankers (`a[href] button` findet nichts). Der JSDoc-Satz nennt
jetzt beide Nachweise statt einen für beide Zweige.

**M13 — `fallback` ist gestrichen.** Keine Spec-Zeile, kein Aufrufer. An ihre
Stelle tritt die Konstante `EMPTY = "—"`; das Kriterium „`purpose={null}` → —"
steht ohnehin fest, und eine Prop, die niemand setzt, ist eine Frage ohne
Fragesteller.

**M14 — das (i) trägt sein `title`.** Dasselbe Wort wie `aria-label`, wie beim
Hausmuster `StatusInfoButton`. Gemessen am gerenderten Knopf.

**Die Spec ist nachgezogen**, wo die Abnahme sie als veraltet gemeldet hat:
die Story-Ableitung nennt jetzt die gebauten **8** und sagt, welche zwei über
die Rechnung hinausgehen und warum (`TagsWin`, `TagsOnly` — je ein eigenes
Kriterium, unter der Obergrenze 10); das Kriterium „gesetzte `tags` gewinnen"
verweist auf `TagsWin` gegen `Block` statt auf `Block` gegen `WithoutTags` —
`Block` setzt gar keine Tags, der alte Verweis ging ins Leere.

`pnpm typecheck` Exit 0, `check:language` Exit 0. Nicht gebaut (0117).

**Status: Abnahme** — das Urteil war „zurück", also entscheidet die nächste
Runde, nicht ich.

## Schlanke Abnahme (Schnittstelle) 2026-09-08

Dritte Runde, fremder Prüfer — kein Bauanteil, kein Chat-Verlauf gelesen.
**Schlank** nach dem Owner-Entscheid 2026-09-08 (Skill `v3-komponente`, „Zwei
Tiefen"): geprüft wird die **Schnittstelle**, nicht die Darstellung.

Gelesen: diese Spec ganz (Schnittstelle Z. 66–83, Verhalten, Stories, Kriterien,
Freigabe samt Nachtrag, die Runden vom 2026-09-06 und 2026-09-07 und der
Abschnitt „Nach der Wiederabnahme"), dazu
`src/ui/v3/entities/bank-transaction/BankTransactionPurpose.tsx` (179 Z.) und
`BankTransactionPurpose.stories.tsx` (176 Z.), der Spiegel
`src/ludwig/modules/bank-transactions/domain/statement-line.ts` und
`sepa-tags.ts`, `src/ui/v3/entities/bank-transaction/derive.ts`, die vier
Aufrufstellen im Set, der CSS-Block `src/styles/v3.css:3297–3352`, das Barrel
`src/ui/v3/index.ts:414` und `spec-schreiben` §5/§6.

Gemessen: ein Durchlauf über **alle acht** Stories mit `scripts/cdp.mjs` aus dem
Repo (ein Browser, ein Skript) gegen den Dev-Server auf 6107, Story-IDs aus
`http://localhost:6107/index.json`, Breite 1400 px. Aktion (Popover öffnen) und
Messung in getrennten `Runtime.evaluate`-Aufrufen. **Nicht gebaut** (0117 — der
Baum ist geteilt). Die drei geprüften Dateien sind im Arbeitsbaum unverändert;
letzter Zug am Baustein `dd0491c`.

**Nicht geprüft, vertagt nach `docs/backlog/0119-visuelle-pruefung-nachholen.md`:**
Spurbreiten, Zeilenhöhen, Überläufe, Kontraste, Trefferflächen, Hover, Fokus,
Tastaturwege. Damit fallen zwei Zeilen dieser Spec in die Vertagung: das
Kriterium „das (i) ist per Tastatur erreichbar und öffnet mit Enter" und die
Prüfliste §9 — und mit ihr die Nachmessung von M9/M10 der Vorrunde. Was ich
dazu sagen kann, ist gelesen, nicht gemessen: `.v2purp__info` setzt
`min-width`/`min-height: var(--space-6)` (`v3.css:3325–3326`; `--space-6` ist
`24px`, `tokens.css:135`), `.v2purp--inline` steht auf `align-items: center`
(`:3308`), und `.v2purp__raw summary:hover` trägt Farbe und Unterstreichung
(`:3347`). Die **Wirkung** dieser drei Zeilen gehört 0119.

**Urteil: zurück** — **kein Mangel blockiert**. Der Baustein selbst ist sauber:
alle acht variablen Kriterien, die schlank prüfbar sind, sind erfüllt und im
Browser belegt; die sechs Wächter stehen samt Selbstprüfungen auf Exit 0; die
acht Stories rendern und schreiben nichts in die Konsole. Zurück geht die Runde
an **vier** Punkten, von denen drei die **Spec** betreffen und einer eine
Typherkunft im Code — nach der Hausregel „alles ✓ → fertig, sonst zurück"
reicht das nicht für `fertig`. Die vier sind in einem Zug zu erledigen.

### 1 · Die Schnittstelle, Zeichen für Zeichen

Signatur `BankTransactionPurpose.tsx:41–69`, Spec-Tabelle Z. 68–72.

| Prop | Spec | Code | Ergebnis |
|---|---|---|---|
| `purpose` | `string \| null`, Pflicht | `purpose: string \| null` (`:48`), ohne `?` | ✓ zeichengleich |
| `tags` | `SepaTags \| null`, optional | `tags?: SepaTags \| null` (`:53`) | ✓ zeichengleich |
| `variant` | `"inline" \| "block"`, optional, Vorgabe `inline` | `variant?: "inline" \| "block"` (`:58`), Vorgabe im Destructuring `variant = "inline"` (`:44`) | ✓ zeichengleich |
| `href` | **keine Zeile** | `href?: string` (`:68`) | ✗ **M1** |

`fallback` (M13 der Vorrunde) ist wirklich weg — `grep fallback` über den Ordner
findet nur noch zwei Kommentarwörter (`:51`, `:171`), keine Prop. An ihrer
Stelle steht die Konstante `EMPTY = "—"` (`:34`), gemessen in `Empty` und
`TagsOnly`.

**Herkunft der Typen.** `SepaTags`, `derivePurposeParts` und `PURP_LABELS`
kommen aus dem Spiegel (`BankTransactionPurpose.tsx:1–5` →
`@/ludwig/modules/bank-transactions/domain/statement-line`, das `SepaTags` aus
`sepa-tags.ts:34–44` weiterreicht). Nichts davon ist hier neu definiert, nichts
verschärft: der Spiegel nimmt `string | null | undefined`, die Prop gibt
`string | null` — das ist die Verengung der **Spec**, nicht eine des Bausteins.
`grep -nE '\bas [A-Z]'` über `BankTransactionPurpose.tsx`,
`BankTransactionPurpose.stories.tsx` und `derive.ts`: **Exit 1**, kein Treffer.
Eine Ausnahme: `Refs` beschreibt `PurposeRef` noch einmal von Hand → **M3**.

**Kann bewusst nicht** (Spec Z. 74–83), am Code nachgelesen: keine Suche (die
Komponente ruft nur `derivePurposeParts`, `:70`); kein erzwungenes Nachparsen
(`tags` fließt unverändert in die Ableitung, die sie über das Nachgeparste
legt, `statement-line.ts:52`); keine Kürzungsentscheidung im TSX (die Ellipse
steht in CSS, `v3.css:3311–3313`, `block` hat keine); der Originalblock ist in
**beiden** Zweigen erreichbar (`:89` und `:124`, gemessen: `details` 2 in
`Block`, 1 in `Inline`).

### 2 · Kriterien

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit **0** | ✓ |
| `pnpm build` grün | **nicht gelaufen** — 0117, ein geteilter Baum, `build` leert `storybook-static/` unter den anderen weg. Ersatz: Exit 0 des `typecheck` und acht rendernde Stories | offen (Regel) |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/bank-transaction/BankTransactionPurpose.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionPurpose` (`stories:7`, bestätigt im `index.json`); Barrel `src/ui/v3/index.ts:414` | ✓ |
| Code englisch | `pnpm check:language` Exit **0**. Der Wächter prüft aber nur, was `HEAD~1`/`HEAD`/`--cached` anfassen — die Datei ist älter, also deckt der Exit sie **nicht**. Gegenprobe mit dem Bestandsbericht `--all` (377 Zeilen in 136 Dateien): **kein Treffer aus `BankTransactionPurpose.tsx`**. Story-JSDoc sind ausgenommen (0098 M10) | ✓, eigens nachgesehen |
| `@when`/`@instead` an jedem Export | ein Export (`:41`), beide Zeilen darüber (`:37–39`); `Refs`, `Raw`, `EMPTY`, `REF_ORDER` sind nicht exportiert. `pnpm check:when` Exit **0** | ✓ |
| Kein Hex, kein px | `grep -nE '#[0-9a-fA-F]{3,8}\b\|[0-9]+px'` über die Komponente: **Exit 1**. Einzige nackte Zahl ist `size={14}` (`:118`) — die Ikonenleiter, 38 weitere Stellen im Set. Die `maxWidth: 420`-Rahmen der Stories sind Story-Rahmen, wie in 78 Story-Dateien | ✓ |
| Keine lokale Label-Map; Status nur über Registry | `PURP_LABELS` kommt aus dem Spiegel (`:3`, `statement-line.ts:15–22`), die Hinweistexte der Chips ebenfalls (`refDefs`, dort Z. 54–66). `REF_ORDER` (`:149`) ist eine **Reihenfolge**, keine Übersetzung. Die Komponente trägt keine Zustandsachse, also keine Registry-Pflicht — `grep status-registry`: Exit 1 | ✓ |
| Alle Stories vorhanden; ausgeschlossene begründet | §3 | ✓ |
| Prüfliste §9 | **vertagt nach 0119** (Hover, Fokus, Trefferfläche, Zeilenhöhe) | vertagt |
| Im Browser angesehen | acht Stories, 1400 px | ✓ |

Die Wächter über den Exit-Code, alle sechs:
`pnpm typecheck` **0** · `pnpm check:language` **0** · `pnpm check:icons` **0**
(53 Zeichen in der Registry) · `pnpm check:contrast` **0** (33 Angaben) ·
`pnpm check:mirror` **0** (8 Fälle; der Spiegel steht eingefroren auf
`f1c58c44`) · `pnpm check:when` **0**.
Ihre Selbstprüfungen: `check-language --test` **0** (8 Fälle) ·
`check-when --test` **0** (11) · `check-contrast --test` **0** (16) ·
`mirror-filter --test` **0** (8). `check-icons.mjs` **kennt kein `--test`** —
derselbe Befund am Set wie in 0096.

**Variabel** (gemessen im Browser, sofern nicht vertagt)

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Rohblock **nie** als Erstes | `Raw`: `.v2purp__text` trägt 360 Zeichen SVWZ-Freitext, beginnend „Sammelüberweisung August 2026 …"; der 509-Zeichen-Rohblock steht allein im `<pre>` hinter dem (i) | ✓ |
| Alle sieben Schlüssel, Reihenfolge, `PURP` als Wort | `Raw`, Popover offen: **EREF · KREF · MREF · CRED · ABWA · PURP · OAMT** — genau die Reihenfolge der Spec-Tabelle Z. 53–61; `PURP` = „Lieferantenzahlung", `title="SUPP"`, als einziger ohne `.v2mono`. `TagsWin` zeigt dieselben sieben mit „wiederkehrende Rate" / `title="RINP"` | ✓ |
| Ohne Tag-Block **kein** (i) | `WithoutTags`: `.v2purp__info` **0 ×** im DOM, Text ist der Rohwert. `Empty` ebenfalls 0 × | ✓ |
| Original über dasselbe (i) | `Inline`, Popover offen: ein `.v2purp__panel` mit sechs Chips **und** `<details><summary>Originalwert</summary><pre>` | ✓ |
| (i) per Tastatur, öffnet mit Enter | **vertagt nach 0119** (Tastaturweg) | vertagt |
| `derivePurposeParts()` eigene Datei, rendert nichts | `src/ludwig/modules/bank-transactions/domain/statement-line.ts:46–76`; `grep -nE "</\|/>\|from \"react\""` darauf → **Exit 1** | ✓ |
| Gesetzte `tags` gewinnen | `TagsWin` gegen `Block`, derselbe Rohwert: MREF im Chip **`AUS-DEM-IMPORT-4711`** statt `D-VR-50411866-0-001`, dazu ein ABWA-Chip `Musterbau GmbH & Co. KG`, den der Text gar nicht enthält (`Block` zeigt sechs Chips, `TagsWin` sieben) | ✓ |
| Freitext nicht mono | `.v2purp__text` computed `font-family: Inter, Inter, -apple-system, "system-ui", "Segoe UI", sans-serif` | ✓ |
| offen (App): ersetzt `PurposeDisplay.tsx` … | außerhalb dieses Repos | bleibt offen |

### 3 · Story-Deckung

| Frage | Befund |
|---|---|
| Zahl gegen `spec-schreiben` §6 | 3 anwendbare Zustände + 1 Enum (`variant`) + 0 Layout-Booleans + 0 Callbacks + 1 „im Einsatz" + 1 Rand = **6**. Im `index.json` stehen **8**; die Spec nennt seit dem 2026-09-07 selbst 8 und begründet die zwei (Z. 104–108). Obergrenze 10 gehalten | ✓ |
| Vorhanden | `Inline`, `Block`, `WithoutTags`, `Empty`, `TagsWin`, `Raw`, `TagsOnly`, `InUse` — genau die acht der Tabelle Z. 110–119 | ✓ |
| `purpose` | `Inline` (55 Zeichen Freitext) · `Empty` (`—`) | ✓ |
| `tags` | `TagsWin` — gemessen. Die **Schnittstellen**-Tabelle nennt weiter `Block`, das keine `tags` setzt | ✗ **M2** |
| `variant` | `Inline` (`.v2purp--inline` 1 ×, `--block` 0) gegen `Block` (`--block` 2 ×, `--inline` 0) | ✓ |
| `href` | `Block`, zweite Fläche: ein `<a href="#bt-3">` um den Freitext, `a[href] button` = **0** — der Knopf bleibt außerhalb des Ankers; dazu `BankTransactionCell --without-counterparty` für `inline`. Nur: die Spec kennt die Prop nicht | ✗ **M1** |
| Ausgeschlossene Zustände begründet | `leer nach Filter`, `lädt`, `Fehler` — Z. 98 und Z. 121; für eine reine Anzeige einer Spalte trägt keiner davon | ✓ |
| Sagen die Stories, was sie zeigen | ja, auch der 2026-09-07 richtiggestellte `Block`-Kommentar (`stories:34–45`): gemessen steht dort „wiederkehrende Rate" mit `title="RINP"` — genau das, was er behauptet | ✓ |

**Jede Story rendert, keine schreibt in die Konsole.** Acht Stories, je nach
dem Laden 900 ms beobachtet über `Runtime.consoleAPICalled` (error/warning),
`Runtime.exceptionThrown` und `Log.entryAdded`: **eine** Meldung im ganzen Lauf,
`404` auf `http://localhost:6107/favicon.ico` (per `Network.responseReceived`
nachgesehen) — der Dev-Server, nicht der Baustein. Aus den Komponenten
**null**. Gerenderte `.v2purp`-Knoten: `Inline` 1 · `Block` 2 · `WithoutTags` 1
· `Empty` 1 · `TagsWin` 1 · `Raw` 1 · `TagsOnly` 1 · `InUse` 4.

### 4 · Mängel

**M1 (Spec) — `href` ist eine vierte Prop ohne Zeile in der Schnittstelle.**
*Kriterium:* jede Prop gegen die Schnittstellen-Tabelle, Typ, Pflicht, Vorgabe.
*Ort:* `BankTransactionPurpose.tsx:59–68` gegen Spec Z. 68–72.
*Befund:* die Tabelle führt drei Props, der Code hat vier. `href?: string` ist
kein Rest: sie trägt ein eigenes Verhalten (nur der **Freitext** wird zum Weg,
weil ein Knopf im Anker kein gültiges Markup ist), sie hat einen Nachweis in
beiden Zweigen, und `BankTransactionCell.tsx:64` setzt sie. Genau umgekehrt zu
`fallback`, das die Vorrunde als „Prop ohne Spec-Zeile" gestrichen hat — hier
ist die Prop richtig und die **Spec hinterher**, dasselbe Muster wie 0070,
0082, 0095 M1 und 0096 A1. Wer beim Umzug nur die Schnittstelle liest, baut
die 3 % Zeilen ohne Gegenpartei ohne Weg.
*Kleinster Weg:* eine vierte Zeile in die Tabelle — `href` · `string` · nein ·
„macht den Freitext zum Weg, nicht die ganze Komponente (0100)" · Nachweis
`Block` (zweite Fläche) und `BankTransactionCell --without-counterparty`.
**Blockiert nicht.**

**M2 (Spec) — die Nachweis-Spalte für `tags` zeigt weiter auf `Block`.**
*Kriterium:* §5 „Jede Prop bekommt in der Tabelle die Story, die sie beweist".
*Ort:* Spec Z. 71 gegen `BankTransactionPurpose.stories.tsx:46–53`.
*Befund:* `Block` rendert zweimal `purpose={FULL}` **ohne** `tags` — die Story
kann den Vorrang gesetzter Tags nicht zeigen. Die Nacharbeit vom 2026-09-07 hat
das Kriterium (Z. 162) und die Story-Tabelle (Z. 116) auf `TagsWin` umgestellt,
die **Schnittstellen**-Tabelle aber nicht; der Befund 4 der Vorrunde ist damit
nur halb erledigt.
*Kleinster Weg:* in Z. 71 `Block` durch `TagsWin` ersetzen.
**Blockiert nicht.**

**M3 — `PurposeRef` steht ein zweites Mal, lokal.**
*Kriterium:* Fachtypen kommen aus `src/ludwig/`, nie lokal neu definiert.
*Ort:* `BankTransactionPurpose.tsx:151`.
*Befund:* `function Refs({ refs }: { refs: { key: string; value: string; hint:
string }[] })` beschreibt Feld für Feld `PurposeRef` aus dem Spiegel
(`statement-line.ts:24–28`) — den `derive.ts:19` sogar schon für die Familie
re-exportiert. Heute deckungsgleich, also kein Typfehler und kein `as`; aber
genau so driften Fachtypen: kommt drüben ein Feld dazu oder wird eines optional,
merkt es hier niemand, weil die Struktur passt.
*Kleinster Weg:* `type PurposeRef` mitimportieren und `refs: PurposeRef[]`
schreiben — eine Zeile im Import, eine in der Signatur.
**Blockiert nicht.**

**M4 (Spec) — „Setzt auf" nennt zwei Bausteine, die nicht drin sind, und
verschweigt einen, der drin ist.**
*Kriterium:* die Einordnung der Spec gegen den gebauten Code.
*Ort:* Spec Z. 46 gegen `BankTransactionPurpose.tsx:6–8`.
*Befund:* die Spec sagt `LongText`, `Badge`, `Popover`, `ActionIcon`. Importiert
sind `ActionIcon`, `Link`, `Popover`. `LongText` kürzt nach Zeichenzahl und
widerspricht damit Entscheid 3 der Freigabe; `Badge` heißt im Set „hier steht
ein Zustand" und ist bewusst durch die stille Marke `.v2purp__key` ersetzt
(Kommentar `:157–158`). Beides steht seit dem 2026-09-06 als „offen, weil
Owner-Sache" unter den Mängeln und ist seither zweimal ungeändert durch eine
Abnahme gegangen. `Link` fehlt in der Aufzählung, obwohl `href` über sie läuft.
*Kleinster Weg:* die Zeile auf „`Popover`, `ActionIcon`, `Link`" ziehen und den
Satz über `Badge` in einen Halbsatz „statt `Badge`, weil ein Badge im Set einen
Zustand meint" verwandeln.
**Blockiert nicht.**

### 5 · Was ich nicht angefasst habe

Die Tabelle „Abnahme" (Z. 168–172) steht weiter als Platzhalter `| … | … | … |`
da; wie in den beiden Runden davor tritt dieser Abschnitt an ihre Stelle. Eine
Abnahme ändert keine Kriterien, deshalb stehen M1, M2 und M4 hier und nicht in
der Kriterienliste. Code, Stories und CSS sind unverändert.

**Abgenommen von / am:** fremde Sitzung, 2026-09-08 — **zurück** (schlank,
Schnittstelle).
**Blockierend:** keiner.
**Mit derselben Runde zu erledigen:** M1, M2, M4 (Spec) und M3 (eine
Typherkunft).

### Nacharbeit 2026-09-08 (nach der schlanken Abnahme)

Urteil war **zurück**, ohne blockierenden Punkt. Alle vier erledigt:

| Punkt | Was getan |
|---|---|
| **M1** | `href` steht jetzt in der Schnittstellen-Tabelle, mit `Block` als Nachweis (die Story setzt sie seit jeher). Gebaut, belegt und benutzt von `BankTransactionCell` — sie fehlte nur in der Tabelle |
| **M2** | Der Nachweis für `tags` zeigt auf `TagsWin` statt auf `Block`; `Block` setzt gar keine. Kriterium und Story-Tabelle waren am 07.09. schon umgezogen, die Schnittstellen-Tabelle nicht |
| **M3** | `Refs` importiert `PurposeRef` aus `src/ludwig/`, statt seine drei Felder lokal noch einmal hinzuschreiben. `derive.ts` re-exportiert den Typ bereits — der Nachbau war nur ein Vergessen, und er hätte jede Änderung am Spiegel stillschweigend überlebt |
| **M4** | „Setzt auf" nennt `Popover`, `ActionIcon` und `Link`. `LongText` und `Badge` standen dort, obwohl beide **bewusst** nicht verwendet werden — jetzt steht das mit Grund da, statt sie zu verschweigen |

`pnpm typecheck` und die fünf Wächter auf Exit 0.
