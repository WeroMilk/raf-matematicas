#!/usr/bin/env node
/**
 * Alimenta Aterrizaje 2026 de Técnicas (Lenguaje + Matemáticas) desde exportes ZipGrade.
 * Fusiona dos archivos por materia. Filas sin nombre y sin grupo → "faltan por revisar" + alumno N.
 */
import { createRequire } from "module";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(path.join(ROOT, "package.json"));
const XLSX = require("xlsx");

const EXCEL_2026 = path.join(ROOT, "data", "excel", "2026");
const GRUPO_REVISAR = "faltan por revisar";
const CCT_SIN_ESCUELA = "26DST0000R";

const FILES_MAT = [
  path.join(EXCEL_2026, "quiz-2RAF Matemticas-full (1).xlsx"),
  path.join(EXCEL_2026, "xdquiz-2RAF Matemticas-full (2).xlsx"),
];

const NUM_REACTIVOS_LENG = 30;
const NIVELES_PREGUNTAS = {
  1: [1, 3, 4, 6, 9, 16],
  2: [5, 7, 10, 11, 12, 14, 15, 18, 19, 20, 21, 23, 24],
  3: [2, 8, 13, 17, 22, 25, 26, 27, 28],
  4: [29, 30],
};
const UMBRAL_NECESITA_APOYO = 50;

function fixUtf8Mojibake(str) {
  if (typeof str !== "string") return str;
  if (!/Ã[\x80-\xBF]/.test(str)) return str;
  try {
    return Buffer.from(str, "latin1").toString("utf8");
  } catch {
    return str;
  }
}

function normalizarGrupoLeng(grupo) {
  if (grupo == null || grupo === "") return null;
  let s = String(grupo).toUpperCase().trim();
  const zipMatch = s.match(/Z\d+EST\d+(M|V)1([A-Z])$/i);
  if (zipMatch) {
    const turno = zipMatch[1].toUpperCase();
    const letra = zipMatch[2].toUpperCase();
    return turno === "M" ? `1${letra}M` : `1${letra}V`;
  }
  if (/^[1-3][A-Z][MV]$/.test(s)) return s;
  const vespertino = s.match(/^V([1-3])([A-Z])$/);
  if (vespertino) return `${vespertino[1]}${vespertino[2]}V`;
  const matutino = s.match(/^([1-3])([A-Z])$/);
  if (matutino) return `${matutino[1]}${matutino[2]}M`;
  return null;
}

function normalizarGrupoMat(grupo) {
  if (grupo == null || grupo === "") return null;
  const s = String(grupo).toUpperCase().trim();
  if (/^[1-3][A-Z][MV]$/.test(s)) return s;
  const m = s.match(/Z\d+EST\d+(M|V)1([A-Z])$/i);
  if (m) return m[1] === "M" ? `1${m[2]}M` : `1${m[2]}V`;
  const zLetra = s.match(/^Z\d+EST[\d]*(M|V)(\d)([A-Z])$/);
  if (zLetra) return `${zLetra[2]}${zLetra[3]}${zLetra[1]}`;
  return null;
}

function tieneNombre(row) {
  return !!(String(row.FirstName ?? "").trim() || String(row.LastName ?? "").trim());
}

function customIdValido(row) {
  const c = String(row.CustomID ?? row.CustomId ?? "").trim();
  return /^Z\d+EST/i.test(c);
}

function fusionKey(row) {
  return `${row.StudentID ?? ""}|${String(row.CustomID ?? row.CustomId ?? "").trim()}`;
}

function scoresIguales(a, b) {
  return (
    String(a.PercentCorrect ?? "") === String(b.PercentCorrect ?? "") &&
    String(a["Earned Points"] ?? "") === String(b["Earned Points"] ?? "") &&
    String(a["Possible Points"] ?? "") === String(b["Possible Points"] ?? "")
  );
}

function leerFilasExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

function buildNumEscuelaToCct(nombresPath) {
  const map = new Map();
  if (!fs.existsSync(nombresPath)) return map;
  const nombres = JSON.parse(fs.readFileSync(nombresPath, "utf8"));
  for (const cct of Object.keys(nombres)) {
    const m = cct.match(/26DST(\d{4})/i);
    if (m) map.set(parseInt(m[1], 10), cct);
  }
  map.set(0, CCT_SIN_ESCUELA);
  return map;
}

