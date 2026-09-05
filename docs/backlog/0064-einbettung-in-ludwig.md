# 0064 · Einbettung in `ludwig/app` — das Repo wird Submodule

| | |
|---|---|
| Status | fertig |
| Stufe | — (Infrastruktur, keine Komponente) |
| Quelle | README „Das Repo wird später als Git-Submodule in `ludwig/` eingebunden" · `app/docs/design-system.md` · Owner-Anfrage 2026-09-04 |
| Ersetzt | in der App: `src/styles/{tokens,app-chrome,components,booking}.css` (Kopien) und `src/styles/v2.css` (bis auf 6 Klassen) |
| Blockiert | jede Ablösung `@/ui/v2` → v3 in der App (39 Dateien) |
| Angelegt von / am | Claude, 2026-09-04 |

## Ziel

Die App importiert die v3-Bausteine aus `@ludwig/designsystem` statt aus
einer Kopie. Das Design-System bleibt ein eigenes Repo mit eigener Werkbank,
eigenen Regeln und eigenem Backlog; die App hängt es als Git-Submodule unter
`packages/designsystem` ein und konsumiert die **Quelle** — kein Build, kein
Publish, kein Kopierskript. Ab dann ist `grep -rl "@/ui/v2" apps/web/src`
der Restbestand der Migration (Start: 39 Dateien).

## Entscheidungen

- **Submodule, nicht Monorepo.** Die Trennung ist gewollt (eigenes CLAUDE.md,
  Spec → Bau → fremde Abnahme); ein Submodule lässt sich später einschmelzen,
  umgekehrt nicht. Verworfen: Paket-Publish (Build-Pipeline, bremst bei
  wöchentlichem Zuwachs), Git-Dependency (Vercel-Token, `pnpm link`),
  Vendoring (zwei Kopien, Drift).
- **Quell-Konsum.** `package.json` exportiert schon `./src/ui/v3/index.ts`;
  Next kompiliert das über `transpilePackages`. Toolchain beidseits identisch
  (next 16, react 19, tailwind 3.4, TS 5.7).
- **`@/ludwig/*` bleibt.** Sieben Imports im DS zeigen auf den Typ-Spiegel
  (`shared/money`, `modules/accounting-cases`, `…/domain/tax-keys`). In der
  App löst ein zusätzlicher tsconfig-Pfad `"@/ludwig/*": ["./src/*"]` sie auf
  die **echten** Dateien auf (längster Präfix gewinnt). Geprüft: der echte
  Barrel `modules/accounting-cases/index.ts` ist Public API ohne
  `server-only`; die Deep-Import-Sperre der App lintet `packages/` nicht.
- **`v3.css` ersetzt `v2.css`.** 293 der 299 Klassen aus `v2.css` stehen
  unter gleichem Namen in `v3.css` — beide laden hieße, v3 überschreibt v2
  still. Die 6 Klassen, die nur v2 kennt (`abn__progress`,
  `abn__progress__text`, `abn__screenhead`, `abn__screenhead__lead/nav/row`,
  in der App benutzt), bleiben als Rest in der App-Datei `v2.css`.
- **Domänentypen aus der konkreten Datei, nie vom Modul-Barrel.** Der
  Spiegel-Barrel `src/ludwig/modules/<modul>/index.ts` ist generiert und
  exportiert mehr als der echte (`ClarificationType`, `ExpectationKind`
  fehlen drüben) — `CaseTimeline` importiert deshalb aus
  `…/accounting-cases/domain/case`, wie `tax-assist` aus `…/domain/tax-keys`.
