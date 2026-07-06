"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COLORS } from "@/types/raf";
import type { EvaluacionId } from "@/types/raf";
import { EVALUACION_DESPEGUE_2025 } from "@/lib/evaluaciones";
import { getReactivoInfo } from "@/lib/reactivos-matematicas";
import ModalReactivo from "./ModalReactivo";
import { useChartPlotSize } from "./useChartPlotSize";
import { usePrefersTouch } from "./usePrefersTouch";

const NIVEL_COLORS = [COLORS.requiereApoyo, COLORS.enDesarrollo, COLORS.esperado];

function getColor(value: number) {
  if (value <= 50) return NIVEL_COLORS[0];
  if (value <= 80) return NIVEL_COLORS[1];
  return NIVEL_COLORS[2];
}

interface Props {
  porcentajes: number[];
  title?: string;
  evalId?: EvaluacionId;
  fillHeight?: boolean;
}

function TooltipAciertos(props: { active?: boolean; payload?: { payload: { reactivo: string; porcentaje: number } }[] }) {
  const { active, payload } = props;
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded border border-border bg-card px-2 py-1.5 text-xs shadow">
      <div className="font-semibold">Reactivo {row.reactivo}</div>
      <div className="text-foreground/80">{row.porcentaje}%</div>
    </div>
  );
}

export default function ChartBarrasReactivos({
  porcentajes,
  title,
  evalId = EVALUACION_DESPEGUE_2025,
  fillHeight = false,
}: Props) {
  const { ref, ready, width, height } = useChartPlotSize();
  const isTouch = usePrefersTouch();
  const [reactivoSeleccionado, setReactivoSeleccionado] = useState<number | null>(null);

  const data = porcentajes.map((p, i) => ({
    reactivo: `${i + 1}`,
    numero: i + 1,
    porcentaje: p,
    fill: getColor(p),
  }));

  const chartContainerClass = fillHeight
    ? "min-h-[6rem] w-full min-w-0 flex-1 outline-none"
    : "h-44 w-full min-w-0 min-h-[11rem] sm:h-28 sm:min-h-[7rem] outline-none";

  const handleBarClick = (entry: unknown, index?: number) => {
    const payload = entry as { numero?: number };
    const num = payload?.numero ?? (index != null ? index + 1 : null);
    if (typeof num === "number" && num >= 1 && num <= 12) {
      setReactivoSeleccionado(num);
    }
  };

  const BarBackground = (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    index?: number;
    payload?: { numero?: number };
  }) => {
    const { x = 0, y = 0, width = 0, height = 0, index, payload } = props;
    const num = payload?.numero ?? (index != null ? index + 1 : null);
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        className="cursor-pointer"
        onClick={() => handleBarClick({ numero: num }, index)}
      />
    );
  };

  const info = reactivoSeleccionado ? getReactivoInfo(reactivoSeleccionado, evalId) ?? null : null;

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
      <p className="chart-hint">Toca un reactivo para ver su información</p>
      <div ref={ref} className={`chart-card__plot overflow-hidden ${chartContainerClass} cursor-pointer`} tabIndex={-1}>
        {!ready ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--fill-tertiary)]" aria-hidden />
        ) : (
        <ResponsiveContainer width={width} height={height} minWidth={0}>
          <BarChart data={data} margin={{ top: 14, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="reactivo" tick={{ fontSize: 8 }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 8 }}
              tickFormatter={(v) => `${v}%`}
              width={28}
            />
            {!isTouch && (
            <Tooltip
              content={<TooltipAciertos />}
              cursor={{ fill: "rgba(0, 0, 0, 0.06)", pointerEvents: "none" }}
            />
            )}
            <Bar
              dataKey="porcentaje"
              radius={[2, 2, 0, 0]}
              label={{ position: "top", fontSize: 7 }}
              background={<BarBackground />}
              onClick={handleBarClick}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={data[i].fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
      <ModalReactivo reactivo={info} onClose={() => setReactivoSeleccionado(null)} />
    </div>
  );
}
