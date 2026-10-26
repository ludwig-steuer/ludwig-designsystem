import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { RecordPager } from "../../primitives/RecordPager";
import { Card, CardHead } from "../../primitives/Table";
import { ClarificationCard, type ClarificationDetailVM } from "./ClarificationCard";
import { ClarificationThread } from "./ClarificationThread";
import { ITEMS as THREAD } from "./thread-fixtures";
import type { ClarificationVM } from "./Clarification";

const meta: Meta<typeof ClarificationCard> = {
  title: "v3/Entitäten/Klärung/ClarificationCard",
  component: ClarificationCard,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ClarificationCard>;

const BASE: ClarificationVM = {
  id: "c1",
  title: "Bewirtung oder Reisekosten? Beleg nennt beides",
  state: "open",
  severity: "required",
  type: "question",
  audience: "accounting",
  raisedAt: "2026-08-26T09:12:00+02:00",
};

const AGENT_DETAIL: ClarificationDetailVM = {
  question: "Soll der Beleg als Bewirtung (4650) oder als Reisekosten (4670) gebucht werden?",
  context:
    "Der Beleg der Musterfirma GmbH nennt vier Personen und eine Übernachtung. Bewirtung " +
    "verlangt die Teilnehmerangabe, Reisekosten nicht — die Zuordnung ändert den Vorsteuerabzug.",
  text:
    "Der Beleg trägt sowohl Speisen (68,40 €) als auch eine Übernachtung (172,00 €). " +
    "Bei gemischten Belegen bucht Ludwig nach dem überwiegenden Anteil, sofern die " +
    "Kanzlei nichts anderes festlegt.",
  recommendation: "Reisekosten (4670)",
  facts: [
    { label: "Betrag", value: "240,40 €" },
    { label: "Belegdatum", value: "21.08.2026" },
    { label: "Gegenpart", value: "Musterfirma GmbH" },
    { label: "Teilnehmer laut Beleg", value: "4" },
  ],
  sources: [
    { kind: "source_doc", label: "Beleg RE-2026-4471", href: "#" },
    { kind: "ledger_account", label: "4670 Reisekosten Arbeitnehmer", href: "#" },
  ],
  // Raw, as stored on the row — the words come from the domain
  // (`clarification_question_type` and the module, findings L-10 and L-11).
  questionType: "agent_clarification",
  sourceModule: "booking-module",
  answerKind: "single_choice",
  answerOptions: ["Bewirtung (4650)", "Reisekosten (4670)"],
  allowFreeText: true,
};

const EVIDENCE: ClarificationDetailVM["evidence"] = {
  cases: [{ id: "case-0042", number: "2026-0042", title: "Bewirtung Musterfirma GmbH mit Übernachtung" }],
  statements: [{ id: "imp-2026-08", paymentAccount: "1800 Sparkasse Musterstadt", periodFrom: "2026-08-01", periodTo: "2026-08-31" }],
  documents: [
    { id: "doc-4471", cited: true, date: "2026-08-21", issuer: "Musterfirma GmbH", number: "RE-2026-4471", amount: 240.4, currency: "EUR" },
    { id: "doc-4470", date: "2026-08-14", issuer: "Hotel am Markt GmbH & Co. KG", number: "HM-88213", amount: 172, currency: "EUR" },
  ],
  accounts: [
    { id: "4650", number: "4650", name: "Bewirtungskosten" },
    { id: "4670", cited: true, number: "4670", name: "Reisekosten Arbeitnehmer" },
  ],
  payments: [
    { id: "bt-1", date: "2026-08-23", amount: -240.4, currency: "EUR", counterparty: "Musterfirma GmbH", purpose: "EREF+RE-2026-4471 SVWZ+RE-2026-4471 Bewirtung 21.08.2026", paymentAccount: "Sparkasse Musterstadt" },
    { id: "bt-2", date: "2026-08-29", amount: -2840.12, currency: "EUR", counterparty: "Katharina Oberländer-Wittmann", purpose: "Lohn – Aktueller Monat August 2026 Personalnummer 0042", paymentAccount: "Sparkasse Musterstadt" },
  ],
  entries: [
    { id: "je-1", date: "2026-08-21", debit: "4670", credit: "70021", amount: 240.4, currency: "EUR", taxKey: "9", state: "proposed" },
    { id: "je-2", date: "2026-07-18", debit: "4650", credit: "70021", amount: 118.2, currency: "EUR", taxKey: "9", state: "posted" },
  ],
  other: [{ kind: "clarification", id: "cl-7", label: "Rückfrage vom 12.07.2026: Bewirtung mit Übernachtung" }],
};

/**
 * In the batch review (0214): the link to the case, recommendation and basis,
 * sources and context in one block — every kind a fold-out with its count,
 * named entries first —, the options as whole rows, the free text beside
 * them, the small exits under the main button.
 */
export const InBatchReview: Story = {
  render: () => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 760 }}>
        <ClarificationCard
          clarification={{ ...BASE, ...AGENT_DETAIL, evidence: EVIDENCE, raisedBy: null }}
          mode="answer"
          caseLink={{ label: "Sachverhalt 2026-0042 · Bewirtung Musterfirma", href: "#case=2026-0042" }}
          onSelect={(item) => setPicked(`${item.kind}:${item.id}`)}
          submitLabel="Antwort speichern und zurück an Ludwig"
          onAnswer={async () => {}}
          onResolve={async () => {}}
          onDefer={async () => {}}
        />
        <p className="lw-ui-hint">{picked ? `Drawer öffnet: ${picked}` : "Klick auf eine Zeile öffnet einen Drawer."}</p>
        {/* The thread of the case under the card (0214): the question on screen last, marked. */}
        <ClarificationThread items={THREAD} currentId="q4" />
      </div>
    );
  },
};

