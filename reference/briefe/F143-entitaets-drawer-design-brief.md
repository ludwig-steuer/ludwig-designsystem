# F143 — Design-Brief: Der Entitäts-Drawer als Präsentationsform des v2-Sets

**Stand:** 2026-09-03 · **Owner:** Simon Fakir · **Adressat:** claude design ·
**Status:** Entwurf, §7 wartet auf Owner-Entscheid. Begriffe nach
`GLOSSARY.md`; Regeln, die hier zitiert werden: `docs/topics/web-ui.md` R15
(Drawer) und R21 (Stufen), `docs/ludwig-UX-guidelines-v2.md` (Designsprache),
`docs/reference/datenmodell/ui-repraesentationen.md` §4.4 (Entitäts-Familie).

**Einordnung (Owner 2026-09-03):** Wir arbeiten am **Component-System v3**.
In `apps/web` werden bis dahin **keine neuen UI-Komponenten** gebaut — der
Drawer kommt als **v3-Baustein** aus dem Designsystem, und die Seiten werden
danach daraus zusammengesetzt. Dieser Brief beschreibt deshalb, was das
Designsystem liefern soll, nicht was die App implementiert. Das Bestehende
(`ui/components/primitives/Drawer.tsx`, sechs gebaute Drawer) ist **Beleg für
den Bedarf und Inhalts-Vorlage**, keine Grundlage, die weitergepflegt wird.

## 0. Die Entscheidungen, die diesem Brief zugrunde liegen

| Frage | Entscheidung (steht, nicht neu verhandeln) |
|---|---|
| Was ist ein Drawer bei Ludwig? | Ein **Slide-over von rechts**, der eine **fremde Entität** zeigt, während man an einer anderen arbeitet. Der Kontext dahinter bleibt sichtbar. Kein Modal, keine Seite. |
| Größe oder Präsentation? | **Präsentation.** Die Entitäts-Familie hat die Größen S (`Cell`) · M (`Row`/`Card`) · XL (`View`); der Drawer ist keine vierte Größe, sondern eine **Hülle um XL-Inhalt** an einem anderen Ort (Inventar §4.4). |
| Wie heißt er? | `<Entität>Drawer`, deutscher Entitätsname der Familie (R15). Ausnahmen: zweite Wahrheit derselben Entität trägt die Herkunft vorn (`DatevBuchungssatzDrawer`), reine Technik-Sicht die Sicht (`RawRowDrawer`). |
| Was steht drin? | Kopf = wie die Entität heißt, darunter die Kennung · Körper = das Original zuerst und groß, dann die Kern-Fakten **aus derselben Komponente wie die Vollansicht**, dann eine Zeile, was der Schnellblick *nicht* beantwortet · Fuß = **genau eine** Aktion: der Weg in die Vollansicht. |
| Darf er schreiben? | **Nein.** Ein Entitäts-Drawer ist lesend. Wer ändern will, geht in die Vollansicht. (Schreibende Slide-over gibt es — Editoren wie `ManualBookingDrawer` —, die sind screen-lokal und **nicht** Gegenstand dieses Briefs.) |
| Vier Zustände | lädt · Fehler (mit der Kennung im Text) · nicht gefunden · Inhalt. Alle vier trägt der Drawer selbst, ein Wächter-Test prüft zwei davon strukturell. |
| Referenz | Der **`BelegDrawer`** ist gebaut und gilt als das Muster (`apps/web/src/ui/drawers/BelegDrawer.tsx`). Er wird nicht neu erfunden, sondern in v2-Optik übersetzt. |

## 1. Kontext — was der Gestalter wissen muss, ohne andere Dokumente zu lesen

**Ludwig** ist die Buchhaltungs-Assistenz für Steuerkanzleien: Belege und
Kontoauszüge laufen ein, ein KI-Agent bündelt sie zu **Sachverhalten** und
schlägt **Buchungssätze** vor, die **Buchhalterin der Kanzlei** prüft und gibt
frei. Sie arbeitet am 24-Zoll-Schirm (≥ 1280 px sind Pflicht, kein Mobile),
ist DATEV-geprägt und denkt in Konto | Gegenkonto | Betrag | BU | Belegfeld 1.

**Warum es Drawer gibt:** Fast jede Prüfung stellt mitten in der Arbeit eine
Frage nach einer *anderen* Entität — „wie sah der Beleg dazu aus?", „was liegt
sonst noch auf 6815?", „was steckt hinter dieser Auszugszeile?". Die Antwort
ist ein Blick, keine Reise: Die Liste, in der sie steht, darf nicht verloren
gehen, und der Sprung zurück darf nichts kosten. Genau das ist der Drawer.

