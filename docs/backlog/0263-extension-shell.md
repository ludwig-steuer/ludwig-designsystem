# 0263 · Rahmen einer Browser-Erweiterung (`ExtensionShell`, `ExtensionPopup`)

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` — Gruppe Rahmen, neben `AppShell` |
| Klassen-Test | ja: eine Versicherungs-App mit Browser-Erweiterung braucht dieselben zwei Flächen, eine Seite im Tab mit wenigen Bereichen und ein Popup mit Zustand und einem Knopf |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Abschnitte „Aufbau“ und „Popup“; Zuschnitt der Seite: `ludwig-plugin/docs/spec-oberflaeche-und-fehler.md` C5 („Eine Seite mit drei Bereichen: Abgleich, Verlauf, Einstellungen“, Popup mit Verbindungszustand und einem Knopf); Zeichen: `ludwig-plugin/docs/store-assets/duo-connect-logo.svg` |
| Ersetzt | nichts in `ludwig/app`. Im Plugin ersetzt es die handgeschriebenen Rahmen von `sync.html`/`options.html` und `popup.html` (Plugin-Paket „Designsystem einbauen“) |
| Blockiert | Oberfläche der Erweiterung Ludwig DUO-Connect, Plugin-Paket C5 |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Die Mitarbeiterin öffnet die Erweiterung alle paar Wochen. Sie muss sofort
sehen, dass sie im richtigen Werkzeug ist, gegen welche Umgebung sie arbeitet
und wo die drei Bereiche Abgleich, Verlauf und Einstellungen liegen. Heute baut
jede Seite der Erweiterung ihren Kopf selbst, mit eigenen Farben und eigener
Schrift. Künftig gibt es einen Rahmen aus dem Set: einen Kopf mit Zeichen und
Namen, die Reiter darunter, den Inhalt in fester Breite und die Fußzeile mit
Version und Datenschutz. Das Popup bekommt dieselbe Anmutung im Kleinen, mit
einer Zeile Zustand und genau einem Knopf.

## Einordnung

- **Wiederverwenden:**
  - `AppShell` (`@when` „Around every screen of the app: sidebar, top bar,
    work surface“) trägt den Fall nicht. Sein Raster hat immer eine
    Seitenleiste von 240 px (`sidebar` ist Pflicht). Darunter klappt es zur
    Schublade hinter „Menü“ zusammen. Für drei Bereiche wäre eine Seitenleiste
    eine zweite Navigation neben dem, was Reiter in einer Zeile leisten. Und
    das Popup hat 320 px, da passt keine Seitenleiste hinein.
  - Übernommen wird die Bauweise: Kopf und Navigation stehen außerhalb des
    Scrollbereichs, und `main` ist der einzige Scroll-Container. Dann kann
    kein fester Kopf einen Fokusring verdecken (WCAG 2.4.11), ohne dass
    `scroll-padding` gerechnet werden muss. Ebenfalls übernommen wird die
    Deckelung der Inhaltsbreite über wachsendes Seiten-Padding statt
    `max-width` (`.app__main`), aber mit `--container-narrow` statt
    `--container-app` (Seitenprofil `docs/seiten/duo-connect.md`, vom Owner
    angenommen 2026-11-27: eine Entscheidung und eine Liste, keine breite
    Tabelle; die Seite liegt oft neben dem DATEV-Fenster).
  - `PageHeader` (`@when` „The top of every page …“) ist der Kopf einer
    **Seite** im Arbeitsbereich mit Seitentitel, Kontext und Aktionen. Hier
    ist der Kopf der des **Werkzeugs**: Zeichen, Produktname, Umgebung. Er
    steht über allen Bereichen und ändert sich nicht. Einen `PageHeader` in
    einem Bereich sieht der Rahmen nicht vor, denn der aktive Reiter nennt den
    Bereich schon, und ein Titel darunter sagte dasselbe zweimal (siehe
    Offene Frage 2).
  - `Tabs` (`@when` „Views with their own content, one active; counter and
    alarm on the tab“) trägt die Bereichsnavigation unverändert. Der Punkt
    (`dot`) zeigt „Abgleich läuft“, `alarm` zeigt „Problem“. Beides gibt es
    schon (0049). Abgleich, Verlauf und Einstellungen sind drei Sichten mit
    eigenem Inhalt und damit MECE (R9).
  - `Badge` (`@instead` von `StatusBadge`: „A property without an axis …“)
    trägt das Umgebungs-Kennzeichen. Eine Umgebung ist eine Eigenschaft und
    kein Status einer Achse.
  - `Button` (`variant="primary"`, `fullWidth`) ist der eine Knopf des Popups.
    `Link` trägt die Fußzeilen-Links, `ActionIcon action="external"` markiert
    die Links, die die Erweiterung verlassen.
- **Neu, weil:** §3 Regel 3. Kein `@when` passt, und kein Fachwort ist nötig.
  Die Quelle ist eine Anfrage mit zwei Flächen (Seite im Tab, Popup). Aus
  vorhandenen Primitives ist der Rahmen nicht in 15 Zeilen an der
  Aufrufstelle zu bauen: Raster, Scroll-Container, Breitendeckel,
  Landmarken, das Verhalten auf dem Handy und die Popup-Breite brauchen CSS,
  und der Verbraucher außerhalb des Sets darf keins schreiben (kein Hex,
  kein px). Kein eigener Zustand, also kein Pattern (Regel 4).
- **Zuschnitt:** Familie in einer Datei, `primitives/ExtensionShell.tsx` mit
  zwei Exporten, `ExtensionShell` und `ExtensionPopup`. Beide teilen den Kopf
  aus Zeichen, Produktnamen und Kennzeichen. Er bleibt eine interne Funktion
  der Datei und wird nicht exportiert (siehe Ausbau). Jede Fläche hat ihr
  eigenes `@when`. Keiner der beiden braucht `"use client"`, denn keiner hält
  Zustand oder Hooks. Die Regel „ein Teil braucht `use client`, der Rest
  nicht → trennen“ greift also nicht. Eine Familie wie `Tabs`/`Segmented`:
  ein gemeinsames Markup-Vokabular, zwei Verwendungen.
- **Setzt auf:** `Badge`, `Button`, `Link`, `ActionIcon` (`external`). Die
  Navigation (`Tabs`) und der Inhalt kommen als `ReactNode` vom Aufrufer,
  wie `sidebar` bei `AppShell`. Der Popup-Zustand nutzt bei „Abgleich läuft“
  `Spinner size="sm"` (0268), sobald es ihn gibt; der Aufrufer setzt ihn in
  `status`.

## Schnittstelle

### `ExtensionShell` — die Seite im Tab

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `markSrc` | `string` | ja | Adresse des Zeichens. Dargestellt als `img` mit `alt=""`, weil der Produktname daneben steht; 32 px, eine Größe der Marke (0056 „Sizes“) | `Filled` |
| `productName` | `string` | ja | Name des Werkzeugs, „Ludwig DUO-Connect“; steht als `h1` im Kopf (Offene Frage 2) | `Filled` |
| `environment` | `string` | nein | Kennzeichen der Umgebung, z. B. „Staging“; nur gesetzt sichtbar, als `Badge` neben dem Namen. Fehlt es, steht nichts da, auch kein „Produktion“ | `WithEnvironment` |
| `nav` | `ReactNode` | nein | Die Bereichsnavigation, gedacht für `Tabs`. Sie steht unter dem Kopf auf der Inhaltsbreite | `Filled`, `Interactive` |
| `children` | `ReactNode` | ja | Der Inhalt des aktiven Bereichs, im Scroll-Container `main` | `Filled`, `InUse` |
| `version` | `string` | nein | Versionsnummer, z. B. „0.10.2“; die Fußzeile zeigt „Version 0.10.2“ | `Filled` |
| `links` | `{ label: string; href: string }[]` | nein | Links der Fußzeile, z. B. „Datenschutz“. Ein `href` mit `http(s)://` öffnet in einem neuen Tab (`target="_blank"`, `rel="noopener"`) und trägt `ActionIcon action="external"` hinter dem Wort | `Filled` |

