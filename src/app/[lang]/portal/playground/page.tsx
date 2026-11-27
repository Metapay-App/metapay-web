import { PortalPlaygroundView } from "@/client/presentation/views/portal";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedPortalPlaygroundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PortalPlaygroundView lang={resolveLocale(lang)} />;
}
