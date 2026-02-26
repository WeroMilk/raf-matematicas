"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { COLORS } from "@/types/raf";

const DATA_COLORS = [COLORS.requiereApoyo, COLORS.enDesarrollo, COLORS.esperado];
const NAMES = ["Requiere apoyo", "En desarrollo", "Esperado"];

interface Props {
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  title?: string;
}

export default function ChartPastelNiveles({ requiereApoyo, enDesarrollo, esperado, title }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = [
    { name: NAMES[0], value: requiereApoyo },
    { name: NAMES[1], value: enDesarrollo },
    { name: NAMES[2], value: esperado },
  ].filter((d) => d.value > 0);
  if (data.length === 0) return null;
  const total = requiereApoyo + enDesarrollo + esperado;

  const chartContainerClass = "h-28 w-full min-w-0 min-h-[7rem] sm:h-32 sm:min-h-[8rem] lg:h-40 lg:min-h-[10rem]";

  return (
    <div className="w-full min-w-0">
      {title && <h3 className="mb-1 text-xs font-semibold">{title}</h3>}
      <div className={chartContainerClass}>
        {!mounted ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-[var(--fill-tertiary)]" aria-hidden />
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={38}
              paddingAngle={2}
              dataKey="value"
              label={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DATA_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number | undefined, name?: string) =>
                total
                  ? [`${Math.round(((v ?? 0) / total) * 100)}%`, name ?? ""]
                  : [v ?? 0, name ?? ""]
              }
            />
            <Legend
              wrapperStyle={{ fontSize: 9 }}
              formatter={(value, entry) => {
                const pct = total ? Math.round(((entry?.payload?.value ?? 0) / total) * 100) : 0;
                return `${value} ${pct}%`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