### `ExtensionPopup` — das Popup des Symbols

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `markSrc` | `string` | ja | wie oben, 24 px | `Popup` |
| `productName` | `string` | ja | wie oben, als Text (kein `h1`: das Popup ist ein Dokument mit einer Zeile Zustand, keine Seite) | `Popup` |
| `environment` | `string` | nein | wie oben | `Popup` |
| `status` | `ReactNode` | ja | eine Zeile Zustand: „Verbunden als Anna Schmidt“, „Nicht verbunden“, „Abgleich läuft · Musterfirma GmbH“. Steht in einer Live-Region (`role="status"`) | `Popup` |
| `action` | `{ label: string; onClick: () => void }` | ja | der eine Knopf, primär und volle Breite: „Abgleich öffnen“, „Einrichten“ | `PopupInteractive` |

Die Breite des Popups ist 320 px. Der Wert steht einmal an der Klasse in
`v3.css`, so wie die 240 px der Seitenleiste in `app-chrome.css`. Ein neuer
Token entsteht dafür nicht.

Typen aus `src/ludwig/`: keine. Der Rahmen kennt weder Mandant noch Abgleich.
GLOSSARY: Kein Fachbegriff kommt im Code vor. Die Wörter „Version“ und
„Datenschutz“ sind keine Fachbegriffe. „Version“ setzt der Rahmen selbst, alle
anderen Wörter kommen als Prop.

