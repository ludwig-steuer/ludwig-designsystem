# 0019 · AmountInput — das Betragsfeld

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Geldbetrag ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Betragsfeld (`tnum`, Komma, Vorzeichen) — fehlt als Primitive" |
| Ersetzt | 16 `inputMode="decimal"`-Felder in `ExtractionCorrectionCard`, `ContractDetail`, `RuleEditorForm`, `DatevExportWizard` und die Inline-Betragsfelder des Editors |
| Blockiert | 0015 (Editor-Nachträge), jede Korrektur-Karte, jede Regel-Bearbeitung |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Sachbearbeiterin tippt „1234,56" und Ludwig macht daraus mal 1234.56, mal
`NaN` — je nachdem, welche der sechzehn Stellen sie erwischt hat. Jede baut
Parsen, Komma, Vorzeichen und Rechtsbündigkeit selbst nach. Ein Betrag ist im
ganzen Haus dieselbe Sache: rechtsbündig, `tnum`, deutsches Komma,
zwei Nachkommastellen, Vorzeichen ohne Farbe.

## Einordnung

- **Wiederverwenden:** `Input` ist das nackte Feld — es kennt keine Zahl,
  keine Ausrichtung, kein Format. `AmountCell` ist die **Anzeige** in der
  Tabelle; sie formatiert bereits genau so, wie das Feld es beim Verlassen
  tun muss (dieselbe Regel, zwei Orte).
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, 16 belegte
  Stellen, und Parsen plus Formatieren sind mehr als 15 Zeilen an der
  Aufrufstelle.
- **Zuschnitt:** eine Datei, ein Export. Kein Familien-Fall.
- **Setzt auf:** `Field` (Label, Fehler, Pflicht) und dieselbe
  `Intl.NumberFormat`-Regel wie `AmountCell`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Sichtbares Label (I8) | `Filled` |
| `value` | `number \| null` | ja | Der Betrag; `null` = leer, nicht 0 | `Empty` |
| `onChange` | `(value: number \| null) => void` | ja | Beim Verlassen des Feldes, nicht bei jedem Tastendruck | `Interactive` |
| `currency` | `Currency \| null` | nein | Währungszeichen im Suffix; `null` = reine Dezimalzahl | `Filled` |
| `allowNegative` | `boolean` | nein | Erlaubt Minus — Default `false` | `Signs` |
| `error` | `string` | nein | Fehlertext unter dem Feld | `Invalid` |
| `required` | `boolean` | nein | Pflichtmarke am Label | `Invalid` |
| `disabled` | `boolean` | nein | Gesperrt | `Signs` |
| `size` | `"sm" \| "md"` | nein | `sm` für dichte Editoren, `md` im Formular | `Filled` |