/** At the case: the same card without the case link; without options only the answer field. */
export const AtCaseFreeText: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ClarificationCard
        clarification={{ ...BASE, ...AGENT_DETAIL, answerOptions: [], answerKind: "free_text", evidence: { accounts: EVIDENCE!.accounts ?? [] } }}
        mode="answer"
        onAnswer={async () => {}}
        onResolve={async () => {}}
        onDefer={async () => {}}
      />
    </div>
  ),
};

/** Deferred: lifting it is a small line like the other exits, not a button below the card. */
export const DeferredWithUndo: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ClarificationCard
        clarification={{ ...BASE, ...AGENT_DETAIL, state: "deferred", deferredUntil: "2026-10-12", deferredReason: "wartet auf Unterlagen" }}
        mode="answer"
        onAnswer={async () => {}}
        onResolve={async () => {}}
        onDefer={async () => {}}
        onUndefer={async () => {}}
      />
    </div>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card>
      <CardHead title="Rückfrage" sub="gelesen, nicht beantwortet" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard clarification={{ ...BASE, ...AGENT_DETAIL }} />
      </div>
    </Card>
  ),
};

/** All three answer shapes side by side, each with a working round trip. */
export const Answering: Story = {
  render: function Answering() {
    const [log, setLog] = useState<string[]>([]);
    const answer = async (what: string) =>
      setLog((prev) => [...prev, `${new Date().toLocaleTimeString("de-DE")} · ${what}`]);

    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Card>
          <CardHead title="Auswahl" sub="single_choice mit Ergänzung" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{ ...BASE, ...AGENT_DETAIL }}
              onAnswer={(a) => answer(`Auswahl: ${a.optionId ?? "—"}${a.text ? ` (${a.text})` : ""}`)}
              onResolve={(reason) => answer(`Aufgelöst: ${reason}`)}
              onDefer={(until, reason) => answer(`Zurückgestellt bis ${until}: ${reason}`)}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Ja/Nein" sub="yes_no als zwei Optionen" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{
                ...BASE,
                id: "c2",
                title: "Ist die Rechnung bereits bezahlt?",
                severity: "optional",
                question: null,
                context: null,
                text: "Auf dem Konto ist kein Abgang zu finden.",
                answerKind: "yes_no",
                // No options passed: yes_no brings its own two (0222 Nachtrag).
                questionType: "opos_clearing_mismatch",
                sourceModule: "datev-mirror",
              }}
              onAnswer={(a) => answer(`Ja/Nein: optionId ${a.optionId ?? "—"}`)}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Freitext" sub="free_text ohne Optionen" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{
                ...BASE,
                id: "c3",
                title: "Wie soll der Zuschuss behandelt werden?",
                question: null,
                context: null,
                text: "Der Betrag von 1.800,00 € lässt sich keiner Rechnung zuordnen.",
                answerKind: "free_text",
                questionType: "other",
                sourceModule: "booking-module",
              }}
              onAnswer={(a) => answer(`Freitext: ${a.text ?? "—"}`)}
              onDefer={(until, reason) => answer(`Zurückgestellt bis ${until}: ${reason}`)}
              // The third time: from here only a person may defer, and this
              // viewer is the agent. The button stays and says why it will
              // not go.
              deferLockedReason="Zweimal zurückgestellt — ab jetzt nur noch von Hand"
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Altlast" sub="document_upload — kein Upload mehr" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationCard
              mode="answer"
              clarification={{
                ...BASE,
                id: "c4",
                title: "Rechnung von o2 über 23,80 € fehlt",
                question: null,
                context: null,
                text: "Zu der Abbuchung liegt kein Beleg vor.",
                answerKind: "document_upload",
                questionTypeLabel: "Beleg fehlt",
                originLabel: "Buchungsvorschlag",
              }}
              onAnswer={() => answer("darf nicht passieren")}
              // **The case the exits exist for.** This question cannot be
              // answered any more — the upload went with F125 — so resolving
              // and deferring are the only ways left. While they hung on
              // `canAnswer`, this one had neither.
              onResolve={(reason) => answer(`Aufgelöst: ${reason}`)}
              onDefer={(until, reason) => answer(`Zurückgestellt bis ${until}: ${reason}`)}
            />
          </div>
        </Card>

        <Card>
          <CardHead title="Rundlauf" sub="was die Karte gemeldet hat" />
          <div style={{ padding: "var(--space-4)" }}>
            {log.length === 0 ? (
              <span className="v2muted">Noch nichts gesendet.</span>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "var(--space-4)" }}>
                {log.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    );
  },
};