- **Die App prüft strenger** (`noUncheckedIndexedAccess`,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`) und prüft damit alles,
  was sie aus dem Submodule kompiliert. Fünf Stellen in `LogBrowser`,
  `AmountInput`, `Selection` sind angepasst. Offen (Owner): die Flags auch
  hier setzen — heute stünden dann 46 Fehler in Stories, die die App nie
  kompiliert.
- **Styles als Subpfad exportiert** (`./styles/*` → `./src/styles/*`): mit
  `exports` in der `package.json` wären Deep-Imports auf `src/styles/…`
  sonst gesperrt. Die App lädt `@ludwig/designsystem/styles/<name>.css`.
- **Nicht `styles.css` des DS importieren.** Die Kette dort lädt Google-Fonts
  und Tailwind-Base — die App hat beides schon. Die App importiert die
  Einzeldateien.

## Teil A — Git-Projekt vorbereiten (dieses Repo)

Ein Commit auf `main`, nur eigene Dateien stagen (hier laufen andere
Sitzungen; Änderungen an `DataTable`, `JournalEntryEditor`, 0055–0057 sind
fremd).

1. **Alias-Imports, die in der App brechen würden.** Zwei Stellen von
   `@/ui/v3/patterns/StatusBadge` auf relative Pfade:
   `entities/journal-entry/AiBookingNotes.tsx` und
   `entities/journal-entry/JournalEntryEditor.tsx`
   (`../../patterns/StatusBadge`). `JournalEntryEditor.tsx` hat fremde
   uncommittete Änderungen — nur die Import-Zeile ändern und die Datei
   trotzdem nicht stagen, wenn `git diff` mehr als diese Zeile zeigt; dann
   im Bericht nennen.
2. **`package.json`:** `react`, `react-dom`, `next` zusätzlich als
   `peerDependencies` (die App liefert sie; für Storybook bleiben sie in
   `devDependencies`, aus `dependencies` raus). `pnpm install`, damit das
   Lockfile stimmt.
3. **`scripts/sync-ludwig.sh`:** Default-Quelle findet die App an beiden
   Orten — `../app/apps/web/src` (Repo neben der App) oder
   `../../apps/web/src` (als Submodule unter `app/packages/`). Erster
   Treffer gewinnt, `LUDWIG_SRC` überstimmt weiter.
4. **README:** „wird später als Submodule eingebunden" → ist eingebunden:
   Remote, Pfad in der App (`packages/designsystem`), Import-Name
   `@ludwig/designsystem`, und dass die App nur `src/styles/*.css` einzeln
   lädt. In `docs/design-guidelines.md` den Vorspann kürzen: die alten
   Fassungen in der App sind bereits gelöscht.
5. **Remote und Push.** `git remote add origin
   git@github.com:ludwig-steuer/ludwig-designsystem.git`, dann
   `git push -u origin main`. Das Remote existiert und ist leer.

Prüfung: `pnpm typecheck` grün (Baseline war grün), `pnpm build` grün.

## Teil B — Einbettung in `ludwig/app`

Ein Commit auf `staging` (Hausstil: Sitzungen committen direkt, nur eigene
Dateien), **nicht pushen**. Die App hat fremde uncommittete Änderungen
(`BelegDrawer`, `Pruefen`, `AGENTS.md`, `docs/`) — nicht anfassen.

1. **Submodule:** `git submodule add
   git@github.com:ludwig-steuer/ludwig-designsystem.git packages/designsystem`
2. **Workspace:** `pnpm-workspace.yaml` bekommt `packages/designsystem`;
   `apps/web/package.json` bekommt `"@ludwig/designsystem": "workspace:*"`;
   `pnpm install` (Lockfile mitcommitten).
3. **`apps/web/next.config.ts`:** `transpilePackages: ["@ludwig/designsystem"]`.
4. **`apps/web/tsconfig.json`:** in `paths` zusätzlich
   `"@/ludwig/*": ["./src/*"]`.
5. **`apps/web/tailwind.config.ts`:** `content` um
   `"../../packages/designsystem/src/ui/**/*.{ts,tsx}"` ergänzen (das DS
   nutzt `sr-only`).
6. **`apps/web/src/app/globals.css`:** die vier Imports `tokens`,
   `app-chrome`, `components`, `booking` auf
   `@ludwig/designsystem/styles/<name>.css` umbiegen; die vier Kopien
   unter `apps/web/src/styles/` löschen. `v3.css` aus dem DS an die Stelle
   von `v2.css` importieren; `v2.css` auf die 6 Rest-Klassen kürzen
   (Kommentar oben: warum der Rest, wo der Rest hingehört — die
   Abnahme-Seite) und **nach** `v3.css` laden.
