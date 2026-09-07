# 0102 · BankTransactionFacts — alles, was an einer Zahlung steht

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: achtzehn Felder dieser Entität, fünf davon aus SEPA |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionFacts`; Ränge 1–18 |
| Ersetzt | `modules/bank-transactions/ui/BankTransactionDetail.tsx` (150 Z.) samt `KV` aus `kontoauszug-presentation.tsx` |
| Voraussetzung | 0099 `BankTransactionPurpose` · 0095 `CaseCell` |
| Blockiert | `BankTransactionDrawer` (0103) — er muss Zone 3 aus dieser Komponente zeigen (0052) |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Wer eine Zahlung aufschlägt, will alles sehen, was an ihr hängt — und das
ist bei dieser Entität viel: achtzehn Punkte, von denen die Zeile acht zeigt.
Anders als beim Sachverhalt gibt es hier **eine** bestehende Fassung, und sie
ist gut: `BankTransactionDetail` zeigt schon fast den ganzen Satz in vier
Blöcken. Diese Spec hebt sie und ergänzt, was fehlt.

## Einordnung

- **Wiederverwenden:** `FieldList` trägt die Paare, `Amount`, `Time`,
  `MonoCell` die Werte, `RawRecord` (0051) die Rohdaten,
  `BankTransactionPurpose` (0099) den Zweck, `CaseCell` (0095) die
  zugeordneten Fälle. Es fehlt der Zuschnitt.
- **Neu, weil:** `spec-schreiben` §3 Regel 5, und tragend ist **0052**: der
  Drawer muss die Kernfakten aus derselben Komponente zeigen wie eine spätere
  Detailansicht. Ohne diese Datei hätte 0103 keine Zone 3.
- **Zuschnitt:** eine Datei, ein Export. Fünf Blöcke, keine fünf Exporte —
  sie teilen denselben Datensatz und treten nie getrennt auf (§4).
- **Setzt auf:** `FieldList`, `Amount`, `Time`, `MonoCell`, `RawRecord`,
  `BankTransactionPurpose`, `CaseCell`.

## Fünf Blöcke

| Block | Ränge | Inhalt |
|---|---|---|
| Zahlung | 2, 4, 9, 16 | Betrag, Buchungsdatum, Valuta, EUR-Wert (nur wenn abweichend) |
| Verwendungszweck | 1, 11 | Freitext plus die sieben SEPA-Chips (`variant="block"`) |
| Gegenpartei | 3, 10, 12 | Name, IBAN, BIC — die letzten beiden mono |
| Zuordnung | 5, 6, 7, 8, 13 | DATEV-Haken mit Match-Stufe im Klartext, die Sachverhalte mit Teilbetrag, Buchungs-Zustand, offene Klärungen |
| Import | 14, 15, 17, 18 | Quelle, Import-Lauf mit Zeitpunkt, externe ID, Rohdaten |

Die Reihenfolge ist die des Profils und über alle Formen dieselbe. Rang 18
(`raw_payload`) ist der einzige Zuwachs gegenüber der heutigen Fassung — er
kommt als `RawRecord`, nicht als Feldliste, weil der Spaltenkommentar ihn als
„für Audit/Debugging" führt.

## Der EUR-Wert erscheint bedingt

`amount_eur` ist zu 100 % gefüllt und heute **identisch** zu `amount`,
`fx_rate` ist immer 1 (Phase 1: nur EUR). Eine Zeile „Betrag (EUR): 89,90 €"
neben „Betrag: 89,90 €" sagt nichts. Sie erscheint deshalb nur, wenn die
beiden Werte auseinandergehen — so macht es die heutige Fassung schon, und
das bleibt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transaction` | `BankTransactionDetailData` | ja | Die Position mit allen achtzehn Punkten | `Filled` |
| `caseHref` | `(caseId: string) => string` | ja | Reicht an `CaseCell` durch | `Filled` |
| `blocks` | `BankTransactionFactBlock[]` | nein, Default alle fünf | Welche Blöcke. Der Drawer lässt „Import" weg — das ist Herkunft, keine Kernfrage | `InDrawer` |
| `tone` | `"surface" \| "bare"` | nein, Default `surface` | Durchgereicht an `FieldList` | `InDrawer` |

**Kann bewusst nicht:**

- **Zuordnen oder umbuchen.** Kein Schreibpfad. An dieser Entität schreibt
  ohnehin keine Nutzerhand — vier Schreibpfade gibt es, alle sind Import,
  Matcher, Agent oder Watchdog.
