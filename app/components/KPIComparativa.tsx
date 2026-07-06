import Link from "next/link";
import type { ComparativaKPIs } from "@/types/raf";
import { COLORS } from "@/types/raf";
import { EVALUACIONES_META } from "@/lib/evaluaciones";

export type KPIComparativaNivelKey = "requiereApoyo" | "enDesarrollo" | "esperado";

const NIVEL_QUERY: Record<KPIComparativaNivelKey, string> = {
  requiereApoyo: "REQUIERE_APOYO",
  enDesarrollo: "EN_DESARROLLO",
  esperado: "ESPERADO",
};

function pctDelTotal(valor: number, total: number): number {
  return total > 0 ? Math.round((valor / total) * 1000) / 10 : 0;
}

function formatPct(n: number): string {
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

function DeltaBadge({ value, invert }: { value: number; invert?: boolean }) {
  if (value === 0) return <span className="text-[10px] text-foreground/50">=</span>;
  const positive = invert ? value < 0 : value > 0;
  const sign = value > 0 ? "+" : "";
  const formatted = Number.isInteger(value) ? `${value}` : value.toFixed(1);
  return (
    <span
      className={`text-[10px] font-bold ${positive ? "text-[#2E7D32]" : "text-[#D32F2F]"}`}
    >
      {sign}
      {formatted} pp
    </span>
  );
}

interface Props {
  comparativa: ComparativaKPIs;
  compact?: boolean;
  getNivelHref?: (key: KPIComparativaNivelKey) => string;
}

export function nivelComparativaHref(getHref: (path: string) => string, key: KPIComparativaNivelKey): string {
  return getHref(`/por-nivel?nivel=${NIVEL_QUERY[key]}`);
}

export default function KPIComparativa({ comparativa, compact = false, getNivelHref }: Props) {
  const { despegue2025, aterrizaje2026 } = comparativa;
  const items = [
    { key: "requiereApoyo", label: "Apoyo", color: COLORS.requiereApoyo, invert: true },
    { key: "enDesarrollo", label: "Desarrollo", color: COLORS.enDesarrollo, invert: false },
    { key: "esperado", label: "Esperado", color: COLORS.esperado, invert: false },
  ] as const;

  const cardPad = compact ? "p-3 sm:p-2" : "p-3.5 sm:p-3 lg:p-4";
  const titleClass = compact ? "text-sm sm:text-xs" : "text-sm sm:text-base lg:text-lg";

  const cardBaseClass = `card-ios min-h-[92px] min-w-0 overflow-hidden rounded-2xl border border-border bg-card text-center shadow-sm sm:min-h-0 ${cardPad}`;

  return (
    <div className={`grid grid-cols-3 gap-2.5 sm:gap-2 ${compact ? "" : "lg:gap-4"}`}>
      {items.map(({ key, label, color, invert }) => {
        const pct2025 = pctDelTotal(despegue2025[key], despegue2025.total);
        const pct2026 = pctDelTotal(aterrizaje2026[key], aterrizaje2026.total);
        const deltaPct = Math.round((pct2026 - pct2025) * 10) / 10;
        const href = getNivelHref?.(key);
        const cardContent = (
          <>
            <div className={`mb-1.5 font-bold leading-tight sm:mb-1 ${titleClass}`} style={{ color }}>
              {label}
            </div>

            {/* Móvil: años apilados para que los números no se salgan */}
            <div className="space-y-1 sm:hidden">
              <div className="flex items-baseline justify-between gap-1 px-0.5">
                <span className="shrink-0 text-[9px] uppercase text-foreground/50">2025</span>
                <span className="min-w-0 truncate font-bold tabular-nums text-sm leading-none">
                  {formatPct(pct2025)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-1 px-0.5">
                <span className="shrink-0 text-[9px] uppercase text-foreground/50">2026</span>
                <span className="min-w-0 truncate font-bold tabular-nums text-sm leading-none">
                  {formatPct(pct2026)}
                </span>
              </div>
            </div>

            {/* Escritorio: comparativa horizontal */}
            <div className="hidden items-center justify-center gap-2 sm:flex">
              <div className="min-w-0">
                <div className="text-[9px] uppercase text-foreground/50">2025</div>
                <div className={`font-bold tabular-nums ${compact ? "text-sm" : "text-lg"}`}>
                  {formatPct(pct2025)}
                </div>
              </div>
              <div className="shrink-0 text-foreground/30">→</div>
              <div className="min-w-0">
                <div className="text-[9px] uppercase text-foreground/50">2026</div>
                <div className={`font-bold tabular-nums ${compact ? "text-sm" : "text-lg"}`}>
                  {formatPct(pct2026)}
                </div>
              </div>
            </div>

            <div className="mt-1.5 sm:mt-1">
              <DeltaBadge value={deltaPct} invert={invert} />
            </div>
          </>
        );

        return href ? (
          <Link key={key} href={href} className={`link-ios block ${cardBaseClass}`}>
            {cardContent}
          </Link>
        ) : (
          <div key={key} className={cardBaseClass}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}

export function KPIComparativaResumen({ comparativa }: Props) {
  const d = comparativa.despegue2025;
  const a = comparativa.aterrizaje2026;
  return (
    <p className="rounded-xl border border-border bg-[var(--guinda-muted)] px-3 py-2 text-xs text-foreground/80">
      <span style={{ color: EVALUACIONES_META["despegue-2025"].color }} className="font-semibold">
        Despegue 2025:
      </span>{" "}
      {formatPct(pctDelTotal(d.requiereApoyo, d.total))} apoyo ·{" "}
      {formatPct(pctDelTotal(d.enDesarrollo, d.total))} desarrollo ·{" "}
      {formatPct(pctDelTotal(d.esperado, d.total))} esperado
      {" · "}
      <span style={{ color: EVALUACIONES_META["aterrizaje-2026"].color }} className="font-semibold">
        Aterrizaje 2026:
      </span>{" "}
      {formatPct(pctDelTotal(a.requiereApoyo, a.total))} apoyo ·{" "}
      {formatPct(pctDelTotal(a.enDesarrollo, a.total))} desarrollo ·{" "}
      {formatPct(pctDelTotal(a.esperado, a.total))} esperado
    </p>
  );
}
