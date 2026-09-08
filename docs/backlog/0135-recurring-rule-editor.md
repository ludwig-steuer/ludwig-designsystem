# 0135 · `RecurringRuleEditor`

| | |
|---|---|
| Status | **Abnahme** |
| Stufe | `entities/recurring-rule/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Buchungsweise, Personenkonto, Gegenkonto, BU-Schlüssel, Sollstellung |
| Quelle | Entitätsprofil `docs/entitaeten/recurring-rule.md` (Status **geprüft**, 2026-09-08), Abschnitte „Datenpunkte" (die Punkte mit änderbar = **Nutzer**), „Formen" (Zeile `RecurringRuleEditor`), „Zuschnitt" (Marke **jetzt**) · Owner-Entscheid vom 2026-09-08 zum Leerfall |
| Domänen-Stand | gelesen gegen **`origin/staging`** in `ludwig/app` (2026-09-08), nicht gegen den eingefrorenen Spiegel `src/ludwig/`. **Erledigt, deshalb hier nicht mehr als offen geführt:** ~~L-253~~ (`2c0c888f` — `matchTransaction()` und `hasAnyCriterion()` lesen eine gemeinsame Liste `MATCH_CRITERIA`) · ~~L-254~~ (`9a3ce2db` — `RULE_PRIORITY_DEFAULT = 100` für alle drei Schreiber) · ~~L-244~~ (`b7544542` — das Präfix heißt jetzt `datev-wk:`, die Warnung kann erscheinen) · **L-243 b** (`5e48d892` — die lokalen Maps in `wiederkehrende.ts` sind weg). **Offen und tragend für diese Spec:** L-240, L-241, L-242, **L-243 a** (`Schritt5.tsx:100` gibt den Rhythmus weiter roh aus), L-245, L-249 und die drei neuen L-255 bis L-257. **Wer baut, holt vorher den Spiegel nach** (`scripts/sync-ludwig.sh`) — die eingefrorene Fassung kennt `MATCH_CRITERIA` und `RULE_PRIORITY_DEFAULT` noch nicht |
| Ersetzt | `modules/recurring-rules/ui/RuleEditorForm.tsx` (464 Z.) **und** `modules/recurring-rules/ui/MatchingNoteForm.tsx` (68 Z., ein Feld ohne jeden Kontext) |
| Blockiert | nichts im Set — er ist die letzte Form der Familie |
| Setzt voraus | **0134** (`RecurringRuleFacts`) als Vorschau („passt die Regel so?") |
| Spec von / am | Claude, 2026-09-08 (Skill `spec-schreiben`) |

## Ziel

**Der Leerfall ist der Normalfall.** 75 von 104 Dauersachverhalten — **72 %** —
tragen heute keine Wiederkehr-Regel. „Noch keine Regel" ist damit nicht der
Rand, den man wegdrückt, sondern der häufigste Zustand der Entität. Der Editor
ist deshalb in erster Linie das Werkzeug, mit dem aus **nichts** eine Regel
wird, und erst in zweiter Linie das, mit dem eine bestehende geändert wird.

Wer eine Regel anlegt, fragt sich zwei Dinge, und beide beantwortet heute
nichts auf dem Bildschirm zusammen: **woran erkennt Ludwig die Zahlung** und
**was passiert dann?** Dazu die Kontrolle, ob beides stimmt: die
**Live-Trefferzahl** — „passt die Regel so?".

Heute steht dafür ein Formular mit 16 beschrifteten Feldern in 17 Eingaben
(`RuleEditorForm`, 464 Z.), und die Zuordnungs-Notiz in einem **zweiten**
Formular auf einem **anderen** Reiter (`MatchingNoteForm`, 68 Z., ein Feld,
kein Abzeichen, kein Verweis auf die Regel, zu der es gehört).

## Einordnung

- **Wiederverwenden:** kein `@when` deckt das ab. `InlineEdit` (`@when A single
  value that is read far more often than it is changed`) trifft ausdrücklich
  **nicht**: eine Regel wird von null gebaut, und ihre Kriterien müssen
  **zusammen** geprüft werden — die Trefferzahl gilt für den ganzen Satz, nicht
  für ein Feld. `ClarificationEditor` ist die Bauform, an der sich dieser
  Editor orientiert (unkontrolliert, `onSubmit`, `pending`, `error`), aber
  eine andere Entität.
- **Neu, weil:** §3 **Nr. 5** — die Entität hat 16 Datenpunkte mit
  `änderbar = Nutzer`, und keine vorhandene Form schreibt sie.
- **Zuschnitt:** **eine** Datei `RecurringRuleEditor.tsx`. §4 sagt „zerlegen"
  ab ~10 Props oder ~250 Zeilen — und im selben Atemzug „zusammenlassen, wenn
  die Teile denselben Zustand teilen und nie getrennt auftreten". Genau das ist
  hier der Fall: Kriterien, Buchungsvorlage, Erwartung und Notiz sind **ein**
  Entwurf, der in **einem** Zug gespeichert wird, und die Trefferzahl hängt an
  den Kriterien, während die Vorschau an der Vorlage hängt. Eine Zerlegung
  ergäbe nur Durchreich-Props und einen Entwurf, der an zwei Stellen lebt.
  Dass die App ihn heute in zwei Formulare auf zwei Reitern geteilt hat, ist
  der Mangel — die Notiz steht dort ohne jeden Kontext.
- **Setzt auf:** `Field`, `Input`, `TextArea`, `Select`, `Checkbox` (aus
  `primitives/Form.tsx`), `RadioGroup`, `AmountInput`, `AccountField`,
  `TaxKeyField`, `Disclosure`, `Callout`, `ActionBar`, `ActionButton`,
  `RecurringRuleFacts` (0134, als Vorschau). Aus dem Spiegel: `RecurringRule`,
  `RuleCriteria`, `RULE_INTERVAL_LABEL`, `isValidRegex()`.

## Was der Editor ändert

Die 16 Datenpunkte mit `änderbar = Nutzer` — sie stehen für rund **22 Spalten**
(Prüfpunkt **P10**: Ränge 4, 17, 19 und 25 bündeln je zwei, Rang 18 drei). Wer
„16 Felder" liest und 16 Eingaben baut, baut den Editor zu klein.

Gegliedert wie die Fakten (0134), damit Lesen und Schreiben dieselbe Ordnung
haben:

| Abschnitt | Felder (Rang) | Sichtbar |
|---|---|---|
| **Auslöser** | Gegenpartei-Name (1) · IBAN (19) · Richtung (7) · Betrag (4) · Toleranz absolut und in Prozent (17) | immer |
| **Wirkung** | Buchungsweise (2) · Personenkonto (11) · Gegenkonto (10) · Vorlagenbetrag (4) · Buchungstext (16) | immer; **Personenkonto nur bei `accrue_then_settle`** |
| **Erwartung** | Rhythmus (5) · Zahltag (14) | immer |
| **Weitere Kriterien** (`Disclosure`) | Zweck-Regex (19) · Vertragsnummer (18) · Belegtext-Regex (18) | gefaltet |
| **Buchung im Detail** (`Disclosure`) | Steuerschlüssel und USt-Satz (25) · Zahlungskonto (24) · Split-Vorlage (21, **nur lesend**) | gefaltet |
| **Notiz** (`Disclosure`) | Zuordnungs-Notiz (20) | gefaltet |
| Fuß | „Regel aktiv" (3) · Trefferzahl · Speichern/Abbrechen | immer |

**Warum gefaltet:** der Leerfall ist der Normalfall. Wer bei null anfängt,
sieht zwölf Felder statt zweiundzwanzig — die drei gefalteten Abschnitte
tragen zusammen sechs Spalten, die im Bestand zu **0 %** gefüllt sind
(Zweck-Regex, Vertragsnummer, Belegtext-Regex, Notiz, Zahlungskonto,
Split-Vorlage). Ein Abschnitt, in dem etwas steht, ist **offen**, nie
gefaltet: eine Klappe darf nichts verstecken, was jemand eingetragen hat.

**Fünf Festlegungen, die keine Spec neu verhandelt:**

1. **Konten sind Nummern.** `AccountField` gibt eine **Nummer** zurück, der
   Entwurf trägt `template.counterAccountNumber` und `personalAccountNumber`
   als String. Der Editor kennt keine Konto-Id und kein Wirtschaftsjahr — die
   Regel ist jahresfrei, die Auflösung macht, wer bucht.
2. **Der Editor rechnet den Betrag nicht.** Vorlagenbetrag
   (`template.amount`) und Match-Betrag (`matchAmount`) sind **zwei Felder**,
   weil sie zwei Dinge sind (F40 Teil C): das eine bucht, das andere trifft.
   Was die Sollstellung nähme, zeigt die Vorschau über `accrualAmount()`; die
   geltende Toleranz zeigt sie über `effectiveAmountTolerance()` („beide
   gesetzt = die großzügigere gewinnt").
3. **`booking_mode` ist nicht binär.** Die Auswahl hat **drei** Werte mit den
   Beschreibungen der Registry-Achse `regel_modus`; bei **`match_only`**
   entsteht gar kein Vorschlag, und der Abschnitt „Wirkung" sagt das in einem
   Satz, statt leere Vorlagenfelder anzubieten.
4. **Eine Regel ohne Kriterium ist wirkungslos, nicht ungültig.** Sie darf
   gespeichert werden — die Datenbank erlaubt sie, und ein halbfertiger
   Entwurf ist ein legitimer Zwischenstand. Der Editor **warnt** mit dem Satz
   der Ableitung, er blockiert nicht. Den Satz liefert der Aufrufer
   (`describeRecurringRule()`), der Editor leitet ihn **nicht** ab: eine Form,
   die eine Ableitung der Domäne nachbaut, ist die zweite Wahrheit — daran ist
   die App gerade hängengeblieben (~~L-253~~, behoben mit `2c0c888f`: zwei
   Aufzählungen derselben Kriterien, heute **eine** Liste `MATCH_CRITERIA`).
5. **Die Vorschau ist ein Buchungssatz.** Sie kommt aus 0134 über
   `renderPreview` und zeigt die Vorschau mit `JournalEntryCard` — keine
   zweite Tabelle im Editor.

**Was der Editor bewusst nicht ändert** (13 Spalten, wie heute): `priority`
(Owner-Entscheid — weder zeigen noch schreiben. ~~L-254~~ ist drüben behoben:
seit `9a3ce2db` setzen alle drei Schreiber `RULE_PRIORITY_DEFAULT = 100`, das
Formular schreibt keine `0` mehr. Damit ist der Wert überall gleich; wer ihn
setzen können muss, braucht erst den Ort, an dem zwei Regeln eines Falls
nebeneinander stehen — **L-245**, offen) · `validFrom`/`validUntil` ·
`datevDocumentNumber` · `documentNumberStrategy` · `profileSource` ·
`matchesDocuments` (abgeleitet aus der Belegseite, `rule-writes.ts:190`) ·
`importReference` · `agentRunId` · `exportBatchId` · die DMS-Beleglinks ·
`template.lines` (lesend, siehe unten).

**Die Split-Vorlage wird durchgereicht, nicht verworfen.** Sie ist über die
Oberfläche nicht änderbar; ein Editor, der sie beim Speichern verlöre, wäre
Datenverlust. Sie steht lesend im gefalteten Abschnitt und geht unverändert in
`onSubmit`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `defaultValue` | `RecurringRuleDraft` | nein | **fehlt = neue Regel** — der Normalfall (72 %). Gesetzt = ändern. Der Aufrufer füllt sie beim Lernen aus einer Zahlung mit `prefillFromTransaction(txn)` | `New`, `Filled` |
| `onSubmit` | `(draft: RecurringRuleDraft) => Promise<void>` | ja | speichert; der Editor kennt keine Route und kein Modul | `Interactive` |
| `onCancel` | `() => void` | nein | ohne sie gibt es keinen Abbrechen-Knopf und `Esc` tut nichts | `InUse` |
| `onCriteriaChange` | `(criteria: RuleCriteria) => void` | nein | meldet jede Änderung an den Kriterien, damit der Aufrufer die Trefferzahl neu rechnet. **Der Editor rechnet sie nicht** — `matchTransaction()` ist eine Frage an die Bankzeilen, nicht an das Formular | `Interactive` |
| `matchCount` | `{ matched: number; scanned: number } \| null` | nein | die Live-Trefferzahl als Kontrolle. `null` = noch nicht gerechnet; ohne die Prop steht dort nichts statt einer Null | `Interactive` |
| `accounts` | `{ candidates: Partial<Record<AccountGroup, AccountCandidate[]>>; onSearch?: (q: string) => Promise<AccountCandidate[]>; onOpenLedger?: (n: string) => void }` | ja | Kandidaten und Suche für **beide** Kontofelder — Gegenkonto und Personenkonto lesen denselben Kontenrahmen | `Filled` |
| `paymentAccounts` | `readonly { id: string; label: string }[]` | nein | Auswahl „Zahlungskonto". Leer = keine Auswahl; **kein Wert heißt „Konto der jeweiligen Transaktion"**, nicht „unbekannt" (Spaltenkommentar) — der Hinweis steht am Feld. Die Form des Typs ist nicht erfunden: die App deklariert genau sie als `PaymentAccountOption { id; label }` — allerdings in `recurring-rules/ui/RuleEditorForm.tsx`, also weder in `domain/` noch im Spiegel (**L-257**) | `Edges` |
| `labels` | `RecurringRuleLabels` | ja | die deutschen Wörter, die der Spiegel nicht hat (Richtung: L-256) | `Filled` |
| `summary` | `string` | nein | der Satz der Ableitung zum aktuellen Entwurf; ohne Kriterium ist er die Warnung. Der Editor formuliert ihn nicht — und der Aufrufer gibt `describeRecurringRule()` auch `matchPurposeRegex` mit (seit `2c0c888f` optional im Typ, und wer es weglässt, bekommt den falschen Satz) | `Edges` |
| `renderPreview` | `(draft: RecurringRuleDraft) => ReactNode` | nein | die Vorschau neben dem Formular — hier kommt `RecurringRuleFacts` (0134) hinein. Fehlt die Prop, fehlt die Vorschau (A12) | `InUse` |
| `pending` | `boolean` | nein | Speichern läuft | `Pending` |
| `error` | `string` | nein | der Fehler vom Server, über der Aktionszeile | `Error` |

**`RecurringRuleDraft`** liegt in `recurring-rule.ts` und ist ein `Pick` des
gespiegelten Typs — abgeleitet, nicht erfunden (Muster `RuleCriteria`,
`AccrualRuleSlice` in derselben Domäne):

```ts
Pick<RecurringRule,
  | "expectedDirection" | "matchCounterpartyName" | "matchCounterpartyIban"
  | "matchAmount" | "matchAmountTolerance" | "matchAmountTolerancePercent"
  | "matchPurposeRegex" | "matchContractNumber" | "matchDocumentTextRegex"
  | "expectedInterval" | "expectedDayOfMonth" | "bookingMode"
  | "personalAccountNumber" | "paymentAccountId" | "matchingNote"
  | "isActive" | "template">
