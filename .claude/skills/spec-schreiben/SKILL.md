---
name: spec-schreiben
description: Eine Spec für eine UI-Komponente des Ludwig Design Systems schreiben — als Aufgabe unter docs/backlog/NNNN-<slug>.md mit Klasse, Zuschnitt, Schnittstelle, abgeleiteten Stories und Abnahmekriterien. Use when asked "schreib eine Spec", "spec für X", "Aufgabe anlegen", "was brauchen wir für Komponente Y", or before any new component is built. Entscheidet wiederverwenden/erweitern/neu und zerlegen/zusammenlassen nach festen Regeln; baut nichts.
---

# Spec schreiben

Eine Spec ist der Auftrag an den Entwicklungsagenten **und** die Messlatte des
Abnehmenden. Sie ist fertig, wenn ein Dritter ohne Chat-Verlauf bauen und ein
weiterer ohne Rückfrage abnehmen kann. Vorlage: `docs/backlog/TEMPLATE.md`.
Ablauf und Status: `docs/backlog/README.md`.

## 1. Bestand lesen, bevor etwas entschieden wird

| Frage | Wo |
|---|---|
| Gibt es das schon? | `grep -rn "@when" src/ui/v3` — die `@when`-Zeile ist der Fall, für den ein Export da ist |
| Was existiert für das Design-System? | Storybook-Baum (`pnpm build`, `storybook-static/index.json`) — was keine Story hat, gilt nicht als vorhanden |
| Was fehlt der App und wie oft? | `docs/v3-backlog.md` (gezählte Nutzung) |
| Welche Form hat die Entität schon? | `docs/ludwig/ui-repraesentationen.md` |
| Wie heißt das Ding? | `docs/ludwig/GLOSSARY.md` — englisch im Code, deutsch im Label |
| Welche Typen gibt es? | `src/ludwig/` — die App gibt das Datenmodell vor, nie lokal neu definieren |
| Welche Gestaltungsregel gilt? | `docs/design-guidelines.md` (V/L/T/Z/I), Prüfliste §9 |

Wartet in `src/ui/legacy/` ein Baustein dafür, ist die Aufgabe „einordnen",
nicht „neu bauen".

## 2. Klasse bestimmen

Ein Test: **„Ergäbe die Komponente auch in einer Versicherungs-App Sinn?"**

| Antwort | Klasse | Kennzeichen |
|---|---|---|
| Ja, unverändert | `primitives/` | kein Fachwort in Name, Props, Texten; nur Tokens und `v3.css`; Server-Component, wenn irgend möglich |
| Ja, sobald es dort einen Prüf- oder Schrittprozess gibt | `patterns/` | komponiert Primitives, kennt Prozessbegriffe (Schritt, Prüfung, Auswahl), kennt keine Entität, lädt nichts |
| Nein, nur mit genau dieser Entität | `entities/<entität>/` | Name = Entität + Form (Zeile, Karte, Feld, Editor …), Typen aus `src/ludwig/`, darf Patterns und Primitives komponieren |

Trägt eine Kandidatin ein Fachwort **und** soll Primitive sein, ist entweder
das Wort falsch (dann GLOSSARY-neutral benennen) oder die Klasse (dann
Entity). Beides in der Spec begründen.

## 3. Wiederverwenden, erweitern oder neu

In dieser Reihenfolge, die erste Regel, die greift, gilt:

1. **Ein `@when` deckt den Fall** → verwenden. Die Spec nennt den Export und
   ist damit meist keine Komponenten-Spec mehr, sondern eine Seiten-Aufgabe.
2. **Ein `@when` deckt ihn zu vier Fünfteln** → um **eine** Prop erweitern,
   wenn das Fehlende eine Designentscheidung ist, die wiederkommt (zwei
   geplante Verwendungen oder eine Design-Vorlage) und sich in der
   `@when`-Zeile in einem Halbsatz sagen lässt. Sonst an der Aufrufstelle
   komponieren.
3. **Neue Primitive** nur, wenn alles zutrifft: kein `@when` passt · kein
   Fachwort nötig · zwei Verwendungen heute (`docs/v3-backlog.md`) oder eine
   Design-Datei · aus vorhandenen Primitives nicht in ~15 Zeilen an der
   Aufrufstelle zu bauen.
4. **Neues Pattern**, wenn eine Komposition aus Primitives **eigenen
   Zustand oder Tastaturweg** trägt und auf mindestens zwei Screens vorkommt.
   Eine Komposition ohne eigenen Zustand ist keine Komponente, sondern Markup
   an der Aufrufstelle.
5. **Neue Entitäts-Form**, wenn `ui-repraesentationen.md` sie für diese
   Entität führt oder eine Seite sie braucht und keine vorhandene Form
   (Zeile, Karte, Detail, Editor …) sie abdeckt.

Die Spec schreibt hin, welche Regel griff. „Wäre praktisch" ist keine.

## 4. Zerlegen oder zusammenlassen

**Trennen**, sobald eines gilt:

- ein Teil wird woanders **allein** gebraucht (er bekommt sein eigenes `@when`)
- die Teile haben verschiedene Datenquellen oder ändern sich aus verschiedenen Gründen
- ein Teil braucht `"use client"`, der Rest nicht (`Row` ↔ `ClickRow`)
- die Story-Ableitung (§6) ergibt mehr als **10** Stories
- mehr als ~10 Props oder ~250 Zeilen

**Zusammenlassen**, wenn die Teile denselben Zustand teilen und nie getrennt
auftreten; Trennen würde nur Durchreich-Props erzeugen.

