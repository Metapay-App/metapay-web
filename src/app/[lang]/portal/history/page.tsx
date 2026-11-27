import { PortalHistoryView } from "@/client/presentation/views/portal";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedPortalHistoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PortalHistoryView lang={resolveLocale(lang)} />;
}
