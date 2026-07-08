export type NivelRAF = "REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO" | "SIN EXAMEN";

export const NIVELES: NivelRAF[] = [
  "REQUIERE APOYO",
  "EN DESARROLLO",
  "ESPERADO",
  "SIN EXAMEN",
];

/** Solo niveles con examen (para vista Por nivel) */
export const NIVELES_CON_EXAMEN: ("REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO")[] = [
  "REQUIERE APOYO",
  "EN DESARROLLO",
  "ESPERADO",
];

export const COLORS = {
  requiereApoyo: "#D32F2F",
  enDesarrollo: "#F9A825",
  esperado: "#2E7D32",
  sinExamen: "#757575",
  header: "#4472C4",
} as const;

export const NIVEL_COLOR: Record<NivelRAF, string> = {
  "REQUIERE APOYO": COLORS.requiereApoyo,
  "EN DESARROLLO": COLORS.enDesarrollo,
  ESPERADO: COLORS.esperado,
  "SIN EXAMEN": COLORS.sinExamen,
};

export interface AlumnoRAF {
  nombre: string;
  apellido: string;
  grupo: string;
  porcentaje: number | null;
  nivel: NivelRAF;
  respuestas: string[];
  /** Marcas C/X del export QuizClass (calificación oficial por reactivo). */
  marcas?: string[];
}

export interface GrupoResumen {
  nombre: string;
  alumnos: AlumnoRAF[];
  porcentajesReactivos: number[];
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  total: number;
}

/** Datos opcionales del Buscador de Escuelas en Línea (SEP) para personalizar la ficha */
export interface EscuelaInfoBuscador {
  nombre?: string;
  turno?: string;
  nivelEducativo?: string;
  zona?: string;
  domicilio?: string;
  telefono?: string;
  colonia?: string;
  localidad?: string;
  municipio?: string;
}

export interface EscuelaResumen {
  cct: string;
  totalEstudiantes: number;
  porcentajesReactivos: number[];
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  grupos: GrupoResumen[];
  /** Datos del Buscador de Escuelas (nombre, domicilio, etc.) si se fusionaron */
  buscador?: EscuelaInfoBuscador;
}

export type EvaluacionId = "despegue-2025" | "aterrizaje-2026";

export type ModoVista = EvaluacionId | "comparar" | "resultados";

export interface EvaluacionRAF {
  id: EvaluacionId;
  nombre: string;
  nombreCorto: string;
  escuelas: EscuelaResumen[];
}

export interface ResultadosMultiRAF {
  evaluaciones: EvaluacionRAF[];
  generado: string;
}

/** Formato legacy (una sola evaluación) o multi-eval */
export interface ResultadosRAF {
  escuelas?: EscuelaResumen[];
  evaluaciones?: EvaluacionRAF[];
  generado: string;
}

export type TendenciaComparativa = "mejoro" | "igual" | "bajo" | "solo_2025" | "solo_2026";

export interface KPIsNivel {
  requiereApoyo: number;
  enDesarrollo: number;
  esperado: number;
  total: number;
}

export interface ComparativaKPIs {
  despegue2025: KPIsNivel;
  aterrizaje2026: KPIsNivel;
  delta: {
    requiereApoyo: number;
    enDesarrollo: number;
    esperado: number;
  };
}

export interface AlumnoComparativa {
  nombre: string;
  apellido: string;
  grupo: string;
  alumno2025: AlumnoRAF | null;
  alumno2026: AlumnoRAF | null;
  deltaPorcentaje: number | null;
  tendencia: TendenciaComparativa;
}

export type Cobertura2026 = "completo" | "parcial" | "sin_datos";

export interface CoberturaEscuela {
  cct: string;
  alumnos2025: number;
  alumnos2026: number;
  cobertura: Cobertura2026;
}