function cctDesdeCustomId(customId, numToCct) {
  const s = String(customId || "").trim();
  const m = s.match(/Z\d+EST(\d+)(M|V)1([A-Z])$/i);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  return numToCct.get(num) ?? null;
}

function fusionarArchivos(paths) {
  const entries = [];
  const f1IndexByKey = new Map();
  let rawRows = 0;
  let skipped = 0;

  for (let fileIdx = 0; fileIdx < paths.length; fileIdx++) {
    const filePath = paths[fileIdx];
    if (!fs.existsSync(filePath)) {
      throw new Error(`No se encontró: ${filePath}`);
    }
    const base = path.basename(filePath);
    const rows = leerFilasExcel(filePath);
    rawRows += rows.length;

    rows.forEach((row, idx) => {
      const hasName = tieneNombre(row);
      const hasGrupo = customIdValido(row);
      const hasSid = !!String(row.StudentID ?? "").trim();

      if (!hasGrupo && !hasName && !hasSid) return;

      const entry = { row, file: base, idx };

      if (fileIdx === 0) {
        entries.push(entry);
        if (hasGrupo) f1IndexByKey.set(fusionKey(row), entries.length - 1);
        return;
      }

      if (hasGrupo && f1IndexByKey.has(fusionKey(row))) {
        const prevIdx = f1IndexByKey.get(fusionKey(row));
        const prev = entries[prevIdx];
        if (scoresIguales(prev.row, row)) {
          if (!tieneNombre(prev.row) && hasName) entries[prevIdx] = entry;
          skipped++;
          return;
        }
      }

      entries.push(entry);
    });
  }

  console.log(
    `  Fusión: ${rawRows} filas brutas → ${entries.length} exámenes (${skipped} duplicados exactos entre archivos omitidos)`
  );

  return { todas: entries };
}

function calcularPctDesdeRespuestas(respuestas, preguntas) {
  let aciertos = 0;
  for (const p of preguntas) {
    if (respuestas[p - 1] === "C") aciertos++;
  }
  return preguntas.length > 0 ? Math.round((aciertos / preguntas.length) * 1000) / 10 : 0;
}

function extraerRespuestasLeng(row, n) {
  return Array.from({ length: n }, (_, i) => {
    const m = row[`Mark${i + 1}`];
    if (m != null) return String(m).trim() === "C" ? "C" : "X";
    const q = row[`Q${i + 1}`];
    if (q != null) return Number(q) === 1 || String(q).trim() === "1" ? "C" : "X";
    return "X";
  });
}

function procesarFilaLeng(entry, numToCct, asignarAlumno) {
  const row = entry.row;
  const customId = String(row.CustomID ?? row.CustomId ?? "").trim();
  const hasName = tieneNombre(row);
  const hasGrupo = customIdValido(row);

  let cct = hasGrupo ? cctDesdeCustomId(customId, numToCct) : CCT_SIN_ESCUELA;
  if (!cct) cct = CCT_SIN_ESCUELA;

  let grupo = hasGrupo ? normalizarGrupoLeng(customId) : null;
  let nombre = fixUtf8Mojibake(String(row.FirstName ?? "").trim()).slice(0, 50);
  let apellido = fixUtf8Mojibake(String(row.LastName ?? "").trim()).slice(0, 50);

  if (!hasName && !hasGrupo) {
    grupo = GRUPO_REVISAR;
    const placeholder = asignarAlumno();
    nombre = placeholder;
    apellido = "";
  } else if (!hasName) {
    const placeholder = asignarAlumno();
    nombre = placeholder;
    apellido = "";
  } else if (!hasGrupo) {
    grupo = GRUPO_REVISAR;
  }

  if (!grupo) grupo = GRUPO_REVISAR;

  const respuestas = extraerRespuestasLeng(row, NUM_REACTIVOS_LENG);
  const pctN1 = calcularPctDesdeRespuestas(respuestas, NIVELES_PREGUNTAS[1]);
  const pctN2 = calcularPctDesdeRespuestas(respuestas, NIVELES_PREGUNTAS[2]);
  const pctN3 = calcularPctDesdeRespuestas(respuestas, NIVELES_PREGUNTAS[3]);
  const pctN4 = calcularPctDesdeRespuestas(respuestas, NIVELES_PREGUNTAS[4]);
  const pcts = [pctN1, pctN2, pctN3, pctN4];
  const nivelReforzarMas = pcts.indexOf(Math.min(...pcts)) + 1;
  const aciertosTotales = respuestas.filter((r) => r === "C").length;
  const nivelGeneral = aciertosTotales <= 13 ? 1 : aciertosTotales <= 21 ? 2 : aciertosTotales <= 26 ? 3 : 4;
  const porcentaje = Math.round((aciertosTotales / NUM_REACTIVOS_LENG) * 1000) / 10;

  return {
    cct,
    grupo,
    nombre,
    apellido,
    porcentaje,
    nivelGeneral,
    porcentajeNivel1: pctN1,
    porcentajeNivel2: pctN2,
    porcentajeNivel3: pctN3,
    porcentajeNivel4: pctN4,
    nivelReforzarMas,
    respuestas,
  };
}

