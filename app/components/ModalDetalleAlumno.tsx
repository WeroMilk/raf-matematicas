"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { AlumnoRAF, EvaluacionId } from "@/types/raf";
import { NIVEL_COLOR } from "@/types/raf";
import { EVALUACION_DESPEGUE_2025, EVALUACIONES_META } from "@/lib/evaluaciones";
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

interface Props {
  alumno: AlumnoRAF | null;
  cct?: string;
  evalId?: EvaluacionId;
  onClose: () => void;
}

export default function ModalDetalleAlumno({
  alumno,
  cct,
  evalId = EVALUACION_DESPEGUE_2025,
  onClose,
}: Props) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = alumno ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [alumno, handleClose]);

  if (!alumno) return null;

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
  const evalLabel = EVALUACIONES_META[evalId].nombreCorto;

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
            {alumno.nombre} {alumno.apellido}
            <span className="mt-0.5 block text-xs font-medium text-white/85">{evalLabel}</span>
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

        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-sm font-medium">
              {alumno.grupo}
            </span>
            {!sinExamen && (
              <span className="rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-sm font-semibold">
                {porcentajeCalculado}%
              </span>
            )}
            <span
              className="rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: NIVEL_COLOR[nivelCalculado] ?? "#757575" }}
            >
              {nivelCalculado === "REQUIERE APOYO" ? "Apoyo" : nivelCalculado === "EN DESARROLLO" ? "Desarrollo" : nivelCalculado === "ESPERADO" ? "Esperado" : nivelCalculado}
            </span>
            {cct && (
              <span className="rounded-full bg-[var(--fill-tertiary)] px-3 py-1 text-xs text-[var(--foreground)]/70">
                {cct}
              </span>
            )}
          </div>

          {sinExamen ? (
            <p className="text-sm text-[var(--foreground)]/80 italic">Sin datos de examen aplicado.</p>
          ) : (
            <>
              <div className="mb-4 rounded-xl border border-[var(--esperado)]/40 bg-[var(--esperado)]/8 px-4 py-3">
                <p className="text-sm font-semibold text-[var(--esperado)]">
                  {totalCorrectas} de {totalCalificados} correctas
                </p>
                <p className="text-xs text-[var(--foreground)]/70 mt-0.5">
                  {totalCalificados - totalCorrectas} incorrecta{totalCalificados - totalCorrectas !== 1 ? "s" : ""}
                </p>
                {!usaMarcas && usaPorcentajeOficial && (
                  <p className="text-[10px] text-[var(--foreground)]/60 mt-1.5 italic">
                    Porcentaje según calificación oficial del examen. Las ✓/✗ por reactivo muestran la opción marcada; para calificación exacta por ítem importa el Excel con columnas Mark.
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
                    porMarca != null
                      ? porMarca
                      : esRespuestaCorrecta(resp, correcta, formatoCX, sinResponder);
                  const esError = !esCorrecto && (porMarca != null || resp !== "-" && resp !== "");
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
                      {(esError || sinResponder) && <span className="text-sm font-bold text-[var(--requiere-apoyo)]">✗ {letraMostrar}</span>}
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
                          <span className="text-[var(--requiere-apoyo)]" title={e.marcadoDisplay === "?" ? "La fuente de datos no registra la opción seleccionada" : undefined}>
                            {e.marcadoDisplay}
                          </span>
                          {!usaMarcas && (
                            <>
                              <span>→</span>
                              <span className="text-[var(--esperado)] font-medium">{e.correcta}</span>
                            </>
                          )}
                          {info && (
                            <span className="text-[var(--foreground)]/60">({info.evalua})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <ModalCloseFooter onClose={handleClose} />
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
