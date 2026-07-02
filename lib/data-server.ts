import * as fs from "fs";
import * as path from "path";
import type {
  ResultadosRAF,
  ResultadosMultiRAF,
  EscuelaResumen,
  NivelRAF,
  EvaluacionId,
  CoberturaEscuela,
} from "@/types/raf";
import { fixObjectStrings } from "@/lib/utf8-fix";
import {
  EVALUACION_ATERRIZAJE_2026,
  EVALUACION_DESPEGUE_2025,
} from "@/lib/evaluaciones";
import {
  normalizeResultados,
  getEvaluacionById,
  getEscuelasForEval,
  getEscuelaFromEval,
  getCoberturaEscuelas,
  getCoberturaResumen,
  getAlumnosPorNivelFromEscuelas,
} from "@/lib/resultados-utils";
import { getAlumnosPorNivelComparativa } from "@/lib/comparativa";

const DATA_PATH = path.join(process.cwd(), "public", "data", "resultados.json");

function loadRaw(): ResultadosRAF {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as ResultadosRAF;
    return fixObjectStrings(parsed);
  } catch {
    return { escuelas: [], generado: new Date().toISOString() };
  }
}

function loadMulti(): ResultadosMultiRAF {
  return normalizeResultados(loadRaw());
}

export function getResultadosMultiSync(): ResultadosMultiRAF {
  return loadMulti();
}

/** Compatibilidad: devuelve escuelas de la evaluación indicada (default Despegue 2025) */
export function getResultadosSync(evalId: EvaluacionId = EVALUACION_DESPEGUE_2025): ResultadosRAF {
  const multi = loadMulti();
  const escuelas = getEscuelasForEval(multi, evalId);
  return { escuelas, generado: multi.generado };
}

export function getEvaluacionSync(id: EvaluacionId) {
  return getEvaluacionById(loadMulti(), id);
}

export function getEscuelaSync(
  cct: string,
  evalId: EvaluacionId = EVALUACION_DESPEGUE_2025
): EscuelaResumen | null {
  return getEscuelaFromEval(loadMulti(), cct, evalId);
}

export function getEscuelasSync(evalId: EvaluacionId = EVALUACION_DESPEGUE_2025): EscuelaResumen[] {
  return getEscuelasForEval(loadMulti(), evalId);
}

export function getEscuelasConCobertura(): CoberturaEscuela[] {
  return getCoberturaEscuelas(loadMulti());
}

export function getCobertura2026Resumen() {
  return getCoberturaResumen(loadMulti());
}

export function tieneEvaluacion2026(): boolean {
  const ev = getEvaluacionById(loadMulti(), EVALUACION_ATERRIZAJE_2026);
  return (ev?.escuelas?.length ?? 0) > 0;
}

export function getAlumnosPorNivelSync(
  nivel: NivelRAF,
  evalId: EvaluacionId = EVALUACION_DESPEGUE_2025
): {
  alumno: {
    nombre: string;
    apellido: string;
    grupo: string;
    porcentaje: number | null;
    nivel: NivelRAF;
    respuestas: string[];
  };
  cct: string;
}[] {
  const escuelas = getEscuelasForEval(loadMulti(), evalId);
  return getAlumnosPorNivelFromEscuelas(escuelas, nivel);
}

export function getAlumnosPorNivelComparativaSync(
  nivel: NivelRAF,
  escuelasCct?: Set<string>
) {
  return getAlumnosPorNivelComparativa(loadMulti(), nivel, escuelasCct);
}
