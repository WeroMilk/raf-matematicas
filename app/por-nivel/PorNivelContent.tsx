"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { NivelRAF, ModoVista } from "@/types/raf";
import { NIVELES_CON_EXAMEN, NIVEL_COLOR } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, parseModoVista } from "@/lib/evaluaciones";
import { appendNavParams } from "@/lib/evaluacion-url";
import TablaAlumnosNivel from "@/app/components/TablaAlumnosNivel";
import DropdownIos from "@/app/components/DropdownIos";
import FiltroZona from "@/app/components/FiltroZona";

export type RowNivel = {
  alumno: { nombre: string; apellido: string; grupo: string; porcentaje: number | null; nivel: NivelRAF; respuestas?: string[] };
  cct: string;
};

type ViewMode = "todos" | "escuela" | "grupo";
type SortOrder = "asc" | "desc";

type GrupoOption = { cct: string; grupo: string; label: string };

type NivelesConExamen = "REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO";

interface Props {
  alumnosPorNivel: Record<NivelesConExamen, RowNivel[]>;
  alumnosPorNivel2026?: Record<NivelesConExamen, RowNivel[]>;
  escuelas: { cct: string }[];
  gruposOptions: GrupoOption[];
  nivelFiltro?: NivelRAF | null;
  soloCct?: string;
  initialGrupo?: string;
  evalMode?: ModoVista;
  isSuper?: boolean;
  zonaForced?: number;
}

const NIVEL_TO_PARAM: Record<NivelesConExamen, string> = {
  "REQUIERE APOYO": "REQUIERE_APOYO",
  "EN DESARROLLO": "EN_DESARROLLO",
  ESPERADO: "ESPERADO",
};

const VIEW_MODE_OPTIONS = [
  { value: "todos", label: "Todas las escuelas" },
  { value: "escuela", label: "Por escuela" },
  { value: "grupo", label: "Por grupo" },
] as const;

const SORT_OPTIONS = [
  { value: "desc", label: "Descendente (mayor a menor)" },
  { value: "asc", label: "Ascendente (menor a mayor)" },
] as const;

