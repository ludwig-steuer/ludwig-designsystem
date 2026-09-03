# 0039 · CommandPalette — Befehl oder Seite, in einem Feld

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` — Gruppe Rahmen |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Anwendung hat Seiten und Handlungen |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §C1 (shadcn-Abgleich, Registry-Eintrag `command` = `cmdk` mit Klassen) |
| Ersetzt | nichts — die Top-Bar-Suche ist heute ein leerer Slot (`AppShell`, 0030) |
| Blockiert | die Füllung der Top-Bar; den schnellen Weg zwischen Schritten ohne Maus |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die Sachbearbeiterin arbeitet in einem Stapel und braucht die Kontenliste —
heute heißt das: Maus zur Seitenleiste, Abschnitt suchen, klicken. Ein Feld,
das mit `⌘K` von überall aufgeht, jede Seite und jede Handlung des Screens
listet und mit Enter dorthin springt, spart diesen Weg. Es ist ein
**Zusatzweg**: jede Seite steht weiter in der Navigation, jede Handlung
weiter auf ihrem Knopf (V14).

## Einordnung

- **Wiederverwenden:** `Combobox` (0009) wählt **einen Wert für ein Feld** und
  gehört ins Formular; `OverflowMenu` sind die Handlungen **eines Objekts**;
  `NavList` ist die stehende Navigation. Keiner deckt „alles, was diese
  Anwendung kann, in einem Feld".
- **Neu, weil:** §3 Regel 4 — die Komposition trägt **eigenen Zustand und
  eigenen Tastaturweg** (Suchtext, Auswahl, ⌘K) und kommt auf jedem Screen
  vor. Pattern statt Primitive, weil sie `useHotkeys` und die Ordnung von
  `NavSection` kennt; eine Primitive dürfte das nicht.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** `Dialog` (die Hülle), `Kbd` (0035), `InputGroup` (0036) an
  der Aufrufstelle, `useHotkeys` — und **`cmdk`**, die einzige neue
  Abhängigkeit dieser Sammelaufgabe (0034, Offene Frage 1: „ohne Antwort:
  ja"). Treffer-Sortierung, ARIA und Tastaturweg sind dort ~300 Zeilen, die
  niemand ein zweites Mal schreiben sollte; das transitive
  `@radix-ui/react-dialog` bleibt ungenutzt, die Hülle ist unser `Dialog`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | Der Aufrufer hält den Zustand | `Interactive` |
| `onOpenChange` | `(open: boolean) => void` | ja | Gegenstück zu `open`; `⌘K` und Escape melden hierüber | `Interactive` |
| `groups` | `CommandGroup[]` | ja | `{ title, items: CommandItem[] }` | `Filled` |
| `placeholder` | `string` | nein | Standard „Befehl oder Seite …" | `Filled` |
| `emptyText` | `string` | nein | Standard „Kein Treffer — kürzer suchen." | `NoMatch` |

```ts
type CommandItem = {
  id: string;
  label: string;
  hint?: string;      // die Zeile darunter: wohin es führt, was es tut
  icon?: ReactNode;
  key?: string;       // die Taste, wie sie auf dem Knopf steht — rechts als Kbd
  href?: string;      // ein Sprung: rendert einen Link
  onSelect?: () => void;  // eine Handlung
  keywords?: string[];    // unsichtbare Suchwörter („Kreditor" für Geschäftspartner)
};
```

Keine Typen aus `src/ludwig/`: das Pattern kennt keine Route und keine
Entität. Der Aufrufer bildet `NavSection[]` aus `NavList` auf Gruppen ab.

**Kann bewusst nicht:** serverseitig suchen (die Liste kommt vollständig),
sich zuletzt Gewähltes merken, verschachtelte Seiten („zurück" innerhalb der
Palette), Einträge selbst ausführen, die eine Bestätigung brauchen (das ist
`ActionButton` mit `ConfirmSpec`).

## Verhalten

`"use client"`.

- **Öffnen:** `Ctrl+K`/`⌘K` von überall — **auch aus einem Feld heraus**,
  weil eine Meta-Kombination kein Tippen ist. Das ist eine Änderung an
  `useHotkeys` (Befund in 0034): `meta`-Bindungen feuern trotz `isTyping`;
  Buchstaben ohne Meta bleiben im Feld stumm.
- **Sichtbarer Weg (V14):** die Top-Bar-Suche als `InputGroup` mit
  `<Kbd>⌘K</Kbd>`, die beim Klick öffnet (0034 sagte „beim Fokus" — siehe
  Befund unten) — Markup an der Aufrufstelle, Story `InUse` zeigt es.
- **Tippen** filtert und sortiert (cmdk), ↑↓ wandern, Enter springt oder
  führt aus und schließt, Escape schließt und gibt den Fokus zurück.
- **Sprung:** ein Eintrag mit `href` rendert ein `<a>`; Enter löst dessen
  Navigation aus (kein `location.href`, kein Router im Set) — damit
  funktionieren auch Mittelklick und „in neuem Tab öffnen".
- **Zustände:** gefüllt · kein Treffer. Leer, lädt und Fehler entfallen: die
  Liste kommt fertig vom Aufrufer.

## Stories

Titel `v3/Patterns/Frame/CommandPalette` (Gruppe „Rahmen", englischer
Storybook-Ordner wie `StepRail`). Abgeleitet nach §6: 2 Zustände + 0 Enum
+ 0 Layout-Boolean + 1 Callback + 1 „im Einsatz" + 1 Rand = 5.

| Story | Beweist |
|---|---|
| `Filled` | offen, mit Gruppen, Tasten und Hinweiszeilen |
| `NoMatch` | kein Treffer, mit Ausweg im Text |
| `Interactive` | `⌘K` öffnet, Enter wählt, das Ergebnis steht darunter |
| `InUse` | in `AppShell` mit `TopBar`-Suche, Gruppen aus `NavList` |
| `Edge` | 60 Einträge, lange Labels, Einträge mit und ohne `key` |

Nicht anwendbar: `Empty` (ohne Einträge öffnet der Aufrufer sie nicht),
`EmptyAfterFilter` (das ist `NoMatch`), `Loading`, `Error` (die Liste kommt
vollständig).

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

- [ ] `⌘K` öffnet die Palette, **auch mit dem Fokus in einem `Input`**
      (Story `InUse`)
- [ ] Ein Buchstabe ohne Meta löst im Feld weiterhin nichts aus
      (`useHotkeys` unverändert für „A", Story `v3/Patterns/Frame/HotkeyLegend`)
- [ ] Enter auf einem `href`-Eintrag ist eine echte Navigation (`<a>`), nicht
      `onClick` (DOM-Probe in `Filled`)
- [ ] Escape schließt und gibt den Fokus an den Trigger zurück (Story `InUse`)
- [ ] Kein Fachwort im Pattern
      (`grep -i "konto\|mandant\|beleg" src/ui/v3/patterns/CommandPalette.tsx` leer)
- [ ] `package.json` wächst um genau `cmdk`
      (`git diff package.json` zeigt eine Zeile mehr)
- [ ] `keywords` finden einen Eintrag, dessen Label das Wort nicht enthält
      (Story `Filled`: „Kreditor" findet „Geschäftspartner")

## Befund beim Bauen (2026-09-03)

**Der Fokus kam nach Escape nicht zurück** — `Dialog` setzt den Erstfokus,
gibt ihn aber nicht zurück (der Befund aus 0034 „Dialog ohne Fokusfalle").
Die Palette merkt sich den Trigger jetzt selbst, und zwar **während des
Renders** des öffnenden Frames: der Effect von `Dialog` ist ein Kind-Effect
und läuft vor dem der Palette — danach steht der Fokus schon im Panel.

**Die Top-Bar-Suche öffnet beim Klick statt beim Fokus** (Abweichung von
0034 §C1, „die beim Fokus öffnet"): mit Fokusrückgabe würde ein
Öffnen-beim-Fokus die Palette sofort wieder aufziehen, sobald Escape den
Fokus ins Feld zurückgibt. Der sichtbare Weg bleibt derselbe — Feld,
Lupe und `⌘K` stehen am Ort (V14). Das Feld ist `readOnly`; getippt wird in
der Palette.

**Grenze der Automatisierung, nicht der Komponente:** Tastendrücke mit
Modifier erreichen die ferngesteuerte Seite nicht (kein `keydown` im
Ereignis-Log). `⌘K` ist deshalb mit einem echten `KeyboardEvent` aus der
Seite heraus geprüft, mit dem Fokus im Suchfeld — mit demselben Aufbau ist
auch belegt, dass ein „k" **ohne** Meta im Feld nichts auslöst.

## Offene Fragen

1. Zeigt die Palette Gruppen-Überschriften auch beim Filtern? *Ohne Antwort:
   ja — cmdk blendet leere Gruppen selbst aus, und die Überschrift ist die
   Einordnung, die den Treffer erklärt.*
2. Bekommt jeder Eintrag ein Icon? *Ohne Antwort: nein, `icon` ist optional —
   ein halb gefülltes Icon-Raster ist unruhiger als keins.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
