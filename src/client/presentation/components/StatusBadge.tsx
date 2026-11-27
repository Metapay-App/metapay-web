import React from "react";
import type { InvoiceStatus } from "@/client/domain/invoice/entity/invoice_entity";

export type BadgeTone =
  | InvoiceStatus
  | "FIXED"
  | "NO_LIMIT"
  | "HTTP_402"
  | "DASHBOARD"
  | "API"
  | "402"
  | "200";

const BADGE_CLASSES: Record<BadgeTone, string> = {
  PAID: "border-harbor-glow/60 bg-harbor-blue/25 text-harbor-white",
  "200": "border-harbor-glow/60 bg-harbor-blue/25 text-harbor-white",
  PENDING: "border-harbor-highlight/35 bg-harbor-surface/55 text-harbor-highlight",
  "402": "border-harbor-brand-blue/65 bg-harbor-brand-blue/30 text-harbor-white",
  HTTP_402: "border-harbor-brand-blue/65 bg-harbor-brand-blue/30 text-harbor-white",
  FIXED: "border-harbor-white/20 bg-harbor-surface/40 text-harbor-secondary",
  NO_LIMIT: "border-harbor-glow/40 bg-harbor-brand-blue/20 text-harbor-highlight",
  DASHBOARD: "border-harbor-white/15 bg-harbor-surface/35 text-harbor-secondary",
  API: "border-harbor-glow/40 bg-harbor-blue/20 text-harbor-highlight",
  EXPIRED: "border-harbor-muted/50 bg-harbor-black/60 text-harbor-caption",
  CANCELLED: "border-harbor-muted/50 bg-harbor-black/60 text-harbor-caption line-through",
};

export function StatusBadge({
  tone,
  label,
}: {
  tone: BadgeTone;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-badge border px-2.5 py-0.5 text-[12px] font-bold tracking-wide ${BADGE_CLASSES[tone]}`}
    >
      {label ?? tone}
    </span>
  );
}
