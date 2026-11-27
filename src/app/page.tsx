import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/core/translator";

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
