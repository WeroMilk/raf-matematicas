"use client";

import { useSearchParams } from "next/navigation";
import type { ResultadosMultiRAF } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, parseModoVista } from "@/lib/evaluaciones";
import { getEscuelaFromEval } from "@/lib/resultados-utils";
import { compararGrupo } from "@/lib/comparativa";
import { appendNavParams } from "@/lib/evaluacion-url";
import TablaAlumnos from "@/app/components/TablaAlumnos";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";

interface Props {
  cct: string;
  grupo: string;
  data: ResultadosMultiRAF;
}

export default function AlumnosGrupoClient({ cct, grupo, data }: Props) {
  const searchParams = useSearchParams();
  const evalMode = parseModoVista(searchParams.get("eval"));
  const nav = (p: string) => appendNavParams(p, { evalMode });
  const grupoHref = nav(`/escuela/${cct}/grupo/${encodeURIComponent(grupo)}`);

  const escuela2025 = getEscuelaFromEval(data, cct, EVALUACION_DESPEGUE_2025);
  const escuela2026 = getEscuelaFromEval(data, cct, EVALUACION_ATERRIZAJE_2026);
  const escuela = evalMode === "aterrizaje-2026" ? escuela2026 : escuela2025;
  const evalId = evalMode === "aterrizaje-2026" ? EVALUACION_ATERRIZAJE_2026 : EVALUACION_DESPEGUE_2025;
  const grupoData = escuela?.grupos.find((g) => g.nombre === grupo);
  const comparativa = compararGrupo(data, cct, grupo);

  if (evalMode === "comparar") {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 min-w-0">
        <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
          <BackButton href={grupoHref} label={`Grupo ${grupo}`} />
          <h1 className="mt-0.5 text-base font-bold">Comparativa por alumno</h1>
          <p className="text-xs text-foreground/80">Grupo {grupo} · {comparativa.length} alumnos</p>
        </PageHeader>
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TablaAlumnos alumnos={[]} comparativa={comparativa} cct={cct} fillHeight />
        </section>
      </div>
    );
  }

  if (!grupoData) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
          <BackButton href={grupoHref} label={`Grupo ${grupo}`} />
          <h1 className="mt-0.5 text-base font-bold">Alumnos</h1>
        </PageHeader>
        <p className="text-sm text-foreground/70">Sin datos para este grupo en la evaluación seleccionada.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 min-w-0">
      <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
        <BackButton href={grupoHref} label={`Grupo ${grupo}`} />
        <h1 className="mt-0.5 text-base font-bold">Alumnos</h1>
        <p className="text-xs text-foreground/80">
          Grupo {grupo} · {grupoData.total} alumnos
        </p>
      </PageHeader>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TablaAlumnos alumnos={grupoData.alumnos} cct={cct} evalId={evalId} fillHeight />
      </section>
    </div>
  );
}
