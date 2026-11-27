"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MetaPayLogoMark } from "./MetaPayLogoMark";
import { WalletStatusPill } from "./PublicNavbar";

export interface WorkspaceNavItem {
  href: string;
  label: string;
}

export function WorkspaceShell({
  lang,
  badgeLabel,
  badgeHighlight = false,
  switchWorkspaceHref,
  switchWorkspaceLabel,
  navItems,
  title,
  subtitle,
  children,
}: {
  lang: Locale;
  badgeLabel: string;
  badgeHighlight?: boolean;
  switchWorkspaceHref: string;
  switchWorkspaceLabel: string;
  navItems: WorkspaceNavItem[];
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const dict = getDictionary(lang);
  const pathname = usePathname();

  return (
    <div className="harbor-canvas min-h-screen">
      <header className="sticky top-0 z-40 border-b border-harbor-white/10 bg-harbor-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={PAGE_ROUTES.HOME(lang)}
              className="flex items-center gap-2 text-[15px] font-extrabold text-harbor-white"
            >
              <MetaPayLogoMark size="sm" />
              <span>{dict.common.appName}</span>
            </Link>
            <span
              className={`rounded-badge border px-2.5 py-0.5 text-[12px] font-bold text-harbor-white ${
                badgeHighlight
                  ? "border-harbor-glow/40 bg-harbor-blue/20"
                  : "border-harbor-highlight/40 bg-harbor-surface/75"
              }`}
            >
              {badgeLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={switchWorkspaceHref}
              className="rounded-control border border-harbor-white/15 px-3 py-1.5 text-[12px] font-semibold text-harbor-secondary hover:border-harbor-glow/50 hover:text-harbor-white"
            >
              {switchWorkspaceLabel}
            </Link>
            <LanguageSwitcher lang={lang} />
            <WalletStatusPill lang={lang} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="glass-panel h-fit rounded-card p-3">
          <nav className="flex flex-row gap-1.5 overflow-x-auto lg:flex-col">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-control px-3.5 py-2.5 text-[14px] font-semibold transition ${
                    active
                      ? "bg-harbor-blue text-harbor-white shadow-harbor-glow"
                      : "text-harbor-secondary hover:bg-harbor-surface/45 hover:text-harbor-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 hidden border-t border-harbor-white/10 pt-3 lg:block">
            <Link
              href={PAGE_ROUTES.HOME(lang)}
              className="block rounded-control px-3 py-2 text-[12px] font-semibold text-harbor-caption hover:text-harbor-white"
            >
              ← {dict.nav.home}
            </Link>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="glass-card-glow p-6">
            <h1 className="text-[25px] font-extrabold text-harbor-white">
              {title}
            </h1>
            <p className="mt-1 text-[14px] text-harbor-secondary">{subtitle}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