Was der Rahmen **nicht** kann (bewusst):
- Keine Seitenleiste, kein Mandantenwechsel, keine Suche im Kopf. Wer das
  braucht, ist eine App: `AppShell`.
- Er hält keinen Bereich als Zustand. Welcher Reiter aktiv ist, entscheidet
  der Aufrufer über `Tabs.active`, die URL gehört ebenfalls dem Aufrufer
  (siehe Verhalten).
- Das Popup hat genau einen Knopf und keine Reiter. Ein zweiter Weg heißt: Die
  Seite öffnen. Der Typ von `action` lässt nur einen zu.
- Kein dunkler Modus (Entscheidung Plugin, Vorschlag ohne Dunkelmodus liegt
  bei Simon; das Set hat keinen).
- Der Rahmen setzt weder `document.title` noch `lang`. Beides gehört in das
  HTML der Erweiterung (`<html lang="de">`).

## Verhalten

**Raster der Seite.** Oben ein weißer Kopf (`--color-bg`, untere Linie
`--border-1`): Zeichen 32 px, Produktname (`--fs-ui-lg`, 600, `--color-text`),
dahinter das Kennzeichen. Darunter die Navigation, weiß, auf derselben
Inhaltsbreite wie der Inhalt. Dann `main` auf `--color-bg-soft` als einziger
Scroll-Container (`overflow: auto`, Höhe des Fensters minus Kopf und
Navigation). Am Ende des Inhalts, innerhalb von `main`, steht die Fußzeile:
`--fs-ui-sm`, `--color-text-muted`, Einträge mit „ · “ getrennt. Sie scrollt
mit und klebt nicht am Fensterrand. Zeichen, Reiter, Karten und Fußzeile
fluchten links auf derselben Kante: Inhaltsbreite `--container-narrow` (720 px),
Seiten-Padding `--space-8`, unter 640 px `--space-4`.

**Register.** Produktiv (13.5 px, A1). Die Erweiterung ist ein
Arbeitswerkzeug, kein Lesetext.

**Landmarken.** Der Kopf ist `header`. Die Navigation steht in einem `nav`
ohne eigenen Namen, denn es ist die einzige auf der Seite; ihren Namen trägt
die Reiterliste über `Tabs.ariaLabel`, z. B. „Bereiche“. Darunter folgen
`main` und die Fußzeile als `footer`. Genau ein `h1`, der
Produktname. Karten in den Bereichen beginnen mit `CardHead` (h2).

**Tastatur und Fokus.** Der Rahmen selbst hat nur die Links der Fußzeile als
Bedienelemente. Die Reihenfolge folgt der Lesung: Reiter, Inhalt, Fußzeile.
Weil Kopf und Navigation außerhalb von `main` liegen, kann kein Fokusring
darunter verschwinden. Das gilt auch beim Tabben durch eine Tabelle mit 300
Zeilen.

**Bereich in der URL (I1).** Empfehlung an den Aufrufer: `TabItem.href` als
Hash (`#abgleich`, `#verlauf`, `#einstellungen`). Ein reiner `#`-Anker läuft
in `Link` schon heute als normales `<a>`. Neu laden und Zurück-Taste führen
dann in den richtigen Bereich. `options_page` im Manifest zeigt auf
`…#einstellungen` (C5). Der Rahmen erzwingt das nicht.

**Hover.** Nur die Fußzeilen-Links haben eins (Unterstreichung, wie `Link`).
Kopf, Zeichen und Name klicken nicht und bekommen deshalb keins.

**Schmal (L1).** Unter 640 px: eine Spalte, Padding `--space-4`, der Name
bricht um statt abzuschneiden, das Kennzeichen bleibt sichtbar. Die drei
Reiter passen in eine Zeile. Würden sie umbrechen, scrollt die Reiterzeile
waagerecht, die Seite nicht. Nichts fällt weg, und die Seite scrollt nie
waagerecht. Am Desktop ändert diese Regel nichts, sie steht in
`@media (max-width: 639.98px)`. 200 % Zoom bei 1280 px ergibt denselben
Zustand.

