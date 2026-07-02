import type {
  EvaluacionId,
  EvaluacionRAF,
  EscuelaResumen,
  ResultadosMultiRAF,
  ResultadosRAF,
  NivelRAF,
  CoberturaEscuela,
  Cobertura2026,
} from "@/types/raf";
import {
  EVALUACION_DESPEGUE_2025,
  EVALUACION_ATERRIZAJE_2026,
  EVALUACIONES_META,
} from "@/lib/evaluaciones";

export function normalizeResultados(raw: ResultadosRAF): ResultadosMultiRAF {
  if (raw.evaluaciones && raw.evaluaciones.length > 0) {
    return { evaluaciones: raw.evaluaciones, generado: raw.generado };
  }
  const escuelas = raw.escuelas ?? [];
  return {
    evaluaciones: [
      {
        id: EVALUACION_DESPEGUE_2025,
        nombre: EVALUACIONES_META[EVALUACION_DESPEGUE_2025].nombre,
        nombreCorto: EVALUACIONES_META[EVALUACION_DESPEGUE_2025].nombreCorto,
        escuelas,
      },
    ],
    generado: raw.generado,
  };
}

export function getEvaluacionById(
  data: ResultadosMultiRAF,
  id: EvaluacionId
): EvaluacionRAF | null {
  return data.evaluaciones.find((e) => e.id === id) ?? null;
}

export function getEscuelasForEval(
  data: ResultadosMultiRAF,
  id: EvaluacionId
): EscuelaResumen[] {
  return getEvaluacionById(data, id)?.escuelas ?? [];
}

export function getEscuelaFromEval(
  data: ResultadosMultiRAF,
  cct: string,
  id: EvaluacionId
): EscuelaResumen | null {
  return getEscuelasForEval(data, id).find((e) => e.cct === cct) ?? null;
}

function coberturaTipo(alumnos2025: number, alumnos2026: number): Cobertura2026 {
  if (alumnos2026 === 0) return "sin_datos";
  if (alumnos2026 >= alumnos2025) return "completo";
  return "parcial";
}

export function getCoberturaEscuelas(data: ResultadosMultiRAF): CoberturaEscuela[] {
  const despegue = getEscuelasForEval(data, EVALUACION_DESPEGUE_2025);
  const aterrizaje = getEscuelasForEval(data, EVALUACION_ATERRIZAJE_2026);
  const map2026 = new Map(aterrizaje.map((e) => [e.cct, e.totalEstudiantes]));

  return despegue.map((e) => {
    const alumnos2026 = map2026.get(e.cct) ?? 0;
    return {
      cct: e.cct,
      alumnos2025: e.totalEstudiantes,
      alumnos2026,
      cobertura: coberturaTipo(e.totalEstudiantes, alumnos2026),
    };
  });
}

export function getCoberturaResumen(data: ResultadosMultiRAF) {
  const coberturas = getCoberturaEscuelas(data);
  const conDatos = coberturas.filter((c) => c.alumnos2026 > 0);
  const totalAlumnos2026 = conDatos.reduce((s, c) => s + c.alumnos2026, 0);
  return {
    escuelasConDatos: conDatos.length,
    escuelasTotales: coberturas.length,
    totalAlumnos2026,
    coberturas,
  };
}

export function getAlumnosPorNivelFromEscuelas(
  escuelas: EscuelaResumen[],
  nivel: NivelRAF
): { alumno: EscuelaResumen["grupos"][0]["alumnos"][0]; cct: string }[] {
  const out: { alumno: EscuelaResumen["grupos"][0]["alumnos"][0]; cct: string }[] = [];
  for (const esc of escuelas) {
    for (const g of esc.grupos) {
      for (const a of g.alumnos) {
        if (a.nivel === nivel) {
          out.push({ alumno: a, cct: esc.cct });
        }
      }
    }
  }
  return out;
}
