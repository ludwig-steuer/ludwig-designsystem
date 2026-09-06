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
