import { PublicContactView } from "@/client/presentation/views/public";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <PublicContactView lang={resolveLocale(lang)} />;
}
