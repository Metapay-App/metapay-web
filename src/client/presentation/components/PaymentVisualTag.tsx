"use client";

import React, { useMemo } from "react";

export function PaymentVisualTag({
  value,
  size = 148,
}: {
  value: string;
  size?: number;
}) {
  const grid = useMemo(() => {
    const dim = 15;
    const cells: boolean[][] = Array.from({ length: dim }, () =>
      Array.from({ length: dim }, () => false)
    );

    const drawFinder = (top: number, left: number) => {
      for (let r = 0; r < 5; r += 1) {
        for (let c = 0; c < 5; c += 1) {
          const border = r === 0 || r === 4 || c === 0 || c === 4;
          const center = r === 2 && c === 2;
          cells[top + r][left + c] = border || center;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, dim - 5);
    drawFinder(dim - 5, 0);

    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < dim; r += 1) {
      for (let c = 0; c < dim; c += 1) {
        const inFinder =
          (r < 5 && c < 5) ||
          (r < 5 && c >= dim - 5) ||
          (r >= dim - 5 && c < 5);
        if (inFinder) continue;
        const bit = ((hash >>> ((r * dim + c) % 31)) ^ (r * 7 + c * 13)) & 1;
        cells[r][c] = bit === 1;
      }
    }
    return cells;
  }, [value]);

  return (
    <div
      className="inline-flex flex-col items-center rounded-card border border-harbor-glow/40 bg-harbor-white p-3"
      style={{ width: size + 24 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 15 15"
        role="img"
        aria-label={`Invoice verification matrix for ${value}`}
      >
        <rect width="15" height="15" fill="#FFFFFF" />
        {grid.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="0.92"
                height="0.92"
                rx="0.16"
                fill="#000000"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