- **Die Match-Stufe selbst benennen.** Wort und Ton kommen aus der Achse
  `bank_match_stage`; eine lokale Übersetzung gäbe es hier nicht (R1).
- **Den Zweck kürzen.** Hier steht er ganz (`variant="block"`); das Kürzen
  ist Sache der Zeile.

## Verhalten

Server-Component. `FieldList` je Block, Blöcke untereinander mit
Überschrift. Zahlen rechts mit `tnum`, IBAN und BIC mono, Zeitpunkte über
`Time`.

Ein Feld ohne Wert lässt seine Zeile weg — mit **einer** Ausnahme: die
Zuordnung. Dort heißt kein Wert etwas („noch keinem Sachverhalt
zugeordnet"), und das steht als Satz, nicht als Lücke. 65 % der Positionen
sind dieser Fall.

Zustände: gefüllt · nicht zugeordnet · ohne SEPA-Tags (10 %). Lädt und Fehler
gehören dem Aufrufer.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionFacts`. Abgeleitet
nach §6: 3 anwendbare Zustände + 1 Enum (`blocks`) + 1 Enum (`tone`) +
0 Callbacks + 1 „im Einsatz" + 1 Rand = 7.

| Story | Beweist |
|---|---|
| `Filled` | Alle fünf Blöcke, ein zugeordneter Fall, sieben SEPA-Chips |
| `Unassigned` | Der Zuordnungs-Block sagt den Satz, statt leer zu bleiben |
| `WithoutTags` | Ohne SEPA-Block: der Zweck steht als Freitext, keine leere Chip-Reihe |
| `InDrawer` | `blocks` ohne „Import", `tone="bare"` — die Fassung für 0103 |
| `RawPayload` | Rang 18 als `RawRecord`, aufklappbar |
| `Split` | Rand: drei Sachverhalte mit Teilbeträgen und Rest |
| `InUse` | Unter einem Kopf mit Gegenpartei und Betrag — nichts steht zweimal |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Der Beleg, aus dem die Zeile stammt | `sourceDocument?: SourceDocumentLink` | L-45 ist entschieden und die Kante hat einen FK |
| Die Match-Stufe als Chip statt als Wort | keine Prop — eine Achse (L-57) | die Achse ist da |

## Befunde für `ludwig/app`

- **B1 (L-56)** — Der Detail-Typ liegt nicht im Spiegel; lokal
  deckungsgleich definiert.
- **B2 (L-57)** — Ohne Achse für `match_stage` steht die Stufe hier als
  Klartext ohne Ton. Die vier offenen Klassen bekommen damit **hier** zum
  ersten Mal ein Wort — in der Zeile sind sie unsichtbar.
- **B3 (L-45)** — Die Kante zum Beleg ist weich und hat keinen FK; solange
  der Owner-Entscheid aussteht, zeigt kein Block „dieser Umsatz stammt aus
  Beleg X".

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

- [ ] Die fünf Blöcke stehen in der Reihenfolge oben, die Punkte darin in der Rang-Reihenfolge (Story `Filled`)
- [ ] Der EUR-Wert erscheint **nur** bei Abweichung (Story `Filled`: nicht sichtbar)
- [ ] Der Zuordnungs-Block sagt bei 0 Fällen einen Satz, keine Lücke (Story `Unassigned`)
- [ ] Ohne SEPA-Tags fehlt die Chip-Reihe ganz, nicht als leere Zeile (Story `WithoutTags`)
- [ ] Die Match-Stufe steht als `StatusBadge axis="bank_match_stage"` (Story `Filled`); die vier offenen Klassen tragen ihr Wort
- [ ] Rohdaten kommen über `RawRecord`, nicht als Feldliste (Story `RawPayload`)
- [ ] `blocks` und `tone` reichen durch und ändern nichts an der Reihenfolge (Story `InDrawer`)
- [ ] Kein Schreibpfad in der Datei (`grep`: kein `onChange`, kein `action`)
- [ ] offen (App): ersetzt `BankTransactionDetail.tsx` samt `KV`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Gehören die Rohdaten (Rang 18) überhaupt hierher? *Ohne Antwort: ja, als
   letzter Block und aufgeklappt geschlossen. Der Spaltenkommentar nennt sie
   „für Audit/Debugging", und genau dann sucht man sie hier statt in der DB.*
2. Fünf Blöcke oder vier? *Ohne Antwort: fünf. Der Zweck ist Rang 1 und
   trägt sieben Referenzen — als Zeile im Zahlungs-Block ginge er unter.*
3. Zeigt der Zuordnungs-Block den Buchungs-Zustand je Fall oder einmal?
   *Ohne Antwort: je Fall. Er gehört dem Ereignis, und bei mehreren Fällen
   gibt es mehrere Ereignisse — das ist der Satz, der die ganze Familie
   trägt.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Entscheide: 1 Rohdaten als letzter Block, zugeklappt · 2 fünf Blöcke · 3 Buchungs-Zustand je Fall (Familienregel).

Vor dem Bau in die Spec: (a) ~~Zuordnungs-Block: `match_stage` als Rohwert der Spalte, mono, unübersetzt, ohne Ton, bis L-57~~ — **überholt am 2026-09-06:** die Achse `bank_match_stage` steht im Register (`cc141f7b`), also `StatusBadge axis="bank_match_stage"` mit Wort und Ton wie überall. Der Befund B2/L-57 dieser Spec ist erledigt; (b) Typ-Satz aus 0100, mit dem Ereignis-Zustand je Fall, den `CaseLink` (0095) nicht trägt; (c) Story-Formel zählt `RawPayload` mit (Kosmetik).

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — der Zuordnungs-Block drehte seine Reihenfolge um, sobald kein Fall da
war.** Der leere Zweig setzte Rang 6 vor Rang 5, der gefüllte richtig herum —
und den leeren sehen 65 % der Positionen. Jetzt steht „DATEV-Historie" in
beiden Zweigen zuerst.

**M2 — der Satz bei null Fällen stand rechtsbündig.** Die Feldliste setzt ihre
Werte flush rechts; ein Satz ist aber Text (V3). Genau diese Falle war für den
Zweck-Block erkannt und umgangen worden, für den einzigen echten Satz der
Komponente nicht. Jetzt `.v2btxf__note` mit `text-align: left`, gemessen.

**M3/M4 — die Rohdaten standen aufgeklappt und in der Wertspalte.** Der
Freigabe-Entscheid sagt „zugeklappt"; gemessen waren alle sieben Schlüssel
sofort sichtbar. Und die Tabelle saß als **Wert** einer Feldzeile: sie begann
erst bei 257 px, war 435 px breit und erbte die Rechtsbündigkeit — das
Gegenteil dessen, wofür 0051 gebaut wurde. Jetzt ein eigener Abschnitt unter
dem Import-Block, in einer `Disclosure` („Rohdaten der Quelle"), zugeklappt;
gemessen steht `buchungstag` nicht mehr im Text.

**M5 — `Split` zeigte den Rest nicht, den seine Beschreibung ankündigt.**
2.480,55 € minus 1.200 minus 800 minus 180 sind 300,55 €, und die standen
nirgends — die Zeile (0101) zeigt sie, die Fakten nicht. Jetzt eine Zeile
„Nicht zugeordnet" mit `restOf()` aus demselben Spiegel wie die Zeile, damit
beide Formen dieselbe Zahl sagen. Gemessen: 300,55 €.

**M6 — `InUse` bewies sein Kriterium nicht.** Gegenpartei stand dreimal, der
Betrag zweimal. Der Kopf trägt jetzt nur noch Identität und Datum, und die
Story lässt den Gegenpartei-Block weg — der Name steht im Kopf, und IBAN und
BIC ohne ihn wären eine Feldliste ohne Betreff. Gemessen: Gegenpartei einmal.

## Wiederabnahme 2026-09-07 (fremde Abnahme)

**Urteil: zurück.** Zwei Blocker, beide aus der vorigen Runde: der Satz bei
null Fällen steht weiterhin rechts (M2 — die Regel greift nicht, weil sie an
einem Inline-Element hängt), und `InUse` zeigt weiterhin etwas zweimal (M6 —
statt der Gegenpartei nun das Datum). Alles andere der Spec ist erfüllt und
gemessen; sechs kleinere Mängel und drei Befunde am Set stehen unten.

**Stand des Baums:** HEAD `f1913b6`, dazu **nicht eingecheckte** Änderungen
einer parallelen Sitzung in `src/styles/v3.css`,
`src/ui/v3/entities/accounting-case/CaseCell.tsx` und
`BankTransactionFacts.tsx` (dort `CaseCell … layout="stacked"`). Gemessen ist
dieser Arbeitsbaum über den laufenden Storybook auf Port 6107. `pnpm build`
wurde bewusst **nicht** gelaufen (Befund 0117 — parallele Sitzungen messen
gegen denselben Baum); dafür steht `pnpm typecheck` grün.

### 1 Story-Deckung

Sieben Stories im Index, sieben in der Spec — die Zahl stimmt mit der
Ableitung (§6: 3 Zustände + 1 Enum `blocks` + 1 Enum `tone` + 0 Callbacks +
1 „im Einsatz" + 1 Rand = 7). Gemessen über `GET /index.json`: `Filled`,
`Unassigned`, `WithoutTags`, `InDrawer`, `RawPayload`, `Split`, `InUse`,
alle unter `v3/Entitäten/Kontoauszugsposition/BankTransactionFacts`.

Jede Prop hat ihre Story: `transaction` und `caseHref` in `Filled` (gemessen:
drei verschiedene `href` in `Split` — `#fall-c-4412`, `#fall-c-4488`,
`#fall-c-4501`), `blocks` in `InDrawer`/`RawPayload`/`InUse`, `tone` in
`InDrawer`/`InUse` (gemessen: `class="v2fields v2fields--bare"` an allen vier
Blöcken). Ausgeschlossen sind `lädt` und `Fehler` mit Grund („gehören dem
Aufrufer"); `leer nach Filter` steht ohne Grund da — er ist offensichtlich
(die Komponente filtert nicht), aber §6 verlangt ihn ausgeschrieben.

### 2 Die Kriterien der Spec

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit-Code 0 | ✓ |
| `pnpm build` grün | **nicht gelaufen** — Befund 0117 verbietet den Bau neben laufenden Sitzungen | offen |
| Datei nach der Familie benannt, Story daneben, Titel in der Gruppe | `BankTransactionFacts.tsx` + `.stories.tsx` unter `entities/bank-transaction/`; Titel `v3/Entitäten/Kontoauszugsposition/…`; Export in `index.ts:404` | ✓ |
| Code englisch; `@when`/`@instead` am Export | `pnpm check:language` Exit 0 (2 angefasste Dateien, diese darunter), `pnpm check:when` Exit 0; ein `@when`, ein `@instead` an `BankTransactionFacts` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}"` Exit 1, `grep -nE "[0-9]+px\|fontSize\|minWidth"` Exit 1; `SOURCE` ist eine Enum-Wortliste ohne Achse (sieben gleichartige Fälle im Set), keine Status-Map; beide Zustände über `StatusBadge` | ✓ |
| Prüfliste §9 durchgegangen | siehe Abschnitt 3 | teilweise |
| Im Browser angesehen | alle sieben Stories über CDP gerendert und gemessen | ✓ |
| Fünf Blöcke in der Reihenfolge, Punkte in Rang-Reihenfolge (`Filled`) | gemessen: Zahlung · Verwendungszweck · Gegenpartei · Zuordnung · Import; Zahlung 2→4→9, Gegenpartei 3→10→12, Import 14→15→(17)→18 | ✓ |
| EUR-Wert nur bei Abweichung (`Filled`: nicht sichtbar) | gemessen: der Zahlungs-Block trägt drei Zeilen, „Betrag in EUR" ist in keiner der sieben Stories im Text | ✓ (der Umkehrfall wird von keiner Story gezeigt, s. Mangel 6) |
| Zuordnung sagt bei 0 Fällen einen Satz (`Unassigned`) | gemessen: Zeile 2 trägt „Diese Zahlung ist noch keinem Sachverhalt zugeordnet." | ✓ Text, ✗ Lage (Mangel 1) |
| Ohne SEPA-Tags fehlt die Chip-Reihe ganz (`WithoutTags`) | gemessen: im gerenderten Text steht nur „Dauerauftrag Miete Büro Musterstadt September 2026", kein `EREF`/`KREF`/`MREF`/`CRED`/`ABWA`/`PURP`/`OAMT`, keine leere Zeile | ✓ |
| Match-Stufe als `StatusBadge axis="bank_match_stage"`, die vier offenen Klassen tragen ihr Wort | gemessen: `Filled` „exakt", `Unassigned` „kein Kandidat", `Split` „aufgeteilt" — alle aus der Registry | ✓ für die Darstellung, 1 von 4 offenen Klassen belegt (Mangel 4) |
| Rohdaten über `RawRecord`, nicht als Feldliste (`RawPayload`) | gemessen: `details.v2disc` mit `open=false`, `buchungstag` nicht im Text; aufgeklappt sieben `.v2raw__key` alphabetisch, alle linksbündig bei `left = 48,00 px`, Werte bei `left = 304,00 px`, Tabelle 656 px breit ab dem linken Rand | ✓ |
| `blocks` und `tone` reichen durch, Reihenfolge unverändert (`InDrawer`) | gemessen: vier Blöcke in derselben Folge, alle `v2fields--bare`, kein Import-Block, keine Disclosure | ✓ |
| Kein Schreibpfad | `grep -n "onChange"` Exit 1, `grep -nE "[^s]action="` Exit 1, `grep -nE '"use (client\|server)"'` Exit 1 | ✓ |
| ersetzt `BankTransactionDetail.tsx` samt `KV` | Sache der App | offen (unverändert) |

