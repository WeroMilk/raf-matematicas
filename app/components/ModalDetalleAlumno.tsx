"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import type { AlumnoRAF, AlumnoComparativa, EvaluacionId, TendenciaComparativa } from "@/types/raf";
import { NIVEL_COLOR } from "@/types/raf";
import {
  EVALUACION_ATERRIZAJE_2026,
  EVALUACION_DESPEGUE_2025,
  EVALUACIONES_META,
} from "@/lib/evaluaciones";
import { getReactivoInfo } from "@/lib/reactivos-matematicas";
import {
  calificarAlumno,
  esCorrectoPorMarca,
  esRespuestaCorrecta,
  NUM_REACTIVOS_MATEMATICAS,
  respuestaParaMostrar,
  usaFormatoCX,
} from "@/lib/calificar-respuestas";
import ModalCloseFooter from "./ModalCloseFooter";

type VistaModal = "comparar" | EvaluacionId;

interface Props {
  alumno?: AlumnoRAF | null;
  comparativa?: AlumnoComparativa | null;
  cct?: string;
  evalId?: EvaluacionId;
  vistaInicial?: VistaModal;
  onClose: () => void;
}

const TENDENCIA_LABEL: Record<TendenciaComparativa, { text: string; color: string }> = {
  mejoro: { text: "Mejoró", color: "#2E7D32" },
  bajo: { text: "Bajó", color: "#D32F2F" },
  igual: { text: "Igual", color: "#757575" },
  solo_2025: { text: "Solo Despegue 2025", color: "#4472C4" },
  solo_2026: { text: "Solo Aterrizaje 2026", color: "#2E7D32" },
};

function nivelCorto(nivel: string): string {
  if (nivel === "REQUIERE APOYO") return "Apoyo";
  if (nivel === "EN DESARROLLO") return "Desarrollo";
  if (nivel === "ESPERADO") return "Esperado";
  return nivel;
}

function inferirTendencia(row: AlumnoComparativa): TendenciaComparativa {
  if (row.tendencia) return row.tendencia;
  if (!row.alumno2025 && row.alumno2026) return "solo_2026";
  if (row.alumno2025 && !row.alumno2026) return "solo_2025";
  const d = row.deltaPorcentaje;
  if (d == null) return "igual";
  if (d > 0) return "mejoro";
  if (d < 0) return "bajo";
  return "igual";
}

