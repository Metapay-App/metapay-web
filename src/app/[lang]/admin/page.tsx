import { AdminOverviewView } from "@/client/presentation/views/admin";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedAdminOverviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <AdminOverviewView lang={resolveLocale(lang)} />;
}
