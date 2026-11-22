# 0256 · Schublade: Inhalte des Handy-Blocks auf dunklem Grund (F783 M1)

| | |
|---|---|
| Status | fertig |
| Stufe | `app-chrome.css` (Rahmen), keine neue Komponente |
| Klassen-Test | ja: Bedienelemente auf dunkler Seitenleiste gibt es in jeder App |
| Quelle | ll-dev96 2026-11-22, Bild `app-f783/apps/web/test-results/mobile/m1/drawer-bottom-phone.png` |
| Ersetzt | in der App das Inline-`overflow-x: auto` um den Bereichswechsel |
| Blockiert | nichts (M1 läuft mit Notlösung) |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

In der Schublade (0253, `.sb__phone`) stehen auf dem Handy Rollenabzeichen, Bereichswechsel und der Verweis „Wie die Kanzlei“. Zwei Bausteine sind für hellen Grund gebaut:

- **Bereichswechsel:** `Segmented` mit drei Bereichen ist etwa 311 px breit, die Schublade aber 300 px. Die App lässt ihn heute seitlich scrollen. Außerdem steht er als heller Block im dunklen Grund.
- **„Wie die Kanzlei“:** `.v2link` steht in `--color-accent-700` auf Dunkelblau und ist kaum lesbar (V10 verlangt Text ≥ 4,5:1).

## Einordnung

- **Erweitern, nicht neu:** Die Bausteine bleiben `Segmented` und `.v2link`. Nur ihre Darstellung **im Block `.sb__phone`** folgt der Seitenleiste (benannte Ausnahme A5 von `app-chrome.css`: rohe rgba-Werte der dunklen Leiste).
- **Vorbild in der Leiste:** `.sb__navitem`.
  - In Ruhe: Text `--color-text-on-dark-muted`, kein Grund.
  - Aktiv: Grund `rgba(255,255,255,0.10)`, Text `--color-text-on-dark`.
  - Hover: `rgba(255,255,255,0.06)`.
- Kein neues Wort, kein neuer Token.

## Schnittstelle

Nur CSS, unter 640 px (`.sb__phone` ist darüber `display: none`):

| Selektor | Wirkung |
|---|---|
| `.sb__phone .v2seg` | untereinander statt nebeneinander (`flex-direction: column`), volle Breite, ohne hellen Grund |
| `.sb__phone .v2seg__btn` | links ausgerichtet, mindestens 40 px hoch, Farben wie `.sb__navitem` (Ruhe, Hover, aktiv) |
| `.sb__phone .v2link` | Text `--color-text-on-dark` und unterstrichen, damit der Verweis sich vom Text abhebt |

## Verhalten

- Am Desktop und auf dem Tablet ändert sich nichts. `.sb__phone` ist dort nicht da, und die Regeln stehen in `@media (max-width: 639.98px)`.
- Fokusring `--color-focus` auf dem dunklen Grund ≥ 3:1. Gemessen wird gegen `#14304B`, die Mitte des Verlaufs.

## Stories

Keine neue Story. `AppShell/Phone` bekommt im `.sb__phone`-Block einen Bereichswechsel (`Segmented`, drei Bereiche) und einen `.v2link` „Wie die Kanzlei“.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde)
- [ ] Im Browser angesehen

Variabel (`AppShell/Phone` bei 390, Schublade offen):

1. Der Bereichswechsel passt in die Schublade: `scrollWidth <= clientWidth` am `.v2seg` und an `.sb__phone`. Die drei Einträge stehen untereinander, jeder ≥ 40 px hoch.
2. Kontrast gemessen:
   - Eintrag in Ruhe und aktiv ≥ 4,5:1 gegen den Grund der Schublade an seiner Stelle.
   - „Wie die Kanzlei“ ≥ 4,5:1.
   - Fokusring ≥ 3:1.
3. Der aktive Eintrag ist ohne Farbe erkennbar: Er hat Grund und trägt `aria-current`.
4. Desktop unverändert: `png-diff` über die 37 Stories von 0253 endet mit Exit 0.
5. Bei 820 und 1440 ist `.sb__phone` weiter `display: none`.

## Nachtrag 2026-11-22 (nach der Schlussprüfung, vom Spec-Autor)

