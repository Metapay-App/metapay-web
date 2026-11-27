import type { Metadata } from "next";
import { WalletProvider } from "@/client/presentation/components";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meta Pay — Cross-Token Payment Gateway",
  description:
    "Cross-token payment gateway and HTTP 402 middleware built on Meta Earth.",
  icons: {
    icon: [{ url: "/metapay-icon.svg", type: "image/svg+xml" }],
    shortcut: "/metapay-icon.svg",
    apple: "/metapay-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="harbor-canvas min-h-screen font-sans text-harbor-white antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
