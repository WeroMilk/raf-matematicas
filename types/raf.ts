/** Niveles RAF (igual que MARTA.PY) */
export type NivelRAF = "REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO";

export const NIVELES: NivelRAF[] = [
  "REQUIERE APOYO",
  "EN DESARROLLO",
  "ESPERADO",
];

/** Colores vivos para niveles (dashboard, gráficas, tags) */
export const COLORS = {
  requiereApoyo: "#D32F2F",
  enDesarrollo: "#F9A825",
  esperado: "#2E7D32",
  header: "#4472C4",
} as const;

export const NIVEL_COLOR: Record<NivelRAF, string> = {
  "REQUIERE APOYO": COLORS.requiereApoyo,
  "EN DESARROLLO": COLORS.enDesarrollo,
  ESPERADO: COLORS.esperado,
};

/** Alumno con porcentaje y nivel calculados */
export interface AlumnoRAF {
  nombre: string;
  apellido: string;
  grupo: string;
  porcentaje: number;
  nivel: NivelRAF;
  respuestas: string[]; // R1..R12: 'C', 'I', '-'
}

/** Resumen por grupo */
export interface GrupoResumen {
  nombre: string;
  alumnos: AlumnoRAF[];
  porcentajesReactivos: number[]; // 12
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  total: number;
}

/** Resumen por escuela (CCT) */
export interface EscuelaResumen {
  cct: string;
  totalEstudiantes: number;
  porcentajesReactivos: number[];
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  grupos: GrupoResumen[];
}

/** Estructura global generada por el script */
export interface ResultadosRAF {
  escuelas: EscuelaResumen[];
  generado: string; // ISO date
}
