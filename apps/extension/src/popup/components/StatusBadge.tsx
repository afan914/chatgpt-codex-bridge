import type { ReactNode } from "react";

type StatusBadgeProps = {
  status: "success" | "warning" | "error" | "neutral";
  children: ReactNode;
};

export function StatusBadge({ status, children }: StatusBadgeProps): JSX.Element {
  return <span className={`status-badge status-badge--${status}`}>{children}</span>;
}
