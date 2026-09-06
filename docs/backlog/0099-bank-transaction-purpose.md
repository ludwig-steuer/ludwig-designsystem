# 0099 · BankTransactionPurpose — der Verwendungszweck, lesbar

| | |
|---|---|
| Status | in Arbeit — freigegeben 2026-09-06, Entscheide und Pflichtänderungen im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` — erste Datei dieser Familie |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: SEPA-Tags sind der Zahlungsverkehr dieser Domäne, und die sieben Schlüssel sind ihr Vokabular |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionPurpose`; Ränge 1 und 11 |
| Ersetzt | `modules/bank-transactions/ui/PurposeDisplay.tsx` (174 Z.) samt `src/styles/purpose.css` — benutzt in **fünf** Dateien und **zwei** Modulen |
| Blockiert | `BankTransactionCell` (0100), `BankTransactionRow` (0101), `BankTransactionFacts` (0102) — alle drei zeigen den Zweck |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Der Rohwert einer SEPA-Zahlung ist für Menschen unlesbar:

```
EREF+NOTPROVIDED MREF+ZR17631 CRED+DE8811100000108092
SVWZ+SKS ABR.648346 29.01.26
```

**90 % der Positionen** tragen mindestens eine Referenz (1156 von 1281).
Angezeigt gehört der SVWZ-Freitext; die Referenzen gehören daneben, greifbar,
aber nicht als Erstes. Der unveränderte Originalblock bleibt erreichbar —
nichts geht verloren, es ist nur nicht mehr das, was zuerst ins Auge fällt.

Das ist **Rang 1** der Entität, und es ist die einzige Stelle der Familie,
an der die App schon eine geteilte Komponente hat. Sie wandert fast
unverändert; was diese Spec ändert, ist der Ort und die Reichweite.

## Einordnung

- **Wiederverwenden:** `LongText` kürzt, `Badge` trägt einen Chip, `Popover`
  öffnet das Original, `Kbd` zeigt die Taste. Was fehlt, ist die Zerlegung —
  und die ist keine Darstellung, sondern eine Ableitung.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — die Form gehört der Entität,
  fünf Dateien in zwei Modulen brauchen sie, und keine vorhandene Form deckt
  sie ab. Regel 3 greift nicht: sie trägt ein Fachwort (SEPA), also keine
  Primitive.
- **Zuschnitt:** eine Datei, ein Export plus die reine Ableitung
  `derivePurposeParts()` daneben in `purpose-parts.ts`. Die Trennung ist
  §4 Absatz 1: die Ableitung wird **allein** gebraucht — die Suche der Liste
  sucht über die Referenzwerte, ohne etwas zu zeichnen.
- **Setzt auf:** `LongText`, `Badge`, `Popover`, `ActionIcon` (`info`, 0087).

## Die sieben Schlüssel

Das Profil hat sie nachgezählt; die Reihenfolge ist die ihrer Häufigkeit,
und sie ist die Anzeigereihenfolge der Chips:

| Schlüssel | Bedeutung | Anteil |
|---|---|---|
| `EREF` | End-to-End-Referenz des Auftraggebers | 82 % |
| `KREF` | Kundenreferenz | 34 % |
| `MREF` | Mandatsreferenz (Lastschrift) | 31 % |
| `CRED` | Gläubiger-Identifikation | 30 % |
| `ABWA` | abweichender Auftraggeber | 11 % |
| `PURP` | ISO-20022-Zweckcode, als Wort („Miete", „Gehalt") | 3 % |
| `OAMT` | ursprünglicher Betrag | < 1 % |

`PURP` ist der einzige, der übersetzt wird (`PURP_LABELS`); die anderen sechs
sind Kennungen und bleiben, wie sie sind — mono, ungekürzt, kopierbar.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `purpose` | `string \| null` | ja | Der Rohwert aus der Spalte. `null` → „—" | `Inline`, `Empty` |
| `tags` | `SepaTags \| null` | nein | Beim Import geparste Tags (`raw_payload.parsed_sepa_tags`). Sie gewinnen gegen das Nachparsen — aber der Aufrufer darf sie weglassen, dann parst die Ableitung nach | `Block` |
| `variant` | `"inline" \| "block"` | nein, Default `inline` | `inline`: eine Zeile, Referenzen hinter dem (i). `block`: Freitext plus Chips darunter — für Fakten und Drawer | `Inline`, `Block` |

**Kann bewusst nicht:**

- **Den Originalblock verstecken.** Er ist über dasselbe (i) erreichbar wie
  die Referenzen. Was die Bank geschrieben hat, bleibt nachlesbar.
- **Suchen.** Die Suche gehört der Liste; sie ruft `derivePurposeParts()`
  und liest die Werte — deshalb ist die Ableitung eine eigene Datei.
- **Nachparsen erzwingen.** Sind `tags` gesetzt, gelten sie; das Nachparsen
  ist der Rückfall für Bestandsdaten, kein zweiter Weg.
- **Kürzen entscheiden.** Wie lang eine Zeile sein darf, weiß die Spalte.
  `inline` kürzt auf eine Zeile mit Ellipse, `block` kürzt nicht.

