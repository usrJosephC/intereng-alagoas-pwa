import type { ReactNode } from "react";

export function FeedbackMessage({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "success" | "error" | "loading";
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={`rounded-sm border px-3 py-2 text-sm ${
        tone === "success"
          ? "border-success/40 bg-success/10 text-success"
          : tone === "error"
            ? "border-danger/40 bg-danger/10 text-danger"
            : "border-border bg-surface-elevated text-muted"
      }`}
    >
      {children}
    </p>
  );
}
