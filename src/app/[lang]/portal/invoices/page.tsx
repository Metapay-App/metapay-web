import { PortalInvoicesView } from "@/client/presentation/views/portal";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedPortalInvoicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PortalInvoicesView lang={resolveLocale(lang)} />;
}
