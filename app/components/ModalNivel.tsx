"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { NivelRAFInfo } from "@/lib/niveles-raf";
import ModalCloseFooter from "./ModalCloseFooter";

export interface DetalleNivelModal {
  info: NivelRAFInfo;
  cantidad: number;
  porcentaje: number;
  total: number;
}

interface Props {
  detalle: DetalleNivelModal | null;
  onClose: () => void;
}

export default function ModalNivel({ detalle, onClose }: Props) {
  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = detalle ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [detalle, handleClose]);

  if (!detalle) return null;

  const { info, cantidad, porcentaje, total } = detalle;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-nivel-titulo"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="relative flex w-full max-h-[90vh] max-w-lg flex-col overflow-hidden rounded-2xl bg-[var(--card)] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${info.color} 0%, color-mix(in srgb, ${info.color} 75%, black) 100%)` }}
        >
          <h2 id="modal-nivel-titulo" className="text-lg font-semibold">
            {info.label}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="touch-target -mr-2 flex h-10 w-10 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full text-white/90 transition hover:bg-white/20 active:bg-white/30"
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto px-5 py-4">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--fill-tertiary)]/40 px-4 py-3">
              <p className="text-xs font-medium text-[var(--foreground)]/70">Alumnos</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--foreground)]">
                {cantidad.toLocaleString("es-MX")}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--fill-tertiary)]/40 px-4 py-3">
              <p className="text-xs font-medium text-[var(--foreground)]/70">Del total</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums" style={{ color: info.color }}>
                {porcentaje}%
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--fill-tertiary)]/30 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/70">Orientación</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)] italic">{info.orientacion}</p>
          </div>

          <p className="mt-4 text-center text-xs text-[var(--foreground)]/55">
            {cantidad.toLocaleString("es-MX")} de {total.toLocaleString("es-MX")} alumnos evaluados
          </p>
        </div>
        <ModalCloseFooter onClose={handleClose} />
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
