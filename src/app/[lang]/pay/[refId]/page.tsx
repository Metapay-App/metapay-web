import { CheckoutView } from "@/client/presentation/views/checkout";
import { resolveLocale } from "@/core/translator";

export default async function LocalizedCheckoutPage({
  params,
}: {
  params: Promise<{ lang: string; refId: string }>;
}) {
  const { lang, refId } = await params;
  return <CheckoutView lang={resolveLocale(lang)} refId={decodeURIComponent(refId)} />;
}
