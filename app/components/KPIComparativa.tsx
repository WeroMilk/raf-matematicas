import type { ComparativaKPIs } from "@/types/raf";
import { COLORS } from "@/types/raf";
import { EVALUACIONES_META } from "@/lib/evaluaciones";

function DeltaBadge({ value, invert }: { value: number; invert?: boolean }) {
  if (value === 0) return <span className="text-[10px] text-foreground/50">=</span>;
  const positive = invert ? value < 0 : value > 0;
  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={`text-[10px] font-bold ${positive ? "text-[#2E7D32]" : "text-[#D32F2F]"}`}
    >
      {sign}
      {value}
    </span>
  );
}

interface Props {
  comparativa: ComparativaKPIs;
  compact?: boolean;
}

export default function KPIComparativa({ comparativa, compact = false }: Props) {
  const { despegue2025, aterrizaje2026, delta } = comparativa;
  const items = [
    { key: "requiereApoyo", label: "Apoyo", color: COLORS.requiereApoyo, invert: true },
    { key: "enDesarrollo", label: "Desarrollo", color: COLORS.enDesarrollo, invert: false },
    { key: "esperado", label: "Esperado", color: COLORS.esperado, invert: false },
  ] as const;

  return (
    <div className={`grid grid-cols-3 gap-2 ${compact ? "" : "lg:gap-4"}`}>
      {items.map(({ key, label, color, invert }) => (
        <div
          key={key}
          className={`card-ios rounded-2xl border border-border bg-card text-center ${compact ? "p-2" : "p-3 lg:p-4"}`}
        >
          <div className={`mb-1 font-bold ${compact ? "text-sm" : "text-base lg:text-lg"}`} style={{ color }}>
            {label}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div>
              <div className="text-[9px] uppercase text-foreground/50">2025</div>
              <div className={`font-bold ${compact ? "text-sm" : "text-lg"}`}>
                {despegue2025[key]}
              </div>
            </div>
            <div className="text-foreground/30">→</div>
            <div>
              <div className="text-[9px] uppercase text-foreground/50">2026</div>
              <div className={`font-bold ${compact ? "text-sm" : "text-lg"}`}>
                {aterrizaje2026[key]}
              </div>
            </div>
          </div>
          <div className="mt-1">
            <DeltaBadge value={delta[key]} invert={invert} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KPIComparativaResumen({ comparativa }: Props) {
  const d = comparativa.despegue2025;
  const a = comparativa.aterrizaje2026;
  return (
    <p className="text-xs text-foreground/75">
      <span style={{ color: EVALUACIONES_META["despegue-2025"].color }} className="font-semibold">
        Despegue 2025:
      </span>{" "}
      {d.total} alumnos ·{" "}
      <span style={{ color: EVALUACIONES_META["aterrizaje-2026"].color }} className="font-semibold">
        Aterrizaje 2026:
      </span>{" "}
      {a.total} alumnos
    </p>
  );
}
