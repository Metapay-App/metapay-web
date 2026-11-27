import React from "react";
import Image from "next/image";

export function MetaPayLogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const boxClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const width = size === "sm" ? 24 : 28;
  const height = size === "sm" ? 18 : 21;

  return (
    <span
      className={`flex ${boxClass} items-center justify-center rounded-control border border-harbor-glow/60 bg-harbor-white shadow-harbor-glow`}
    >
      <Image
        src="/metapay-icon.svg"
        alt="Meta Pay"
        width={width}
        height={height}
        priority
      />
    </span>
  );
}
