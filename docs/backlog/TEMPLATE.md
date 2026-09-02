# NNNN · <Name der Komponente>

| | |
|---|---|
| Status | offen · spec · in Arbeit · Abnahme · fertig |
| Stufe | `primitives/` · `patterns/` · `entities/<entität>/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja/nein, ein Halbsatz |
| Quelle | `docs/v3-backlog.md` #n · Anfrage vom … · Design `<Datei>.dc.html` |
| Ersetzt | heutige Stellen in `ludwig/app` (Dateien / Vorkommen) |
| Blockiert | welche Aufgaben oder Seiten darauf warten |
| Spec von / am | Agent oder Person, Datum |

## Ziel

Ein Absatz: was die Sachbearbeiterin damit tut und was heute stattdessen
passiert. Kein Feature-Katalog.

## Einordnung

- **Wiederverwenden:** `@when`-Treffer in `src/ui/v3` und warum sie (nicht) reichen.
- **Neu oder erweitert, weil:** Regel aus `spec-schreiben` §3, die greift.
- **Zuschnitt:** eine Datei · Familie (mehrere Exporte, eine Datei) · getrennte
  Komponenten — und der Grund nach §4.
- **Setzt auf:** welche Primitives/Patterns komponiert werden.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `…` | `…` | ja/nein | ein Halbsatz | `Gefuellt` |

Typen aus `src/ludwig/…`: … · GLOSSARY-Begriffe: englisch im Code, deutsch im Label.
Was die Komponente **nicht** kann (bewusst): …

## Verhalten

Tastatur (Hauptweg, Taste sichtbar), Hover, Fokus, Zustände (gefüllt · leer ·
leer nach Filter · lädt · Fehler), Fehlertexte. Server- oder Client-Component
und warum.

## Stories

Abgeleitet nach `spec-schreiben` §6. Titel `v3/<Stufe>/<Gruppe>/<Name>`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Normalfall mit realistischen Daten |
| `Leer` | Leerzustand mit Grund und Ausweg |
| `Varianten` | alle Werte von `variant`/`tone` nebeneinander |
| `Interaktiv` | Rundlauf über `onSelect` |
| `ImEinsatz` | in `Card`/`MasterDetail`, wie auf der Seite |

Nicht anwendbare Zustände und warum: …

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

- [ ] Prop `…` verhält sich wie in Zeile … der Schnittstelle (Story `…`)
- [ ] Tastatur: … (Story `…`)
- [ ] Ersetzt … in der App ohne Funktionsverlust

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
