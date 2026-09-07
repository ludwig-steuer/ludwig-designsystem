# 0093 · Wo das Set seine eigenen Regeln nicht hält

| | |
|---|---|
| Status | Abnahme |
| Stufe | quer durch `src/ui/v3` und `src/styles/` |
| Quelle | Abnahme Paket 0002/0005/0008/0009/0013 (2026-09-05), Befunde 3–6; Paket 0032/0033/0037/0041/0051 (`format.ts` ohne `@when`); Paket 0059/0060/0061/0064 (Punkt e) |
| Auftrag | Fünf Verstöße gegen Regeln, die das Set selbst aufstellt. Einzeln sind sie klein, zusammen sind sie der Grund, warum eine Abnahme sie jedes Mal wieder findet. Punkt (e) hält heute eine Aufgabe auf (0059). |

**(a) `@instead` fehlt an 22 Exporten**, vier haben gar kein JSDoc (`CardHead`,
`CardFoot`, `Input`, `Textarea`). Betroffen unter anderem `KeyButton`,
`StateIcon`, `SearchInput`, `TableLoading`, `ErrorRow`, `useSelection`,
`SelectCell`, `MenuItem` und die vier Exporte aus `format.ts`. Die feste Regel
verlangt beide Zeilen an jedem Export — greppbar ist „was nehme ich?" heute zu
85 %. Gerade `format.ts` ist die Stelle, an der die Frage real wird: nehme ich
`Amount`, `AmountCell`, `AmountInput` oder `formatAmount`?

**(b) `prefers-reduced-motion` ist nur an drei Stellen bedacht.** In `v3.css`
sind `.v2skel`, `.v2spin` und `.v2toast` abgesichert; die Transitions von
`.v2disc__chev`, `.v2chev`, `.v2drawer` und `.v2drawer__scrim` laufen
ungebremst. §2 verlangt es für **jede** Transition — und der Drawer ist die
größte Bewegung im Set.

**(c) T9 gegen die eigene Spec in `StepRail`.** Die Schritt-Navigation setzt
Pfeile als Textzeichen („← Zurück", „Weiter zu Schritt 4 →"). T9 lässt Pfeile
als Bedeutungsträger nur als Lucide-Zeichen zu, seit 0087 über die Registry
(`back`, `forward`). Die Spec 0002 §A6 schreibt die Schreibweise allerdings
selbst so vor — beides gehört zusammengeführt, nicht einseitig geändert.

**(d) Die Icon-Registry lässt sich am Aufrufer umgehen.** `MenuItem icon` ist
`ReactNode`; wer will, reicht ein beliebiges Lucide-Zeichen durch. Für Stories
erlaubt 0087 das ausdrücklich, für echte Aufrufer gibt es keine Schranke. Zu
entscheiden: bleibt `ReactNode` (und der Wächter deckt es, weil der Aufrufer
importieren müsste), oder nimmt `MenuItem` eine `ActionKey`?

**(e) `Disclosure` lässt eingebettete Flex-Zeilen nicht auf Breite wachsen.** — **erledigt am 2026-09-05** mit dem Fix zu 0059: das `<span>` heißt jetzt `.v2disc__label` und wächst; gemessen endet der Zustands-Chip am Zeilenrand statt bei x = 517.
`.v2disc__sum` legt die Zusammenfassung in ein `<span>`, das nicht wächst
(`Disclosure.tsx`), und `v3.css` setzt dort nur `padding-left`. Folge, gemessen
in der Abnahme von 0059: sobald eine Klärungszeile aufklappbar ist — also in
jeder `ClarificationList` mit `renderDetail`, der vorgesehenen Bauform —
endet der Zustands-Chip bei x=517 statt am Zeilenrand 1323. Die
Zustands-Spalte, die 0059 ausdrücklich herstellen will, fällt damit weg. Das
trifft jede künftige Zeile mit rechter Spalte in einem `<details>`, deshalb
gehört der Fix in `Disclosure` und nicht in die Klärung.

| | |
|---|---|
| Warum eine Aufgabe für fünf Dinge | Jedes einzeln wäre ein Nachtrag an einer fremden, längst abgenommenen Spec. Zusammen sind sie ein Durchgang durch das Set mit einer Abnahme. |
| Angelegt von / am | Claude, 2026-09-05 (aus zwei Abnahmen) |

## Erledigt 2026-09-06

**(a) `@when`/`@instead` nachgetragen — und die Regel geschärft.** Der Auftrag
zählte 22 Exporte; ein Durchlauf über alle `.ts`/`.tsx` unter `src/ui/v3`
fand **31**. Nachgetragen sind sie an allem, wo die Frage „was nehme ich?"
wirklich entsteht: `DetailPane`, `Dialog`, `CardHead`, `CardFoot`, `Input`,
`Textarea`, `isOpen`, `StateIcon`, `ProcessMini`, `Link`, `activeHref`,
`isTyping`, `matchesKey`, `formatAmount` und die vier Funktionen aus
`tax-assist.ts`.

