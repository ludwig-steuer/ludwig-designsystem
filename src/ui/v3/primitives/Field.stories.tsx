import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "./ActionButton";
import { CopyTextButton } from "./CopyTextButton";
import { Disclosure } from "./Disclosure";
import { FieldList } from "./FieldList";
import { Checkbox, Field, Input, Select, Textarea } from "./Form";
import { Tabs } from "./Nav";
import { RawValue } from "./RawRecord";
import { Card, CardHead, CardSection } from "./Table";
import { TextButton } from "./TextButton";

const meta: Meta<typeof Field> = { title: "v3/Primitives/Formular/Field", component: Field };
export default meta;
type Story = StoryObj<typeof Field>;

/** Label über der Eingabe, Hinweis darunter — nie als Platzhaltertext. */
export const Filled: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <Field label="Beleg 1" hint="Die Belegnummer, wie sie in DATEV erscheint." htmlFor="b1">
        <Input id="b1" defaultValue="RE-3120" />
      </Field>
      <Field label="Buchungstext" htmlFor="t">
        <Input id="t" defaultValue="Bürobedarf 08/2026" />
      </Field>
      <Field label="Steuerschlüssel" htmlFor="bu">
        <Select id="bu" defaultValue="9">
          <option value="">ohne</option>
          <option value="9">9 · 19 % Vorsteuer</option>
          <option value="8">8 · 7 % Vorsteuer</option>
        </Select>
      </Field>
      <Field label="Notiz" hint="Optional. Steht am Sachverhalt, nicht im Buchungstext." htmlFor="n">
        <Textarea id="n" placeholder="Was bei der nächsten Periode zu beachten ist …" />
      </Field>
      <Checkbox label="Ich habe die Abweichung geprüft" defaultChecked />
    </div>
  ),
};

/** Fehler ersetzt den Hinweis und benennt die Bedingung, nicht nur „ungültig". */
export const WithError: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <Field label="Umsatz" error="Der Betrag muss größer als 0,00 € sein." htmlFor="u">
        <Input id="u" invalid defaultValue="0,00" />
      </Field>
      <Field label="Konto" error="4980 gibt es im SKR04 dieses Mandanten nicht." htmlFor="k">
        <Input id="k" invalid defaultValue="4980" />
      </Field>
    </div>
  ),
};

/** Leer und gesperrt — der Grund steht im Hinweis, nicht im Nichts. */
export const Disabled: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <Field label="Buchungstext" hint="Gesperrt, solange der Stapel in DATEV liegt." htmlFor="g">
        <Input id="g" disabled defaultValue="Bürobedarf 08/2026" />
      </Field>
    </div>
  ),
};

/* ── Secrets (0267) ─────────────────────────────────────────────────────
   A token goes into the surface in one direction only: typed or pasted,
   checked, stored — never shown again. The values below are invented. */

/** The five attributes every secret carries (0267): hidden, not remembered, not corrected, no name. */
const SECRET = {
  type: "password",
  autoComplete: "off",
  spellCheck: false,
  autoCapitalize: "off",
  autoCorrect: "off",
} as const;

const TOKEN_HINT = "Das Token erzeugt Ludwig unter „Administration › Beleg-Intake (Drittanbieter)“. Kopieren Sie es und fügen Sie es hier ein.";
const STORED_HINT = "Ein Token ist gespeichert. Ein neues ersetzt es beim Speichern.";