export const WithRecommendation: Story = {
  render: () => (
    <Card>
      <CardHead title="Empfehlung (Altbestand)" sub="wörtlicher Treffer wird zur Vorauswahl, ohne Markierung" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL }}
          onAnswer={async () => {}}
        />
      </div>
    </Card>
  ),
};

/** The app's shape since 2026-10-24: the option named apart, the recommendation only the why. */
const RECOMMENDED: Pick<ClarificationDetailVM, "recommendedOption" | "recommendation"> = {
  recommendedOption: "Reisekosten (4670)",
  recommendation:
    "Die Übernachtung macht 172,00 € der 240,40 € aus, und bei gemischten Belegen zählt der überwiegende Anteil.",
};

/** Answering (0214, owner 2026-10-24): the recommended option preselected and marked, the callout gives only the why. */
export const WithRecommendedOption: Story = {
  render: () => (
    <Card>
      <CardHead title="Empfohlene Option" sub="vorgewählt, in der Zeile markiert, Callout nur das Warum" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard mode="answer" clarification={{ ...BASE, ...AGENT_DETAIL, ...RECOMMENDED }} onAnswer={async () => {}} />
      </div>
    </Card>
  ),
};

/** Reading: no row to mark, so the callout names the option before its why. */
export const RecommendedOptionRead: Story = {
  render: () => (
    <Card>
      <CardHead title="Empfohlene Option, gelesen" sub="der Callout nennt die Option" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard clarification={{ ...BASE, ...AGENT_DETAIL, ...RECOMMENDED }} />
      </div>
    </Card>
  ),
};

/** The option without a why: answering, the word in the row says it all; reading, the callout names the option alone. */
export const RecommendedOptionWithoutReason: Story = {
  render: () => (
    <Card>
      <CardHead title="Empfohlene Option ohne Begründung" sub="oben beim Antworten, unten gelesen" />
      <div style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-6)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL, ...RECOMMENDED, recommendation: null }}
          onAnswer={async () => {}}
        />
        <ClarificationCard clarification={{ ...BASE, ...AGENT_DETAIL, ...RECOMMENDED, recommendation: null }} />
      </div>
    </Card>
  ),
};

