"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { EscuelaResumen, ResultadosMultiRAF } from "@/types/raf";
import { COLORS } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, EVALUACIONES_META, parseModoVista } from "@/lib/evaluaciones";
import { getEscuelaFromEval } from "@/lib/resultados-utils";
import { compararEscuela, tendenciaEscuela } from "@/lib/comparativa";
import { appendNavParams, withReturnTo } from "@/lib/evaluacion-url";
import ChartBarrasReactivos from "@/app/components/ChartBarrasReactivos";
import ChartPastelNiveles from "@/app/components/ChartPastelNiveles";
import ChartComparativaNiveles from "@/app/components/ChartComparativaNiveles";
import KPIComparativa, { nivelComparativaHref } from "@/app/components/KPIComparativa";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";
import { nombreEscuela } from "@/lib/nombres-escuelas";

function useIsMdUp() {
  const [isMdUp, setIsMdUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMdUp;
}

interface Props {
  cct: string;
  data: ResultadosMultiRAF;
  backHref: string;
  showBack: boolean;
  cobertura?: { alumnos2025: number; alumnos2026: number; cobertura: string };
}

export default function EscuelaPageClient({ cct, data, backHref, showBack, cobertura }: Props) {
  const isMdUp = useIsMdUp();
  const searchParams = useSearchParams();
  const evalMode = parseModoVista(searchParams.get("eval"));
  const nav = (p: string) => appendNavParams(p, { evalMode });
  const escuelaHref = nav(`/escuela/${cct}`);

  const escuela2025 = getEscuelaFromEval(data, cct, EVALUACION_DESPEGUE_2025);
  const escuela2026 = getEscuelaFromEval(data, cct, EVALUACION_ATERRIZAJE_2026);
  const escuela = evalMode === "aterrizaje-2026" ? escuela2026 : escuela2025;
  const evalId = evalMode === "aterrizaje-2026" ? EVALUACION_ATERRIZAJE_2026 : EVALUACION_DESPEGUE_2025;
  const ref = escuela ?? escuela2025 ?? escuela2026!;
  const cmp = compararEscuela(data, cct);
  const tend = tendenciaEscuela(data, cct);
  const nombre = nombreEscuela(cct, ref.buscador?.nombre);

  if (evalMode === "aterrizaje-2026" && !escuela2026) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
          {showBack && <BackButton href={nav(backHref)} label="Escuelas" />}
          <h1 className="mt-0.5 text-base font-bold">{nombre}</h1>
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
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2 pb-2 pt-1.5 min-w-0 md:gap-4 md:px-0 md:pb-4 md:pt-2">
      <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
        {showBack && <BackButton href={nav(backHref)} label="Escuelas" />}
        <h1 className="mt-0.5 text-base font-bold md:text-xl">{nombre}</h1>
        <p className="text-xs text-foreground/80">{cct}</p>
        <p className="text-xs text-foreground/70">
          {evalMode === "comparar"
            ? `Comparativa · ${cmp.despegue2025.total} vs ${cmp.aterrizaje2026.total} alumnos`
            : `${total} alumnos · ${escuela?.grupos.length ?? 0} grupos · ${evalMode === "aterrizaje-2026" ? EVALUACIONES_META[EVALUACION_ATERRIZAJE_2026].nombreCorto : EVALUACIONES_META[EVALUACION_DESPEGUE_2025].nombreCorto}`}
        </p>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden max-md:overflow-y-auto md:gap-4 md:overflow-hidden">
        {evalMode === "comparar" ? (
          <>
            {cmp.aterrizaje2026.total === 0 ? (
              <p className="shrink-0 px-1 text-sm text-foreground/70">Sin datos 2026 para comparar en esta escuela.</p>
            ) : (
              <div className="shrink-0">
                <KPIComparativa
                  comparativa={cmp}
                  compact
                  getNivelHref={(key) => withReturnTo(nivelComparativaHref(nav, key), escuelaHref)}
                />
              </div>
            )}
            <section className="card-ios flex shrink-0 flex-col rounded-2xl border p-3 md:min-h-0 md:flex-1">
              <ChartComparativaNiveles
                fillHeight={isMdUp}
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
            <section className="grid shrink-0 grid-cols-3 gap-2">
              {[
                { n: escuela.requiereApoyo, l: "Apoyo", c: COLORS.requiereApoyo, q: "REQUIERE_APOYO" },
                { n: escuela.enDesarrollo, l: "Desarrollo", c: COLORS.enDesarrollo, q: "EN_DESARROLLO" },
                { n: escuela.esperado, l: "Esperado", c: COLORS.esperado, q: "ESPERADO" },
              ].map((k) => (
                <Link key={k.q} href={withReturnTo(nav(`/por-nivel?nivel=${k.q}`), escuelaHref)} className="card-ios rounded-2xl p-2 text-center text-white" style={{ backgroundColor: k.c }}>
                  <div className="text-sm font-bold md:text-2xl">{k.n}</div>
                  <div className="text-[10px] opacity-90">{k.l}</div>
                </Link>
              ))}
            </section>
            <section className="flex shrink-0 flex-col gap-3 md:min-h-0 md:flex-1 md:flex-row">
              <section className="card-ios flex shrink-0 flex-col rounded-2xl border p-3 md:min-h-0 md:min-w-0 md:flex-1">
                <ChartBarrasReactivos fillHeight={isMdUp} porcentajes={escuela.porcentajesReactivos} evalId={evalId} title="Aciertos por reactivo" />
              </section>
              <section className="card-ios flex shrink-0 flex-col rounded-2xl border p-3 md:min-h-0 md:min-w-0 md:flex-1">
                <ChartPastelNiveles fillHeight={isMdUp} requiereApoyo={escuela.requiereApoyo} enDesarrollo={escuela.enDesarrollo} esperado={escuela.esperado} title="Por nivel" />
              </section>
            </section>
          </>
        ) : null}

        <section className="shrink-0 pb-2 md:pb-0">
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
      </div>
    </div>
  );
}
