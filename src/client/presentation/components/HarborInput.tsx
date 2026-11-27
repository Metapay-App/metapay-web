"use client";

import React from "react";

export interface HarborInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function HarborInput({
  label,
  helperText,
  error,
  id,
  className = "",
  ...rest
}: HarborInputProps) {
  const inputId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[12px] font-semibold text-harbor-highlight"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`glass-input w-full px-3.5 py-2.5 ${className}`}
        {...rest}
      />
      {error ? (
        <p className="text-[12px] text-harbor-white">{error}</p>
      ) : helperText ? (
        <p className="text-[12px] text-harbor-caption">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface HarborSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
}

export function HarborSelect({
  label,
  helperText,
  id,
  className = "",
  children,
  ...rest
}: HarborSelectProps) {
  const selectId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-[12px] font-semibold text-harbor-highlight"
        >
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`glass-input w-full px-3.5 py-2.5 ${className}`}
        {...rest}
      >
        {children}
      </select>
      {helperText ? (
        <p className="text-[12px] text-harbor-caption">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface HarborTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export function HarborTextarea({
  label,
  helperText,
  id,
  className = "",
  ...rest
}: HarborTextareaProps) {
  const areaId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={areaId}
          className="text-[12px] font-semibold text-harbor-highlight"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        className={`glass-input w-full px-3.5 py-2.5 ${className}`}
        {...rest}
      />
      {helperText ? (
        <p className="text-[12px] text-harbor-caption">{helperText}</p>
      ) : null}
    </div>
  );
}
