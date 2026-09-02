# Backlog — Aufgaben, Specs, Abnahme

Eine Aufgabe ist **eine Datei**: `docs/backlog/NNNN-<slug>.md`. Sie trägt
Auftrag, Spec und Abnahme zusammen, damit nichts über drei Orte verstreut ist.
Vorlage: `TEMPLATE.md`. Nummern fortlaufend, nie wiederverwendet.

`docs/v3-backlog.md` ist die **Erhebung**: was der App fehlt, mit gezählter
Nutzung. Sie ist die Quelle für neue Aufgaben, aber keine Aufgabe selbst.

## Ablauf

| Schritt | Wer | Ergebnis |
|---|---|---|
| 1. Spec schreiben | Skill `spec-schreiben` | Datei mit Klasse, Zuschnitt, Schnittstelle, Stories, Abnahmekriterien. Status `spec`. |
| 2. Freigeben | Owner | Spec gelesen, offene Fragen entschieden. Status `in Arbeit`. |
| 3. Bauen | Skill `v3-komponente` (Entwicklungsagent) | Komponente + Stories, `pnpm typecheck` und `pnpm build` grün. Status `Abnahme`. |
| 4. Abnehmen | zweiter Agent oder Owner | Jedes Kriterium mit Nachweis in der Tabelle „Abnahme". Status `fertig` oder zurück auf `in Arbeit`. |

Wer baut, nimmt nicht selbst ab. Der Abnehmende liest die Spec, nicht den Chat.

## Status

`offen` → `spec` → `in Arbeit` → `Abnahme` → `fertig`. Der Status steht in
der Kopftabelle der Datei; `grep -l "| Status | offen" docs/backlog` listet,
was ansteht. Verworfene Aufgaben bekommen `verworfen` und einen Satz, warum.

## Was eine Spec leistet

- **Klasse** entscheiden: primitive, pattern oder entity — mit dem Test
  „Ergäbe das auch in einer Versicherungs-App Sinn?"
- **Wiederverwenden vor Bauen**: welche `@when`-Treffer es gibt und warum sie
  nicht reichen. Neue Primitives brauchen zwei Verwendungen oder eine Design-Vorlage.
- **Zuschnitt**: eine Datei, eine Familie oder getrennte Komponenten, mit Grund.
- **Schnittstelle**: Props englisch, Fachbegriffe aus dem GLOSSARY, Typen aus
  `src/ludwig/`, und je Prop die Story, die sie beweist.
- **Stories** aus den Props abgeleitet, nicht geraten (Formel im Skill).
- **Abnahmekriterien**, die ein Dritter ohne Rückfrage prüfen kann.

Die Regeln dazu stehen im Skill `spec-schreiben`; die Vorlage hält die Form.