H5 aus der Schlussprüfung ist umgesetzt: Die Hover-Regel des Verweises heißt `.sb__phone .v2link:hover:not(:disabled)`, sonst setzt `v3.css` die Strichstärke mit seiner Kurzform zurück. Gemessen bei 390: `text-decoration-thickness` ist in Ruhe `auto`, bei Hover `2px`. Kein Kriterium ändert sich.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Typcheck, Build, Wächter | `pnpm typecheck`, `check:type`, `check:language`, `check:contrast` je Exit 0; `pnpm build` Exit 0. `check:classes` Exit 1 nur mit den vier bekannten Altfunden (v3clt__step, v3clt, v2tbl__foot, cy-page), kein neuer | ✓ |
| Fest: im Browser angesehen | `AppShell/Phone` bei 390 × 844, „Menü“ geklickt, Schublade offen (`.app--nav-open`); Bild `.playwright-mcp/0256-phone-drawer.png` | ✓ |
| 1 Passt in die Schublade | `.v2seg` scrollWidth 268 = clientWidth 268, `.sb__phone` 300 = 300; `flex-direction: column`, drei Einträge bei y 425 / 467 / 509, je 268 × 40 px, Text links | ✓ |
| 2 Kontrast | Grund aus dem Verlauf an der y-Lage, gegengeprüft am Pixel. Aktiv: Weiß auf 10 % Weiß über dem Verlauf (≈ 43,69,93) 9,6–10,1:1. Ruhe: #B8C5D3 auf ≈ #132F49 … #122C45 7,8–8,1:1. „Wie die Kanzlei“: Weiß 14,2:1. Fokusring per Tab (`:focus-visible`), 2 px #3B8FC4 mit Abstand 2 px: gegen #14304B 3,80:1, an der echten Lage 3,8–4,05:1 (Bilder `0256-focus-*.png`) | ✓ |
| 3 Aktiv ohne Farbe | Aktiver Eintrag hat Grund `rgba(255,255,255,0.10)` und `aria-current="true"`, die anderen `aria-current="false"` und keinen Grund | ✓ |
| 4 Desktop unverändert | 37 Stories neu aufgenommen (1440 × 900, ganze Seite, Animationen aus, Maus auf 0,0, 600 ms nach networkidle, eine Story zum Aufwärmen) nach `.playwright-mcp/0256-after/`; `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/0256-after 0.5` Exit 0, höchste Abweichung 0,001 % | ✓ |
| 5 Tablet und Desktop ohne Block | `AppShell/Phone` bei 820 und 1440: `.sb__phone` `display: none`, Höhe 0; `.v2seg` dort unverändert (Zeile, heller Grund), `.v2link` in Akzentblau | ✓ |

H1 Der Kommentar in `app-chrome.css` nennt „#B8C5D3 on #1F4670: 5.7:1“. Nachgerechnet sind es 5,52:1 (weiter ≥ 4,5). `check:contrast` prüft die Zahl nicht, weil kein Token genannt ist.

H2 Fokusring an einem Eintrag in Ruhe direkt unter dem aktiven: Die obere Kante liegt auf dem Grund des aktiven Eintrags (Abstand 2 px = Lücke 2 px) und hat dort 2,85:1. Die anderen drei Seiten liegen bei 3,8:1 und mehr, das Kriterium (gegen #14304B) ist erfüllt. Liegt der Block in einem kurzen Fenster höher im Verlauf, sinkt der Ring gegen #1F4670 bis 2,73:1.

H3 `.sb__phone .v2link` ist schon in Ruhe unterstrichen. Hover ändert deshalb nichts (gemessen: Farbe, Linie, Grund gleich). Das ist wenig gewichtig, weil der Block nur unter 640 px erscheint.

H4 „Wie die Kanzlei“ erbt in der Story 16 px / 600 und steht damit größer als die Einträge (14 px / 500) und die Mandantenzeile.

### Schlussprüfung 2026-11-22

Geprüft nach den Änderungen in `app-chrome.css` zu H1–H4, wieder `AppShell/Phone` bei 390 × 844, Schublade offen.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| H1 Kommentar | nennt jetzt 5,5:1 (gerechnet 5,52:1) | ✓ |
| H2 Fokusring unter dem aktiven Eintrag | Abstand jetzt 4 px. „Kundenbetreuung“ per Tab fokussiert: Der Ring (y 465,35–467,35) liegt ganz in der Lücke auf dem Verlauf. Die Pixel daneben (19,46,73) ergeben 3,86–3,91:1, also mehr als vorher an dieser Stelle. Seine Oberkante stößt bündig an den Grund des aktiven Eintrags (44,68,92), gegen den er 2,83:1 hat. Der Ring liegt nicht mehr auf diesem Grund, er grenzt nur noch an ihn. Bild `.playwright-mcp/0256-final-focus-rest.png` | ✓ |
| H3 Hover am Verweis | nicht wirksam. Beim Hover bleibt `text-decoration-thickness` `auto`, das Bild vor und nach dem Hover unterscheidet sich in 0 Pixeln. Ursache: `.v2link:hover:not(:disabled) { text-decoration: underline }` in `v3.css` hat dieselbe Spezifität (0,3,0) wie `.sb__phone .v2link:hover`. Es steht in `index.css` nach `app-chrome.css`, und die Kurzschreibweise setzt die Dicke zurück | ✗ (Hinweis, kein Kriterium) |
| H4 Schrift des Verweises | 14 px / 500, gleich den Einträgen (14 px / 500) | ✓ |
| Kriterium 1 | `.v2seg` 268 = 268, `.sb__phone` 300 = 300, Einträge je 268 × 40 px bei y 425 / 469 / 513, Seitenleiste scrollt nicht (844 = 844) | ✓ |
| Kriterium 4 | 37 Stories neu nach `.playwright-mcp/0256-final/`, `png-diff … 0.5` Exit 0, höchste Abweichung 0,001 % | ✓ |
| Typcheck, Wächter | `pnpm typecheck` Exit 0; `check:classes` Exit 1 nur mit den vier Altfunden; `check:contrast` Exit 0 | ✓ |

H5 (aus H3) Damit der Hover wirkt, braucht die Regel eine höhere Spezifität, z. B. `.sb__phone .v2link:hover:not(:disabled)`.

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-22, Schlussprüfung 2026-11-22 · Offene Punkte: H3/H5 (Hover am Verweis wirkt nicht), hindert die Abnahme nicht
