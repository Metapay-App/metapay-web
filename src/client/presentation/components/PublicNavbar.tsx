"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import { shortenAddress } from "@/core/utils/format";
import { HarborButton } from "./HarborButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MetaPayLogoMark } from "./MetaPayLogoMark";
import { useWallet } from "./WalletProvider";

export function WalletStatusPill({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    address,
    meAddress,
    isWrongNetwork,
    isConnecting,
    meIdentity,
    connect,
    disconnect,
    switchNetwork,
  } = useWallet();

  if (!address) {
    return (
      <HarborButton size="sm" onClick={() => void connect()} loading={isConnecting}>
        {isConnecting ? dict.common.connecting : dict.common.connectWallet}
      </HarborButton>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isWrongNetwork ? (
        <HarborButton
          size="sm"
          variant="danger"
          onClick={() => void switchNetwork()}
        >
          {dict.common.switchNetwork}
        </HarborButton>
      ) : null}
      <div className="flex items-center gap-2 rounded-badge border border-harbor-glow/45 bg-harbor-surface/45 px-3 py-1.5 text-[12px]">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-harbor-blue"
        />
        <span className="font-bold text-harbor-white">
          {shortenAddress(address)}
        </span>
        {meAddress ? (
          <span className="hidden text-harbor-caption sm:inline">
            {shortenAddress(meAddress, 5, 4)}
          </span>
        ) : null}
        {meIdentity?.hasMeId ? (
          <span className="rounded-chip bg-harbor-blue/35 px-1.5 py-0.5 text-[11px] font-bold text-harbor-white">
            ME ID
          </span>
        ) : null}
        <button
          type="button"
          onClick={disconnect}
          className="ml-1 text-[11px] font-semibold text-harbor-secondary hover:text-harbor-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-blue"
        >
          {dict.common.disconnect}
        </button>
      </div>
    </div>
  );
}

export function PublicNavbar({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const pathname = usePathname();

  const navItems = [
    { href: PAGE_ROUTES.HOME(lang), label: dict.nav.home },
    { href: PAGE_ROUTES.ABOUT(lang), label: dict.nav.about },
    { href: PAGE_ROUTES.CONTACT(lang), label: dict.nav.contact },
    { href: PAGE_ROUTES.PORTAL(lang), label: dict.nav.portal },
    { href: PAGE_ROUTES.ADMIN(lang), label: dict.nav.admin },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-harbor-white/10 bg-harbor-black/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href={PAGE_ROUTES.HOME(lang)}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-blue"
        >
          <MetaPayLogoMark size="md" />
          <div>
            <span className="block text-[17px] font-extrabold tracking-tight text-harbor-white">
              {dict.common.appName}
            </span>
            <span className="block text-[11px] text-harbor-caption">
              {dict.common.networkName}
            </span>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {navItems.map((item) => {
            const active =
              item.href === PAGE_ROUTES.HOME(lang)
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-control px-3 py-1.5 text-[14px] font-semibold transition ${
                  active
                    ? "bg-harbor-blue/25 text-harbor-white ring-1 ring-harbor-glow/50"
                    : "text-harbor-secondary hover:bg-harbor-surface/40 hover:text-harbor-white"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harbor-blue`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          <LanguageSwitcher lang={lang} />
          <WalletStatusPill lang={lang} />
        </div>
      </div>
    </header>
  );
}
