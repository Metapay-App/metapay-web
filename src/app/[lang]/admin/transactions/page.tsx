import { AdminTransactionsView } from "@/client/presentation/views/admin";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedAdminTransactionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminTransactionsView lang={resolveLocale(lang)} />;
}