7. **Rauchtest:** einen `@/ui/v2`-Import durch `@ludwig/designsystem`
   ersetzen — eine Komponente, deren v3-Props mit den v2-Props deckungsgleich
   sind (Kandidat `Button`; `pnpm typecheck` entscheidet). Passt keine ohne
   Änderung am Aufrufer, den Tausch weglassen und im Bericht sagen.
   `pnpm --filter @ludwig/web typecheck` und `pnpm --filter @ludwig/web build`
   grün.
8. **Doku:** `docs/design-system.md` von „später" auf den Ist-Zustand
   (Pfad, Import-Name, `git clone --recurse-submodules` bzw.
   `git submodule update --init`, wie man den Pointer hebt). `CHANGELOG.md`
   unter `[Unreleased]` eine Zeile.

## Ausbau

Gilt nicht: keine Komponente, keine Schnittstelle (A12 betrifft Props). Was
nach der Einbettung ansteht, steht in Teil B.

## Abnahmekriterien

- [ ] DS: `pnpm typecheck` und `pnpm build` grün; `origin/main` zeigt auf den Commit
- [ ] DS: kein `from "@/ui/` mehr außerhalb von Stories
- [ ] App: `pnpm --filter @ludwig/web typecheck` grün
- [ ] App: `pnpm --filter @ludwig/web build` grün (`@/ludwig/*` aus dem Submodule löst auf — geprüft, kein Fallback nötig)
- [ ] App: `apps/web/src/styles/{tokens,app-chrome,components,booking}.css` gelöscht, `v2.css` nur noch die 6 Rest-Klassen
- [ ] App: kein `git add -A`; `git show --stat HEAD` zeigt nur die Dateien aus Teil B
- [ ] Owner: eine v2-lastige Seite und die Abnahme-Seite im Browser angesehen (tokens.css hat die `h1–h4`-Elementregeln verloren; laut Messung wirkungslos, weil Preflight danach lädt — im Browser bestätigen)

## Abnahme

