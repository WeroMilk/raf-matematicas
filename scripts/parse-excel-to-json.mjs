import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import {
  fixUtf8Mojibake,
  normalizarGrupo,
  obtenerNivel,
  calcularPorcentaje,
  respuesta,
  extraerMarcas,
  esCctSEP,
  obtenerGrupoRaw,
} from "./excel-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data", "excel");
const OUT_DIR = path.join(ROOT, "public", "data");
const OUT_FILE = path.join(OUT_DIR, "resultados.json");

function procesarEscuela(filePath) {
  const wb = XLSX.readFile(filePath, { type: "file" });
  const first = wb.SheetNames[0];
  const sheet = wb.Sheets[first];
  const data = XLSX.utils.sheet_to_json(sheet);
  const cct = path.basename(filePath, path.extname(filePath)).replace("_actualizado", "");

  if (!data.length) return null;

  const hasQuizClass = Object.keys(data[0] || {}).some((k) => k === "QuizClass");
  const gruposSet = new Set();
  const rows = data.map((row) => {
    const grupoRaw = hasQuizClass ? obtenerGrupoRaw(row) : "";
    const grupo = grupoRaw ? normalizarGrupo(grupoRaw) : "UNICO";
    gruposSet.add(grupo);
    const porcentaje = calcularPorcentaje(row);
    const nivel = obtenerNivel(porcentaje);
    return {
      ...row,
      _grupo: grupo,
      _porcentaje: porcentaje,
      _nivel: nivel,
      _respuestas: Array.from({ length: 12 }, (_, i) => respuesta(row, i + 1)),
      _marcas: extraerMarcas(row),
    };
  });

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

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log("Carpeta data/excel creada. Coloca ahí los archivos *_actualizado.xlsx y vuelve a ejecutar.");
    // En deploy (Vercel) no existe data/excel: conservar resultados.json del repo
    if (fs.existsSync(OUT_FILE)) {
      console.log("Conservando public/data/resultados.json existente (deploy sin data/excel).");
      return;
    }
    const empty = { escuelas: [], generado: new Date().toISOString() };
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(empty, null, 2), "utf8");
    console.log("Creado public/data/resultados.json vacío.");
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith("_actualizado.xlsx"));
  if (!files.length) {
    console.log("No se encontraron archivos *_actualizado.xlsx en", DATA_DIR);
    // En deploy (Vercel) no hay Excel: conservar resultados.json existente del repo
    if (fs.existsSync(OUT_FILE)) {
      console.log("Conservando public/data/resultados.json existente (deploy sin Excel).");
      return;
    }
    const empty = { escuelas: [], generado: new Date().toISOString() };
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(empty, null, 2), "utf8");
    return;
  }

  const escuelas = [];
  for (const f of files.sort()) {
    const filePath = path.join(DATA_DIR, f);
    try {
      const res = procesarEscuela(filePath);
      if (res) escuelas.push(res);
    } catch (e) {
      console.error("Error en", f, e.message);
    }
  }

  let escuelasOut = escuelas;
  if (process.env.MERGE_RESULTADOS_JSON === "1" && fs.existsSync(OUT_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
      const byCct = new Map((prev.escuelas || []).map((e) => [e.cct, e]));
      for (const e of escuelas) {
        const anterior = byCct.get(e.cct);
        const fusion = { ...e };
        if (anterior?.buscador) fusion.buscador = anterior.buscador;
        byCct.set(e.cct, fusion);
      }
      escuelasOut = [...byCct.values()].sort((a, b) => a.cct.localeCompare(b.cct));
      console.log("Fusión: " + escuelas.length + " desde Excel + existentes → " + escuelasOut.length + " escuelas");
    } catch (err) {
      console.warn("No se pudo fusionar con resultados.json previo:", err.message);
    }
  }

  const out = { escuelas: escuelasOut, generado: new Date().toISOString() };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log("OK: " + escuelasOut.length + " escuelas → public/data/resultados.json");
}

main();
