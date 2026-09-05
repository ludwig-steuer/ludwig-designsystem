"use client";

import { ActionIcon } from "../../Icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconButton } from "../../primitives/IconButton";

/**
 * Kontenauswahl mit Kandidaten (F123 T123.1).
 *
 * Die Gruppen sind die Antwort auf „warum steht dieses Konto hier oben?":
 * **Agent** hat es vorgeschlagen, **Partner** hat es zuletzt bekommen,
 * **Ähnlich** kommt aus vergleichbaren Belegen, **Beleg-Position** steht auf
 * dem Papier, **Alle** ist der Rest des Kontenrahmens. Ohne die Gruppe wäre
 * die Reihenfolge eine Behauptung.
 *
 * Kennt kein Fachmodul: Kandidaten und Suche kommen als Props herein
 * (Loader als Prop). Die Volltextsuche greift über Nummer **und** Name —
 * Sachbearbeiterinnen tippen beides.
 *
 * Ruhend zeigt es Nummer **und** Name (0013): der Wert ist die Nummer, die
 * Wahl prüft man am Namen. Wer das Kontenblatt anbietet, gibt `onOpenLedger`
 * mit — den Drawer öffnet der Aufrufer, das Feld meldet nur den Wunsch.
 */

export interface AccountCandidate {
  /** Die Kontonummer. In Ludwig immer identisch zur DATEV-Nummer. */
  number: string;
  name: string;
  /** Warum dieses Konto vorgeschlagen wird — eine Zeile, keine Punktzahl. */
  reason?: string;
}

export type AccountGroup = "agent" | "partner" | "aehnlich" | "belegposition" | "alle";

export const ACCOUNT_GROUP_LABEL: Record<AccountGroup, string> = {
  agent: "Vorschlag des Agenten",
  partner: "Zuletzt bei dieser Gegenpartei",
  aehnlich: "Ähnliche Belege",
  belegposition: "Aus der Beleg-Position",
  alle: "Alle Konten",
};

const REIHENFOLGE: AccountGroup[] = ["agent", "partner", "aehnlich", "belegposition", "alle"];

/**
 * @when    Choosing an account, with candidates from agent, partner, similar and document line — and, with `onOpenLedger`, the way to its account sheet.
 * @instead Short fixed list → Select.
 */
