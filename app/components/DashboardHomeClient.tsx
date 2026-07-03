"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ResultadosMultiRAF, EscuelaResumen } from "@/types/raf";
import { getZonaFromCct, ZONAS_DISPONIBLES } from "@/lib/zonas";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, EVALUACIONES_META, parseModoVista } from "@/lib/evaluaciones";
import { getEscuelasForEval } from "@/lib/resultados-utils";
import { agregarGlobal, porcentajesReactivosGlobales } from "@/lib/comparativa";
import { appendNavParams } from "@/lib/evaluacion-url";
import PageHeader from "@/app/components/PageHeader";
import ScrollOnlyWhenNeeded from "@/app/components/ScrollOnlyWhenNeeded";
import ChartPastelNiveles from "@/app/components/ChartPastelNiveles";
import ChartBarrasReactivos from "@/app/components/ChartBarrasReactivos";
import ChartComparativaNiveles, { ChartBarrasReactivosComparativa } from "@/app/components/ChartComparativaNiveles";
import FiltroZona from "@/app/components/FiltroZona";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import KpiNivelCard from "@/app/components/KpiNivelCard";
import EmptyState from "@/app/components/EmptyState";
import ComparativaLegend from "@/app/components/ComparativaLegend";
import BannerCobertura2026 from "@/app/components/BannerCobertura2026";
import KPIComparativa, { KPIComparativaResumen } from "@/app/components/KPIComparativa";
import { COLORS } from "@/types/raf";

const NUM_REACTIVOS = 12;