/** Without an audit trail: asker and answerer alone already make the history. */
export const People: Story = {
  render: () => (
    <Card>
      <CardHead title="Ohne Audit-Spur" sub="raisedBy und answeredBy als Actor bzw. String" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          clarification={{
            ...BASE,
            ...AGENT_DETAIL,
            state: "answered",
            answeredAt: "2026-08-26T15:04:00+02:00",
            raisedBy: { kind: "agent", id: null, label: null },
            answeredBy: "S. Vogt",
          }}
        />
      </div>
    </Card>
  ),
};

export const History: Story = {
  render: () => (
    <Card>
      <CardHead title="Verlauf" sub="gestellt · beantwortet · aufgelöst, je mit Person und Datum" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          clarification={{
            ...BASE,
            ...AGENT_DETAIL,
            state: "answered",
            answeredAt: "2026-08-26T15:04:00+02:00",
            history: [
              { kind: "raised", at: "2026-08-26T09:12:00+02:00", by: null },
              {
                kind: "answered",
                at: "2026-08-26T15:04:00+02:00",
                by: "S. Vogt",
                text: "Reisekosten (4670) — die Übernachtung überwiegt.",
              },
              {
                kind: "resolved",
                at: "2026-08-27T08:30:00+02:00",
                by: "S. Vogt",
                text: "Rest telefonisch mit dem Mandanten geklärt.",
              },
            ],
          }}
        />
      </div>
    </Card>
  ),
};

/** A question the firm raised itself: text only, no facts, no sources. */
export const ByHand: Story = {
  render: () => (
    <Card>
      <CardHead title="Von Hand gestellt" sub="Herkunft Kanzlei — keine leeren Blöcke" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{
            ...BASE,
            id: "c5",
            title: "Gehört der Laptop ins Anlagevermögen?",
            audience: "client",
            text: "Bitte sagen Sie uns, ob das Gerät privat mitgenutzt wird.",
            answerKind: "free_text",
            originLabel: "Kanzlei",
          }}
          onAnswer={async () => {}}
        />
      </div>
    </Card>
  ),
};

export const InPortal: Story = {
  render: () => (
    <Card>
      <CardHead title="Im Portal" sub="client_text, ohne Schwere und Herkunft" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{
            ...BASE,
            id: "c6",
            title: "Wurde das Fahrrad weiterverkauft?",
            audience: "client",
            severity: "optional",
            text:
              "Wir haben eine Rechnung über ein Fahrrad gefunden. Damit wir richtig buchen: " +
              "Haben Sie es weiterverkauft oder nutzen Sie es selbst?",
            answerKind: "single_choice",
            answerOptions: ["Wird weiterverkauft", "Eigene Nutzung"],
          }}
          onAnswer={async () => {}}
        />
      </div>
    </Card>
  ),
};

/**
 * A deferral after it has been set — **three situations side by side**: once,
 * repeatedly, and hanging on a counter-question. The date stands absolute
 * (T7), the reason beside it, and from the second time the card says which
 * one it is: that is the warning before the lock, and it arrives before the
 * lock does.
 *
 * The first card runs in `answer` mode on purpose: a deferral is „not now",
 * not a ban — whoever can answer today should not have to wait for the
 * deferral day.
 */