function ContenidoExamen({ alumno, evalId }: { alumno: AlumnoRAF; evalId: EvaluacionId }) {
  const respuestas = alumno.respuestas ?? [];
  const marcas = alumno.marcas ?? [];
  const {
    errores,
    totalCorrectas,
    totalCalificados,
    sinExamen,
    porcentaje: porcentajeCalculado,
    nivel: nivelCalculado,
    usaMarcas,
    usaPorcentajeOficial,
  } = calificarAlumno(alumno, evalId);
  const formatoCX = usaFormatoCX(respuestas);

  if (sinExamen) {
    return <p className="text-sm text-[var(--foreground)]/80 italic">Sin datos de examen aplicado.</p>;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {!sinExamen && (
          <span className="rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-sm font-semibold">
            {porcentajeCalculado}%
          </span>
        )}
        <span
          className="rounded-full px-3 py-1 text-sm font-medium text-white"
          style={{ backgroundColor: NIVEL_COLOR[nivelCalculado] ?? "#757575" }}
        >
          {nivelCorto(nivelCalculado)}
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-[var(--esperado)]/40 bg-[var(--esperado)]/8 px-4 py-3">
        <p className="text-sm font-semibold text-[var(--esperado)]">
          {totalCorrectas} de {totalCalificados} correctas
        </p>
        <p className="text-xs text-[var(--foreground)]/70 mt-0.5">
          {totalCalificados - totalCorrectas} incorrecta{totalCalificados - totalCorrectas !== 1 ? "s" : ""}
        </p>
        {!usaMarcas && usaPorcentajeOficial && (
          <p className="text-[10px] text-[var(--foreground)]/60 mt-1.5 italic">
            Porcentaje según calificación oficial del examen. Las ✓/✗ por reactivo muestran la opción marcada; para
            calificación exacta por ítem importa el Excel con columnas Mark.
          </p>
        )}
      </div>

      <p className="mb-2 text-xs font-semibold text-[var(--foreground)]/80">Reactivos</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
        {Array.from({ length: NUM_REACTIVOS_MATEMATICAS }, (_, i) => {
          const num = i + 1;
          const resp = (respuestas[i] ?? "-").toUpperCase().trim();
          const info = getReactivoInfo(num, evalId);
          const correcta = info?.respuestaCorrecta ?? "";
          const sinResponder = resp === "-" || resp === "";
          const porMarca = esCorrectoPorMarca(marcas[i]);
          const esCorrecto =
            porMarca != null ? porMarca : esRespuestaCorrecta(resp, correcta, formatoCX, sinResponder);
          const esError = !esCorrecto && (porMarca != null || (resp !== "-" && resp !== ""));
          const letraMostrar = esCorrecto
            ? porMarca != null && /^[ABCD]$/.test(resp)
              ? resp
              : correcta
            : esError
              ? respuestaParaMostrar(resp, correcta, false, false)
              : sinResponder
                ? "X?"
                : null;

          return (
            <div
              key={num}
              className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2 text-center ${
                esCorrecto
                  ? "border-[var(--esperado)] bg-[var(--esperado)]/15"
                  : esError || sinResponder
                    ? "border-[var(--requiere-apoyo)] bg-[var(--requiere-apoyo)]/10"
                    : "border-[var(--border)] bg-[var(--fill-tertiary)]/50"
              }`}
              title={
                info
                  ? `R${num}: ${info.evalua} - ${esCorrecto ? `Correcto${porMarca != null && /^[ABCD]$/.test(resp) ? ` (${resp})` : ` (${correcta})`}` : sinResponder ? "Sin responder" : `Marcó ${letraMostrar}${!usaMarcas ? `, correcta ${correcta}` : ""}`}`
                  : ""
              }
            >
              <span className="text-[10px] font-medium text-[var(--foreground)]/70">R{num}</span>
              {esCorrecto && <span className="text-sm font-bold text-[var(--esperado)]">✓ {letraMostrar}</span>}
              {(esError || sinResponder) && (
                <span className="text-sm font-bold text-[var(--requiere-apoyo)]">✗ {letraMostrar}</span>
              )}
            </div>
          );
        })}
      </div>

      {errores.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--fill-tertiary)]/30 px-4 py-3">
          <p className="text-xs font-semibold text-[var(--foreground)]/80 mb-2">Errores (Reactivo · marcó · correcta)</p>
          {(errores.some((e) => e.marcadoDisplay === "?") || errores.some((e) => e.marcadoDisplay === "X?")) && (
            <p className="text-[10px] text-[var(--foreground)]/60 mb-1.5 italic">
              X? = sin responder · ? = la fuente no registra la opción
            </p>
          )}
          <div className="space-y-1">
            {errores.map((e) => {
              const info = getReactivoInfo(e.num, evalId);
              return (
                <div key={e.num} className="flex items-center gap-2 text-xs">
                  <span className="font-medium">R{e.num}:</span>
                  <span
                    className="text-[var(--requiere-apoyo)]"
                    title={e.marcadoDisplay === "?" ? "La fuente de datos no registra la opción seleccionada" : undefined}
                  >
                    {e.marcadoDisplay}
                  </span>
                  {!usaMarcas && (
                    <>
                      <span>→</span>
                      <span className="text-[var(--esperado)] font-medium">{e.correcta}</span>
                    </>
                  )}
                  {info && <span className="text-[var(--foreground)]/60">({info.evalua})</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function TarjetaResumenExamen({
  evalId,
  alumno,
  onVer,
}: {
  evalId: EvaluacionId;
  alumno: AlumnoRAF | null;
  onVer: () => void;
}) {
  const meta = EVALUACIONES_META[evalId];
  const { sinExamen, porcentaje, nivel } = alumno
    ? calificarAlumno(alumno, evalId)
    : { sinExamen: true, porcentaje: null, nivel: "SIN EXAMEN" as const };

  return (
    <button
      type="button"
      onClick={onVer}
      disabled={!alumno || sinExamen}
      className="rounded-xl border border-[var(--border)] bg-[var(--fill-tertiary)]/40 p-3 text-left transition hover:bg-[var(--fill-tertiary)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <p className="text-xs font-semibold" style={{ color: meta.color }}>
        {meta.nombreCorto}
      </p>
      {alumno && !sinExamen ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold">{porcentaje}%</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: NIVEL_COLOR[nivel] ?? "#757575" }}
          >
            {nivelCorto(nivel)}
          </span>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--foreground)]/50">Sin examen</p>
      )}
      {alumno && !sinExamen && (
        <p className="mt-2 text-[10px] font-medium text-[var(--primary)] underline decoration-dotted">Ver examen →</p>
      )}
    </button>
  );
}

function ContenidoComparativa({
  row,
  onVerExamen,
}: {
  row: AlumnoComparativa;
  onVerExamen: (evalId: EvaluacionId) => void;
}) {
  const tend = TENDENCIA_LABEL[inferirTendencia(row)];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--fill-tertiary)]/30 px-4 py-3 text-center">
        <p className="text-xs font-medium text-[var(--foreground)]/70">Cambio entre evaluaciones</p>
        <p className="mt-1 text-base font-bold" style={{ color: tend.color }}>
          {tend.text}
          {row.deltaPorcentaje != null && row.tendencia !== "solo_2025" && row.tendencia !== "solo_2026"
            ? ` (${row.deltaPorcentaje > 0 ? "+" : ""}${row.deltaPorcentaje}%)`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TarjetaResumenExamen
          evalId={EVALUACION_DESPEGUE_2025}
          alumno={row.alumno2025}
          onVer={() => onVerExamen(EVALUACION_DESPEGUE_2025)}
        />
        <TarjetaResumenExamen
          evalId={EVALUACION_ATERRIZAJE_2026}
          alumno={row.alumno2026}
          onVer={() => onVerExamen(EVALUACION_ATERRIZAJE_2026)}
        />
      </div>
    </div>
  );
}

export default function ModalDetalleAlumno({
  alumno = null,
  comparativa = null,
  cct,
  evalId = EVALUACION_DESPEGUE_2025,
  vistaInicial,
  onClose,
}: Props) {
  const abierto = Boolean(alumno || comparativa);
  const alumno2025 = comparativa?.alumno2025 ?? (evalId === EVALUACION_DESPEGUE_2025 ? alumno : null);
  const alumno2026 = comparativa?.alumno2026 ?? (evalId === EVALUACION_ATERRIZAJE_2026 ? alumno : null);
  const tieneComparativa = Boolean(comparativa || (alumno2025 && alumno2026));
  const vistaDefault: VistaModal =
    vistaInicial ?? (comparativa ? "comparar" : tieneComparativa ? "comparar" : evalId);

  const [vista, setVista] = useState<VistaModal>(vistaDefault);

  useEffect(() => {
    if (abierto) setVista(vistaDefault);
  }, [abierto, vistaDefault]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [abierto, handleClose]);

  if (!abierto) return null;

  const ref = comparativa
    ? { nombre: comparativa.nombre, apellido: comparativa.apellido, grupo: comparativa.grupo }
    : alumno!;
  const alumnoActivo =
    vista === EVALUACION_DESPEGUE_2025
      ? alumno2025
      : vista === EVALUACION_ATERRIZAJE_2026
        ? alumno2026
        : null;
  const subtitulo =
    vista === "comparar"
      ? "Comparativa 2025 vs 2026"
      : EVALUACIONES_META[vista].nombreCorto;

  const tabs = [
    {
      id: "comparar" as const,
      label: "Comparativa",
      color: "#7B2D3E",
      show: Boolean(comparativa || (alumno2025 && alumno2026)),
    },
    {
      id: EVALUACION_DESPEGUE_2025,
      label: "Despegue",
      color: EVALUACIONES_META[EVALUACION_DESPEGUE_2025].color,
      show: Boolean(alumno2025),
    },
    {
      id: EVALUACION_ATERRIZAJE_2026,
      label: "Aterrizaje",
      color: EVALUACIONES_META[EVALUACION_ATERRIZAJE_2026].color,
      show: Boolean(alumno2026),
    },
  ].filter((t) => t.show);

  const mostrarTabs = tabs.length > 1;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-alumno-titulo"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative flex w-full max-h-[90vh] max-w-lg flex-col overflow-hidden rounded-2xl bg-[var(--card)] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ background: "linear-gradient(135deg, #7B2D3E 0%, #9B3D4E 100%)" }}
        >
          <h2 id="modal-alumno-titulo" className="text-lg font-semibold">
            {ref.nombre} {ref.apellido}
            <span className="mt-0.5 block text-xs font-medium text-white/85">{subtitulo}</span>
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="touch-target -mr-2 flex h-10 w-10 min-w-[44px] min-h-[44px] items-center justify-center rounded-full text-white/90 transition hover:bg-white/20 active:bg-white/30 cursor-pointer"
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mostrarTabs && (
          <div className="flex shrink-0 gap-1 border-b border-[var(--border)] bg-[var(--fill-tertiary)]/40 px-3 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setVista(tab.id)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                  vista === tab.id
                    ? "bg-white text-[var(--foreground)] shadow-sm"
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                }`}
                style={vista === tab.id ? { color: tab.color } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-sm font-medium">{ref.grupo}</span>
            {cct && (
              <span className="rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-xs text-[var(--foreground)]/70">
                {cct}
              </span>
            )}
          </div>

          {vista === "comparar" && comparativa ? (
            <ContenidoComparativa row={comparativa} onVerExamen={setVista} />
          ) : vista === "comparar" && alumno2025 && alumno2026 ? (
            <ContenidoComparativa
              row={{
                nombre: ref.nombre,
                apellido: ref.apellido,
                grupo: ref.grupo,
                alumno2025,
                alumno2026,
                deltaPorcentaje:
                  alumno2025.porcentaje != null && alumno2026.porcentaje != null
                    ? alumno2026.porcentaje - alumno2025.porcentaje
                    : null,
                tendencia: "igual",
              }}
              onVerExamen={setVista}
            />
          ) : alumnoActivo ? (
            <ContenidoExamen alumno={alumnoActivo} evalId={vista as EvaluacionId} />
          ) : (
            <p className="text-sm text-[var(--foreground)]/80 italic">Sin datos para esta evaluación.</p>
          )}
        </div>
        <ModalCloseFooter onClose={handleClose} />
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
