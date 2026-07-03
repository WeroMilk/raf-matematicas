"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { COLORS } from "@/types/raf";
import type { NivelConExamen } from "@/lib/niveles-raf";
import { getNivelRAFInfo } from "@/lib/niveles-raf";
import ModalNivel, { type DetalleNivelModal } from "./ModalNivel";
import { useChartPlotSize } from "./useChartPlotSize";
import { usePrefersTouch } from "./usePrefersTouch";

const DATA_COLORS = [COLORS.requiereApoyo, COLORS.enDesarrollo, COLORS.esperado];
const NIVELES: NivelConExamen[] = ["REQUIERE APOYO", "EN DESARROLLO", "ESPERADO"];
const NAMES = ["Requiere apoyo", "En desarrollo", "Esperado"];

interface Props {
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  title?: string;
  fillHeight?: boolean;
}

type SliceData = {
  name: string;
  value: number;
  nivel: NivelConExamen;
  color: string;
};

function PastelLegend({
  data,
  total,
  onSelect,
  compact = false,
}: {
  data: SliceData[];
  total: number;
  onSelect: (nivel: NivelConExamen, value: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={`chart-pastel-legend flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 py-1.5 ${compact ? "text-[9px]" : "text-[10px]"}`}>
      {data.map((entry) => {
        const pct = total ? Math.round((entry.value / total) * 100) : 0;
        return (
          <button
            key={entry.nivel}
            type="button"
            onClick={() => onSelect(entry.nivel, entry.value)}
            className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 font-medium leading-tight hover:bg-[var(--fill-tertiary)]"
            style={{ color: entry.color }}
          >
            <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: entry.color }} aria-hidden />
            <span className="truncate">
              {entry.name} {pct}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function ChartPastelNiveles({ requiereApoyo, enDesarrollo, esperado, title, fillHeight = false }: Props) {
  const { ref, ready, width, height } = useChartPlotSize();
  const isTouch = usePrefersTouch();
  const [detalleNivel, setDetalleNivel] = useState<DetalleNivelModal | null>(null);

  const values = [requiereApoyo, enDesarrollo, esperado];
  const data: SliceData[] = NIVELES.map((nivel, i) => ({
    name: NAMES[i],
    value: values[i],
    nivel,
    color: DATA_COLORS[i],
  })).filter((d) => d.value > 0);

  const total = requiereApoyo + enDesarrollo + esperado;

  const abrirDetalle = (nivel: NivelConExamen, cantidad: number) => {
    const porcentaje = total ? Math.round((cantidad / total) * 100) : 0;
    setDetalleNivel({
      info: getNivelRAFInfo(nivel),
      cantidad,
      porcentaje,
      total,
    });
  };

  const handleSliceClick = (entry: unknown) => {
    const slice = entry as SliceData;
    if (slice?.nivel && slice.value > 0) {
      abrirDetalle(slice.nivel, slice.value);
    }
  };

  const chartContainerClass = fillHeight
    ? "min-h-[8rem] w-full min-w-0 flex-1"
    : "min-h-[12.5rem] w-full min-w-0 sm:min-h-[10rem]";

  if (data.length === 0) return null;

  return (
    <div
      className={
        fillHeight
          ? "chart-no-focus flex h-full min-h-0 w-full min-w-0 flex-col outline-none"
          : "chart-no-focus w-full min-w-0 outline-none"
      }
      tabIndex={-1}
    >
      {title && <h3 className="chart-title">{title}</h3>}
      <p className="chart-hint">Toca un nivel para ver su información</p>
      <div className={`chart-card__plot flex cursor-pointer flex-col overflow-hidden ${chartContainerClass}`} tabIndex={-1}>
        <div ref={ref} className="min-h-[7.5rem] min-w-0 flex-1 overflow-hidden sm:min-h-[6.5rem]">
          {!ready ? (
            <div className="h-full w-full animate-pulse rounded-lg bg-[var(--fill-tertiary)]" aria-hidden />
          ) : (
            <ResponsiveContainer width={width} height={height} minWidth={0}>
              <PieChart margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={fillHeight ? "44%" : "42%"}
                  outerRadius={fillHeight ? "72%" : "68%"}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                  cursor="pointer"
                  onClick={handleSliceClick}
                >
                  {data.map((entry) => (
                    <Cell key={entry.nivel} fill={entry.color} className="cursor-pointer" />
                  ))}
                </Pie>
                {!isTouch && (
                <Tooltip
                  formatter={(v: number | undefined, name?: string) =>
                    total ? [`${Math.round(((v ?? 0) / total) * 100)}%`, name ?? ""] : [v ?? 0, name ?? ""]
                  }
                />
                )}
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <PastelLegend data={data} total={total} onSelect={abrirDetalle} compact={!fillHeight} />
      </div>
      <ModalNivel detalle={detalleNivel} onClose={() => setDetalleNivel(null)} />
    </div>
  );
}