export const Deferred: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Card>
        <CardHead title="Einmal zurückgestellt" sub="Datum, Grund — und der Antwortbereich bleibt" />
        <div style={{ padding: "var(--space-4)" }}>
          <ClarificationCard
            mode="answer"
            onAnswer={async () => {}}
            onDefer={async () => {}}
            clarification={{
              ...BASE,
              ...AGENT_DETAIL,
              state: "deferred",
              deferredUntil: "2026-09-15",
              deferredReason: "wartet auf den Jahresabschluss des Mandanten",
              deferredCount: 1,
            }}
          />
        </div>
      </Card>

      <Card>
        <CardHead title="Zum dritten Mal" sub="die Warnung vor der Sperre" />
        <div style={{ padding: "var(--space-4)" }}>
          <ClarificationCard
            clarification={{
              ...BASE,
              id: "c8",
              ...AGENT_DETAIL,
              state: "deferred",
              deferredUntil: "2026-09-30",
              deferredReason: "Mandant meldet sich nicht",
              deferredCount: 3,
            }}
          />
        </div>
      </Card>

      <Card>
        <CardHead title="An einer Gegenfrage" sub="das Datum ist nicht die Bedingung" />
        <div style={{ padding: "var(--space-4)" }}>
          <ClarificationCard
            clarification={{
              ...BASE,
              id: "c9",
              ...AGENT_DETAIL,
              state: "deferred",
              deferredUntil: "2026-09-20",
              deferredReason: "hängt an der Rückfrage zum Mietvertrag",
              deferredCount: 1,
              deferredBy: {
                id: "c7",
                title: "Läuft der Mietvertrag über 2026 hinaus?",
                href: "#sachverhalt-2026-0412",
              },
            }}
          />
        </div>
      </Card>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Card>
      <CardHead title="Sendet" sub="pending am Knopf" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL }}
          onAnswer={async () => {}}
          pending
        />
      </div>
    </Card>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <Card>
      <CardHead title="Fehlgeschlagen" sub="Fehler am Knopf, Eingabe bleibt" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationCard
          mode="answer"
          clarification={{ ...BASE, ...AGENT_DETAIL }}
          onAnswer={async () => {}}
          error="Die Frage ist bereits beantwortet."
        />
      </div>
    </Card>
  ),
};

/* --- `variant="step"` (0222): one question at a time in the batch review --- */

/**
 * A question as the batch review asks it — fictional, modelled on a real kind
 * (seat of the supplier against §13b): long account name, foreign currency,
 * every group of the box filled.
 */
const STEP_QUESTION: ClarificationVM & ClarificationDetailVM = {
  id: "q-0412",
  title: "Wolkenhaus-Rechnung WH-26-00871 über 42,84 € (Dezember 2025): Steuerschlüssel unklar",
  state: "open",
  severity: "required",
  type: "question",
  audience: "accounting",
  raisedAt: "2026-10-09T19:14:47+02:00",
  raisedBy: { kind: "agent", id: null, label: null },
  question: "Wie soll die Wolkenhaus-Rechnung WH-26-00871 über 42,84 € gebucht werden?",
  context:
    "Die Rechnung von **Wolkenhaus S.à r.l.** lautet über 50,00 USD (42,84 €) und weist 6,84 € USt (19 %) aus. " +
    "Die Erkennung hat Deutschland als Sitzland gelesen, Wolkenhaus sitzt in Luxemburg. 2025 liefen Wolkenhaus-Rechnungen " +
    "auf **6837 Lizenzen und Konzessionen mit BU 506** (§13b EU) gegen **70412**. Vorsteuer 19 % lehnt der Server wegen " +
    "der USD-Rechnung ab, §13b wegen des Sitzlands DE.",
  text: "",
  facts: [
    { label: "Rechnung", value: "36,00 € netto + 6,84 € USt = 42,84 € (50,00 USD)" },
    { label: "Kartenzahlung", value: "42,91 € am 02.01.2026" },
    { label: "Präzedenz 2025", value: "6837 an 70412 BU 506" },
  ],
  answerKind: "single_choice",
  answerOptions: [
    "Wie 2025: 6837 mit BU 506 gegen 70412 (Sitzland Luxemburg)",
    "Brutto ohne Steuerschlüssel auf 6837 gegen 70412",
    "Mit Vorsteuer 19 % (BU 9) auf 6837 gegen 70412",
  ],
  recommendedOption: "Wie 2025: 6837 mit BU 506 gegen 70412 (Sitzland Luxemburg)",
  recommendation: "So hat die Kanzlei Wolkenhaus bisher gebucht; das Sitzland am Kreditor wird auf Luxemburg korrigiert.",
  allowFreeText: true,
  questionType: "agent_clarification",
  sourceModule: "booking-module",
  evidence: {
    cases: [{ id: "case-0412", number: "2026-0412", title: "Wolkenhaus S.à r.l., Cloud-Speicher Dezember 2025" }],
    documents: [
      { id: "doc-0871", cited: true, date: "2026-01-01", issuer: "Wolkenhaus S.à r.l.", number: "WH-26-00871", amount: 42.84, currency: "EUR" },
    ],
    payments: [
      {
        id: "bt-0207",
        date: "2026-01-02",
        amount: -42.91,
        currency: "EUR",
        counterparty: "WOLKENHAUS SARL",
        purpose: "WOLKENHAUS*STORAGE 50.00 USD KURS 1,1652",
        paymentAccount: "1802 Geschäftskonto",
      },
    ],
    statements: [{ id: "imp-1802-2026-01", paymentAccount: "1802 Geschäftskonto", periodFrom: "2026-01-01", periodTo: "2026-01-31" }],
    accounts: [
      { id: "6837", cited: true, number: "6837", name: "Aufwendungen für die zeitlich befristete Überlassung von Rechten (Lizenzen, Konzessionen)" },
      { id: "70412", cited: true, number: "70412", name: "Wolkenhaus S.à r.l." },
    ],
    entries: [{ id: "je-2025-1187", date: "2025-12-02", debit: "6837", credit: "70412", amount: 41.97, currency: "EUR", taxKey: "506" }],
  },
};

