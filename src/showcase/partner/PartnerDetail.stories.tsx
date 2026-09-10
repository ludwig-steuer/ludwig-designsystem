import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BusinessPartnerFacts } from "@/ui/v3/entities/business-partner/BusinessPartnerFacts";
import { Button } from "@/ui/v3/primitives/Button";
import { MonoCell } from "@/ui/v3/primitives/Cells";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { RawRecord } from "@/ui/v3/primitives/RawRecord";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead, Table, Row, HeadRow } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { PartnerSeite } from "./PartnerSeite";
import { accountHref, KONTEN, partnerFixture, vorgaengeHref } from "./fixtures";

/**
 * Der Geschäftspartner — die Seite hinter dem Fuß-Knopf des Drawers (0127).
 *
 * Sie ist der **vierte Fall des Detailseiten-Standards** und der erste
 * Aufrufer des gemeinsamen Rahmens `DetailView` (0138 Weg 1). Alle Daten sind
 * erfunden; die Zahlen, die den Schnitt begründen, stehen im Seitenprofil
 * `docs/seiten/partner-detail.md`.
 */
const meta: Meta<typeof PartnerSeite> = {
  title: "Seiten/Geschäftspartner/Detail",
  component: PartnerSeite,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof PartnerSeite>;

/**
 * Die Personenkonten je Wirtschaftsjahr — **in der Übersicht**, nicht in
 * einem eigenen Reiter. Rang 2 der Seite, und p90 sind zwei Zeilen: ein
 * Reiter dafür wäre ein Klick auf die wichtigste Antwort.
 */
function Konten() {
  return (
    <Card>
      <CardHead title="Personenkonten" sub="je Wirtschaftsjahr" />
      <Table cols="90px 120px minmax(0, 1fr) 120px">
        <HeadRow>
          <th scope="col">Jahr</th>
          <th scope="col">Konto</th>
          <th scope="col">Rolle</th>
          <th scope="col" className="v2num">Buchungen</th>
        </HeadRow>
        {KONTEN.map((k) => (
          <Row key={k.jahr}>
            <span>{k.jahr}</span>
            <a className="v2link" href={accountHref(k.nummer)}>
              <MonoCell value={k.nummer} />
            </a>
            <span>{k.rolle}</span>
            <span className="v2num">{k.buchungen}</span>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

/**
 * Zone 4: **drei Zähler statt drei Reiter.** Die Zahl ist die Antwort auf
 * „was läuft gerade mit ihm?", und der Weg führt in die Liste der jeweiligen
 * Entität, auf diesen Partner gefiltert — dort steht sie mit Sortierung,
 * Filter und Pager, hier stünde sie ohne.
 */
function Vorgaenge({
  faelle = 0,
  belege = 0,
  buchungen = 0,
}: {
  faelle?: number;
  belege?: number;
  buchungen?: number;
}) {
  const zeile = (n: number, wort: string, href: string) =>
    [
      wort,
      n === 0 ? (
        // Null ist eine Auskunft, kein Weg: ein Link auf eine leere Liste
        // führt ins Nichts.
        <span className="v2muted" key={wort}>
          keine
        </span>
      ) : (
        <TextButton href={href} key={wort}>
          {n} ansehen
        </TextButton>
      ),
    ] as [string, React.ReactNode];

  return (
    <Card>
      <CardHead title="Vorgänge" sub="was an diesem Partner hängt" />
      <div style={{ padding: "12px 20px 16px" }}>
        <FieldList
          tone="bare"
          rows={[
            zeile(faelle, "Sachverhalte", vorgaengeHref.faelle),
            zeile(belege, "Belege", vorgaengeHref.belege),
            zeile(buchungen, "Buchungssätze", vorgaengeHref.buchungen),
          ]}
        />
      </div>
    </Card>
  );
}

function Uebersicht({
  partner,
  faelle,
  belege,
  buchungen,
}: {
  partner: ReturnType<typeof partnerFixture>;
  faelle?: number;
  belege?: number;
  buchungen?: number;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <CardHead title="Geschäftspartner" sub="wer das ist und was er üblicherweise liefert" />
        <div style={{ padding: "12px 20px 16px" }}>
          {/* **Ohne `all`** — gemessen am 2026-09-10: mit `all` ist die Karte
              1.160 px hoch, und „Personenkonten" beginnt bei y = 1.190. Die
              Übersicht ist die Kurzfassung (Ränge 1–7), die ganze Liste steht
              im Reiter „Details"; sonst beantwortet die Seite dieselbe Frage
              zweimal und schiebt Zone 4 unter die Falz. */}
          <BusinessPartnerFacts partner={partner} accountHref={accountHref} />
        </div>
      </Card>
      <Konten />
      <Vorgaenge faelle={faelle} belege={belege} buchungen={buchungen} />
    </div>
  );
}

/**
 * **Der Normalfall: ein bestätigter Kreditor mit Buchungen.**
 *
 * Rang 1 bis 4 stehen ohne Scrollen — Name, Kontonummer, Reifegrad im Kopf,
 * Buchungen in den Fakten. Kein Signal: an einem bestätigten Partner ist
 * nichts zu tun, und ein Banner „alles in Ordnung" wäre eine Zeile, die
 * niemand braucht.
 *
 * Die Seite **schreibt nicht** (D1). Das ist hier kein Verzicht, sondern der
 * Bestand: es gibt in der App keinen Schreibpfad auf die Stammdaten —
 * `updateBusinessPartner` existiert nicht, das Agenten-Tool ist mit F127
 * gestrichen.
 */
export const Normalfall: Story = {
  render: () => {
    const partner = partnerFixture();
    return (
      <PartnerSeite partner={partner}>
        <Uebersicht partner={partner} faelle={4} belege={3} buchungen={12} />
      </PartnerSeite>
    );
  },
};

/**
 * **Die Karteileiche — und sie ist der Regelfall.** 77 % der Partner haben
 * **null** Buchungen; von 14.950 tragen nur 197 überhaupt einen Beleg, einen
 * Sachverhalt oder einen Buchungssatz.
 *
 * Die Seite sagt das in drei Zeilen „keine" statt in drei leeren Reitern —
 * und die Fakten bleiben schmal, weil bei einem unbenutzten Partner auch
 * USt-Profil und typische Lieferung leer sind (11 % bzw. 14 % im Gesamtbestand,
 * gegenüber 75 % und 79 % bei den benutzten).
 */
export const OhneBewegung: Story = {
  render: () => {
    const partner = partnerFixture({
      legalName: "Testhandel Nord OHG",
      shortName: null,
      usageBookingCount: 0,
      lastBookingDate: null,
      vatProfile: "unknown",
      typicalNature: "unknown",
      businessDescription: null,
      ustIds: [],
      city: null,
      postalCode: null,
      addressLine1: null,
    });
    return (
      <PartnerSeite partner={partner} position={4711}>
        <Uebersicht partner={partner} />
      </PartnerSeite>
    );
  },
};

/**
 * **Vorgeschlagen — die einzige Handlung der Seite.** 36 Partner stehen auf
 * `proposed`, 2 auf `draft`; der Weg `proposed → confirmed` ist einbahnig.
 *
 * Er steht als **ein** Knopf im Signal-Slot und dann nicht zusätzlich im Kopf
 * (D8, Ausnahme für den nächsten Schritt aus dem Zustand).
 */
export const Vorgeschlagen: Story = {
  render: () => {
    const partner = partnerFixture({
      legalName: "Musterfirma Logistik GmbH",
      onboardingState: "proposed",
      usageBookingCount: 0,
      lastBookingDate: null,
      creditorAccount: { accountNumber: "89012", isInternal: true },
      source: "manual",
    });
    return (
      <PartnerSeite
        partner={partner}
        signal={
          <StatusCallout
            tone="neutral"
            kicker="Vorgeschlagen"
            title="Dieser Partner ist vorgeschlagen, nicht bestätigt."
            sub="Ludwig hat ihn aus einer Rechnung abgeleitet und ihm die interne Nummer 89012 gegeben. Mit der Bestätigung bekommt er seine DATEV-Nummer und taucht in der Auswahl auf."
            actions={<Button variant="primary" size="sm">Bestätigen</Button>}
          />
        }
      >
        <Uebersicht partner={partner} belege={2} />
      </PartnerSeite>
    );
  },
};

/**
 * **Der Abrechner.** Zwölf im Bestand (0,08 %) — und **alle zwölf** tragen
 * weder Kreditor- noch Debitornummer: ihr Kreditor *ist* das Auslagenkonto.
 *
 * Ohne die Verrechnungszeile stünde im Kopf an der Stelle, an der bei allen
 * anderen die Nummer steht, **nichts**. Das ist Zweifel 2 des Seitenprofils,
 * und hier ist er behoben.
 */
export const Abrechner: Story = {
  render: () => {
    const partner = partnerFixture({
      legalName: "Musterfirma Reisekosten-Abrechnung",
      shortName: null,
      creditorAccount: null,
      debtorAccount: null,
      clearingAccounts: [
        { accountNumber: "1370", isInternal: false },
        { accountNumber: "1371", isInternal: false },
      ],
      typicalNature: "expense",
      businessDescription: "Sammelkonto für Auslagen der Mitarbeitenden",
      usageBookingCount: 38,
      lastBookingDate: "2026-08-30",
    });
    return (
      <PartnerSeite partner={partner}>
        <Uebersicht partner={partner} buchungen={38} />
      </PartnerSeite>
    );
  },
};

/**
 * **Zwei gleichnamige Partner — der Fall, an dem die Seite scheitern kann.**
 * Beim größten Mandanten teilen sich 149 Zeilen einen `legalName`. Weder
 * Kurzname (143 Kollisionen) noch Ort (löst 35 %) entscheiden ihn; die
 * **Kontonummer** tut es — 6.288 verschiedene Debitornummern unter 6.396
 * Geschwistern.
 *
 * Deshalb steht sie im Kopf, direkt hinter der Rolle, und nicht erst in den
 * Fakten.
 */
export const Namensdublette: Story = {
  render: () => {
    const a = partnerFixture({ city: "Musterstadt", creditorAccount: { accountNumber: "70044", isInternal: false } });
    const b = partnerFixture({
      businessPartnerId: "bp-4712",
      city: "Musterstadt",
      creditorAccount: { accountNumber: "70091", isInternal: false },
      usageBookingCount: 6,
      lastBookingDate: "2026-03-12",
      businessDescription: "Baustoffhandel, zweite Niederlassung",
    });
    return (
      <div style={{ display: "grid", gap: 40 }}>
        <PartnerSeite partner={a} position={12}>
          <Uebersicht partner={a} faelle={4} belege={3} buchungen={12} />
        </PartnerSeite>
        <PartnerSeite partner={b} position={13}>
          <Uebersicht partner={b} buchungen={6} />
        </PartnerSeite>
      </div>
    );
  },
};

/**
 * **Die zwei anderen Reiter.** „Details" trägt alle 16 Ränge, „Rohdaten" den
 * Satz, wie er in der Tabelle steht.
 *
 * „Rohdaten" **ersetzt den heutigen Reiter „Technik"** (D12): eine Detailseite
 * hat genau eine Technik-Sicht, sie steht immer zuletzt und heißt überall
 * gleich.
 */
export const Reiter: Story = {
  render: () => {
    const partner = partnerFixture();
    return (
      <div style={{ display: "grid", gap: 40 }}>
        <PartnerSeite partner={partner} tab="details">
          <Card>
            <CardHead title="Details" sub="alle Felder des Partners" />
            <div style={{ padding: "12px 20px 16px" }}>
              <BusinessPartnerFacts partner={partner} all accountHref={accountHref} />
            </div>
          </Card>
        </PartnerSeite>

        <PartnerSeite partner={partner} tab="rohdaten">
          <Card>
            <CardHead title="Rohdaten" sub="der Satz, wie er in der Tabelle steht" />
            <div style={{ padding: "12px 20px 16px" }}>
              <RawRecord record={partner as unknown as Record<string, unknown>} />
            </div>
          </Card>
        </PartnerSeite>
      </div>
    );
  },
};