/** Four states of one secret: empty, stored, wrong format, locked. */
export const Secret: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: "calc(var(--space-20) * 5 + var(--space-5))" }}>
      <Field label="Token" hint={TOKEN_HINT} htmlFor="sec-empty">
        <Input id="sec-empty" {...SECRET} />
      </Field>
      <Field label="Neues Token" hint={STORED_HINT} htmlFor="sec-stored">
        <Input id="sec-stored" {...SECRET} />
      </Field>
      <Field
        label="Token"
        error={
          <>
            <strong>Token nicht erkannt.</strong> Ein Token beginnt mit „lag_“. Kopieren Sie es noch einmal
            vollständig aus Ludwig.
          </>
        }
        htmlFor="sec-error"
      >
        <Input id="sec-error" {...SECRET} invalid defaultValue="x7Qm2xZp9Lk4vT8nR2bW" />
      </Field>
      <Field label="Token" hint="Gesperrt, solange die Verbindung geprüft wird." htmlFor="sec-locked">
        <Input id="sec-locked" {...SECRET} disabled />
      </Field>
    </div>
  ),
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Round trip: no „lag_" → format error at the field, the input stays. Ending
 * in „-alt" → „Ludwig" declines after 600 ms, the reason beside the button,
 * announced. Anything else with „lag_" → stored: the field empties, word and
 * hint turn to the stored state. Spaces and line breaks around a pasted token
 * are trimmed before the check.
 */
export const SecretInUse: Story = {
  render: function Render() {
    const [value, setValue] = useState("");
    const [stored, setStored] = useState(false);
    const [formatError, setFormatError] = useState(false);
    const [checking, setChecking] = useState(false);
    return (
      <div style={{ maxWidth: "var(--container-narrow)" }}>
        <Card>
          <CardHead title="Token von Hand eintragen" />
          <CardSection>
            <div className="v2stack">
              <Field
                label={stored ? "Neues Token" : "Token"}
                hint={stored ? STORED_HINT : TOKEN_HINT}
                error={
                  formatError ? (
                    <>
                      <strong>Token nicht erkannt.</strong> Ein Token beginnt mit „lag_“. Kopieren Sie es noch
                      einmal vollständig aus Ludwig.
                    </>
                  ) : undefined
                }
                htmlFor="sec-use"
              >
                <Input
                  id="sec-use"
                  {...SECRET}
                  value={value}
                  invalid={formatError}
                  disabled={checking}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setFormatError(false);
                  }}
                />
              </Field>
              <div>
                <ActionButton
                  variant="primary"
                  pendingLabel="Wird geprüft …"
                  action={async () => {
                    const token = value.trim();
                    if (!token.startsWith("lag_")) {
                      setFormatError(true);
                      return;
                    }
                    setChecking(true);
                    try {
                      await wait(600);
                      if (token.endsWith("-alt")) {
                        return {
                          error:
                            "Ludwig kennt dieses Token nicht. Es ist abgelaufen oder widerrufen. Bitte lassen Sie in Ludwig ein neues erzeugen.",
                        };
                      }
                      setValue("");
                      setStored(true);
                    } finally {
                      setChecking(false);
                    }
                  }}
                >
                  Token speichern
                </ActionButton>
              </div>
            </div>
          </CardSection>
        </Card>
      </div>
    );
  },
};

/** Invented, never a real token; the surface shows only „lag_…" and the last four. */
const STORED_TOKEN = "lag_7Qm2xZp9Lk4vT8nR2bW6yH1c3f9a";
const HIDE_AFTER_MS = 30_000;

/**
 * The one place a stored token may be seen (owner 2026-11-27, 0267
 * addendum): Settings › Diagnose › „Verbindung, technisch". Hidden again
 * after 30 s, when the diagnosis folds, when the tab changes, when the
 * window goes into the background, and on „Ausblenden". If the focus was in
 * the revealed part it returns to „Token anzeigen"; the page announces it.
 */
