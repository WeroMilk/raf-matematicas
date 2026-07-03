#!/usr/bin/env node
/**
 * Parsea Excel combinado 2026 (quiz-2RAF Matematicas-full COMBINADO.xlsx)
 * y fusiona evaluación aterrizaje-2026 en resultados.json multi-eval.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { migrateToMultiEval, isMultiEval, readJsonFile } from "./migrate-resultados-multi-eval.mjs";
import {
  fixUtf8Mojibake,
  normalizarGrupo,
  obtenerNivel,
  calcularPorcentaje,
  respuesta,
  extraerMarcas,
  extraerNumeroEscuela,
  resolverCct,
  construirEscuelaResumen,
} from "./excel-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXCEL_DIR = path.join(ROOT, "data", "excel", "2026");
const OUT_FILE = path.join(ROOT, "public", "data", "resultados.json");

const META_ATERRIZAJE = {
  id: "aterrizaje-2026",
  nombre: "RAF Aterrizaje 2026",
  nombreCorto: "Aterrizaje 2026",
};

function findExcelFile() {
  const dir = EXCEL_DIR;
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".xlsx") && !f.startsWith("~$"));
    if (files.length) return path.join(dir, files[0]);
  }
  const fallback = path.join(process.env.USERPROFILE || "", "Downloads", "quiz-2RAF Matemticas-full COMBINADO.xlsx");
  if (fs.existsSync(fallback)) return fallback;
  return null;
}

function procesarExcelCombinado(filePath, cctsConocidos) {
  const wb = XLSX.readFile(filePath, { type: "file" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  const porCct = new Map();
  let omitidos = 0;

  for (const row of data) {
    const customId = row.CustomID;
    if (customId == null || !String(customId).trim()) {
      omitidos++;
      continue;
    }
    const customStr = fixUtf8Mojibake(String(customId)).trim();
    if (!/^Z\d+EST/i.test(customStr)) {
      omitidos++;
      continue;
    }

    const numEscuela = extraerNumeroEscuela(customStr);
    const cct = resolverCct(numEscuela, cctsConocidos);
    if (!cct) {
      omitidos++;
      continue;
    }

    const grupo = normalizarGrupo(customStr);
    const porcentaje = calcularPorcentaje(row);
    const nivel = obtenerNivel(porcentaje);
    const processed = {
      ...row,
      _grupo: grupo,
      _porcentaje: porcentaje,
      _nivel: nivel,
      _respuestas: Array.from({ length: 12 }, (_, i) => respuesta(row, i + 1)),
      _marcas: extraerMarcas(row),
    };

    if (!porCct.has(cct)) porCct.set(cct, []);
    porCct.get(cct).push(processed);
  }

  const escuelas = [];
  for (const [cct, rows] of [...porCct.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    escuelas.push(construirEscuelaResumen(cct, rows));
  }

  const totalAlumnos = escuelas.reduce((s, e) => s + e.totalEstudiantes, 0);
  console.log(
    `Excel 2026: ${escuelas.length} escuelas, ${totalAlumnos} alumnos (${omitidos} filas omitidas)`
  );

  return escuelas;
}

function main() {
  const excelPath = findExcelFile();
  if (!excelPath) {
    console.log("No hay Excel en data/excel/2026/. Solo migración si aplica.");
    if (fs.existsSync(OUT_FILE)) {
        const raw = readJsonFile(OUT_FILE);
        if (!isMultiEval(raw)) {
        const out = migrateToMultiEval(raw);
        fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
        console.log("Migrado a multi-eval sin datos 2026.");
      }
    }
    return;
  }

  let base = { escuelas: [], generado: new Date().toISOString() };
  if (fs.existsSync(OUT_FILE)) {
    base = readJsonFile(OUT_FILE);
  }
  const multi = migrateToMultiEval(base);

  const despegue = multi.evaluaciones.find((e) => e.id === "despegue-2025");
  const cctsConocidos = (despegue?.escuelas || []).map((e) => e.cct);
  const buscadorPorCct = new Map(
    (despegue?.escuelas || []).filter((e) => e.buscador).map((e) => [e.cct, e.buscador])
  );

  const escuelas2026 = procesarExcelCombinado(excelPath, cctsConocidos);
  for (const esc of escuelas2026) {
    const buscador = buscadorPorCct.get(esc.cct);
    if (buscador) esc.buscador = buscador;
  }

  const otras = multi.evaluaciones.filter((e) => e.id !== "aterrizaje-2026");
  const out = {
    evaluaciones: [
      ...otras,
      {
        ...META_ATERRIZAJE,
        escuelas: escuelas2026,
      },
    ],
    generado: new Date().toISOString(),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log("OK: resultados.json con", out.evaluaciones.length, "evaluaciones");
}

main();
