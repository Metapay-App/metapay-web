import React from "react";

export interface GlassCardProps {
  children: React.ReactNode;
  variant?: "default" | "glow" | "panel";
  className?: string;
}

export function GlassCard({
  children,
  variant = "default",
  className = "",
}: GlassCardProps) {
  const variantClass =
    variant === "glow"
      ? "glass-card-glow"
      : variant === "panel"
        ? "glass-panel rounded-card"
        : "glass-card";

  return <div className={`${variantClass} ${className}`}>{children}</div>;
}
