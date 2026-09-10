# Ludwig Design System — Regeln für Claude

Die Hausregeln stehen in `README.md` („Ordnung im Set") und im Skill
`v3-komponente`. Hier nur, was jede Sitzung sofort wissen muss:

- **Code nur Englisch.** Bezeichner, Props, Typen, Kommentare, JSDoc
  (auch `@when`/`@instead`), Story-Exportnamen: Englisch. Deutsch
  ausschließlich in Strings, die Nutzer sehen (Labels, Texte,
  Storybook-Titel). Für Fachbegriffe steht der englische Name in
  `docs/ludwig/GLOSSARY.md`, der deutsche gehört ins UI. **Nie Deutsch im Quellcode** (Owner 2026-09-10) — auch nicht in Stories,
  Showcase, Fixtures, CSS-Klassen, Literal-Werten oder Dateinamen. Deutsch bleibt
  nur, was aus dem Datenmodell der App kommt (`src/ludwig/`, Registry-Achsen) —
  das ist ein Befund für die App — und Schlüssel fremder Datenformate in
  Beispieldaten.
- **Erst Spec, dann bauen, dann fremde Abnahme.** Aufgaben liegen in
  `docs/backlog/` (eine Datei je Komponente). Skill `spec-schreiben` schreibt
  sie, `v3-komponente` baut danach, abgenommen wird gegen die Kriterien der
  Spec — nicht vom selben Agenten. Einer Entitäts-Familie geht
  `entitaet-analysieren` voraus (Profil in `docs/entitaeten/`).
- **Nur eigene Dateien stagen.** Hier arbeiten oft mehrere Sitzungen
  parallel — kein `git add -A`.
