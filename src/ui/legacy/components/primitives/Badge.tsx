import type { ReactNode } from "react";
import { cn } from "@/ui/legacy/utils/cn";

export type BadgeKind = "info" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  kind?: BadgeKind;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/** Punkt-Farbe je Badge-Kind. Einzige Quelle — auch für Pills außerhalb
 *  von `Badge` (z.B. `.st`-Pills im Booking-Kontext, `BookingStatusBadge`).
 *  Keine Hex-Werte in Feature-Komponenten. */
export const KIND_DOT_COLOR: Record<BadgeKind, string> = {
  info: "#3B8FC4",
  success: "#3F7A5A",
  warning: "#8C601E",
  danger: "#A8403C",
  neutral: "#8A8A8A",
};

const KIND_BG: Record<BadgeKind, string> = {
  info: "bdg-info",
  success: "bdg-success",
  warning: "bdg-warning",
  danger: "bdg-danger",
  neutral: "bdg-neutral",
};

export function Badge({ kind = "neutral", dot = false, children, className }: BadgeProps) {
  return (
    <span className={cn("bdg", KIND_BG[kind], className)}>
      {dot ? <span className="dot" style={{ background: KIND_DOT_COLOR[kind] }} /> : null}
      {children}
    </span>
  );
}