**Familie** (eine Datei, mehrere Exporte: `Card`/`CardHead`/`CardFoot`,
`Tabs`/`Segmented`), wenn die Teile nur miteinander Sinn ergeben und ein
gemeinsames Markup-Vokabular bilden. Die Datei heißt nach der Familie.

## 5. Schnittstelle

- Props **englisch**, Fachbegriffe mit dem englischen GLOSSARY-Namen; Labels
  bleiben deutsch (Kanzlei, Mandant), kommen aber als Prop oder Registry, nie
  als lokale Map.
- Typen aus `src/ludwig/`; ein Prop-Typ, den es dort nicht gibt, ist ein
  Befund für die App, keine lokale Definition.
- **Das Datenmodell der App hat Vorrang.** Die Interfaces in `src/ludwig/`
  sind die Vorgabe, nicht der Entwurf: eine Komponente, deren Props sich dort
  nicht bedienen lassen, ist falsch geschnitten — auch wenn eine
  Design-Vorlage sie so zeigt. Frei ist die **Darstellung**, nicht die
  Struktur. Weicht die Vorlage ab, nennt die Spec beides: was sie zeigt und
  welches Feld aus `src/ludwig/` es trägt.
- **Optionen ja, eigene Wahrheit nein.** Zusätzliche Props, Varianten und
  Formen darf das Set anbieten — gerade bei entitätsspezifischen Formen, wo
  die App heute nur eine Ansicht kennt. Sie sind Angebote auf demselben
  Datenmodell. Fehlt für eine Option ein Feld, ist das ein Befund für
  `ludwig/app`, keine lokale Erfindung und kein Grund, die Option zu
  streichen.
- Zwei Booleans, die sich ausschließen → ein Enum. Mehr als drei Booleans → Zuschnitt prüfen (§4).
- Daten und Loader kommen als Props. Die Komponente ruft nichts, lädt nichts,
  kennt kein Modul.
- Jede Prop bekommt in der Tabelle die Story, die sie beweist. Eine Prop ohne
  Story-Nachweis ist entweder überflüssig oder die Story fehlt.
- „Kann nicht" ist Teil der Schnittstelle: was die Komponente bewusst nicht
  tut (wie `JournalEntryEditor`: kein zweiter Satz je Ereignis).

## 6. Stories ableiten

Die Zahl der Stories folgt aus den Props, nicht aus dem Gefühl:

```
Stories = anwendbare Zustände (≤ 5)
        + 1 je Enum-Prop         (alle Werte nebeneinander, nicht je Wert eine)
        + 1 je Layout-Boolean    (detailBreit, inline …)
        + 1 je Callback          (Rundlauf mit useState)
        + 1 „im Einsatz"         (in Card/MasterDetail, mit realistischen Daten)
        + 1 Rand, falls die Komponente formatiert oder kürzt (lange Texte, 0, negativ, viele Einträge)
```

- **Zustände**: gefüllt · leer · leer nach Filter · lädt · Fehler (V9, T6).
  Nur die anwendbaren; jeder ausgeschlossene steht in der Spec **mit Grund**
  („Button lädt nicht — Pending trägt der `AktionsKnopf`").
- **Untergrenze** je Klasse: Primitive 3 · Pattern 4 · Entität je Form 3
  (gefüllt, leer, Fehler), Editor zusätzlich lädt und ungültig.
- **Obergrenze 10.** Darüber ist die Komponente zu groß → §4.
- Keine Kombinatorik: nicht `size × variant × tone`, sondern eine Story je Achse.
- Daten in Stories sehen echt aus (Musterfirma GmbH, 1.800,00 €, 26.08.2026),
  Typen aus `src/ludwig/`; keine „Lorem"-Werte, keine „Test 1".
- Titel `v3/<Stufe>/<Gruppe>/<Name>`; Gruppe = Barrel-Kommentar
  (Aktion, Navigation, Formular, Dialog, Fläche, Tabelle · Arbeitsfläche,
  Rahmen, Prüfen, Prozess · je Entität ihr Name). Story-Exportnamen englisch.

## 7. Abnahmekriterien

Zwei Blöcke. Der **feste** steht in der Vorlage und wird nicht gekürzt. Der
**variable** wird aus dieser Spec erzeugt, je Zeile prüfbar durch eine Story,
einen Befehl oder einen Blick:

- je Prop: „verhält sich wie Zeile n der Schnittstelle (Story X)"
- je Verhalten: Tastatur, Hover, Fokus mit der Story, die es zeigt
- je Ersatz: „ersetzt `<alt>` in `<Datei>` ohne Funktionsverlust"
- je Ausschluss: „tut bewusst nicht …, Aufrufer löst es mit …"

Ein Kriterium, das nur der Autor prüfen kann („fühlt sich richtig an"), ist keines.

## 8. Datei schreiben

1. Nächste Nummer: `ls docs/backlog | sort | tail -1`.
2. `docs/backlog/NNNN-<slug>.md` aus der Vorlage; jede Sektion gefüllt oder
   mit einem Satz gestrichen, warum sie nicht gilt.
3. Status `spec`. Quelle verlinken (`v3-backlog.md`-Zeile, Design-Datei, Anfrage).
4. Offene Fragen: höchstens **drei**, jede mit Default („ohne Antwort: …"),
   damit der Bau nicht wartet.

## Was dieser Skill nicht tut

Er baut nichts, ändert keinen Code und erfindet keine Begriffe. Fehlt ein
GLOSSARY-Eintrag oder ein Typ in `src/ludwig/`, steht das als Befund in der
Spec und geht an `ludwig/app`.

## Ergebnis an den Auftraggeber

Fünf Zeilen, dann der Pfad der Datei: Klasse · Regel aus §3, die griff ·
Zuschnitt · Zahl der Stories und warum · offene Fragen mit Default.
