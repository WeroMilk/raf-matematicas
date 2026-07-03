/**
 * Lógica de calificación compartida para scripts de build.
 * Mantener alineada con lib/calificar-respuestas.ts
 */

export const NUM_REACTIVOS_MATEMATICAS = 12;

/** Respuestas correctas RAF Matemáticas (R1–R12) — referencia para mostrar clave en UI */
export const RESPUESTAS_CORRECTAS = ["C", "B", "A", "B", "A", "A", "A", "A", "C", "D", "C", "C"];

const OPCIONES_VALIDAS = new Set(["A", "B", "C", "D"]);

export function usaFormatoCX(respuestas) {
  return respuestas.every((r) => {
    const x = (r ?? "").toUpperCase().trim();
    return x === "" || x === "-" || x === "C" || x === "X";
  });
}

export function tieneMarcasCalificadas(marcas) {
  return (marcas ?? []).some((m) => {
    const x = (m ?? "").toUpperCase().trim();
    return x === "C" || x === "X";
  });
}

export function esRespuestaCorrecta(resp, correcta, formatoCX, sinResponder) {
  if (sinResponder) return false;
  const r = resp.toUpperCase().trim();
  return formatoCX ? r === "C" : r === correcta;
}

export function obtenerNivelDesdePorcentaje(porcentaje) {
  if (porcentaje == null) return "REQUIERE APOYO";
  if (porcentaje <= 50) return "REQUIERE APOYO";
  if (porcentaje <= 80) return "EN DESARROLLO";
  return "ESPERADO";
}

export function tieneRespuestasStu(respuestas) {
  return respuestas.some((r) => {
    const s = (r ?? "").toUpperCase().trim();
    return OPCIONES_VALIDAS.has(s);
  });
}

/** Porcentaje según Mark/Points del export QuizClass (fuente oficial). */
export function calcularPorcentajeDesdeMarcas(marcas, points) {
  let aciertos = 0;
  let total = 0;
  for (let i = 0; i < NUM_REACTIVOS_MATEMATICAS; i++) {
    const m = (marcas[i] ?? "").toUpperCase().trim();
    const p = points?.[i];
    if (p == null && m !== "C" && m !== "X") continue;
    const pv = p != null ? Number(p) : m === "C" ? 1 : 0;
    if (Number.isNaN(pv)) continue;
    if (m !== "C" && m !== "X") continue;
    if (pv > 0 && m === "C") aciertos++;
    total++;
  }
  return total > 0 ? Math.round((aciertos / total) * 1000) / 10 : 0;
}

/** Califica con marcas C/X del export (prioridad sobre clave estática). */
export function calificarDesdeMarcas(respuestas, marcas, porcentajeGuardado = null, numReactivos = NUM_REACTIVOS_MATEMATICAS) {
  const aciertos = [];
  let totalCalificados = 0;
  let totalCorrectas = 0;

  for (let i = 0; i < numReactivos; i++) {
    const marca = (marcas[i] ?? "-").toUpperCase().trim();
    if (marca !== "C" && marca !== "X") continue;
    totalCalificados++;
    if (marca === "C") {
      aciertos.push(i + 1);
      totalCorrectas++;
    }
  }

  const sinExamen = totalCalificados === 0;
  const porcentaje =
    porcentajeGuardado != null
      ? porcentajeGuardado
      : totalCalificados > 0
        ? Math.round((totalCorrectas / totalCalificados) * 1000) / 10
        : 0;
  const nivel = sinExamen ? "REQUIERE APOYO" : obtenerNivelDesdePorcentaje(porcentaje);
  const denominador = totalCalificados > 0 ? totalCalificados : numReactivos;

  return { aciertos, totalCorrectas, totalCalificados: denominador, sinExamen, porcentaje, nivel };
}

/** Califica respuestas contra la clave RAF Matemáticas (siempre /12). */
export function calificarRespuestas(respuestas, numReactivos = NUM_REACTIVOS_MATEMATICAS) {
  const aciertos = [];
  const formatoCX = usaFormatoCX(respuestas);

  for (let i = 0; i < numReactivos; i++) {
    const correcta = RESPUESTAS_CORRECTAS[i];
    if (!correcta) continue;
    const resp = (respuestas[i] ?? "-").toUpperCase().trim();
    const sinResponder = resp === "-" || resp === "";
    if (esRespuestaCorrecta(resp, correcta, formatoCX, sinResponder)) {
      aciertos.push(i + 1);
    }
  }

  const totalCorrectas = aciertos.length;
  const totalConExamen = respuestas.filter((r) => {
    const x = (r ?? "").toUpperCase().trim();
    return x !== "" && x !== "-";
  }).length;
  const sinExamen = totalConExamen === 0 && aciertos.length === 0;
  const porcentaje =
    numReactivos > 0 ? Math.round((totalCorrectas / numReactivos) * 1000) / 10 : 0;
  const nivel = sinExamen ? "REQUIERE APOYO" : obtenerNivelDesdePorcentaje(porcentaje);

  return {
    aciertos,
    totalCorrectas,
    totalCalificados: numReactivos,
    sinExamen,
    porcentaje,
    nivel,
  };
}

export function calificarAlumno(alumno) {
  const respuestas = alumno.respuestas ?? [];
  const marcas = alumno.marcas ?? [];

  if (tieneMarcasCalificadas(marcas)) {
    return calificarDesdeMarcas(respuestas, marcas, alumno.porcentaje);
  }

  const desdeStu = calificarRespuestas(respuestas);
  if (alumno.porcentaje != null && !desdeStu.sinExamen) {
    return {
      ...desdeStu,
      porcentaje: alumno.porcentaje,
      nivel: alumno.nivel ?? desdeStu.nivel,
      totalCorrectas: Math.round((alumno.porcentaje / 100) * NUM_REACTIVOS_MATEMATICAS),
    };
  }
  return desdeStu;
}
