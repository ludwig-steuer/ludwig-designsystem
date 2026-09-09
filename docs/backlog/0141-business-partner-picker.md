# 0141 · `BusinessPartnerPicker` — einen Geschäftspartner auswählen

| | |
|---|---|
| Status | **in Arbeit** — freigegeben 2026-09-09 (Owner) |
| Stufe | `entities/business-partner/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Kreditor, Personenkonto, Diverse-Pool |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` (`geprüft`, 2026-09-09), Abschnitt „Formen", Zeile `BusinessPartnerPicker` |
| Ersetzt | `CreditorCombobox` im Ask-Dialog „Lieferant des Einzelsachverhalts" (`OffenePostenWorklist`) |
| Setzt voraus | `Combobox` (0084 — sucht selbst, weil sie die Nummer nicht findet) · **0139** `BusinessPartnerCell` für die Trefferzeile |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Es gibt genau eine Frage, für die der Partner ausgewählt wird: „wer ist der
Gegenpart?" Heute beantwortet sie eine `CreditorCombobox` im Ask-Dialog der
Offene-Posten-Liste; laut GLOSSARY braucht die Ausgangsrechnung denselben
Griff, um den Empfänger gegen die Partner aufzulösen.

**Die Schwierigkeit ist der Umfang.** 6.363 Partner im p90 — und die
Sachbearbeiterin hat meist eine **Kontonummer** vor sich, nicht einen Namen
(„wer ist 70123?" ist die Frage, die das Feld beantworten muss). Eine Auswahl,
die nach Nummern nicht findet, ist keine.

## Einordnung

- **Regel aus §3, die griff:** Nr. 5 — neue Entitäts-Form. `Combobox` nennt
  „partner" in ihrer `@when`-Zeile wörtlich, aber sie sucht nur über `label`
  und `value`; Kontonummer und Ort liegen im `hint`.
- **Zuschnitt:** eigene Datei `BusinessPartnerPicker.tsx`. Präzedenz sind
  `AccountField` (0013) und `CasePicker` — beide filtern **selbst** und
  reichen nur die Treffer weiter, aus genau diesem Grund.
- **Setzt auf:** `Combobox`, `MonoCell`, `BusinessPartnerCell`.

## Der Picker filtert, nicht die Combobox

Das ist die Entscheidung, die diese Spec von einer bloßen Verdrahtung
unterscheidet — und sie ist bei `CasePicker` schon einmal gefallen
(Owner-Freigabe 2026-09-07). `Combobox` grenzt über `label` und `value` ein.
Gesucht wird hier aber über **vier** Felder:

| Feld | Warum | Füllgrad |
|---|---|---|
| `legalName` | der Regelweg | 100 % |
| `shortName` | die Kanzlei kennt den DATEV-Kurznamen aus dem Buchungstext | 98 % |
| Kreditor- und Debitornummer | „wer ist 70123?" — der häufigste Anlass | 99,9 % tragen genau eine |
| `ustIds` | die eine Nummer, die eine Rechnung eindeutig macht | 0,7 % gesamt · 9 % der benutzten |

Der Ort (`city`) wird **nicht** durchsucht, sondern nur angezeigt: er
unterscheidet (er löst 35 % der Namensdubletten), aber niemand tippt ihn, um
einen Partner zu finden.

## „Ohne konkreten Lieferanten" ist eine gültige Wahl

Der Diverse-Pool ist kein Sonderfall, den man wegdrücken kann: es gibt Belege,
die keinem Stammsatz zugeordnet werden **sollen**. Der Picker führt ihn als
eigene, erste Option — nicht als leeren Wert und nicht als Abbruch, sondern als
Wahl mit einem Wort. `value: null` heißt „noch nichts gewählt", die
Diverse-Wahl heißt `"__diverse"`; die beiden auseinanderzuhalten ist der Punkt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Die Beschriftung des Felds — deutsch, vom Aufrufer | `Filled` |
| `value` | `string \| null` | ja | Die gewählte `businessPartnerId`, `"__diverse"` für den Pool, `null` für „noch nichts" | `Filled` |
| `onChange` | `(partnerId: string \| null) => void` | ja | Wählen und Abwählen; der Picker hält nichts | `Roundtrip` |
| `partners` | `readonly BusinessPartnerPickerItem[]` | ja | Die Kandidaten, vom Aufrufer sortiert und begrenzt | `Filled` |
| `onSearch` | `(query: string) => void` | nein | Sagt dem Aufrufer, wonach gesucht wird, damit er nachladen kann — bei 6.363 Zeilen ist das der Regelfall, nicht die Ausnahme | `Roundtrip` |
| `allowDiverse` | `boolean` | nein | Führt „Ohne konkreten Lieferanten" als erste Option. Vorgabe `false`: nicht jede Auswahl darf ins Leere zeigen | `Diverse` |
| `loading` | `boolean` | nein | Der Aufrufer lädt nach | `States` |
| `error` | `string` | nein | Die Suche ist gescheitert — der Satz steht am Feld, nicht in der Liste | `States` |
| `disabled` | `boolean` | nein | | `States` |
| `emptyText` | `string` | nein | Nichts passt zur Suche. Vorgabe „Kein Geschäftspartner mit diesem Suchbegriff." | `States` |
| `noPartnersText` | `string` | nein | Es gibt **gar keinen** Partner — ein anderer Satz als „kein Treffer": der erste ist ein Befund über den Bestand, der zweite ein Problem mit der Suche. Vorgabe „Für diesen Mandanten sind noch keine Geschäftspartner importiert." | `States` |

`BusinessPartnerPickerItem` ist ein Ausschnitt aus `BusinessPartnerListItem`:
`businessPartnerId`, `legalName`, `shortName`, `city`, `creditorAccount`,
`debtorAccount`, `ustIds`. Kein eigenes Modell — die Auswahl zeigt weniger als
die Liste, nicht anderes.

**Kann bewusst nicht:**

- **Laden.** Die Treffer kommen als Prop, die Suche geht als Callback hinaus.
- **Einen Partner anlegen.** „Nicht gefunden" ist kein Formular. Der Weg zum
  Anlegen ist das Onboarding, nicht ein Auswahlfeld — und seit **L-229** gibt
  es auf die Stammdaten ohnehin keinen Schreibpfad.
- **Nach Ort suchen.** Er steht als Unterscheider da und wird nicht gematcht.
- **Den Reifegrad zeigen.** 99,7 % `confirmed`; in einer Trefferzeile wäre das
  eine Marke, die nichts trennt.

## Verhalten

**Eine Trefferzeile** trägt den Namen (über `BusinessPartnerCell`, ohne
`href` — man wählt hier, man navigiert nicht), dahinter die Kontonummer `mono`
und, wo vorhanden, den Ort als leisen Unterscheider. Bei zwei Partnern
gleichen Namens ist das der Unterschied zwischen einer Auswahl und einem
Ratespiel.

**Leeren muss `onSearch` rufen.** Das war der Fehler in 0084: die `Combobox`
rief den Callback beim Leeren nicht, und es entstand ein Zustand, in dem
`value` gesetzt und das Feld leer war. Diese Spec erbt die Behebung und prüft
sie noch einmal, weil der Picker eigene Suche mitbringt.

## Stories

| Story | Beweist |
|---|---|
| `Filled` | Sechs Kandidaten: mit Kreditornummer, mit Debitornummer, mit beidem, ohne Konto, zwei mit gleichem Namen und verschiedenem Ort |
| `Roundtrip` | `useState` über `value`, `onChange` und `onSearch`: Suche nach Name, nach Kurzname, nach Kontonummer, nach USt-IdNr. — und Leeren, das `onSearch` ruft |
| `Diverse` | Mit `allowDiverse`: der Pool als erste Option, unterscheidbar von „noch nichts gewählt" |
| `States` | Lädt · Fehler · kein Treffer · gar keine Partner · gesperrt |
| `InUse` | Im Ask-Dialog eines `ActionButton` (0121) — genau der Ort, an dem `CreditorCombobox` heute steht |

## Ausbau

Ein **Vorschlag** aus dem Belegbestand („dieser Lieferant kommt 14-mal vor,
hat aber keinen Stammsatz") wäre der nächste Schritt — das ist heute die
`CreditorProposalsReview`, eine eigene Entität mit eigenem Profil. Sie käme als
optionaler Abschnitt über den Treffern, nicht als zweite Liste im selben Feld.

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

- [ ] Die Suche trifft über **vier** Felder: Name, Kurzname, Kontonummer,
      USt-IdNr. (`Roundtrip`, je ein Suchbegriff)
- [ ] Der Ort wird **nicht** gematcht (`Roundtrip`: ein Ortsname bringt keinen
      Treffer, obwohl er in der Zeile steht)
- [ ] Leeren ruft `onSearch("")`; danach ist kein Zustand möglich, in dem
      `value` gesetzt und das Feld leer ist (`Roundtrip`, gemessen)
- [ ] „Ohne konkreten Lieferanten" ist von `value: null` unterscheidbar
      (`Diverse`, Rundlauf zeigt beide)
- [ ] Zwei Leerfälle mit verschiedenen Sätzen (`States`)
- [ ] Die Trefferzeile trägt **keinen** `href` (`Filled`, DOM geprüft)
- [ ] Ersetzt `CreditorCombobox` in `OffenePostenWorklist` ohne Funktionsverlust

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
