# 0018 · Switch — erst entscheiden, ob Ludwig ihn will

| | |
|---|---|
| Status | offen |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Schalter ist fachfrei |
| Quelle | Soll-Katalog §11.7 Stufe 1 „Schalter (Toggle)"; Design-Kit `Toggle` |
| Ersetzt | nichts Belegtes — siehe Befund |
| Blockiert | nichts |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Soll-Katalog führt einen Schalter als fehlenden Baustein. Die Erhebung
trägt ihn nicht: **`role="switch"` kommt in der ganzen App 0-mal vor**, und
der einzige Kandidat — `ClientActiveToggle` — ist mit Absicht keiner. Sein
Kommentar sagt es selbst: „ein Klick mit klarer Beschriftung statt eines
Schalters, den man versehentlich streift".

Deshalb ist diese Aufgabe zuerst eine **Entscheidung**, kein Bau. Status
`offen`, nicht `spec`.

## Einordnung

- **Wiederverwenden:** `Checkbox` trägt jede Ja/Nein-Angabe, die mit dem
  Formular gespeichert wird. `Button` (mit `loading`, seit 0010) trägt die
  Sofort-Umschaltung mit Wort — das ist heute die einzige belegte Form.
- **Neu, nur wenn:** Regel 3 verlangt zwei Verwendungen **oder** eine
  Design-Vorlage. Das Kit hat einen `Toggle`, die App keine Verwendung. Eine
  Vorlage allein macht hier keinen Bedarf, weil Ludwigs Zielgruppe die App
  alle zwei bis vier Wochen öffnet: ein Schalter ohne Wort ist genau die
  Bedienform, die V11 und V14 vermeiden wollen.
- **Zuschnitt:** entfällt bis zur Entscheidung.

## Die Entscheidung

| Weg | Folge |
|---|---|
| **A — verwerfen** (Empfehlung) | Der Katalog streicht die Zeile. Sofort-Umschaltungen bleiben `Button` mit Wort und `loading`; Formularangaben bleiben `Checkbox`. Nichts zu bauen. |
| B — bauen | Es braucht zuerst zwei benannte Verwendungen in `ludwig/app`. Dann eine Spec mit `role="switch"`, Wort links, Pending-Zustand und der Regel, dass er nur folgenlose Einstellungen schaltet. |

Bis eine der beiden Zeilen entschieden ist, wird nichts gebaut.

## Schnittstelle

Entfällt — wird erst mit Weg B geschrieben.

## Verhalten

Entfällt — siehe oben.

## Stories

Entfällt — siehe oben.

## Abnahmekriterien

Fest (gilt immer): entfällt, solange nichts gebaut wird.

Variabel (aus dieser Spec):

- [ ] Entscheidung A oder B ist im Kopf dieser Datei eingetragen
- [ ] Bei A: die Katalogzeile §11.7 „Schalter (Toggle)" steht auf „—" mit Begründung
- [ ] Bei B: zwei Verwendungen in `ludwig/app` sind benannt, dann volle Spec

## Offene Fragen

1. Gibt es eine folgenlose Einstellung, die sofort greifen soll (z. B. eine
   Anzeige-Vorliebe)? *Ohne Antwort: nein — dann gilt Weg A.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
