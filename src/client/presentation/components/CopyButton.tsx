"use client";

import React, { useState } from "react";
import { getDictionary, type Locale } from "@/core/translator";

export function CopyButton({
  value,
  lang,
  className = "",
}: {
  value: string;
  lang: Locale;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const dict = getDictionary(lang);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback if clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-chip border border-harbor-white/15 bg-harbor-surface/45 px-2.5 py-1 text-[12px] font-semibold text-harbor-highlight transition hover:border-harbor-glow/60 hover:text-harbor-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-blue ${className}`}
    >
      {copied ? dict.common.copied : dict.common.copy}
    </button>
  );
}
