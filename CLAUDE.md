# Ludwig Design System — Regeln für Claude

Die Hausregeln stehen in `README.md` („Ordnung im Set") und im Skill
`v3-komponente`. Hier nur, was jede Sitzung sofort wissen muss:

- **Code nur Englisch.** Bezeichner, Props, Typen, Kommentare, JSDoc
  (auch `@when`/`@instead`), Story-Exportnamen: Englisch. Deutsch
  ausschließlich in Strings, die Nutzer sehen (Labels, Texte,
  Storybook-Titel). Für Fachbegriffe steht der englische Name in
  `docs/ludwig/GLOSSARY.md`, der deutsche gehört ins UI. Bestehende deutsche
  Bezeichner werden nicht in Masse umbenannt; eine Datei, die ohnehin
  angefasst wird, bekommt englische Namen.
- **Erst Spec, dann bauen, dann fremde Abnahme.** Aufgaben liegen in
  `docs/backlog/` (eine Datei je Komponente). Skill `spec-schreiben` schreibt
  sie, `v3-komponente` baut danach, abgenommen wird gegen die Kriterien der
  Spec — nicht vom selben Agenten. Einer Entitäts-Familie geht
  `entitaet-analysieren` voraus (Profil in `docs/entitaeten/`).
- **Nur eigene Dateien stagen.** Hier arbeiten oft mehrere Sitzungen
  parallel — kein `git add -A`.
