"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { EVALUACIONES_META } from "@/lib/evaluaciones";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = [
    { nivel: "Apoyo", "2025": requiereApoyo2025, "2026": requiereApoyo2026 },
    { nivel: "Desarrollo", "2025": enDesarrollo2025, "2026": enDesarrollo2026 },
    { nivel: "Esperado", "2025": esperado2025, "2026": esperado2026 },
  ];

  return (
    <div className={fillHeight ? "flex h-full min-h-0 flex-col" : "w-full"}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className={`chart-card__plot ${fillHeight ? "min-h-[6rem] flex-1" : "h-52 min-h-[13rem]"}`}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 4 }}>
              <XAxis dataKey="nivel" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="2025" name={EVALUACIONES_META["despegue-2025"].nombreCorto} fill={EVALUACIONES_META["despegue-2025"].color} />
              <Bar dataKey="2026" name={EVALUACIONES_META["aterrizaje-2026"].nombreCorto} fill={EVALUACIONES_META["aterrizaje-2026"].color} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = porcentajes2025.map((p, i) => ({
    reactivo: `${i + 1}`,
    "2025": p,
    "2026": porcentajes2026[i] ?? 0,
  }));

  return (
    <div className={fillHeight ? "flex h-full min-h-0 flex-col" : "w-full"}>
      {title && <h3 className="chart-title">{title}</h3>}
      <div className={`chart-card__plot ${fillHeight ? "min-h-[6rem] flex-1" : "h-44 min-h-[11rem]"}`}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 4 }}>
              <XAxis dataKey="reactivo" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Bar dataKey="2025" name={EVALUACIONES_META["despegue-2025"].nombreCorto} fill={EVALUACIONES_META["despegue-2025"].color} />
              <Bar dataKey="2026" name={EVALUACIONES_META["aterrizaje-2026"].nombreCorto} fill={EVALUACIONES_META["aterrizaje-2026"].color} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <LeyendaComparativa compact />
    </div>
  );
}
