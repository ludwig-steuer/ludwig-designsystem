# 0143 · `BusinessPartnerDrawer` — der Partner neben der Arbeit

| | |
|---|---|
| Status | **Abnahme** — gebaut 2026-09-09, fremde Abnahme steht aus |
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
| `InUse` | Aus einer `CaseFacts`-Zeile aufgegangen — die häufigste der fünf Stellen |

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
      Überschrift (`Sparse`: ein Abriss; `WithoutAccounts`: keiner)
- [ ] Die Sachverhalte stehen als **Zahl mit Weg**, nicht als Liste (D15,
      `p50 1`) — `Filled`
- [ ] Ohne `renderBookingBehaviour` gibt es den dritten Abriss nicht
      (`WithBehaviour`, beide Fassungen nebeneinander)
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
| | | |
