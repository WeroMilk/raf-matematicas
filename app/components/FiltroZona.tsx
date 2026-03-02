"use client";

import { ZONAS_DISPONIBLES } from "@/lib/zonas";

interface Props {
  value: number | null;
  onChange: (zona: number | null) => void;
}

export default function FiltroZona({ value, onChange }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : parseInt(v, 10));
      }}
      className="select-ios rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] min-h-[36px] cursor-pointer"
      title="Filtrar por zona"
    >
      <option value="">Todas las zonas</option>
      {ZONAS_DISPONIBLES.map((z) => (
        <option key={z} value={z}>
          Zona {z}
        </option>
      ))}
    </select>
  );
}
