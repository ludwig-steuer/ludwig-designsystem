# Backlog — Aufgaben, Specs, Abnahme

Eine Aufgabe ist **eine Datei**: `docs/backlog/NNNN-<slug>.md`. Sie trägt
Auftrag, Spec und Abnahme zusammen, damit nichts über drei Orte verstreut ist.
Vorlage: `TEMPLATE.md`. Nummern fortlaufend, nie wiederverwendet.

`docs/v3-backlog.md` ist die **Erhebung**: was der App fehlt, mit gezählter
Nutzung. Sie ist die Quelle für neue Aufgaben, aber keine Aufgabe selbst.

## Ablauf

| Schritt | Wer | Ergebnis |
|---|---|---|
| 0. Entität analysieren (nur `entities/`) | Skill `entitaet-analysieren` | Profil `docs/entitaeten/<slug>.md` mit bewerteten Datenpunkten und Formen-Empfehlung; von einem zweiten Agenten geprüft. Die Specs der Familie zitieren es als Quelle. |
| 0b. Seite verstehen (nur Views) | Owner oder Agent | Seitenprofil `docs/seiten/<slug>.md`: der Job der Seite in einem Satz, die Fragen der Rolle in ihrer Reihenfolge, was nicht hingehört, Zweifel am heutigen Format. Die View-Spec zitiert es; jedes Element muss einer Frage dienen. |
| 1. Spec schreiben | Skill `spec-schreiben` | Datei mit Klasse, Zuschnitt, Schnittstelle, Stories, Abnahmekriterien. Status `spec`. |
| 2. Freigeben | Owner | Spec gelesen, offene Fragen entschieden. Status `in Arbeit`. |
| 3. Bauen | Skill `v3-komponente` (Entwicklungsagent) | Komponente + Stories, `pnpm typecheck` und `pnpm build` grün. Status `Abnahme`. |
| 4. Abnehmen | zweiter Agent oder Owner | Jedes Kriterium mit Nachweis in der Tabelle „Abnahme". Status `fertig` oder zurück auf `in Arbeit`. |

Wer baut, nimmt nicht selbst ab. Der Abnehmende liest die Spec, nicht den Chat.

**Kriterien, die auf `ludwig/app` zielen** („ersetzt `<alt>` in `<Datei>`"),
werden hier **nicht** erfüllt — dieses Repo ist das ausgelagerte
Design-System, die Ablösung in der App ist ein eigener Schritt. Der Skill
`v3-komponente` überspringt aus demselben Grund schon zwei Punkte der festen
Prüfliste (§9: „ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt"); für die
variablen Kriterien gilt dasselbe. Der Abnehmende trägt sie als **offen (App)**
ein, nicht als ✗, und der Status kann trotzdem `fertig` werden. Sonst bliebe
jede Aufgabe hier hängen, bis die App migriert ist — und die wartet auf die
Bausteine.

**Befunde an `ludwig/app` gehören zusätzlich nach `docs/befunde-app.md`.** Sie
bleiben in ihrer Spec oder ihrem Entitätsprofil stehen — dort stehen sie im
Zusammenhang —, aber wer sie dort einträgt, trägt sie auch ins Register: eine
Zeile, mit Quelle. Das Register ist die Übergabe an den Entwicklungsagenten
der App; verstreut über zwanzig Aufgaben ist ein Befund für ihn unauffindbar.
Dasselbe gilt für die Kriterien „offen (App)": ihre Ablösung steht dort in
Abschnitt E. Wer einen Befund drüben erledigt, streicht ihn hier und nennt
den Commit.

## Wer nachzieht, wenn die Spec zurückbleibt

**Beobachtung aus der Abnahmewelle vom 2026-09-08: in acht von acht schlanken
Abnahmen war der Hauptfund derselbe — die Spec beschrieb nicht mehr, was
gebaut war.** Nie ein Fehler im Verhalten: eine Prop mehr im Code als in der
Tabelle, ein Union-Wert zu wenig, eine Rechnung, die ihr eigenes Ergebnis
verfehlt. In 0103 nannte die Schnittstellen-Tabelle einen Baustein, den es nie
gegeben hat.

Das ist kein Versäumnis einzelner Runden, sondern eine Lücke im Ablauf: der
Bau darf von der Spec abweichen (er findet Dinge, die beim Schreiben niemand
sah), aber niemand war verpflichtet, sie zurückzuschreiben. Deshalb:

- **Wer baut, zieht die Schnittstellen-Tabelle mit.** Eine Prop, die anders
  heißt oder dazukommt, gehört in dieselbe Änderung — nicht in die Abnahme.
  Der Bau endet nicht am Typcheck, sondern an der Spec.
- **Wer abnimmt, prüft die Tabelle Zeichen für Zeichen** gegen den Code und
  meldet jede Abweichung als Mangel, auch wenn das Gebaute stimmiger ist als
  das Geschriebene. Welches von beiden nachgibt, entscheidet die Nacharbeit.
- **Bis eine Spec einen Nacharbeitsabschnitt mit Datum trägt, gilt der Code.**
  Das ist die Lesehilfe für alle, die von außen gegen das Set bauen.

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
