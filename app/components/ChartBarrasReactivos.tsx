"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { COLORS } from "@/types/raf";
import { getReactivoInfo } from "@/lib/reactivos-matematicas";
import ModalReactivo from "./ModalReactivo";

const NIVEL_COLORS = [COLORS.requiereApoyo, COLORS.enDesarrollo, COLORS.esperado];

function getColor(value: number) {
  if (value <= 50) return NIVEL_COLORS[0];
  if (value <= 80) return NIVEL_COLORS[1];
  return NIVEL_COLORS[2];
}

interface Props {
  porcentajes: number[];
  title?: string;
  totalAlumnos?: number;
  fillHeight?: boolean;
}

function TooltipAciertos(props: { active?: boolean; payload?: { payload: { reactivo: string; porcentaje: number; aciertos?: number } }[] }) {
  const { active, payload } = props;
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const aciertos = row.aciertos ?? null;
  return (
    <div className="rounded border border-border bg-card px-2 py-1.5 text-xs shadow">
      <div className="font-semibold">
        {aciertos != null
          ? `${aciertos} ${aciertos === 1 ? "persona contestó bien" : "personas contestaron bien"}`
          : `Reactivo ${row.reactivo}`}
      </div>
      <div className="text-foreground/80">{row.porcentaje}%</div>
    </div>
  );
}

export default function ChartBarrasReactivos({ porcentajes, title, totalAlumnos, fillHeight = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [reactivoSeleccionado, setReactivoSeleccionado] = useState<number | null>(null);
  useEffect(() => setMounted(true), []);

  const data = porcentajes.map((p, i) => ({
    reactivo: `${i + 1}`,
    numero: i + 1,
    porcentaje: p,
    fill: getColor(p),
    aciertos: totalAlumnos != null ? Math.round((p / 100) * totalAlumnos) : undefined,
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

  const info = reactivoSeleccionado ? getReactivoInfo(reactivoSeleccionado) ?? null : null;

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
      <div className={`chart-card__plot ${chartContainerClass} cursor-pointer`} tabIndex={-1}>
        {!mounted ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--fill-tertiary)]" aria-hidden />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="reactivo" tick={{ fontSize: 8 }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 8 }}
              tickFormatter={(v) => `${v}%`}
              width={28}
            />
            <Tooltip
              content={<TooltipAciertos />}
              cursor={{ fill: "rgba(0, 0, 0, 0.06)", pointerEvents: "none" }}
            />
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
