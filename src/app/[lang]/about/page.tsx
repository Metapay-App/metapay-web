import { PublicAboutView } from "@/client/presentation/views/public";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedAboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PublicAboutView lang={resolveLocale(lang)} />;
}
