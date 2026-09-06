# Kontenplan — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/accounts/page.tsx` (160 Z.) |
| Heute gebaut in | `modules/accounts/ui/` — `AccountsTable.tsx`, `AccountsGroupedTable.tsx`, `AccountsStats.tsx`, `AccountFilterForm.tsx`, `AccountClassBadge.tsx` |
| Entitäten | Konto (`docs/entitaeten/account.md`) |
| Baustein in v3 | noch keiner — Aufgabe **0062** `AccountRow` + `AccountList` |
| Fachliche Quelle | GLOSSARY F64 („der Kontenplan gilt je Wirtschaftsjahr"), `konten.md` R18 |
| Profil von / am | Claude, 2026-09-07 · gelesen: Route, die fünf UI-Dateien, Entitätsprofil §Listen |

## Job

> Wenn **die Kanzlei den Kontenrahmen eines Mandantenjahres prüft**, will
> **sie** **die Konten finden, die nicht stimmen — angelegt und nie bebucht,
> gebucht und nicht angelegt, falsch eingeordnet**, damit **die Buchungen des
> Jahres auf Konten laufen, die es geben soll**.

- **Fertig ist sie, wenn** sie weiß, welche Konten des Rahmens im Jahr
  gearbeitet haben und welche nicht — und keine Lücke offen ist, die eine
  Buchung später auf ein falsches Konto zwingt.
- **Misslungen ist die Seite, wenn** sie 41.570 Zeilen zeigt und die Rolle
  daraus nichts erkennt: 85 % der Konten haben **null** Buchungen, und eine
  Liste, in der Leerlauf und Arbeit gleich aussehen, ist ein Katalog, kein
  Prüfwerkzeug.

Der Umfang ist die eigentliche Ansage: **41.570 Konten je Mandant und Jahr.**
Niemand liest sie. Die Seite ist ein Suchwerkzeug mit einer Übersicht davor,
keine Tabelle mit Filter.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Wie groß ist der Rahmen, und wie viel davon lebt?" | Kopfzahlen: Konten gesamt · bebucht · ungenutzt · letzte Buchung | `AccountsStats` → `KpiRow` |
| 2 | „Wo ist das Konto, das ich suche?" | Volltext über Nummer und Name — **die häufigste Handlung** | `FilterBar` mit `search` |
| 3 | „Welche Klasse hat wie viele?" | Klassen-Aufriss (SKR 0–9) mit Zählern, als Filter | `FilterBar`, Achse `konto_typ` |
| 4 | „Was steht in der Zeile?" | Nummer, Name, Rolle, Buchungen, Kontostatus | `AccountRow` / `accountColumns()` |
| 5 | „Welche sind Karteileichen?" | Sortierung nach Buchungen ↑ und nach letzter Buchung | Sortierung über die URL |
| 6 | „Fehlt ein Konto, das der SKR kennt?" | Der Katalog-Zusatz (`scope=all`), Katalogzeilen erkennbar markiert | Prop am Spaltensatz |
| 7 | „Was liegt auf diesem Konto?" | Klick auf die Zeile → Kontoauszug | `AccountDrawer` bzw. Kontoseite |

Rang 1 und 2 stehen ohne Scrollen. Rang 3 ist ein Klick. Rang 4–6 sind die
Liste selbst. Rang 7 verlässt die Seite.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Nach Klasse gruppiert lesen statt flach (`view=grouped`) | geschätzt bei der Jahresprüfung, sonst nie | einen Schalter |
| Seitengröße ändern (heute 50) | selten | ein Feld im Pager |
| Den SKR-Katalog dazunehmen | bei der Einrichtung eines Mandanten | einen Schalter, der **sagt**, was er dazunimmt |

## Was hier nicht hingehört

- **Die Buchungen.** Sie sind der Kontoauszug — eine andere Liste mit einer
  anderen Grundgesamtheit; die Zeile verweist, sie zeigt nicht.
- **Anlegen und Ändern.** Konten kommen aus DATEV (`source = imported`,
  100 %). Was die Kanzlei hier tut, ist prüfen.
- **Der Saldo.** Er gilt je Jahr und je Quelle und braucht die Bewegungen —
  das ist die Kontoseite, nicht die Liste.

## Zweifel am heutigen Format

1. **Zwei Tabellen für eine Frage.** `AccountsTable` und
   `AccountsGroupedTable` sind derselbe Inhalt in zwei Bauten; die Gruppierung
   ist eine Anzeigeform, keine zweite Liste. Folgerung: **eine**
   Spaltendefinition, die Gruppierung wird eine Prop (`GroupRow` gibt es).
2. **Der Pager fehlt in der gruppierten Ansicht.** Wer gruppiert liest,
   bekommt keine Seiten — bei 41.570 Zeilen ist das kein Detail. Folgerung:
   die Gruppierung gruppiert die **Seite**, nicht den Bestand; der Pager
   bleibt.
3. **Die Spalte „Quelle" trägt nichts.** 100 % `imported`. Folgerung: sie
   verschwindet aus dem Standardsatz und kommt nur zurück, wenn der Katalog
   dazugenommen wird — dort unterscheidet sie tatsächlich zwei Dinge.
4. **85 % Nullen in der Buchungsspalte.** Eine Zahl, die fast immer 0 ist,
   sagt nichts, solange sie neben 41.569 anderen Nullen steht. Folgerung: die
   Voreinstellung der Liste zeigt **bebuchte** Konten; „alle" ist ein Klick.
   Das ist der Unterschied zwischen Katalog und Prüfwerkzeug.
5. **Der Leerfall ist ein Filterfall.** „Keine Konten gefunden — passe die
   Filter an" steht auch dann da, wenn der Mandant im Jahr keinen Rahmen hat.
   Folgerung: zwei Fälle, zwei Sätze (V9).

## Offene Fragen

1. **Ist die Voreinstellung „bebucht" oder „alle"?** *Ohne Antwort: bebucht*
   (Zweifel 4) — mit dem Vorratszähler daneben, damit die Einschränkung
   sichtbar ist.
2. **Bleibt die Gruppierung?** *Ohne Antwort: ja*, aber als Prop auf einer
   Liste, nicht als zweite Tabelle (Zweifel 1).
3. **Führt die Zeile in den Drawer oder auf die Kontoseite?** *Ohne Antwort:
   in den Drawer* — die Frage „was liegt drauf" ist eine Nachschlagefrage,
   und der Drawer (0068) ist dafür gebaut; die Seite bleibt als Fuß-Ausgang.
