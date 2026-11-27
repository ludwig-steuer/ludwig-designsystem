# 0263 · Rahmen einer Browser-Erweiterung (`ExtensionShell`, `ExtensionPopup`)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (M1–M4 behoben, Nachprüfung ✓; H11 behoben; H10 calc-size-Rückfall beim Plugin zu entscheiden) |
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
  `Spinner size="sm"` (0268); der Aufrufer setzt ihn in `status`.

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
| `Popup` | drei Popups nebeneinander: „Verbunden als Anna Schmidt“ mit „Abgleich öffnen“, „Nicht verbunden“ mit „Einrichten“, „Abgleich läuft · Musterfirma GmbH“ mit `Spinner sm` (0268), Zähler „Beleg 37 von 120“ als `detail` (Nachtrag 2) und Kennzeichen „Staging“ |
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

## Nachtrag 2026-11-27 — Tabellen nach Spaltenbreite (aus den Entwürfen)

Befund aus den Entwürfen (`docs/seiten/duo-connect.md`, Nachtrag 1): Die
Tabelle antwortet heute auf ihre eigene Breite (`container: v2tbl`,
Zeilenkarte unter 640 px Tabellenbreite), aber nur innerhalb von
`@media (max-width: 1279.98px)`. In der Spalte des Rahmens ist eine Tabelle
in einer Karte knapp unter 640 px breit. Folge: Bei 960 px Fenster (neben
DATEV) kippt sie zu Zeilenkarten, bei 1440 px bleibt sie Tabelle — dieselbe
Spalte, zwei Formen.

- `--container-narrow` (720 px) ist die **Innenbreite** von `main`; das
  Seiten-Padding liegt außerhalb. Eine Tabelle in einer Karte ist damit bei
  voller Spalte ≥ 640 px breit.
- Der Rahmen setzt für Tabellen in seinem `main` den Container **auf allen
  Fensterbreiten** (eine Regel, die nur unter `.ext…` greift; Klassenname
  nach `check:classes` vergeben). Die Form richtet sich dann allein nach der
  Spalte: Tabelle, solange sie ≥ 640 px breit ist, darunter Zeilenkarten.
- In der App ändert sich nichts: Die Regel greift nur im Rahmen.

Zusätzliche Kriterien:

- [ ] `Interactive` mit einer `DataTable` in einer `Card`: bei Fenster
  1440 px und 960 px dieselbe Tabelle (gemessen: Tabellenbreite ≥ 640 px,
  keine Zeilenkarte); bei 600 px Zeilenkarten
- [ ] In `AppShell` (App) ist bei 960 px nichts anders als vorher
  (Bildvergleich einer vorhandenen Tabellen-Story ≤ 0,5 %)

## Nachtrag 2 2026-11-27 — aus der Abnahme

Aus der fremden Abnahme (Protokoll unten, Hinweise H1, H3, H4, H5, H8;
Mängel M1–M4 sind dort beschrieben und hier nicht wiederholt).

- **`ExtensionPopup.detail` (H1, Ausbau-Fall eingelöst).** Die Plugin-Popups
  tragen unter dem Zustand eine zweite Zeile: „Zuletzt abgeglichen: …“,
  „Beleg 37 von 120“. In `status` stünden sie in der Live-Region und würden
  bei jedem Zählschritt angesagt.

  | Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
  |---|---|---|---|---|
  | `detail` | `ReactNode` | nein | steht unter `status`, **außerhalb** der Live-Region, in `--fs-ui-sm`, `--color-text-muted`; für Zähler und den letzten Abgleich. Ein zweiter Knopf bleibt ausgeschlossen | `Popup` |

- **`InUse` folgt dem Profil (H4).** Wortlaut nach `docs/seiten/duo-connect.md`
  (vom Owner angenommen): Karte „Abgleichen“, Knopf „Mandant abgleichen“ (U12,
  Imperativ mit Objekt), Hinweis „Lassen Sie diese Seite und das
  DATEV-Fenster geöffnet, bis der Abgleich fertig ist.“ (A7). Die Zeile
  `InUse` der Story-Tabelle oben ist damit überholt.
- **`Spinner sm` im laufenden Popup (M2).** 0268 ist fertig; die Übergangsform
  „Text allein“ entfällt (Einordnung und Story-Tabelle oben angepasst).