**Popup.** Breite 320 px, Padding `--space-4`, untereinander: Kopf (Zeichen
24 px, Name `--fs-ui-md` 600, Kennzeichen), Zustand (`--fs-ui`,
`role="status"`, damit ein Wechsel „Nicht verbunden“ → „Verbunden als …“
angesagt wird) und der Knopf in voller Breite. Der Knopf bekommt beim Öffnen
den Fokus (`autoFocus`, Offene Frage 3). `Enter` löst ihn aus, `Esc`
schließt das Popup (Browser). Die Höhe folgt dem Inhalt, das Popup scrollt
nie. Vorsicht: `app-chrome.css` setzt global `html, body, #root { height:
100% }`, und Chrome bemisst ein Popup nach seinem Inhalt. Der Popup-Rahmen
muss in einer echten Erweiterung die Höhe seines Inhalts bekommen. Gelingt
das nur mit einer Regel für das Popup-Dokument, gehört sie an die Klasse des
Popups und nicht in `app-chrome.css`.

**Bewegung.** Keine. Weder Rahmen noch Popup animieren etwas.

**Zustände.** Der Rahmen hält keine Daten. Gefüllt ist sein einziger
Zustand. „Lädt“, „leer“, „leer nach Filter“ und „Fehler“ gehören dem Inhalt
eines Bereichs. Der Rahmen steht unverändert, während der Inhalt lädt
(Skeleton im Inhalt), und er springt nicht, wenn der Inhalt wechselt.

**Server/Client.** Beide Exporte sind ohne `"use client"`. Sie halten keinen
Zustand und rufen keine Hooks. `ExtensionPopup` nimmt einen Callback, also
rendert ihn ein Client-Baum. In der Erweiterung gibt es nur den.

## Stories

Titel `v3/Primitives/Rahmen/ExtensionShell`. Abgeleitet nach §6: ein Zustand
(gefüllt), keine Enum- und keine Layout-Prop, ein Callback (`action.onClick`),
dazu die Bereichsnavigation als Rundlauf, im Einsatz, Rand (Kennzeichen) und
schmal (L1).

| Story | Beweist |
|---|---|
| `Filled` | Seite mit Zeichen, „Ludwig DUO-Connect“, drei Reitern (Abgleich aktiv, Verlauf, Einstellungen), einer Karte im Inhalt und der Fußzeile „Version 0.10.2 · Datenschutz“ (extern, mit Zeichen) |
| `WithEnvironment` | dieselbe Seite mit Kennzeichen „Staging“; daneben ohne Kennzeichen, damit der Unterschied auf einen Blick steht |
| `Interactive` | Reiter wechseln über `Tabs.onPick` mit `useState`. „Abgleich“ trägt den Punkt, solange „Abgleich läuft“ gesetzt ist; „Verlauf“ hat 300 Zeilen, `main` scrollt, Kopf und Reiter bleiben stehen |
| `InUse` | die Hauptseite im echten Zustand: Bereich Abgleich mit Karte „Mandant“ (Musterfirma GmbH, DATEV-Nummer 10234), Knopf „Abgleichen“, darüber `Callout` „Seite offen lassen, solange der Abgleich läuft.“, Fußzeile |
| `Narrow` | `InUse` in zwei Fenstern, 820 px und 390 px (`iframe` wie `AppShell/Narrow`, weil die Media Query das Fenster fragt) |
| `Popup` | drei Popups nebeneinander: „Verbunden als Anna Schmidt“ mit „Abgleich öffnen“, „Nicht verbunden“ mit „Einrichten“, „Abgleich läuft · Musterfirma GmbH“ mit `Spinner sm` (0268; bis es ihn gibt, Text allein) und Kennzeichen „Staging“ |
| `PopupInteractive` | Rundlauf über `action.onClick`: Klick und `Enter` erhöhen „Seite geöffnet: n“ unter dem Popup; der Knopf hat beim Laden den Fokus |

Nicht anwendbare Zustände: leer, leer nach Filter, lädt, Fehler. Der Rahmen
hält keine Daten (siehe Verhalten). Die fünf Zustände belegen die Bausteine
im Inhalt.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Breiterer Inhalt für einen Bereich mit vielen Spalten | `width?: "narrow" \| "base"` (`--container-base`) | Die Ergebnistabelle im Verlauf bricht bei 720 px Spalten um, die eine Frage der Seite beantworten |
| Den Kopf allein (Zeichen, Name, Kennzeichen) für eine dritte Fläche | Export der internen Kopf-Funktion als `ExtensionBrand` | Die Erweiterung bekommt eine dritte Seite, etwa eine eigene Verbinden-Seite (V1), die keine Reiter hat |
| Eine zweite Zeile im Popup, z. B. „Letzter Abgleich: 26.11.2026, 14:05“ | optionales `detail?: ReactNode` unter `status` | Das Plugin fragt danach; ein zweiter Knopf bleibt ausgeschlossen |