**Nicht** nachgetragen an Konstanten — Label-Tabellen, Icon-Registern,
Fixtures. Zwischen `ENTITY_ICON` und `AGE_BUCKET_LABEL` wählt niemand; sie
bekommen einen Satz, der sagt, was sie sind, und das ist die ehrliche Form der
Regel. Wo der Satz fehlte (`ACCOUNT_GROUP_LABEL`, `SOURCE_DOCUMENT_DETAILS`,
`STATE_LABEL`), steht er jetzt.

**(b) `prefers-reduced-motion` deckt jetzt jede Transition.** Abgesichert waren
nur die drei Bewegungen, die von selbst laufen; die, die auf eine Handlung
folgen, liefen ungebremst — und der Drawer ist die größte Bewegung im Set,
also genau die, die die Einstellung meint. Gemessen unter gesetzter
Einstellung: `.v2drawer` und `.v2drawer__scrim` haben
`transition-duration: 0s`.

**(c) Die Pfeile in `StepRail` sind Lucide-Zeichen.** Vorher die Textzeichen
„←" und „→": eine Vorlesehilfe sagt „Pfeil nach rechts", und sie skalieren mit
der Schrift statt mit der Icon-Leiter. Jetzt `ActionIcon action="back"` und
`"forward"` aus der Registry. Der Widerspruch zur Spec 0002 §A6, die die
Zeichen selbst vorschrieb, ist zugunsten von T9 aufgelöst — die
Gestaltungsregel schlägt die Spec (Reihenfolge aus `v3-komponente`), und §A6
ist damit korrigiert.

