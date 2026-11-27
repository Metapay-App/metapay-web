"use client";

import React from "react";
import Link from "next/link";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import {
  GlassCard,
  HarborButton,
  HarborInput,
  HarborTextarea,
  PublicNavbar,
  ToastBanner,
} from "@/client/presentation/components";
import { PUBLIC_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { usePublic } from "./hooks/usePublic";

export function PublicContactView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactMessage,
    setContactMessage,
    contactSubmitted,
    handleSubmitContact,
  } = usePublic();

  return (
    <div className="harbor-canvas min-h-screen">
      <PublicNavbar lang={lang} />

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <GlassCard variant="glow" className="p-8">
          <h1 className="text-[31px] font-extrabold text-harbor-white">
            {dict.publicSite.contactTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-harbor-secondary">
            {dict.publicSite.contactSubtitle}
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassCard className="p-6">
            <form
              id={PUBLIC_SEMANTIC_IDS.CONTACT_FORM}
              onSubmit={handleSubmitContact}
              className="space-y-4"
            >
              {contactSubmitted ? (
                <ToastBanner
                  tone="success"
                  message={dict.publicSite.contactSuccess}
                />
              ) : null}

              <HarborInput
                label="Name / Organization"
                placeholder="e.g. Harbor Merchant Labs"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />

              <HarborInput
                label="Contact Email or Wallet (0x / me1)"
                placeholder="team@example.com or me1..."
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />

              <HarborTextarea
                label="Integration Notes"
                rows={4}
                placeholder="Describe your HTTP 402 endpoints, target tokens, or split rules..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
              />

              <HarborButton type="submit" size="lg">
                {dict.common.submit}
              </HarborButton>
            </form>
          </GlassCard>

          <GlassCard className="space-y-4 p-6">
            <h2 className="text-[18px] font-bold text-harbor-white">
              Self-Service Onboarding
            </h2>
            <p className="text-[14px] leading-relaxed text-harbor-secondary">
              You do not need manual approval to start testing Meta Pay. Connect
              your wallet inside the Merchant Portal to mint testnet tokens and
              generate an instant merchant API key.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link href={PAGE_ROUTES.PORTAL_SETTINGS(lang)}>
                <HarborButton variant="primary" className="w-full">
                  {dict.portal.merchantProfileTitle}
                </HarborButton>
              </Link>
              <Link href={PAGE_ROUTES.PORTAL_PLAYGROUND(lang)}>
                <HarborButton variant="glass" className="w-full">
                  {dict.publicSite.ctaPlayground}
                </HarborButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
