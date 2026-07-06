import type { EvaluacionId, NivelRAF } from "@/types/raf";
import { EVALUACION_DESPEGUE_2025 } from "@/lib/evaluaciones";
import { getClaveRespuestas, getReactivoInfo } from "@/lib/reactivos-matematicas";

export const NUM_REACTIVOS_MATEMATICAS = 12;

const OPCIONES_VALIDAS = ["A", "B", "C", "D"] as const;

export type ErrorReactivo = {
  num: number;
  marcado: string;
  correcta: string;
  marcadoDisplay: string;
};

export type ResultadoCalificacion = {
  aciertos: number[];
  errores: ErrorReactivo[];
  totalCorrectas: number;
  totalCalificados: number;
  totalConExamen: number;
  sinExamen: boolean;
  porcentaje: number;
  nivel: NivelRAF;
  usaMarcas: boolean;
  usaPorcentajeOficial?: boolean;
};

/** Detecta si los datos usan formato C/X (C=correcto, X=incorrecto) en lugar de A/B/C/D */
export function usaFormatoCX(respuestas: string[]): boolean {
  return respuestas.every((r) => {
    const x = (r ?? "").toUpperCase().trim();
    return x === "" || x === "-" || x === "C" || x === "X";
  });
}

export function tieneMarcasCalificadas(marcas?: string[]): boolean {
  return (marcas ?? []).some((m) => {
    const x = (m ?? "").toUpperCase().trim();
    return x === "C" || x === "X";
  });
}

/** Respuesta para mostrar: A/B/C/D si la tenemos; sin responder→X?; legacy incorrecto→? */
export function respuestaParaMostrar(
  resp: string,
  correcta: string,
  esCorrecto: boolean,
  sinResponder: boolean
): string {
  if (sinResponder) return "X?";
  const r = resp.toUpperCase().trim();
  if (OPCIONES_VALIDAS.includes(r as (typeof OPCIONES_VALIDAS)[number])) return r;
  if (esCorrecto) return correcta;
  return "?";
}

export function esRespuestaCorrecta(
  resp: string,
  correcta: string,
  formatoCX: boolean,
  sinResponder: boolean
): boolean {
  if (sinResponder) return false;
  const r = resp.toUpperCase().trim();
  return formatoCX ? r === "C" : r === correcta;
}

export function esCorrectoPorMarca(marca: string | undefined): boolean | null {
  const m = (marca ?? "").toUpperCase().trim();
  if (m === "C") return true;
  if (m === "X") return false;
  return null;
}

export function obtenerNivelDesdePorcentaje(porcentaje: number | null): NivelRAF {
  if (porcentaje == null) return "REQUIERE APOYO";
  if (porcentaje <= 50) return "REQUIERE APOYO";
  if (porcentaje <= 80) return "EN DESARROLLO";
  return "ESPERADO";
}

/** Califica con marcas C/X del export QuizClass (calificación oficial de la plataforma). */
export function calificarDesdeMarcas(
  respuestas: string[],
  marcas: string[],
  porcentajeGuardado?: number | null,
  evalId: EvaluacionId = EVALUACION_DESPEGUE_2025,
  numReactivos = NUM_REACTIVOS_MATEMATICAS
): ResultadoCalificacion {
  const aciertos: number[] = [];
  const errores: ErrorReactivo[] = [];
  let totalCalificados = 0;

  for (let i = 0; i < numReactivos; i++) {
    const info = getReactivoInfo(i + 1, evalId);
    const resp = (respuestas[i] ?? "-").toUpperCase().trim();
    const sinResponder = resp === "-" || resp === "";
    const marca = (marcas[i] ?? "-").toUpperCase().trim();
    const correcta = info?.respuestaCorrecta ?? "";

    if (marca !== "C" && marca !== "X") continue;
    totalCalificados++;

    const esCorrecto = marca === "C";
    if (esCorrecto) {
      aciertos.push(i + 1);
    } else if (info) {
      errores.push({
        num: i + 1,
        marcado: sinResponder ? "-" : resp,
        correcta,
        marcadoDisplay: respuestaParaMostrar(resp, correcta, false, sinResponder),
      });
    }
  }

  const totalCorrectas = aciertos.length;
  const sinExamen = totalCalificados === 0;
  const porcentaje =
    porcentajeGuardado != null
      ? porcentajeGuardado
      : totalCalificados > 0
        ? Math.round((totalCorrectas / totalCalificados) * 1000) / 10
        : 0;
  const nivel =
    sinExamen ? "REQUIERE APOYO" : (obtenerNivelDesdePorcentaje(porcentaje) as NivelRAF);
  const denominador = totalCalificados > 0 ? totalCalificados : numReactivos;

  return {
    aciertos,
    errores,
    totalCorrectas,
    totalCalificados: denominador,
    totalConExamen: totalCalificados,
    sinExamen,
    porcentaje,
    nivel,
    usaMarcas: true,
  };
}