- **`scrollbar-gutter: stable` an `main` (H3).** Mit klassischen Bildlaufleisten
  (Windows) behält die Spalte ihre Breite, ob der Bereich scrollt oder nicht;
  die linke Kante bleibt die des Kopfs.
- **`Narrow` mit Kennzeichen (H5).** Beide Fenster zeigen „Staging“ (über die
  Story-Argumente von `InUse`).
- **Popup-Breite nur aus `ExtensionPopup` (H8).** Der Showcase schreibt keine
  eigene Breite mehr; die Bausteinzeilen der Popup-Tafel nennen `ExtensionPopup`.

Zusätzliche Kriterien:

- [ ] `Popup`: Der Zähler steht in `.v3extpop__detail` außerhalb von
  `role="status"`; ein Wechsel des Zählers ändert den Text der Live-Region nicht
- [ ] `Narrow`: bei 390 px und 820 px ist „Staging“ sichtbar
- [ ] `main` hat `scrollbar-gutter: stable`; mit nachgestellten klassischen
  Bildlaufleisten (15 px) liegt die linke Kartenkante in `Filled` (scrollt
  nicht) und `Interactive` (scrollt) auf derselben Kante wie das Zeichen, und
  die Inhaltsbreite ist in beiden gleich

## Abnahme

