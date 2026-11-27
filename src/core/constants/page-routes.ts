import type { Locale } from "../translator/types";

export const PAGE_ROUTES = {
  HOME: (lang: Locale) => `/${lang}`,
  ABOUT: (lang: Locale) => `/${lang}/about`,
  CONTACT: (lang: Locale) => `/${lang}/contact`,
  PORTAL: (lang: Locale) => `/${lang}/portal`,
  PORTAL_INVOICES: (lang: Locale) => `/${lang}/portal/invoices`,
  PORTAL_HISTORY: (lang: Locale) => `/${lang}/portal/history`,
  PORTAL_PLAYGROUND: (lang: Locale) => `/${lang}/portal/playground`,
  PORTAL_SETTINGS: (lang: Locale) => `/${lang}/portal/settings`,
  PAY: (lang: Locale, refId: string) =>
    `/${lang}/pay/${encodeURIComponent(refId)}`,
  ADMIN: (lang: Locale) => `/${lang}/admin`,
  ADMIN_ROUTER: (lang: Locale) => `/${lang}/admin/router`,
  ADMIN_MERCHANTS: (lang: Locale) => `/${lang}/admin/merchants`,
  ADMIN_TRANSACTIONS: (lang: Locale) => `/${lang}/admin/transactions`,
} as const;
