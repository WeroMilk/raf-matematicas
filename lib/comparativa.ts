import type {
  AlumnoRAF,
  AlumnoComparativa,
  ComparativaKPIs,
  EscuelaResumen,
  KPIsNivel,
  NivelRAF,
  ResultadosMultiRAF,
  TendenciaComparativa,
} from "@/types/raf";
import {
  EVALUACION_ATERRIZAJE_2026,
  EVALUACION_DESPEGUE_2025,
} from "@/lib/evaluaciones";
import { getEscuelaFromEval, getEscuelasForEval } from "@/lib/resultados-utils";

const ORDEN_NIVEL: Record<NivelRAF, number> = {
  "REQUIERE APOYO": 0,
  "EN DESARROLLO": 1,
  ESPERADO: 2,
  "SIN EXAMEN": 3,
};

export function claveAlumno(
  cct: string,
  grupo: string,
  nombre: string,
  apellido: string
): string {
  return `${cct}|${grupo.trim().toUpperCase()}|${nombre.trim().toUpperCase()}|${apellido.trim().toUpperCase()}`;
}

function kpisFromEscuela(esc: EscuelaResumen | null): KPIsNivel {
  if (!esc) return { requiereApoyo: 0, enDesarrollo: 0, esperado: 0, total: 0 };
  return {
    requiereApoyo: esc.requiereApoyo,
    enDesarrollo: esc.enDesarrollo,
    esperado: esc.esperado,
    total: esc.totalEstudiantes,
  };
}

function kpisFromEscuelas(escuelas: EscuelaResumen[]): KPIsNivel {
  return escuelas.reduce(
    (acc, e) => ({
      requiereApoyo: acc.requiereApoyo + e.requiereApoyo,
      enDesarrollo: acc.enDesarrollo + e.enDesarrollo,
      esperado: acc.esperado + e.esperado,
      total: acc.total + e.totalEstudiantes,
    }),
    { requiereApoyo: 0, enDesarrollo: 0, esperado: 0, total: 0 }
  );
}

export function calcularTendencia(
  a2025: AlumnoRAF | null,
  a2026: AlumnoRAF | null
): TendenciaComparativa {
  if (a2025 && !a2026) return "solo_2025";
  if (!a2025 && a2026) return "solo_2026";
  if (!a2025 || !a2026) return "igual";

  const n2025 = ORDEN_NIVEL[a2025.nivel] ?? 0;
  const n2026 = ORDEN_NIVEL[a2026.nivel] ?? 0;
  if (n2026 > n2025) return "mejoro";
  if (n2026 < n2025) return "bajo";

  const p2025 = a2025.porcentaje ?? 0;
  const p2026 = a2026.porcentaje ?? 0;
  if (p2026 - p2025 >= 5) return "mejoro";
  if (p2025 - p2026 >= 5) return "bajo";
  return "igual";
}

function mapAlumnosEscuela(esc: EscuelaResumen | null): Map<string, AlumnoRAF> {
  const map = new Map<string, AlumnoRAF>();
  if (!esc) return map;
  for (const g of esc.grupos) {
    for (const a of g.alumnos) {
      map.set(claveAlumno(esc.cct, a.grupo, a.nombre, a.apellido), a);
    }
  }
  return map;
}

export function compararEscuela(
  data: ResultadosMultiRAF,
  cct: string
): ComparativaKPIs {
  const e2025 = getEscuelaFromEval(data, cct, EVALUACION_DESPEGUE_2025);
  const e2026 = getEscuelaFromEval(data, cct, EVALUACION_ATERRIZAJE_2026);
  const k2025 = kpisFromEscuela(e2025);
  const k2026 = kpisFromEscuela(e2026);
  return {
    despegue2025: k2025,
    aterrizaje2026: k2026,
    delta: {
      requiereApoyo: k2026.requiereApoyo - k2025.requiereApoyo,
      enDesarrollo: k2026.enDesarrollo - k2025.enDesarrollo,
      esperado: k2026.esperado - k2025.esperado,
    },
  };
}

