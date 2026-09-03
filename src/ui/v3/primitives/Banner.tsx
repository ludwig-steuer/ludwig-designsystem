import type { ReactNode } from "react";

export type BannerTone = "info" | "success" | "warning" | "danger" | "neutral";

interface Props {
  tone?: BannerTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The page-wide notice above the content — one per screen, and it stays until
 * the cause is gone.
 *
 * `role` follows the tone: what needs acting on is an `alert`, everything
 * else a `status`, so a screenreader interrupts only where it should.
 *
 * @when    Page-wide, lasting message above the content (chart of accounts
 *          incomplete, period locked).
 * @instead A note in the flow → Callout. The state of one thing →
 *          StatusCallout. A fleeting receipt → Toast.
 */
export function Banner({ tone = "info", title, children, className }: Props) {
  return (
    <div
      className={["banner", `banner--${tone}`, className].filter(Boolean).join(" ")}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
    >
      <div className="banner__body">
        {title ? <span className="banner__title">{title} </span> : null}
        {children}
      </div>
    </div>
  );
}
