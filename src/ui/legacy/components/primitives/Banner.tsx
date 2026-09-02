import type { ReactNode } from "react";
import { cn } from "@/ui/legacy/utils/cn";

type BannerKind = "info" | "success" | "warning" | "danger" | "neutral";

interface Props {
  kind?: BannerKind;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Banner({ kind = "info", title, children, className }: Props) {
  return (
    <div className={cn("banner", `banner--${kind}`, className)} role={kind === "danger" || kind === "warning" ? "alert" : "status"}>
      <div className="banner__body">
        {title ? <span className="banner__title">{title} </span> : null}
        {children}
      </div>
    </div>
  );
}
