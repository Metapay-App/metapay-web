"use client";

import React, { useEffect } from "react";
import { HarborButton } from "./HarborButton";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  onConfirm,
  onClose,
  children,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="harbor-confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-harbor-black/80 p-4 backdrop-blur-md"
    >
      <div className="glass-card-glow w-full max-w-md rounded-modal p-6">
        <h3
          id="harbor-confirm-modal-title"
          className="text-[21px] font-bold text-harbor-white"
        >
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-harbor-secondary">
          {description}
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex items-center justify-end gap-3">
          <HarborButton variant="glass" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </HarborButton>
          <HarborButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </HarborButton>
        </div>
      </div>
    </div>
  );
}
