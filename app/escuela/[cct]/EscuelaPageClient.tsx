"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { EscuelaResumen, ResultadosMultiRAF } from "@/types/raf";
import { COLORS } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, EVALUACIONES_META, parseModoVista } from "@/lib/evaluaciones";
import { getEscuelaFromEval } from "@/lib/resultados-utils";
import { compararEscuela, tendenciaEscuela } from "@/lib/comparativa";
import { appendNavParams } from "@/lib/evaluacion-url";
import ChartBarrasReactivos from "@/app/components/ChartBarrasReactivos";
import ChartPastelNiveles from "@/app/components/ChartPastelNiveles";
import ChartComparativaNiveles from "@/app/components/ChartComparativaNiveles";
import KPIComparativa from "@/app/components/KPIComparativa";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";
import ScrollOnlyWhenNeeded from "@/app/components/ScrollOnlyWhenNeeded";
import { nombreEscuela } from "@/lib/nombres-escuelas";

interface Props {
  cct: string;
  data: ResultadosMultiRAF;
  backHref: string;
  showBack: boolean;
  cobertura?: { alumnos2025: number; alumnos2026: number; cobertura: string };
}

export default function EscuelaPageClient({ cct, data, backHref, showBack, cobertura }: Props) {
  const searchParams = useSearchParams();
  const evalMode = parseModoVista(searchParams.get("eval"));
  const nav = (p: string) => appendNavParams(p, { evalMode });

  const escuela2025 = getEscuelaFromEval(data, cct, EVALUACION_DESPEGUE_2025);
  const escuela2026 = getEscuelaFromEval(data, cct, EVALUACION_ATERRIZAJE_2026);
  const escuela = evalMode === "aterrizaje-2026" ? escuela2026 : escuela2025;
  const ref = escuela ?? escuela2025 ?? escuela2026!;
  const cmp = compararEscuela(data, cct);
  const tend = tendenciaEscuela(data, cct);
  const nombre = nombreEscuela(cct, ref.buscador?.nombre);

  if (evalMode === "aterrizaje-2026" && !escuela2026) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
          {showBack && <BackButton href={nav(backHref)} label="Escuelas" />}
          <h1 className="mt-3 text-base font-bold">{nombre}</h1>
        </PageHeader>
        <div className="card-ios rounded-2xl border p-4 text-sm">
          Esta escuela aún no tiene resultados de <strong>RAF Aterrizaje 2026</strong>.
          {escuela2025 && <p className="mt-2 text-foreground/70">Datos disponibles solo para Despegue 2025 ({escuela2025.totalEstudiantes} alumnos).</p>}
        </div>
      </div>
    );
  }

  const total = escuela?.totalEstudiantes ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2 pb-2 pt-1.5 min-w-0 lg:gap-6 lg:pt-2 lg:px-0 lg:pb-8">
      <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
        {showBack && <BackButton href={nav(backHref)} label="Escuelas" />}
        <h1 className="mt-3 text-base font-bold lg:text-xl">{nombre}</h1>
        <p className="text-xs text-foreground/80">{cct}</p>
        <p className="text-xs text-foreground/70">
          {evalMode === "comparar"
            ? `Comparativa · ${cmp.despegue2025.total} vs ${cmp.aterrizaje2026.total} alumnos`
            : `${total} alumnos · ${escuela?.grupos.length ?? 0} grupos · ${evalMode === "aterrizaje-2026" ? EVALUACIONES_META[EVALUACION_ATERRIZAJE_2026].nombreCorto : EVALUACIONES_META[EVALUACION_DESPEGUE_2025].nombreCorto}`}
          {cobertura?.cobertura === "parcial" && evalMode === "aterrizaje-2026" && ` · Parcial (${cobertura.alumnos2026}/${cobertura.alumnos2025})`}
        </p>
      </PageHeader>

      <ScrollOnlyWhenNeeded className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden pb-6 lg:gap-6 lg:pb-8">
        {evalMode === "comparar" ? (
          <>
            {cmp.aterrizaje2026.total === 0 ? (
              <p className="text-sm text-foreground/70 px-1">Sin datos 2026 para comparar en esta escuela.</p>
            ) : (
              <KPIComparativa comparativa={cmp} compact />
            )}
            <section className="card-ios rounded-2xl border p-3">
              <ChartComparativaNiveles
                requiereApoyo2025={cmp.despegue2025.requiereApoyo}
                enDesarrollo2025={cmp.despegue2025.enDesarrollo}
                esperado2025={cmp.despegue2025.esperado}
                requiereApoyo2026={cmp.aterrizaje2026.requiereApoyo}
                enDesarrollo2026={cmp.aterrizaje2026.enDesarrollo}
                esperado2026={cmp.aterrizaje2026.esperado}
                title="Por nivel"
              />
            </section>
          </>
        ) : escuela ? (
          <>
            <section className="grid grid-cols-3 gap-2 shrink-0">
              {[
                { n: escuela.requiereApoyo, l: "Apoyo", c: COLORS.requiereApoyo, q: "REQUIERE_APOYO" },
                { n: escuela.enDesarrollo, l: "Desarrollo", c: COLORS.enDesarrollo, q: "EN_DESARROLLO" },
                { n: escuela.esperado, l: "Esperado", c: COLORS.esperado, q: "ESPERADO" },
              ].map((k) => (
                <Link key={k.q} href={nav(`/por-nivel?nivel=${k.q}`)} className="card-ios rounded-2xl p-2 text-center text-white" style={{ backgroundColor: k.c }}>
                  <div className="text-sm font-bold lg:text-2xl">{k.n}</div>
                  <div className="text-[10px] opacity-90">{k.l}</div>
                </Link>
              ))}
            </section>
            <section className="grid gap-3 lg:grid-cols-2 shrink-0">
              <section className="card-ios rounded-2xl border p-3">
                <ChartBarrasReactivos porcentajes={escuela.porcentajesReactivos} totalAlumnos={escuela.totalEstudiantes} title="Aciertos por reactivo" />
              </section>
              <section className="card-ios rounded-2xl border p-3">
                <ChartPastelNiveles requiereApoyo={escuela.requiereApoyo} enDesarrollo={escuela.enDesarrollo} esperado={escuela.esperado} title="Por nivel" />
              </section>
            </section>
          </>
        ) : null}

        <section className="shrink-0">
          <h2 className="mb-2 text-xs font-semibold">Grupos{tend && evalMode === "comparar" ? ` · tendencia: ${tend}` : ""}</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {(evalMode === "comparar" ? escuela2025?.grupos ?? [] : escuela?.grupos ?? []).map((g) => {
              const g26 = escuela2026?.grupos.find((x) => x.nombre === g.nombre);
              return (
                <li key={g.nombre}>
                  <Link href={nav(`/escuela/${cct}/grupo/${encodeURIComponent(g.nombre)}`)} className="card-ios block rounded-xl border p-2 text-center text-xs">
                    <span className="font-semibold">{g.nombre}</span>
                    <span className="mt-1 block text-foreground/70">
                      {evalMode === "comparar" ? `${g.total} → ${g26?.total ?? 0}` : `${g.total} · Apoyo: ${g.requiereApoyo}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </ScrollOnlyWhenNeeded>
    </div>
  );
}
