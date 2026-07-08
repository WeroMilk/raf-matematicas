"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import type { AlumnoRAF, AlumnoComparativa, EvaluacionId } from "@/types/raf";
import { NIVEL_COLOR } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025 } from "@/lib/evaluaciones";
import ModalDetalleAlumno from "@/app/components/ModalDetalleAlumno";

const columnHelper = createColumnHelper<AlumnoRAF>();

interface Props {
  alumnos: AlumnoRAF[];
  cct?: string;
  comparativa?: AlumnoComparativa[];
  evalId?: EvaluacionId;
  fillHeight?: boolean;
}

const TENDENCIA_LABEL: Record<string, { text: string; color: string }> = {
  mejoro: { text: "Mejoró", color: "#2E7D32" },
  bajo: { text: "Bajó", color: "#D32F2F" },
  igual: { text: "Igual", color: "#757575" },
  solo_2025: { text: "Solo 2025", color: "#4472C4" },
  solo_2026: { text: "Solo 2026", color: "#2E7D32" },
};

function nivelLabel(nivel: string): string {
  if (nivel === "REQUIERE APOYO") return "apoyo";
  if (nivel === "EN DESARROLLO") return "desarrollo";
  if (nivel === "ESPERADO") return "esperado";
  return nivel;
}

function NivelBadge({ nivel }: { nivel: string }) {
  const color = NIVEL_COLOR[nivel as keyof typeof NIVEL_COLOR] ?? "#757575";
  return (
    <span className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: color }}>
      {nivelLabel(nivel)}
    </span>
  );
}

type VistaModal = "comparar" | EvaluacionId;

function TablaComparativa({ alumnos, cct, fillHeight = false }: { alumnos: AlumnoComparativa[]; cct?: string; fillHeight?: boolean }) {
  const [activo, setActivo] = useState<{ row: AlumnoComparativa; vistaInicial: VistaModal } | null>(null);
  const sorted = useMemo(
    () => [...alumnos].sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")),
    [alumnos]
  );

  return (
    <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>
      <div
        className={`overflow-x-auto rounded-2xl border border-border bg-card text-xs overflow-y-auto ${
          fillHeight ? "min-h-0 flex-1" : "max-h-[280px]"
        }`}
      >
        <table className="w-full min-w-[520px]">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b bg-white">
              <th className="bg-white p-2 text-left font-semibold">Alumno</th>
              <th className="bg-white p-2 text-center font-semibold">% 2025</th>
              <th className="bg-white p-2 text-center font-semibold">Nivel</th>
              <th className="bg-white p-2 text-center font-semibold">% 2026</th>
              <th className="bg-white p-2 text-center font-semibold">Nivel</th>
              <th className="bg-white p-2 text-center font-semibold">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const tend = TENDENCIA_LABEL[r.tendencia] ?? TENDENCIA_LABEL.igual;
              return (
                <tr key={`${r.nombre}-${r.apellido}`} className="border-b hover:bg-[var(--fill-tertiary)]">
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => setActivo({ row: r, vistaInicial: "comparar" })}
                      className="text-left font-medium underline decoration-dotted hover:opacity-80 cursor-pointer"
                    >
                      {r.nombre} {r.apellido}
                    </button>
                    <div className="text-[10px] opacity-60">{r.grupo}</div>
                  </td>
                  <td
                    className="p-2 text-center cursor-pointer hover:underline"
                    onClick={() => r.alumno2025 && setActivo({ row: r, vistaInicial: EVALUACION_DESPEGUE_2025 })}
                  >
                    {r.alumno2025?.porcentaje != null ? `${r.alumno2025.porcentaje}%` : "—"}
                  </td>
                  <td className="p-2 text-center">{r.alumno2025 ? <NivelBadge nivel={r.alumno2025.nivel} /> : "—"}</td>
                  <td
                    className="p-2 text-center cursor-pointer hover:underline"
                    onClick={() => r.alumno2026 && setActivo({ row: r, vistaInicial: EVALUACION_ATERRIZAJE_2026 })}
                  >
                    {r.alumno2026?.porcentaje != null ? `${r.alumno2026.porcentaje}%` : "—"}
                  </td>
                  <td className="p-2 text-center">{r.alumno2026 ? <NivelBadge nivel={r.alumno2026.nivel} /> : "—"}</td>
                  <td className="p-2 text-center font-semibold" style={{ color: tend.color }}>
                    {tend.text}
                    {r.deltaPorcentaje != null && r.tendencia !== "solo_2025" && r.tendencia !== "solo_2026"
                      ? ` (${r.deltaPorcentaje > 0 ? "+" : ""}${r.deltaPorcentaje}%)`
                      : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ModalDetalleAlumno
        comparativa={activo?.row ?? null}
        vistaInicial={activo?.vistaInicial}
        cct={cct}
        onClose={() => setActivo(null)}
      />
    </div>
  );
}

export default function TablaAlumnos({ alumnos, cct, comparativa, evalId = EVALUACION_DESPEGUE_2025, fillHeight = false }: Props) {
  if (comparativa) return <TablaComparativa alumnos={comparativa} cct={cct} fillHeight={fillHeight} />;

  const [sorting, setSorting] = useState<SortingState>([{ id: "porcentaje", desc: true }]);
  const [filter, setFilter] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<AlumnoRAF | null>(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor((r) => `${r.nombre} ${r.apellido}`.trim(), {
        id: "nombre",
        header: "Alumno",
        cell: (info) => {
          const alumno = info.row.original;
          const nombre = info.getValue() || "—";
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setAlumnoSeleccionado(alumno);
              }}
              className="text-left font-medium underline decoration-dotted hover:opacity-80 cursor-pointer w-full text-start"
            >
              {nombre}
            </button>
          );
        },
      }),
      columnHelper.accessor("grupo", { header: "Grupo" }),
      columnHelper.accessor("porcentaje", {
        header: "%",
        cell: (info) => {
          const v = info.getValue();
          return v != null ? `${v}%` : "—";
        },
      }),
      columnHelper.accessor("nivel", {
        header: "Nivel",
        cell: (info) => {
          const v = info.getValue();
          const label =
            v === "REQUIERE APOYO"
              ? "Apoyo"
              : v === "EN DESARROLLO"
                ? "Desarrollo"
                : v === "ESPERADO"
                  ? "Esperado"
                  : v === "SIN EXAMEN"
                    ? "Sin examen"
                    : v;
          return (
            <span
              className="rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: NIVEL_COLOR[v] ?? "#757575" }}
            >
              {label}
            </span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: alumnos,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div
      className={`min-h-0 min-w-0 max-w-full overflow-auto rounded-2xl border border-border bg-card shadow-sm ${
        fillHeight ? "flex min-h-0 flex-1 flex-col" : "max-h-[min(50dvh,360px)]"
      }`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="sticky top-0 border-b border-border bg-card p-2">
        <input
          type="search"
          placeholder="Buscar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
        />
      </div>
      <table className="w-full min-w-[260px] text-left text-xs" role="grid">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border bg-muted/50">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="cursor-pointer select-none px-1.5 py-1 font-semibold"
                  onClick={h.column.getToggleSortingHandler()}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() ? (h.column.getIsSorted() === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border/50 transition-colors duration-150 hover:bg-[var(--fill-tertiary)]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-1.5 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ModalDetalleAlumno
        alumno={alumnoSeleccionado}
        evalId={evalId}
        cct={cct}
        onClose={() => setAlumnoSeleccionado(null)}
      />
    </div>
  );
}