export const SecretReveal: Story = {
  render: function Render() {
    const [tab, setTab] = useState("settings");
    const [shown, setShown] = useState(false);
    const [said, setSaid] = useState("");
    const area = useRef<HTMLDivElement>(null);
    const revealed = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLSpanElement>(null);
    const hideButton = useRef<HTMLSpanElement>(null);
    const refocus = useRef(false);
    const revealing = useRef(false);

    function hide() {
      if (!shown) return;
      refocus.current = Boolean(revealed.current?.contains(document.activeElement));
      setShown(false);
      setSaid("Token ausgeblendet");
    }

    // 30 s, the window going to the background, the diagnosis folding — one
    // run per reveal: the effect depends on `shown` only, not on every render.
    useEffect(() => {
      if (!shown) return;
      const timer = setTimeout(hide, HIDE_AFTER_MS);
      const onVisibility = () => {
        if (document.hidden) hide();
      };
      // `toggle` does not bubble; the capture phase still reaches it.
      const onToggle = (e: Event) => {
        if (e.target instanceof HTMLDetailsElement && !e.target.open) hide();
      };
      const box = area.current;
      document.addEventListener("visibilitychange", onVisibility);
      box?.addEventListener("toggle", onToggle, true);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", onVisibility);
        box?.removeEventListener("toggle", onToggle, true);
      };
      // `hide` reads `shown`, which is this effect's only dependency.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown]);

    // The button that revealed it is gone — the focus goes to „Ausblenden",
    // the way back, not to the page (0267 addendum).
    useEffect(() => {
      if (shown && revealing.current) {
        revealing.current = false;
        hideButton.current?.querySelector("button")?.focus();
      }
    }, [shown]);

    useEffect(() => {
      if (!shown && refocus.current) {
        refocus.current = false;
        // Folded away the button is not there to take the focus — then the
        // summary that folds it does, never the page.
        const button = trigger.current?.querySelector("button");
        if (button?.checkVisibility()) button.focus();
        else area.current?.querySelector<HTMLElement>("details > summary")?.focus();
      }
    }, [shown]);

    return (
      <div ref={area} style={{ maxWidth: "var(--container-narrow)" }}>
        <Tabs
          ariaLabel="Bereiche"
          items={[
            { key: "sync", label: "Abgleich" },
            { key: "settings", label: "Einstellungen" },
          ]}
          active={tab}
          onPick={(key) => {
            hide();
            setTab(key);
          }}
        />
        {tab === "settings" ? (
          <Card>
            <CardHead title="Einstellungen" />
            <CardSection>
              <Disclosure summary="Diagnose: Verbindung, Abgleich von Hand, Rohprotokoll" defaultOpen>
                <FieldList
                  title="Verbindung, technisch"
                  rows={[
                    ["Art", "über „Mit Ludwig verbinden“ erzeugt"],
                    ["Nutzer", "Anna Berger"],
                    ["Gerät", "Laptop Büro"],
                    ["Gültig bis", "26.11.2027"],
                    ["Umgebung", "Produktion"],
                    [
                      "Token",
                      shown ? (
                        <div ref={revealed} className="v2stack">
                          <RawValue value={STORED_TOKEN} />
                          <span style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap" }}>
                            <CopyTextButton text={STORED_TOKEN} label="Kopieren" />
                            <span ref={hideButton}>
                              <TextButton onClick={hide}>Ausblenden</TextButton>
                            </span>
                          </span>
                          <span className="lw-ui-hint">Wird nach 30 Sekunden wieder ausgeblendet.</span>
                        </div>
                      ) : (
                        <span style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline", flexWrap: "wrap" }}>
                          <RawValue value={`lag_…${STORED_TOKEN.slice(-4)}`} />
                          <span ref={trigger}>
                            <TextButton
                              onClick={() => {
                                setSaid("");
                                revealing.current = true;
                                setShown(true);
                              }}
                            >
                              Token anzeigen
                            </TextButton>
                          </span>
                        </span>
                      ),
                    ],
                  ]}
                />
              </Disclosure>
            </CardSection>
          </Card>
        ) : (
          <Card>
            <CardHead title="Abgleich" />
            <CardSection>
              <p className="lw-ui-hint" style={{ margin: 0 }}>
                Der Abgleich steht hier.
              </p>
            </CardSection>
          </Card>
        )}
        <span className="v2vh" role="status">
          {said}
        </span>
      </div>
    );
  },
};
