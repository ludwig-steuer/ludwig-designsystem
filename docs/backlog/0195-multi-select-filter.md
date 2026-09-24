# 0195 · MultiSelectFilter — Filter mit Mehrfachauswahl, Gruppen, Suche und Anzahl

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` (Gruppe Formular) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Schadensarten, Sparten, Sachbearbeiter als Filter über einer Liste |
| Quelle | Owner 2026-09-24: „erweitertes Dropdown … 1) Mehrfachauswahl 2) Gruppierungen 3) Suchfeld 4) links Text, rechts Badge oder andere Infos, z. B. Anzahl" · Nachsatz: „brauchen wir als Filter von Listen in der DataTable hauptsächlich", rechts „je nachdem beides möglich" · App-Anfrage app-6a 2026-09-24 (Belegart-Filter im Eingang, App a71a14c4) |
| Ersetzt | `apps/web/src/modules/document-inbox/ui/UploadInbox.tsx:556` — `FilterChips` für die Belegart, das nur eine Belegart wählen kann (`ponytail:`-Vermerk dort) |
| Blockiert | Belegart-Filter mit Mehrfachauswahl im Eingang (app-6a) |
| Spec von / am | Claude, 2026-09-24 |

## Ziel

Wer im Eingang nur Rechnungen und Gutschriften sehen will, öffnet über der
Liste „Belegart", hakt beide an und sieht rechts neben jeder Belegart, wie
viele Belege sie hat. Bei vierzig Konten tippt man „14" ins Suchfeld und
bekommt nur noch die Konten, die dazu passen, unter ihren Gruppenüberschriften.
Heute gibt es dafür Chips, die nur eine Belegart zulassen und bei einem großen
Set zu breit werden, oder ein natives `<select>` mit genau einem Wert.

## Einordnung

- **Wiederverwenden:** `FilterChips` (`@when` nach einer Dimension eingrenzen)
  wählt genau einen Wert (`active: string`) und zeigt jede Option als Chip.
  Bei 15 Belegarten bricht das die FilterBar um. `Combobox` (0009) hat Suche
  und Gruppen, ist aber ein Eingabefeld für **einen** Wert und hat rechts
  keine Spalte. `Popover` ist die Hülle, hat aber keine Liste darin. Das
  `Select` aus `Form.tsx` ist nativ und kann nur einen Wert.
- **Neu, weil:** Regel 3 (neue Primitive). Kein `@when` passt, es braucht
  kein Fachwort, es gibt zwei Vorlagen (Owner-Anfrage und App-Anfrage mit
  echtem Aufrufer), und Liste, Suche, Tastaturweg und Häkchen passen nicht
  in 15 Zeilen an der Aufrufstelle. `Combobox` um `multiple` zu erweitern
  wäre mehr als eine Prop (Wertetyp, Auslöser, Häkchen, rechte Spalte). Das
  ist Regel 2 nicht mehr.
- **Zuschnitt:** eine Datei `MultiSelectFilter.tsx`, ein Export. Auslöser und
  Liste teilen denselben Zustand und treten nie getrennt auf (§4
  zusammenlassen).
- **Setzt auf:** `Popover` (kontrolliert über `open`/`onOpenChange`), `cmdk`
  (`Command`, `Command.Input`, `Command.Group`, `Command.Item`; ist durch
  `CommandPalette` schon installiert, also keine neue Abhängigkeit), `Badge`,
  `formatCount`, `TextButton`.
- **Name:** so, wie ihn app-6a vorgeschlagen hat. Er sagt, wofür der Baustein
  da ist. Die Optionen heißen wie bei `FilterChips` (`key`, `label`,
  `count`), damit man in der App von den Chips umsteigen kann, ohne die
  Daten umzubauen.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | das Wort auf dem Auslöser und der Name der Liste („Belegart") | `Filled` |
| `options` | `readonly MultiSelectOption[]` | ja | die wählbaren Werte in der Reihenfolge des Aufrufers | `Filled`, `Groups` |
| `selected` | `readonly string[]` | ja | die gewählten `key`s; leer = kein Filter | `Filled`, `Empty` |
| `onChange` | `(keys: string[]) => void` | nein | bei jedem Häkchen mit der neuen Menge, in der Reihenfolge von `options` | `Interactive` |
| `name` | `string` | nein | Server-Formular: je gewähltem Wert ein `<input type="hidden" name value>`, landet als `?name=a&name=b` im Query-String | `ServerForm` |
| `searchPlaceholder` | `string` | nein | Vorgabe „Suchen …"; das Suchfeld erscheint ab **8** Optionen von selbst | `Groups` |
| `disabled` | `boolean` | nein | Auslöser gesperrt | `Empty` |

`MultiSelectOption`:

| Feld | Typ | Bedeutung |
|---|---|---|
| `key` | `string` | der Wert |
| `label` | `string` | links, eine Zeile, mit Ellipse gekürzt, voller Text im `title` |
| `count` | `number` | nein · rechts, `formatCount`, tabellarische Ziffern, rechtsbündig in einer Spalte; `0` in `text-subtle`, bleibt wählbar |
| `badge` | `ReactNode` | nein · rechts **vor** `count`, meist ein `Badge` oder `StatusBadge`; der Aufrufer baut ihn |
| `group` | `string` | nein · Überschrift, unter der die Option steht; Gruppen in der Reihenfolge ihres ersten Vorkommens |
| `hint` | `string` | nein · zweite Zeile in `text-subtle`, wird mit durchsucht (Kontonummer unter dem Namen) |

„Beides möglich" (Owner) heißt: `badge` und `count` sind zwei Felder und
keine gemeinsame `meta`-Stelle. Die Zahl formatiert und richtet der
Baustein aus, damit alle Zahlen untereinander stehen. Den Badge bringt der
Aufrufer fertig mit.

Typen aus `src/ludwig/`: keine. Der Baustein ist generisch, und die
Belegart-Labels kommen aus der App (`belegartLabel`).

**Kann nicht (bewusst):** nur einen Wert wählen (dafür `FilterChips`,
`Select` oder `Combobox`) · Werte selbst laden oder zählen, denn Optionen und
Zahlen kommen fertig vom Aufrufer · die Optionen umsortieren, denn gewählte
Einträge rutschen nicht nach oben und bleiben an ihrem Platz · eine ganze
Gruppe mit einem Klick wählen (siehe Ausbau) · die URL lesen, das tut die
Seite wie bei `FilterBar`.

## Verhalten

- **Client-Component** (Popover-Zustand, Suche). Im Server-Formular trägt
  `name` die Werte über versteckte Felder. Ausgelöst wird wie immer über
  `FilterBar.submitLabel`.
- **Auslöser:** ein Knopf mit Wort (T8) im Aussehen eines Feldes, dazu ein
  Chevron.
  - nichts gewählt: „Belegart: Alle"
  - ein Wert: „Belegart: Rechnung"
  - mehrere Werte: „Belegart: 3 gewählt"
  - Ist etwas gewählt, ist der Auslöser in `primary` umrandet. Das wird
    zusätzlich zum Wort gezeigt, nicht statt des Wortes (V7).
  - `aria-haspopup="listbox"`, `aria-expanded`.
- **Liste:**
  - Das Popover ist mindestens so breit wie der Auslöser und höchstens
    `--v3-menu-max` (Token, rund 20 rem).
  - Die Höhe ist gedeckelt, darunter wird gescrollt. Das Suchfeld bleibt
    oben stehen.
  - Jede Zeile hat links eine Checkbox, dann `label` (und `hint`), rechts
    `badge` und `count`. Die ganze Zeile ist die Trefferfläche.
  - Die Zeilen haben `role="option"` und `aria-selected`, die Liste
    `aria-multiselectable="true"` (so liefert es `cmdk`).
- **Suche:**
  - Sie filtert lokal über `label` und `hint`.
  - Gruppen ohne Treffer fallen weg.
  - Gibt es gar keinen Treffer: „Keine Treffer für „xy"." (T6).
  - Die Suche leert sich beim Schließen.
- **Fuß:** „Alle anzeigen" setzt die Menge auf leer. Der Knopf erscheint nur,
  wenn etwas gewählt ist.
- **Tastatur:**
  - Enter, Leertaste oder ↓ auf dem Auslöser öffnen die Liste. Der Fokus
    liegt dann im Suchfeld, oder auf der ersten Zeile, wenn es kein
    Suchfeld gibt.
  - ↑↓ gehen durch die Zeilen, Enter und Leertaste haken an oder ab. Die
    Liste bleibt dabei offen.
  - Esc schließt die Liste und gibt den Fokus an den Auslöser zurück.
  - Tab schließt die Liste.
- **Wann wirkt es:** `onChange` feuert bei jedem Häkchen. Die Liste hinter
  dem Popover filtert sich also sofort. Das ist der Fall im Eingang, wo auf
  dem Client gefiltert wird.
- **Leer:** Ohne Optionen ist der Auslöser gesperrt und zeigt „Belegart:
  keine Werte".
- **Zustände:** gefüllt · leer (keine Optionen) · leer nach Filter (Suche
  ohne Treffer). **Lädt** fällt weg, denn die Optionen kommen mit der Seite,
  und ein Filter, der erst lädt, ist ein Fall für den Ausbau (`onSearch`).
  **Fehler** fällt weg, denn der Baustein tut nichts, was scheitern kann.

## Stories

Titel `v3/Primitives/Formular/MultiSelectFilter`.

| Story | Beweist |
|---|---|
| `Filled` | Belegart mit 6 Optionen und Anzahl, 2 gewählt, Liste offen, kein Suchfeld (< 8) |
| `Empty` | keine Optionen → gesperrt; daneben `disabled` mit Werten |
| `Groups` | 40 Konten in drei Gruppen (Bank, Kasse, Kreditkarte) mit Nummer als `hint`, Suchfeld sichtbar |
| `NoMatch` | Suche „zzz" ohne Treffer → Leertext |
| `Meta` | nebeneinander: nur `count`, nur `badge`, beides, keins; `count` 0 und 12.345 |
| `Interactive` | Rundlauf mit `useState`, gewählte Keys darunter ausgegeben, Auslöser-Text für 0/1/n |
| `ServerForm` | in `<form method="get">` mit `FilterBar.submitLabel`, der Query-String wird nach dem Absenden angezeigt |
| `InUse` | FilterBar mit `SearchInput`, `FilterChips` (Status) und `MultiSelectFilter` (Belegart) über einer `DataTable` mit Eingangsdaten, die Zeilen filtern live |
| `Edge` | 200 Optionen, Label mit 80 Zeichen (Ellipse und `title`), schmaler Auslöser in einer engen FilterBar |

Neun Stories, das ist unter der Grenze von 10. Enum-Props gibt es keine,
deshalb auch keine Varianten-Story.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Suche auf dem Server bei sehr vielen Werten | `onSearch?: (q) => void` + `loading?` wie `Combobox` | ein Filter mit > 500 Werten (Geschäftspartner) |
| ganze Gruppe wählen | `onChange` bleibt; Kopfzeile je Gruppe mit Tri-State | ein Screen fragt danach |
| erst beim Schließen wirken (ein Server-Rundlauf statt vieler) | `commit?: "change" \| "close"` | ein URL-Filter macht bei jedem Häkchen einen Request, der spürbar ist |
| Einzelauswahl mit Anzahl in derselben Optik | `single?: boolean` | ein Filter mit > 8 exklusiven Werten, für den Chips zu breit sind |

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

- [ ] Auslöser zeigt „Alle" / den einen Wert / „n gewählt" (Story `Interactive`)
- [ ] `count` steht rechtsbündig untereinander, `0` gedämpft, 12.345 mit Punkt (Story `Meta`)
- [ ] `badge` steht vor `count`, beide zusammen in einer Zeile ohne Umbruch (Story `Meta`)
- [ ] Suchfeld erst ab 8 Optionen; filtert über `label` und `hint`; leere Gruppen fallen weg (Story `Groups`)
- [ ] Suche ohne Treffer zeigt den Leertext mit dem Suchwort (Story `NoMatch`)
- [ ] Tastatur: öffnen mit ↓, Häkchen mit Leertaste, Liste bleibt offen, Esc gibt den Fokus an den Auslöser zurück (Story `Filled`)
- [ ] `name` erzeugt `?name=a&name=b` beim Absenden (Story `ServerForm`)
- [ ] `onChange` liefert die Keys in der Reihenfolge von `options`, nicht in der Klick-Reihenfolge (Story `Interactive`)
- [ ] Ersetzt `FilterChips` für die Belegart in `UploadInbox.tsx:556` ohne Funktionsverlust (Anzahl je Belegart, „Alle")
- [ ] Tut bewusst nicht: umsortieren, laden, einzeln wählen — `@instead` nennt `FilterChips`/`Combobox`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. **Wirkt der Filter sofort oder erst beim Schließen?** Ohne Antwort: sofort.
   So filtert der Eingang auf dem Client, und so hat es app-6a erbeten.
   Das Schließen als Auslöser steht im Ausbau.
2. **Wo steht der Knopf zum Leeren?** Ohne Antwort: im Fuß der Liste als
   „Alle anzeigen". Kein × am Auslöser, denn das wäre ein zweites Ziel auf
   einem Knopf.