```

**Elf Props — und §4 sagt: trotzdem eine Komponente.** Sechs davon sind
Aufrufer-Werkzeuge (Speichern, Abbrechen, Trefferzahl, Kontenquelle,
Vorschau, Fehler), fünf sind der Entwurf und seine Wörter. Sie zu trennen
hieße, den Entwurf zu teilen — und den teilt niemand.

**Was der Editor bewusst nicht kann:**

- **Nicht laden.** Kandidaten, Trefferzahl, Zahlungskonten und die Vorschau
  kommen als Prop bzw. Callback.
- **Nicht selbst prüfen, ob eine Zahlung trifft.** Er zeigt die Zahl, die er
  bekommt.
- **Keine zweite Regel desselben Falls anlegen und ordnen.** Mehrere Regeln je
  Sachverhalt sind erlaubt (Tabellenkommentar), die Oberfläche kennt heute nur
  eine (**L-245**, offen), und welche gewinnt, entscheidet `priority` — die
  seit `9a3ce2db` bei allen Schreibern gleich anfängt (~~L-254~~). Solange es
  keinen Ort gibt, an dem zwei Regeln nebeneinander stehen, schreibt der
  Editor keine Rangfolge.
- **Keine Laufzeit ändern** (`validFrom`/`validUntil`): DATEV-Import,
  laut GLOSSARY „rein informativ"; die Beendigung läuft über „Regel aktiv".

## Verhalten

**Client-Component** — der Entwurf ist Zustand. `"use client"`, unkontrolliert
(`defaultValue` + `onSubmit`), wie `ClarificationEditor`.

**Tastatur:** `Strg`/`Cmd` + `Enter` speichert, `Esc` bricht ab (nur mit
`onCancel`). Beide Wege stehen sichtbar an der Aktionszeile (`Kbd`).

**Prüfungen — was blockiert und was nur warnt:**

| Fall | Verhalten | Text |
|---|---|---|
| `accrue_then_settle` **ohne** Personenkonto | **blockiert** | „Für die Sollstellung braucht die Regel ein Personenkonto." — `deriveRuleProfile()` hebt den Modus nur mit Personenkonto; ohne es entstünde eine Regel, die nie sollstellt |
| Zweck-Regex oder Belegtext-Regex ungültig | **blockiert** | „Das Muster ist kein gültiger regulärer Ausdruck." — geprüft mit `isValidRegex()` aus dem Spiegel, nicht mit einem eigenen `try` |
| Zahltag außerhalb 1–31 | **blockiert** | „Der Zahltag liegt zwischen 1 und 31." |
| Toleranz negativ, Prozent außerhalb 0–100 | **blockiert** | „Eine Toleranz ist nie negativ." |
| **kein Kriterium** (weder Name noch IBAN noch Betrag noch Regex) | **warnt**, speichert trotzdem | der Satz aus `summary`: „Diese Regel hat noch keine Match-Kriterien und greift daher bei keiner Zahlung." |
| `match_only` | kein Fehler | Hinweis statt Vorlagenfeldern: „Nur Zuordnung — es entsteht kein Buchungsvorschlag." |

**Warum es blockiert ist, steht neben dem Knopf**, nicht nur in einem grauen
Knopf (Bauform aus `ClarificationEditor`).

Zustände: **neu** (leer, der Normalfall) · **gefüllt** · **lädt** (`pending`,
Felder gesperrt) · **ungültig** · **Fehler** (`error` über der Aktionszeile).

## Stories

Abgeleitet nach §6: 5 anwendbare Zustände (neu/leer, gefüllt, lädt, ungültig,
Fehler — der Editor braucht laut §6 „zusätzlich lädt und ungültig") +
1 Enum-Achse (`bookingMode`, drei Werte, die verschiedene Felder zeigen) +
1 Rundlauf über die zwei Callbacks + 1 „im Einsatz" + 1 Rand = **9**.
Neun von höchstens zehn — deshalb kommt hier nichts mehr dazu.
Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleEditor`.