function useIsLgUp() {
  const [isLgUp, setIsLgUp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLgUp(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isLgUp;
}

interface Props {
  data: ResultadosMultiRAF;
  cobertura: { escuelasConDatos: number; escuelasTotales: number; totalAlumnos2026: number };
  isSuper: boolean;
  zonaForced?: number;
}

function filtrarZona(escuelas: EscuelaResumen[], zona: number | null) {
  if (zona == null) return escuelas;
  return escuelas.filter((e) => getZonaFromCct(e.cct) === zona);
}

export default function DashboardHomeClient({ data, cobertura, isSuper, zonaForced }: Props) {
  const isLgUp = useIsLgUp();
  const searchParams = useSearchParams();
  const evalMode = parseModoVista(searchParams.get("eval"));
  const zonaParam = searchParams.get("zona");
  const zonaFromUrl = zonaParam && ZONAS_DISPONIBLES.includes(parseInt(zonaParam, 10)) ? parseInt(zonaParam, 10) : null;
  const zonaSeleccionada = zonaForced ?? (isSuper ? zonaFromUrl : null);

  const escuelas2025 = useMemo(() => filtrarZona(getEscuelasForEval(data, EVALUACION_DESPEGUE_2025), zonaSeleccionada), [data, zonaSeleccionada]);
  const escuelas2026 = useMemo(() => filtrarZona(getEscuelasForEval(data, EVALUACION_ATERRIZAJE_2026), zonaSeleccionada), [data, zonaSeleccionada]);

  const escuelas = evalMode === "aterrizaje-2026" ? escuelas2026 : escuelas2025;
  const evalNombre = evalMode === "aterrizaje-2026" ? EVALUACIONES_META[EVALUACION_ATERRIZAJE_2026].nombre : EVALUACIONES_META[EVALUACION_DESPEGUE_2025].nombre;

  const navHref = (path: string) => appendNavParams(path, { evalMode, zona: zonaSeleccionada });

  const totalAlumnos = escuelas.reduce((s, e) => s + e.totalEstudiantes, 0);
  const totalReq = escuelas.reduce((s, e) => s + e.requiereApoyo, 0);
  const totalDes = escuelas.reduce((s, e) => s + e.enDesarrollo, 0);
  const totalEsp = escuelas.reduce((s, e) => s + e.esperado, 0);
  const pctReq = totalAlumnos ? Math.round((totalReq / totalAlumnos) * 100) : 0;
  const pctDes = totalAlumnos ? Math.round((totalDes / totalAlumnos) * 100) : 0;
  const pctEsp = totalAlumnos ? Math.round((totalEsp / totalAlumnos) * 100) : 0;

  const porcentajesGlobales = useMemo(() => porcentajesReactivosGlobales(escuelas, NUM_REACTIVOS), [escuelas]);
  const porcentajes2025 = useMemo(() => porcentajesReactivosGlobales(escuelas2025, NUM_REACTIVOS), [escuelas2025]);
  const porcentajes2026 = useMemo(() => porcentajesReactivosGlobales(escuelas2026, NUM_REACTIVOS), [escuelas2026]);

  const comparativa = useMemo(() => {
    const ccts = escuelas2025.map((e) => e.cct).filter((c) => escuelas2026.some((e) => e.cct === c));
    return agregarGlobal(data, ccts);
  }, [data, escuelas2025, escuelas2026]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden gap-1 animate-fade-in p-2 lg:gap-4 lg:p-0">
      <PageHeader
        belowLogoOnMobile={<SelectorEvaluacion compact />}
        centerContent={isSuper && zonaForced == null ? <FiltroZona isSuper={isSuper} /> : undefined}
      >
        <h1 className="page-title text-base lg:text-xl">RAF Matemáticas</h1>
        <p className="page-subtitle text-xs lg:text-sm">Secundarias Técnicas · SEC Sonora</p>
        <p className="page-subtitle text-xs lg:text-sm">Mtra. Martha Camargo</p>
      </PageHeader>

      <ScrollOnlyWhenNeeded className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
        {evalMode === "aterrizaje-2026" && (
          <div className="mb-2 shrink-0">
            <BannerCobertura2026
              escuelasConDatos={cobertura.escuelasConDatos}
              escuelasTotales={cobertura.escuelasTotales}
              totalAlumnos2026={cobertura.totalAlumnos2026}
            />
          </div>
        )}

        {escuelas.length === 0 && evalMode !== "comparar" ? (
          <EmptyState
            title={
              evalMode === "aterrizaje-2026"
                ? "Sin datos de Aterrizaje 2026"
                : zonaSeleccionada != null
                  ? `Sin escuelas en la Zona ${zonaSeleccionada}`
                  : "Sin datos cargados"
            }
            description={
              evalMode === "aterrizaje-2026"
                ? "Aún no hay resultados para esta selección."
                : "Prueba otra zona o evaluación."
            }
          />
        ) : (
          <>
            {evalMode === "comparar" ? (
              <>
                <section className="shrink-0 space-y-2">
                  <KPIComparativaResumen comparativa={comparativa} />
                  <ComparativaLegend />
                  <KPIComparativa comparativa={comparativa} />
                </section>
                <section className="card-ios my-2 rounded-2xl border border-border bg-card p-3 text-sm text-foreground/75">
                  Comparativa entre escuelas con datos en ambas evaluaciones
                  {zonaSeleccionada != null && ` · Zona ${zonaSeleccionada}`}
                </section>
              </>
            ) : (
              <div className="shrink-0">
                <section className="grid min-w-0 grid-cols-3 gap-2 lg:gap-4">
                  <KpiNivelCard
                    href={navHref("/por-nivel?nivel=REQUIERE_APOYO")}
                    count={totalReq}
                    label="Requieren apoyo"
                    pct={pctReq}
                    baseColor={COLORS.requiereApoyo}
                    variant="apoyo"
                  />
                  <KpiNivelCard
                    href={navHref("/por-nivel?nivel=EN_DESARROLLO")}
                    count={totalDes}
                    label="En desarrollo"
                    pct={pctDes}
                    baseColor={COLORS.enDesarrollo}
                    variant="desarrollo"
                  />
                  <KpiNivelCard
                    href={navHref("/por-nivel?nivel=ESPERADO")}
                    count={totalEsp}
                    label="Esperado"
                    pct={pctEsp}
                    baseColor={COLORS.esperado}
                    variant="esperado"
                  />
                </section>
                <section className="card-ios my-2 rounded-2xl border border-border bg-card p-3 lg:my-3 lg:p-4">
                  <p className="text-sm font-semibold lg:text-base">
                    <span className="tabular-nums">{totalAlumnos.toLocaleString("es-MX")}</span> alumnos evaluados ·{" "}
                    <span className="tabular-nums">{escuelas.length}</span> escuelas · {evalNombre}
                    {zonaSeleccionada != null && ` · Zona ${zonaSeleccionada}`}
                  </p>
                </section>
              </div>
            )}

            <section className="grid shrink-0 gap-2 lg:grid-cols-2 lg:gap-4">
              <Link href={navHref("/escuelas")} className="nav-link-card link-ios">
                Ver por escuela
                <span className="nav-link-card__arrow" aria-hidden>
                  →
                </span>
              </Link>
              <Link href={navHref("/por-nivel")} className="nav-link-card link-ios">
                Ver por nivel
                <span className="nav-link-card__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </section>

            <section className={isLgUp ? "grid min-h-0 flex-1 shrink-0 grid-cols-2 gap-4 pt-3" : "flex shrink-0 flex-col gap-3 pt-2"}>
              {evalMode === "comparar" ? (
                <>
                  <section className="chart-card flex min-h-[200px] flex-col p-3">
                    <ChartComparativaNiveles
                      fillHeight={isLgUp}
                      requiereApoyo2025={comparativa.despegue2025.requiereApoyo}
                      enDesarrollo2025={comparativa.despegue2025.enDesarrollo}
                      esperado2025={comparativa.despegue2025.esperado}
                      requiereApoyo2026={comparativa.aterrizaje2026.requiereApoyo}
                      enDesarrollo2026={comparativa.aterrizaje2026.enDesarrollo}
                      esperado2026={comparativa.aterrizaje2026.esperado}
                      title="Niveles: Despegue vs Aterrizaje"
                    />
                  </section>
                  <section className="chart-card flex min-h-[200px] flex-col p-3">
                    <ChartBarrasReactivosComparativa
                      fillHeight={isLgUp}
                      porcentajes2025={porcentajes2025}
                      porcentajes2026={porcentajes2026}
                      title="Aciertos por reactivo"
                    />
                  </section>
                </>
              ) : (
                <>
                  <section className={`chart-card flex flex-col p-3 ${isLgUp ? "min-h-0 flex-1" : ""}`}>
                    <ChartBarrasReactivos fillHeight={isLgUp} porcentajes={porcentajesGlobales} totalAlumnos={totalAlumnos} title="Aciertos por reactivo" />
                  </section>
                  <section className={`chart-card flex flex-col p-3 ${isLgUp ? "min-h-0 flex-1" : ""}`}>
                    <ChartPastelNiveles fillHeight={isLgUp} requiereApoyo={totalReq} enDesarrollo={totalDes} esperado={totalEsp} title="Por nivel" />
                  </section>
                </>
              )}
            </section>

            <p className="mt-1 shrink-0 text-[10px] text-foreground/50">
              Última actualización:{" "}
              {new Date(data.generado).toLocaleString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </p>
          </>
        )}
      </ScrollOnlyWhenNeeded>
    </div>
  );
}