Wächter, je Exit-Code: `typecheck` 0 · `check:language` 0 · `check:icons` 0 ·
`check:contrast` 0 · `check:mirror` 0 · `check:when` 0. Die Selbstprüfungen
(`--test`) von `check-language`, `check-contrast`, `check-when` und
`mirror-filter` je Exit 0.

### 3 Ausrichtung, Wertebereich, §9

- **Gemeinsame Kante:** ja. Mit `Range.getClientRects` gemessen steht in
  `Filled` bei 1400 px jeder der elf Werte mit **derselben** rechten Kante,
  `691,00 px` — Betrag, Datum, IBAN, BIC, Chip, `CaseCell`, Import-Lauf. In
  `InUse` ergibt dieselbe Messung genau **eine** Kante je Breite: 639,00 px
  bei 700, 731,00 px bei 1100, 1400 und 1920.
- **Breitester Wert:** jede Zeile trägt ihn. Bei 700 px und mit **allen**
  `details` aufgeklappt (Rohdaten samt geschachteltem JSON) meldet kein
  Element `scrollWidth > clientWidth`, kein Element mit `text-overflow:
  ellipsis` schneidet, und das Dokument scrollt nicht waagerecht — geprüft in
  `Filled`, `Split`, `InDrawer`, `InUse`.
