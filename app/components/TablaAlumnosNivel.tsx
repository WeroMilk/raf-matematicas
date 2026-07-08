"use client";

import { useState, useMemo } from "react";
import type { NivelRAF, EvaluacionId, AlumnoComparativa } from "@/types/raf";
import type { AlumnoRAF } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025 } from "@/lib/evaluaciones";
import ModalDetalleAlumno from "@/app/components/ModalDetalleAlumno";
import { inicialesAlumno, colorNivel } from "@/lib/avatar";

type Row = {
  alumno: {
    nombre: string;
    apellido: string;
    grupo: string;
    porcentaje: number | null;
    nivel: NivelRAF;
    respuestas?: string[];
    porcentaje2025?: number | null;
    porcentaje2026?: number | null;
    deltaPorcentaje?: number | null;
    alumno2025?: AlumnoRAF | null;
    alumno2026?: AlumnoRAF | null;
  };
  cct: string;
};

interface Props {
  alumnosConCct: Row[];
  comparativa?: boolean;
  evalId?: EvaluacionId;
  layout?: "column" | "grid";
  fillHeight?: boolean;
  enlargedMobile?: boolean;
}

const TENDENCIA_COLOR: Record<string, string> = {
  mejoro: "#2E7D32",
  bajo: "#D32F2F",
  igual: "#757575",
  solo_2025: "#4472C4",
  solo_2026: "#2E7D32",
};

function deltaColor(delta: number | null | undefined): string {
  if (delta == null) return "#757575";
  if (delta > 0) return TENDENCIA_COLOR.mejoro;
  if (delta < 0) return TENDENCIA_COLOR.bajo;
  return TENDENCIA_COLOR.igual;
}

function formatearNombre(nombre: string, apellido: string): string {
  const cap = (s: string) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
      .join(" ");
  return `${cap(nombre)} ${cap(apellido)}`.trim();
}

function textoCambio(r: Row): { text: string; color: string } {
  if (r.alumno.deltaPorcentaje != null) {
    const d = r.alumno.deltaPorcentaje;
    return {
      text: `${d > 0 ? "+" : ""}${d}%`,
      color: deltaColor(d),
    };
  }
  if (r.alumno.porcentaje2026 == null) return { text: "Solo 2025", color: TENDENCIA_COLOR.solo_2025 };
  if (r.alumno.porcentaje2025 == null) return { text: "Solo 2026", color: TENDENCIA_COLOR.solo_2026 };
  return { text: "—", color: "#757575" };
}

