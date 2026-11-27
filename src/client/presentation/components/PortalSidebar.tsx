"use client";

import React from "react";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import { WorkspaceShell } from "./WorkspaceShell";

export function PortalShell({
  lang,
  title,
  subtitle,
  children,
}: {
  lang: Locale;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const dict = getDictionary(lang);
  return (
    <WorkspaceShell
      lang={lang}
      badgeLabel={dict.nav.portal}
      badgeHighlight
      switchWorkspaceHref={PAGE_ROUTES.ADMIN(lang)}
      switchWorkspaceLabel={dict.nav.admin}
      navItems={[
        { href: PAGE_ROUTES.PORTAL(lang), label: dict.nav.dashboard },
        { href: PAGE_ROUTES.PORTAL_INVOICES(lang), label: dict.nav.invoices },
        { href: PAGE_ROUTES.PORTAL_HISTORY(lang), label: dict.nav.history },
        { href: PAGE_ROUTES.PORTAL_PLAYGROUND(lang), label: dict.nav.playground },
        { href: PAGE_ROUTES.PORTAL_SETTINGS(lang), label: dict.nav.settings },
      ]}
      title={title}
      subtitle={subtitle}
    >
      {children}
    </WorkspaceShell>
  );
}