export function compararGrupo(
  data: ResultadosMultiRAF,
  cct: string,
  grupo: string
): AlumnoComparativa[] {
  const e2025 = getEscuelaFromEval(data, cct, EVALUACION_DESPEGUE_2025);
  const e2026 = getEscuelaFromEval(data, cct, EVALUACION_ATERRIZAJE_2026);
  const g2025 = e2025?.grupos.find((g) => g.nombre === grupo);
  const g2026 = e2026?.grupos.find((g) => g.nombre === grupo);

  const map2025 = new Map<string, AlumnoRAF>();
  const map2026 = new Map<string, AlumnoRAF>();

  for (const a of g2025?.alumnos ?? []) {
    map2025.set(claveAlumno(cct, grupo, a.nombre, a.apellido), a);
  }
  for (const a of g2026?.alumnos ?? []) {
    map2026.set(claveAlumno(cct, grupo, a.nombre, a.apellido), a);
  }

  const keys = new Set([...map2025.keys(), ...map2026.keys()]);
  const out: AlumnoComparativa[] = [];

  for (const key of keys) {
    const a2025 = map2025.get(key) ?? null;
    const a2026 = map2026.get(key) ?? null;
    const ref = a2025 ?? a2026!;
    const deltaPorcentaje =
      a2025?.porcentaje != null && a2026?.porcentaje != null
        ? Math.round((a2026.porcentaje - a2025.porcentaje) * 10) / 10
        : null;
    out.push({
      nombre: ref.nombre,
      apellido: ref.apellido,
      grupo: ref.grupo,
      alumno2025: a2025,
      alumno2026: a2026,
      deltaPorcentaje,
      tendencia: calcularTendencia(a2025, a2026),
    });
  }

  return out.sort((a, b) =>
    `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")
  );
}

export function agregarGlobal(
  data: ResultadosMultiRAF,
  escuelasCct?: string[]
): ComparativaKPIs {
  let esc2025 = getEscuelasForEval(data, EVALUACION_DESPEGUE_2025);
  let esc2026 = getEscuelasForEval(data, EVALUACION_ATERRIZAJE_2026);

  if (escuelasCct) {
    const set = new Set(escuelasCct);
    esc2025 = esc2025.filter((e) => set.has(e.cct));
    esc2026 = esc2026.filter((e) => set.has(e.cct));
  }

  const k2025 = kpisFromEscuelas(esc2025);
  const k2026 = kpisFromEscuelas(esc2026);

  return {
    despegue2025: k2025,
    aterrizaje2026: k2026,
    delta: {
      requiereApoyo: k2026.requiereApoyo - k2025.requiereApoyo,
      enDesarrollo: k2026.enDesarrollo - k2025.enDesarrollo,
      esperado: k2026.esperado - k2025.esperado,
    },
  };
}

export function porcentajesReactivosGlobales(
  escuelas: EscuelaResumen[],
  numReactivos = 12
): number[] {
  const totalAlumnos = escuelas.reduce((s, e) => s + e.totalEstudiantes, 0);
  const sumas = new Array(numReactivos).fill(0);
  for (const e of escuelas) {
    const p = e.porcentajesReactivos ?? [];
    for (let i = 0; i < numReactivos; i++) {
      sumas[i] += (p[i] ?? 0) * e.totalEstudiantes;
    }
  }
  return sumas.map((s) => (totalAlumnos ? Math.round((s / totalAlumnos) * 10) / 10 : 0));
}

export function tendenciaEscuela(data: ResultadosMultiRAF, cct: string): "mejoro" | "igual" | "bajo" | null {
  const cmp = compararEscuela(data, cct);
  if (cmp.aterrizaje2026.total === 0) return null;
  if (cmp.delta.esperado > 0 && cmp.delta.requiereApoyo <= 0) return "mejoro";
  if (cmp.delta.requiereApoyo > 0 && cmp.delta.esperado <= 0) return "bajo";
  return "igual";
}

export type RowNivelComparativa = {
  cct: string;
  alumno: {
    nombre: string;
    apellido: string;
    grupo: string;
    nivel: NivelRAF;
    respuestas?: string[];
    porcentaje: number | null;
    porcentaje2025: number | null;
    porcentaje2026: number | null;
    deltaPorcentaje: number | null;
    alumno2025: AlumnoRAF | null;
    alumno2026: AlumnoRAF | null;
  };
};

/** Alumnos por nivel (según Despegue 2025) con porcentajes de ambas evaluaciones. */
export function getAlumnosPorNivelComparativa(
  data: ResultadosMultiRAF,
  nivel: NivelRAF,
  escuelasCct?: Set<string>
): RowNivelComparativa[] {
  const esc2025 = getEscuelasForEval(data, EVALUACION_DESPEGUE_2025);
  const esc2026 = getEscuelasForEval(data, EVALUACION_ATERRIZAJE_2026);

  const map2026 = new Map<string, AlumnoRAF>();
  for (const esc of esc2026) {
    if (escuelasCct && !escuelasCct.has(esc.cct)) continue;
    for (const g of esc.grupos) {
      for (const a of g.alumnos) {
        map2026.set(claveAlumno(esc.cct, a.grupo, a.nombre, a.apellido), a);
      }
    }
  }

  const out: RowNivelComparativa[] = [];
  for (const esc of esc2025) {
    if (escuelasCct && !escuelasCct.has(esc.cct)) continue;
    for (const g of esc.grupos) {
      for (const a of g.alumnos) {
        if (a.nivel !== nivel) continue;
        const a2026 = map2026.get(claveAlumno(esc.cct, a.grupo, a.nombre, a.apellido)) ?? null;
        const deltaPorcentaje =
          a.porcentaje != null && a2026?.porcentaje != null
            ? Math.round((a2026.porcentaje - a.porcentaje) * 10) / 10
            : null;
        out.push({
          cct: esc.cct,
          alumno: {
            nombre: a.nombre,
            apellido: a.apellido,
            grupo: a.grupo,
            nivel: a.nivel,
            respuestas: a.respuestas,
            porcentaje: a.porcentaje,
            porcentaje2025: a.porcentaje,
            porcentaje2026: a2026?.porcentaje ?? null,
            deltaPorcentaje,
            alumno2025: a,
            alumno2026: a2026,
          },
        });
      }
    }
  }
  return out;
}
