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
- **Nur eigene Dateien stagen.** Hier arbeiten oft mehrere Sitzungen
  parallel — kein `git add -A`.
