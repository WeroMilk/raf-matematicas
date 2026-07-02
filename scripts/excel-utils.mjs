/**
 * Utilidades compartidas para parsear exportes QuizClass RAF Matemáticas.
 */
export function fixUtf8Mojibake(str) {
  if (typeof str !== "string") return str;
  if (!/Ã[\x80-\xBF]/.test(str)) return str;
  try {
    return Buffer.from(str, "latin1").toString("utf8");
  } catch {
    return str;
  }
}

const LETRA_GRUPO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function esCctSEP(s) {
  if (typeof s !== "string") return false;
  const t = s.trim().toUpperCase();
  return /^\d{2}[A-Z]{3}\d{4}[A-Z0-9]$/.test(t);
}

export function obtenerGrupoRaw(row) {
  const qc = row.QuizClass != null ? fixUtf8Mojibake(String(row.QuizClass)) : "";
  if (esCctSEP(qc)) {
    const custom = row.CustomID != null ? fixUtf8Mojibake(String(row.CustomID)) : "";
    return custom.trim() || qc.trim();
  }
  return qc.trim();
}

export function normalizarGrupo(grupo) {
  if (grupo == null || grupo === "") return "S/G";
  const s = String(grupo).toUpperCase().trim();
  if (/^[1-3][A-Z][MV]$/.test(s)) return s;
  const m = s.match(/M1([A-H])/);
  if (m) return `1${m[1]}M`;
  const v = s.match(/V1([A-H])/);
  if (v) return `1${v[1]}V`;
  const zNum = s.match(/^Z(\d)(\d)EST[\d]*(M|V)\d*$/);
  if (zNum) {
    const grado = zNum[1];
    const numGrupo = parseInt(zNum[2], 10);
    const turno = zNum[3];
    const letra = LETRA_GRUPO[numGrupo - 1] || LETRA_GRUPO[0];
    return `${grado}${letra}${turno}`;
  }
  const zLetra = s.match(/^Z\d+EST[\d]*(M|V)(\d)([A-Z])$/);
  if (zLetra) {
    const turno = zLetra[1];
    const grado = zLetra[2];
    const letra = zLetra[3];
    return `${grado}${letra}${turno}`;
  }
  return s.slice(0, 10);
}

export function obtenerNivel(porcentaje) {
  if (porcentaje == null) return "REQUIERE APOYO";
  if (porcentaje <= 50) return "REQUIERE APOYO";
  if (porcentaje <= 80) return "EN DESARROLLO";
  return "ESPERADO";
}

export function calcularPorcentaje(row) {
  let aciertos = 0,
    total = 0;
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

export function respuesta(row, i) {
  const val = row[`Stu${i}`];
  if (val != null && String(val).trim()) {
    const s = String(val).trim().toUpperCase();
    if (/^[ABCD]$/.test(s)) return s;
  }
  const m = row[`Mark${i}`];
  return m != null && String(m).trim() ? String(m).trim() : "-";
}

/** Extrae número de escuela desde CustomID Z{n}EST{num}... */
export function extraerNumeroEscuela(customId) {
  if (customId == null) return null;
  const m = String(customId).trim().toUpperCase().match(/^Z\d+EST(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** Resuelve CCT 26DST desde número de escuela y mapa conocido */
export function resolverCct(numEscuela, cctsConocidos) {
  if (numEscuela == null) return null;
  const padded = String(numEscuela).padStart(4, "0");
  for (const cct of cctsConocidos) {
    const m = cct.match(/^26DST(\d{4})/i);
    if (m && m[1] === padded) return cct;
  }
  return null;
}

export function construirEscuelaResumen(cct, rows) {
  const gruposSet = new Set(rows.map((r) => r._grupo));
  const grupos = Array.from(gruposSet).filter(Boolean).sort();
  if (!grupos.length) grupos.push("UNICO");

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
        nombre: fixUtf8Mojibake(String(r.FirstName ?? "")).slice(0, 50),
        apellido: fixUtf8Mojibake(String(r.LastName ?? "")).slice(0, 50),
        grupo: r._grupo,
        porcentaje: r._porcentaje,
        nivel: r._nivel,
        respuestas: r._respuestas,
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
