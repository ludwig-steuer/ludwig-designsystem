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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| „1234,56", „1.234,56" und „1234.56" ergeben denselben Wert | `v3-primitives-formular-amountinput--interactive`: die Leseprobe zeigt für alle drei — und für „1 234,56" — 1234.56 | ✓ |
| Unparsbares setzt `aria-invalid` und wird nicht auf 0 gesetzt | Dieselbe Story: „12,3,4" getippt, Feld verlassen — der Text bleibt stehen, `aria-invalid="true"`, Fehlerzeile „Betrag nicht lesbar — Beispiel: 1.234,56", der gespeicherte Wert bleibt unverändert | ✓ |
| `null` rendert ein leeres Feld, nicht „0,00" | `--empty` und das zweite Feld in `--signs`: `input.value` ist leer | ✓ |
| Ziffern stehen rechts und fluchten untereinander | `.v2in--amount` setzt `text-align: right` und `tabular-nums lining-nums` — dieselbe Regel wie `.v2num` in `AmountCell`; geprüft an `--interactive` und `--in-editor` | ✓ |
| Minus ist schwarz wie jede andere Ziffer | `--signs`: „-312,40 €" in `rgb(45, 45, 45)`, identisch zum positiven Feld darunter | ✓ |
| Ersetzt das Betragsfeld in `ExtractionCorrectionCard.tsx` | Kein `AmountInput`-Import in `ludwig/app` (`grep`) | ✗ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): `parseAmount` hat `@when`/`@instead`.

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte: die 16 Fundorte in `ludwig/app` sind nicht umgestellt; `parseAmount` ist ein Export ohne `@when`/`@instead`; das Label erbt die Versalien aus `.v2field__label` (A2).
