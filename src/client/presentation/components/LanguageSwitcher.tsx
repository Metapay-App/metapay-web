"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { SUPPORTED_LOCALES, type Locale } from "@/core/translator/types";

export function LanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSelect = (nextLocale: Locale) => {
    if (nextLocale === lang) return;
    const segments = pathname.split("/");
    if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1] as Locale)) {
      segments[1] = nextLocale;
      router.push(segments.join("/") || `/${nextLocale}`);
      return;
    }
    router.push(`/${nextLocale}`);
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-badge border border-harbor-white/15 bg-harbor-surface/40 p-1"
    >
      {SUPPORTED_LOCALES.map((loc) => {
        const active = loc === lang;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleSelect(loc)}
            className={`rounded-badge px-2.5 py-1 text-[12px] font-bold uppercase transition ${
              active
                ? "bg-harbor-blue text-harbor-white"
                : "text-harbor-secondary hover:text-harbor-white"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-blue`}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
