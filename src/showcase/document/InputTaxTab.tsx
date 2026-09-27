import type { ReactNode } from "react";
import { checkSummary, CheckItems, type CheckItem } from "@/ui/v3/patterns/Review";
import { ProvenanceRows } from "@/ui/v3/patterns/Provenance";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { Button } from "@/ui/v3/primitives/Button";
import { MonoCell } from "@/ui/v3/primitives/Cells";
import { Disclosure } from "@/ui/v3/primitives/Disclosure";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { Skeleton } from "@/ui/v3/primitives/Skeleton";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardFoot, CardHead } from "@/ui/v3/primitives/Table";

/**
 * The tab „Vorsteuer" of the document page (0206): „May input tax be deducted
 * from this document — and how is it treated for VAT?" A composition of the
 * check pattern, nothing built for VAT alone: the verdict as `StatusCallout`
 * with `checkSummary` as its title, the rules as `CheckItems kind="rule"`, the
 * facts as `CheckItems kind="fact"`, the raw values folded.
 *
 * The view model mirrors `InvoiceVatAssessment` of the app (F264/F310); the
 * verdict arrives resolved (word + step), as the app reads it from its axis
 * `input_tax_verdict`.
 */

/**
 * The verdict as the app resolves it from its axis `input_tax_verdict` (F310):
 * the word and its step. It comes as data — the tab keeps no word list of its
 * own (no second source).
 */
export interface Verdict {
  label: string;
  tone: "success" | "warning" | "danger";
}

export interface InputTaxRule {
  code: string;
  title: string;
  result: "pass" | "fail" | "unknown";
  reason: string;
}

export interface InputTaxFact {
  code: string;
  label: string;
  /** Axis `input_tax_fact`: yes · no · unknown · uncertain · not_applicable. */
  value: "yes" | "no" | "unknown" | "uncertain" | "not_applicable";
  source: "derived" | "agent" | "human";
  rationale: string;
  sourceFields: readonly string[];
}

export interface InputTaxVM {
  verdict: Verdict;
  blockedTaxKeys: readonly string[];
  rules: readonly InputTaxRule[];
  facts: readonly InputTaxFact[];
  notMachineChecked: readonly { code: string; title: string }[];
  assessment: {
    treatment: string;
    status: string;
    by: "derived" | "agent" | "human" | null;
    at: string | null;
    rationale: string | null;
  };
  extraction: readonly [string, ReactNode][];
}

/** Who set a value — Ludwig is the AI (T1), the practice is the person. */
const ACTOR: Record<InputTaxFact["source"], string> = {
  derived: "abgeleitet",
  agent: "Ludwig",
  human: "Kanzlei",
};

/** A rule that could not be determined is work here, not „not checkable" (0148): yellow. */
const RULE_STATE: Record<InputTaxRule["result"], CheckItem["state"]> = { pass: "green", fail: "red", unknown: "yellow" };

/** A fact is settled when it has an answer; unknown and uncertain are to clarify. */
const FACT_STATE: Record<InputTaxFact["value"], CheckItem["state"]> = {
  yes: "green",
  no: "green",
  not_applicable: "green",
  unknown: "yellow",
  uncertain: "yellow",
};

export function InputTaxTab({
  vm,
  state = "filled",
}: {
  vm: InputTaxVM | null;
  /** The two states the page itself has: the assessment is loading or failed. */
  state?: "filled" | "loading" | "error";
}) {
  if (state === "loading") {
    return (
      <div className="v2stack">
        <Skeleton variant="lines" lines={2} label="Die Vorsteuer wird geprüft …" />
        <Skeleton variant="lines" lines={6} />
      </div>
    );
  }
  if (state === "error") {
    return (
      <StatusCallout
        tone="danger"
        kicker="Vorsteuer"
        title="Prüfung nicht geladen"
        sub="Die Regeln ließen sich gerade nicht auswerten. Die gespeicherte Einschätzung am Beleg ist davon nicht betroffen."
        actions={
          <Button variant="secondary" size="sm">
            Erneut prüfen
          </Button>
        }
      />
    );
  }
  if (!vm) {
    return (
      <StatusCallout
        tone="neutral"
        kicker="Vorsteuer"
        title="Noch keine Prüfung möglich"
        sub="Ludwig hat die Rechnungsdaten dieses Belegs noch nicht ausgelesen. Sobald sie da sind, steht hier, ob Vorsteuer gezogen werden darf."
      />
    );
  }

  const rules: CheckItem[] = vm.rules.map((r) => ({
    code: r.code,
    question: r.title,
    reason: r.reason,
    state: RULE_STATE[r.result],
  }));
  const facts: CheckItem[] = vm.facts.map((f) => ({
    code: f.code,
    question: f.label,
    reason: f.rationale,
    state: FACT_STATE[f.value],
    result: <StatusBadge axis="input_tax_fact" status={f.value} info={false} />,
    origin: { actor: ACTOR[f.source], fields: f.sourceFields },
  }));
  const v = vm.verdict;

  return (
    <div className="v2stack">
      {/* L — the report's head: the verdict word, the counts (XS), the consequence. */}
      <StatusCallout
        tone={v.tone}
        kicker={v.label}
        title={checkSummary(rules)}
        {...(vm.blockedTaxKeys.length
          ? {
              sub: (
                <>
                  Nicht verwendbar für diesen Beleg: Steuerschlüssel{" "}
                  {vm.blockedTaxKeys.map((k, i) => (
                    <span key={k}>
                      {i > 0 ? ", " : null}
                      <MonoCell value={k} />
                    </span>
                  ))}
                </>
              ),
            }
          : {})}
      />

      <Card>
        <CardHead title="Umsatzsteuerliche Behandlung" />
        <div className="v3boxbody">
          <FieldList
            tone="bare"
            rows={[
              ["Behandlung", <StatusBadge key="t" axis="vat_treatment" status={vm.assessment.treatment} />],
              ["Stand", <StatusBadge key="s" axis="vat_assessment_status" status={vm.assessment.status} />],
            ]}
          />
          <ProvenanceRows
            provenance={{
              ...(vm.assessment.by ? { actor: ACTOR[vm.assessment.by] } : {}),
              at: vm.assessment.at,
              rationale: vm.assessment.rationale,
            }}
          />
        </div>
      </Card>

      <Card>
        <CardHead title="Regeln" />
        <div className="v3boxbody">
          <CheckItems items={rules} kind="rule" />
        </div>
        {vm.notMachineChecked.length ? (
          <CardFoot>
            Nicht von Ludwig geprüft — bitte selbst beurteilen: {vm.notMachineChecked.map((r) => r.title).join(" · ")}
          </CardFoot>
        ) : null}
      </Card>

      <Card>
        <CardHead title="Fakten" sub={checkSummary(facts, "fact")} />
        <div className="v3boxbody">
          <CheckItems items={facts} kind="fact" />
        </div>
      </Card>

      <Disclosure summary="Auf der Rechnung erkannt">
        <FieldList tone="bare" rows={[...vm.extraction]} />
      </Disclosure>
    </div>
  );
}
