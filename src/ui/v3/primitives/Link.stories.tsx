import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "./Link";

const meta: Meta<typeof Link> = { title: "v3/Primitives/Navigation/Link", component: Link };
export default meta;
type Story = StoryObj<typeof Link>;

const KINDS: { href: string; text: string; how: string; download?: true; target?: string }[] = [
  { href: "/clients/musterbau/2026/inbox", text: "Belegeingang", how: "Pfad in der App → next/link, die Seite wechselt ohne Neuladen" },
  { href: "?tab=open", text: "Nur offene", how: "Abfrage auf derselben Seite → next/link" },
  { href: "#beleg-4711", text: "Zum Beleg 4711", how: "Anker → <a>, der Browser springt" },
  { href: "https://www.datev.de", text: "DATEV", how: "andere Herkunft → <a>" },
  { href: "mailto:buchhaltung@musterfirma.de", text: "buchhaltung@musterfirma.de", how: "mailto → <a>" },
  { href: "/files/RE-2026-0815.pdf", text: "RE-2026-0815.pdf", how: "Download → <a>", download: true },
  { href: "/clients/musterbau/2026/inbox", text: "Belegeingang in neuem Tab", how: "target=_blank → <a>", target: "_blank" },
];

/** Which href goes through next/link and which stays a plain anchor. In Storybook the router is mocked: an app path does not navigate. */
export const Kinds: Story = {
  render: () => (
    <ul style={{ margin: 0, paddingLeft: "var(--space-4)", display: "grid", gap: "var(--space-2)" }}>
      {KINDS.map((k) => (
        <li key={k.how}>
          <Link className="v2link" href={k.href} {...(k.download ? { download: true } : {})} {...(k.target ? { target: k.target, rel: "noopener noreferrer" } : {})}>
            {k.text}
          </Link>{" "}
          <span className="v2muted">— {k.how}</span>
        </li>
      ))}
    </ul>
  ),
};