/** The page around the step card: full width, the drawer line under it. */
const StepFrame = ({ children, picked }: { children: React.ReactNode; picked?: string | null }) => (
  <div style={{ maxWidth: 1180 }}>
    {children}
    {picked !== undefined ? (
      <p className="lw-ui-hint">{picked ? `Drawer öffnet: ${picked}` : "Ein Eintrag im Kasten „Kontext“ öffnet seinen Drawer."}</p>
    ) : null}
  </div>
);

/**
 * The slim question (0222): topic small, question as the headline, context,
 * facts, the options with the recommended one marked and its why right under
 * them, every way out in one row — and „Kontext" on the right.
 */
export const Step: Story = {
  render: () => {
    const [picked, setPicked] = useState<string | null>(null);
    return (
      <StepFrame picked={picked}>
        <ClarificationCard
          variant="step"
          mode="answer"
          clarification={STEP_QUESTION}
          submitLabel="Speichern und weiter"
          onSelect={(item) => setPicked(`${item.kind}:${item.id}`)}
          onAnswer={async () => {}}
          onAskClient={async () => {}}
          onResolve={async () => {}}
          onDefer={async () => {}}
        />
      </StepFrame>
    );
  },
};

/** Without options the field stands open, and the row has no „Eigene Antwort schreiben"; one group in the box; optional, so a hint and no badge. */
export const StepFreeText: Story = {
  render: () => (
    <StepFrame>
      <ClarificationCard
        variant="step"
        mode="answer"
        clarification={{
          ...STEP_QUESTION,
          id: "q-0131",
          // Optional: the hint under the question instead of a badge (owner 2026-10-26).
          severity: "optional",
          title: "Tabula-Rechnung vom 03.01.2026 ohne Projekt",
          question: "Zu welchem Projekt gehört die Tabula-Rechnung über 54,00 USD vom 03.01.2026?",
          context: "Die Rechnung nennt nur das Konto **team@musterfirma.de**. Für Tabula gibt es zwei Kostenstellen.",
          facts: [{ label: "Betrag", value: "54,00 USD" }],
          answerKind: "free_text",
          answerOptions: [],
          recommendedOption: null,
          recommendation: null,
          evidence: {
            documents: [
              { id: "doc-0131", cited: true, date: "2026-01-03", issuer: "Tabula Cloud Inc.", number: "INV-2026-000183", amount: 54, currency: "USD" },
            ],
          },
        }}
        submitLabel="Speichern und weiter"
        onAnswer={async () => {}}
        onAskClient={async () => {}}
        onResolve={async () => {}}
        onDefer={async () => {}}
      />
    </StepFrame>
  ),
};

/**
 * „Beim Mandanten klären": the note replaces the answer; saved, the card says
 * so and keeps the note. Below, a question already marked: the callout from
 * the start, and the note field filled with it (`freeText.defaultValue`,
 * acceptance 0222 H1). Esc in the note goes back without saving.
 */
