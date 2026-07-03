import { EVALUACIONES_META } from "@/lib/evaluaciones";

export default function ComparativaLegend({ className = "" }: { className?: string }) {
  return (
    <div className={`comparativa-legend flex flex-wrap items-center gap-3 text-[11px] ${className}`}>
      <span className="flex items-center gap-1.5 font-medium text-foreground/70">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: EVALUACIONES_META["despegue-2025"].color }} aria-hidden />
        2025 Despegue
      </span>
      <span className="flex items-center gap-1.5 font-medium text-foreground/70">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: EVALUACIONES_META["aterrizaje-2026"].color }} aria-hidden />
        2026 Aterrizaje
      </span>
      <span className="flex items-center gap-1.5 font-medium text-foreground/70">
        <span className="text-[#2E7D32]">↑</span> mejora
        <span className="text-[#D32F2F]">↓</span> baja
      </span>
    </div>
  );
}
