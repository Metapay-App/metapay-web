"use client";

import React from "react";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import { WorkspaceShell } from "./WorkspaceShell";

export function AdminShell({
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
      badgeLabel={dict.nav.admin}
      switchWorkspaceHref={PAGE_ROUTES.PORTAL(lang)}
      switchWorkspaceLabel={dict.nav.portal}
      navItems={[
        { href: PAGE_ROUTES.ADMIN(lang), label: dict.nav.adminOverview },
        { href: PAGE_ROUTES.ADMIN_ROUTER(lang), label: dict.nav.adminRouter },
        {
          href: PAGE_ROUTES.ADMIN_MERCHANTS(lang),
          label: dict.nav.adminMerchants,
        },
        {
          href: PAGE_ROUTES.ADMIN_TRANSACTIONS(lang),
          label: dict.nav.adminTransactions,
        },
      ]}
      title={title}
      subtitle={subtitle}
    >
      {children}
    </WorkspaceShell>
  );
}