**Der Bestand** (`apps/web/src/ui/drawers/`, entstanden mit F113): sechs
Stück — Beleg (PDF + Fakten, breit) · Kontenblatt (Buchungen eines Kontos,
breit) · Kontoauszugsposition (Betrag, Verwendungszweck, Zuordnung, schmal) ·
Ludwig-Buchungssatz · DATEV-Buchungssatz · technische Rohzeile. Alle nutzen
**eine** Rahmen-Primitive (`ui/components/primitives/Drawer.tsx`, CSS
`.lwdrawer` in `styles/booking.css`): Scrim, Slide-in von rechts, Kopf mit
Titel + Meta + Schließen-Kreuz, scrollender Körper, sticky Fußleiste,
Breitenstufen `sm`/`md`/`lg` aus `tokens.css`. Die Mechanik bleibt; **die
Optik ist v1 und genau das, was dieser Auftrag ersetzt** (Guidelines §11.7
führt den Rahmen als „Optik").

**So sieht der Beleg-Drawer heute aus** (das Ideal, inhaltlich):
Kopf „Beleg — Certina Management & Consulting GmbH", darunter die
Rechnungsnummer · Körper: die PDF-Vorschau über die volle Breite, Höhe
`clamp(460px, 72vh, 1200px)`, darunter die Überschrift „Extrahierte
Belegdaten" mit Lieferant · Rechnungsnr. · Datum · Brutto · Zusammenfassung,
darunter klein „Schnellvorschau. Positionen, USt-Sätze und Konto-Splitting
werden in der vollständigen Belegansicht geprüft." · Fuß: ein Knopf
„Vollständige Belegansicht öffnen".

## 2. Der Ablauf, für den gestaltet wird

| Schritt | Sie sieht | Sie tut | Der Drawer zeigt |
|---|---|---|---|
| 1 | Eine Liste/Karte mit einem Verweis auf eine fremde Entität (Belegnummer, Kontonummer, Auszugszeile) | klickt den Verweis | schiebt von rechts ein, der Kontext bleibt links sichtbar |
| 2 | Kopf + das Wesentliche der Entität | liest, scrollt | im Ladefall eine ruhige Fläche, im Fehlerfall den Grund **mit der Kennung**, im Leerfall einen Satz mit Mandantenbezug |
| 3 | Ihre Frage ist beantwortet | `Esc` / Kreuz / Klick auf den Scrim | schließt, die Arbeit dahinter ist unverändert |
| 3′ | Ihre Frage ist **nicht** beantwortet | klickt die eine Aktion im Fuß | verlässt den Kontext bewusst Richtung Vollansicht |

## 3. Was zu gestalten ist

**A — Der Rahmen in v2-Optik** (ein Artboard mit allen Teilen): Scrim ·
Kopfzone (Titel, Meta, Schließen) · Körper · sticky Fußleiste · die drei
Breitenstufen nebeneinander (`sm` Fakten-Liste · `md` Detail · `lg` Dokument
oder Tabelle) · Ein-/Ausgangsbewegung. Dazu die **vier Zustände** als eigene
Flächen: lädt · Fehler · nicht gefunden · Inhalt.

**B — Je Entität ein Artboard** mit echtem Inhalt (Umfang nach §7):
Beleg (die Referenz, in v2 übersetzt) · Sachverhalt · Sach-/Personenkonto
(Kontenblatt) · Kontoauszugsposition · Buchungssatz (Ludwig **und** DATEV als
zweite Wahrheit nebeneinander gezeigt).

**C — Die Regel, die aus B fällt:** Welche Zonen hat ein Entitäts-Drawer, und
in welcher Reihenfolge? Das Muster des Belegs (Original → Kern-Fakten →
was fehlt → ein Ausgang) muss für eine Entität ohne Dokument (Sachverhalt,
Konto) genauso tragen. Dieses Zonen-Schema ist das eigentliche Ergebnis.

## 4. Regeln, die gelten (Auszug, `ludwig-UX-guidelines-v2.md`)

- **Zwei Register, ein Token-Satz** (A1): produktiv 13.5–14 px. Der Drawer ist
  produktiv, nicht lesend.
- **Farbe kodiert Kritikalität** (A7/§3): Fehler · Warnung · Hinweis · Debug,
  je eine Farbe. Nie Wert oder Vorzeichen einfärben.
- **Status nur über die Registry** (Z1/Z2): Zustände erscheinen als
  `StatusBadge`; keine lokalen Label- oder Farbtabellen, keine neuen Achsen.
- **Icons Lucide 16/20/24, nie ohne Wort** (T9). Keine Unicode-Zeichen.
- **Kein `text-transform: uppercase`** (A2), Leerzustände linksbündig, ein
  Satz mit Zahl (L6).
- **Zeiten Europe/Berlin**, Beträge tabellarisch mit `tnum` (T7/R3).
- Der Drawer nutzt die **bestehenden** v2-Bausteine (`Card`, `FieldList`,
  `Callout`, `Table`, `StatusBadge`) — ein Drawer erfindet keine eigene
  Feldliste und keine eigene Tabelle.

## 5. Nicht im Auftrag

Implementierung — es entsteht **keine** Komponente in `apps/web`, solange v3
läuft; die Seiten werden später aus den v3-Bausteinen zusammengesetzt ·
Umbenennung der Bestands-Drawer (`web-ui-offen.md` P26, mechanisch) ·
schreibende Slide-over (Editoren, Klasse B) · neue Entitäten oder neue
Status-Achsen · Mobile.

## 6. Abgabe

Artboards auf einer Canvas, dazu je Artboard die Zonen benannt und die
verwendeten Tokens/Bausteine. Ablage der Design-Dateien wie bei F123
(`~/dev/ludwig/design-ergebnis`), das schriftliche Ergebnis als
Zonen-Schema + Abweichungen zu §0 zurück in dieses Dokument.

## 7. Offene Entscheide (Owner)

| Frage | Vorschlag |
|---|---|
| Umfang der ersten Runde | Rahmen (A) + vier Entitäten: Beleg, Sachverhalt, Konto, Kontoauszugsposition. Buchungssatz-Drawer laufen mit der Buchungs-Welle mit. |
| Rahmen jetzt oder mit der Seite? | **Jetzt.** Der Rahmen ist app-weit; sonst zeigen v2-Seiten ihre Inhalte in einer v1-Hülle. |
| Drawer aus dem Drawer? | **Nein** — einer zur Zeit. Ein Verweis im Drawer ersetzt dessen Inhalt oder führt in die Vollansicht; keine gestapelten Ebenen. |
| Breite bei `lg` | Vorschlag: so breit, dass eine A4-Seite bei 100 % lesbar ist, aber links noch Kontext stehen bleibt — genauer Wert kommt aus dem Design. |
