import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { StateIcon } from "../../patterns/Review";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { Badge } from "../../primitives/Badge";
import { Button } from "../../primitives/Button";
import { MonoCell } from "../../primitives/Cells";
import { EmptyState } from "../../primitives/EmptyState";
import { FieldList } from "../../primitives/FieldList";
import { StatusCallout } from "../../primitives/StatusCallout";
import { Card, CardHead } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { formatCount } from "../../format";
import {
  RECONCILE_AXIS,
  SNAPSHOT_COUNT_LABEL,
  type DatevSnapshot,
} from "./datev-snapshot";

/**
 * Which state is being compared against (0027).
 *
 * Before anyone accepts a batch, it has to be clear **against what** the check
 * runs: reference date, financial year, what the import contained, and whether
 * the reconciliation was clean. Today that stands inline on the DATEV page and
 * not at all in step 1 of the review.
 *
 * The reconciliation belongs **in** the card, not beside it: it is a statement
 * about the same state. And it has three shapes, never two — clean, with
 * deviations, **or not run at all**. „No news is good news" is exactly the
 * reading this card has to prevent.
 */

/**
 * @when    A DATEV state has to be named — the head of the DATEV page, step 1
 *          of the batch review, the onboarding comparison.
 * @instead One number with a caption → KpiTile. The rows of the mirror →
 *          the mirror itself.
 */
export function SnapshotCard({
  snapshot,
  title = "DATEV-Stand",
  onOpen,
  onImport,
}: {
  /** `null` = no snapshot at all — an own state, not an empty surface. */
  snapshot: DatevSnapshot | null;
  title?: string;
  /** Jump into the mirror. Without it the card only shows. */
  onOpen?: () => void;
  /** The way out of the empty state. Without it the empty state names no way. */
  onImport?: () => void;
}) {
  if (!snapshot) {
    return (
      <Card>
        <CardHead title={title} />
        <div className="v2snap__pad">
          <EmptyState
            inline
            icon={<StateIcon state="skipped" title="kein Stand" />}
            title="Kein DATEV-Stand vorhanden"
            description="Ohne einen Spiegel gibt es nichts, wogegen geprüft werden könnte. Der erste Import legt den Stand an."
            action={
              onImport ? (
                <Button variant="primary" onClick={onImport}>
                  Spiegel importieren
                </Button>
              ) : undefined
            }
          />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHead
        title={title}
        sub={`Wirtschaftsjahr ${snapshot.fiscalYear}`}
        actions={
          onOpen ? (
            <Button variant="tertiary" size="sm" onClick={onOpen}>
              Spiegel öffnen
            </Button>
          ) : undefined
        }
      />
      <div className="v2snap__pad">
        <FieldList
          tone="bare"
          rows={[
            // Both labelled and both absolute (T7): the two dates are confused
            // regularly, and „vor 3 Tagen" would make it worse.
            ["Stichtag", <Time key="a" value={snapshot.asOf} format="date" />],
            ["Importiert", <Time key="i" value={snapshot.importedAt} format="dateTime" />],
            [
              "Tiefe",
              // The raw value in mono until the GLOSSARY has words for the
              // three levels (finding L-72) — a map here would be that map.
              <MonoCell key="b" value={snapshot.baselineLevel} />,
            ],
            [
              "Umfang",
              snapshot.contents.length > 0 ? (
                <span className="v2snap__scope">
                  {snapshot.contents.map((c) => (
                    <Badge key={c} tone="neutral">
                      {c}
                    </Badge>
                  ))}
                </span>
              ) : (
                <span className="v2muted">—</span>
              ),
            ],
            ...Object.entries(snapshot.counts).map(
              ([key, n]) =>
                [
                  SNAPSHOT_COUNT_LABEL[key] ?? key,
                  <span key={key} className="v2num">
                    {formatCount(n)}
                  </span>,
                ] as [
                  React.ReactNode,
                  React.ReactNode,
                ],
            ),
          ]}
        />
        <Reconciliation reconcile={snapshot.reconcile} />
      </div>
    </Card>
  );
}

/**
 * The reconciliation — three statements, and the third is the point.
 *
 * A run that did not happen looks exactly like a clean one if the card stays
 * silent about it. So it says so.
 */
function Reconciliation({ reconcile }: { reconcile: DatevSnapshot["reconcile"] }) {
  if (!reconcile) {
    return (
      <StatusCallout
        tone="warning"
        icon={<StateIcon state="skipped" title="nicht durchgeführt" />}
        kicker="Abgleich"
        title="Für diesen Stand wurde kein Abgleich durchgeführt."
        sub="Der Abgleich läuft nur bei Journal-Läufen. Ohne ihn ist nicht bekannt, ob die DATEV-Buchungen zu den Ludwig-Buchungen passen."
      />
    );
  }
  const open = reconcile.newUnprocessed + reconcile.unclear;
  return (
    <>
      <StatusCallout
        tone={open > 0 ? "warning" : "neutral"}
        // The three statements each get their own state icon — from
        // `StateIcon`, where states live, not from `lucide-react` directly
        // (A8, `pnpm check:icons`).
        icon={<StateIcon state={open > 0 ? "warning" : "done"} />}
        kicker="Abgleich"
        title={
          open > 0
            ? `${formatCount(open)} ${open === 1 ? "Buchung ist" : "Buchungen sind"} ungeklärt.`
            : "Alle DATEV-Buchungen sind zugeordnet."
        }
        sub={
          // Der Nebensatz beugt sich mit: „1 Buchung ist ungeklärt." und
          // darunter „Sie stehen im Spiegel" war ein halb gebeugter Satz — der
          // Hauptsatz wusste vom Singular, die Zeile vier Zeilen tiefer nicht
          // (Wiederabnahme 0027).
          open === 0
            ? undefined
            : open === 1
              ? "Sie steht im Spiegel, mit ihrem Zustand — Fremdbuchung oder unklar."
              : "Sie stehen im Spiegel, jede mit ihrem Zustand — Fremdbuchung oder unklar."
        }
      />
      <div className="v2snap__rec">
        <span className="v2snap__reclabel">
          Zustände <StatusInfoButton axis="mirror_match" />
        </span>
        {RECONCILE_AXIS.map(([key, value]) => (
          <span className="v2snap__reccount" key={value}>
            <span className="v2snap__recword">{resolveStatus("mirror_match", value).label}</span>
            <span className="v2num">{formatCount(reconcile[key])}</span>
          </span>
        ))}
      </div>
    </>
  );
}
