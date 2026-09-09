# 0143 · `BusinessPartnerDrawer` — der Partner neben der Arbeit

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/business-partner/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Personenkonto, Sachverhalt, Buchungsverhalten |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` (`geprüft`, 2026-09-09), Abschnitt „Formen" und **Offene Frage 3, vom Owner am 2026-09-09 beantwortet** |
| Ersetzt | den Sprung auf `/partners/[partnerId]` aus fünf Stellen: `CaseFacts` (`partnerHref`), `case-columns` (`counterpartyHref`), `account-columns` (`partnerHref`), `GlanceCard` am Beleg, Dashboard-Kachel |
| Setzt voraus | **0142** `BusinessPartnerFacts` (Zone 3) · **0139** `BusinessPartnerCell` · `Drawer` (0052) · `accountColumns()` (0062) |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Fünf fremde Ansichten verweisen auf den Partner, ohne ihn zeigen zu können —
alle fünf verlassen dafür heute die Seite. Der Drawer beantwortet die Frage,
die dort aufkam, und bietet für alles Weitere den Weg.

## Owner-Entscheid 2026-09-09: eine Übersicht mit drei Abrissen

Die Spec hätte per Default nur Fakten plus Personenkonten gezeigt. **Der Owner
hat anders entschieden:** der Drawer ist eine Übersicht mit den neuesten bzw.
aggregierten Informationen. Er trägt **drei** Abrisse, und **jeder hat seinen
eigenen Weg** „mehr dazu" in den zugehörigen Reiter des Views — nicht ein
Fuß-Knopf für alles.

**Was ein Abriss zeigt, entscheidet seine Deckung.** Der Owner-Wortlaut sagt
„die neuesten Informationen oder aggregierte Informationen, je nachdem" — und
das ist genau die Mechanik von **D15**: Abriss-Karte ab `p50 ≥ 2`, bei
`p50 ≤ 1` eine Zahl mit Weg, in der Mehrzahl leer gar nichts.

| Abriss | Deckung (Staging 2026-09-09) | Form | Weg |
|---|---|---|---|
| **Personenkonten** | 0 % ohne — genau 2 Partner von 14.950 haben keins; p90 zwei Zeilen | **Liste** aus `accountColumns()`, benannter Satz | „Alle Konten" → Konten-Reiter |
| **Sachverhalte** | 99 % ohne; unter den 168 mit: p50 1 · p90 4 · max 43 | **Zahl mit Weg** — „4 Sachverhalte". Ohne einen: gar nichts, keine leere Karte | „Sachverhalte" → Sachverhalts-Reiter |
| **Buchungsverhalten** | übliches Gegenkonto und Steuerschlüssel **zu 0 % gefüllt** | **heute nichts** — der Slot ist da, der Callback optional | „Buchungen" → Buchungs-Reiter |

**Warum der dritte Abriss trotzdem in der Spec steht.** Er ist der, den der
Owner ausdrücklich wollte, und der, der den Drawer stark machen würde: übliches
Gegenkonto, üblicher Steuerschlüssel, die letzten Buchungen — die reichhaltigste
Partner-Darstellung der App steht heute in der Stapelabnahme (Karte
„Gegenpartei", `Schritt3Einzel.tsx`). Nur rechnet sie das im Sichtmodell
`ReviewCasePartner` aus der Buchungshistorie zusammen, **nicht am Partner**:
`defaultDebitAccountNumber` und `typicalTaxKeys` sind im Bestand zu 0 %
gefüllt.

Deshalb bekommt er einen **optionalen Callback**, keinen Platzhalter (A12):
`renderBookingBehaviour`. Fehlt er, fehlt der Abriss — es entsteht keine leere
Karte und keine Prop, die nichts tut. Kommt die Ableitung, ist der Platz da.
**Befund:** wo die drei Ableitungen hingehören — an den Partner oder in ein
eigenes Sichtmodell — ist eine Owner-Frage, die 0129 (`BusinessPartnerCard`)
ohnehin blockiert.

## Warum drei Wege und nicht einer

A10 sagt: ein Drawer hat **einen** Fuß-Knopf in die Vollansicht. Diese Spec
weicht davon ab, und der Grund ist der Entscheid: wenn der Drawer eine
Übersicht über drei Bereiche ist, dann führt jeder Bereich woandershin, und ein
einzelner Knopf „Zum Partner" zwänge die Sachbearbeiterin, den Reiter noch
einmal zu suchen, den sie gerade angesehen hat. **Zwei Ziele, zwei Wege** —
dieselbe Begründung wie bei I11, nur eine Ebene höher.

Der Fuß-Knopf bleibt trotzdem: er führt auf den Partner **ohne** Reiter, für
den Fall, dass keiner der drei Abrisse die Frage war.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `partner` | `BusinessPartnerDetail` | ja | Der Datensatz; geht unverändert an `BusinessPartnerFacts` | `Filled` |
| `open` | `boolean` | ja | Der Aufrufer hält den Zustand — ein Suchparameter, kein Kontext (L3) | `Filled` |
| `onClose` | `() => void` | ja | `Esc` und der Schließen-Knopf | `Roundtrip` |
| `accounts` | `readonly PartnerPersonalAccount[]` | ja | Der erste Abriss. Leer heißt „keins" — bei 2 von 14.950 | `WithoutAccounts` |
| `caseCount` | `number` | nein | Der zweite Abriss als Zahl. `0` oder fehlend: der Abriss entfällt | `Filled` |
| `tabHref` | `(tab: "accounts" \| "cases" \| "bookings") => string` | ja | Die drei Wege „mehr dazu". **Pflicht:** ein Abriss ohne Weg ist eine Sackgasse mit Zahlen | `Filled` |
| `href` | `string` | ja | Der Fuß-Knopf auf den Partner ohne Reiter (A10) | `Filled` |
| `renderBookingBehaviour` | `() => ReactNode` | nein | Der dritte Abriss. Fehlt er, fehlt der Abriss | `WithBehaviour` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg zum Kontoblatt, in Fakten und Kontenliste | `Filled` |

Dazu ein Export neben der Komponente: **`PartnerTab`** — die Union
`"accounts" | "cases" | "bookings"`, die `tabHref` entgegennimmt. Wer den Weg
baut, will sie importieren statt abschreiben.

**Kann bewusst nicht:**

- **Alles zeigen.** Belege (57 Partner im ganzen Bestand), Buchungssätze (94)
  und Erwartungen bleiben dem View. Ein Abriss, der bei 99 % leer ist, kostet
  Höhe und sagt nichts (D15).
- **Zwei Drawer für eine Zeile.** Wo eine Zeile schon in den Partner führt,
  steht keine zweite Partner-Aktion daneben (I11, D13).
- **Ändern.** Wie die Fakten: es gibt keinen Schreibpfad (L-229).
- **Die Vollansicht ersetzen.** Er beantwortet die eine Frage, die woanders
  aufkam; die fünf Reiter sind 0127.

## Stories

| Story | Beweist |
|---|---|
| `Filled` | Der Regelfall: Fakten, ein Personenkonto, vier Sachverhalte als Zahl mit Weg — **zwei** Wege plus der Fuß-Knopf. Den dritten gibt es heute nicht, weil seine Felder leer sind |
| `WithoutAccounts` | Der Partner ohne jedes Personenkonto (2 von 14.950): die Kontenliste entfällt, der Weg auch |
| `WithBehaviour` | Mit `renderBookingBehaviour`: der dritte Abriss steht; ohne die Prop steht er nicht — beide nebeneinander |
| `Sparse` | Der häufigste Fall: ein Konto, kein Sachverhalt, kein Verhalten. **Ein** Abriss, nicht drei leere |
| `Roundtrip` | `useState` über `open`; `Esc` schließt, der Fokus kehrt zum Auslöser zurück (V10) |
| `InUse` | Aus einer `CaseFacts`-Zeile aufgegangen — die häufigste der fünf Stellen. Der Sachverhalt bleibt stehen, der Partner legt sich daneben |

Ausgelassen mit Grund: **lädt** und **Fehler** — der Drawer zeigt, was er
bekommt; wer nachlädt, ist der Aufrufer (Präzedenz `AccountDrawer` 0068).

## Ausbau

Der **Buchungsverhalten-Abriss** wird echt, sobald entschieden ist, wo die drei
Ableitungen wohnen (Owner-Frage, siehe oben, blockiert auch 0129). Dann wird
aus `renderBookingBehaviour` entweder eine Prop mit Daten oder er bleibt ein
Callback und der Aufrufer stellt `ReviewCasePartner` hinein — beides ohne
Umbau am Drawer.

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

- [ ] Zone 3 kommt aus **`BusinessPartnerFacts`**, nicht aus einer zweiten
      Feldliste (`grep -n "FieldList" BusinessPartnerDrawer.tsx` → 0 Treffer)
- [ ] Drei Abrisse mit **drei** eigenen Wegen, dazu der Fuß-Knopf ohne Reiter
      (`WithBehaviour`, vier Ziele im DOM — **nicht** `Filled`: dort fehlt der
      dritte Abriss mangels Ableitung, und das ist der Regelfall)
- [ ] Ein Abriss ohne Deckung entfällt **ganz** — keine leere Karte, keine
      Überschrift (`Sparse`: ein Abriss; `WithoutAccounts`: **keiner** — die Story hat seit der Nacharbeit auch keinen `caseCount`)
- [ ] Die Sachverhalte stehen als **Zahl mit Weg**, nicht als Liste (D15,
      `p50 1`) — `Filled`
- [ ] Ohne `renderBookingBehaviour` gibt es den dritten Abriss nicht
      (`WithBehaviour` zeigt ihn, `Filled` ist die Gegenprobe ohne ihn)
- [ ] `Esc` schließt, der Fokus kehrt zum Auslöser zurück (`Roundtrip`, V10)
- [ ] Ersetzt den Sprung auf `/partners/[partnerId]` an den fünf genannten
      Stellen ohne Funktionsverlust

## Gebaut 2026-09-09

`BusinessPartnerDrawer.tsx`, fünf Stories. Zone 3 kommt aus
`BusinessPartnerFacts` (0142), nicht aus einer zweiten Feldliste — das war der
Grund, die Fakten zuerst zu bauen.

**Ein Kriterium dieser Spec hing an der falschen Story.** Es verlangte „vier
Ziele im DOM" in `Filled` — dort sind es **drei**: zwei Abriss-Wege und der
Fuß-Knopf. Der dritte Abriss braucht `renderBookingBehaviour`, und der bleibt
heute leer, weil die Ableitungen im Bestand zu 0 % gefüllt sind. Die Spec sagte
beides und merkte den Widerspruch nicht. Das Kriterium steht jetzt an
`WithBehaviour`, wo vier Ziele wirklich stehen.

**Gemessen** (`scripts/cdp.mjs`, 1200 px, im `.v2drawer__b`):

| Story | Abrisse | Wege im Körper | Fuß |
|---|---|---|---|
| `Filled` | 2 | „Alle Konten", „Sachverhalte" | „Geschäftspartner öffnen" |
| `WithBehaviour` | 3 | dazu „Buchungen" | derselbe |
| `Sparse` | 1 | „Alle Konten" | derselbe |
| `WithoutAccounts` | 1 | „Sachverhalte" | derselbe |

Ein Abriss ohne Deckung fehlt also **ganz** — keine leere Karte, keine
Überschrift, kein Weg ins Leere. Und die Sachverhalte stehen als Zahl, nicht
als Liste: unter den 168 Partnern mit einem ist der Median **eins**, und eine
Karte, die eine Zeile zeigt und sich Abriss nennt, kostet Höhe und sagt nichts
(D15).

**Die Abweichung von A10 steht als Kommentar am Export**, nicht nur hier: wer
den Drawer liest, soll wissen, warum er vier Ziele hat und nicht eins.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide 2026-09-09 gelaufen, `exit 0` (`tsc --noEmit`; Storybook-Build nach `storybook-static`) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `BusinessPartnerDrawer.tsx` + `BusinessPartnerDrawer.stories.tsx`, Titel `v3/Entitäten/Geschäftspartner/BusinessPartnerDrawer` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `BusinessPartnerDrawer` (`:68–71`); `PartnerTab` (`:38`) trägt einen erklärenden Einzeiler | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `.v2bpdrawer*` in `v3.css:3896–3898` nur über Tokens; px nur als `grid-template-columns` der Kontenliste (`:140`), wie in jeder anderen `Table`-Verwendung. Kein Status im Drawer selbst | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | **fünf von sechs** — `InUse` fehlt („Aus einer `CaseFacts`-Zeile aufgegangen — die häufigste der fünf Stellen"), und der Abschnitt „Gebaut" nennt keinen Grund. §6 verlangt die Einsatz-Story ausdrücklich | ✗ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | ohne Browser durchgegangen; die zwei App-Punkte („ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt") übersprungen (backlog/README) | ✓ |
| Im Browser angesehen (Storybook) | schlanke Abnahme (Owner-Entscheid 2026-09-08): Pixel, Abstände und Farbwirkung gehen an 0119; kein Storybook gestartet | vertagt auf 0119 |
| **Schnittstelle Zeichen für Zeichen** | | |
| Neun Props, Name · Typ · Pflicht | `:72–112` — `partner`, `open`, `onClose`, `accounts`, `tabHref`, `href` pflichtig, `caseCount?`, `renderBookingBehaviour?`, `accountHref?` optional: alle neun wie die Tabelle | ✓ |
| Exporte vollständig genannt | die Datei exportiert **zwei**: `BusinessPartnerDrawer` und `PartnerTab` (`:39`, im Barrel `index.ts:486–489`). Die Spec nennt `PartnerTab` nicht — sie schreibt den Union-Typ in der Zeile `tabHref` aus | ✗ |
| **Variabel** | | |
| Zone 3 kommt aus `BusinessPartnerFacts` | `:129–132`, ohne `all` (die kurze Form, wie 0142 sie vorsieht); `grep -n FieldList BusinessPartnerDrawer.tsx` → 0 | ✓ |
| Drei Abrisse mit drei eigenen Wegen, dazu der Fuß-Knopf | `Abstract` dreimal (`:135`, `:169`, `:184`), je ein `Link` im Kartenkopf (`:58`), dazu der `footer`-Knopf (`:122–126`). In `WithBehaviour` stehen alle vier. **Die Verschiebung des Kriteriums von `Filled` auf `WithBehaviour` trägt:** `Filled` hat drei Ziele, weil der dritte Abriss die Ableitung braucht, die im Bestand zu 0 % gefüllt ist. Die Abweichung von A10 steht als Kommentar am Export (`:25–31`) | ✓ |
| Ein Abriss ohne Deckung entfällt **ganz** | `:134`, `:165`, `:183` — keine leere Karte, keine Überschrift. Story `Sparse`: ein Abriss | ✓ |
| Die Sachverhalte stehen als **Zahl mit Weg**, nicht als Liste | `:169–180`, `formatCount(caseCount)` in `v2num` plus Wort und Datum; Story `Filled` | ✓ |
| Ohne `renderBookingBehaviour` gibt es den dritten Abriss nicht | `:113` ruft den Rückruf, `:183` prüft das Ergebnis; Gegenprobe `Filled` (ohne) gegen `WithBehaviour` (mit) | ✓ |
| `Esc` schließt, der Fokus kehrt zum Auslöser zurück | `Drawer.tsx:140` (`Escape`) und `:107–118` (Rückgabe im Cleanup, `back.focus()`); Story `Roundtrip` mit Auslöser-Knopf | ✓ |
| Ersetzt den Sprung auf `/partners/[partnerId]` an den fünf Stellen | Migrationsschritt in `ludwig/app` (backlog/README) | offen (App) |
| **Ränder** (Nachtrag 2026-09-08) | | |
| „(`Sparse`: ein Abriss; `WithoutAccounts`: **keiner**)" | `WithoutAccounts` übergibt `caseCount={1}` (`BusinessPartnerDrawer.stories.tsx:132`) und zeigt damit **einen** Abriss — die Messtabelle im Abschnitt „Gebaut" sagt dasselbe (`WithoutAccounts` \| 1 \| „Sachverhalte"). Die Klammer im Kriterium wurde nicht mitgezogen | ✗ |
| „(`WithBehaviour`, beide Fassungen nebeneinander)" | `WithBehaviour` zeigt **eine** Fassung; zwei Drawer nebeneinander gehen auch nicht. Die Gegenprobe ist `Filled`. Das Story-JSDoc („Mit und ohne `renderBookingBehaviour`", Z. 140) verspricht dasselbe Falsche | ✗ |

**Offen (2026-09-09):**

1. Die Story `InUse` fehlt ohne Begründung — §6 verlangt sie, und die
   `CaseFacts`-Zeile ist der häufigste der fünf Aufrufer.
2. `PartnerTab` steht im Code und im Barrel, nicht in der Spec.
3. Zwei Kriteriums-Klammern zeigen auf Stories, die etwas anderes zeigen
   (`WithoutAccounts`: ein Abriss statt keiner; `WithBehaviour`: eine Fassung
   statt zwei) — beim Verschieben des einen Kriteriums sind die Nachbarn
   stehengeblieben.

**Was tragfähig ist:** die vier Ziele statt eines Fuß-Knopfs. Die Abweichung
von A10 steht im Owner-Entscheid, im Abschnitt „Warum drei Wege und nicht
einer" **und** als Kommentar am Export — wer den Drawer liest, findet den
Grund, ohne die Spec zu haben. Und die Verschiebung des Kriteriums von `Filled`
auf `WithBehaviour` ist richtig: in `Filled` sind es drei Ziele, und das ist
der Regelfall.

Das Kriterium „offen (App)" hat **keine** Zeile in `docs/befunde-app.md`,
Abschnitt E.

## Nacharbeit zur Abnahme, 2026-09-09

Drei Mängel: eine fehlende Story, ein nicht genannter Export, zwei Klammern,
die ins Leere zeigten.

**M1 — `InUse` fehlte.** §6 verlangt die Einsatz-Story, und gerade hier trägt
sie etwas: der Drawer existiert, damit die Sachbearbeiterin den Sachverhalt
**nicht** verlassen muss. Eine Story, die ihn ohne seinen Anlass zeigt, lässt
genau das weg. Jetzt geht er aus einer `CaseFacts`-Zeile auf, und der
Sachverhalt bleibt daneben stehen.

**M2 — `PartnerTab` ist exportiert und stand nur im Union-Ausdruck der
`tabHref`-Zeile.** Wer den Typ importieren will, findet ihn jetzt.

**M3 — zwei Klammern zeigten ins Leere.** „`WithoutAccounts`: keiner" — die
Story übergab `caseCount={1}` und zeigte einen Abriss; „`WithBehaviour`, beide
Fassungen nebeneinander" — sie zeigt eine, die Gegenprobe ist `Filled`. Beim
Verschieben des einen Kriteriums auf `WithBehaviour` sind die Nachbarn
stehengeblieben. Genau das Muster aus dem Nachtrag vom 2026-09-08, und diesmal
habe ich es beim Verschieben selbst erzeugt.

Behoben ist beides an der Wurzel: `WithoutAccounts` hat jetzt **keinen**
`caseCount` und damit wirklich keinen Abriss — der Fall, den das Kriterium
beschreibt, existiert jetzt auch.
