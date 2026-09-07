"use client";

import { Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { deriveTax } from "./tax-assist";
// Direkt statt über das Barrel: `@/ui/status` exportiert auch `FlowModal`
// und zieht darüber `@/modules/invoices` samt DB-Treiber ins Bundle (P22).
import { ActionIcon } from "../../Icons";
import { IconButton } from "../../primitives/IconButton";
import { StatusBadge } from "../../patterns/StatusBadge";

import { formatAmount } from "../../format";
import { parseAmount } from "../../primitives/AmountInput";
import { Button } from "../../primitives/Button";
import { Dialog } from "../../primitives/Dialog";
import { AccountField, type AccountCandidate, type AccountGroup } from "../account/AccountField";
import type { KnownDocumentNumber } from "@/ludwig/modules/accounting-cases/domain/document-number";

import { DocumentNumberField } from "../document-number/DocumentNumberField";
import type { DocumentNumberSourceLabels } from "../document-number/document-number-labels";
import { JournalEntryCard } from "./JournalEntryCompact";
import { AiBookingNotes } from "./AiBookingNotes";

// Beträge im Editor: eine Währung, ein Formatierer (T7, 0043). Der Editor
// rechnet in Brutto und braucht aus einem Feldwert immer eine Zahl — deshalb
// fällt `toNumber` auf 0 zurück, wo `parseAmount` `null`/`"invalid"` liefert.
const euro = (n: number) => formatAmount(n, "EUR");
const toNumber = (s: string | number | null | undefined) => {
  const n = parseAmount(String(s ?? "").replace("€", ""));
  return typeof n === "number" ? n : 0;
};

/**
 * Der eine Buchungssatz-Editor (F123 T123.3).
 *
 * Gebaut nach dem F123-Artboard, das nicht mit ausgeliefert wurde. Das
 * F109-Pendant liegt unter `reference/f109-buchungsreview/` — ein zweiter
 * Entwurf derselben Komponente, abgeglichen am 2026-09-03: an drei Stellen
 * weiter als dieser Stand (Aufgaben 0013, 0015 und 0007), sonst nicht.
 *
 * **Eine Komponente für Anzeigen und Bearbeiten.** Der Modus wechselt, das
 * Raster bleibt — wer eine Buchung gelesen hat, findet beim Korrigieren
 * dieselben Spalten an derselben Stelle. Ein zweiter Editor daneben (der alte
 * `ManualBookingDrawer`) hieße: zwei Wahrheiten über dasselbe.
 *
 * Die Spaltenordnung ist **DATEV**, nicht Ludwig: Datum · Umsatz · S/H · BU ·
 * Konto · Beleg 1 · Text. Die Zielgruppe liest seit Jahren Buchungsstapel in
 * dieser Reihenfolge; jede andere kostet sie bei jeder Zeile einen Gedanken.
 *
 * Beträge sind **brutto**, wie auf dem Beleg. Die Steuerzeile leitet der
 * Editor ab und zeigt sie unter der Zeile — sie wird beim Speichern erzeugt
 * (`./tax-assist.ts`), nicht getippt.
 *
 * Was der Editor **nicht** kann: mehrere Sätze je Ereignis. `saveEventBooking`
 * konsolidiert auf einen Satz; der „+ weiterer Buchungssatz"-Knopf des Designs
 * entfällt deshalb (Owner-Entscheid 2026-08-30, F123 §5). Splits laufen über
 * mehrere Zeilen im selben Satz.
 */

export type EditorMode = "einfach" | "voll";
export type EditorStatus = "proposed" | "accepted" | "posted" | "reversed";
export type Side = "S" | "H";

export interface EditorRow {
  id: string;
  datum: string;
  currency?: string;
  /** Brutto, deutsches Format („1.475,60"). */
  umsatz: string;
  side: Side;
  /** DATEV-BU-Schlüssel („9", „8", „94", …) oder leer. */
  bu: string;
  /** Automatikkonten setzen den Schlüssel selbst — dann ist das Feld gesperrt. */
  buLocked?: boolean;
  konto: string;
  kontoName: string;
  beleg1: string;
  beleg2?: string;
  text: string;
  kost1?: string;
  /** Kandidaten für das Konto-Feld dieser Zeile. */
  candidates?: Partial<Record<AccountGroup, AccountCandidate[]>>;
  /** Zeile ist gelöscht, aber rücknehmbar. */
  removed?: boolean;
}

export interface EditorMessage {
  code: string;
  message: string;
  /** Was den Befund behebt — der Knopf steht an der Message. */
  fixLabel?: string;
  onFix?: () => void;
}

export interface EditorAiReview {
  verdict: "confirm" | "confirm_with_note" | "adjust" | "flag" | null;
  confidence?: React.ComponentProps<typeof AiBookingNotes>["confidence"];
  rationale?: string | null;
  judgeReasoning?: string | null;
  sources?: React.ComponentProps<typeof AiBookingNotes>["sources"];
  errors?: string[];
}

export interface JournalEntryEditorProps {
  rows: EditorRow[];
  /** Das Gegenkonto — die Zeile, die den Satz ausgleicht. */
  gegenkonto: { konto: string; name: string; tag?: string } | null;
  /** Beleg, gegen den der Rest gerechnet wird. */
  belegNumber?: string | null;
  belegAmount?: number | null;
  belegSide?: Side;
  status: EditorStatus;
  editable: boolean;
  mode?: EditorMode;
  /** Der Satz ist gesperrt — mit Grund und dem einen erlaubten Ausweg. */
  locked?: { reason: string; actionLabel?: string; onAction?: () => void } | null;
  reversedReason?: string | null;
  deletable?: boolean;
  errors?: EditorMessage[];
  warnings?: EditorMessage[];
  hints?: EditorMessage[];
  aiReview?: EditorAiReview | null;
  /**
   * Kontenrahmen des Wirtschaftsjahres (`skr03`/`skr04`) — schaltet die
   * Steuerassistenz frei. Ohne ihn wird keine Steuerzeile abgeleitet; der
   * Editor rät keinen Rahmen.
   */
  accountFramework?: string | null;
  onSearchAccounts?: (query: string) => Promise<AccountCandidate[]>;
  onSave?: (rows: EditorRow[], reason: string) => void | Promise<void>;
  onCancel?: () => void;
  onEdit?: () => void;
  onDelete?: (reason: string) => void | Promise<void>;
  /** Kontenblatt eines Kontos öffnen (Drawer des Aufrufers). */
  onOpenLedger?: (konto: string) => void;
  /**
   * Open the register of document numbers for **this row** (0014). Set → the
   * magnifier appears at the field; left out → no icon, like `AccountField`.
   * The row id goes along because the caller has to know where to put the
   * number that comes back.
   */
  onOpenDocumentNumberRegister?: (rowId: string) => void;
  /**
   * The number that **holds** for this case, with where it comes from — the
   * dominance order of the document-number sources (`belegnummer_quelle`,
   * computed in `modules/datev-truth`). Where the row differs from it,
   * `DocumentNumberField` says so; the editor computes nothing and guesses
   * nothing.
   */
  dominantDocumentNumber?: KnownDocumentNumber | null;
  /** The words of the nine sources — a prop, because there is no axis (L-71). */
  documentNumberSourceLabel?: DocumentNumberSourceLabels;
  /** Erklärung eines BU-Schlüssels öffnen. */
  onOpenTaxKey?: (bu: string) => void;
  /**
   * Set → the contra account is **editable**, with the same `AccountField` as
   * the rows. Left out → read-only as before. The side (debit/credit) stays
   * fixed either way: it is the opposite side of the document and follows
   * from `belegSide` — a switch there would produce an entry that does not
   * balance. The `≠` in the totals row is the honester answer.
   */
  onContraAccountChange?: (accountNumber: string, accountName: string) => void;
  /** Candidates for the contra-account field, in the shape `AccountField` takes. */
  contraAccountCandidates?: React.ComponentProps<typeof AccountField>["candidates"];
  /** Schnellfunktionen: Klärungskonto, wie letzte Buchung, Privatanteil. */
  quickActions?: { klaerungskonto?: () => void; wieLetzte?: () => void; privatanteil?: () => void };
}


/** Die Summe der Zeilen auf der Belegseite — daraus fällt der Rest. */
function summeBelegseite(rows: readonly EditorRow[], belegSide: Side): number {
  return rows
    .filter((r) => !r.removed && r.side === belegSide)
    .reduce((s, r) => s + toNumber(r.umsatz), 0);
}

/**
 * @when    Viewing or editing a booking entry — one grid for both.
 * @instead A second editor for the same booking entry.
 */
export function JournalEntryEditor(props: JournalEntryEditorProps) {
  const {
    gegenkonto,
    belegNumber,
    belegAmount,
    belegSide = "S",
    status,
    editable,
    locked,
    reversedReason,
    deletable,
    errors = [],
    warnings = [],
    hints = [],
    aiReview,
    accountFramework,
    onSearchAccounts,
    onSave,
    onCancel,
    onEdit,
    onDelete,
    onOpenLedger,
    onOpenTaxKey,
    onOpenDocumentNumberRegister,
    dominantDocumentNumber,
    documentNumberSourceLabel,
    onContraAccountChange,
    contraAccountCandidates,
    quickActions,
  } = props;

  const [rows, setRows] = useState<EditorRow[]>(props.rows);
  const [mode, setMode] = useState<EditorMode>(props.mode ?? "einfach");
  const [reason, setReason] = useState("");
  const [journalOffen, setJournalOffen] = useState(false);
  const [stornoOffen, setStornoOffen] = useState(false);
  const [stornoGrund, setStornoGrund] = useState("");

  useEffect(() => setRows(props.rows), [props.rows]);

  const aktiv = useMemo(() => rows.filter((r) => !r.removed), [rows]);
  const summe = summeBelegseite(rows, belegSide);
  const rest = belegAmount == null ? null : belegAmount - summe;

  // **Warnings do not block.** They stand there in plain sight and saving
  // goes through; only errors stop it. The acknowledgement was an attempt to
  // force a decision — and a forced acknowledgement gets clicked, not read
  // (owner decision, 2026-09-07).
  const saveBlocked = errors.length > 0 || aktiv.length === 0;

  /**
   * Do the active rows carry **different** values in document field 1? The
   * empty value counts — it is the most common deviation, and exactly the one
   * the server reports later as check `P-BELEG`.
   */
  const documentNumbersDiffer =
    aktiv.length > 1 && new Set(aktiv.map((r) => r.beleg1.trim())).size > 1;

  const applyDocumentNumberToAll = useCallback((value: string) => {
    setRows((rs) => rs.map((r) => (r.removed ? r : { ...r, beleg1: value })));
  }, []);

  const setRow = useCallback((id: string, patch: Partial<EditorRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const speichern = useCallback(() => {
    if (saveBlocked || !onSave) return;
    void onSave(aktiv, reason.trim());
  }, [saveBlocked, onSave, aktiv, reason]);

  // Alt+V wechselt die Sicht, Ctrl+Enter speichert, Esc bricht ab. Alle drei
  // stehen sichtbar am jeweiligen Knopf.
  useEffect(() => {
    if (!editable) return;
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        setMode((m) => (m === "einfach" ? "voll" : "einfach"));
        return;
      }
      if (e.altKey && quickActions) {
        const k = e.key.toLowerCase();
        const fn =
          k === "k" ? quickActions.klaerungskonto
          : k === "w" ? quickActions.wieLetzte
          : k === "p" ? quickActions.privatanteil
          : undefined;
        if (fn) {
          e.preventDefault();
          fn();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        speichern();
        return;
      }
      if (e.key === "Escape" && onCancel) {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editable, onCancel, quickActions, speichern]);

  const voll = mode === "voll";
  const cols = voll
    ? "88px 56px 104px 40px 62px 148px 96px 96px minmax(0,1fr) 80px 32px"
    : "88px 104px 40px 62px 148px 96px minmax(0,1fr) 32px";

  return (
    <div className="bse">
      <Kopf
        belegNumber={belegNumber}
        belegAmount={belegAmount}
        status={status}
        rest={rest}
        voll={voll}
        onToggleMode={() => setMode(voll ? "einfach" : "voll")}
      />

      {status === "reversed" ? (
        <div className="v2note v2note--warning" style={{ marginBottom: "var(--space-3)" }}>
          Diese Buchung wurde storniert. Sie bleibt als Beleg des Vorgangs stehen.
          {reversedReason ? ` Grund: ${reversedReason}` : ""}
        </div>
      ) : null}

      {locked ? (
        <div className="v2note v2note--soft" style={{ marginBottom: "var(--space-3)" }}>
          <div style={{ marginBottom: locked.onAction ? 8 : 0 }}>
            {locked.reason} Dieser Satz kann nicht bearbeitet werden.
          </div>
          {locked.onAction ? (
            <Button variant="secondary" size="sm" onClick={locked.onAction}>
              {locked.actionLabel ?? "Storno + Neu"}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="bse__tbl" style={{ "--bse-cols": cols } as React.CSSProperties}>
        <div className="bse__head">
          <span>Datum</span>
          {voll ? <span>Whg.</span> : null}
          <span className="v2num">Umsatz</span>
          <span>S/H</span>
          <span>BU</span>
          <span>Konto</span>
          <span>Beleg 1</span>
          {voll ? <span>Beleg 2</span> : null}
          <span>Text</span>
          {voll ? <span>KOST</span> : null}
          <span />
        </div>

        {rows.map((r) =>
          r.removed ? (
            <div className="bse__removed" key={r.id}>
              <span>Zeile entfernt · {r.konto} · {r.umsatz}</span>
              <button type="button" className="v2link" onClick={() => setRow(r.id, { removed: false })}>
                <Undo2 size={12} strokeWidth={1.5} /> Löschen rückgängig machen
              </button>
            </div>
          ) : (
            <Zeile
              key={r.id}
              row={r}
              voll={voll}
              editable={editable && !locked}
              accountFramework={accountFramework}
              rest={rest}
              loeschbar={aktiv.length > 1}
              onChange={(patch) => setRow(r.id, patch)}
              onRemove={() => setRow(r.id, { removed: true })}
              onSearchAccounts={onSearchAccounts}
              onOpenLedger={onOpenLedger}
              onOpenTaxKey={onOpenTaxKey}
              {...(onOpenDocumentNumberRegister ? { onOpenDocumentNumberRegister } : {})}
              {...(dominantDocumentNumber ? { dominantDocumentNumber } : {})}
              {...(documentNumberSourceLabel ? { documentNumberSourceLabel } : {})}
              {...(documentNumbersDiffer
                ? { onApplyDocumentNumberToAll: () => applyDocumentNumberToAll(r.beleg1) }
                : {})}
            />
          ),
        )}

        {gegenkonto ? (
          <div className="bse__gegen">
            <span className="bse__gegen__label">
              {/* The side is fixed — it is the opposite side of the document. */}
              an {belegSide === "S" ? "H" : "S"}{" "}
              {editable && !locked && onContraAccountChange ? (
                // The same field as in the rows: same behaviour, same
                // keyboard, and the account-sheet icon (0013) comes along.
                <AccountField
                  value={gegenkonto.konto}
                  {...(gegenkonto.name ? { valueName: gegenkonto.name } : {})}
                  onChange={(konto, candidate) =>
                    onContraAccountChange(konto, candidate?.name ?? gegenkonto.name)
                  }
                  candidates={contraAccountCandidates ?? {}}
                  {...(onSearchAccounts ? { onSearch: onSearchAccounts } : {})}
                  {...(onOpenLedger ? { onOpenLedger } : {})}
                  ariaLabel="Gegenkonto"
                />
              ) : (
                <>
                  {gegenkonto.konto} <span className="v2muted">{gegenkonto.name}</span>
                  {gegenkonto.tag ? <span className="bse__tag">{gegenkonto.tag}</span> : null}
                  {onOpenLedger ? (
                    <button
                      type="button"
                      className="v2link v2link--quiet"
                      onClick={() => onOpenLedger(gegenkonto.konto)}
                    >
                      Kontenblatt
                    </button>
                  ) : null}
                </>
              )}
            </span>
            <span className="v2num">{euro(summe)}</span>
          </div>
        ) : null}
      </div>

      {editable ? (
        <div className="bse__rowactions">
          <button
            type="button"
            className="v2link"
            onClick={() =>
              setRows((rs) => [
                ...rs,
                {
                  id: `neu-${Date.now()}`,
                  datum: rs[0]?.datum ?? "",
                  umsatz: rest && rest > 0 ? euro(rest).replace(/\s?€/, "") : "",
                  side: belegSide,
                  bu: "",
                  konto: "",
                  kontoName: "",
                  beleg1: rs[0]?.beleg1 ?? "",
                  text: rs[0]?.text ?? "",
                },
              ])
            }
          >
            + Zeile (Split)
          </button>
          {quickActions?.klaerungskonto ? (
            <button type="button" className="v2link v2link--quiet" onClick={quickActions.klaerungskonto}>
              Klärungskonto · Alt+K
            </button>
          ) : null}
          {quickActions?.wieLetzte ? (
            <button type="button" className="v2link v2link--quiet" onClick={quickActions.wieLetzte}>
              Wie letzte Buchung · Alt+W
            </button>
          ) : null}
          {quickActions?.privatanteil ? (
            <button type="button" className="v2link v2link--quiet" onClick={quickActions.privatanteil}>
              Privatanteil · Alt+P
            </button>
          ) : null}
        </div>
      ) : null}

      <Journal
        rows={aktiv}
        gegenkonto={gegenkonto}
        belegSide={belegSide}
        accountFramework={accountFramework}
        open={editable || journalOffen}
        onToggle={() => setJournalOffen((v) => !v)}
      />

      {aiReview ? (
        <AiBookingNotes
          verdict={aiReview.verdict}
          confidence={aiReview.confidence}
          rationale={aiReview.rationale}
          judgeReasoning={aiReview.judgeReasoning}
          sources={aiReview.sources}
          errors={aiReview.errors}
        />
      ) : null}

      <Meldungsblock errors={errors} warnings={warnings} hints={hints} />

      {editable ? (
        <>
          <label className="v2field" style={{ marginTop: "var(--space-3)" }}>
            <span className="v2field__label">Grund der Änderung (optional)</span>
            <input
              className="v2in"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Was Sie geändert haben und warum — steht später im Protokoll."
            />
          </label>
          <div className="bse__foot">
            {deletable && onDelete ? (
              <button type="button" className="v2link v2link--quiet" onClick={() => setStornoOffen(true)}>
                Löschen
              </button>
            ) : null}
            <span style={{ marginLeft: "auto" }} />
            <Button variant="secondary" size="sm" hotkey="Esc" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" hotkey="Ctrl+↵" disabled={saveBlocked} onClick={speichern}>
              Speichern &amp; freigeben
              {errors.length > 0 ? ` · ${errors.length} Fehler` : ""}
            </Button>
          </div>
        </>
      ) : (
        <div className="bse__foot">
          {deletable && onDelete ? (
            <button type="button" className="v2link v2link--quiet" onClick={() => setStornoOffen(true)}>
              Löschen
            </button>
          ) : null}
          <span style={{ marginLeft: "auto" }} />
          {status !== "posted" && onEdit && !locked ? (
            <Button variant="secondary" size="sm" hotkey="E" onClick={onEdit}>
              Buchung bearbeiten
            </Button>
          ) : null}
        </div>
      )}

      <Dialog
        open={stornoOffen}
        onClose={() => setStornoOffen(false)}
        title="Buchung entfernen?"
        kicker="Nicht umkehrbar"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setStornoOffen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={stornoGrund.trim().length === 0}
              onClick={() => {
                void onDelete?.(stornoGrund.trim());
                setStornoOffen(false);
              }}
            >
              Buchung stornieren
            </Button>
          </>
        }
      >
        <p style={{ marginTop: 0 }}>
          Die Buchung wird storniert, nicht gelöscht — sie bleibt als Beleg des Vorgangs stehen.
        </p>
        <label className="v2field">
          <span className="v2field__label">Grund</span>
          <textarea
            className="v2in"
            value={stornoGrund}
            onChange={(e) => setStornoGrund(e.target.value)}
            placeholder="Warum wird storniert?"
          />
        </label>
      </Dialog>
    </div>
  );
}

function Kopf({
  belegNumber,
  belegAmount,
  status,
  rest,
  voll,
  onToggleMode,
}: {
  belegNumber?: string | null;
  belegAmount?: number | null;
  status: EditorStatus;
  rest: number | null;
  voll: boolean;
  onToggleMode: () => void;
}) {
  // Der Rest ist die wichtigste Zahl des Editors: geht er nicht auf null, ist
  // der Satz nicht fertig. Deshalb steht er im Kopf, nicht am Ende.
  const zeigeRest = rest !== null && (voll || Math.abs(rest) >= 0.005);
  return (
    <div className="bse__kopf">
      <span className="bse__beleg">
        {belegNumber ? `Beleg ${belegNumber}` : "Ohne Belegnummer"}
        {belegAmount == null ? "" : ` · ${euro(belegAmount)}`}
      </span>
      <StatusBadge axis="buchung" status={status} info={false} />
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        {zeigeRest ? (
          <span className={`bse__rest${Math.abs(rest!) < 0.005 ? " is-ok" : " is-off"}`}>
            Rest {euro(rest!)}
            {Math.abs(rest!) < 0.005 ? " ✓" : ""}
          </span>
        ) : null}
        <button
          type="button"
          className="v2link"
          onClick={onToggleMode}
          title={voll ? "Zur einfachen Sicht" : "Zur vollen Sicht — alle DATEV-Spalten"}
        >
          {voll ? "Einfach ◂" : "Voll ▸"} · Alt+V
        </button>
      </span>
    </div>
  );
}

function Zeile({
  row,
  voll,
  editable,
  accountFramework,
  rest,
  loeschbar,
  onChange,
  onRemove,
  onSearchAccounts,
  onOpenLedger,
  onOpenTaxKey,
  onOpenDocumentNumberRegister,
  dominantDocumentNumber,
  documentNumberSourceLabel,
  onApplyDocumentNumberToAll,
}: {
  row: EditorRow;
  voll: boolean;
  editable: boolean;
  accountFramework?: string | null;
  rest: number | null;
  loeschbar: boolean;
  onChange: (patch: Partial<EditorRow>) => void;
  onRemove: () => void;
  onSearchAccounts?: (q: string) => Promise<AccountCandidate[]>;
  onOpenLedger?: (konto: string) => void;
  onOpenTaxKey?: (bu: string) => void;
  onOpenDocumentNumberRegister?: (rowId: string) => void;
  dominantDocumentNumber?: KnownDocumentNumber | null;
  documentNumberSourceLabel?: DocumentNumberSourceLabels;
  /** Set → the "apply to all rows" button stands under this row's field. */
  onApplyDocumentNumberToAll?: () => void;
}) {
  const brutto = toNumber(row.umsatz);
  // The tax line is derived, never typed — the same calculation that creates
  // the linked line on save.
  const steuer = deriveTax(
    { accountNumber: row.konto, taxKey: row.bu || null, amount: brutto },
    accountFramework,
  );

  return (
    <div className="bse__row">
      <div className="bse__cells">
        {editable ? (
          <>
            <input className="v2in" type="date" value={row.datum} onChange={(e) => onChange({ datum: e.target.value })} aria-label="Buchungsdatum" />
            {voll ? (
              <input className="v2in" value={row.currency ?? "EUR"} onChange={(e) => onChange({ currency: e.target.value })} aria-label="Währung" />
            ) : null}
            <input
              className="v2in v2num"
              value={row.umsatz}
              onChange={(e) => onChange({ umsatz: e.target.value })}
              onFocus={(e) => e.target.select()}
              onBlur={(e) => onChange({ umsatz: euro(toNumber(e.target.value)).replace(/\s?€/, "") })}
              aria-label="Umsatz"
            />
            <button
              type="button"
              className="bse__sh"
              onClick={() => onChange({ side: row.side === "S" ? "H" : "S" })}
              aria-label={`Side: ${row.side === "S" ? "Soll" : "Haben"}`}
            >
              {row.side}
            </button>
            <select
              className="v2in"
              value={row.bu}
              disabled={row.buLocked}
              title={row.buLocked ? "Automatikkonto — der Schlüssel steht am Konto" : undefined}
              onChange={(e) => onChange({ bu: e.target.value })}
              aria-label="Steuerschlüssel"
            >
              <option value="">—</option>
              <option value="9">9</option>
              <option value="8">8</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="94">94</option>
              <option value="40">40</option>
            </select>
            <AccountField
              value={row.konto}
              // The loaded name belongs in the field, not only in the
              // journal: without it the row shows a bare number as soon as
              // the account is not among the candidates by chance.
              // `AccountField` has the prop for exactly this (0013).
              {...(row.kontoName ? { valueName: row.kontoName } : {})}
              // The name comes along when the candidate carries it — without
              // it the row shows a number without a word, and the journal
              // beside it an empty account name.
              onChange={(konto, candidate) =>
                onChange(candidate ? { konto, kontoName: candidate.name } : { konto })
              }
              candidates={row.candidates ?? {}}
              onSearch={onSearchAccounts}
              // **The rest of 0013:** the account-sheet icon belongs at the
              // field, not only in the read-only grid. Without passing it
              // through, the way to the account sheet is missing exactly
              // where someone is choosing the account.
              {...(onOpenLedger ? { onOpenLedger } : {})}
              ariaLabel="Konto"
            />
            {/* Document number 1 is its own building block (0014): 36
                characters, where the current number comes from, the way into
                the register. A bare `<input>` here would be a second truth
                about the same rule. */}
            {documentNumberSourceLabel ? (
              <DocumentNumberField
                value={row.beleg1}
                onChange={(beleg1) => onChange({ beleg1 })}
                sourceLabel={documentNumberSourceLabel}
                {...(dominantDocumentNumber ? { dominant: dominantDocumentNumber } : {})}
                {...(onOpenDocumentNumberRegister
                  ? { onOpenRegister: () => onOpenDocumentNumberRegister(row.id) }
                  : {})}
              />
            ) : (
              <input className="v2in" value={row.beleg1} onChange={(e) => onChange({ beleg1: e.target.value })} aria-label="Belegfeld 1" />
            )}
            {voll ? (
              <input className="v2in" value={row.beleg2 ?? ""} onChange={(e) => onChange({ beleg2: e.target.value })} aria-label="Belegfeld 2" />
            ) : null}
            <input className="v2in" value={row.text} onChange={(e) => onChange({ text: e.target.value })} aria-label="Buchungstext" />
            {voll ? (
              <input className="v2in" value={row.kost1 ?? ""} onChange={(e) => onChange({ kost1: e.target.value })} aria-label="KOST 1" />
            ) : null}
            <span>
              {loeschbar ? (
                <button type="button" className="v2link v2link--quiet" onClick={onRemove} aria-label="Zeile entfernen">
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              ) : null}
            </span>
          </>
        ) : (
          <>
            <span>{row.datum}</span>
            {voll ? <span>{row.currency ?? "EUR"}</span> : null}
            <span className="v2num">{row.umsatz}</span>
            <span>{row.side}</span>
            <span>{row.bu || "—"}</span>
            <span className="bse__konto">
              {row.konto} <span className="v2muted">{row.kontoName}</span>
            </span>
            <span>{row.beleg1 || "—"}</span>
            {voll ? <span>{row.beleg2 || "—"}</span> : null}
            <span className="bse__text">{row.text}</span>
            {voll ? <span>{row.kost1 || "—"}</span> : null}
            <span>
              {onOpenLedger && row.konto ? (
                <IconButton
                  size="sm"
                  label={`Kontenblatt zu ${row.konto}`}
                  icon={<ActionIcon action="ledger" size={14} />}
                  onClick={() => onOpenLedger(row.konto)}
                />
              ) : null}
            </span>
          </>
        )}
      </div>

      <div className="bse__note">
        {steuer ? (
          <span>
            {onOpenTaxKey ? (
              <button type="button" className="v2link" onClick={() => onOpenTaxKey(row.bu)}>
                BU {row.bu}
              </button>
            ) : (
              <>BU {row.bu}</>
            )}
            {" · Netto "}
            {euro(steuer.net)} · {steuer.ratePercent} % {euro(steuer.tax)} →{" "}
            {steuer.account.accountNumber} · Brutto {euro(brutto)}
          </span>
        ) : null}
        {editable && rest !== null && Math.abs(rest) >= 0.005 ? (
          <button
            type="button"
            className="v2link"
            onClick={() => onChange({ umsatz: euro(toNumber(row.umsatz) + rest).replace(/\s?€/, "") })}
          >
            Rest {euro(rest)} einsetzen
          </button>
        ) : null}
        {/* Same make and same place as "insert the rest": a correction that
            stands where the finding shows up. The server raises the same one
            (check `P-BELEG`) — the button comes before it. */}
        {editable && onApplyDocumentNumberToAll ? (
          <button type="button" className="v2link" onClick={onApplyDocumentNumberToAll}>
            Belegfeld 1 in alle Zeilen übernehmen
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Was tatsächlich gespeichert wird — mit den abgeleiteten Steuerzeilen. Beim
 * Bearbeiten immer offen: wer brutto tippt, muss sehen, was daraus wird.
 */
function Journal({
  rows,
  gegenkonto,
  belegSide,
  accountFramework,
  open,
  onToggle,
}: {
  rows: readonly EditorRow[];
  /** Die Zeile, die den Satz ausgleicht — sie steht oben separat, gehört aber dazu. */
  gegenkonto: { konto: string; name: string } | null;
  belegSide: Side;
  accountFramework?: string | null;
  open: boolean;
  onToggle: () => void;
}) {
  // The posting text comes along: the journal is the **DATEV batch order**
  // (account · account name · posting text · debit · credit), and without it
  // the column `JournalEntryCard` has for it would stay empty.
  const zeilen: { konto: string; name: string; text: string; side: Side; amount: number }[] = [];
  for (const r of rows) {
    const brutto = toNumber(r.umsatz);
    const steuer = deriveTax(
      { accountNumber: r.konto, taxKey: r.bu || null, amount: brutto },
      accountFramework,
    );
    if (!steuer) {
      zeilen.push({ konto: r.konto, name: r.kontoName, text: r.text, side: r.side, amount: brutto });
      continue;
    }
    zeilen.push({ konto: r.konto, name: r.kontoName, text: r.text, side: r.side, amount: steuer.net });
    zeilen.push({
      konto: steuer.account.accountNumber,
      name: steuer.account.accountName,
      // The tax line carries the text of its own line: it is the same entry,
      // only split — in the batch the same text would stand there.
      text: r.text,
      side: r.side,
      amount: steuer.tax,
    });
  }
  // Das Gegenkonto steht in der Oberfläche als eigene Zeile über dem Journal,
  // gehört aber in die Summe — sonst meldet „Σ S ≠ Σ H" einen Fehler, den es
  // nicht gibt.
  if (gegenkonto?.konto) {
    const summe = rows
      .filter((r) => r.side === belegSide)
      .reduce((sum, r) => sum + toNumber(r.umsatz), 0);
    if (summe !== 0) {
      zeilen.push({
        konto: gegenkonto.konto,
        name: gegenkonto.name,
        // The contra account has no text of its own — it takes the one of the
        // first line, the way the batch would.
        text: rows[0]?.text ?? "",
        side: belegSide === "S" ? "H" : "S",
        amount: summe,
      });
    }
  }

  const soll = zeilen.filter((z) => z.side === "S").reduce((s, z) => s + z.amount, 0);
  const haben = zeilen.filter((z) => z.side === "H").reduce((s, z) => s + z.amount, 0);

  return (
    <div className="bse__journal">
      <button type="button" className="bse__journal__h" onClick={onToggle} aria-expanded={open}>
        <span className={`v2chev${open ? " is-open" : ""}`} />
        Journal (wird gespeichert)
        <span className="v2muted" style={{ marginLeft: "auto" }}>
          Σ S {euro(soll)} {Math.abs(soll - haben) < 0.005 ? "=" : "≠"} Σ H {euro(haben)}
        </span>
      </button>
      {open ? (
        <div className="bse__journal__body">
          {/*
            The journal is drawn by `JournalEntryCard` (0044), not by markup of
            its own. It used to be four columns here and five there — two
            pictures of one entry, and the editor's was the one nobody
            maintained. `totals={false}`, because the sum already stands in the
            head above, where it is visible while the body is collapsed.
          */}
          <JournalEntryCard
            lines={zeilen.map((z) => ({
              side: z.side === "S" ? ("debit" as const) : ("credit" as const),
              accountNumber: z.konto,
              accountName: z.name,
              text: z.text,
              amount: z.amount,
            }))}
            currency="EUR"
            totals={false}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Errors block saving; warnings and hints only stand there.
 *
 * The owner's decision of 2026-09-07 dropped the acknowledgement for
 * warnings: a warning you **must** tick gets ticked, not read — and it would
 * hold up the entry at a place where nothing is wrong, only conspicuous.
 */
function Meldungsblock({
  errors,
  warnings,
  hints,
}: {
  errors: EditorMessage[];
  warnings: EditorMessage[];
  hints: EditorMessage[];
}) {
  if (errors.length + warnings.length + hints.length === 0) return null;
  return (
    <div style={{ marginTop: "var(--space-3)" }}>
      {errors.map((e) => (
        <div className="v2msg v2msg--error" key={e.code} role="alert">
          <span className="v2msg__body">
            <span className="v2pp__code">{e.code}</span> {e.message}
          </span>
          {e.onFix ? (
            <span className="v2msg__actions">
              <button type="button" className="v2link" onClick={e.onFix}>
                {e.fixLabel ?? "Beheben"}
              </button>
            </span>
          ) : null}
        </div>
      ))}
      {warnings.map((w) => (
        <div className="v2msg v2msg--warning" key={w.code}>
          <span className="v2msg__body">
            <span className="v2pp__code">{w.code}</span> {w.message}
          </span>
          {w.onFix ? (
            <span className="v2msg__actions">
              <button type="button" className="v2link" onClick={w.onFix}>
                {w.fixLabel ?? "Beheben"}
              </button>
            </span>
          ) : null}
        </div>
      ))}
      {/* A hint prints no code and takes no fix: the code identifies a check
          someone looks up (error, warning), a hint is an aside. `code` stays
          in the type because it is the key. */}
      {hints.map((h) => (
        <div className="v2msg v2msg--hint" key={h.code}>
          <span className="v2msg__body">{h.message}</span>
        </div>
      ))}
    </div>
  );
}