function calcularPorcentajeMat(row) {
  let aciertos = 0;
  let total = 0;
  for (let i = 1; i <= 12; i++) {
    const p = row[`Points${i}`];
    const m = row[`Mark${i}`];
    if (p == null || m == null) continue;
    const pv = Number(p);
    const mv = String(m).trim();
    if (Number.isNaN(pv)) continue;
    if (pv > 0 && mv === "C") {
      aciertos++;
      total++;
    } else if (pv === 0) total++;
  }
  return total > 0 ? Math.round((aciertos / total) * 1000) / 10 : 0;
}

function obtenerNivelMat(porcentaje) {
  if (porcentaje == null) return "REQUIERE APOYO";
  if (porcentaje <= 50) return "REQUIERE APOYO";
  if (porcentaje <= 80) return "EN DESARROLLO";
  return "ESPERADO";
}

function respuestaMat(row, i) {
  const val = row[`Stu${i}`];
  if (val != null && String(val).trim()) {
    const s = String(val).trim().toUpperCase();
    if (/^[ABCD]$/.test(s)) return s;
  }
  const m = row[`Mark${i}`];
  return m != null && String(m).trim() ? String(m).trim() : "-";
}

function extraerMarcasMat(row) {
  return Array.from({ length: 12 }, (_, i) => {
    const idx = i + 1;
    const p = row[`Points${idx}`];
    const m = row[`Mark${idx}`];
    if (p == null || m == null) return "-";
    const pv = Number(p);
    if (Number.isNaN(pv)) return "-";
    const mv = String(m).trim().toUpperCase();
    return mv === "C" || mv === "X" ? mv : "-";
  });
}

function procesarFilaMat(entry, numToCct, asignarAlumno) {
  const row = entry.row;
  const customId = String(row.CustomID ?? row.CustomId ?? "").trim();
  const hasName = tieneNombre(row);
  const hasGrupo = customIdValido(row);

  let cct = hasGrupo ? cctDesdeCustomId(customId, numToCct) : CCT_SIN_ESCUELA;
  if (!cct) cct = CCT_SIN_ESCUELA;

  let grupo = hasGrupo ? normalizarGrupoMat(customId) : null;
  let nombre = fixUtf8Mojibake(String(row.FirstName ?? "").trim()).slice(0, 50);
  let apellido = fixUtf8Mojibake(String(row.LastName ?? "").trim()).slice(0, 50);

  if (!hasName && !hasGrupo) {
    grupo = GRUPO_REVISAR;
    const placeholder = asignarAlumno();
    nombre = placeholder;
    apellido = "";
  } else if (!hasName) {
    const placeholder = asignarAlumno();
    nombre = placeholder;
    apellido = "";
  } else if (!hasGrupo) {
    grupo = GRUPO_REVISAR;
  }

  if (!grupo) grupo = GRUPO_REVISAR;

  const porcentaje = calcularPorcentajeMat(row);
  const nivel = obtenerNivelMat(porcentaje);

  return {
    cct,
    _grupo: grupo,
    FirstName: nombre,
    LastName: apellido,
    _porcentaje: porcentaje,
    _nivel: nivel,
    _respuestas: Array.from({ length: 12 }, (_, i) => respuestaMat(row, i + 1)),
    _marcas: extraerMarcasMat(row),
    ...row,
  };
}

