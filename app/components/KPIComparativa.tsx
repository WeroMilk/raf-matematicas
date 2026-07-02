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

  const cardPad = compact ? "p-3 sm:p-2" : "p-3.5 sm:p-3 lg:p-4";
  const titleClass = compact ? "text-sm sm:text-xs" : "text-sm sm:text-base lg:text-lg";

  return (
    <div className={`grid grid-cols-3 gap-2.5 sm:gap-2 ${compact ? "" : "lg:gap-4"}`}>
      {items.map(({ key, label, color, invert }) => (
        <div
          key={key}
          className={`card-ios min-h-[92px] min-w-0 overflow-hidden rounded-2xl border border-border bg-card text-center sm:min-h-0 ${cardPad}`}
        >
          <div className={`mb-1.5 font-bold leading-tight sm:mb-1 ${titleClass}`} style={{ color }}>
            {label}
          </div>

          {/* Móvil: años apilados para que los números no se salgan */}
          <div className="space-y-1 sm:hidden">
            <div className="flex items-baseline justify-between gap-1 px-0.5">
              <span className="shrink-0 text-[9px] uppercase text-foreground/50">2025</span>
              <span className="min-w-0 truncate font-bold tabular-nums text-sm leading-none">
                {despegue2025[key].toLocaleString("es-MX")}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-1 px-0.5">
              <span className="shrink-0 text-[9px] uppercase text-foreground/50">2026</span>
              <span className="min-w-0 truncate font-bold tabular-nums text-sm leading-none">
                {aterrizaje2026[key].toLocaleString("es-MX")}
              </span>
            </div>
          </div>

          {/* Escritorio: comparativa horizontal */}
          <div className="hidden items-center justify-center gap-2 sm:flex">
            <div className="min-w-0">
              <div className="text-[9px] uppercase text-foreground/50">2025</div>
              <div className={`font-bold tabular-nums ${compact ? "text-sm" : "text-lg"}`}>
                {despegue2025[key].toLocaleString("es-MX")}
              </div>
            </div>
            <div className="shrink-0 text-foreground/30">→</div>
            <div className="min-w-0">
              <div className="text-[9px] uppercase text-foreground/50">2026</div>
              <div className={`font-bold tabular-nums ${compact ? "text-sm" : "text-lg"}`}>
                {aterrizaje2026[key].toLocaleString("es-MX")}
              </div>
            </div>
          </div>

          <div className="mt-1.5 sm:mt-1">
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