/** Califica respuestas contra la clave del examen indicado (siempre /12). */
export function calificarRespuestas(
  respuestas: string[],
  evalId: EvaluacionId = EVALUACION_DESPEGUE_2025,
  numReactivos = NUM_REACTIVOS_MATEMATICAS
): ResultadoCalificacion {
  const aciertos: number[] = [];
  const errores: ErrorReactivo[] = [];
  const formatoCX = usaFormatoCX(respuestas);
  const clave = getClaveRespuestas(evalId);

  for (let i = 0; i < numReactivos; i++) {
    const info = getReactivoInfo(i + 1, evalId);
    const resp = (respuestas[i] ?? "-").toUpperCase().trim();
    const sinResponder = resp === "-" || resp === "";
    if (!info) continue;

    const correcta = clave[i] ?? info.respuestaCorrecta;
    const esCorrecto = esRespuestaCorrecta(resp, correcta, formatoCX, sinResponder);

    if (esCorrecto) {
      aciertos.push(i + 1);
    } else {
      errores.push({
        num: i + 1,
        marcado: sinResponder ? "-" : resp,
        correcta,
        marcadoDisplay: respuestaParaMostrar(resp, correcta, false, sinResponder),
      });
    }
  }

  const totalCorrectas = aciertos.length;
  const totalConExamen = aciertos.length + errores.length;
  const sinExamen = totalConExamen === 0;
  const porcentaje =
    numReactivos > 0 ? Math.round((totalCorrectas / numReactivos) * 1000) / 10 : 0;
  const nivel = sinExamen ? "REQUIERE APOYO" : obtenerNivelDesdePorcentaje(porcentaje);

  return {
    aciertos,
    errores,
    totalCorrectas,
    totalCalificados: numReactivos,
    totalConExamen,
    sinExamen,
    porcentaje,
    nivel,
    usaMarcas: false,
  };
}

/** Prioriza marcas del export; si no hay, usa porcentaje guardado para el resumen. */
export function calificarAlumno(
  alumno: {
    respuestas?: string[];
    marcas?: string[];
    porcentaje?: number | null;
    nivel?: NivelRAF;
  },
  evalId: EvaluacionId = EVALUACION_DESPEGUE_2025
): ResultadoCalificacion {
  const respuestas = alumno.respuestas ?? [];
  const marcas = alumno.marcas ?? [];

  if (tieneMarcasCalificadas(marcas)) {
    return calificarDesdeMarcas(respuestas, marcas, alumno.porcentaje, evalId);
  }

  const desdeStu = calificarRespuestas(respuestas, evalId);
  if (alumno.porcentaje != null && !desdeStu.sinExamen) {
    const totalCorrectas = Math.round((alumno.porcentaje / 100) * NUM_REACTIVOS_MATEMATICAS);
    const difiereDeStu = Math.abs(alumno.porcentaje - desdeStu.porcentaje) > 0.05;
    return {
      ...desdeStu,
      porcentaje: alumno.porcentaje,
      nivel: alumno.nivel ?? desdeStu.nivel,
      totalCorrectas,
      errores: difiereDeStu ? [] : desdeStu.errores,
      aciertos: difiereDeStu ? [] : desdeStu.aciertos,
      usaPorcentajeOficial: difiereDeStu,
    };
  }
  return desdeStu;
}

/** Indica si hay opciones A/B/C/D (Stu) en lugar de solo C/X legacy. */
export function tieneRespuestasStu(respuestas: string[]): boolean {
  return respuestas.some((r) => {
    const s = (r ?? "").toUpperCase().trim();
    return OPCIONES_VALIDAS.includes(s as (typeof OPCIONES_VALIDAS)[number]);
  });
}