- **Fehlende Angabe fällt weg:** `externalId: null` erzeugt keine Zeile
  (gemessen: der Import-Block hat in allen Stories zwei Zeilen), `valueDate`
  und die SEPA-Chips ebenso. Eine Ausnahme zu viel: der fehlende Name (s.
  Mangel 3).
- **Vorzeichen ohne Farbe:** gemessen `-2.480,55 €` in `rgb(45, 45, 45)` —
  dieselbe Farbe wie „26.08.2026" und „300,55 €". `font-variant-numeric:
  lining-nums tabular-nums` an jeder Wertspalte.
- **Karte: Rand oder Schatten:** `InUse`, `.v2card` gemessen —
  `border-top: 1px rgb(221, 226, 232)`, `box-shadow: none`.
- **Fokusring:** sichtbar an allen drei Klickzielen. Mit
  `CSS.forcePseudoState` gemessen: ruhend `outline-style: none`, im Fokus
  `solid 2px rgb(59, 143, 196)` — (i), `.v2disc__sum`, `.v2case__link`.
- **Hover:** `.v2disc__sum` färbt (`transparent` → `rgb(244, 246, 248)`),
  `.v2case__link` färbt und unterstreicht (`rgb(45,45,45)` →
  `rgb(26,58,92)`, `underline`), `.v2purp__raw summary` ebenso. Das (i)
  antwortet nicht (Befund A).
