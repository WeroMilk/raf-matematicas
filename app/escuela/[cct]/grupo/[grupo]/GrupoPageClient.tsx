"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ResultadosMultiRAF } from "@/types/raf";
import { NIVEL_COLOR } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, parseModoVista } from "@/lib/evaluaciones";
import { getEscuelaFromEval } from "@/lib/resultados-utils";
import { compararGrupo } from "@/lib/comparativa";
import { appendNavParams } from "@/lib/evaluacion-url";
import ChartBarrasReactivos from "@/app/components/ChartBarrasReactivos";
import ChartPastelNiveles from "@/app/components/ChartPastelNiveles";
import TablaAlumnos from "@/app/components/TablaAlumnos";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";
import ScrollOnlyWhenNeeded from "@/app/components/ScrollOnlyWhenNeeded";

const NIVEL_TO_PARAM = { "REQUIERE APOYO": "REQUIERE_APOYO", "EN DESARROLLO": "EN_DESARROLLO", ESPERADO: "ESPERADO" } as const;

export default function GrupoPageClient({ cct, grupo, data }: { cct: string; grupo: string; data: ResultadosMultiRAF }) {
  const searchParams = useSearchParams();
  const evalMode = parseModoVista(searchParams.get("eval"));
  const nav = (p: string) => appendNavParams(p, { evalMode });

  const escuela2025 = getEscuelaFromEval(data, cct, EVALUACION_DESPEGUE_2025);
  const escuela2026 = getEscuelaFromEval(data, cct, EVALUACION_ATERRIZAJE_2026);
  const escuela = evalMode === "aterrizaje-2026" ? escuela2026 : escuela2025;
  const grupoData = escuela?.grupos.find((g) => g.nombre === grupo);
  const comparativa = compararGrupo(data, cct, grupo);

  if (!grupoData && evalMode !== "comparar") return <p className="p-4 text-sm">Grupo no encontrado.</p>;

  const total = grupoData?.total ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 min-w-0">
      <PageHeader centerContent={<SelectorEvaluacion compact />}>
        <BackButton href={nav(`/escuela/${cct}`)} label={escuela2025?.cct ?? cct} />
        <h1 className="mt-0.5 text-base font-bold">Grupo {grupo}</h1>
        <p className="text-xs text-foreground/80">
          {evalMode === "comparar" ? `${comparativa.length} alumnos en comparativa` : `${total} alumnos`}
        </p>
      </PageHeader>

      {evalMode === "comparar" ? (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <h2 className="mb-2 shrink-0 text-xs font-semibold">Comparativa por alumno</h2>
          <TablaAlumnos alumnos={[]} comparativa={comparativa} cct={cct} fillHeight />
        </section>
      ) : (
        <ScrollOnlyWhenNeeded className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden pb-4">
          {grupoData ? (
            <>
              <section className="grid shrink-0 grid-cols-3 gap-2">
              {(["REQUIERE APOYO", "EN DESARROLLO", "ESPERADO"] as const).map((nivel) => (
                <Link
                  key={nivel}
                  href={nav(`/por-nivel?nivel=${NIVEL_TO_PARAM[nivel]}&grupo=${encodeURIComponent(`${cct}|${grupo}`)}`)}
                  className="card-ios rounded-2xl p-2 text-center text-white"
                  style={{ backgroundColor: NIVEL_COLOR[nivel] }}
                >
                  <div className="text-sm font-bold">
                    {nivel === "REQUIERE APOYO" ? grupoData.requiereApoyo : nivel === "EN DESARROLLO" ? grupoData.enDesarrollo : grupoData.esperado}
                  </div>
                  <div className="text-[10px] opacity-90">{nivel === "REQUIERE APOYO" ? "Apoyo" : nivel === "EN DESARROLLO" ? "Desarrollo" : "Esperado"}</div>
                </Link>
              ))}
            </section>
            <section className="card-ios shrink-0 rounded-2xl border p-3">
              <ChartBarrasReactivos porcentajes={grupoData.porcentajesReactivos} totalAlumnos={grupoData.total} title="Aciertos por reactivo" />
            </section>
            <section className="card-ios shrink-0 rounded-2xl border p-3">
              <ChartPastelNiveles requiereApoyo={grupoData.requiereApoyo} enDesarrollo={grupoData.enDesarrollo} esperado={grupoData.esperado} title="Por nivel" />
            </section>
            <section className="min-w-0 shrink-0">
              <h2 className="mb-2 text-xs font-semibold">Alumnos</h2>
              <TablaAlumnos alumnos={grupoData.alumnos} cct={cct} />
            </section>
          </>
          ) : (
            <p className="text-sm text-foreground/70">Sin datos para este grupo en la evaluación seleccionada.</p>
          )}
        </ScrollOnlyWhenNeeded>
      )}
    </div>
  );
}