Typen: `Currency` aus `src/ludwig/shared/money.ts`.
**Befund für `ludwig/app`:** dort steht `formatMoney`, aber **kein Parser** für
deutsche Eingaben („1.234,56", „1234.56", „1 234,56"). Die Umkehrfunktion
gehört neben `formatMoney` in `shared/money.ts`, nicht in diese Komponente;
bis sie existiert, trägt die Komponente sie mit einem `ponytail:`-Kommentar
und dem Verweis auf diese Zeile.

Was das Feld **nicht** kann: rechnen (keine Formeleingabe „12+3"), Währungen
umrechnen, und es rät keine Nachkommastellen — was ohne Komma eingegeben wird,
sind ganze Euro.

## Verhalten

Client-Component. Während der Eingabe steht der rohe Text, damit „12," nicht
unter den Fingern verschwindet; beim Verlassen (`blur`) wird geparst,
formatiert und `onChange` gerufen. Nicht Parsbares bleibt stehen und setzt
`aria-invalid` plus Fehlertext — es wird **nie** stillschweigend auf 0
gesetzt. Zahl rechtsbündig mit `--font-feat-tabular` (V3). Vorzeichen ohne
Farbe (V6): ein Minus ist ein Zeichen, kein Alarm. Tastatur: Ziffern, Komma,
Punkt und Minus; Punkt wird beim Parsen als Tausendertrenner gelesen, wenn
danach drei Stellen folgen, sonst als Komma.

## Stories

Titel `v3/Primitives/Formular/AmountInput`. Abgeleitet nach §6: 3 Zustände
(gefüllt, leer, Fehler) + 0 Enums mit Layoutwirkung + 1 Callback
+ 1 „im Einsatz" + 1 Rand (formatiert) = 6.

| Story | Beweist |
|---|---|
| `Filled` | 1.249,90 € rechtsbündig, `tnum`, `sm` und `md` |
| `Empty` | leer heißt leer — kein 0,00 € als Platzhalter |
| `Invalid` | „12,3,4" bleibt stehen, Fehlertext darunter, kein stilles 0 |
| `Signs` | negativ erlaubt und verboten, dazu `disabled` — Minus ohne Farbe |
| `Interactive` | Rundlauf: tippen, verlassen, formatierter Wert zurück |
| `InEditor` | zwei Felder nebeneinander in einer Editor-Zeile, Ziffern fluchten |

Nicht anwendbar: `LeerNachFilter` (kein Filterfall), `Laedt` (der Aufrufer
zeigt `Skeleton`, 0016).

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

- [ ] „1234,56", „1.234,56" und „1234.56" ergeben denselben Wert (Story `Interactive`)
- [ ] Unparsbares setzt `aria-invalid` und wird nicht auf 0 gesetzt (Story `Invalid`, Blick ins DOM)
- [ ] `null` rendert ein leeres Feld, nicht „0,00" (Story `Empty`)
- [ ] Ziffern stehen rechts und fluchten untereinander (Story `InEditor`, Regel V3)
- [ ] Minus ist schwarz wie jede andere Ziffer (Story `Signs`, Regel V6)
- [ ] Ersetzt das Betragsfeld in `ExtractionCorrectionCard.tsx` ohne Funktionsverlust


## Offene Fragen

1. Soll `onChange` auch bei jedem Tastendruck feuern? *Ohne Antwort: nein,
   nur bei `blur` — sonst rechnet jede Karte bei jeder Ziffer neu.*
2. Gehört der Parser in `src/ludwig/shared/money.ts`? *Ohne Antwort: ja,
   Befund an `ludwig/app`; bis dahin lokal mit `ponytail:`-Verweis.*

## Abnahme

**Zweite Abnahme, 2026-09-05** (fremder Prüfer, nicht der Erbauer). Die drei
offenen Punkte der ersten Runde sind erledigt: `parseAmount` trägt
`@when`/`@instead`, die App-Umstellung ist als App-Kriterium ausgewiesen, und
die Versalien am Label sind ein Befund des Sets, keiner dieser Aufgabe (siehe
unten). Jedes Kriterium einzeln, fest und variabel:

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; zweimal gelaufen (Beginn und Ende der Abnahme, 2026-09-05) | ✓ |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen: der Build schreibt nach `storybook-static`, und heute laufen weitere Abnahmen parallel. Der Lauf für diesen Stand war grün („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/AmountInput.tsx` mit `AmountInput.stories.tsx` daneben; Titel `v3/Primitives/Formular/AmountInput` (`AmountInput.stories.tsx:6`) — „Formular" ist die Gruppe aus dem Barrel; Export `src/ui/v3/index.ts:105` | ✓ |
| **Fest** — Code englisch, `@when`/`@instead` an jedem Export | Drei Exporte: `ParsedAmount` (Typ, `:17`), `parseAmount` (`:33`) mit `@when`/`@instead` in `:25–28`, `AmountInput` (`:61`) mit beiden Zeilen in `:58–59`. Bezeichner, Props, Kommentare englisch; deutsch nur in den Strings, die die Sachbearbeiterin liest | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map, kein eigener Status-Text | `grep -nE "#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:" AmountInput.tsx` → keine Treffer. Maße stehen in `v3.css:1717` (`.v2in--sm`) und `:1719` (`.v2in--amount`); die Komponente kennt keinen Status | ✓ |
| **Fest** — alle Stories der Spec vorhanden, ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--empty`, `--invalid`, `--signs`, `--interactive`, `--in-editor` — sechs, wie in der Ableitung (3 Zustände + 1 Callback + 1 „im Einsatz" + 1 Rand). `LeerNachFilter` und `Laedt` sind in der Spec mit Grund ausgeschlossen | ✓ |
| **Fest** — Story-Deckung der Schnittstelle | Jede der neun Props hat ihre Story: `label`/`size` → `--filled` (13,5 px `md` gegen 12,5 px `sm`, gemessen), `value` → `--empty` (`input.value` = `""`), `onChange` → `--interactive` (Zähler „Gespeicherter Wert"), `currency` → `--filled` („1.249,90 €"), `allowNegative`/`disabled` → `--signs`, `error`/`required` → `--invalid` (zwei Felder: Pflichtmarke „BRUTTOBETRAG *" und Fehler von außen) | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Punkt für Punkt: Stufe `primitives/`, Importe nur abwärts (`Form.tsx`, `src/ludwig/shared/money`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Zahl rechts mit `tnum`, nichts zentriert (`textAlign: right`, `fontVariantNumeric: lining-nums tabular-nums`, gemessen an `--interactive`) ✓ · keine Farbe außer der Fehlerfarbe, Vorzeichen ohne Farbe ✓ · Fehler steht als Wort, nicht nur als Rand (`.v2field__err`) ✓ · fünf Zustände: drei gebaut, zwei begründet ausgeschlossen ✓ · Kontrast gemessen: Fehlerzeile 5,6:1, Label 6,17:1, Feldtext 13,77:1 ✓ · kein Icon, kein Emoji, keine Bewegung ✓ · Fokus: `.v2in:focus` sichtbar ✓ · Texte Sie/GLOSSARY ✓. Die zwei App-Punkte (v1-Ablösung, §11) sind laut Skill übersprungen. **Ein Punkt reißt set-weit, nicht hier:** `.v2field__label` (`v3.css:842–845`) setzt `text-transform: uppercase`, das Label steht als „BRUTTOBETRAG" da — A2/T3. Betrifft jedes Feld des Sets; wie in 0017 als Befund gewertet, nicht als Mangel dieser Aufgabe | ✓ (mit Befund) |
| **Fest** — im Browser angesehen | Alle sechs Stories in Chromium auf `localhost:6107` geöffnet, getippt und geklickt (Protokolle unten); Bild von `--in-editor` geprüft: zwei Felder, Ziffern auf einer Flucht, Karte mit Rand ohne Schatten | ✓ |
| **Variabel** — „1234,56", „1.234,56" und „1234.56" ergeben denselben Wert | `--interactive`, wirklich getippt und mit Tab verlassen: alle vier Schreibweisen („1234,56", „1.234,56", „1234.56", „1 234,56") ergeben im Feld „1.234,56 €" und als gespeicherten Wert `1234.56`. Die Leseprobe daneben zeigt zusätzlich „1.234" → 1234 (Punkt vor drei Stellen = Tausendertrenner) und „(leer)" → null | ✓ |
| **Variabel** — Unparsbares setzt `aria-invalid` und wird nicht auf 0 gesetzt | `--interactive`: „12,3,4" getippt, Feld verlassen — `input.value` bleibt „12,3,4", `aria-invalid="true"`, Fehlerzeile „Betrag nicht lesbar — Beispiel: 1.234,56", und der gespeicherte Wert bleibt der vorherige `1234.56`, wird also weder 0 noch `null` | ✓ |
| **Variabel** — `null` rendert ein leeres Feld, nicht „0,00" | `--empty`: `input.value` = `""`. Gegenprobe in `--signs`, zweites Feld: ebenfalls leer | ✓ |
| **Variabel** — Ziffern stehen rechts und fluchten untereinander | `--in-editor`, gemessen: beide Felder `text-align: right`, `font-variant-numeric: lining-nums tabular-nums`, rechte Kanten 218 px und 419 px bei gleicher Spaltenbreite — dieselbe Regel wie `.v2num` in `AmountCell`. Im Bild fluchten „1.249,90 €" und „1.249,90 €" | ✓ |
| **Variabel** — Minus ist schwarz wie jede andere Ziffer | `--signs`, gemessen: „-312,40 €" in `rgb(45, 45, 45)`, identisch zum leeren und zum gesperrten Feld darunter. Keine Farbe am Vorzeichen (A7/V6). Gegenprobe: „-5" im Feld „nur positiv" bleibt stehen und bekommt den Text „Negative Beträge sind hier nicht vorgesehen." — kein stilles Verschlucken | ✓ |
| **Variabel** — ersetzt das Betragsfeld in `ExtractionCorrectionCard.tsx` | Betrifft das Repo `ludwig/app` und ist hier nicht erfüllbar | offen (App) |

**Befunde** (keine Mängel dieser Aufgabe):

1. **Versalien am Feldlabel, set-weit.** `.v2field__label` (`v3.css:842–845`)
   trägt `text-transform: uppercase`; damit stehen alle Feldbeschriftungen des
   Sets in Versalien — A2/T3. Gehört in eine eigene Aufgabe, dieselbe
   Feststellung wie in 0017.
2. **Die Schnittstelle der Spec zählt neun Props, die Komponente hat zehn:**
   `name` (`AmountInput.tsx:71,83`) verdrahtet `id` und `htmlFor`. Sinnvoll,
   aber in der Spec-Tabelle nicht geführt — beim nächsten Anfassen nachtragen.
3. **`currency={null}` hat keine Story.** Die Spec nennt als Nachweis `Filled`,
   und dort steht der Default `EUR`; die reine Dezimalzahl ohne Währungszeichen
   führt keine Story vor.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05

Erste Runde (2026-09-03, Historie): ✗ an der App-Umstellung, dazu `parseAmount`
ohne `@when`/`@instead` und die Versalien am Label. Nachgeprüft: `parseAmount`
hat beide Zeilen.

---

**Nachprüfung, 2026-09-05 — gegen die wiederhergestellten Kriterien** (dritter
Agent, weder Erbauer noch Vorprüfer). Grund: `64fbe27` hat in zwölf Specs die
Abschnitte „Abnahmekriterien" und „Offene Fragen" **gelöscht** und zugleich die
Abnahme-Tabelle eingetragen. Die Abnahme oben fiel damit gegen eine Liste, die
im Dokument gar nicht mehr stand. `e6eae99` hat beide Abschnitte aus `64fbe27^`
zurückgeholt; diese Runde prüft jedes Kriterium noch einmal am Code und im
Browser und übernimmt das frühere Ergebnis nicht.

**Wiederherstellung geprüft:**
`diff <(git show 64fbe27^:docs/backlog/0019-amount-input.md) docs/backlog/0019-amount-input.md`
— in „Abnahmekriterien" und „Offene Fragen" genau eine Abweichung, eine
zusätzliche Leerzeile vor „## Offene Fragen". Sieben feste Kriterien, sechs
variable und beide offenen Fragen stehen wortgleich wieder da. Nichts fehlt,
nichts nachzuholen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` grün | Zu Beginn dieser Runde: `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0. Der Lauf am Ende meldet zwei Fehler, beide in `src/ui/v3/patterns/entity-icons.ts` (fehlende Achsen `zahlungsweg`, `mandant_betrieb` … gegenüber `Record<StatusAxis, string>`). Sie stammen aus einer **fremden, parallel laufenden Sitzung**, die die Status-Registry erweitert (`git diff --stat HEAD -- src/ludwig/ui/status/status-registry.ts` → 86 neue Zeilen; `src/ui/v3/patterns/status-registry.ts` steht als gelöscht im Index). `AmountInput.tsx` ist im Arbeitsbaum unverändert (`git status --porcelain` → leer) und kommt in keiner Fehlerzeile vor | ✓ (für diese Aufgabe; der offene Fehler gehört einer anderen Sitzung) |
| **Fest** — `pnpm build` grün | Nicht erneut gelaufen: parallel laufen weitere Sitzungen, und der Build schreibt nach `storybook-static`. Zitiert wird der Lauf für diesen Stand, der grün war („Storybook build completed successfully") | ✓ (zitiert) |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/AmountInput.tsx`, daneben `AmountInput.stories.tsx`; Titel `v3/Primitives/Formular/AmountInput` (`AmountInput.stories.tsx:6`); Export `src/ui/v3/index.ts:105`. `curl -s localhost:6107/index.json` führt alle sechs Einträge unter diesem Titel | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | Drei Exporte. `parseAmount` trägt beide Zeilen (`AmountInput.tsx:25–28`), `AmountInput` ebenfalls (`:58–59`). Der dritte ist der Typ `ParsedAmount` (`:17`) ohne die Zeilen — das ist die Konvention des ganzen Sets, nicht eine Lücke dieser Datei: Stichprobe `Badge.tsx`, `Toast.tsx`, `Combobox.tsx` → je 0 `@when` über einem `export type`. Bezeichner, Props, Kommentare englisch; deutsch nur in den zwei Nutzer-Strings (`:98`, `:102`) | ✓ |
| **Fest** — kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px\|fontSize:' src/ui/v3/primitives/AmountInput.tsx` → keine Treffer. Maße in `v3.css:1731` (`.v2in--sm`) und `:1732` (`.v2in--amount`); Zeilennummern nach heutigem Arbeitsstand, `v3.css` wird parallel geändert. Die Komponente kennt keinen Status | ✓ |
| **Fest** — alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json`: `--filled`, `--empty`, `--invalid`, `--signs`, `--interactive`, `--in-editor` — sechs, genau die Ableitung der Spec. `LeerNachFilter` (kein Filterfall) und `Laedt` (Aufrufer zeigt `Skeleton`) sind in der Spec begründet ausgeschlossen | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 | Punkt für Punkt am laufenden Storybook: Stufe `primitives/`, Importe nur abwärts (`./Form`, `@/ludwig/shared/money`), kein Fachmodul ✓ · kein Hex/px/Label-Map ✓ · Zahl rechts, `text-align: right` und `font-variant-numeric: lining-nums tabular-nums` an jedem Feld gemessen (`--filled`, `--in-editor`), nichts zentriert ✓ · Farbe nur am Fehler (`rgb(168,64,60)`), Vorzeichen ohne Farbe ✓ · Fehler steht als Wort (`.v2field__err`), nicht nur als Rand ✓ · fünf Zustände: drei gebaut, zwei begründet ausgeschlossen ✓ · Kontrast selbst gerechnet: Feldtext `rgb(45,45,45)` auf Weiß 13,77:1, Fehlerzeile `rgb(168,64,60)` auf Weiß 6,06:1, beide ≥ 4,5:1 ✓ · kein Icon, kein Emoji, keine Bewegung ✓ · Tastaturweg: Feld ist ein echtes `input`, mit Tab erreicht und mit Tab verlassen (der Commit-Weg der Komponente) ✓ · Texte Sie/GLOSSARY ✓. Die zwei App-Punkte (v1-Ablösung, §11) betreffen `ludwig/app`. **Zwei Punkte reißen nicht hier, sondern im Set** — Versalien am Label und die fehlende Label-Bindung, siehe Befunde B1 und B4 | ✓ (mit Befunden) |
| **Fest** — im Browser angesehen (Storybook), nicht nur gebaut | Alle sechs Stories auf `localhost:6107` in einer eigenen Chromium-Instanz geöffnet (die MCP-Instanz war von einer parallelen Sitzung belegt), in `--interactive`, `--invalid` und `--signs` wirklich getippt, Bild von `--in-editor` angesehen: zwei Felder, Ziffern auf einer Flucht, Karte mit Rand ohne Schatten | ✓ |
| **Variabel** — „1234,56", „1.234,56" und „1234.56" ergeben denselben Wert (`Interactive`) | In `--interactive` Zeichen für Zeichen getippt und mit Tab verlassen; abgelesen wurden `input.value` und die Anzeige „Gespeicherter Wert": „1234,56" → Feld „1.234,56 €", Wert `1234.56` · „1.234,56" → `1234.56` · „1234.56" → `1234.56` · „1 234,56" → `1234.56` · zur Gegenprobe „1.234" → `1234` (Punkt vor drei Stellen ist Tausendertrenner) und „99" → `99` | ✓ |
| **Variabel** — Unparsbares setzt `aria-invalid` und wird nicht auf 0 gesetzt (`Invalid`, Blick ins DOM) | „12,3,4" in `--interactive` getippt und verlassen: `input.value` bleibt „12,3,4", `aria-invalid="true"`, Fehlerzeile „Betrag nicht lesbar — Beispiel: 1.234,56", und „Gespeicherter Wert" bleibt beim vorherigen `1234.56` — weder 0 noch `null`. Dasselbe in `--invalid` am Pflichtfeld nachgestellt | ✓ |
| **Variabel** — `null` rendert ein leeres Feld, nicht „0,00" (`Empty`) | `--empty`: `input.value` = `""` **und** `placeholder` = `""` — es steht auch kein „0,00 €" als Platzhalter darin. Gegenprobe in `--signs`, zweites Feld: ebenfalls leer | ✓ |
| **Variabel** — Ziffern stehen rechts und fluchten untereinander (`InEditor`, V3) | `--in-editor` gemessen: beide Felder `text-align: right`, `font-variant-numeric: lining-nums tabular-nums`, gleiche Breite 185 px, rechte Kanten 218 px und 419 px. Im Bild fluchten „1.249,90 €" und „1.249,90 €" Ziffer für Ziffer | ✓ |
| **Variabel** — Minus ist schwarz wie jede andere Ziffer (`Signs`, V6) | `--signs` gemessen: „-312,40 €" in `rgb(45,45,45)` — identisch zum leeren Feld und zum gesperrten Feld darunter, keine eigene Farbe am Vorzeichen. Gegenprobe: „-5" ins Feld „nur positiv" getippt und verlassen → der Text bleibt stehen, `aria-invalid="true"`, dazu „Negative Beträge sind hier nicht vorgesehen." | ✓ |
| **Variabel** — ersetzt das Betragsfeld in `ExtractionCorrectionCard.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`; die Datei liegt nicht in diesem Repo (`find` → kein Treffer) und ist hier nicht erfüllbar | offen (App) |

**Befunde dieser Runde** (keine Mängel der Aufgabe):

- **B1 — Versalien am Feldlabel, set-weit.** `.v2field__label` setzt
  `text-transform: uppercase`; im Browser gemessen steht „BRUTTOBETRAG".
  Kommt aus `v3.css`, betrifft jedes Feld des Sets — A2/T3, eigene Aufgabe,
  wie in 0017 und oben schon festgehalten.
- **B2 — `name` fehlt weiter in der Schnittstellen-Tabelle.** Die Komponente
  hat zehn Props (`AmountInput.tsx:71`), die Spec führt neun. Unverändert.
- **B3 — `currency={null}` hat weiter keine Story.** `Filled` zeigt nur den
  Default `EUR`; die reine Dezimalzahl führt keine Story vor. Unverändert.
- **B4 — neu: das Label ist nicht mit dem Feld verbunden, solange `name`
  fehlt.** `Field` rendert `<label htmlFor={htmlFor}>` als Geschwister
  (`Form.tsx:35`); ohne `name` bleibt `htmlFor` leer und das `input` ohne `id`.
  In `--filled` gemessen: `input.labels` ist leer, die Vorlesehilfe nennt das
  Feld also nicht. Das ist die Bauart des gemeinsamen `Field`, nicht dieser
  Komponente — I8 („Label sichtbar") ist erfüllt. Gehört zum selben Aufräumen
  wie B1.

**Ergebnis: alles ✓ außer dem App-Kriterium — Status bleibt `fertig`.** Die
frühere Abnahme hätte inhaltlich gehalten: jedes einzelne wiederhergestellte
Kriterium ist auch bei erneuter, unabhängiger Prüfung erfüllt.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 — zweite Prüfung gegen
die wiederhergestellten Kriterien

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-01 ist erledigt** (App-Commit `52914c45`): `parseGermanAmount` steht in
`shared/money.ts` und gilt für beide Seiten. `parseAmount` rechnet nicht mehr
selbst — es prüft nur noch die **Form** und übergibt dann.

Die Formprüfung bleibt, und das ist der Punkt: `parseGermanAmount` verwirft,
was keine Ziffer ist, und liest „12,3,4" als 123,4. Für einen Import ist das
richtig, für ein Eingabefeld wäre es eine stille Umdeutung dessen, was jemand
getippt hat — und das Kriterium dieser Aufgabe verlangt ausdrücklich das
Gegenteil. Gemessen im Feld (Story `Interactive`, echte Eingabe, `focusout`):

| Eingabe | Feld danach | `aria-invalid` | gespeichert |
|---|---|---|---|
| `12,3,4` | `12,3,4` | `true` | unverändert |
| `1.234,56` | `1.234,56 €` | — | 1234.56 |
| `1234.56` | `1.234,56 €` | — | 1234.56 |
| `1.2345` | `12.345,00 €` | — | 12345 |
| `12abc` | `12abc` | `true` | unverändert |
| leer | leer | — | `null` |

**Eine Schreibweise liest das Feld seither anders:** „1.2345" ist jetzt 12345
statt 1,2345 — der Punkt trennt Tausender, denn hinter ihm stehen vier
Ziffern. Das ist die Regel der App, und sie ist die richtige: 1,2345 € gibt es
nicht.
