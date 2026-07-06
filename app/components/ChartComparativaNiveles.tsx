"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { EVALUACIONES_META } from "@/lib/evaluaciones";
import { useChartPlotSize } from "./useChartPlotSize";
import { usePrefersTouch } from "./usePrefersTouch";
import ChartTouchTip from "./ChartTouchTip";

function LeyendaComparativa({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${compact ? "text-[9px]" : "text-[10px]"}`}>
      <span className="flex items-center gap-1.5 font-medium" style={{ color: EVALUACIONES_META["despegue-2025"].color }}>
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: EVALUACIONES_META["despegue-2025"].color }}
          aria-hidden
        />
        {EVALUACIONES_META["despegue-2025"].nombreCorto}
      </span>
      <span className="flex items-center gap-1.5 font-medium" style={{ color: EVALUACIONES_META["aterrizaje-2026"].color }}>
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
          style={{ backgroundColor: EVALUACIONES_META["aterrizaje-2026"].color }}
          aria-hidden
        />
        {EVALUACIONES_META["aterrizaje-2026"].nombreCorto}
      </span>
    </div>
  );
}

type ComparativaRow = {
  label: string;
  "2025": number;
  "2026": number;
};

function pctDelTotal(valor: number, total: number): number {
  return total > 0 ? Math.round((valor / total) * 1000) / 10 : 0;
}

function TooltipPorcentaje({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-border bg-card px-2 py-1.5 text-xs shadow">
      {label && <div className="mb-1 font-semibold">{label}</div>}
      {payload.map((entry) => (
        <div key={String(entry.name)} style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </div>
      ))}
    </div>
  );
}

export default function ChartComparativaNiveles({
  requiereApoyo2025,
  enDesarrollo2025,
  esperado2025,
  requiereApoyo2026,
  enDesarrollo2026,
  esperado2026,
  title,
  fillHeight = false,
}: {
  requiereApoyo2025: number;
  enDesarrollo2025: number;
  esperado2025: number;
  requiereApoyo2026: number;
  enDesarrollo2026: number;
  esperado2026: number;
  title?: string;
  fillHeight?: boolean;
}) {
  const { ref, ready, width, height } = useChartPlotSize();
  const isTouch = usePrefersTouch();
  const [tip, setTip] = useState<ComparativaRow | null>(null);
  const total2025 = requiereApoyo2025 + enDesarrollo2025 + esperado2025;
  const total2026 = requiereApoyo2026 + enDesarrollo2026 + esperado2026;
  const data = [
    { label: "Apoyo", "2025": pctDelTotal(requiereApoyo2025, total2025), "2026": pctDelTotal(requiereApoyo2026, total2026) },
    { label: "Desarrollo", "2025": pctDelTotal(enDesarrollo2025, total2025), "2026": pctDelTotal(enDesarrollo2026, total2026) },
    { label: "Esperado", "2025": pctDelTotal(esperado2025, total2025), "2026": pctDelTotal(esperado2026, total2026) },
  ];

  const handleBarClick = (row: unknown) => {
    if (!isTouch) return;
    const entry = row as ComparativaRow;
    if (entry?.label) setTip(entry);
  };

  return (
    <div className={fillHeight ? "flex h-full min-h-0 flex-col" : "w-full"}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div ref={ref} className={`chart-card__plot overflow-hidden ${fillHeight ? "min-h-[6rem] flex-1" : "h-52 min-h-[13rem]"}`}>
        {!ready ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--fill-tertiary)]" aria-hidden />
        ) : (
          <ResponsiveContainer width={width} height={height} minWidth={0}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} width={32} />
              {!isTouch && <Tooltip content={<TooltipPorcentaje />} />}
              <Bar
                dataKey="2025"
                name={EVALUACIONES_META["despegue-2025"].nombreCorto}
                fill={EVALUACIONES_META["despegue-2025"].color}
                onClick={handleBarClick}
                cursor={isTouch ? "pointer" : undefined}
              />
              <Bar
                dataKey="2026"
                name={EVALUACIONES_META["aterrizaje-2026"].nombreCorto}
                fill={EVALUACIONES_META["aterrizaje-2026"].color}
                onClick={handleBarClick}
                cursor={isTouch ? "pointer" : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {isTouch && (
        tip ? (
          <ChartTouchTip
            title={tip.label}
            rows={[
              {
                label: EVALUACIONES_META["despegue-2025"].nombreCorto,
                value: `${tip["2025"]}%`,
                color: EVALUACIONES_META["despegue-2025"].color,
              },
              {
                label: EVALUACIONES_META["aterrizaje-2026"].nombreCorto,
                value: `${tip["2026"]}%`,
                color: EVALUACIONES_META["aterrizaje-2026"].color,
              },
            ]}
            onClose={() => setTip(null)}
          />
        ) : (
          <p className="chart-hint mt-1.5">Toca una barra para ver los datos</p>
        )
      )}
      <LeyendaComparativa />
    </div>
  );
}

export function ChartBarrasReactivosComparativa({
  porcentajes2025,
  porcentajes2026,
  title,
  fillHeight = false,
}: {
  porcentajes2025: number[];
  porcentajes2026: number[];
  title?: string;
  fillHeight?: boolean;
}) {
  const { ref, ready, width, height } = useChartPlotSize();
  const isTouch = usePrefersTouch();
  const [tip, setTip] = useState<ComparativaRow | null>(null);
  const data = porcentajes2025.map((p, i) => ({
    label: `${i + 1}`,
    "2025": p,
    "2026": porcentajes2026[i] ?? 0,
  }));

  const handleBarClick = (row: unknown) => {
    if (!isTouch) return;
    const entry = row as ComparativaRow;
    if (entry?.label) setTip(entry);
  };

  return (
    <div className={fillHeight ? "flex h-full min-h-0 flex-col" : "w-full"}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div ref={ref} className={`chart-card__plot overflow-hidden ${fillHeight ? "min-h-[6rem] flex-1" : "h-44 min-h-[11rem]"}`}>
        {!ready ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--fill-tertiary)]" aria-hidden />
        ) : (
          <ResponsiveContainer width={width} height={height} minWidth={0}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} width={28} />
              {!isTouch && <Tooltip content={<TooltipPorcentaje />} />}
              <Bar
                dataKey="2025"
                name={EVALUACIONES_META["despegue-2025"].nombreCorto}
                fill={EVALUACIONES_META["despegue-2025"].color}
                onClick={handleBarClick}
                cursor={isTouch ? "pointer" : undefined}
              />
              <Bar
                dataKey="2026"
                name={EVALUACIONES_META["aterrizaje-2026"].nombreCorto}
                fill={EVALUACIONES_META["aterrizaje-2026"].color}
                onClick={handleBarClick}
                cursor={isTouch ? "pointer" : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {isTouch && (
        tip ? (
          <ChartTouchTip
            title={`Reactivo ${tip.label}`}
            rows={[
              {
                label: EVALUACIONES_META["despegue-2025"].nombreCorto,
                value: `${tip["2025"]}%`,
                color: EVALUACIONES_META["despegue-2025"].color,
              },
              {
                label: EVALUACIONES_META["aterrizaje-2026"].nombreCorto,
                value: `${tip["2026"]}%`,
                color: EVALUACIONES_META["aterrizaje-2026"].color,
              },
            ]}
            onClose={() => setTip(null)}
          />
        ) : (
          <p className="chart-hint mt-1.5">Toca una barra para ver los datos</p>
        )
      )}
      <LeyendaComparativa compact />
    </div>
  );
}
