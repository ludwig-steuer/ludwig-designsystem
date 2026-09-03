# 0036 · InputGroup — das Feld mit Beigabe

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Gruppe Formular, in der Familie `Form.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, eine Einheit am Feld ist fachfrei |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §A2 (shadcn-Abgleich, Registry-Eintrag `input-group`, ohne Abhängigkeit) |
| Ersetzt | die an der Aufrufstelle gebauten Einheiten-Felder („%", „Tage") und die nackte Suche in der Top-Bar |
| Blockiert | C1 `CommandPalette` (Top-Bar-Suche mit `⌘K`), die Steuersatz- und Fristfelder der Welle 1 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Ein Feld allein sagt nicht, was hineingehört: 19 ist kein Prozentsatz und 14
sind keine Tage, solange die Einheit nicht daneben steht. Heute baut das jede
Aufrufstelle selbst — ein `<span>` neben dem `Input`, mit eigenem Abstand,
eigener Ausrichtung und ohne gemeinsamen Fokusring. Die Suche der Top-Bar hat
denselben Fall: sie braucht die Lupe davor und die Taste `⌘K` dahinter, damit
der Weg sichtbar ist (V14).

## Einordnung

- **Wiederverwenden:** `Field` („Every input with label, hint and error text")
  trägt Label, Hinweis und Fehler **um** das Feld herum, nicht **an** ihm.
  `AmountInput` formatiert „1.800,00 €" in den Text und braucht keine Beigabe.
  `SearchInput` ist ein nacktes `<input type="search">`.
- **Neu, weil:** §3 Regel 3 — kein `@when` passt, kein Fachwort, zwei
  Verwendungen belegt (Top-Bar-Suche mit `⌘K` aus 0034 §C1, Einheitenfelder),
  und der Teil, der Arbeit macht, ist nicht das Flex-Layout, sondern der
  gemeinsame Fokusring und das Weiterreichen des Klicks ins Feld.
- **Zuschnitt:** kein eigener Dateikopf — der Export gehört in die Familie
  `Form.tsx` (§4: gemeinsames Markup-Vokabular mit `Field`, `Input`,
  `Select`; sie treten nie ohne einander auf).
- **Setzt auf:** `Input`/`SearchInput`/`AmountInput` als Kind, `Kbd` (0035)
  und `IconButton` als mögliche Beigaben — beides beim Aufrufer, nicht hier.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `prefix` | `ReactNode` | nein | Vor dem Feld: Icon oder Text; rein Dekoratives trägt `aria-hidden` beim Aufrufer | `Filled` |
| `suffix` | `ReactNode` | nein | Hinter dem Feld: Einheit, `Kbd`, ein `IconButton` | `Filled` |
| `children` | `ReactNode` | ja | Genau ein `Input`, `SearchInput` oder `AmountInput` | `Filled` |

Keine Typen aus `src/ludwig/` — die Gruppe trägt Darstellung, keine Fachdaten.

**Kann bewusst nicht:** Label, Hinweis und Fehlertext tragen — das ist `Field`
außen herum (I8: Label sichtbar, nie nur Placeholder); kein schwebendes Label;
keine zwei Felder in einer Gruppe (ein Zeitraum ist `DateRangeField`).

## Verhalten

Server-Component: kein Zustand. Das Feld bleibt das Feld — `name`,
`defaultValue`, `onChange` gehen unverändert an das Kind.

- **Klick:** ein Klick auf eine dekorative Beigabe setzt den Fokus ins Feld.
  Ohne JavaScript: die Gruppe ist ein `<label>`, das Klicks an sein Feld
  weitergibt.
- **Fokus:** der Fokusring umschließt die ganze Gruppe (`:focus-within`,
  2 px `--color-focus`), nicht nur das innere Feld — das innere Feld gibt
  seinen eigenen Rahmen und Ring dafür ab (V10, Ring bleibt sichtbar).
- **Ungültig:** `v2in--invalid` am inneren Feld färbt den Rand der Gruppe
  (`:has(.v2in--invalid)`); der Fehlertext bleibt bei `Field` (V7: Farbe nie
  allein).
- **Gesperrt:** `:has(:disabled)` graut die Beigaben mit.
- **Zustände:** kein Lade- und kein Fehlerzustand — beides trägt das Feld
  bzw. `Field`. Leer ist ein Feld ohne Eingabe, kein eigener Zustand.

## Stories

Titel `v3/Primitives/Formular/InputGroup`. Abgeleitet nach §6: 1 anwendbarer
Zustand + 0 Enum + 0 Layout-Boolean + 0 Callback + 1 „im Einsatz" + 1 Rand = 3.

| Story | Beweist |
|---|---|
| `Filled` | Lupe davor, „%" dahinter — beide Seiten am selben Feld |
| `InUse` | Top-Bar-Suche mit `<Kbd>⌘K</Kbd>`; Steuersatz-Feld in einem `Field` mit Fehler (Gruppe färbt mit) |
| `Edge` | langer Suffix „Tage nach Fälligkeit", dazu `disabled` |

Nicht anwendbar: `Empty`, `EmptyAfterFilter`, `Loading`, `Error` — die Gruppe
zeigt keine Daten, sie rahmt ein Feld; Fehler trägt `Field`.

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

- [ ] Klick auf die Beigabe setzt den Fokus ins Feld (Story `Filled`)
- [ ] Der Fokusring liegt an der Gruppe, nicht am inneren Feld (Story `Filled`,
      DOM/Screenshot)
- [ ] `invalid` am inneren Feld färbt die Gruppe (Story `InUse`)
- [ ] `disabled` am inneren Feld graut die Beigaben mit (Story `Edge`)
- [ ] Ein langer Suffix drückt das Feld zusammen, statt aus der Gruppe zu
      laufen (Story `Edge`)
- [ ] Server-Component: die Datei trägt kein `"use client"` für diesen Export

## Offene Fragen

1. Bekommt die Beigabe eine eigene Fläche (wie ein Add-on von Bootstrap) oder
   sitzt sie im selben Feldkasten? *Ohne Antwort: im selben Kasten, nur durch
   Abstand getrennt — eine zweite Fläche wäre ein zweiter Rand (§2, L2).*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
