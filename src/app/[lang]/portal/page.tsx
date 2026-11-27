import { PortalDashboardView } from "@/client/presentation/views/portal";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedPortalDashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PortalDashboardView lang={resolveLocale(lang)} />;
}