## Offene Fragen

1. Welchen Ton trägt das Kennzeichen „Staging“? **Ohne Antwort:** `neutral`.
   Eine Umgebung ist eine Eigenschaft (A7: Kategorie ist grau), und das Wort
   allein sagt genug. `warning` hieße, dass jede Sitzung auf Staging
   dauerhaft gelb markiert ist, auch wenn dort bewusst gearbeitet wird.
2. Ist der Produktname im Kopf das `h1` der Seite? **Ohne Antwort:** ja. Die
   Seite hat ein Thema, der Reiter nennt den Bereich, Karten beginnen mit
   `CardHead` (h2). Ein `PageHeader` je Bereich wiederholte den Reiter. Das
   `h1` sieht aus wie ein Kartentitel (`--fs-ui-lg`, 600) und nicht wie ein
   Seitentitel, denn das Element folgt der Lage (A14), und der Name ist die
   Marke, nicht der Inhalt.
3. Bekommt der Knopf im Popup beim Öffnen den Fokus? **Ohne Antwort:** ja.
   Das Popup hat genau eine Handlung, die nichts verändert (sie öffnet eine
   Seite). `Enter` direkt nach dem Klick auf das Symbol ist der schnellste
   Weg, und ein versehentliches `Enter` richtet nichts an.

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

- [ ] `ExtensionShell` und `ExtensionPopup` haben die Props der Tabellen, Zeichen für Zeichen (Typ, Pflicht); `@when` nennt die Seite im Tab bzw. das Popup, `@instead` verweist auf `AppShell` (App mit Seitenleiste) und `PageHeader` (Kopf einer Seite im Arbeitsbereich); `AppShell` und `PageHeader` bekommen den Gegenverweis
- [ ] Kopf: Zeichen 32 px gemessen, `alt=""`; Produktname ist das einzige `h1` der Seite; ohne `environment` kein Kennzeichen im DOM, mit „Staging“ ein `Badge` im Ton der Offenen Frage 1 (`Filled`, `WithEnvironment`)
- [ ] Zeichen, erster Reiter, linke Kartenkante und Fußzeile fluchten bei 1280 px auf ±1 px; Inhaltsbreite ist `--container-narrow` (720 px) bei einem Fenster von 1600 px (`InUse`, gemessen)
- [ ] `main` ist der einzige Scroll-Container: Bei 300 Zeilen in `Interactive` bleibt `document.scrollingElement.scrollTop` 0, `main.scrollTop` wächst; Kopf und Reiter bleiben sichtbar; ein per Tab fokussiertes Element am oberen Rand von `main` ist nicht verdeckt (2.4.11)
- [ ] Fußzeile: „Version 0.10.2 · Datenschutz“; „Datenschutz“ mit `https://` hat `target="_blank"`, `rel="noopener"` und das Zeichen `external`; Hover unterstreicht; Text ≥ 4,5:1 auf `--color-bg-soft` gemessen (`Filled`)
- [ ] Landmarken `header`, `nav`, `main`, `footer` vorhanden, die Reiterliste darin mit `aria-label`; Fokusreihenfolge Reiter → Inhalt → Fußzeile (`Filled`, Tastatur)
- [ ] Bei 390 px: eine Spalte, kein waagerechtes Scrollen der Seite (`scrollWidth = clientWidth`), Name und Kennzeichen sichtbar, alle drei Reiter erreichbar; bei 1280 px kein Pixel anders als ohne die Regel für schmale Breiten (`Narrow`)
- [ ] Popup: Breite 320 px gemessen; Zustand in `role="status"` und ein Wechsel des Zustands wird angesagt (Live-Region im DOM vor dem Wechsel vorhanden); genau ein Knopf, primär, volle Breite, Trefferfläche ≥ 24 × 24 px; Fokus liegt nach dem Laden auf dem Knopf, `Enter` ruft `onClick` (`Popup`, `PopupInteractive`)
- [ ] Popup in einer entpackt geladenen Test-Erweiterung in Chrome geöffnet (nicht nur Storybook): Höhe = Höhe des Inhalts, keine Bildlaufleiste, Breite 320 px (Screenshot)
- [ ] Kein `"use client"` in `ExtensionShell.tsx`; keine Animation
- [ ] `AppShell`, `PageHeader` und `Tabs` sind unverändert bis auf die `@instead`-Verweise (`git diff`)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