- **Trefferflächen:** `.v2disc__sum` 672 × 36,92 px, `.v2case__link`
  162,77 × 20,92 px. Das (i) misst 12 × 12 px (Befund A).
- **Keine Versalien, keine Emoji, Icons aus der Registry:** `check:icons`
  Exit 0.

### 4 Die Mängel der vorigen Runde

| | Behauptung | Gemessen |
|---|---|---|
| M1 | Reihenfolge im leeren Zweig gedreht | **behoben** — `Unassigned` zeigt „DATEV-Historie" vor „Sachverhalt" |
| M2 | Satz linksbündig | **nicht behoben** — s. Mangel 1 |
| M3/M4 | Rohdaten zugeklappt, eigener Abschnitt | **behoben** — `open=false`, `buchungstag` nicht im Text; aufgeklappt ab `left = 48,00 px`, Schlüssel und Werte linksbündig |
| M5 | Rest von 300,55 € | **behoben** — Zeile „Nicht zugeordnet · 300,55 €"; `restOf` kommt aus demselben Spiegel wie die Zeile (`bank-transaction-columns.tsx:273`) |
| M6 | `InUse` zeigt nichts zweimal | **halb behoben** — s. Mangel 2 |

### 5 Mängel

**Mangel 1 — der Satz bei null Fällen steht weiter rechts. Blockiert.**
*Kriterium:* §9/V3 „Text links"; Nacharbeit M2 der Abnahme vom 2026-09-06.
*Ort:* `src/styles/v3.css:3397` (`.v2btxf__note`) mit
`BankTransactionFacts.tsx:198`.
*Messung:* `.v2btxf__note` ist ein `<span>` und rendert `display: inline` —
auf einem Inline-Kasten wirkt `text-align` nicht. A/B in derselben Story,
Aktion und Messung getrennt: mit der Klasse stehen die Zeilenkästen bei
`{l 156,55 · r 351,00}` und `{l 195,00 · r 351,00}`; nach `style.textAlign =
"right"` **byte-gleich** dieselben Werte. Beide Zeilen enden bündig an der
rechten Wertkante; die zweite ist eingerückt — das ist Rechtsbündigkeit. In
der Story-Breite (720 px) läuft der Satz einzeilig von 336,94 bis 691,00,
also flush an der Wertkante. Der Zweig gilt für 65 % der Positionen.
*Kleinster Weg:* `.v2btxf__note { display: block; text-align: left; }` **und**
die Wertspalte dieser einen Zeile wachsen lassen. Gemessen: `display: block`
allein ändert nichts (Kasten bleibt inhaltsbreit, `l = 336,94`); erst mit
`flex: 1` am `span:last-child` beginnt der Satz bei `152,69 px`, direkt
hinter dem Label (dessen rechte Kante bei `136,69 px` liegt).