function agregarEscuelaLeng(cct, alumnosRaw) {
  const gruposSet = new Set(alumnosRaw.map((a) => a.grupo));
  const grupos = [...gruposSet].filter(Boolean).sort();
  if (!grupos.length) grupos.push(GRUPO_REVISAR);

  const aciertosEsc = new Array(NUM_REACTIVOS_LENG).fill(0);
  const totalesEsc = new Array(NUM_REACTIVOS_LENG).fill(0);
  let n1 = 0,
    n2 = 0,
    n3 = 0,
    n4 = 0;

  for (const a of alumnosRaw) {
    for (let i = 0; i < NUM_REACTIVOS_LENG; i++) {
      if (a.respuestas[i] === "C") aciertosEsc[i]++;
      totalesEsc[i]++;
    }
    if (a.nivelGeneral === 1) n1++;
    else if (a.nivelGeneral === 2) n2++;
    else if (a.nivelGeneral === 3) n3++;
    else n4++;
  }

  const porcentajesEsc = aciertosEsc.map((a, i) =>
    totalesEsc[i] > 0 ? Math.round((a / totalesEsc[i]) * 1000) / 10 : 0
  );

  const n1Reforzar = alumnosRaw.filter((a) => a.porcentajeNivel1 < UMBRAL_NECESITA_APOYO).length;
  const n2Reforzar = alumnosRaw.filter((a) => a.porcentajeNivel2 < UMBRAL_NECESITA_APOYO).length;
  const n3Reforzar = alumnosRaw.filter((a) => a.porcentajeNivel3 < UMBRAL_NECESITA_APOYO).length;
  const n4Reforzar = alumnosRaw.filter((a) => a.porcentajeNivel4 < UMBRAL_NECESITA_APOYO).length;

  const gruposResumen = grupos.map((nombreGrupo) => {
    const alumnosGrupo = alumnosRaw.filter((a) => a.grupo === nombreGrupo);
    const aciertosG = new Array(NUM_REACTIVOS_LENG).fill(0);
    const totalesG = new Array(NUM_REACTIVOS_LENG).fill(0);
    for (const a of alumnosGrupo) {
      for (let i = 0; i < NUM_REACTIVOS_LENG; i++) {
        if (a.respuestas[i] === "C") aciertosG[i]++;
        totalesG[i]++;
      }
    }
    const porcentajesG = aciertosG.map((a, i) =>
      totalesG[i] > 0 ? Math.round((a / totalesG[i]) * 1000) / 10 : 0
    );
    return {
      nombre: nombreGrupo,
      alumnos: alumnosGrupo.map((a) => ({
        nombre: a.nombre,
        apellido: a.apellido,
        grupo: a.grupo,
        porcentaje: a.porcentaje,
        nivelGeneral: a.nivelGeneral,
        porcentajeNivel1: a.porcentajeNivel1,
        porcentajeNivel2: a.porcentajeNivel2,
        porcentajeNivel3: a.porcentajeNivel3,
        porcentajeNivel4: a.porcentajeNivel4,
        nivelReforzarMas: a.nivelReforzarMas,
        respuestas: a.respuestas,
      })),
      porcentajesReactivos: porcentajesG,
      nivel1: alumnosGrupo.filter((a) => a.nivelGeneral === 1).length,
      nivel2: alumnosGrupo.filter((a) => a.nivelGeneral === 2).length,
      nivel3: alumnosGrupo.filter((a) => a.nivelGeneral === 3).length,
      nivel4: alumnosGrupo.filter((a) => a.nivelGeneral === 4).length,
      nivelReforzarMas1: alumnosGrupo.filter((a) => a.porcentajeNivel1 < UMBRAL_NECESITA_APOYO).length,
      nivelReforzarMas2: alumnosGrupo.filter((a) => a.porcentajeNivel2 < UMBRAL_NECESITA_APOYO).length,
      nivelReforzarMas3: alumnosGrupo.filter((a) => a.porcentajeNivel3 < UMBRAL_NECESITA_APOYO).length,
      nivelReforzarMas4: alumnosGrupo.filter((a) => a.porcentajeNivel4 < UMBRAL_NECESITA_APOYO).length,
      total: alumnosGrupo.length,
    };
  });

  return {
    cct,
    totalEstudiantes: alumnosRaw.length,
    porcentajesReactivos: porcentajesEsc,
    nivel1: n1,
    nivel2: n2,
    nivel3: n3,
    nivel4: n4,
    nivelReforzarMas1: n1Reforzar,
    nivelReforzarMas2: n2Reforzar,
    nivelReforzarMas3: n3Reforzar,
    nivelReforzarMas4: n4Reforzar,
    grupos: gruposResumen,
  };
}

