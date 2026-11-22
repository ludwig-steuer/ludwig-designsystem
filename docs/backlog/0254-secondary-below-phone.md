# 0254 · `is-secondary` im ganzen Set (F783 M1)

| | |
|---|---|
| Status | fertig |
| Stufe | Stil-Klasse (`v3.css`), keine Komponente |
| Klassen-Test | ja: „zweitrangig, weicht auf dem Handy“ gibt es in jeder App |
| Quelle | ll-dev96 2026-11-22 (F783 M1): Die Zählerzeile im Kopf der Mandantenseite (`.cy-counts`, Verweise nach care und technical) soll auf dem Handy nicht erscheinen. Die App schreibt kein eigenes CSS |
| Ersetzt | die Regel `:is(.v2wiz__foot, .s3bar, .v2selbar) .is-secondary { display: none; }` aus 0253 |
| Blockiert | nichts (M1 baut weiter) |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

Was auf dem Handy keinen Platz hat und dort nicht gebraucht wird, braucht **einen** Namen im Set, nicht einen je Seite. 0253 hat `is-secondary` für die Zweitaktion einer unteren Leiste eingeführt (unter 640 px ausgeblendet, dieselbe Handlung steht im ⋯). Dieses Wort gilt jetzt überall: Ein Element mit `is-secondary` ist unter 640 px Fensterbreite nicht da. Am Desktop und auf dem Tablet ändert sich nichts.

## Einordnung

- **Wiederverwenden** (§3 Regel 1): Das Wort gibt es seit 0253. Eine zweite Klasse für dasselbe wäre eine zweite Quelle.
- **Nicht** `.cy-counts` selbst ausblenden: Die Klasse ist die Form der Zählerzeile. Ob sie auf dem Handy erscheint, entscheidet die Seite, also die App, über die Klasse.
- **Verantwortung bleibt bei der App** (F783 „Nichts fällt weg“): `is-secondary` blendet aus und ersetzt nichts. In einer Leiste gehört dieselbe Handlung ins ⋯ (`.v2bar__more`). Außerhalb einer Leiste darf nur Inhalt die Klasse tragen, der auf dem Handy entbehrlich oder anderswo erreichbar ist. Bei `.cy-counts` ist das so: Die Verweise führen nach care und technical, und beide Bereiche bleiben Desktop (F783 Nicht-Scope).

## Schnittstelle

| Klasse | Wo | Wirkung | Nachweis |
|---|---|---|---|
| `is-secondary` | an jedem Element | unter 640 px Fensterbreite `display: none` (mit `!important`, weil eine Hilfsklasse gegen jede Formklasse gewinnen muss); darüber wirkungslos | `Showcase/ClientYear` `Normal` bei 390 und 1440, `Wizard/SecondaryActions` bei 390 |

Kann bewusst nicht: Sie hat keinen Ersatz und kein ⋯. Den Weg zur Handlung baut die Seite.

## Stories

Keine neue Story. `src/showcase/client-year/ClientYearPage.tsx` setzt `is-secondary` an `.cy-counts`, so wie die App es tun wird. `Wizard/SecondaryActions` (0253) beweist die Leiste.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, `check:type`, `check:language`, `check:when` grün; `check:classes` ohne neue Befunde
- [ ] Kein Hex, kein px in TSX
- [ ] Im Browser angesehen

Variabel:

1. Die Regel steht in `@media (max-width: 639.98px)`, und es gibt nur eine Regel für `is-secondary`; die alte, auf Leisten beschränkte ist ersetzt.
2. `Showcase/ClientYear` `Normal`: bei 390 hat `.cy-counts` `display: none`, bei 820 und 1440 ist die Zeile sichtbar (Breite > 0).
3. `Wizard/SecondaryActions` bei 390: „Als Entwurf sichern“ ist unsichtbar, „Mehr“ sichtbar, wie in 0253.
4. Desktop unverändert: `node scripts/png-diff.mjs .playwright-mcp/f783-base <neu> 0.5` über die 37 Stories von 0253 endet mit Exit 0. Dazu `Showcase/ClientYear` `Normal` bei 1440 vorher und nachher identisch (Vergleichsbild `.playwright-mcp/f783-0254-base/`).
5. `docs/design-guidelines.md` L1 nennt `is-secondary` als die eine Klasse für „auf dem Handy nicht da“, mit der Pflicht aus „Nichts fällt weg“.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck` Exit 0 · `check:type` Exit 0 („ok“) · `check:language` Exit 0 · `check:when` Exit 0 · `check:classes` Exit 1 mit genau den vier bekannten Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer · `pnpm build` Exit 0 („Storybook build completed successfully“) | ✓ |
| Fest: kein Hex, kein px in TSX | Diff in `ClientYearPage.tsx`: nur `className="cy-counts is-secondary"` und ein englischer Kommentar | ✓ |
| Fest: im Browser angesehen | Playwright-MCP gegen Storybook 6118 bei 390×844, 820×1180, 1440×900; Bilder in `.playwright-mcp/f783-0254-review-narrow/` | ✓ |
| 1 Eine Regel im Handy-Block | `v3.css` Z. 5563 `.is-secondary { display: none !important; }` steht im Block `@media (max-width: 639.98px)` (Z. 5487–5570). `grep is-secondary` über `src/` findet in CSS nur diese Regel; `:is(.v2wiz__foot, .s3bar, .v2selbar) .is-secondary` ist weg | ✓ |
| 2 ClientYear `Normal` | `seiten-mandantenjahr--normal`: 390 → `.cy-counts` `display: none`, 0 × 0, `scrollWidth` 390 · 820 → `flex`, 746 × 19 · 1440 → `flex`, 1366 × 19. Bilder `seiten-mandantenjahr--normal-390.png`, `-820.png` | ✓ |
| 3 Wizard `SecondaryActions` bei 390 | `v3-patterns-rahmen-wizard--secondary-actions`: „Als Entwurf sichern“ `display: none`, 0 × 0; `.v2bar__more` `flex`, 82 × 44; „Mehr“, „Zurück“, „Weiter“ sichtbar, je 44 px hoch. Gegenprobe 1440: `.is-secondary` `flex` (161 px), `.v2bar__more` `none`. Bild `wizard-secondary-actions-390.png` | ✓ |
| 4 Desktop unverändert | 37 Stories neu nach Vorschrift (1440×900, `fullPage`, `animations: "disabled"`, Maus 0,0, 600 ms nach `networkidle`) in `.playwright-mcp/f783-0254-review2/`: `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0254-review2 0.5` → Exit 0, 37 × ✓, höchstens 0,005 %. `seiten-mandantenjahr--normal` und `--dense` in `.playwright-mcp/f783-0254-review-cy/`: `png-diff.mjs .playwright-mcp/f783-0254-base .playwright-mcp/f783-0254-review-cy 0.5` → Exit 0, beide 0,000 %. Protokoll: Zwei frühere Läufe in `f783-0254-review/` endeten mit Exit 1, beide durch die Aufnahme. Erst war die erste Story nach kaltem iframe weiß (84,7 %), dann wich bei `navlist--in-shell` der Verlauf der Seitenleiste ab (3,77 %). Drei Einzelaufnahmen davon ergaben je 0,000 % (`f783-0254-review-retake/`). Die Regel wirkt nur unter 640 px | ✓ |
| 5 Guideline L1 | `design-guidelines.md` L1, direkt nach „Nichts fällt weg“: „Was auf dem Handy nicht da ist, trägt **eine** Klasse: `is-secondary` (0254) — in einer Leiste mit derselben Handlung im ⋯, sonst nur an Inhalt, der dort entbehrlich oder anders erreichbar ist.“ | ✓ |

**H1 Einordnung trägt.** Ein Wort statt einer zweiten Klasse ist richtig. Die Bedeutung ist dieselbe wie in 0253 („unter 640 px nicht da“). Die App nutzt das Wort schon, und eine Regel an `.cy-counts` würde eine Seitenentscheidung ins Set ziehen. Zwei Schwächen bleiben, beide kein Grund zum Umbenennen, weil das den Vertrag aus 0253 bräche. (a) Der Name nennt den Rang, nicht die Wirkung. Im Set steht `is-` sonst für einen Zustand an einer Formklasse (`.is-active`, `.is-current` …), und `.is-secondary` ist die einzige freistehende Hilfsklasse dieser Art. Neben `variant="secondary"` liest sich `<Button variant="secondary" className="is-secondary">` wie eine Dopplung. Die Wirkung muss deshalb über L1 und den CSS-Kommentar laufen, und beide sagen sie. (b) Weil die Klasse am Inhalt sitzt, bleibt die Hülle des Slots stehen, siehe H2.

**H2 Leere Hülle auf dem Handy.** Bei 390 behält `.v2ehead__summary` (EntityHeader) `margin-top` 16 px, obwohl ihr einziges Kind verschwindet. Unter `.v2ehead__top` (endet bei 207) liegen bis zum Kopfende 37 px statt der 20 px Polsterung (Kopfende bei 244). Das ist kein Kriterium der Spec. Als Folge möglich: dieselbe Regel auch für eine Hülle, deren einziges Kind `is-secondary` trägt (`:has(> .is-secondary:only-child)`), oder ein Satz in L1, dass die Klasse an den äußersten Rahmen gehört, den die Seite setzt.

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-22 · Offene Punkte: keine; H1 und H2 sind Hinweise
