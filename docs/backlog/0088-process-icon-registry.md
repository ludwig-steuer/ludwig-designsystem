# 0088 · Process auf die Icon-Registry

| | |
|---|---|
| Status | Abnahme |
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