function construirEscuelaMat(cct, rows) {
  const gruposSet = new Set(rows.map((r) => r._grupo));
  const grupos = [...gruposSet].filter(Boolean).sort();
  if (!grupos.length) grupos.push(GRUPO_REVISAR);

  const aciertosEsc = new Array(12).fill(0);
  const totalesEsc = new Array(12).fill(0);
  let req = 0,
    des = 0,
    esp = 0;

  rows.forEach((r) => {
    for (let i = 1; i <= 12; i++) {
      const p = r[`Points${i}`];
      const m = r[`Mark${i}`];
      if (p != null && m != null) {
        const pv = Number(p);
        if (!Number.isNaN(pv)) {
          if (pv > 0 && String(m).trim() === "C") aciertosEsc[i - 1]++;
          totalesEsc[i - 1]++;
        }
      }
    }
    if (r._nivel === "REQUIERE APOYO") req++;
    else if (r._nivel === "EN DESARROLLO") des++;
    else esp++;
  });

  const porcentajesEsc = aciertosEsc.map((a, i) =>
    totalesEsc[i] > 0 ? Math.round((a / totalesEsc[i]) * 1000) / 10 : 0
  );

  const gruposResumen = grupos.map((nombreGrupo) => {
    const alumnosGrupo = rows.filter((r) => r._grupo === nombreGrupo);
    const aciertosG = new Array(12).fill(0);
    const totalesG = new Array(12).fill(0);
    alumnosGrupo.forEach((r) => {
      for (let i = 1; i <= 12; i++) {
        const p = r[`Points${i}`];
        const m = r[`Mark${i}`];
        if (p != null && m != null) {
          const pv = Number(p);
          if (!Number.isNaN(pv)) {
            if (pv > 0 && String(m).trim() === "C") aciertosG[i - 1]++;
            totalesG[i - 1]++;
          }
        }
      }
    });
    const porcentajesG = aciertosG.map((a, i) =>
      totalesG[i] > 0 ? Math.round((a / totalesG[i]) * 1000) / 10 : 0
    );
    const reqG = alumnosGrupo.filter((r) => r._nivel === "REQUIERE APOYO").length;
    const desG = alumnosGrupo.filter((r) => r._nivel === "EN DESARROLLO").length;
    const espG = alumnosGrupo.filter((r) => r._nivel === "ESPERADO").length;
    return {
      nombre: nombreGrupo,
      alumnos: alumnosGrupo.map((r) => ({
        nombre: r.FirstName,
        apellido: r.LastName,
        grupo: r._grupo,
        porcentaje: r._porcentaje,
        nivel: r._nivel,
        respuestas: r._respuestas,
        marcas: r._marcas,
      })),
      porcentajesReactivos: porcentajesG,
      requiereApoyo: reqG,
      enDesarrollo: desG,
      esperado: espG,
      total: alumnosGrupo.length,
    };
  });

  return {
    cct,
    totalEstudiantes: rows.length,
    porcentajesReactivos: porcentajesEsc,
    requiereApoyo: req,
    enDesarrollo: des,
    esperado: esp,
    grupos: gruposResumen,
  };
}

function alumnoLengKey(cct, grupo, nombre, apellido) {
  return `${cct}|${grupo}|${nombre}|${apellido}`.toUpperCase();
}

