"use client";

import React from "react";

export interface HarborButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function HarborButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: HarborButtonProps) {
  const sizeClass =
    size === "sm"
      ? "px-3 py-1.5 text-[12px]"
      : size === "lg"
        ? "px-6 py-3 text-[15px]"
        : "px-4 py-2.5 text-[14px]";

  const variantClass =
    variant === "primary"
      ? "harbor-btn-primary"
      : variant === "danger"
        ? "harbor-btn-glass border-harbor-highlight/45 bg-harbor-surface/70 hover:bg-harbor-black/80"
        : "harbor-btn-glass";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap ${sizeClass} ${variantClass} ${className}`}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-harbor-white border-t-transparent"
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
