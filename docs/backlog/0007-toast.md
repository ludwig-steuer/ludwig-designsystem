# 0007 · Toast

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Handlung braucht eine Quittung |
| Quelle | `docs/v3-backlog.md` — „Danach": **keine Implementierung**, 43 Dateien mit Ad-hoc-Rückmeldung |
| Ersetzt | die inline gerenderten Erfolgsmeldungen in den 43 Dateien mit `useTransition` + eigenem `setMessage` |
| Blockiert | nichts hart — aber jede Handlung ohne sichtbares Ergebnis lässt die Nutzerin im Unklaren |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Wenn eine Handlung gelingt, deren Ergebnis man nicht sieht — ein Export
angestoßen, eine Mail verschickt, ein Stapel im Hintergrund gestartet — hat
Ludwig heute keinen Ort dafür. 43 Dateien behelfen sich mit einem `useState`
und einem Absatz, der irgendwo im Formular auftaucht und dort stehen bleibt.

## Einordnung

- **Wiederverwenden:** `Callout` („One sentence of context right where it is
  needed") und `StatusCallout` („State of a thing with reason and way out")
  sind **dauerhaft** — sie beschreiben einen Zustand, der besteht. Ein Toast
  ist flüchtig: er quittiert ein Ereignis und geht wieder. `Banner` (legacy)
  ist ebenfalls dauerhaft.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, und es gibt
  heute **null** Implementierung bei 43 belegten Behelfslösungen. Als Pattern
  (Regel 4) qualifiziert es sich ebenfalls: eigener Zustand (Warteschlange,
  Zeitablauf) — aber es kennt keine Prozessbegriffe, bleibt also Primitive.
- **Zuschnitt:** eine Datei, zwei Exporte als Familie: `ToastHost` (die
  Ablage, einmal je Seite) und `useToast` (der Weg, einen zu zeigen). Sie
  ergeben nur miteinander Sinn und teilen den Zustand (§4 „Familie").
- **Setzt auf:** nichts — eigenes Markup über Tokens, Icons aus Lucide.

## Schnittstelle

`ToastHost`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactNode` | ja | Der Seiteninhalt; der Host legt sich darüber | `InUse` |

`useToast()` liefert `show(toast)`:

| Feld | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `text` | `string` | ja | Was passiert ist, im Perfekt („Der Export wurde gestartet.") | `Filled` |
| `tone` | `"success" \| "warning" \| "danger"` | nein | Standard `success`; `danger` nur für Fehler (V6) | `Variants` |
| `action` | `{ label: string; onClick: () => void }` | nein | Ein Weg weiter („Stapel öffnen"), nie „Rückgängig" ohne echte Umkehr | `WithAction` |

**Kann bewusst nicht:** Fehler tragen, die eine Handlung betreffen — die
stehen am Knopf (`ActionButton`, 0004), wo die Nutzerin hinsieht. Ebenso
nicht: bestätigen (`Dialog`), dauerhaft informieren (`Callout`), oder mehr
als eine Handlung anbieten.

## Verhalten

`"use client"` — Warteschlange und Zeitablauf brauchen Zustand.

- **Ort:** unten rechts, über dem Inhalt, mit Abstand zum Rand. Nicht mittig:
  dort verdeckt er, was gerade passiert ist.
- **Dauer:** rund fünf Sekunden, dann verschwindet er von selbst. Mit `action`
  bleibt er, bis er geschlossen wird — sonst ist die Handlung nicht erreichbar.
- **Mehrere:** stapeln sich untereinander, der neueste unten; höchstens drei
  gleichzeitig, ältere weichen.
- **Schließen:** jeder Toast hat einen Schließen-Knopf mit Wort oder
  beschriftetem Icon (T8).
- **Tastatur und Screenreader:** der Host ist eine `aria-live="polite"`-Region;
  `danger` meldet `assertive`. Der Fokus springt nicht — ein Toast unterbricht
  nicht, was die Nutzerin gerade tut.
- **Bewegung:** einblenden und ausblenden ohne Springen (§2 „nichts wächst,
  nichts springt").

## Stories

Titel `v3/Primitives/Fläche/Toast`. Abgeleitet nach §6: 1 Zustand + 1 Enum
(`tone`) + 0 Layout-Booleans + 1 Callback (`show`, Rundlauf) + 1 „im Einsatz"
+ 1 Rand (drei gleichzeitig) + 1 mit Handlung = 6.

| Story | Beweist |
|---|---|
| `Filled` | ein Toast, ausgelöst über einen Knopf (Rundlauf mit `useToast`) |
| `Variants` | alle drei Töne untereinander |
| `WithAction` | bleibt stehen, Handlung führt weiter |
| `Stacked` | drei gleichzeitig, der älteste weicht |
| `InUse` | im `ToastHost` über einer Seite mit `PageHeader` und `Card` |
| `Persistent` | mit `action` — verschwindet nicht von selbst |

Nicht anwendbar: `Leer` (kein Toast ist kein Zustand, sondern nichts),
`Laedt` (ein Toast erscheint erst, wenn etwas fertig ist), `LeerNachFilter`.

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

- [ ] Ein Toast ohne `action` verschwindet nach etwa fünf Sekunden (Story `Filled`)
- [ ] Ein Toast mit `action` bleibt stehen (Story `Persistent`)
- [ ] Bei vier Auslösungen sind höchstens drei gleichzeitig sichtbar (Story `Stacked`)
- [ ] Der Host trägt `aria-live`; `danger` meldet `assertive` (Blick in die Datei)
- [ ] Der Fokus wandert beim Erscheinen nicht (Story `Filled`, mit Tastatur geprüft)
- [ ] Der Schließen-Knopf trägt ein Wort oder ein beschriftetes Icon (Regel T8)
- [ ] Texte stehen im Perfekt und nennen das Objekt (Regel T3)

## Offene Fragen

1. Fünf Sekunden oder länger? *Ohne Antwort: fünf — die Zielgruppe liest
   aufmerksam, aber der Toast soll nicht im Weg stehen.*
2. Soll `ActionButton` (0004) bei Erfolg automatisch einen Toast zeigen?
   *Ohne Antwort: nein — der Aufrufer entscheidet, ob das Ergebnis sichtbar
   ist. Ein Toast zu jeder Handlung wäre Lärm.*
3. Braucht es einen `info`-Ton? *Ohne Antwort: nein — was nur informiert und
   bleiben soll, ist ein `Callout`.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