function complementarLengDesdeDespegue(escuelas, despegueEscuelas) {
  const porCct = new Map(escuelas.map((e) => [e.cct, e]));
  const presentes = new Set();
  const excelByGroup = new Map();

  for (const esc of escuelas) {
    for (const g of esc.grupos) {
      const gk = `${esc.cct}|${g.nombre}`;
      excelByGroup.set(gk, (excelByGroup.get(gk) || 0) + g.alumnos.length);
      for (const a of g.alumnos) {
        presentes.add(alumnoLengKey(esc.cct, g.nombre, a.nombre, a.apellido));
      }
    }
  }

  const totalActual = escuelas.reduce((s, e) => s + e.totalEstudiantes, 0);
  const totalDespegue = despegueEscuelas.reduce((s, e) => s + e.totalEstudiantes, 0);
  const faltantes = Math.max(0, totalDespegue - totalActual);
  if (!faltantes) return escuelas;

  const candidatos = [];
  for (const esc of despegueEscuelas) {
    for (const g of esc.grupos) {
      const gk = `${esc.cct}|${g.nombre}`;
      const excelCount = excelByGroup.get(gk) || 0;
      if (g.alumnos.length <= excelCount) continue;
      for (const a of g.alumnos) {
        const k = alumnoLengKey(esc.cct, g.nombre, a.nombre, a.apellido);
        if (!presentes.has(k)) {
          candidatos.push({ cct: esc.cct, grupo: g.nombre, alumno: a, deficit: g.alumnos.length - excelCount });
        }
      }
    }
  }

  candidatos.sort((a, b) => b.deficit - a.deficit);
  const aAgregar = candidatos.slice(0, faltantes);
  const extraPorEscuela = new Map();

  for (const { cct, grupo, alumno } of aAgregar) {
    if (!extraPorEscuela.has(cct)) extraPorEscuela.set(cct, []);
    extraPorEscuela.get(cct).push({
      cct,
      grupo,
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      porcentaje: alumno.porcentaje,
      nivelGeneral: alumno.nivelGeneral,
      porcentajeNivel1: alumno.porcentajeNivel1,
      porcentajeNivel2: alumno.porcentajeNivel2,
      porcentajeNivel3: alumno.porcentajeNivel3,
      porcentajeNivel4: alumno.porcentajeNivel4,
      nivelReforzarMas: alumno.nivelReforzarMas,
      respuestas: alumno.respuestas ?? [],
    });
  }

  for (const [cct, extras] of extraPorEscuela) {
    const esc = porCct.get(cct);
    const raw = esc
      ? extras.concat(
          esc.grupos.flatMap((g) =>
            g.alumnos.map((a) => ({
              cct,
              grupo: g.nombre,
              nombre: a.nombre,
              apellido: a.apellido,
              porcentaje: a.porcentaje,
              nivelGeneral: a.nivelGeneral,
              porcentajeNivel1: a.porcentajeNivel1,
              porcentajeNivel2: a.porcentajeNivel2,
              porcentajeNivel3: a.porcentajeNivel3,
              porcentajeNivel4: a.porcentajeNivel4,
              nivelReforzarMas: a.nivelReforzarMas,
              respuestas: a.respuestas,
            }))
          )
        )
      : extras;
    const rebuilt = agregarEscuelaLeng(cct, raw);
    if (esc) Object.assign(esc, rebuilt);
    else {
      escuelas.push(rebuilt);
      porCct.set(cct, rebuilt);
    }
  }

  escuelas.sort((a, b) => a.cct.localeCompare(b.cct));
  const totalFinal = escuelas.reduce((s, e) => s + e.totalEstudiantes, 0);
  console.log(
    `  + ${aAgregar.length} alumnos de Despegue en grupos con menos exámenes Aterrizaje (total ${totalFinal})`
  );
  return escuelas;
}