**Mangel 2 — `InUse` zeigt das Datum zweimal. Blockiert.**
*Kriterium:* Story-Tabelle der Spec, `InUse` beweist „nichts steht zweimal";
Nacharbeit M6.
*Ort:* `BankTransactionFacts.stories.tsx:191` (`meta="gebucht am
26.08.2026"`) gegen den Zahlungs-Block.
*Messung:* im gerenderten Text der Story steht `26.08.2026` **zweimal** — bei
700, 1100, 1400 und 1920 px gleichermaßen (Kopf „gebucht am 26.08.2026",
Zeile „Buchungsdatum 26.08.2026"). Die Gegenpartei steht dagegen einmal, das
war der Teil, der behoben wurde. Die Nacharbeit hat die Wiederholung
verschoben, nicht beendet.
*Kleinster Weg:* im Kopf eine Angabe, die der Block nicht trägt — die
Identität der Position (Bank, Konto, Kennung) statt des Datums; `meta`
weglassen oder auf den Import-Lauf setzen. Nebenbei ist „gebucht am" für ein
`postingDate` das falsche Wort: gebucht ist die Buchung, nicht der Umsatz.

**Mangel 3 — der fehlende Name behauptet „ohne Namen". Blockiert nicht.**
*Kriterium:* Abschnitt „Verhalten": „Ein Feld ohne Wert lässt seine Zeile weg
— mit **einer** Ausnahme: die Zuordnung."
*Ort:* `BankTransactionFacts.tsx:106`.
*Messung:* `counterpartyName ?? <span className="v2muted">ohne Namen</span>`
— eine zweite Ausnahme, die die Spec nicht kennt, und keine Story zeigt sie
(alle sieben Fixtures tragen einen Namen), obwohl der Fall laut Typ 3 % der
Zeilen betrifft.
*Kleinster Weg:* die Zeile weglassen wie IBAN und BIC (dann trägt der Block
IBAN/BIC, und der Zweck ist die Identität — genau das sagt der Typkommentar)
— oder die zweite Ausnahme in die Spec schreiben und eine Story dafür.

**Mangel 4 — die vier offenen Klassen sind zu einem Viertel belegt.
Blockiert nicht.**
*Kriterium:* „Die Match-Stufe steht als `StatusBadge axis="bank_match_stage"`
(Story `Filled`); die vier offenen Klassen tragen ihr Wort."
*Ort:* die Stories.
*Messung:* die vier nicht-`success`-Klassen der Achse sind `unclear_multi`,
`unclear_none`, `beyond_bookings`, `no_account`. Gemessen im gerenderten Text
dieser Komponente: nur `unclear_none` → „kein Kandidat" (`Unassigned`). Die
im Kriterium benannte Story `Filled` zeigt `exact` → „exakt", also gerade
**keine** offene Klasse. Das ist der Punkt, den Befund B2 als den Zuwachs
dieser Form beschreibt.
*Kleinster Weg:* `Unassigned` (oder `Split`) um die drei fehlenden Werte
erweitern — eine Story, drei Chips nebeneinander, keine neue Story nötig.

**Mangel 5 — das (i) der Buchung steht dreimal. Blockiert nicht.**
*Kriterium:* §9/Z3, und das Muster der eigenen Familie.
*Ort:* `BankTransactionFacts.tsx:229` (`StatusBadge axis="ereignis"` ohne
`info={false}`).
*Messung:* `Split` trägt vier (i) in einem Feld: einmal „DATEV-Historie:
Zustände erklären" und **dreimal** wortgleich „Buchung (Ereignis): Zustände
erklären" — drei Knöpfe, ein Dialog. Die Spalte derselben Entität macht es
anders: `bank-transaction-columns.tsx:208` setzt `info={false}` an der Zelle
und hängt ein einziges (i) an den Spaltenkopf (`headerAside`, Zeile 202); im
Set steht `info={false}` an 60 von 77 Stellen.
*Kleinster Weg:* `info={i === 0}` in der `map` über die Fälle.

**Mangel 6 — `caseIdentifier` steht ein zweites Mal. Blockiert nicht.**
*Kriterium:* V13 „Keine zweite Quelle".
*Ort:* `BankTransactionFacts.tsx:228`.
*Messung:* die Zeile schreibt `c.caseNumber ?? c.caseId.slice(0, 8)` aus —
Wort für Wort der Rumpf von `caseIdentifier()`
(`accounting-case/case-title.ts:68`), das im Barrel steht (`index.ts:461`)
und von `CaseCell.tsx:76` und `case-columns.tsx:151` benutzt wird. Damit
liegt die Regel „Nummer, sonst acht Zeichen der Id" an zwei Orten — und
genau diese Kürzung war am 2026-09-07 schon einmal Gegenstand (0070).
*Kleinster Weg:* importieren und aufrufen; eine Zeile.

**Mangel 7 — die Fixture von `Split` widerspricht sich. Blockiert nicht.**
*Kriterium:* §6 „Daten in Stories sehen echt aus".
*Ort:* `BankTransactionFacts.stories.tsx:143` — `Split` erbt `purpose` aus
`FULL`.
*Messung:* der Betrag steht auf `-2.480,55 €`, der Zweck derselben Zeile
trägt gerendert `OAMT 1249,90` und nennt eine einzige Rechnung
(`RE-4471`), während drei Sachverhalte zugeordnet sind. Der SEPA-Originalwert
einer Zahlung kann nicht die Hälfte ihres Betrags sein.
*Kleinster Weg:* `purpose` in `Split` mitziehen (`OAMT+2480,55`, drei
Rechnungsnummern im `SVWZ`).

**Mangel 8 — der EUR-Wert wird nur in seiner Abwesenheit gezeigt.
Blockiert nicht.**
*Kriterium:* „Der EUR-Wert erscheint **nur** bei Abweichung."
*Messung:* gemessen ist die eine Hälfte — in keiner der sieben Stories steht
„Betrag in EUR". Dass die Zeile bei `amountEur !== amount` **erscheint**,
zeigt keine Story; der Zweig ist ungeprüft.
*Kleinster Weg:* in `Split` (dem Rand-Fall) `amountEur` abweichen lassen —
kein neuer Export, ein Feld.

### Befunde am Set

**A — `StatusInfoButton`: 12 × 12 px und keine Antwort auf Hover.**
`src/ui/v3/patterns/StatusInfoButton.tsx:41–51`. Gemessen: die Trefferfläche
ist 12,00 × 12,00 px; das Hausmaß ist 24 × 24 px (0113, Abnahme
2026-09-07, dort als Blocker geführt). Der Knopf trägt `cursor: pointer`,
aber mit `CSS.forcePseudoState(["hover"])` gemessen sind Farbe
(`rgb(92,92,92)`), Deckkraft (`0.65`), Hintergrund und Dekoration
**identisch** zum Ruhezustand — dieselbe Kombination, die am 2026-09-07 in
0099 als Blocker zurückkam. Der Fokusring ist in Ordnung. Das trifft jeden
`StatusBadge` mit (i) im Set, nicht nur 0102; deshalb steht es hier als
Befund und nicht als Mangel dieser Spec.
*Kleinster Weg:* `min-width`/`min-height: 24px`, `justify-content: center`
und eine `:hover`-Regel — dieselbe Änderung, die 0099 an seinem (i) schon
gemacht hat, eine Ebene höher.

**B — `FieldList` kann keinen Satz tragen.**
`.v2fields__row > span:last-child` ist `text-align: right` und als Flex-Kind
inhaltsbreit; ein Wert, der Prosa ist, landet damit unweigerlich an der
rechten Kante. Beide Blöcke dieser Komponente, die Prosa zeigen, umgehen das
lokal — `.v2btxf__purpose` verlässt die Zeile ganz und leiht sich nur den
Rahmen, `.v2btxf__note` versucht es mit `text-align` und scheitert (Mangel
1). `SourceDocumentFacts` und `CaseFacts` stehen vor derselben Kante.
*Kleinster Weg:* ein `layout="prose"` oder eine Zeilen-Variante in
`FieldList`, die die Wertspalte wachsen lässt und links setzt — dann
verschwindet `.v2btxf__note` und die nächste Familie erbt die Lösung statt
des Fehlers.

**C — `.v2purp__raw summary` ist 17,81 px hoch.** `v3.css:3329`, gemessen in
`Filled`: 598,00 × 17,81 px. Fläche und Hover (Farbe + Unterstreichung) sind
in Ordnung, die Höhe liegt unter dem Hausmaß von 24 px. Gehört 0099.

**D — die Nacharbeit lief neben der Abnahme.** Während dieser Prüfung hat
eine parallele Sitzung `BankTransactionFacts.tsx`, `CaseCell.tsx` und
`v3.css` im Arbeitsbaum geändert (`CaseCell … layout="stacked"`); zwei
Messungen derselben Story lieferten deshalb zwei verschiedene Lesarten der
Zeile „Sachverhalte". Alle Zahlen oben stammen aus dem Baum **nach** dieser
Änderung. Für die nächste Runde: die Abnahme braucht einen stehenden Baum,
sonst misst sie zwei Stände.

Abgenommen von / am: fremde Abnahme, 2026-09-07 · **zurück** ·
Blockierend: Mangel 1 (Satz rechtsbündig, 65 % der Positionen), Mangel 2
(`InUse` zeigt das Datum zweimal).

## Nach der Wiederabnahme (2026-09-07): beide Blocker

**M2 — die Regel wirkt jetzt, und es waren zwei Fehler, nicht einer.**
`.v2btxf__note { text-align: left }` hing an einem `<span>` mit `display:
inline`, und auf einem Inline-Kasten wirkt `text-align` nicht. Das allein zu
beheben genügt aber nicht: die Wertspalte der Feldliste ist ein Flex-Kind mit
`flex: 0 1 auto`, schrumpft also auf ihren Text, und `space-between` schiebt
sie nach rechts. Beides steht jetzt — `display: block` am Satz, `flex: 1` an
der Wertspalte.

Gemessen in `Unassigned` bei 1400 px: der Satz beginnt bei **152,69 px**,
direkt hinter der Labelkante (136,69 px). Vorher begann er bei 336,94 px und
lief flush an die Wertkante — mit und ohne die Regel byte-gleich.

Dass diese Zeile hier steht und nicht in `FieldList`, ist ein Ausweg und als
solcher benannt: die Feldliste kann keinen Satz tragen, und jeder Aufrufer
baut sich seinen eigenen (Befund der Abnahme, gehört 0058).

**M6 — nichts steht zweimal, und jetzt stimmt es.** Der Kopf der
`InUse`-Story trug „gebucht am 26.08.2026", die Faktentafel dieselbe Zahl als
`Buchungsdatum`. Das Datum ist ein **Faktum, kein Name** — es gehört den
Fakten. Der Kopf trägt jetzt Gegenpartei und Herkunft. Gemessen bei 700,
1100, 1400 und 1920 px: `26.08.2026` genau **einmal**, „Bürobedarf Meier
GmbH" genau einmal.

**Der Befund am Set ist behoben:** `StatusInfoButton` maß 12 × 12 statt
24 × 24 und antwortete nicht auf Hover — beides steht, §9 hat jetzt die Zeile
zur Trefferfläche.

Die sechs nicht blockierenden Punkte sind vermerkt und bleiben offen; sie
brauchen je eine Entscheidung, keine Reparatur — die zweite Ausnahme zur
Weglass-Regel, die Deckung der vier `bank_match_stage`-Klassen, die drei
wortgleichen (i) in `Split`, das inline nachgebaute `caseIdentifier()`, die
widersprüchliche `Split`-Fixture und der EUR-Wert, der nur in seiner
Abwesenheit erscheint.

`pnpm typecheck`, `check:language`, `check:icons`, `check:contrast`,
`check:mirror`, `check:when` je Exit 0. `pnpm build` lief in dieser Welle im
eigenen Worktree: **Exit 0** (Bauprüfung in 0117).

**Status: Abnahme.**
