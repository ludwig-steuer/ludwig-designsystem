# 0088 · Process auf die Icon-Registry

| | |
|---|---|
| Status | offen |
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
