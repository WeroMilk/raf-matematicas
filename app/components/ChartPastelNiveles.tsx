"use client";

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
  const data = [
    { name: NAMES[0], value: requiereApoyo },
    { name: NAMES[1], value: enDesarrollo },
    { name: NAMES[2], value: esperado },
  ].filter((d) => d.value > 0);
  if (data.length === 0) return null;
  const total = requiereApoyo + enDesarrollo + esperado;
  return (
    <div className="w-full min-w-0">
      {title && <h3 className="mb-1 text-xs font-semibold">{title}</h3>}
      <div className="h-28 w-full min-w-0 sm:h-32 lg:h-40">
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
      </div>
    </div>
  );
}
