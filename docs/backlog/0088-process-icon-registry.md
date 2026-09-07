# 0088 · Process auf die Icon-Registry

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` |
| Quelle | Abnahme von 0087 (fremder Agent, 2026-09-05), Mangel M6 · `docs/backlog/0087-icon-registry.md`, Befund B3 |
| Auftrag | `patterns/Process.tsx` zeichnet den Staffelstab („wer ist dran") mit einer eigenen Tabelle `OWNER_ICON`. Vier ihrer acht Einträge sind **Entitäten**, die die Registry benennt — und zwei davon mit einem anderen Zeichen: Kanzlei steht dort auf `Building2` (Registry: der **Geschäftspartner**), Mandant auf `UserRound` (Registry: der **Benutzer**; der Mandant trägt `Briefcase`). Zwei Bilder derselben Sache im selben Set — genau die Drift, gegen die 0087 gebaut wurde. |
| Warum nicht in 0087 erledigt | `Process` färbt seine Zeichen (`style={{ color: owner.color }}`) und nimmt eine freie `size`-Prop. `EntityIcon`/`ActionIcon` geben beides bewusst nicht her: Farbe kommt über `currentColor`, `size` nur aus der Leiter A8. Der Umzug ändert damit den **Vertrag von `Process`**, nicht den von 0087 — das ist eine eigene Aufgabe mit eigener Abnahme, kein Handgriff. |
| Zu entscheiden | (a) Trägt der Staffelstab überhaupt Entitäts-Zeichen, oder ist „wer ist dran" ein eigenes Vokabular wie `StateIcon`? (b) Wenn Entitäts-Zeichen: wie kommt die Farbe je Halter an das Zeichen, ohne dass `EntityIcon` eine `color`-Prop bekommt — Wrapper mit `currentColor`, wie es `StatusBadge` seit 0087 macht? (c) `strokeWidth 1.75` und die freie `size` gehen auf die Leiter. |
| Setzt voraus | 0087 abgenommen |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von 0087) |

Solange die Aufgabe offen ist, steht `Process.tsx` mit Begründung in der
Ausnahmeliste des Wächters (`scripts/check-icons.mjs`). Die Ausnahme ist ein
Vermerk, keine Absolution: sie fällt mit dieser Aufgabe.

## Erledigt 2026-09-06

**(a) Der Staffelstab ist ein gemischtes Vokabular — und das sagt er jetzt.**
Vier seiner acht Halter sind Entitäten, die die Registry benennt, und zwei
trugen hier ein **anderes** Zeichen: „Kanzlei" stand auf `Building2` (das
gehört dem Geschäftspartner), „Mandant" auf `UserRound` (das gehört dem
Benutzer). Die vier kommen jetzt aus der Registry:

| Halter | vorher | jetzt |
|---|---|---|
| Agent | `Bot` lokal | `ActionIcon action="agent"` |
| Mandant | `UserRound` | `EntityIcon entity="client"` (Briefcase) |
| Kanzlei | `Building2` | `EntityIcon entity="tenant"` (Stamp) |
| DATEV · Spiegel | `Database` lokal | `EntityIcon entity="datev-mirror"` |
| Übergabe | `Share2` lokal | `EntityIcon entity="bridge"` — **neuer Eintrag** |
| bereit | `Hourglass` lokal | `ActionIcon action="time"` |
| niemand | `Minus` | **kein Zeichen** |

„niemand" bekommt keins: die Abwesenheit eines Halters hat kein Bild, und ein
Strich, der so tut, ist schlechter als das Wort allein. „DATEV" und „Spiegel"
teilen sich einen Eintrag — es ist dasselbe System von zwei Seiten, und das
Wort daneben sagt, welche.

**(b) Die Farbe reitet auf der Klammer, nicht auf dem Zeichen.**
`EntityIcon` zeichnet in `currentColor` und nimmt keine `color`-Prop; die
Halter-Farbe steht jetzt am `<span>` darum — derselbe Weg, den `StatusBadge`
seit 0087 geht, und der Grund, warum die Registry geschlossen bleiben kann.
Gemessen: Klammer `rgb(26,58,92)`, SVG `rgb(26,58,92)`.

**(c) `size` ist aus der Schnittstelle verschwunden.** Es war eine freie Zahl
mit Vorgabe **13** — und 13 steht nicht auf der Leiter A8. Das Zeichen nimmt
jetzt 14 aus `EntityIcon`, `strokeWidth` 1,5 statt 1,75. Gemessen: `width=14`,
`stroke-width=1.5`.

**Die Ausnahme im Wächter ist gestrichen.** `scripts/check-icons.mjs` führt
`patterns/Process.tsx` nicht mehr; der Lauf ist grün.

## Prüfung 2026-09-07 (fremd, nicht der Bauende)

Die Datei trug bisher keinen Abnahme-Eintrag; dies ist er. Geprüft wurde der
**Bestand**, nicht die Commits: Storybook auf Port 6107 (Dev-Server, Katalog
aus `/index.json`, 717 Stories), Chromium headless bei 1440×900. Gemessen wird
das **gerenderte** Zeichen, nicht das Markup.

**Urteil: bestätigt.** Der Zustand von 2026-09-06 gilt heute unverändert; nichts
blieb offen.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` | `tsc --noEmit` ohne Ausgabe, **Exit 0** | ✓ |
| `pnpm build` | einmal gelaufen, **Exit 0** (Fehler steht nicht in der letzten Zeile, deshalb am Exit-Code geprüft). Danach vom Owner untersagt, weil hier mehrere Prüfer parallel im selben Baum arbeiten und ein Bau `storybook-static/` leert — genau der „Build-Flacker" aus 0117 | ✓ |
| `pnpm check:icons` / `pnpm check:contrast` | beide **Exit 0**; `check:icons` meldet „53 Zeichen in der Registry, 2 Datei(en) noch offen" — die zwei sind `SourceDocumentDrawer.tsx` und `JournalEntryEditor.tsx`, nicht `Process.tsx` | ✓ |
| Im Browser angesehen | `Process --holders`, `--in-header`, `--failed`, `--in-log` einzeln vermessen | ✓ |

