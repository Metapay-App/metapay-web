export const API_ROUTES = {
  RPC: "/api/v1/rpc",
  MERCHANTS: "/api/v1/merchants",
  MERCHANT_ME: "/api/v1/merchants/me",
  INVOICES: "/api/v1/invoices",
  INVOICE_DETAIL: (refId: string) => `/api/v1/invoices/${encodeURIComponent(refId)}`,
  INVOICE_CANCEL: (refId: string) =>
    `/api/v1/invoices/${encodeURIComponent(refId)}/cancel`,
  PAYMENTS_VERIFY: "/api/v1/payments/verify",
  PAYMENTS_HISTORY: "/api/v1/payments/history",
  IDENTITY: (address: string) => `/api/v1/identity/${encodeURIComponent(address)}`,
  DEMO_PREMIUM_DATA: "/api/v1/demo/premium-data",
  ADMIN_OVERVIEW: "/api/v1/admin/overview",
} as const;