export const StepAskClient: Story = {
  render: () => {
    const [note, setNote] = useState<string | null>(null);
    const [marked, setMarked] = useState<string | null>("Bitte die Rechnung von Wolkenhaus mit dem Leistungszeitraum nachreichen.");
    const ask = (set: (t: string) => void) => async (text: string) => {
      await new Promise((r) => setTimeout(r, 400));
      set(text);
    };
    return (
      <StepFrame>
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          <ClarificationCard
            variant="step"
            mode="answer"
            clarification={{ ...STEP_QUESTION, clientNote: note }}
            submitLabel="Speichern und weiter"
            onAnswer={async () => {}}
            onAskClient={ask(setNote)}
            onResolve={async () => {}}
            onDefer={async () => {}}
          />
          <ClarificationCard
            variant="step"
            mode="answer"
            clarification={{ ...STEP_QUESTION, id: "q-0412-marked", clientNote: marked }}
            submitLabel="Speichern und weiter"
            onAnswer={async () => {}}
            onAskClient={ask(setMarked)}
            onResolve={async () => {}}
            onDefer={async () => {}}
          />
        </div>
      </StepFrame>
    );
  },
};

/** Deferred, with a history that says more than „asked": the row offers „Zurückstellung aufheben". */
export const StepDeferredWithHistory: Story = {
  render: () => (
    <StepFrame>
      <ClarificationCard
        variant="step"
        mode="answer"
        clarification={{
          ...STEP_QUESTION,
          state: "deferred",
          deferredUntil: "2026-11-05",
          deferredReason: "Rückfrage beim Mandanten läuft",
          history: [
            { kind: "raised", at: "2026-10-09T14:22:01+02:00", by: null },
            { kind: "deferred", at: "2026-10-12T09:41:00+02:00", by: "S. Vogt", text: "Rückfrage beim Mandanten läuft" },
          ],
        }}
        submitLabel="Speichern und weiter"
        onAnswer={async () => {}}
        onAskClient={async () => {}}
        onResolve={async () => {}}
        onDefer={async () => {}}
        onUndefer={async () => {}}
      />
    </StepFrame>
  ),
};

/** Saving (`pending`) and a failed save (`error`) — the choice stays. */
export const StepLoadingAndError: Story = {
  render: () => (
    <StepFrame>
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <ClarificationCard variant="step" mode="answer" clarification={STEP_QUESTION} submitLabel="Speichern und weiter" pending onAnswer={async () => {}} onResolve={async () => {}} />
        <ClarificationCard
          variant="step"
          mode="answer"
          clarification={STEP_QUESTION}
          submitLabel="Speichern und weiter"
          error="Die Antwort wurde nicht gespeichert. Die Verbindung zum Server ist abgebrochen. Versuchen Sie es noch einmal."
          onAnswer={async () => {}}
          onResolve={async () => {}}
        />
      </div>
    </StepFrame>
  ),
};

/**
 * A yes/no question in the step form (0222 Nachtrag, finding in the app
 * 2026-10-26): two rows „Ja" and „Nein", the recommended one marked; the
 * answer goes out as `optionId: "yes" | "no"` — the app maps it to its
 * boolean. The free text and the ways as with any choice.
 */
export const StepYesNo: Story = {
  render: () => {
    const [sent, setSent] = useState<string | null>(null);
    return (
      <StepFrame>
        <ClarificationCard
          variant="step"
          mode="answer"
          clarification={{
            ...STEP_QUESTION,
            id: "q-0421",
            title: "Druckerei-Hansen-Rechnung vom 30.01.2026, bezahlt am 03.02.2026",
            question: "Soll die Rechnung im Rechnungsmonat Januar gebucht werden?",
            context:
              "Die Rechnung der **Druckerei Hansen** über 238,00 € ist auf den 30.01.2026 datiert, die Leistung lag im Januar. " +
              "Bezahlt wurde am 03.02.2026 vom Geschäftskonto.",
            facts: [
              { label: "Rechnungsdatum", value: "30.01.2026" },
              { label: "Zahlung", value: "238,00 € am 03.02.2026" },
            ],
            answerKind: "yes_no",
            answerOptions: [],
            recommendedOption: "yes",
            recommendation: "Leistung und Rechnung liegen im Januar; die Zahlung im Februar ändert den Monat der Buchung nicht.",
            evidence: {
              documents: [
                { id: "doc-0421", cited: true, date: "2026-01-30", issuer: "Druckerei Hansen", number: "DH-2026-0117", amount: 238, currency: "EUR" },
              ],
              payments: [
                {
                  id: "bt-0314",
                  date: "2026-02-03",
                  amount: -238,
                  currency: "EUR",
                  counterparty: "Druckerei Hansen",
                  purpose: "RE DH-2026-0117",
                  paymentAccount: "1802 Geschäftskonto",
                },
              ],
            },
          }}
          submitLabel="Speichern und weiter"
          onAnswer={async (a) => setSent(`optionId: ${a.optionId ?? "—"}${a.text ? ` · Text: ${a.text}` : ""}`)}
          onAskClient={async () => {}}
          onResolve={async () => {}}
          onDefer={async () => {}}
        />
        {sent ? <p className="lw-ui-hint">Gesendet: {sent}</p> : null}
        {/* Read mode: no row carries the mark, the callout names the word — „Ja", not the key. */}
        <div style={{ marginTop: "var(--space-6)" }}>
          <ClarificationCard
            mode="read"
            clarification={{
              ...STEP_QUESTION,
              id: "q-0421-read",
              title: "Soll die Rechnung im Rechnungsmonat Januar gebucht werden?",
              question: null,
              context: null,
              facts: [],
              answerKind: "yes_no",
              answerOptions: [],
              recommendedOption: "yes",
              recommendation: "Leistung und Rechnung liegen im Januar.",
              evidence: undefined,
            }}
          />
        </div>
      </StepFrame>
    );
  },
};