## Verhalten

Der Freitext steht als normaler Text, nie mono — er ist ein Satz und keine
Kennung (p50 35 · p90 84 · max 447 Zeichen). Die Referenzen sind Chips mit
Schlüssel und Wert; in `inline` liegen sie hinter einem (i), das per Tastatur
erreichbar ist und mit Enter öffnet (T8, V14). Das Original steht im selben
Popover, unter einer Überschrift und in mono.

Ist gar kein Tag-Block erkannt worden — 10 % der Zeilen —, gibt es kein (i):
der Rohwert **ist** der Freitext, und ein Info-Punkt ohne Inhalt wäre ein
Versprechen ohne Deckung.

Zustände: gefüllt mit Tags · gefüllt ohne Tags · leer (`purpose = null`).
Lädt und Fehler gibt es nicht.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionPurpose`. Abgeleitet
nach §6: 3 anwendbare Zustände + 1 Enum (`variant`) + 0 Callbacks + 1 „im
Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Inline` | Eine Zeile mit Ellipse, Referenzen hinter dem (i); Tastatur öffnet es |
| `Block` | Freitext plus sechs Chips darunter, `PURP` als Wort übersetzt |
| `WithoutTags` | Ein Zweck ohne Tag-Block: kein (i), der Rohwert ist der Text |
| `Empty` | `purpose={null}` → „—" |
| `Raw` | Rand: 447-Zeichen-Rohblock — inline eine Zeile, im Popover vollständig und mono |
| `InUse` | In einer `Table` als breiteste Spalte neben Datum, Gegenpartei und Betrag |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Eine Referenz kopieren | `onCopy?: (key: string, value: string) => void` am Chip | jemand tippt eine EREF von Hand ab |
| Treffer der Volltextsuche hervorheben | `highlight?: string` | die Liste bekommt Serversuche über die Referenzwerte |

## Befunde für `ludwig/app`

- **B1 (L-56)** — Die Ableitung fehlt im Spiegel. `src/ludwig/modules/bank-transactions/domain/`
  existiert, trägt aber nur die **Import**-Seite; `extractSepaTags()`,
  `derivePurposeParts()` und `PURP_LABELS` liegen in `ui/` bzw.
  `infrastructure/`. Das Set definiert sie deckungsgleich lokal.
- **B2 (L-59)** — `KontoauszugView` benutzt `PurposeDisplay` **gar nicht**:
  die Hauptliste rendert `deriveSepa(row).text` als nacktes `<span>`, ohne
  Chips und ohne Zugang zum Originalblock. Bei 90 % Referenz-Anteil heißt
  das: der Auszug verschluckt sie. Der Umzug behebt es nebenbei — deshalb
  steht `KontoauszugView` unter „Ersetzt" der Zeile (0101), nicht hier.

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

- [ ] Der Rohblock erscheint **nie** als Erstes; sichtbar ist der SVWZ-Freitext (Story `Raw`)
- [ ] Alle sieben Schlüssel werden erkannt und in der Reihenfolge oben gezeigt; `PURP` als Wort (Story `Block`)
- [ ] Ohne erkannten Tag-Block gibt es **kein** (i) (Story `WithoutTags`)
- [ ] Das Original ist über dasselbe (i) erreichbar wie die Referenzen (Story `Inline`)
- [ ] Das (i) ist per Tastatur erreichbar und öffnet mit Enter (Story `Inline`)
- [ ] `derivePurposeParts()` steht in einer eigenen Datei und rendert nichts (`grep`: kein JSX darin)
- [ ] Gesetzte `tags` gewinnen gegen das Nachparsen (Story `Block` gegen `WithoutTags`)
- [ ] Der Freitext steht nicht mono (Story `Inline`)
- [ ] offen (App): ersetzt `PurposeDisplay.tsx` und `purpose.css` in fünf Dateien; `KontoauszugView` bekommt sie überhaupt erst (L-59)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Chips oder Definitionsliste für die Referenzen im `block`? *Ohne Antwort:
   Chips, wie heute — sechs Kennungen untereinander wären eine Tabelle für
   Werte, die niemand vergleicht.*
2. Gehört `OAMT` (ursprünglicher Betrag, < 1 %) überhaupt gezeigt? *Ohne
   Antwort: ja, aber als letzter Chip. Wo er steht, erklärt er eine
   Betragsabweichung — genau die Frage, die sonst offen bliebe.*
3. Kürzt `inline` auf eine Zeile oder auf eine Zeichenzahl? *Ohne Antwort:
   auf eine Zeile mit CSS-Ellipse. Eine Zeichenzahl stimmt bei einer
   Grid-Spalte nie.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben.** Entscheide: 1 Chips · 2 `OAMT` als letzter Chip · 3 CSS-Ellipse. Ein Satz in die Spec: `PURP_LABELS` ist eine Code-Übersetzung der SEPA-Schlüssel, kein Status — sonst liest der Abnehmende das feste Kriterium „keine lokale Label-Map" als verletzt.