export default function PorNivelContent({
  alumnosPorNivel,
  alumnosPorNivel2026,
  escuelas,
  gruposOptions,
  nivelFiltro = null,
  soloCct,
  initialGrupo = "",
  evalMode = "despegue-2025",
  isSuper = false,
  zonaForced,
}: Props) {
  const grupoValido =
    initialGrupo &&
    gruposOptions.some(
      (o) => `${o.cct}|${o.grupo}` === initialGrupo
    );
  const [viewMode, setViewMode] = useState<ViewMode>(
    grupoValido ? "grupo" : soloCct ? "escuela" : "todos"
  );
  const [selectedCct, setSelectedCct] = useState(soloCct ?? "");
  const [selectedGrupo, setSelectedGrupo] = useState(grupoValido ? initialGrupo : "");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const router = useRouter();
  const searchParams = useSearchParams();
  const evalModeFromUrl = parseModoVista(searchParams.get("eval"));
  const evalModeLista =
    evalModeFromUrl === "resultados" ? "despegue-2025" : evalModeFromUrl;
  const esComparativa = evalModeFromUrl === "comparar";
  const evalIdLista =
    evalModeLista === "aterrizaje-2026" ? EVALUACION_ATERRIZAJE_2026 : EVALUACION_DESPEGUE_2025;
  const zonaParam = searchParams.get("zona");
  const zonaNum = zonaParam ? parseInt(zonaParam, 10) : null;
  const returnTo = searchParams.get("from");

  const irANivel = (nivel: NivelesConExamen) => {
    const href = appendNavParams(`/por-nivel?nivel=${NIVEL_TO_PARAM[nivel]}`, {
      evalMode: evalModeFromUrl,
      zona: Number.isFinite(zonaNum) ? zonaNum : null,
      from: returnTo,
    });
    setExpandedNivel(nivel);
    router.push(href);
  };

  const filterRow = (r: RowNivel) => {
    if (viewMode === "todos") return true;
    if (viewMode === "escuela") return r.cct === selectedCct;
    if (viewMode === "grupo") {
      const [cct, grupo] = selectedGrupo.split("|");
      return r.cct === cct && r.alumno.grupo === grupo;
    }
    return true;
  };

  const dataPorNivel = useMemo(() => {
    const sortRows = (rows: RowNivel[]) =>
      [...rows].sort((a, b) => {
        const pa = a.alumno.porcentaje ?? 0;
        const pb = b.alumno.porcentaje ?? 0;
        return sortOrder === "asc" ? pa - pb : pb - pa;
      });
    const out: Record<NivelesConExamen, RowNivel[]> = {
      "REQUIERE APOYO": [],
      "EN DESARROLLO": [],
      ESPERADO: [],
    };
    for (const nivel of NIVELES_CON_EXAMEN) {
      const filtered = alumnosPorNivel[nivel].filter(filterRow);
      out[nivel] = sortRows(filtered);
    }
    return out;
  }, [alumnosPorNivel, viewMode, selectedCct, selectedGrupo, sortOrder]);

  const conteosPorNivel = useMemo(() => {
    const out: Record<NivelesConExamen, { n2025: number; n2026: number }> = {
      "REQUIERE APOYO": { n2025: 0, n2026: 0 },
      "EN DESARROLLO": { n2025: 0, n2026: 0 },
      ESPERADO: { n2025: 0, n2026: 0 },
    };
    for (const nivel of NIVELES_CON_EXAMEN) {
      out[nivel].n2025 = alumnosPorNivel[nivel].filter(filterRow).length;
      out[nivel].n2026 = alumnosPorNivel2026?.[nivel]?.filter(filterRow).length ?? 0;
    }
    return out;
  }, [alumnosPorNivel, alumnosPorNivel2026, viewMode, selectedCct, selectedGrupo]);

  const escuelaOptions = useMemo(
    () => [{ value: "", label: "Selecciona escuela" }, ...escuelas.map((e) => ({ value: e.cct, label: e.cct }))],
    [escuelas]
  );

  const grupoOptionsList = useMemo(
    () => [{ value: "", label: "Selecciona grupo" }, ...gruposOptions.map((opt) => ({ value: `${opt.cct}|${opt.grupo}`, label: opt.label }))],
    [gruposOptions]
  );

  const [expandedNivel, setExpandedNivel] = useState<NivelRAF | null>(nivelFiltro);
  useEffect(() => {
    setExpandedNivel(nivelFiltro);
  }, [nivelFiltro]);
  const nivelesAMostrar: NivelesConExamen[] = expandedNivel && NIVELES_CON_EXAMEN.includes(expandedNivel as NivelesConExamen)
    ? [expandedNivel as NivelesConExamen]
    : NIVELES_CON_EXAMEN;

  const renderListasNivel = (fillHeight: boolean) =>
    nivelesAMostrar.map((nivel) => {
      const alumnos = dataPorNivel[nivel];
      const color = NIVEL_COLOR[nivel];
      const label =
        nivel === "REQUIERE APOYO"
          ? "Requieren apoyo"
          : nivel === "EN DESARROLLO"
            ? "En desarrollo"
            : "Esperado";
      const conteos = conteosPorNivel[nivel];
      const tituloConteo =
        esComparativa && alumnosPorNivel2026
          ? `${label} · 2025: ${conteos.n2025} · 2026: ${conteos.n2026}`
          : `${label} (${alumnos.length})`;

      return (
        <section
          key={nivel}
          className={`card-ios flex flex-col overflow-hidden rounded-2xl border border-border bg-card ${
            fillHeight ? "min-h-0 flex-1" : ""
          }`}
        >
          <h2
            className="shrink-0 rounded-t-2xl px-3 py-2.5 text-sm font-semibold text-white max-md:px-4 max-md:py-3 max-md:text-base"
            style={{ backgroundColor: color }}
          >
            {tituloConteo}
          </h2>
          <div
            className={`lista-expandida-por-nivel flex flex-col p-2 ${
              fillHeight ? "min-h-0 flex-1" : "por-nivel-lista-scroll-movil"
            }`}
          >
            <TablaAlumnosNivel
              alumnosConCct={alumnos}
              comparativa={esComparativa}
              evalId={evalIdLista}
              layout={expandedNivel ? "grid" : "column"}
              fillHeight={fillHeight}
              enlargedMobile={!!expandedNivel}
            />
          </div>
        </section>
      );
    });

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 pb-2 animate-fade-in overflow-hidden">
      <section className="card-ios shrink-0 rounded-2xl border border-border bg-card p-2.5 lg:p-3">
        <div className="por-nivel-filtros flex min-w-0 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          {!soloCct && (
            <>
              {isSuper && zonaForced == null && (
                <div className="w-full min-w-0 sm:w-[160px] sm:shrink-0">
                  <FiltroZona isSuper={isSuper} className="max-w-none" />
                </div>
              )}
              <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-semibold sm:whitespace-nowrap">Organizar por:</span>
                <div className="w-full min-w-0 sm:w-[160px] sm:shrink-0">
                  <DropdownIos
                    options={[...VIEW_MODE_OPTIONS]}
                    value={viewMode}
                    onChange={(next) => {
                      setViewMode(next as ViewMode);
                      if (next !== "escuela") setSelectedCct("");
                      if (next !== "grupo") setSelectedGrupo("");
                    }}
                    title="Organizar por"
                    ariaLabel="Organizar por"
                  />
                </div>
              </div>

              {viewMode === "escuela" && (
                <div className="w-full min-w-0 sm:w-[160px] sm:shrink-0">
                  <DropdownIos
                    options={escuelaOptions}
                    value={selectedCct}
                    onChange={setSelectedCct}
                    placeholder="Selecciona escuela"
                    title="Seleccionar escuela"
                    ariaLabel="Seleccionar escuela"
                    minPanelWidth={240}
                  />
                </div>
              )}

              {viewMode === "grupo" && (
                <div className="w-full min-w-0 sm:w-[180px] sm:shrink-0">
                  <DropdownIos
                    options={grupoOptionsList}
                    value={selectedGrupo}
                    onChange={setSelectedGrupo}
                    placeholder="Selecciona grupo"
                    title="Seleccionar grupo"
                    ariaLabel="Seleccionar grupo"
                    minPanelWidth={280}
                  />
                </div>
              )}
            </>
          )}
          {soloCct && <span className="shrink-0 text-xs text-foreground/70 sm:whitespace-nowrap">Solo tu escuela: {soloCct}</span>}

          <div className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-2">
            <label className="text-xs font-semibold sm:whitespace-nowrap">Ordenar %:</label>
            <div className="w-full min-w-0 sm:w-[220px] sm:shrink-0">
              <DropdownIos
                options={[...SORT_OPTIONS]}
                value={sortOrder}
                onChange={(next) => setSortOrder(next as SortOrder)}
                title="Ordenar porcentaje"
                ariaLabel="Ordenar porcentaje"
                minPanelWidth={260}
              />
            </div>
          </div>
        </div>
      </section>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-2 overflow-hidden ${
          !expandedNivel ? "max-md:overflow-y-auto por-nivel-cards-stack" : ""
        }`}
      >
        {/* Móvil colapsado: tarjetas resumen */}
        {!expandedNivel && (
          <div className="flex flex-col gap-2 md:hidden">
            {NIVELES_CON_EXAMEN.map((nivel) => {
              const conteos = conteosPorNivel[nivel];
              const color = NIVEL_COLOR[nivel];
              const label =
                nivel === "REQUIERE APOYO"
                  ? "Requieren apoyo"
                  : nivel === "EN DESARROLLO"
                    ? "En desarrollo"
                    : "Esperado";
              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => irANivel(nivel)}
                  className="por-nivel-resumen-card card-ios flex w-full items-stretch overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-transform active:scale-[0.99]"
                >
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: color }} aria-hidden />
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      {esComparativa && alumnosPorNivel2026 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#4472C4]/12 px-2.5 py-1 text-[11px] font-medium text-[#4472C4]">
                            2025: {conteos.n2025.toLocaleString("es-MX")}
                          </span>
                          <span className="rounded-full bg-[#2E7D32]/12 px-2.5 py-1 text-[11px] font-medium text-[#2E7D32]">
                            2026: {conteos.n2026.toLocaleString("es-MX")}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-foreground/60">
                          {dataPorNivel[nivel].length.toLocaleString("es-MX")} alumnos
                        </p>
                      )}
                      <p className="mt-2 text-[11px] font-medium text-foreground/45">Toca para ver la lista</p>
                    </div>
                    <svg className="size-5 shrink-0 text-foreground/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Listas completas: escritorio (3 columnas) o nivel expandido */}
        {expandedNivel ? (
          <>
            <div className="por-nivel-expandido flex min-h-0 flex-1 flex-col overflow-hidden md:hidden">
              {renderListasNivel(true)}
            </div>
            <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
              {renderListasNivel(true)}
            </div>
          </>
        ) : (
          <div className="por-nivel-desktop-grid hidden min-h-0 flex-1 md:grid md:grid-cols-3 md:gap-3">
            {renderListasNivel(true)}
          </div>
        )}
      </div>
    </div>
  );
}
