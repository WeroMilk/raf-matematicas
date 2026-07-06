"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ResultadosMultiRAF } from "@/types/raf";
import { NIVEL_COLOR } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, parseModoVista } from "@/lib/evaluaciones";
import { getEscuelaFromEval } from "@/lib/resultados-utils";
import { compararGrupo } from "@/lib/comparativa";
import { appendNavParams, withReturnTo } from "@/lib/evaluacion-url";
import ChartBarrasReactivos from "@/app/components/ChartBarrasReactivos";
import TablaAlumnos from "@/app/components/TablaAlumnos";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";

const NIVEL_TO_PARAM = { "REQUIERE APOYO": "REQUIERE_APOYO", "EN DESARROLLO": "EN_DESARROLLO", ESPERADO: "ESPERADO" } as const;

export default function GrupoPageClient({ cct, grupo, data }: { cct: string; grupo: string; data: ResultadosMultiRAF }) {
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

  if (!grupoData && evalMode !== "comparar") return <p className="p-4 text-sm">Grupo no encontrado.</p>;

  const total = grupoData?.total ?? 0;
  const alumnosHref = nav(`/escuela/${cct}/grupo/${encodeURIComponent(grupo)}/alumnos`);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2 min-w-0 md:gap-4 md:px-0 md:pb-4 md:pt-2">
      <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
        <BackButton href={nav(`/escuela/${cct}`)} label={escuela2025?.cct ?? cct} />
        <h1 className="mt-0.5 text-base font-bold md:text-xl">Grupo {grupo}</h1>
        <p className="text-xs text-foreground/80">
          {evalMode === "comparar" ? `${comparativa.length} alumnos en comparativa` : `${total} alumnos`}
        </p>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-2 max-md:overflow-y-auto md:gap-4 md:overflow-hidden">
      {evalMode === "comparar" ? (
        <>
          <section className="card-ios shrink-0 rounded-2xl border p-3 text-sm text-foreground/75">
            Comparativa 2025 vs 2026 por alumno en este grupo.
          </section>
          <section className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
            <TablaAlumnos alumnos={[]} comparativa={comparativa} cct={cct} fillHeight />
          </section>
          <Link href={withReturnTo(alumnosHref, grupoHref)} className="nav-link-card link-ios shrink-0 md:hidden">
            Ver comparativa por alumno ({comparativa.length})
            <span className="nav-link-card__arrow" aria-hidden>
              →
            </span>
          </Link>
        </>
      ) : (
        grupoData ? (
          <>
            <section className="grid shrink-0 grid-cols-3 gap-2">
              {(["REQUIERE APOYO", "EN DESARROLLO", "ESPERADO"] as const).map((nivel) => (
                <Link
                  key={nivel}
                  href={withReturnTo(
                    nav(`/por-nivel?nivel=${NIVEL_TO_PARAM[nivel]}&grupo=${encodeURIComponent(`${cct}|${grupo}`)}`),
                    grupoHref
                  )}
                  className="card-ios rounded-2xl p-2 text-center text-white md:p-3"
                  style={{ backgroundColor: NIVEL_COLOR[nivel] }}
                >
                  <div className="text-sm font-bold md:text-2xl">
                    {nivel === "REQUIERE APOYO" ? grupoData.requiereApoyo : nivel === "EN DESARROLLO" ? grupoData.enDesarrollo : grupoData.esperado}
                  </div>
                  <div className="text-[10px] opacity-90 md:text-xs">{nivel === "REQUIERE APOYO" ? "Apoyo" : nivel === "EN DESARROLLO" ? "Desarrollo" : "Esperado"}</div>
                </Link>
              ))}
            </section>
            <section className="card-ios shrink-0 rounded-2xl border p-3">
              <ChartBarrasReactivos porcentajes={grupoData.porcentajesReactivos} evalId={evalId} title="Aciertos por reactivo" />
            </section>
            <section className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
              <TablaAlumnos alumnos={grupoData.alumnos} cct={cct} evalId={evalId} fillHeight />
            </section>
            <Link href={withReturnTo(alumnosHref, grupoHref)} className="nav-link-card link-ios shrink-0 md:hidden">
              Ver lista de alumnos ({total})
              <span className="nav-link-card__arrow" aria-hidden>
                →
              </span>
            </Link>
          </>
        ) : (
          <p className="text-sm text-foreground/70">Sin datos para este grupo en la evaluación seleccionada.</p>
        )
      )}
      </div>
    </div>
  );
}