export default function TablaAlumnosNivel({
  alumnosConCct,
  comparativa = false,
  evalId = EVALUACION_DESPEGUE_2025,
  layout = "column",
  fillHeight = false,
  enlargedMobile = false,
}: Props) {
  const [filtro, setFiltro] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<AlumnoRAF | null>(null);
  const [comparativaSeleccionada, setComparativaSeleccionada] = useState<AlumnoComparativa | null>(null);
  const [evalIdSeleccionado, setEvalIdSeleccionado] = useState<EvaluacionId>(evalId);
  const [vistaInicial, setVistaInicial] = useState<"comparar" | EvaluacionId>("comparar");
  const [cctSeleccionado, setCctSeleccionado] = useState<string | undefined>(undefined);

  const filtrados = useMemo(
    () =>
      filtro
        ? alumnosConCct.filter(
            (r) =>
              r.cct.toLowerCase().includes(filtro.toLowerCase()) ||
              `${r.alumno.nombre} ${r.alumno.apellido}`.toLowerCase().includes(filtro.toLowerCase())
          )
        : alumnosConCct,
    [alumnosConCct, filtro]
  );

  const total = filtrados.length;

  const abrirAlumno = (
    alumno: AlumnoRAF | null | undefined,
    cct: string,
    evalAlumno: EvaluacionId = evalId
  ) => {
    if (!alumno) return;
    setComparativaSeleccionada(null);
    setAlumnoSeleccionado(alumno);
    setEvalIdSeleccionado(evalAlumno);
    setVistaInicial(evalAlumno);
    setCctSeleccionado(cct);
  };

  const abrirComparativa = (r: Row, cct: string, vista: "comparar" | EvaluacionId = "comparar") => {
    setAlumnoSeleccionado(null);
    setComparativaSeleccionada({
      nombre: r.alumno.nombre,
      apellido: r.alumno.apellido,
      grupo: r.alumno.grupo,
      alumno2025: r.alumno.alumno2025 ?? null,
      alumno2026: r.alumno.alumno2026 ?? null,
      deltaPorcentaje: r.alumno.deltaPorcentaje ?? null,
      tendencia:
        !r.alumno.alumno2025 && r.alumno.alumno2026
          ? "solo_2026"
          : r.alumno.alumno2025 && !r.alumno.alumno2026
            ? "solo_2025"
            : r.alumno.deltaPorcentaje != null
              ? r.alumno.deltaPorcentaje > 0
                ? "mejoro"
                : r.alumno.deltaPorcentaje < 0
                  ? "bajo"
                  : "igual"
              : "igual",
    });
    setVistaInicial(vista);
    setCctSeleccionado(cct);
  };

  const fmtPct = (v: number | null | undefined) => (v != null ? `${v}%` : "—");

  const alumnoFallback = (r: Row): AlumnoRAF => ({
    nombre: r.alumno.nombre,
    apellido: r.alumno.apellido,
    grupo: r.alumno.grupo,
    porcentaje: r.alumno.porcentaje,
    nivel: r.alumno.nivel,
    respuestas: r.alumno.respuestas ?? [],
  });

  const listClass =
    layout === "grid"
      ? enlargedMobile
        ? "flex flex-col gap-3 pb-3 md:grid md:grid-cols-2 md:gap-2.5 xl:grid-cols-3"
        : "grid grid-cols-1 gap-2.5 pb-2 md:grid-cols-2 xl:grid-cols-3"
      : "flex flex-col gap-2.5 pb-2";

  const rootClass = fillHeight && !enlargedMobile
    ? "flex min-h-0 min-w-0 flex-1 flex-col max-w-full"
    : "flex min-h-0 min-w-0 flex-col max-w-full";

  const useCompactTable = layout === "column";

  return (
    <div className={rootClass}>
      <div className="mb-2 shrink-0">
        <input
          type="search"
          placeholder="Buscar alumno..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className={`w-full rounded-xl border border-border bg-background px-3 py-2 ${
            enlargedMobile ? "text-sm py-2.5" : "text-xs"
          }`}
        />
        {total > 0 && (
          <p className={`mt-1.5 text-foreground/50 ${enlargedMobile ? "text-xs" : "text-[11px]"}`}>
            {total.toLocaleString("es-MX")} alumnos
          </p>
        )}
      </div>

      {useCompactTable ? (
        <div
          className={`min-h-0 overflow-x-auto overflow-y-auto rounded-xl border border-border bg-card text-[11px] ${
            fillHeight && !enlargedMobile ? "flex-1" : ""
          }`}
        >
          <table className="w-full min-w-[420px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b bg-white">
                <th className="bg-white px-2 py-1.5 text-left font-semibold">Alumno</th>
                <th className="bg-white px-2 py-1.5 text-left font-semibold">Grupo</th>
                {comparativa ? (
                  <>
                    <th className="bg-white px-2 py-1.5 text-center font-semibold">% 2025</th>
                    <th className="bg-white px-2 py-1.5 text-center font-semibold">% 2026</th>
                    <th className="bg-white px-2 py-1.5 text-center font-semibold">Cambio</th>
                  </>
                ) : (
                  <th className="bg-white px-2 py-1.5 text-center font-semibold">%</th>
                )}
                <th className="bg-white px-2 py-1.5 text-left font-semibold">CCT</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r, i) => {
                const cambio = comparativa ? textoCambio(r) : null;
                const nombre = formatearNombre(r.alumno.nombre, r.alumno.apellido);
                return (
                  <tr
                    key={`${r.cct}-${r.alumno.nombre}-${r.alumno.apellido}-${i}`}
                    className="border-b border-border/60 hover:bg-[var(--fill-tertiary)]"
                  >
                    <td className="px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          comparativa
                            ? abrirComparativa(r, r.cct)
                            : abrirAlumno(alumnoFallback(r), r.cct, evalId)
                        }
                        className="text-left font-medium leading-snug underline decoration-dotted hover:opacity-80"
                      >
                        {nombre}
                      </button>
                    </td>
                    <td className="px-2 py-1.5 text-foreground/70">{r.alumno.grupo}</td>
                    {comparativa ? (
                      <>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => abrirComparativa(r, r.cct, EVALUACION_DESPEGUE_2025)}
                            className="font-semibold text-[#4472C4] hover:underline"
                          >
                            {fmtPct(r.alumno.porcentaje2025)}
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => abrirComparativa(r, r.cct, EVALUACION_ATERRIZAJE_2026)}
                            className="font-semibold text-[#2E7D32] hover:underline"
                          >
                            {fmtPct(r.alumno.porcentaje2026)}
                          </button>
                        </td>
                        <td className="px-2 py-1.5 text-center font-semibold" style={{ color: cambio?.color }}>
                          {cambio?.text}
                        </td>
                      </>
                    ) : (
                      <td className="px-2 py-1.5 text-center font-semibold">{fmtPct(r.alumno.porcentaje)}</td>
                    )}
                    <td className="px-2 py-1.5 text-[10px] text-foreground/50">{r.cct}</td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={comparativa ? 6 : 4} className="px-4 py-8 text-center text-sm text-foreground/50">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={fillHeight && !enlargedMobile ? "min-h-0 flex-1 overflow-y-auto overflow-x-hidden" : undefined}>
          <ul className={listClass}>
          {filtrados.map((r, i) => {
            const cambio = comparativa ? textoCambio(r) : null;
            return (
              <li
                key={`${r.cct}-${r.alumno.nombre}-${r.alumno.apellido}-${i}`}
                className={`rounded-xl border border-border bg-card shadow-sm ${
                  enlargedMobile ? "p-4" : "p-3"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    comparativa
                      ? abrirComparativa(r, r.cct)
                      : abrirAlumno(alumnoFallback(r), r.cct, evalId)
                  }
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`avatar-initial ${enlargedMobile ? "size-11 text-sm" : ""}`}
                    style={{ backgroundColor: colorNivel(r.alumno.nivel) }}
                    aria-hidden
                  >
                    {inicialesAlumno(r.alumno.nombre, r.alumno.apellido)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p
                      className={`font-semibold leading-snug text-foreground ${
                        enlargedMobile ? "text-base" : "text-sm"
                      }`}
                    >
                      {formatearNombre(r.alumno.nombre, r.alumno.apellido)}
                    </p>
                    <p className={`mt-0.5 text-foreground/55 ${enlargedMobile ? "text-sm" : "text-xs"}`}>
                      Grupo {r.alumno.grupo} · {r.cct}
                    </p>
                  </span>
                </button>
                {comparativa ? (
                  <div
                    className={`grid grid-cols-3 gap-2 border-t border-border/60 pt-3 ${
                      enlargedMobile ? "mt-3" : "mt-2.5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => abrirComparativa(r, r.cct, EVALUACION_DESPEGUE_2025)}
                      className={`rounded-lg bg-[#4472C4]/8 text-center ${enlargedMobile ? "px-2 py-2.5" : "px-1.5 py-1.5"}`}
                    >
                      <div className={`font-medium uppercase tracking-wide text-[#4472C4] ${enlargedMobile ? "text-[10px]" : "text-[9px]"}`}>2025</div>
                      <div className={`mt-0.5 font-bold text-foreground ${enlargedMobile ? "text-lg" : "text-sm"}`}>{fmtPct(r.alumno.porcentaje2025)}</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirComparativa(r, r.cct, EVALUACION_ATERRIZAJE_2026)}
                      className={`rounded-lg bg-[#2E7D32]/8 text-center ${enlargedMobile ? "px-2 py-2.5" : "px-1.5 py-1.5"}`}
                    >
                      <div className={`font-medium uppercase tracking-wide text-[#2E7D32] ${enlargedMobile ? "text-[10px]" : "text-[9px]"}`}>2026</div>
                      <div className={`mt-0.5 font-bold text-foreground ${enlargedMobile ? "text-lg" : "text-sm"}`}>{fmtPct(r.alumno.porcentaje2026)}</div>
                    </button>
                    <div className={`rounded-lg bg-[var(--fill-tertiary)] text-center ${enlargedMobile ? "px-2 py-2.5" : "px-1.5 py-1.5"}`}>
                      <div className={`font-medium uppercase tracking-wide text-foreground/50 ${enlargedMobile ? "text-[10px]" : "text-[9px]"}`}>Cambio</div>
                      <div className={`mt-0.5 font-bold ${enlargedMobile ? "text-lg" : "text-sm"}`} style={{ color: cambio?.color }}>
                        {cambio?.text}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-between border-t border-border/60 pt-3 ${enlargedMobile ? "mt-3" : "mt-2.5"}`}>
                    <span className={enlargedMobile ? "text-sm text-foreground/50" : "text-xs text-foreground/50"}>Porcentaje</span>
                    <span className={`font-bold text-foreground ${enlargedMobile ? "text-xl" : "text-base"}`}>{fmtPct(r.alumno.porcentaje)}</span>
                  </div>
                )}
              </li>
            );
          })}
          {filtrados.length === 0 && (
            <li className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-foreground/50">
              Sin resultados
            </li>
          )}
        </ul>
        </div>
      )}

      <ModalDetalleAlumno
        alumno={alumnoSeleccionado}
        comparativa={comparativaSeleccionada}
        evalId={evalIdSeleccionado}
        vistaInicial={vistaInicial}
        cct={cctSeleccionado}
        onClose={() => {
          setAlumnoSeleccionado(null);
          setComparativaSeleccionada(null);
          setCctSeleccionado(undefined);
        }}
      />
    </div>
  );
}