export function AccountField({
  value,
  valueName,
  onChange,
  candidates,
  onSearch,
  onOpenLedger,
  placeholder = "Nummer oder Name",
  invalid,
  ariaLabel = "Konto",
}: {
  value: string;
  /**
   * Name of the selected account for the first render, when the value comes
   * from outside (an editor loading a booking). After that the field knows it
   * from the selection itself — a later change of this prop is ignored, so
   * remount the field (`key`) when the caller switches to another record.
   */
  valueName?: string;
  /**
   * The second argument carries the chosen candidate, so nobody has to look
   * the name up again. On free input (no candidate hit) it stays `undefined`.
   */
  onChange: (number: string, account?: AccountCandidate) => void;
  /** Kandidaten je Gruppe. Leere Gruppen werden nicht gezeigt. */
  candidates: Partial<Record<AccountGroup, AccountCandidate[]>>;
  /**
   * Volltextsuche über den Kontenrahmen. Ohne Loader filtert das Feld nur die
   * mitgegebenen Kandidaten — kein stiller Fallback auf „nichts gefunden".
   */
  onSearch?: (query: string) => Promise<AccountCandidate[]>;
  /**
   * Way to the account sheet. Given → the icon appears at the edge of the
   * field; left out → no icon and no empty slot.
   */
  onOpenLedger?: (accountNumber: string) => void;
  placeholder?: string;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [treffer, setTreffer] = useState<AccountCandidate[] | null>(null);
  // Die eigene Wahl trägt den Namen; `valueName` füllt sie für den ersten
  // Render, damit niemand die Liste öffnen muss, um zu sehen, was drinsteht.
  const [chosen, setChosen] = useState<AccountCandidate | null>(
    value && valueName ? { number: value, name: valueName } : null,
  );
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
    // Ein Wert von außen oder frei getippt gehört nicht mehr zur alten Wahl.
    setChosen((c) => (c && c.number === value ? c : null));
  }, [value]);

  useEffect(() => {
    if (!onSearch || query.trim().length < 2) {
      setTreffer(null);
      return;
    }
    let abgebrochen = false;
    const t = setTimeout(() => {
      void onSearch(query.trim()).then((r) => {
        if (!abgebrochen) setTreffer(r);
      });
    }, 180);
    return () => {
      abgebrochen = true;
      clearTimeout(t);
    };
  }, [query, onSearch]);

  useEffect(() => {
    const außerhalb = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", außerhalb);
    return () => document.removeEventListener("mousedown", außerhalb);
  }, []);

  const gruppen = useMemo(() => {
    const q = query.trim().toLowerCase();
    const passt = (k: AccountCandidate) =>
      q.length === 0 || k.number.toLowerCase().includes(q) || k.name.toLowerCase().includes(q);
    const aus = REIHENFOLGE.map((g) => ({
      key: g,
      label: ACCOUNT_GROUP_LABEL[g],
      items: (candidates[g] ?? []).filter(passt),
    })).filter((g) => g.items.length > 0);
    if (treffer && treffer.length > 0) {
      aus.push({ key: "alle" as AccountGroup, label: ACCOUNT_GROUP_LABEL.alle, items: treffer });
    }
    return aus;
  }, [candidates, query, treffer]);

  // Der Name kommt aus der Wahl oder aus den mitgegebenen Kandidaten. Ist er
  // nirgends zu haben, steht die Nummer allein — nachgeschlagen wird nichts,
  // das wäre eine Ladung (0013).
  const name = useMemo(() => {
    if (!value) return undefined;
    if (chosen?.number === value) return chosen.name;
    for (const liste of Object.values(candidates)) {
      const treffer = liste?.find((k) => k.number === value);
      if (treffer) return treffer.name;
    }
    return undefined;
  }, [value, chosen, candidates]);

  // Ruhend: Nummer und Name. In Arbeit: der reine Suchtext, damit Tippen nicht
  // gegen einen zusammengesetzten String läuft.
  const ruhend = !focused && Boolean(value) && Boolean(name);

  function waehle(k: AccountCandidate) {
    setChosen(k);
    onChange(k.number, k);
    setQuery(k.number);
    setOpen(false);
  }

  return (
    <div ref={box} className="v2kf">
      <div className="v2kf__box">
        <input
          className={`v2in v2kf__in${ruhend ? " v2kf__in--ruhend" : ""}${
            onOpenLedger ? " v2kf__in--ledger" : ""
          }${invalid ? " v2in--invalid" : ""}`}
          value={query}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          role="combobox"
          aria-controls="v2kf-liste"
          autoComplete="off"
          placeholder={placeholder}
          onFocus={(e) => {
            setFocused(true);
            setOpen(true);
            // Die Nummer steht markiert da, Tippen ersetzt sie.
            e.target.select();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            onChange(query.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && open && gruppen[0]?.items[0]) {
              e.preventDefault();
              waehle(gruppen[0].items[0]);
            }
          }}
        />
        {ruhend ? (
          <span className="v2kf__shown" aria-hidden="true">
            <span className="v2kf__num">{value}</span>
            <span className="v2kf__nm">{name}</span>
          </span>
        ) : null}
        {onOpenLedger ? (
          <span className="v2kf__ledger">
            <IconButton
              size="sm"
              label={value ? `Kontenblatt zu ${value}` : "Kontenblatt"}
              icon={<ActionIcon action="ledger" size={14} />}
              disabled={!value}
              // Ohne das wandert der Fokus aus dem Feld — die Liste bliebe
              // offen, aber der Wert wäre gemeldet, als hätte man es verlassen.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onOpenLedger(value)}
            />
          </span>
        ) : null}
      </div>
      {open ? (
        <div className="v2kf__pop" id="v2kf-liste" role="listbox">
          {gruppen.length === 0 ? (
            <div className="v2kf__empty">
              Kein Konto zu „{query}" — weder unter den Vorschlägen noch im Kontenrahmen.
            </div>
          ) : (
            gruppen.map((g) => (
              <div key={g.key}>
                <div className="v2kf__grp">{g.label}</div>
                {g.items.map((k) => (
                  <button
                    key={`${g.key}-${k.number}`}
                    type="button"
                    role="option"
                    aria-selected={k.number === value}
                    className={`v2kf__opt${k.number === value ? " is-active" : ""}`}
                    onClick={() => waehle(k)}
                  >
                    <span className="v2kf__num">{k.number}</span>
                    <span className="v2kf__name">{k.name}</span>
                    {k.reason ? <span className="v2kf__why">{k.reason}</span> : null}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
