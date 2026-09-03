# 0019 · AmountInput — das Betragsfeld

| | |
|---|---|
| Status | Abnahme |
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
