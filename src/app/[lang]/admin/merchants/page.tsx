import { AdminMerchantsView } from "@/client/presentation/views/admin";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedAdminMerchantsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminMerchantsView lang={resolveLocale(lang)} />;
}
