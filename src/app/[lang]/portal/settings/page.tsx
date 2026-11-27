import { PortalSettingsView } from "@/client/presentation/views/portal";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedPortalSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PortalSettingsView lang={resolveLocale(lang)} />;
}
