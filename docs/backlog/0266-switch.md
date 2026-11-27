# 0266 · Sofort wirkende Einstellung: `ActionButton` statt `Switch`

| | |
|---|---|
| Status | spec |
| Stufe | Seitenaufgabe auf `primitives/` (`Card`, `CardHead`, `CardSection`, `ActionButton`), **kein neuer Export**. Dazu eine Erweiterung von `ActionButton`: der Fehler neben dem Knopf wird angesagt |
| Klassen-Test | ja: eine Einstellung, die sofort gilt, mit Wort und Erklärsatz, gibt es in jeder Software |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Schalter“ („Belegübergabe, Fehlermeldungen senden · an, aus, gesperrt; mit Erklärtext“). Fachtext: `…/docs/spec-oberflaeche-und-fehler.md` C2 und C5, `…/docs/begriffe.md` |
| Ersetzt | nichts im Set. Im Plugin die heutigen Kästchen der Einstellungsseite |
| Blockiert | Plugin-Paket C5 (Bereich Einstellungen), 0263 `ExtensionShell` (Story des Bereichs Einstellungen) |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Die Steuerfachangestellte öffnet im Plugin den Bereich Einstellungen, um die
Belegübergabe einzuschalten. Sie sieht, ob die Belegübergabe gerade läuft,
liest in einem Satz, was sie tut, und schaltet mit einem Klick auf einen Knopf
um, der die Handlung in Worten nennt („Belegübergabe einschalten“). Es gibt
keinen Speichern-Knopf: Die Einstellung gilt sofort, das Zustandswort wechselt,
und ein Vorleseprogramm sagt den neuen Zustand an. Dieselbe Form trägt
„Fehlermeldungen senden“.

## Einordnung

- **Entschieden ist schon:** Einen Schalter hat der Owner am 2026-09-04
  verworfen (0018, `design-guidelines.md` §11 Zeile „Schalter (Toggle)“).
  0018 nennt zwei Formen. Eine Sofort-Umschaltung ist ein `Button` mit Wort
  und Ladezustand. Eine Formularangabe, die mit dem Formular gespeichert wird,
  ist ein `Checkbox`. Die App macht es genauso: `ClientActiveToggle` ist mit
  Absicht ein Knopf, „ein Klick mit klarer Beschriftung statt eines
  Schalters, den man versehentlich streift“.
- **Wiederverwenden (§3 Regel 1):** Beide Plugin-Einstellungen gelten sofort
  und werden im Gerät gemerkt (C2: „Der Schalter ist gemerkt und gilt für
  alle Mandanten des Geräts“). Das ist der Fall Sofort-Umschaltung. Den
  Ablauf trägt `ActionButton` (`@when` „Every action that runs, can take a
  moment and can fail“): er sperrt den Knopf während der Handlung, zeigt den
  Fehler neben dem Knopf und meldet bewusst keinen Erfolg, denn den zeigt das
  Ergebnis. Das Ergebnis ist hier das Zustandswort. Den Rahmen tragen `Card`,
  `CardHead` (`title`, `meta`, `actions`) und `CardSection` für den Erklärsatz.
- **Warum kein `Checkbox` (§3 Regel 2 geprüft):** Ein `Checkbox` mit
  Erklärtext wäre eine Prop (`hint`, wie `RadioOption.hint`). Er stünde aber
  für „wird mit dem Formular gespeichert“, und genau das trifft hier nicht zu.
  Ein Kästchen, das ohne Speichern sofort wirkt, liest sich in Ludwig anders
  als jedes andere Kästchen. Ein `Checkbox` bleibt richtig für die Auswahl
  einzelner Schritte unter „Diagnose“, weil die erst mit dem Start des
  Probelaufs gilt.
- **Warum kein `Switch`, auch nicht nach Weg B von 0018:** Weg B erlaubt einen
  Schalter nur für **folgenlose** Einstellungen. Beide Plugin-Einstellungen
  haben Folgen. Die Belegübergabe lädt Dateien nach DATEV Unternehmen Online
  hoch, die Fehlermeldungen schicken Daten an den Anbieter. Hier gilt dieselbe
  Begründung wie bei `ClientActiveToggle`.
- **Erweitert (§3 Regel 2):** `ActionButton` sagt einen Fehler neben dem Knopf
  heute nicht an. Der Zweig ohne Dialog rendert
  `<span className="v2act__err">` ohne Rolle, der Dialogzweig dagegen
  `role="alert"`. Ohne Ansage hört ein Vorleseprogramm nach dem Klick nichts.
  Dafür kommt keine neue Prop dazu, nur dasselbe Attribut wie im Dialogzweig.
  Es gilt für jeden `ActionButton`.
- **Zuschnitt:** kein neuer Baustein. Die Komposition hat keinen eigenen
  Zustand: Ladezustand und Fehler hält `ActionButton`, den Wert hält der
  Aufrufer. Sie kommt auf genau einem Bildschirm vor (§3 Regel 4 greift nicht).
  Sie wird als Story vorgeführt, damit Plugin und App sie gleich bauen.
