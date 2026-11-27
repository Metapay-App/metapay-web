import { PublicHomeView } from "@/client/presentation/views/public";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PublicHomeView lang={resolveLocale(lang)} />;
}
