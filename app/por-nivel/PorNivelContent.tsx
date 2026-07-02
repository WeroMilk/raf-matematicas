"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { NivelRAF } from "@/types/raf";
import { NIVELES_CON_EXAMEN, NIVEL_COLOR } from "@/types/raf";
import { parseModoVista } from "@/lib/evaluaciones";
import { appendNavParams } from "@/lib/evaluacion-url";
import TablaAlumnosNivel from "@/app/components/TablaAlumnosNivel";
import DropdownIos from "@/app/components/DropdownIos";

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
  evalMode?: "despegue-2025" | "aterrizaje-2026" | "comparar";
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
  const zonaParam = searchParams.get("zona");
  const zonaNum = zonaParam ? parseInt(zonaParam, 10) : null;

  const irANivel = (nivel: NivelesConExamen) => {
    const href = appendNavParams(`/por-nivel?nivel=${NIVEL_TO_PARAM[nivel]}`, {
      evalMode: evalModeFromUrl,
      zona: Number.isFinite(zonaNum) ? zonaNum : null,
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
        evalMode === "comparar" && alumnosPorNivel2026
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
            className="shrink-0 rounded-t-2xl px-3 py-2.5 text-sm font-semibold text-white"
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
              comparativa={evalMode === "comparar"}
              layout={expandedNivel ? "grid" : "column"}
              fillHeight={fillHeight}
            />
          </div>
        </section>
      );
    });

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 pb-2 animate-fade-in overflow-hidden">
      <section className="card-ios shrink-0 space-y-2.5 rounded-2xl border border-border bg-card p-3 max-lg:space-y-3">
        <div className="flex flex-col gap-2 max-lg:gap-2.5 lg:flex-row lg:flex-wrap lg:items-center">
          {!soloCct && (
            <>
              <label className="text-xs font-semibold lg:shrink-0">Organizar por:</label>
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
                className="lg:w-auto lg:min-w-[160px]"
              />

              {viewMode === "escuela" && (
                <DropdownIos
                  options={escuelaOptions}
                  value={selectedCct}
                  onChange={setSelectedCct}
                  placeholder="Selecciona escuela"
                  title="Seleccionar escuela"
                  ariaLabel="Seleccionar escuela"
                  className="lg:w-auto lg:min-w-[160px]"
                  minPanelWidth={240}
                />
              )}

              {viewMode === "grupo" && (
                <DropdownIos
                  options={grupoOptionsList}
                  value={selectedGrupo}
                  onChange={setSelectedGrupo}
                  placeholder="Selecciona grupo"
                  title="Seleccionar grupo"
                  ariaLabel="Seleccionar grupo"
                  className="lg:w-auto lg:min-w-[180px]"
                  minPanelWidth={280}
                />
              )}
            </>
          )}
          {soloCct && <span className="text-xs text-foreground/70">Solo tu escuela: {soloCct}</span>}
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
          <label className="text-xs font-semibold lg:shrink-0">Ordenar %:</label>
          <DropdownIos
            options={[...SORT_OPTIONS]}
            value={sortOrder}
            onChange={(next) => setSortOrder(next as SortOrder)}
            title="Ordenar porcentaje"
            ariaLabel="Ordenar porcentaje"
            className="lg:w-auto lg:min-w-[220px]"
            minPanelWidth={260}
          />
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
                      {evalMode === "comparar" && alumnosPorNivel2026 ? (
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
            <div className="por-nivel-expandido flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pb-4 md:hidden">
              {renderListasNivel(false)}
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
