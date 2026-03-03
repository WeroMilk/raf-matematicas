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
import type { AlumnoRAF } from "@/types/raf";
import { NIVEL_COLOR } from "@/types/raf";
import ModalDetalleAlumno from "@/app/components/ModalDetalleAlumno";

const columnHelper = createColumnHelper<AlumnoRAF>();

interface Props {
  alumnos: AlumnoRAF[];
  cct?: string;
}

export default function TablaAlumnos({ alumnos, cct }: Props) {
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
              onClick={() => setAlumnoSeleccionado(alumno)}
              className="text-left font-medium underline decoration-dotted hover:opacity-80 cursor-pointer"
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
    <div className="min-h-0 min-w-0 max-w-full overflow-auto rounded-2xl border border-border bg-card max-h-[200px] shadow-sm" style={{ WebkitOverflowScrolling: "touch" }}>
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
        cct={cct}
        onClose={() => setAlumnoSeleccionado(null)}
      />
    </div>
  );
}