/**
 * Paging under one card (0222, „Zustand je Frage"): each question starts from
 * its own preselection, and the note mode does not travel to the next one.
 */
export const StepPaging: Story = {
  render: () => {
    const questions: (ClarificationVM & ClarificationDetailVM)[] = [
      STEP_QUESTION,
      {
        ...STEP_QUESTION,
        id: "q-0129",
        title: "Gegenpartei weicht ab: Beleg nennt „Brightline Technology GmbH“",
        question: "Welche Gegenpartei gilt für diesen Sachverhalt?",
        context:
          "Der Sachverhalt ist bereits einer Gegenpartei zugeordnet, der neu angehängte Beleg weist aber auf eine andere hin. Zuordnungen werden nicht still überschrieben.",
        facts: [
          { label: "Zuordnung des Sachverhalts", value: "Serverhaus Nord GmbH" },
          { label: "Signal des Belegs", value: "Brightline Technology GmbH (Konto 10129)" },
        ],
        answerOptions: ["Zuordnung des Sachverhalts behalten", "Auf „Brightline Technology GmbH“ ändern"],
        recommendedOption: "Zuordnung des Sachverhalts behalten",
        recommendation: "Der Beleg nennt Serverhaus Nord als Leistenden; Brightline Technology steht nur in der Rechnungsadresse.",
        evidence: { cases: [{ id: "case-0129", number: "2026-0129", title: "Serverhaus Nord GmbH, Serverkosten Januar" }] },
      },
      // A third, so the middle one has both arrows: a focus on the pager stays
      // there while paging (rule I13; acceptance 0222, hint of the second check).
      {
        ...STEP_QUESTION,
        id: "q-0133",
        title: "Druckerei-Hansen-Rechnung ohne Leistungsmonat",
        question: "In welchem Monat lag die Leistung der Druckerei Hansen?",
        context: "Die Rechnung DH-2026-0094 nennt kein Leistungsdatum. Bezahlt wurde am 12.01.2026.",
        facts: [{ label: "Rechnungsbetrag", value: "119,00 €" }],
        answerOptions: ["Dezember 2025", "Januar 2026"],
        recommendedOption: null,
        recommendation: null,
        evidence: { cases: [{ id: "case-0133", number: "2026-0133", title: "Druckerei Hansen, Flyer" }] },
      },
    ];
    const [i, setI] = useState(0);
    return (
      <StepFrame>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <RecordPager
            label="Frage"
            position={i + 1}
            total={questions.length}
            onPrev={i > 0 ? () => setI(i - 1) : null}
            onNext={i < questions.length - 1 ? () => setI(i + 1) : null}
          />
          <ClarificationCard
            variant="step"
            mode="answer"
            clarification={questions[i]!}
            submitLabel="Speichern und weiter"
            onAnswer={async () => setI(Math.min(i + 1, questions.length - 1))}
            onAskClient={async () => {}}
            onResolve={async () => {}}
          />
        </div>
      </StepFrame>
    );
  },
};