- **Setzt auf:** `Card`, `CardHead`, `CardSection` (`primitives/Table.tsx`),
  `ActionButton`.

## Schnittstelle

Keine neue Prop und kein neuer Export. Die Seite baut jede Einstellung aus
diesen Teilen:

| Teil | Baustein · Prop | Inhalt | Nachweis (Story) |
|---|---|---|---|
| Name der Einstellung | `CardHead.title` | „Belegübergabe“, „Fehlermeldungen senden“ (Wörter aus `ludwig-plugin/docs/begriffe.md`) | `ActionButton/ImmediateSetting` |
| Zustand als Wort | `CardHead.meta`, darin ein `<span role="status">` | „eingeschaltet“ oder „ausgeschaltet“, grau wie jedes `meta`, **keine Farbe** (Farbe kodiert Kritikalität, nicht den Wert) | `ImmediateSetting` |
| Umschalten | `CardHead.actions` → `ActionButton` mit `action`, `pendingLabel`, `variant="secondary"` | Imperativ mit Objekt, nennt die Folge: „Belegübergabe einschalten“ oder „Belegübergabe ausschalten“ | `ImmediateSetting` |
| Was die Einstellung tut | `CardSection` | ein bis zwei Sätze, z. B. „Lädt Beleg-Dateien, die auf anderem Weg nach Ludwig kamen (zum Beispiel per E-Mail), nach DATEV Unternehmen Online hoch. Welche das sind, bestimmt Ludwig. Buchungen und Buchungsanweisungen werden nicht übertragen.“ | `ImmediateSetting` |
| Gesperrt mit Grund | `ActionButton.disabled` + ein Satz in der `CardSection` | „Erst möglich, wenn das Plugin mit Ludwig verbunden ist.“ | `ImmediateSettingLocked` |

Geändert wird `ActionButton` im Zweig ohne Dialog:
`<span className="v2act__err" role="alert">`. Die Props bleiben, wie sie sind.

Was die Komposition **nicht** kann (bewusst):
- Sie speichert nichts. `action` ruft der Aufrufer auf, im Plugin die
  Schicht „Daten für die Oberfläche“ (C0).
- Sie fragt nicht nach. Beide Einstellungen sind umkehrbar, und der
  Rückweg ist derselbe Knopf. Ein Bestätigungsdialog gilt nur für
  Unumkehrbares.
- Sie meldet keinen Erfolg per `Toast`. Der Erfolg ist das neue Zustandswort,
  angesagt über `role="status"`. Ein Toast daneben wäre dieselbe Nachricht
  doppelt.
- Es gibt keine Taste dafür. Eine Einstellung ändert man selten, und
  Beschleuniger gibt es nur für Häufiges.

## Verhalten

- **Tastatur:** Tab erreicht den Knopf, Enter oder Leertaste löst ihn aus. Der
  Fokus bleibt auf dem Knopf, auch wenn das Wort wechselt („einschalten“ →
  „ausschalten“), weil `ActionButton` dasselbe Element behält.
- **Hover und Fokus:** kommen von `Button`. Die Trefferfläche wird gemessen,
  sie muss mindestens 24 × 24 px groß sein. Der Fokusring ist sichtbar.
- **Zustände:**
  - Gefüllt: Das Wort lautet „eingeschaltet“ oder „ausgeschaltet“, der Knopf
    nennt die Gegenhandlung.
  - Lädt: Der Knopf ist gesperrt und trägt `pendingLabel` („Wird
    eingeschaltet …“). Im Plugin dauert das Speichern in `chrome.storage`
    Millisekunden, der Zustand blitzt also höchstens auf.
  - Fehler: Der Satz neben dem Knopf nennt Was · Ursache · nächster Schritt,
    zum Beispiel „**Nicht gespeichert.** Der Browser hat die Einstellung
    abgelehnt. Bitte laden Sie die Seite neu und versuchen Sie es noch
    einmal.“ Das Wort bleibt beim alten Wert, weil der gespeicherte Wert die
    Wahrheit ist. Der Satz wird angesagt (`role="alert"`, neu).
  - Gesperrt: Der Knopf ist aus, der Grund steht als Satz in der
    `CardSection`.
  - Leer und leer nach Filter gibt es nicht, weil eine Einstellung immer
    einen Wert hat.
- **Ansage:** Der Zustandswechsel wird über `role="status"` am Wort angesagt
  („eingeschaltet“), der Fehler über `role="alert"`.
- **Handy unter 640 px:** Die Aktionen des `CardHead` brechen unter den Titel
  um (0259). Es fällt nichts weg.
- **Client:** `ActionButton` ist schon Client. Die Komposition hält keinen
  eigenen Zustand.

## Stories

Seitenaufgabe, deshalb zwei Stories, beide in `ActionButton.stories.tsx`
unter `v3/Primitives/Aktion/ActionButton`. Wo die Komposition im Set gezeigt
wird, entscheidet die Klasse des tragenden Bausteins: Das Verhalten (sperren,
Fehler, Ansage) gehört `ActionButton`.

