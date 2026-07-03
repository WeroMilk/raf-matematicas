import { COLORS } from "@/types/raf";

export type NivelConExamen = "REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO";

export interface NivelRAFInfo {
  nivel: NivelConExamen;
  label: string;
  color: string;
  orientacion: string;
}

const NIVELES_INFO: Record<NivelConExamen, NivelRAFInfo> = {
  "REQUIERE APOYO": {
    nivel: "REQUIERE APOYO",
    label: "Requiere apoyo",
    color: COLORS.requiereApoyo,
    orientacion:
      "Se recomienda reforzar los contenidos básicos identificados en el diagnóstico y dar seguimiento personalizado.",
  },
  "EN DESARROLLO": {
    nivel: "EN DESARROLLO",
    label: "En desarrollo",
    color: COLORS.enDesarrollo,
    orientacion:
      "Conviene consolidar los reactivos donde aún hay dificultad y reforzar los que ya dominan.",
  },
  ESPERADO: {
    nivel: "ESPERADO",
    label: "Esperado",
    color: COLORS.esperado,
    orientacion:
      "Pueden servir como referencia o apoyo entre pares; conviene mantener la práctica para sostener el logro.",
  },
};

export function getNivelRAFInfo(nivel: NivelConExamen): NivelRAFInfo {
  return NIVELES_INFO[nivel];
}
