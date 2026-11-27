import { AdminRouterView } from "@/client/presentation/views/admin";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedAdminRouterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminRouterView lang={resolveLocale(lang)} />;
}