**(d) `MenuItem icon` bleibt `ReactNode`.** Ein `ActionKey` würde den Eintrag
an die Handlungs-Registry binden, aber ein Menüeintrag benennt auch Entitäten
(„Zum Sachverhalt") und Zustände — die kommen aus `EntityIcon` und
`StateIcon`. Die Schranke ist nicht der Typ, sondern `pnpm check:icons`: wer
ein Zeichen am Vokabular vorbei will, müsste `lucide-react` importieren, und
genau das weist der Wächter zurück. Begründung steht am Prop.

**(e)** war schon am 2026-09-05 erledigt.

## Prüfung 2026-09-07 (fremd, nicht der Bauende)

Die Datei trug bisher keinen Abnahme-Eintrag; dies ist er. Geprüft wurde der
**Bestand**, nicht die Commits: Storybook auf Port 6107 (Dev-Server, Katalog
aus `/index.json`, 717 Stories), Chromium headless bei 1440×900. Jede
Messung ist gegengeprobt — ein zurückgelesener Wert ist keine Messung.

**Urteil: bestätigt.** Alle fünf Punkte halten heute. Was seither an der Regel
(a) abgerieben ist, stammt aus Arbeit **nach** dieser Aufgabe und ist unten als
Beobachtung notiert, nicht als Mangel.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` | `tsc --noEmit` ohne Ausgabe, **Exit 0** | ✓ |
| `pnpm build` | einmal gelaufen, **Exit 0** (am Exit-Code geprüft, nicht an der letzten Zeile). Danach vom Owner untersagt: mehrere Prüfer im selben Baum, ein Bau leert `storybook-static/` — der „Build-Flacker" aus 0117 | ✓ |
| `pnpm check:icons` / `pnpm check:contrast` | beide **Exit 0** | ✓ |

**Die fünf Punkte**

| Punkt | Nachweis (Story-ID · Messwert · Gegenprobe) | Ergebnis |
|---|---|---|
| **(a) `@when`/`@instead` an jedem Export** | Durchlauf über alle `.ts`/`.tsx` unter `src/ui/v3` ohne Stories: **259** Wert-Exporte, davon 30 SCREAMING\_SNAKE-Konstanten (alle mit dem Satz, den der Entscheid für sie vorsieht — keine ohne). **248 von 259** tragen beide Zeilen; die 31 Exporte, die diese Aufgabe nachgetragen hat, tragen sie ausnahmslos noch (`tax-assist.ts` alle vier, `format.ts` alle acht, `CardHead`, `CardFoot`, `Input`, `Textarea`, `StateIcon`, `ProcessMini`, `Link`, `matchesKey` …). Die 11 ohne Zeilen sind **jünger als diese Aufgabe** — siehe Beobachtung 1 | ✓ |
| **(b) `prefers-reduced-motion` deckt jede Transition** | Gemessen mit `Emulation.setEmulatedMedia`, einmal `no-preference` und einmal `reduce`, an fünf Stories. `no-preference`: `.v2drawer` **0,28 s**, `.v2drawer__scrim` **0,18 s**, `.v2disc__chev` 0,12 s, `.v2tbl__row` 0,12 s, `.v2btn` 0,12/0,12/0,18/0,12 s, `.sb__navitem` 0,12 s. `reduce`: **alle** auf `1e-05s`, Delay 0 s. Die Zahl reagiert also auf die Einstellung. Der Weg ist eine Regel statt einer Liste (`v3.css:3483–3489`, `*`, `*::before`, `*::after` mit `!important`) — sie greift damit auch auf `app-chrome.css` und `booking.css`, was eine Selektorliste nie geschafft hätte (`.sb__navitem` ist der Beleg) | ✓ |
| **(c) Die Pfeile in `StepRail` sind Lucide-Zeichen** | `steprail--screen-header`: „Weiter zu Schritt 4" trägt `lucide-chevron-right w=14 sw=1.5`, „Zurück" trägt `lucide-chevron-left w=14 sw=1.5`; **kein** Textpfeil im Bild der Story. Über **alle 717 Stories** gesucht: `StepRail` hat in keiner einen Textpfeil. Derselbe Griff ist in `Review.tsx:182` mitgezogen | ✓ |
| **(d) `MenuItem icon` bleibt `ReactNode`** | Der Typ ist `ReactNode` (`OverflowMenu.tsx:129`), und die Begründung steht **am Prop** (Z. 118–128), nicht nur im Commit. Sie nennt inzwischen sogar die Grenzen der Schranke („überspringt Story-Dateien, trägt zwei offene, erreicht keinen Aufrufer außerhalb dieses Repos") — die Aufgabe hat den Entscheid also nicht nur getroffen, sondern auch ehrlich beschrieben. Die Schranke selbst läuft: `check:icons` Exit 0, und auf einer Kopie außerhalb des Repos mit einem eingesetzten `lucide-react`-Import Exit 1 | ✓ |
| **(e) `Disclosure` lässt die Zeile auf Breite wachsen** | `clarificationrow--mit-karte`: `.v2disc__label` steht auf `flex: 1 1 auto`, ist **1368 px** breit, und der Zustands-Chip `.v2cl__state` endet bei **x = 1399**, also 24 px vor dem Zeilenrand 1423. Gegenprobe: zur Laufzeit `.v2disc__label{flex:0 0 auto}` gesetzt → der Chip fällt auf **x = 517** zurück, exakt der Wert, den die Abnahme von 0059 als Mangel gemessen hat; nach dem Entfernen wieder 1399. Der Fix ist also wirksam und die Messung reagiert | ✓ |

### Beobachtungen außerhalb der Kriterien

1. **Die Regel (a) reibt sich weiter ab, weil kein Wächter sie hält.** Heute
   fehlen `@when`/`@instead` an **11** Exporten: `caseListTracks`
   (`CaseList.tsx`), `invoiceLineTracks`, `invoiceLineTracksExpandable`,
   `invoiceLineMinWidth`, `line` (`invoice-line/fixtures.ts`, ganz ohne JSDoc),
   `documentSideTotal`, `journalTotals`, `journalBalanceText`,
   `journalGridTracks` (`journal-entry.ts`), `FileName` (`SourceDocument.tsx`)
   und `SourceDocumentFacts`. Vier der sechs Dateien sind **heute** entstanden
   (`git log --diff-filter=A`: 2026-09-07), `FileName` ist neu, und bei
   `SourceDocumentFacts` ist der Block **abgerutscht**: die Zeilen stehen noch
   da, aber 0071 hat ein zweites JSDoc dazwischengeschoben, sodass sie nicht
   mehr am Export hängen (im Stand dieser Aufgabe, `6ecae07`, hingen sie noch).
   Kein Mangel dieser Aufgabe — aber (a) ist der einzige der fünf Punkte ohne
   Skript, und genau er ist der einzige, der wieder zurückgefallen ist. `(d)`
   hat `check:icons`, `(b)` und `(e)` hängen an einer Regel, die von selbst
   greift; `(a)` hängt an Disziplin.
2. **Der geschärfte Entscheid zu (a) steht nicht in der Regel.** Diese Aufgabe
   hat entschieden, dass Konstanten (`ENTITY_ICON`, `AGE_BUCKET_LABEL` …) statt
   der zwei Zeilen einen Satz bekommen — die Regel in `README.md` (Z. 47) sagt
   weiter „**jeder** Export trägt `@when` und `@instead`". Wer nach der Regel
   prüft, meldet 30 falsche Treffer.
3. **Ein Textpfeil als Bedeutungsträger, außerhalb des Umfangs.** Über alle 717
   Stories gesucht: `„→"` steht in 22 Stories. In 21 davon ist es Fließtext
   („02:30 UTC → 04:30 Berlin", „19 % 235,60 € → 1406") — Satzzeichen, kein
   Zeichen. Eine ist es nicht: `LedgerAccountView.stories.tsx:175` beschriftet
   einen `TextButton` mit „Zum Kontenplan →". Das ist dieselbe Gestalt, die (c)
   in `StepRail` abgeschafft hat, nur in einer **Story**, nicht im Baustein.
4. **Animationen sind bewusst außen vor** — der Entscheid sagt es. Drei laufen
   in der v1-Schicht ungebremst weiter (`components.css` `.skel`,
   `.uz-step.run .dot`, `app-chrome.css` `progress-indeterminate-slide`); §2 der
   Gestaltungsregeln verlangt `prefers-reduced-motion` für „jede Transition
   **und Animation**". Keine der drei Klassen wird von einem v3-Baustein
   benutzt (geprüft gegen `src/ui/`), sie fallen also unter dieselbe Begründung
   wie die übrigen Reste dieser Schicht.
