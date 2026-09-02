"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
 */

export interface KontoKandidat {
  /** Die Kontonummer. In Ludwig immer identisch zur DATEV-Nummer. */
  number: string;
  name: string;
  /** Warum dieses Konto vorgeschlagen wird — eine Zeile, keine Punktzahl. */
  reason?: string;
}

export type KontoGruppe = "agent" | "partner" | "aehnlich" | "belegposition" | "alle";

export const KONTO_GRUPPEN_LABEL: Record<KontoGruppe, string> = {
  agent: "Vorschlag des Agenten",
  partner: "Zuletzt bei dieser Gegenpartei",
  aehnlich: "Ähnliche Belege",
  belegposition: "Aus der Beleg-Position",
  alle: "Alle Konten",
};

const REIHENFOLGE: KontoGruppe[] = ["agent", "partner", "aehnlich", "belegposition", "alle"];

/**
 * @wann  Konto wählen, mit Kandidaten aus Agent, Partner, Ähnlich und Belegposition.
 * @nicht Feste kurze Liste → Select.
 */
export function KontoFeld({
  value,
  onChange,
  candidates,
  onSearch,
  placeholder = "Nummer oder Name",
  invalid,
  ariaLabel = "Konto",
}: {
  value: string;
  onChange: (number: string) => void;
  /** Kandidaten je Gruppe. Leere Gruppen werden nicht gezeigt. */
  candidates: Partial<Record<KontoGruppe, KontoKandidat[]>>;
  /**
   * Volltextsuche über den Kontenrahmen. Ohne Loader filtert das Feld nur die
   * mitgegebenen Kandidaten — kein stiller Fallback auf „nichts gefunden".
   */
  onSearch?: (query: string) => Promise<KontoKandidat[]>;
  placeholder?: string;
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [treffer, setTreffer] = useState<KontoKandidat[] | null>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

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
    const passt = (k: KontoKandidat) =>
      q.length === 0 || k.number.toLowerCase().includes(q) || k.name.toLowerCase().includes(q);
    const aus = REIHENFOLGE.map((g) => ({
      key: g,
      label: KONTO_GRUPPEN_LABEL[g],
      items: (candidates[g] ?? []).filter(passt),
    })).filter((g) => g.items.length > 0);
    if (treffer && treffer.length > 0) {
      aus.push({ key: "alle" as KontoGruppe, label: KONTO_GRUPPEN_LABEL.alle, items: treffer });
    }
    return aus;
  }, [candidates, query, treffer]);

  function waehle(k: KontoKandidat) {
    onChange(k.number);
    setQuery(k.number);
    setOpen(false);
  }

  return (
    <div ref={box} className="v2kf">
      <input
        className={`v2in${invalid ? " v2in--invalid" : ""}`}
        value={query}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        role="combobox"
        aria-controls="v2kf-liste"
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onBlur={() => onChange(query.trim())}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && open && gruppen[0]?.items[0]) {
            e.preventDefault();
            waehle(gruppen[0].items[0]);
          }
        }}
      />
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
