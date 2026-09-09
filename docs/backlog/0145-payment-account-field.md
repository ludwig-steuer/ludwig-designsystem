# 0145 · `PaymentAccountField` — geführte Zahlungskonten von Karteileichen trennen

| | |
|---|---|
| Status | **Abnahme** — gebaut 2026-09-09, fremde Abnahme steht aus |
| Stufe | `entities/account/` — der Zahlungsverkehr eines Mandanten läuft über Sachkonten |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **die Mechanik ja, die Wörter nein.** Siehe „Warum Entität und nicht Primitive" |
| Quelle | Auftrag `ludwig-worker` im Namen des Owners, 2026-09-09; App-Seite als `docs/backlog/F176-zahlungskonto-auswahl-gefuehrte-konten.md` im App-Repo |
| Ersetzt | zwei Select-Blöcke: `modules/document-inbox/ui/UploadInbox.tsx:793` („Kontoauswahl") und das Feld „Zahlungskonto" in `RecurringRuleEditor.tsx:558` samt seiner Prop `paymentAccounts` |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Ein Mandant hat in Ludwig **25–43 Zahlungskonten**, weil das Onboarding den
ganzen SKR-Bankblock übernimmt: die DATEV-Kontenfunktion 10 wirft Bank, Kasse,
PSP und Verrechnungskonten in einen Topf. **Geführt wird davon fast nie mehr
als eines.**

Heute stehen alle flach in einer Liste. Bei `willems-sabine-2` sucht die
Sachbearbeiterin ihre „Münchner Bank 107555539" (145 Buchungen) zwischen
„Geldtransit", „Nebenkasse 2", „Schecks" und „Bank (Postbank 3)" — **24 Konten
ohne eine einzige Buchung**. Der Baustein stellt die geführten nach oben und
schiebt den Rest unter eine eigene Überschrift, ohne ihn wegzunehmen.

## Warum Entität und nicht Primitive

Die Mechanik — „eine Auswahl, in der nur ein Bruchteil der Einträge aktiv
geführt wird" — ergäbe in jeder Fachanwendung Sinn: Kostenstellen, Lager,
Policen. Ein Primitive müsste die beiden Überschriften aber als Props nehmen,
und dann bliebe ein `<select>` mit `<optgroup>` übrig: eine Komposition ohne
eigenen Zustand, also Markup an der Aufrufstelle (§4).

**Die Überschriften sind die Komponente.** „Geführte Konten" gegen „Weitere
Konten aus dem Kontenrahmen" ist der ganze fachliche Gehalt, und er gehört
einmal hierher statt zweimal in zwei Aufrufer. Nach §2 heißt das: Entität, und
zwar bei `account/` — ein Zahlungskonto ist ein Sachkonto.

## Warum `<select>` und nicht die Combobox-Linie

`AccountField` (0013) ist die Combobox für den Fall „41.570 Konten, such dir
eins". Hier ist die Frage eine andere: von 25 bis 43 Konten ist **faktisch
eines geführt**, der Rest ist Kulisse. Wer bei drei sichtbaren Einträgen tippen
muss, hat den Vorteil der Gruppierung wieder verloren.

Das ist auch der Grund, warum `AccountField` daneben bestehen bleibt: es
beantwortet „welches von vielen", dieser Baustein „das eine oder doch eines der
anderen".

## Die zwei Fälle, in denen es **keine** Gruppen gibt

Sind **alle** Konten geführt oder **keines**, steht die Liste flach — ohne
Überschriften. Eine Überschrift, die nichts trennt, behauptet eine
Unterscheidung, die es nicht gibt. Das ist kein Randfall: ein frisch
angelegter Mandant hat null geführte Konten, ein kleiner genau eins von einem.

## Ein Wert, den die Liste nicht kennt

Zeigt `value` auf ein Konto, das nicht in `accounts` steht, **steht es
trotzdem da** — als eigene erste Option mit dem Zusatz „(nicht in der Liste)".
Kein stilles Zurückfallen auf `null`.

Der Fall ist konkret: eine Wiederkehr-Regel mit `paymentAccountId` auf einem
stillgelegten Konto (`valid_until` gesetzt). Heute lädt die Seite alle Konten
des Mandanten und es fällt nicht auf; sobald jemand serverseitig auf die
geführten kürzt, verschwände genau diese Zuordnung lautlos. Ein Feld, das eine
gültige Zuordnung stillschweigend vergisst, ist schlimmer als eine
ungewöhnliche Zeile.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `string \| null` | ja | Die gewählte `accountId`; `null` heißt „noch keins" | `Interaktiv` |
| `onChange` | `(id: string \| null) => void` | ja | Wählen und Abwählen; das Feld hält nichts | `Interaktiv` |
| `accounts` | `readonly PaymentAccountOption[]` | ja | Die Kandidaten. Reihenfolge innerhalb einer Gruppe bleibt, wie sie kommt | `Gefuellt` |
| `id` | `string` | ja | Bindet das Wort an das Feld (`Field htmlFor`) — Pflicht aus demselben Grund wie dort (0104) | `ImEinsatz` |
| `placeholder` | `string` | nein | Die erste, leere Option. Vorgabe „Bankkonto wählen…" | `Leer` |
| `unknownLabel` | `string` | nein | Der Zusatz am unbekannten Wert. Vorgabe „(nicht in der Liste)" | `UnbekannterWert` |
| `invalid` | `boolean` | nein | Reicht an `Select` durch | `ImEinsatz` |
| `disabled` | `boolean` | nein | Bei leerer Liste **von selbst** gesetzt | `Leer` |

```ts
export interface PaymentAccountOption {
  id: string;
  /** Name, bei Bankverbindung mit IBAN — fertig formatiert vom Aufrufer. */
  label: string;
  /** `true` = geführtes Konto. */
  inUse: boolean;
}
```

**Kann bewusst nicht:**

- **Entscheiden, was „geführt" heißt.** Das ist eine fachliche Ableitung
  (Auszugserwartung `expects_statements` nach `bank.md` R15a, gebuchte Zeilen,
  Auto-Zuordnung) und bleibt in der App. `inUse` kommt fertig herein — derselbe
  Schnitt wie überall hier.
- **Ein Konto anlegen.** „Nicht dabei" ist kein Formular.
- **Ein Konto sperren.** Die weiteren Konten bleiben **immer** wählbar: eine
  falsch abgeleitete Erwartung darf niemanden aussperren.
- **Das Label bauen.** Name und IBAN setzt der Aufrufer zusammen; er weiß, was
  er hat.

## Stories

| Story | Beweist |
|---|---|
| `Gefuellt` | Ein geführtes Konto und acht weitere — zwei Gruppen mit Überschrift. Die Daten sind der echte Fall: „Münchner Bank 107555539" mit 145 Buchungen gegen acht mit null |
| `NurGefuehrte` | Alle `inUse` → **keine** Überschriften, flache Liste. Dazu die Gegenprobe: keines `inUse` → ebenso flach |
| `Leer` | Nur der Platzhalter, Feld gesperrt — ohne dass der Aufrufer `disabled` setzen muss |
| `UnbekannterWert` | `value` zeigt auf ein stillgelegtes Konto, das nicht in der Liste steht: es steht als erste Option mit „(nicht in der Liste)" |
| `Interaktiv` | Rundlauf mit `useState` — wählen, abwählen, und der unbekannte Wert bleibt wählbar, bis etwas anderes gewählt wird |
| `ImEinsatz` | In `Field` innerhalb einer Zeile mit Aktionsknopf, wie im Beleg-Eingang |

Ausgelassen mit Grund: **lädt** und **Fehler** — die Optionen kommen als Prop;
wer lädt, ist der Aufrufer. **Leer nach Filter** gibt es nicht, das Feld
filtert nicht.

## Ausbau

Wenn die zweite Gruppe in der Praxis so lang wird, dass Blättern im
aufgeklappten `<select>` stört, wird daraus die Combobox-Linie von
`AccountField` — eine Prop, kein Umbau. Auslöser wäre ein Mandant mit deutlich
mehr als 43 Zahlungskonten oder eine Messung, die das Suchen zeigt.

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

- [ ] Zwei Gruppen mit den Überschriften „Geführte Konten" und „Weitere Konten
      aus dem Kontenrahmen", geführte zuerst (`Gefuellt`, DOM)
- [ ] Alle `inUse` **oder** keines → **keine** `<optgroup>` im DOM
      (`NurGefuehrte`, beide Fassungen)
- [ ] Ein unbekanntes `value` steht als erste Option mit dem Zusatz und geht
      **nicht** verloren (`UnbekannterWert`, `select.value` gemessen)
- [ ] Leere Liste: Feld ist `disabled`, ohne dass der Aufrufer es setzt (`Leer`)
- [ ] Die weiteren Konten sind wählbar, keines ist `disabled` (`Gefuellt`)
- [ ] Der Baustein leitet nichts ab: `inUse` wird nur **gelesen**, nie
      gerechnet. Prüfbar daran, dass `expects_statements` genau **einmal**
      vorkommt — im Kommentar, der sagt, dass die Ableitung in der App bleibt
- [ ] Ersetzt `UploadInbox.tsx:793` und das Feld in `RecurringRuleEditor.tsx:558`
      ohne Funktionsverlust

## Gebaut 2026-09-09

`entities/account/PaymentAccountField.tsx`, sechs Stories. Kein eigenes CSS —
das Feld ist ein `Select` mit `<optgroup>`, und die Gruppierung ist Semantik,
keine Gestaltung.

**Gemessen** (`scripts/cdp.mjs`, 900 px, am `<select>` selbst):

| Story | Gemessen |
|---|---|
| `Gefuellt` | zwei `optgroup` — „Geführte Konten" zuerst, „Weitere Konten aus dem Kontenrahmen" darunter; **keine** Option ist gesperrt |
| `NurGefuehrte` | beide Fassungen (alle geführt · keines geführt) haben **null** `optgroup` — flache Liste |
| `Leer` | `select.disabled === true`, eine Option: der Platzhalter. Der Aufrufer musste nichts setzen |
| `UnbekannterWert` | `select.value === "a-99"` — der Wert **überlebt**. Die Option steht als erste nach dem Platzhalter und heißt „a-99 (nicht in der Liste)" |

Der letzte Punkt ist der, um den es ging: hätte ich das Unbekannte weggelassen,
stünde `select.value` auf `""`, und die nächste Speicherung hätte die Zuordnung
gelöscht — lautlos.

**Ein Abnahmekriterium dieser Spec war so nicht prüfbar.** Es verlangte, dass
`grep` den Begriff **nicht** findet — er steht aber genau einmal in der Datei,
nämlich in dem Kommentar, der erklärt, dass die Ableitung in der App bleibt.
Ein Kriterium, das den erklärenden Satz mitbestraft, treibt ihn aus dem Code.
Es heißt jetzt „genau einmal, und zwar im Kommentar“.


## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
