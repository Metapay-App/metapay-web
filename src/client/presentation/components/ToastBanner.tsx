"use client";

import React from "react";

export type ToastTone = "info" | "success" | "error";

export function ToastBanner({
  tone = "info",
  message,
  onDismiss,
}: {
  tone?: ToastTone;
  message: string | null;
  onDismiss?: () => void;
}) {
  if (!message) return null;

  const toneStyle =
    tone === "success"
      ? "border-harbor-glow/65 bg-harbor-blue/25"
      : tone === "error"
        ? "border-harbor-highlight/60 bg-harbor-surface/75"
        : "border-harbor-brand-blue/55 bg-harbor-brand-blue/20";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-control border px-4 py-3 text-[14px] text-harbor-white backdrop-blur-md ${toneStyle}`}
    >
      <p className="leading-snug">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-chip px-2 py-0.5 text-[12px] font-bold text-harbor-highlight hover:bg-harbor-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-blue"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
