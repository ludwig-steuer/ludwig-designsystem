## Ludwig v3 — wie mit diesen Komponenten gebaut wird

Fachanwendung für Steuerkanzleien: dichte Tabellen, Beträge, Belege, Status.
Der Ton ist „Kompetenz in Ruhe" — ruhig, präzise, nie verspielt.

### Kein Provider, aber eine Fläche

Die Komponenten brauchen **keinen Provider und keinen Theme-Wrapper** — sie
sind direkt montierbar. Was sie brauchen, ist der richtige Untergrund:

```jsx
<div style={{ background: "var(--color-bg-soft)", minHeight: "100vh", padding: "var(--space-6)" }}>
  <Card>…</Card>
</div>
```

Ludwig-Screens liegen auf `--color-bg-soft`; Karten und Tabellen sind weiß
(`--color-surface`) darauf. Ohne diese Fläche steht Weiß auf Weiß und die
Kartenkanten verschwinden.

### Styling: Tokens, keine Utility-Klassen

**Es werden KEINE Tailwind-Utilities ausgeliefert.** `bg-surface`, `gap-4`,
`rounded-md` und dergleichen lösen nicht auf und ergeben ungestylten Output.
Die Komponenten bringen ihr Styling vollständig selbst mit (ihre internen
`v2*`-Klassen sind Implementierung, nicht deine API — nicht nachbauen).

Für eigenes Layout-Glue: **`var(--token)` in `style`**. Die echten Namen:

| Zweck | Tokens |
|---|---|
| Fläche | `--color-bg-soft` (Seite), `--color-surface` (Karte), `--color-bg` |
| Text | `--color-text`, `--color-text-muted` |
| Akzent, Linien | `--color-primary`, `--color-border` |
| Semantik | `--color-success`, `--color-warning`, `--color-danger` |
| Abstand | `--space-1` … `--space-6`, `--space-8`, `--space-10`, `--space-12`, `--space-16`, `--space-20`, `--space-24` |
| Schriftgrad | `--fs-display`, `--fs-h1`…`--fs-h4`, `--fs-body`, `--fs-body-sm`, `--fs-caption`, `--fs-overline` |
| Schrift | `--font-sans` (Inter), `--font-serif`, `--font-mono` |
| Radius, Schatten | `--radius-md`, `--radius-lg`, `--shadow-sm` |

Nie ein Hex, nie ein Pixelmaß. Fehlt ein Wert, ist das nächstliegende Token
richtiger als eine erfundene Zahl.

### Regeln, die Ludwig-Screens von generischen unterscheiden

- **Zahlen rechts, Text links, nichts zentriert.** Beträge über `AmountCell` —
  es setzt Ausrichtung, Tabellenziffern und Vorzeichen selbst.
- **Farbe heißt Kritikalität, nicht Dekoration.** Rot ausschließlich für
  Fehler. Jeder farbige Zustand trägt zusätzlich ein Wort oder Icon.
- **Status nur über `StatusBadge`** — nie eine eigene Status-Beschriftung oder
  Farbzuordnung erfinden. Zwei Pflicht-Props: `axis` (die Status-Achse, z. B.
  `document_processing` für Belege, `accounting_case` für Sachverhalte,
  `journal_entry` für Buchungen, `job`) und `status` (der technische
  Schlüssel dieser Achse, z. B. `pending`, `in_progress`, `processed`,
  `review_needed`, `failed` für `document_processing`) — **nicht** das
  deutsche Label; das setzt die Komponente selbst.
- **Deutsch, immer „Sie", Buttons im Imperativ** („Beleg prüfen", nicht
  „Prüfung"). Fachbegriffe: Kanzlei (nicht Tenant), Mandant (nicht Client),
  Kreditor, Beleg, Sachverhalt, Buchung. Keine Emojis, keine Versalien.
- Icons kommen aus `lucide-react`, 1.5 px Strichstärke, nie ohne Wort.

### Wo die Wahrheit steht

- `styles.css` und das davon importierte `_ds_bundle.css` — alle Tokens und
  Klassen im Original. Vor eigenem Styling dort nachsehen.
- `components/<gruppe>/<Name>/<Name>.d.ts` — die Props je Komponente.
- `components/<gruppe>/<Name>/<Name>.prompt.md` — Verwendung je Komponente.
- `guidelines/` — Designsprache und Tonregeln im Volltext.

### Ein vollständiges Beispiel

```jsx
<div style={{ background: "var(--color-bg-soft)", minHeight: "100vh", padding: "var(--space-6)" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: "var(--space-4)" }}>
    <h1 style={{ font: "var(--fs-h2)", color: "var(--color-text)", margin: 0 }}>Offene Belege</h1>
    <Button variant="primary">Stapel prüfen</Button>
  </div>

  <Card>
    <CardHead>Eingangsrechnungen</CardHead>
    <Table>
      <HeadRow><th>Datum</th><th>Kreditor</th><th>Status</th><th>Betrag</th></HeadRow>
      <Row>
        <td>2026-08-21</td>
        <td>Bürobedarf Meier GmbH</td>
        <td><StatusBadge axis="document_processing" status="pending" /></td>
        <AmountCell value={1475.6} />
      </Row>
    </Table>
  </Card>
</div>
```

Der Aufbau ist der Punkt: Bibliotheks-Komponenten für alles Fachliche,
Tokens für das eigene Layout dazwischen.