| Story | Beweist |
|---|---|
| `ImmediateSetting` | Zwei Karten untereinander. „Belegübergabe“ (ausgeschaltet, Knopf „Belegübergabe einschalten“) und „Fehlermeldungen senden“ (eingeschaltet, Knopf „Fehlermeldungen nicht mehr senden“), je mit Erklärsatz. Rundlauf mit `useState` und einer Promise mit 600 ms. Das Wort wechselt, der Knopf nennt die Gegenhandlung. Der zweite Klick auf „Fehlermeldungen …“ scheitert einmal mit dem Fehlersatz oben, das Wort bleibt stehen, der nächste Klick gelingt |
| `ImmediateSettingLocked` | „Belegübergabe“ gesperrt, solange keine Verbindung besteht: Knopf aus, Satz „Erst möglich, wenn das Plugin mit Ludwig verbunden ist.“ |

Die vorhandene Story `ActionButton/Failed` beweist nach dem Bau zusätzlich
`role="alert"` am Fehler.

Nicht anwendbare Zustände: leer und leer nach Filter, wie unter Verhalten
begründet. „Lädt“ steckt im Rundlauf von `ImmediateSetting`, weil die Promise
600 ms hält. Eine eigene Story wäre nur ein Standbild davon. `ActionButton/Pending`
gibt es schon.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Eigenes Pattern „Einstellung“ (Name, Wort, Satz, Knopf in einem) | ein neuer Export mit `label`, `on`, `description`, `onToggle` | Die Komposition taucht auf einem zweiten Bildschirm auf, zum Beispiel wenn die App `ClientActiveToggle` darauf hebt (siehe Befund unten) |
| Ein Kästchen mit Erklärsatz für Formularangaben | `Checkbox.hint` (Wortlaut wie `RadioOption.hint`) | Ein Formular mit Speichern-Knopf braucht eine Ja/Nein-Angabe mit Satz darunter |

## Offene Fragen

1. Soll der Owner 0018 für das Plugin aufheben und einen echten Schalter
   (`role="switch"`) zulassen? **Ohne Antwort:** nein. 0018 gilt, und selbst
   ihr Weg B setzt folgenlose Einstellungen voraus, was beide Plugin-
   Einstellungen nicht sind.
2. Wortlaut der Knöpfe für „Fehlermeldungen senden“. Die Story nutzt
   „Fehlermeldungen senden“ und „Fehlermeldungen nicht mehr senden“.
   **Ohne Antwort:** so. Den endgültigen Text liefert das Plugin, denn die
   Wörter gehören seiner Oberfläche (`begriffe.md`).

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Es gibt keinen neuen Export und kein `role="switch"` im Set (`grep -rn 'role="switch"' src` leer)
- [ ] `ActionButton` ohne Dialog: Der Fehler steht in `<span className="v2act__err" role="alert">`. Nachweis in `Failed` und `ImmediateSetting` am DOM
- [ ] `ImmediateSetting`: Ein Klick wechselt das Wort von „ausgeschaltet“ auf „eingeschaltet“ und den Knopf auf die Gegenhandlung. Der Fokus steht danach noch auf dem Knopf (`document.activeElement`)
- [ ] `ImmediateSetting`: Das Wort steht in einem Element mit `role="status"`, das schon vor dem Klick im DOM ist, und es ist grau (`--color-text-subtle` aus `.v2card__meta`), nicht farbig
- [ ] `ImmediateSetting`: Während der 600 ms ist der Knopf gesperrt und trägt `pendingLabel`
- [ ] `ImmediateSetting`: Ein gescheiterter Klick lässt das Wort stehen. Der Fehlersatz hat die Form Was (fett) · Ursache · nächster Schritt, und der nächste Klick löscht ihn
- [ ] `ImmediateSettingLocked`: Der Knopf ist `disabled`, der Grund steht als Satz in der Karte
- [ ] Trefferfläche des Knopfs mindestens 24 × 24 px, gemessen im Browser. Fokusring sichtbar, Hover antwortet
- [ ] Bei 1280 px stehen Wort und Knopf in einer Zeile mit dem Titel, unter 640 px bricht der Knopf unter den Titel um (0259), es fällt nichts weg
- [ ] 0018 wird nicht wieder geöffnet. `design-guidelines.md` §11, Zeile „Schalter (Toggle)“, verweist zusätzlich auf 0266 als Antwort für Sofort-Einstellungen

## Befund an die App

| # | Befund | Quelle |
|---|---|---|
| (neu) | `ClientActiveToggle` (`modules/admin/ui/ClientActiveToggle.tsx`) baut Ladezustand und Fehler von Hand nach, was `ActionButton` seit 0004 trägt. Sein Fehler steht ohne Ansage neben dem Knopf, und das TSX schreibt px (`gap: 8`, `fontSize: 12`). Lösung: `ActionButton` mit `pendingLabel` und die Form aus 0266 (Zustandswort in `meta` mit `role="status"`) | 0266 |

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