**Die drei Entscheide**

| Kriterium | Nachweis (Story · Messwert) | Ergebnis |
|---|---|---|
| **(a) Die vier Entitäts-Halter kommen aus der Registry** | `v3-patterns-prozess-process--holders`, je Halter die Klasse des gerenderten `<svg>`: Agent → `lucide-bot`, Bereit → `lucide-clock`, Mandant → `lucide-briefcase`, Kanzlei → `lucide-stamp`, Übertragung → `lucide-share-2`, DATEV → `lucide-database`, Spiegel → `lucide-database`, Niemand → **kein `<svg>`**. `Building2` und `UserRound` kommen im ganzen Baustein nicht mehr vor | ✓ |
| **(b) Die Farbe reitet auf der Klammer** | Gemessen und **gegengeprobt**: im Bestand trägt jede Klammer ihre Halter-Farbe und das SVG dieselbe (Kanzlei `rgb(26,58,92)`, Mandant `rgb(140,96,30)`, DATEV `rgb(63,122,90)`). Dann zur Laufzeit `.pz-owner{color:rgb(1,2,3)}` ins Blatt gesetzt: **alle sieben SVG** melden `rgb(1,2,3)`; nach dem Entfernen wieder die Ausgangswerte. Die Zahl ist also gemessen, nicht zurückgelesen — das Zeichen erbt wirklich über `currentColor` | ✓ |
| **(c) `size` ist aus der Schnittstelle verschwunden** | `Baton` nimmt keine `size`-Prop mehr (`Process.tsx`), und keine Aufrufstelle reicht eine durch (`grep -rn "<Baton" src/` → sieben Stellen, keine mit `size`). Gemessen: jedes Halter-Zeichen `width=14`, `height=14`, `stroke-width=1.5` — im Stepper (`--in-header`), im Fehlerfall (`--failed`) und in der Halter-Übersicht gleich. Die Schleifen-Zeichen stehen auf 12, also ebenfalls auf der Leiter A8 | ✓ |
| **Die Ausnahme im Wächter ist gestrichen** | `scripts/check-icons.mjs` führt `patterns/Process.tsx` weder in `EXEMPT` noch in `PENDING`. Der Wächter ist **nicht** vakuum-grün: auf einer Kopie des Sets außerhalb des Repos (`scratchpad/pruef-icons/`) wieder `import { Building2, UserRound } from "lucide-react"` in `Process.tsx` gesetzt → `✗ patterns/Process.tsx importiert an der Registry vorbei: Building2, UserRound`, **Exit 1**. Unverändert: Exit 0 | ✓ |

**Der Mangel M1 einer früheren Runde (leere Klammer bei „niemand") trägt.**
`--holders`, x-Position des Wortes je Halter: alle acht auf **59 px** — auch
„Niemand", das kein Zeichen hat. Gegenprobe: die leere Klammer zur Laufzeit
ausgeblendet (`.pz-owner > span[aria-hidden="true"]{display:none}`) → „Niemand"
springt auf **40 px**, also **19 px** aus der Wortspalte, genau der Wert, den
der Kommentar an `OwnerSign` nennt. Nach dem Entfernen wieder 59.

**Zwei Kleinigkeiten, kein Mangel**

- Die Tabelle oben nennt den Halter „Übergabe" — so heißt der **Registry-Eintrag**
  (`bridge`, `label: "Übergabe"`). Das Wort im Bild kommt aus den Story-Daten
  und heißt dort „Übertragung" (`Process.stories.tsx:18`). Zwei Wörter für
  dieselbe Strecke; die Registry ist die, die zählt.
- `Process --in-log` zeigt `BatonBar`, nicht `Baton` — dort steht die Farbe als
  Balken und in der Legende, ohne Zeichen. Das ist so gebaut und kein Rückschritt.