Gemessene Abnahme (nicht schlank), 2026-11-27, durch einen fremden Prüfer,
der nicht gebaut hat. Grundlage: diese Spec samt Nachtrag, das Seitenprofil
`docs/seiten/duo-connect.md` und der Arbeitsbaum, nicht der Chat. Gemessen mit
Playwright gegen das laufende Storybook (Port 6107) in einer eigenen Seite, mit
`getBoundingClientRect`, `elementFromPoint` und `scrollWidth`/`clientWidth`;
Fenster 1280 × 800, wo nicht anders genannt. Story-IDs kurz: `es--*` =
`v3-primitives-rahmen-extensionshell--*`. Bilder und Messskripte liegen im
Scratchpad der Prüfsitzung (`0263-*.png`, `app-before/`, `app-after/`,
`narrow-before/`, `narrow-after/`, `scripts/popup-probe.mjs`) und sind
flüchtig. 0268 und 0271 im selben Baum sind nicht Gegenstand.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0; `pnpm build -o <Scratchpad>/sb-build-0263` Exit 0 („Storybook build completed successfully“), alle 7 `es--*` im `index.json`. Dazu `check:type`, `check:language`, `check:when` Exit 0. `check:classes` Exit 1 mit 4 Altbefunden (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`, alle schon in HEAD ohne Regel); alle 12 `v3ext*`-Klassen der TSX haben eine Regel. `check:css` Exit 1: `dist/ludwig.css` fehlt nur `vertical-align: top` an `.v3spinner` (0268, H1); der `.v3ext`-Block samt Container-Regel steht drin (H9) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/ExtensionShell.tsx` (zwei Exporte, `Brand` intern), Story daneben, Titel `v3/Primitives/Rahmen/ExtensionShell` neben `AppShell`; Export in `index.ts` unter „Rahmen“ | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Komponente: Bezeichner, Kommentare, JSDoc englisch; `@when`/`@instead` an `ExtensionShell` und `ExtensionPopup`. **Story nicht:** `PastSync.state: "Fertig" \| "Fertig mit Problemen" \| "Abgebrochen"` und `TONE = { Fertig: …, "Fertig mit Problemen": …, Abgebrochen: … }` sind deutsche Literal-Werte und Schlüssel im Quellcode (CLAUDE.md §5, Owner 2026-09-10) → M1 | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `ExtensionShell.tsx`: kein Hex, kein px (`size={12}` ist eine Stufe der Leiter `IconSize`); `v3.css`: `width: 320px` einmal an `.v3extpop`, wie die Spec es vorsieht. **Story `es--interactive`:** `TONE` ist eine lokale Zustand→Ton-Map für Abgleich-Zustände, obwohl die Achse `duo_sync` in der Registry steht (`src/ludwig/ui/status/status-registry.ts`, `DUO_SYNC_STATES`) → M1 | ✗ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 7/7 Stories; Ausschluss leer/leer nach Filter/lädt/Fehler in Spec und JSDoc begründet. Aber `es--popup`: drittes Popup ohne `Spinner sm`, obwohl 0268 fertig und exportiert ist („bis es ihn gibt, Text allein“) → M2. `es--in-use` folgt im Wortlaut dem Profil (Karte „Abgleichen“, Knopf „Mandant abgleichen“ nach U12, Hinweis nach A7) statt der Spec (Karte „Mandant“, Knopf „Abgleichen“) → H4. `es--narrow` zeigt kein Kennzeichen → H5 | ✗ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe und Importe ✓; Text links ✓; Kontrast ✓ (Zeile Fußzeile); Fokusring sichtbar ✓ (Reiter innen mit `outline-offset: -2px`, nicht vom `overflow` des Reiterstreifens beschnitten; Fußzeilen-Link 2 px außen); keine Bewegung ✓; Hover nur an Klickbarem ✓ (Name und Zeichen: Farbe, Linie, Cursor vor und nach Hover gleich); Icons Lucide 1,5, 12 px aus der Leiter ✓; Schrift aus der Skala ✓ (`h1` 16 px/600, Inhalt 13,5 px, Fußzeile 12,5 px, Popup-Name 14 px/600); Überschrift mit Klasse ✓. **Verstoß „Baustein mit innerem Scrollen im Raster-Kind nur mit `minmax(0, …)`“:** `.v3ext` setzt nur `grid-template-rows`, die Spalte ist `auto` und wächst auf die Mindestbreite der Reiterzeile → M3 (letzte Zeile). Lokale Map der Story → M1. Fußzeilen-Link 90 × 18,75 px → H7; `main` `position: static` → H6 | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 7 `es--*` bei 1280 px gerendert, Zeichen geladen (`naturalWidth > 0`), keine Konsolenfehler oder -warnungen; dazu die vier Tafeln `seiten-duo-connect-*--board` bei 1440 px ohne Konsolenmeldung (34 Rahmen, 4 Popups zu je 320 px) | ✓ |
| Props Zeichen für Zeichen; `@when`/`@instead`; Gegenverweise | `ExtensionShell`: `markSrc: string`, `productName: string`, `environment?: string`, `nav?: ReactNode`, `children: ReactNode`, `version?: string`, `links?: { label: string; href: string }[]` = Tabelle. `ExtensionPopup`: `markSrc: string`, `productName: string`, `environment?: string`, `status: ReactNode`, `action: { label: string; onClick: () => void }` = Tabelle. `@when` nennt die Seite im Tab bzw. das Toolbar-Popup; `@instead` von `ExtensionShell` → `AppShell`, `PageHeader`, `ExtensionPopup`. `git diff` `AppShell.tsx`, `PageHeader.tsx`: je nur der `@instead`-Satz auf `ExtensionShell` | ✓ |
| Kopf: Zeichen 32 px, `alt=""`; einziges `h1`; Kennzeichen | `es--filled`: `img.v3ext__mark` 32 × 32 px, `alt=""`; sichtbare `h1` im Dokument genau eine, „Ludwig DUO-Connect“, im `header` (die zwei `h1` des Storybook-Iframes, „No Preview“ und `#error-message`, sind nicht gerendert). Ohne `environment`: Kinder von `.v3ext__brand` = `IMG`, `H1`, kein Kennzeichen im DOM. `es--with-environment`: drittes Kind `span.bdg.bdg-neutral` „Staging“ (Ton nach Offener Frage 1) | ✓ |
| Fluchtlinie bei 1280 ±1 px; Inhaltsbreite 720 bei 1600 (`InUse`) | `es--in-use`, linke Kante in px: bei 1280 Zeichen 280 · erster Reiter 280 · Hinweis 280 · Karte 280 · Fußzeile 280 (±0). Bei 1600 überall 440, `.v3ext__body` 720 px; ebenso 720 bei 960/1100/1280/1400/1920, bei 700 px Fenster 636 (Rand 32). Das Wort im Reiter steht 16 px eingerückt (Polster des Reiters) | ✓ |
| `main` einziger Scroll-Container; Kopf und Reiter bleiben; Fokus nicht verdeckt (2.4.11) | `es--interactive` (Verlauf, 300 Zeilen): einziges Element mit `overflow: auto` und `scrollHeight > clientHeight` ist `main.v3ext__main` (14346/701). Nach Mausrad bleibt `document.scrollingElement.scrollTop` 0 (800/800), `main.scrollTop` 0 → 6000; Kopfband 0–98,9 px, `h1` bei 17,2 px, Reiterliste bei 56 px vorher wie nachher. Kein `position: sticky` in `main`. Fokus: Zeile 121 an die Oberkante von `main` gescrollt, `Shift+Tab` auf die darüber verborgene Zeile → sie wird in `main` hineingescrollt, `elementFromPoint` trifft das fokussierte Element selbst; in 40 weiteren `Shift+Tab` 0 verdeckt | ✓ |
| Fußzeile: Text, Link extern, Hover, Kontrast | `es--filled`: Text „Version 0.10.2 · Datenschutz“; Link `https://…` mit `target="_blank"`, `rel="noopener"`, `svg.lucide-external-link` 12 × 12 px, Strich 1,5; Hover: `text-decoration-line` none → underline, Farbe `#1A3A5C`; Text `#5C5C5C` auf `#F4F6F8` 6,17:1 (Hover 10,75:1) | ✓ |
| Landmarken; Reiterliste mit `aria-label`; Fokusreihenfolge | `es--filled`: je 1 `header`, `nav` (ohne `aria-label`), `main`, `footer` (in `main`); `[role=tablist][aria-label="Bereiche"]` in `nav`. Tab ab Seitenanfang: Abgleich → Verlauf → Einstellungen (nav) → „Mandant abgleichen“ (main) → „Datenschutz“ (footer) | ✓ |
| 390 px: eine Spalte, kein waagerechtes Scrollen, Name und Kennzeichen, drei Reiter; 1280 ohne Regel für schmale Breiten | `es--narrow`, Iframe 390 (innen 388): `scrollWidth` 388 = `clientWidth`, Rand 16 px, `.v3ext__body` eine Spalte 356 px, Reiter enden bei 117,9/200,4/323,2 px, alle drei sichtbar. Kennzeichen (fehlt in `Narrow`, H5): `es--with-environment` bei Fenster 390, `h1` und „Staging“ sichtbar (`elementFromPoint`), `scrollWidth` 390 = `clientWidth`. 1280: `es--in-use`, `es--with-environment`, `es--filled` mit und ohne `@media (max-width: 639.98px)` (per CSSOM entfernt), `scripts/png-diff.mjs`: 1 / 307 / 0 Pixel; Gegenprobe mit derselben Regel gelöscht und unverändert wieder eingesetzt: dieselben 307 Pixel → Rasterrauschen, kein Unterschied durch die Regel | ✓ |
| Popup: 320 px, Live-Region, ein Knopf, Fokus, `Enter` | `es--popup-interactive`: `.v3extpop` 320 × 135,7 px, Polster 16 px, Zeichen 24 × 24 `alt=""`, Name als `span` 14 px/600, kein `h1`. Ein `[role=status]` „Nicht verbunden“; nach `Enter` derselbe Knoten mit „Verbunden als Anna Schmidt“ (Live-Region vor dem Wechsel im DOM). Genau ein Bedienelement, `button.v2btn--primary.v2btn--full` 288 × 34,8 px (volle Innenbreite). `document.activeElement` nach dem Laden = Knopf; `Enter` → „Seite geöffnet: 1“, Klick → 2. `es--popup`: drei Popups zu je 320 px | ✓ |
| Popup in entpackt geladener Test-Erweiterung: Höhe = Inhalt, keine Bildlaufleiste, 320 px | Selbst versucht (rund 2 min): Chrome for Testing 158.0.8127.18 (Playwright-Paket chromium-1254), `--load-extension` einer Kopie von `ext-test/` mit dem CSS des Arbeitsbaums, Popup per `chrome.action.openPopup({ windowId })`, gemessen über CDP am Ziel `popup.html`. Mit Fenster scheitert es an „Cannot show popup for an inactive window“ (macOS fokussiert kein im Hintergrund gestartetes Fenster), mit `--headless=new` öffnet es. Ergebnis: `innerWidth` 320 ✓, Fokus auf „Abgleich öffnen“ ✓, Bild `0263-popup-real-extension.png` ohne sichtbare Leiste — aber Chrome gibt dem Popup 135 px Höhe bei 135,72 px Inhalt: `documentElement.scrollHeight` 136 > `clientHeight` 135, `scrollTop` lässt sich auf 1 setzen, das Popup scrollt 1 px. Gleich mit `html, body, #root { height: auto }`: Ursache ist die gebrochene Inhaltshöhe, nicht `app-chrome.css` → M4. Der Ersatznachweis des Bauers (statische Kopie des Markups) belegt Breite und Höhe, nicht die Bildlaufbarkeit. Nachholbar beim Einbau im Plugin: ja, mit der echten React-Seite, unter Windows (klassische Leisten) | ✗ |
| Kein `"use client"`; keine Animation | `ExtensionShell.tsx`: kein `use client`, keine Hooks; `.v3ext*`/`.v3extpop*` ohne `transition`/`animation` | ✓ |
| `AppShell`, `PageHeader`, `Tabs` unverändert bis auf `@instead` | `git diff`: `AppShell.tsx` und `PageHeader.tsx` je zwei Kommentarzeilen (`@instead`), `Nav.tsx` unverändert; die Linie der Reiterleiste wird nur unter `.v3ext__nav` abgeschaltet | ✓ |
| Nachtrag: `Interactive` mit `DataTable` in `Card` — 1440/960 Tabelle, 600 Zeilenkarten | Container `v2tbl / inline-size` an `.v2tbl__scroll` und `.v2tbl` auf allen Breiten. 1440 und 960: Tabelle 718 px (Karte 720), `.v2tbl__row` `display: grid`, Kopfzeile sichtbar, Kartenwörter `display: none` — Tabelle. 600: Tabelle 566 px, Zeile `display: flex`, Kopf `none`, Kartenwörter sichtbar — Zeilenkarten (Bilder `0263-interactive-960.png`, `-600.png`). Ebenso Karten bei 700 (634 px) und 640 (574 px): die Form folgt der Spalte. Mit klassischer Leiste (15 px, per `::-webkit-scrollbar` nachgestellt) bei 960: Tabelle 703 px, bleibt Tabelle | ✓ |
| Nachtrag: App bei 960 unverändert (Bildvergleich ≤ 0,5 %) | Fenster 960, je Story ein Bild mit dem CSS des Arbeitsbaums und eines nach Entfernen aller 17 `v3ext`-Regeln per CSSOM; `node scripts/png-diff.mjs app-before app-after 0.5` Exit 0: `v3-primitives-rahmen-appshell--in-use` 0,000 %, `v3-patterns-arbeitsfläche-datatable--filled` 0,000 %, `--in-use` 0,028 % (926 Pixel in einer Zeile y = 184; dieselben 926 Pixel zeigt eine Gegenprobe mit einer wirkungslosen Regel, also Rauschen), `--phone-cards` 0,000 % | ✓ |
| Verhalten „Schmal“: „die Seite scrollt nie waagerecht“ (WCAG 1.4.10, 320 CSS-px = 1280 bei 400 %) — nicht als Kriterium gelistet, Mangel der Spec | `es--in-use` bei Fenster 320: `scrollWidth` 339 > 320, Karte rechts abgeschnitten (Bild `0263-inuse-320.png`); ab 340 px gut. Ursache: `.v3ext` ohne Spaltenangabe, die `auto`-Spalte wächst auf die Mindestbreite der nicht umbrechenden Reiterzeile (307 + 2 × 16 px). Gegenprobe im Browser: `.v3ext { grid-template-columns: minmax(0, 1fr) }` → 320 = 320, die Reiterzeile scrollt selbst (307/288) → M3 | ✗ |

**Mängel (vor Freigabe beheben)**

- **M1** `ExtensionShell.stories.tsx`, `Interactive`: deutsche Literal-Werte
  (`state`) und lokale `TONE`-Map statt `StatusBadge axis="duo_sync"` mit den
  Schlüsseln aus `DUO_SYNC_STATES`.
- **M2** `ExtensionShell.stories.tsx`, `Popup`: drittes Popup ohne
  `Spinner size="sm"` vor „Abgleich läuft · Musterfirma GmbH“.
- **M3** `v3.css` `.v3ext`: `grid-template-columns: minmax(0, 1fr)` fehlt;
  unter 340 px Fenster scrollt die Seite waagerecht.
- **M4** `v3.css` `.v3extpop`: In der echten Erweiterung scrollt das Popup
  1 px (Inhalt 135,72 px, Fenster 135 px). Die Höhe muss ganzzahlig werden
  oder das Popup-Dokument darf nicht scrollen, mit der Regel an der
  Popup-Klasse (Verhalten „Popup“); danach dieses Kriterium im Plugin unter
  Windows nachholen.

**Hinweise**

- **H1** Showcase `Popup.stories.tsx` D1/D3/D4: die zweite Zeile und in D3
  der Zähler „Beleg 37 von 120“ stehen in `status`, also in der Live-Region;
  im Plugin würde jeder Zählerschritt angesagt. Der Ausbau-Fall
  `detail?: ReactNode` ist mit Profil D1/D3/D4 schon eingetreten.
- **H2** Fußtext: Profil „Ludwig DUO-Connect 0.11.0 · Datenschutz“, Spec und
  Code „Version …“; eine der beiden Quellen braucht einen datierten Nachtrag.
- **H3** Klassische Bildlaufleisten (Windows, wo DATEV läuft): scrollt `main`,
  wird die Spalte 705 statt 720 px breit, ihre rechte Kante steht 15 px links
  der Reiterlinie und springt beim Wechsel zwischen kurzem und langem Bereich
  (Verhalten: „springt nicht“). Nachgestellt per `::-webkit-scrollbar`;
  `scrollbar-gutter: stable` an `main` prüfen.
- **H4** `InUse` folgt dem Profil (U12, A7) statt dem Wortlaut der Spec; Spec
  per Nachtrag angleichen.
- **H5** `Narrow` zeigt kein Kennzeichen; „Kennzeichen sichtbar bei 390 px“
  ist nur über `WithEnvironment` belegbar. Ein Fenster mit `environment` in
  `Narrow` ergänzen.
- **H6** `main` ist `position: static` (wie `.app__main`); ein absolut
  gesetztes Element ohne positionierten Vorfahren im Inhalt (`.v2vh`) entkäme
  dem Scrollbereich (§9). In `Interactive` gemessen: 0 solche Elemente.
- **H7** Fußzeilen-Link 90 × 18,75 px, unter 24 px hoch; WCAG 2.5.8 erfüllt
  über den Abstand (nächstes Ziel 62 px), die Hausregel nennt die Ausnahme für
  Links in einer Textzeile nicht ausdrücklich.
- **H8** Showcase `Frame.tsx`: `POPUP_WIDTH = calc(var(--space-20) * 4)` ist
  eine zweite Quelle für 320 px; die Bausteinzeilen der Popup-Tafel nennen noch
  „Button (volle Breite)“ statt `ExtensionPopup`.
- **H9** `check:css` rot durch 0268 (`dist/ludwig.css` vor dessen H1-Fix
  geschrieben): vor dem Commit `pnpm build:css`.

Abgenommen von / am: **nicht abgenommen** — fremder Prüfer (Claude,
designsystem), 2026-11-27 · Offene Punkte: M1–M4 vor Freigabe; H1–H9 als
Hinweise.

### Nachprüfung 2026-11-27

Derselbe fremde Prüfer, dieselben Mittel: eigene Seite in Playwright gegen
Storybook 6107, das Popup erneut in Chrome for Testing 158.0.8127.18
(chromium-1254, `--headless=new`, Erweiterung entpackt geladen, ein Browser für
alle Fälle, Prozess danach beendet). Geprüft wurden die gemeldeten
Behebungen M1–M4, H1, H3, H4, H5 und H8 sowie die drei Kriterien aus
„Nachtrag 2“. Die Zeilen oben bleiben unverändert stehen. Bilder im
Scratchpad: `0263n-*.png`, `ext-abn3-out/0263n-popup-ext-*.png`,
`app2-before/`, `app2-after/`.

| Punkt | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| Wächter und Build | `pnpm typecheck`, `check:type`, `check:language` und `check:when` mit Exit 0. `check:classes` Exit 1 mit denselben 4 Altbefunden; `v3extpop__detail` hat eine Regel. `check:css` Exit 0: `dist/ludwig.css` ist aktuell und enthält `height:calc-size(auto,round(up,size,1px))` und `scrollbar-gutter:stable` (H9 erledigt). `pnpm build -o <Scratchpad>/sb-build-0263b` Exit 0, `calc-size` steht im gebauten CSS. Alle 7 `es--*` gerendert, keine Konsolenmeldung | ✓ |
| M1 Story ohne deutsche Literale, Status über die Registry | `ExtensionShell.stories.tsx`: `state: DuoSyncState` (`succeeded`, `succeeded_with_issues`, `cancelled`), Spalte `StatusBadge axis="duo_sync"`; `grep`: kein `TONE`, kein deutscher Schlüssel. `es--interactive`: 300 Zeilen mit den Wörtern der Registry („Fertig“ 261 ×, „Fertig mit Problemen“ 26 ×, „Abgebrochen“ 13 ×), `bdg-success` usw., Titel „DUO-Abgleich: Fertig · …“, dazu (i) „DUO-Abgleich: Zustände erklären“ | ✓ |
| M2 `Spinner sm` im laufenden Popup | `es--popup`, drittes Popup: In `[role=status]` steht `span.v3spinner.v3spinner--sm` mit „Abgleich läuft · Musterfirma GmbH“ (Bild `0263n-popup.png`); siehe H11 | ✓ |
| M3 Seite scrollt nie waagerecht | `.v3ext` hat `grid-template-columns: minmax(0, 1fr)`. `es--in-use` bei 390/340/320/300 px: `scrollWidth` = `clientWidth` (390/340/320/300); bei 320 px scrollt die Reiterzeile selbst (307/288). Am Desktop unverändert: bei 1280 px alle linken Kanten bei 280, bei 1600 px bei 440, Inhalt 720 px. Siehe H12 | ✓ |
| M4 Popup in der echten Erweiterung: Höhe = Inhalt, scrollt nicht, 320 px | Test-Erweiterung `ext-abn3`: das Markup aus dem gerenderten `es--popup` (React-Ausgabe; `autofocus` nachgetragen, weil React `autoFocus` per Skript setzt) und `dist/ludwig.css`. Fall a (verbunden, mit `detail`): Fenster 320 × 186, Inhalt 186 px, `scrollHeight` 186 = `clientHeight` 186, `scrollTop` bleibt 0. Fall b (nicht verbunden): 320 × 136, 136/136, 0. Fall c (Staging, Spinner, Zähler): 320 × 172, 172/172, 0. In allen drei Fällen liegt der Fokus auf dem Knopf und `detail` steht nicht in `status` (Bilder `0263n-popup-ext-a/b/c.png`) | ✓ |
| `calc-size()` ohne Unterstützung | Ein Browser ohne `calc-size()` verwirft die Erklärung beim Einlesen, dann gilt `height: auto`. Nachgestellt durch `height: auto` in denselben drei Fällen: Fall da (185,22 px) → Fenster 185 px, kein Bildlauf; Fall db (135,72 px) → Fenster 135 px, `scrollHeight` 136, Bildlauf 1 px; Fall dc (171,22 px) → Fenster 171 px, kein Bildlauf. Das ist genau der Stand vor M4, nicht schlechter. `calc-size()` gibt es ab Chrome/Edge 129 (September 2024), `round()` ab 125. Für Chrome/Edge ab 129 ist das hinnehmbar. Aber das Plugin-Manifest (`ludwig-plugin/src/manifest.json`, Branch `umbau`) setzt keine `minimum_chrome_version`, und das Plugin nennt einen Tester mit Chrome 121 (`docs/todo-veroeffentlichung-0.9.0.md`, `src/sync/downloads.ts`, November 2026) → H10. Gegenprobe zu einem möglichen Rückfall: Fall eb, `html:has(> body > #root > .v3extpop:only-child) { overflow: hidden }` — `overflow: hidden` am Wurzelelement nimmt Leiste und Nutzer-Bildlauf, per Skript lässt sich `scrollTop` weiter auf 1 setzen | ✓ (H10) |
| Nachtrag 2: Zähler in `.v3extpop__detail` außerhalb von `role="status"`; ein Wechsel ändert die Live-Region nicht | `es--popup`: `.v3extpop__detail` „Beleg 37 von 120“ liegt nicht in `[role=status]`, kein Vorfahr trägt `role="status"` oder `aria-live`. `MutationObserver` auf der Live-Region, Zählertext auf „Beleg 38 von 120“ geändert: 0 Änderungen, Text der Live-Region unverändert. `detail` hat 12,5 px (`--fs-ui-sm`), Farbe `#5C5C5C`. Typ `detail?: ReactNode` wie in der Tabelle von Nachtrag 2. Showcase-Tafel `seiten-duo-connect-popup--board`: D1, D3 und D4 haben die zweite Zeile bzw. den Zähler in `detail`, in `status` steht nur die erste Zeile (H1 erledigt) | ✓ |
| Nachtrag 2: `Narrow` zeigt „Staging“ bei 390 und 820 px | `es--narrow`: beide Iframes (innen 818 und 388 px) mit `args=environment:Staging`; „Staging“ und `h1` sichtbar (`elementFromPoint`), `scrollWidth` = `clientWidth`. `es--in-use` ohne Argumente weiter ohne Kennzeichen (H5 erledigt) | ✓ |
| Nachtrag 2: `scrollbar-gutter: stable`; mit klassischen Leisten (15 px) gleiche linke Kante und gleiche Breite in `Filled` und `Interactive` | Berechnet: `main` hat `scrollbar-gutter: stable`. Leisten nachgestellt per `::-webkit-scrollbar` (15 px). Bei 1280 px: `Filled` (scrollt nicht) und `Interactive` (scrollt) mit `main.clientWidth` je 1265 px, Zeichen, Karte und Fußzeile links je bei 280, Inhalt je 705 px. Bei 960 px je 120 / 705 px. Mit Overlay-Leisten bleibt der Inhalt 720 px. Die rechte Spaltenkante steht 15 px vor der Reiterlinie (985 gegen 1000) — so lässt Nachtrag 2 es zu (H3 erledigt) | ✓ |
| H4, H8, H2 | H4: Wortlaut von `InUse` ist in Nachtrag 2 festgehalten. H8: In `Frame.tsx` gibt es kein `POPUP_WIDTH` mehr (`grep`); die Popup-Kacheln nehmen die Breite des Popups, die Bausteinzeilen nennen `ExtensionPopup`. H2: Das Seitenprofil sagt jetzt „Version 0.11.0 · Datenschutz“, mit datiertem Vermerk. Das ist eine Änderung am vom Owner angenommenen Profil, der Owner sollte davon erfahren | ✓ |
| Rückgriff auf bestandene Kriterien | `es--popup-interactive`: Fokus nach dem Laden auf „Einrichten“; nach `Enter` derselbe Knoten der Live-Region mit „Verbunden als Anna Schmidt“, „Seite geöffnet: 1“; Popup 136 px hoch. `es--interactive`: Dokument-`scrollTop` 0 (800/800), `main.scrollTop` 4800, einziger Scroll-Container `MAIN`, Kopf unverändert. App bei 960 px: alle 18 `v3ext`-Regeln per CSSOM entfernt, `node scripts/png-diff.mjs app2-before app2-after 0.5` → `appshell--in-use`, `datatable--filled` und `datatable--phone-cards` je 0,000 %. `git diff`: `AppShell.tsx` und `PageHeader.tsx` nur `@instead`, `Nav.tsx` unverändert; kein `use client`, keine Animation | ✓ |

**Hinweise aus der Nachprüfung**

- **H10** Plugin, vor dem Einbau entscheiden: entweder im Manifest
  `"minimum_chrome_version": "129"` setzen — dann gibt es für alle
  zugelassenen Browser keinen Bildlauf mehr —, oder im Set einen Rückfall unter
  `@supports not (height: calc-size(auto, size))` ergänzen, der nur im
  Popup-Dokument greift. Die Gegenprobe oben hängt am `#root` des Plugins;
  sie ist eine Form, keine fertige Regel. Ohne beides bleibt in Chrome < 129 je
  nach Inhaltshöhe 1 px Bildlauf (gemessen in 1 von 3 Fällen). Unter Windows
  kann dann eine Bildlaufleiste erscheinen; das ist hier nicht prüfbar.
- **H11** Im laufenden Popup steht der Zustand als `Spinner`-Wort in
  `--color-text-muted` (Farbe aus 0268). Die anderen Zustände stehen in
  `--color-text`. Dieselbe Zeile sieht damit je nach Zustand verschieden
  stark aus.
- **H12** `Tabs`, nicht 0263: Bei 320 px schiebt `Tab` den dritten Reiter
  „Einstellungen“ nicht in den Streifen. Seine rechte Kante liegt bei 323,2,
  die sichtbare Kante des Streifens bei 304; `scrollLeft` bleibt 0. Wort und
  Fokusring sind rechts 19 px abgeschnitten. Erst seit M3 sichtbar, denn vorher
  scrollte die Seite. Bei 390 px passen alle drei Reiter.
- H6 und H7 aus der ersten Abnahme sind nicht als behoben gemeldet und
  bleiben Hinweise.

Abgenommen von / am: **abgenommen** — fremder Prüfer (Claude, designsystem),
2026-11-27, Nachprüfung · Offene Punkte: kein Mangel; H10 vor dem Einbau im
Plugin entscheiden; H6, H7, H11, H12 als Hinweise.