Diese Aufgabe ist keine Komponente: abgenommen wird die **Verdrahtung** der
beiden Repos, nicht eine Oberfläche. Die Kriterien mit Präfix „App" lassen sich
in diesem Repo nicht ausführen; was von hier aus **lesend** am
Arbeitsverzeichnis `../app` zu sehen war, steht als Beobachtung daneben.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| DS: `pnpm typecheck` und `pnpm build` grün; `origin/main` zeigt auf den Commit | `pnpm typecheck` am 2026-09-05, Exit 0. `pnpm build` bewusst nicht erneut gestartet (parallele Abnahmen im selben Repo); der Lauf für diesen Stand meldete „Storybook build completed successfully". `git remote -v` → `git@github.com:ludwig-steuer/ludwig-designsystem.git`; `git rev-parse origin/main` = `8ac5e2e` = lokaler `HEAD` | ✓ |
| DS: kein `from "@/ui/` mehr außerhalb von Stories | `grep -rn 'from "@/ui/' src \| grep -v '\.stories\.'` → leer; die beiden verbliebenen Treffer stehen in `src/showcase/AcceptanceFlow.stories.tsx:33` und `src/showcase/CaseCrud.stories.tsx:43`. Stichprobe Teil A/1: `entities/journal-entry/AiBookingNotes.tsx:17` und `JournalEntryEditor.tsx:9` importieren `StatusBadge` relativ | ✓ |
| App: `pnpm --filter @ludwig/web typecheck` grün | in diesem Repo nicht ausführbar | offen (App) |
| App: `pnpm --filter @ludwig/web build` grün | in diesem Repo nicht ausführbar | offen (App) |
| App: `src/styles/{tokens,app-chrome,components,booking}.css` gelöscht, `v2.css` nur noch die 6 Rest-Klassen | nicht ausführbar; **beobachtet** in `../app`: `apps/web/src/styles/` enthält nur noch `beleg-detail`, `contract-review`, `kontoauszug`, `purpose`, `sachverhalt` und `v2.css`; `v2.css` hat 27 Zeilen und genau die sechs Klassen `abn__progress`, `abn__progress__text`, `abn__screenhead`, `…__lead`, `…__nav`, `…__row`. `globals.css` lädt `tokens`, `app-chrome`, `components`, `booking` und `v3.css` als `@ludwig/designsystem/styles/*` und `v2.css` **danach** | offen (App) |
| App: kein `git add -A`; `git show --stat HEAD` zeigt nur die Dateien aus Teil B | nicht ausführbar; **beobachtet**: der Einbettungs-Commit ist `ca1379ce` auf `staging` und listet 17 Dateien — `.gitmodules`, `CHANGELOG.md`, `next.config.ts`, `apps/web/package.json`, `globals.css`, `KontoQuittung.tsx`, die vier gelöschten Style-Kopien, `v2.css`, `tailwind.config.ts`, `tsconfig.json`, `docs/design-system.md`, `packages/designsystem`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`. Keine fremde Datei darin | offen (App) |
| Owner: eine v2-lastige Seite und die Abnahme-Seite im Browser angesehen | Owner-Schritt, in diesem Repo nicht durchführbar | offen (App) |

### Stimmen die Aussagen der Aufgabe heute noch?

Ja — mit einer Einschränkung, die nicht die Aufgabe betrifft, sondern ihren
Nachlauf. Nachgesehen am 2026-09-05:

| Aussage von 0064 | Stand heute |
|---|---|
| Submodule unter `packages/designsystem`, Import-Name `@ludwig/designsystem` | eingelöst: `.gitmodules` trägt Pfad und Remote; `pnpm-workspace.yaml` listet `packages/designsystem`; `apps/web/package.json:25` hat `"@ludwig/designsystem": "workspace:*"` |
| Quell-Konsum über `transpilePackages` | eingelöst: `apps/web/next.config.ts:21` |
| `@/ludwig/*` löst in der App auf `./src/*` auf | eingelöst: zusätzlicher Pfad in `apps/web/tsconfig.json` |
| Tailwind sieht die Klassen des Submodules | eingelöst: `content` enthält `../../packages/designsystem/src/ui/**/*.{ts,tsx}` |
| `v3.css` ersetzt `v2.css` bis auf 6 Klassen | eingelöst, Zahl stimmt (siehe Tabelle oben) |
| Rauchtest: ein `@/ui/v2`-Import gegen das Paket getauscht | eingelöst: `apps/web/src/modules/stapelabnahme/ui/KontoQuittung.tsx:6` importiert `Button` aus `@ludwig/designsystem` |
| „Ab dann ist `grep -rl "@/ui/v2" apps/web/src` der Restbestand (Start: 39 Dateien)" | stimmt, und der Zähler steht unverändert bei **39** — die Ablösung hat noch nicht begonnen |

**`apps/web/src/ui/v3` gibt es in der App nicht — und das ist richtig so.** Die
Aufgabe hat genau das versprochen: die App bekommt **keine** eigene v3-Kopie,
sie konsumiert die Quelle aus dem Submodule. Das Fehlen des Ordners ist der
eingelöste Entscheid „Submodule, nicht Vendoring", kein offener Punkt. Was
daraus folgt und der Text noch nicht sagt: **v3 ist in der App bisher nur
verdrahtet, nicht benutzt** — ein einziger TypeScript-Import
(`KontoQuittung.tsx`), sonst Stylesheets. Die 39 `@/ui/v2`-Dateien sind der
ganze Rest.

**Eine Beobachtung, die in der App nachzuziehen ist** (kein Mangel dieser
Aufgabe, weil sie beim Anlegen so nicht existierte): der Zeiger des Submodules
steht in `staging` auf `95061b3` („0064 zur Abnahme", 2026-09-04), während
`main` hier bei `8ac5e2e` (2026-09-05) steht. Zusätzlich meldet
`git submodule status` in der App ein `+` — der ausgecheckte Stand des
Submodules (`cff1b5c`) weicht vom aufgezeichneten Zeiger ab. Alles, was seither
im Set entstanden ist (0059–0061 eingeschlossen), erreicht die App erst, wenn
jemand den Zeiger hebt und committet; `docs/design-system.md` beschreibt den
Handgriff bereits. Beides ist read-only festgestellt, in der App wurde nichts
angefasst.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: die
vier App-Kriterien bleiben offen — sie gehören in eine Sitzung in `ludwig/app`
(typecheck, build, Owner-Blick auf zwei Seiten). Auf der Seite dieses Repos ist
nichts offen.
