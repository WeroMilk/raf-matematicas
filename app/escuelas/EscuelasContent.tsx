"use client";

import { useState, useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NIVEL_COLOR } from "@/types/raf";
import type { CoberturaEscuela, EscuelaResumen } from "@/types/raf";
import { parseModoVista } from "@/lib/evaluaciones";
import { appendNavParams } from "@/lib/evaluacion-url";
import { tendenciaEscuela } from "@/lib/comparativa";
import { nombreEscuela } from "@/lib/nombres-escuelas";
import type { ResultadosMultiRAF } from "@/types/raf";

type SortOption = "numero-asc" | "numero-desc" | "categoria";

function getNivel(escuela: EscuelaResumen): "REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO" {
  const total = escuela.requiereApoyo + escuela.enDesarrollo + escuela.esperado;
  if (total === 0) return "REQUIERE APOYO";
  if (escuela.requiereApoyo / total > 0.5) return "REQUIERE APOYO";
  if (escuela.esperado / total >= 0.5) return "ESPERADO";
  return "EN DESARROLLO";
}

const CATEGORIA_ORDER = { "REQUIERE APOYO": 0, "EN DESARROLLO": 1, ESPERADO: 2 };

interface Props {
  escuelas: EscuelaResumen[];
  coberturas?: CoberturaEscuela[];
  dataMulti?: ResultadosMultiRAF;
}

function badgeCobertura(c?: CoberturaEscuela) {
  if (!c || c.alumnos2026 === 0) return { label: "Sin 2026", color: "#757575" };
  if (c.cobertura === "completo") return { label: "Completo", color: "#2E7D32" };
  return { label: `Parcial ${c.alumnos2026}/${c.alumnos2025}`, color: "#F9A825" };
}

export default function EscuelasContent({ escuelas, coberturas, dataMulti }: Props) {
  const [sort, setSort] = useState<SortOption>("numero-asc");
  const searchParams = useSearchParams();
  const evalMode = parseModoVista(searchParams.get("eval"));
  const nav = (p: string) => appendNavParams(p, { evalMode });
  const cobMap = useMemo(() => new Map((coberturas ?? []).map((c) => [c.cct, c])), [coberturas]);

  const sorted = useMemo(() => {
    const list = escuelas.map((e) => ({ escuela: e, nivel: getNivel(e) }));
    if (sort === "numero-asc") return list.sort((a, b) => a.escuela.cct.localeCompare(b.escuela.cct));
    if (sort === "numero-desc") return list.sort((a, b) => b.escuela.cct.localeCompare(a.escuela.cct));
    return list.sort((a, b) => CATEGORIA_ORDER[a.nivel] - CATEGORIA_ORDER[b.nivel]);
  }, [escuelas, sort]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 pb-6 min-w-0">
      <div className="card-ios shrink-0 space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
          Ordenar
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSort("numero-asc")}
            className={`btn-ios rounded-full px-3 py-2 text-xs font-medium transition-colors ${
              sort === "numero-asc"
                ? "pill-active"
                : "bg-[var(--fill-tertiary)] text-foreground hover:bg-[var(--fill-secondary)]"
            }`}
          >
            n.º ascendente
          </button>
          <button
            type="button"
            onClick={() => setSort("numero-desc")}
            className={`btn-ios rounded-full px-3 py-2 text-xs font-medium transition-colors ${
              sort === "numero-desc"
                ? "pill-active"
                : "bg-[var(--fill-tertiary)] text-foreground hover:bg-[var(--fill-secondary)]"
            }`}
          >
            n.º descendente
          </button>
          <button
            type="button"
            onClick={() => setSort("categoria")}
            className={`btn-ios rounded-full px-3 py-2 text-xs font-medium transition-colors ${
              sort === "categoria"
                ? "pill-active"
                : "bg-[var(--fill-tertiary)] text-foreground hover:bg-[var(--fill-secondary)]"
            }`}
          >
            Por categoría
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 content-start">
        {sorted.map(({ escuela: e, nivel }, i) => {
          const color = NIVEL_COLOR[nivel];
          const tagLabel =
            nivel === "REQUIERE APOYO" ? "Apoyo" : nivel === "EN DESARROLLO" ? "Desarrollo" : "Esperado";
          const cov = badgeCobertura(cobMap.get(e.cct));
          const tend = evalMode === "comparar" && dataMulti ? tendenciaEscuela(dataMulti, e.cct) : null;
          return (
            <li
              key={e.cct}
              className="min-w-0 animate-stagger-in opacity-0"
              style={{ animationDelay: `${Math.min(i * 25, 400)}ms` }}
            >
              <Link
                href={nav(`/escuela/${e.cct}`)}
                className="school-card link-ios card-ios flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-2.5 text-center shadow-sm"
                style={{ "--school-accent": color } as CSSProperties}
              >
                <span className="truncate w-full text-xs font-semibold leading-tight" title={nombreEscuela(e.cct, e.buscador?.nombre)}>
                  {nombreEscuela(e.cct, e.buscador?.nombre)}
                </span>
                <span className="mt-0.5 truncate w-full text-[10px] text-foreground/70">{e.cct}</span>
                <span className="mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: color }}>
                  {tagLabel}
                </span>
                {(evalMode === "aterrizaje-2026" || evalMode === "comparar") && (
                  <span className="mt-1 rounded-full px-2 py-0.5 text-[9px] font-medium text-white" style={{ backgroundColor: cov.color }}>
                    {cov.label}
                  </span>
                )}
                {tend && (
                  <span className="mt-0.5 text-[9px] text-foreground/60">
                    {tend === "mejoro" ? "↑ Tendencia positiva" : tend === "bajo" ? "↓ Requiere atención" : "≈ Estable"}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
