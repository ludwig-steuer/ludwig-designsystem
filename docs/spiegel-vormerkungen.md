# Spiegel-Vormerkungen — was beim nächsten Lauf fällig ist

Der Spiegel (`src/ludwig/`, `docs/ludwig/`) ist **eingefroren**; die Marke
steht in `src/ludwig/GESPIEGELT_AUS.json`. Was drüben entsteht und hier
gebraucht wird, kommt bis zum nächsten Lauf hierher.

> **Warum diese Datei und nicht `docs/ludwig/README.md`:** `sync-ludwig.sh`
> macht `rm -rf docs/ludwig` und schreibt die README danach neu. Die Liste
> stand dort und war beim Lauf vom 2026-09-08 weg — sie war die ganze Zeit
> flüchtig, was nur niemandem auffiel, weil der Spiegel eingefroren war. Eine
> Notiz gehört nicht in eine generierte Datei.

## Offen

| Was | Woher | Wer wartet |
|---|---|---|
| `CaseHeaderVM.disposition` | **spiegelbar seit `988d3dc5`** (L-220 erledigt): `overview-vm.ts` trägt nur noch Formen, die Regeln liegen in `application/case-overview.ts` | die Sachverhaltsansicht; bis zum Lauf liest sie die Zuständigkeit über `CaseDetail` |
| `flow_error` in der Achse `bridge_datev` | neu (`b9f3707a`, L-221) — dazu ein Test, der die **ganze** Vertragsunion auf Deckungsgleichheit prüft | die DATEV-Seite zeigt die Achse schon; das Set hat dort keinen Baustein |

| `recurring-rules/domain/rule.ts` und `rule-summary.ts` | `MATCH_CRITERIA` einmal statt zweimal (L-253, `2c0c888f`), Prioritäts-Konstante (L-254, `9a3ce2db`), `datev-wk:`-Präfix (L-244, `b7544542`) | 0132–0135 lesen bis dahin gegen `origin/staging` |
| `business-partners/domain/business-partner.ts` | `TYPICAL_NATURE` mit allen sechs Werten (L-222, `a38169f4`) | 0127–0129; **wer gegen den Spiegel baut, baut gegen die alte vierwertige Aufzählung** |
| Achse `regel_modus` in `ui/status/status-registry.ts` | neu (L-243, `5e48d892`) | 0132 und 0134 zeigen den Modus über die Achse |

| `recurring-rules/domain/*`: die drei Wortlisten | neu (`f0a0bd00`, L-242 und L-256) — Rhythmus, Richtung und die zwei Strategien stehen bei `RULE_INTERVAL_LABEL` | 0132–0135 nehmen die Wörter bis dahin als Prop mit rohem Rückfall |
| `PreviewPosting.accounts` | reicht Nummer und Name **getrennt** durch (`f0a0bd00`) | 0134: damit fällt L-255 weg — die Vorschau muss keinen String mehr zerlegen |

| `recurring-rules/domain/rule-draft.ts` | neu — Draft ↔ Regel, rein | 0135 führt seinen Entwurfstyp bis dahin selbst (dieselbe Form) |

## Erledigt mit dem Lauf vom 2026-09-08 (App `6ba47fb2`)

Owner-Freigabe (Simon), einmalig, danach wieder eingefroren. Angekommen sind:
`SourceDocumentDetail` als Vereinigung über `kind` · `completedVia` als Achse ·
`splitPageRange`, `parentSourceDocId`, `classOverriddenAt` und die drei
`datevRef*` · `CaseFilter.disposition` · `collective-accounts.ts` ·
`account-entry.ts` (`AccountEntryOrigin`, `accountEntryOrigin`, `markOfOrigin`) ·
`bank-transaction-vm.ts` samt `bankMatchStage` · der Achsenwert `not_run`.

**Vier Handkopien sind dabei gefallen:** die lokale `SourceDocumentDetail`-Union
(276 Zeilen, jetzt ein Re-Export), `detail` und `completedVia` in
`SourceDocumentVM`, die vier Provenance-Felder ebenda, und die zwei
handgeschriebenen „Kaskade nicht gelaufen"-Texte, die jetzt `bankMatchStage()`
und die Achse tragen.
