import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "./Link";

const meta: Meta<typeof Link> = { title: "v3/Primitives/Navigation/Link", component: Link };
export default meta;
type Story = StoryObj<typeof Link>;

const KINDS: { href: string; text: string; how: string; download?: boolean; target?: string }[] = [
  { href: "/clients/musterbau/2026/inbox", text: "Belegeingang", how: "Pfad in der App → next/link, die Seite wechselt ohne Neuladen" },
  { href: "?tab=open", text: "Nur offene", how: "Abfrage auf derselben Seite → next/link" },
  { href: "/clients/musterbau/2026/inbox", text: "Belegeingang im selben Tab", how: "target=_self → next/link", target: "_self" },
  { href: "/clients/musterbau/2026/inbox", text: "Belegeingang ohne Download", how: "download={false} → next/link", download: false },
  { href: "#beleg-4711", text: "Zum Beleg 4711", how: "Anker → <a>, der Browser springt" },
  { href: "//cdn.musterfirma.de/logo.svg", text: "Logo der Musterfirma", how: "//… ist eine andere Herkunft → <a>" },
  { href: "cases/1", text: "Sachverhalt 1 (relativ)", how: "relativer Pfad ohne Schrägstrich → <a>, lädt neu; Pfade absolut angeben" },
  { href: "https://www.datev.de", text: "DATEV", how: "andere Herkunft → <a>" },
  { href: "mailto:buchhaltung@musterfirma.de", text: "buchhaltung@musterfirma.de", how: "mailto → <a>" },
  { href: "tel:+4930123456", text: "030 123456", how: "tel → <a>" },
  { href: "/files/RE-2026-0815.pdf", text: "RE-2026-0815.pdf", how: "Download → <a>", download: true },
  { href: "/clients/musterbau/2026/inbox", text: "Belegeingang in neuem Tab", how: "target=_blank → <a>", target: "_blank" },
];

/** Which href goes through next/link and which stays a plain anchor. In Storybook the router is mocked: an app path does not navigate. */
export const Kinds: Story = {
  render: () => (
    <ul style={{ margin: 0, paddingLeft: "var(--space-4)", display: "grid", gap: "var(--space-2)" }}>
      {KINDS.map((k) => (
        <li key={k.how}>
          <Link
            className="v2link"
            href={k.href}
            {...(k.download !== undefined ? { download: k.download } : {})}
            {...(k.target ? { target: k.target, ...(k.target === "_blank" ? { rel: "noopener noreferrer" } : {}) } : {})}
          >
            {k.text}
          </Link>{" "}
          <span className="v2muted">— {k.how}</span>
        </li>
      ))}
    </ul>
  ),
};