| Story | Beweist |
|---|---|
| `New` | **der Normalfall**: kein `defaultValue`. Zwölf Felder statt zweiundzwanzig, drei Abschnitte gefaltet, der Hinweis, was ohne Regel passiert, und die Warnung „greift bei keiner Zahlung", solange nichts eingetragen ist |
| `Filled` | die importierte Regel des Bestands wird geändert: Gegenpartei, 1.800,00 €, Sollstellung mit Personenkonto 10001, Gegenkonto 4210, monatlich zum 1. |
| `Modes` | die drei Werte von `booking_mode` nebeneinander: `accrue_then_settle` **mit** Personenkonto-Feld, `book_on_payment` **ohne**, `match_only` mit dem Satz statt der Vorlage |
| `Invalid` | zwei blockierende Fälle zugleich: Sollstellung ohne Personenkonto und ein kaputter Regex (`([a-z`); der Grund steht neben dem Knopf |
| `Pending` | `pending`: Felder gesperrt, Knopf lädt, nichts springt |
| `Error` | `error` vom Server über der Aktionszeile; die Eingaben bleiben stehen |
| `Interactive` | Rundlauf mit `useState`: Tippen im Namensfeld meldet über `onCriteriaChange`, die Story rechnet daraus eine Trefferzahl, `matchCount` wandert zurück ins Formular; `onSubmit` zeigt den Entwurf |
| `InUse` | im Reiter „Wiederkehrende Buchung" eines Sachverhalts: Formular links, `RecurringRuleFacts` als Vorschau rechts (`renderPreview`), Abbrechen daneben |
| `Edges` | der Rand: Split-Vorlage mit drei Zeilen **nur lesend** (und beim Speichern unverändert), Buchungstext mit 60 Zeichen, Notiz über 400 Zeichen, kein Zahlungskonto (Hinweis „Konto der jeweiligen Transaktion"), gesetzte Belegseite — der gefaltete Abschnitt steht deshalb **offen** |

Nicht anwendbar: `LeerNachFilter` — es wird nicht gefiltert.

## Offene Fragen

1. **Ein Toleranzfeld oder zwei?** *Ohne Antwort: zwei* — absolut und in
   Prozent, wie das Datenmodell, mit der **geltenden** Toleranz aus
   `effectiveAmountTolerance()` als Hinweis darunter („es gilt: ± 25,00 €").
   Ein Feld zu bauen hieße, eine der beiden Spalten stillzulegen; die
   prozentuale ist für schwankende Reihen (Strom, Telefon) da.
2. **Gehört die Belegseite (Rang 18) in den Editor, obwohl sie im Bestand
   0 % trägt?** *Ohne Antwort: ja, im gefalteten Abschnitt „Weitere
   Kriterien".* F94 rechnet dieselbe Regel gegen Belege, und
   `matchesDocuments` steht bei 29 von 30 Regeln auf `true`, ohne dass jemand
   ein Beleg-Kriterium eintragen könnte (L-249).
3. **Was passiert beim Speichern mit `template.lines`?** *Ohne Antwort:
   unverändert durchreichen und lesend zeigen.* Ein Editor, der sie still
   verlöre, wäre Datenverlust — und die Prozent-Vorlage (F94-T94.7) ist der
   einzige Weg, eine schwankende Dauerbuchung aufzuteilen.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die Rangfolge mehrerer Regeln | `priority: number` im Entwurf, sichtbar als Feld | **L-245** zeigt mehrere Regeln je Fall — dann ist die Rangfolge eine Entscheidung und keine Konstante (~~L-254~~ ist seit `9a3ce2db` behoben) |
| Die Split-Vorlage bearbeiten | `template.lines` schreibend, mit `percentSumIsComplete()` als Prüfung | ein Screen verlangt es; heute ist sie in **keiner** Oberfläche änderbar |
| Ein getippter Typ für das Zahlungskonto | `paymentAccounts: readonly PaymentAccount[]` | **L-257** ist gelöst — der Spiegel führt den Typ |
| Belegnummern-Strategie ändern | `documentNumberStrategy` im Entwurf | **L-242** hat Wörter, und jemand darf `fixed` wählen dürfen (es „bricht ab der zweiten Periode den OPOS-Ausgleich" — heute trägt es genau eine Regel) |
| Die Regel aus einer Zahlung anlegen, mit einem Klick | nichts Neues — `defaultValue` aus `prefillFromTransaction(txn)` | die Bankzeile bekommt den Weg „Regel daraus bauen" |

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

- [ ] Ohne `defaultValue` öffnet der Editor **leer** und zeigt zwölf Felder; die drei Abschnitte sind gefaltet (Story `New`, gerenderte Eingaben gezählt)
- [ ] Ein gefalteter Abschnitt, in dem ein Wert steht, ist **offen** (Story `Edges` gegen `New`)
- [ ] Die Buchungsweise hat **drei** Wahlmöglichkeiten mit den Beschreibungen der Achse `regel_modus`; bei `match_only` erscheint der Satz statt der Vorlagenfelder (Story `Modes`)
- [ ] Das Personenkonto-Feld erscheint **nur** bei `accrue_then_settle` (Story `Modes`, drei Formulare nebeneinander gemessen)
- [ ] Sollstellung ohne Personenkonto blockiert, und der Grund steht neben dem Knopf (Story `Invalid`)
- [ ] Ein ungültiger Regex blockiert, geprüft mit `isValidRegex()` aus dem Spiegel: `grep -n "new RegExp" RecurringRuleEditor.tsx` findet nichts (Story `Invalid`)
- [ ] Eine Regel **ohne Kriterium** lässt sich speichern und wird gewarnt, nicht blockiert (Story `New`: Speichern ist möglich, die Warnung steht da)
- [ ] Der Editor formuliert keinen Satz selbst: `grep -n "describeRecurringRule\|hasAnyCriterion\|MATCH_CRITERIA" RecurringRuleEditor.tsx` findet nichts
- [ ] Der Editor rechnet keine Trefferzahl: `grep -n "matchTransaction" RecurringRuleEditor.tsx` findet nichts
- [ ] Die Konten kommen als **Nummer** in den Entwurf, nie als Id (Story `Interactive`, ausgegebener Entwurf gemessen)
- [ ] `template.lines` geht unverändert durch `onSubmit` und ist im Formular nicht änderbar (Story `Edges`, Entwurf vor und nach dem Speichern verglichen)
- [ ] Der Entwurf trägt **kein** `priority` (grep) — Owner-Entscheid; die Rangfolge klärt L-245
- [ ] `Strg`/`Cmd` + `Enter` speichert, `Esc` bricht ab; beide Tasten stehen sichtbar (Story `Interactive`)
- [ ] `pending` sperrt jede Eingabe; `error` steht über der Aktionszeile und die Eingaben bleiben stehen (Stories `Pending`, `Error`)
- [ ] Ersetzt `RuleEditorForm` **und** `MatchingNoteForm` ohne Funktionsverlust — die Notiz steht jetzt bei der Regel, zu der sie gehört — **offen (App)**

## Gebaut 2026-09-08

Gebaut von Claude (Skill `v3-komponente`), **nicht abgenommen**.

**Dateien:** `src/ui/v3/entities/recurring-rule/RecurringRuleEditor.tsx`
(dazu `RecurringRuleAccounts`) · `RecurringRuleEditor.stories.tsx` (9 Stories)
· `RecurringRuleDraft` in `recurring-rule.ts` · Export über
`src/ui/v3/index.ts`.

**Grün:** `pnpm typecheck` und die fünf Wächter auf Exit 0.

**Gemessen** mit `scripts/cdp.mjs` auf 6107, alle 9 Stories angesehen — keine
Konsolen-Ausgabe, keine Ausnahme:

| Was | Messung |
|---|---|
| Ohne `defaultValue` zwölf Felder, drei Abschnitte gefaltet | `New`: sichtbare Feld-Beschriftungen = Gegenpartei · IBAN · Richtung · Betrag · Toleranz · Toleranz in Prozent · Buchungsweise · Gegenkonto · Vorlagenbetrag · Buchungstext · Rhythmus · Erwarteter Zahltag = **12**; `details.open` = false, false, false |
| Ein gefalteter Abschnitt mit Inhalt steht offen | `Edges`: alle drei offen (Weitere Kriterien, Buchung im Detail, Notiz) gegen `New`, wo alle drei zu sind; `Invalid`: nur „Weitere Kriterien" offen (dort steht der Regex) |
| Drei Wahlmöglichkeiten mit den Beschreibungen der Achse | `Modes`: je drei `input[type=radio]`, Beschriftungen und Hinweise aus `resolveStatus("regel_modus", …)`; bei `match_only` steht „Nur Zuordnung — es entsteht kein Buchungsvorschlag." statt der Vorlagenfelder |
| Personenkonto nur bei `accrue_then_settle` | `Modes`, drei Formulare nebeneinander gemessen: 13 Beschriftungen (mit Personenkonto) · 12 (ohne) · 9 (`match_only`) |
| Sollstellung ohne Personenkonto blockiert, Grund neben dem Knopf | `Invalid`: `.v2actionbar__info` = „Für die Sollstellung braucht die Regel ein Personenkonto. · Das Muster ist kein gültiger regulärer Ausdruck." — **beide** Gründe, dazu je einer am Feld |
| Regex geprüft mit dem Spiegel | `grep -n "new RegExp" RecurringRuleEditor.tsx` → 0 Treffer; `isValidRegex` importiert aus `src/ludwig/…/rule.ts` |
| Regel ohne Kriterium: warnen, nicht blockieren | `New`: `.v2note` = „Diese Regel hat noch keine Match-Kriterien und greift daher bei keiner Zahlung.", `.v2actionbar__info` = null (nichts blockiert), Speichern-Knopf aktiv |
| Der Editor formuliert nichts selbst | `grep -n "describeRecurringRule\|hasAnyCriterion\|MATCH_CRITERIA" RecurringRuleEditor.tsx` → 0 Treffer |
| Der Editor rechnet keine Trefferzahl | `grep -n "matchTransaction" RecurringRuleEditor.tsx` → 0 Treffer |
| Konten als Nummer im Entwurf | `Interactive`, Entwurf nach dem Speichern gelesen: `template.counterAccountNumber` und `personalAccountNumber` sind Strings, keine Id |
| `template.lines` unverändert und nicht änderbar | `Edges`: `.v2rredit__split input, … select` = **0**; der Entwurf nach `onSubmit` trägt `template.lines` unverändert |
| Kein `priority` im Entwurf | `Interactive`: ausgegebener Entwurf hat 17 Schlüssel, `"priority" in draft` = **false**; `grep -n "priority" RecurringRuleEditor.tsx` → 0 Treffer |
| Rundlauf über die zwei Callbacks | `Interactive`: vor dem Tippen „Treffer noch nicht gezählt."; nach `Input.insertText("Musterfirma")` (Aktion und Messung in **getrennten** `Runtime.evaluate`-Aufrufen) steht „9 von 251 geprüften Zahlungen treffen." |
| `Strg`/`Cmd` + `Enter` speichert, beide Tasten sichtbar | `Interactive`: `Input.dispatchKeyEvent` mit `modifiers: 2` → der Entwurf erscheint mit `matchCounterpartyName: "Musterfirma"`. Sichtbare `.v2kbd`: `Strg+Enter` und (mit `onCancel`) `Esc` |
| `pending` sperrt jede Eingabe | `Pending`: 25 Bedienelemente, davon **0** ohne `:disabled`; Gegenprobe `Filled`: 23 von 23 bedienbar |
| `error` über der Aktionszeile, Eingaben bleiben | `Error`: `.v2note--danger` liegt oberhalb von `.v2actionbar` (Unterkante ≤ Oberkante), Feldwerte unverändert |
| Vorschau als `RecurringRuleFacts` | `InUse`: `.v2rredit__preview .v2rrfacts` = 1, rechts neben dem Formular (Formular endet bei 674 px, Vorschau beginnt bei 698 px) |

**Entscheidungen, die die Spec offen ließ:**

1. **Der Modus einer neuen Regel ist `book_on_payment`.** Nicht gewählt,
   sondern abgeleitet: `deriveRuleProfile()` hebt den Modus nur, wenn ein
   Personenkonto dasteht — ein leerer Entwurf hat keines.
2. **Ein Entwurf, der von außen kommt, gilt als geprüft.** `touched` startet
   auf `defaultValue !== undefined`. Begründung: die Mängel einer geladenen
   Regel sind Tatsachen, keine ungetippte Eingabe; ein leeres Formular bleibt
   still, bis jemand speichert.
3. **Die Aktionszeile nennt alle blockierenden Gründe**, nicht nur den ersten
   (`Invalid` zeigt zwei). Zwei Dinge können zugleich blockieren, und eine
   Leiste, die eines davon nennt, schickt jemanden ein zweites Mal zurück.
4. **Richtung als `Select` mit „beide Richtungen"** statt eines dritten
   Radios: ohne `expectedDirection` prüft `matchTransaction()` die Richtung
   nicht — das ist eine Wahl, kein fehlender Wert.
5. **Der Zahltag hat kein `null`-Wort**, er ist leer oder eine Zahl: die
   Erwartung ohne Zahltag ist der Rhythmus allein, und den zeigt das Feld
   darüber.

**Neuer Befund im Set (Kandidat):** **`AccountField` hat kein `disabled`.**
Beim ersten Messen blieben unter `pending` genau die zwei Kontofelder
bedienbar (2 von 23). Der Editor umschließt sie deshalb mit einem nativen
`fieldset[disabled]` (`Lock`, Klasse `.v2rredit__lock`) — das sperrt jedes
Feld darin, gemessen 0 von 25 bedienbar. Sauber wäre eine `disabled`-Prop an
`AccountField`; das ist eine Änderung an einem fremden Baustein und gehört in
eine eigene Aufgabe.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
