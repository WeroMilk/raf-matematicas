import type { EvaluacionId, ModoVista } from "@/types/raf";

export const EVALUACION_DESPEGUE_2025: EvaluacionId = "despegue-2025";
export const EVALUACION_ATERRIZAJE_2026: EvaluacionId = "aterrizaje-2026";

export const EVALUACIONES_META: Record<
  EvaluacionId,
  { nombre: string; nombreCorto: string; color: string }
> = {
  "despegue-2025": {
    nombre: "RAF Despegue 2025",
    nombreCorto: "Despegue 2025",
    color: "#4472C4",
  },
  "aterrizaje-2026": {
    nombre: "RAF Aterrizaje 2026",
    nombreCorto: "Aterrizaje 2026",
    color: "#2E7D32",
  },
};

export const MODO_COMPARAR: ModoVista = "comparar";

export const MODOS_VISTA: { id: ModoVista; label: string; color: string }[] = [
  { id: "despegue-2025", label: "Despegue 2025", color: "#4472C4" },
  { id: "aterrizaje-2026", label: "Aterrizaje 2026", color: "#2E7D32" },
  { id: "comparar", label: "Comparar", color: "#7B2D3E" },
  { id: "resultados", label: "Resultados", color: "#5C4A72" },
];

export function parseModoVista(param: string | null): ModoVista {
  if (param === "aterrizaje-2026" || param === "comparar" || param === "resultados") return param;
  return "despegue-2025";
}

export function isEvaluacionId(value: string): value is EvaluacionId {
  return value === "despegue-2025" || value === "aterrizaje-2026";
}