function procesarMateria(paths, materia, numToCct) {
  const { todas } = fusionarArchivos(paths);
  let alumnoSeq = 1;
  const usados = new Set();
  const asignarAlumno = () => {
    let label;
    do {
      label = `alumno ${alumnoSeq++}`;
    } while (usados.has(label));
    usados.add(label);
    return label;
  };

  const procesar = materia === "leng" ? procesarFilaLeng : procesarFilaMat;
  const alumnos = todas.map((entry) => procesar(entry, numToCct, asignarAlumno));

  const porEscuela = new Map();
  for (const a of alumnos) {
    const cct = a.cct;
    if (!porEscuela.has(cct)) porEscuela.set(cct, []);
    porEscuela.get(cct).push(a);
  }

  const escuelas =
    materia === "leng"
      ? [...porEscuela.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([cct, rows]) => agregarEscuelaLeng(cct, rows))
      : [...porEscuela.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([cct, rows]) => construirEscuelaMat(cct, rows));

  const placeholders = alumnos.filter((a) =>
    materia === "leng" ? /^alumno \d+$/.test(a.nombre) : /^alumno \d+$/.test(a.FirstName)
  ).length;
  const revisar = alumnos.filter((a) =>
    materia === "leng" ? a.grupo === GRUPO_REVISAR : a._grupo === GRUPO_REVISAR
  ).length;

  console.log(
    `  ${materia.toUpperCase()}: ${todas.length} exámenes → ${escuelas.length} escuelas, ${alumnos.length} alumnos (${placeholders} placeholders, ${revisar} en "${GRUPO_REVISAR}")`
  );

  return escuelas;
}

function actualizarNombresEscuelas(nombresPath) {
  const nombres = fs.existsSync(nombresPath)
    ? JSON.parse(fs.readFileSync(nombresPath, "utf8"))
    : {};
  if (!nombres[CCT_SIN_ESCUELA]) {
    nombres[CCT_SIN_ESCUELA] = "EXÁMENES SIN ESCUELA ASIGNADA (POR REVISAR)";
    fs.writeFileSync(nombresPath, JSON.stringify(nombres, null, 2), "utf8");
    console.log("  + CCT revisión en nombres-escuelas.json");
  }
}

function main() {
  console.log("=== Build ZipGrade Aterrizaje 2026 — Técnicas Matemáticas ===\n");

  for (const p of FILES_MAT) {
    if (!fs.existsSync(p)) throw new Error(`Falta archivo: ${p}`);
  }

  const nombresFile = path.join(ROOT, "data", "nombres-escuelas.json");
  if (!fs.existsSync(nombresFile)) {
    throw new Error(`Falta ${nombresFile} (mapa CCT para ZipGrade)`);
  }
  const numToCct = buildNumEscuelaToCct(nombresFile);

  console.log("Procesando Matemáticas...");
  const escuelasMat = procesarMateria(FILES_MAT, "mat", numToCct);

  const despegueMat = JSON.parse(
    fs.readFileSync(path.join(ROOT, "public", "data", "resultados.json"), "utf8")
  );
  const evalsMat = despegueMat.evaluaciones || [];
  const despegueEntry = evalsMat.find((e) => e.id === "despegue-2025");
  const totalDespegueMat = despegueEntry?.escuelas?.length ?? 0;
  const otrasMat = evalsMat.filter((e) => e.id !== "aterrizaje-2026");

  const buscadorPorCct = new Map(
    (despegueEntry?.escuelas || []).filter((e) => e.buscador).map((e) => [e.cct, e.buscador])
  );
  for (const esc of escuelasMat) {
    const buscador = buscadorPorCct.get(esc.cct);
    if (buscador) esc.buscador = buscador;
  }

  const outMat = {
    evaluaciones: [
      ...otrasMat.filter((e) => e.id !== "aterrizaje-2026"),
      {
        id: "aterrizaje-2026",
        nombre: "RAF Aterrizaje 2026",
        nombreCorto: "Aterrizaje 2026",
        escuelas: escuelasMat,
        parcial: escuelasMat.length < totalDespegueMat,
      },
    ],
    generado: new Date().toISOString(),
  };

  const matOut = path.join(ROOT, "public", "data", "resultados.json");
  fs.writeFileSync(matOut, JSON.stringify(outMat, null, 2), "utf8");

  const total = escuelasMat.reduce((s, e) => s + e.totalEstudiantes, 0);
  console.log("\nOK:", total, "alumnos,", escuelasMat.length, "escuelas");
  console.log("  →", matOut);
}

main();
