"use client";

import { useState } from "react";

const MAX = 8;
export type TableDensity = "compact" | "normal" | "comfortable";

interface TablePickerProps {
  onInsert: (rows: number, cols: number, density: TableDensity) => void;
}

const DENSITIES: { value: TableDensity; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "comfortable", label: "Large" },
];

export function TablePicker({ onInsert }: TablePickerProps) {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const [density, setDensity] = useState<TableDensity>("normal");

  return (
    <div className="p-2 flex flex-col gap-2.5 select-none">
      {/* Hover grid */}
      <div
        className="grid gap-0.5 w-fit mx-auto"
        style={{ gridTemplateColumns: `repeat(${MAX}, 1fr)` }}
        onMouseLeave={() => { setHoverRow(0); setHoverCol(0); }}
      >
        {Array.from({ length: MAX }, (_, r) =>
          Array.from({ length: MAX }, (_, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-5 h-5 border rounded-sm cursor-pointer transition-colors ${
                r < hoverRow && c < hoverCol
                  ? "bg-primary/20 border-primary"
                  : "border-border bg-muted/30 hover:border-muted-foreground/40"
              }`}
              onMouseEnter={() => { setHoverRow(r + 1); setHoverCol(c + 1); }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (hoverRow > 0 && hoverCol > 0) onInsert(hoverRow, hoverCol, density);
              }}
            />
          ))
        )}
      </div>

      {/* Size label */}
      <p className="text-center text-[11px] text-muted-foreground font-mono h-3.5 leading-none">
        {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} × ${hoverCol}` : "Hover to select size"}
      </p>

      {/* Density */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Cell size</p>
        <div className="flex gap-1">
          {DENSITIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setDensity(value)}
              className={`flex-1 text-xs py-1 rounded border transition-colors ${
                density === value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
