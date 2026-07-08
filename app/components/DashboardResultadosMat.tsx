import type { ComparativaKPIs } from "@/types/raf";
import { COLORS } from "@/types/raf";
import ComparativaNivelFilaMat from "@/app/components/ComparativaNivelFilaMat";
import type { KPIComparativaNivelKey } from "@/app/components/KPIComparativa";

function pctDelTotal(valor: number, total: number): number {
  return total > 0 ? Math.round((valor / total) * 1000) / 10 : 0;
}

interface Props {
  comparativa: ComparativaKPIs;
  getNivelHref: (key: KPIComparativaNivelKey) => string;
}

const NIVELES = [
  {
    key: "requiereApoyo" as const,
    nivel: 1,
    label: "Apoyo",
    desc: "Requiere apoyo",
    color: COLORS.requiereApoyo,
  },
  {
    key: "enDesarrollo" as const,
    nivel: 2,
    label: "Desarrollo",
    desc: "En desarrollo",
    color: COLORS.enDesarrollo,
  },
  {
    key: "esperado" as const,
    nivel: 3,
    label: "Esperado",
    desc: "Nivel esperado",
    color: COLORS.esperado,
  },
];

export default function DashboardResultadosMat({ comparativa, getNivelHref }: Props) {
  const { despegue2025, aterrizaje2026 } = comparativa;

  const filas = NIVELES.map(({ key, nivel, label, desc, color }) => {
    const pct2025 = pctDelTotal(despegue2025[key], despegue2025.total);
    const pct2026 = pctDelTotal(aterrizaje2026[key], aterrizaje2026.total);
    return {
      nivel,
      label,
      desc,
      color,
      pct2025,
      pct2026,
      deltaPct: Math.round((pct2026 - pct2025) * 10) / 10,
      href: getNivelHref(key),
    };
  });

  return (
    <div className="comparativa-dashboard flex w-full max-w-full flex-col gap-3">
      <section className="comparativa-niveles">
        <div className="comparativa-niveles__head">
          <h2 className="label-alumnos-por-nivel">Alumnos por nivel</h2>
          <p className="comparativa-niveles__hint">
            Barras = % del total de esa evaluación. Toca una fila para ver la lista de alumnos.
          </p>
        </div>
        <div className="comparativa-niveles__list">
          {filas.map((row) => (
            <ComparativaNivelFilaMat key={row.label} {...row} />
          ))}
        </div>
      </section>
    </div>
  );
}
