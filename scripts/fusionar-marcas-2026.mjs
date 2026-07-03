#!/usr/bin/env node
/**
 * Busca export QuizClass (Stu/Mark/Points) y fusiona marcas + porcentaje en aterrizaje-2026.
 */
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
  extraerNumeroEscuela,
  resolverCct,
} from "./excel-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "public", "data", "resultados.json");

function buscarExcels() {
  const roots = [
    path.join(ROOT, "data", "excel", "2026"),
    path.join(ROOT, "data", "excel"),
  ];
  const found = [];
  for (const dir of roots) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".xlsx") || f.startsWith("~$")) continue;
      const lower = f.toLowerCase();
      if (lower.includes("lenguaje") || lower.includes("language")) continue;
      if (!lower.includes("matem") && !lower.includes("combinado") && !lower.includes("quiz-2raf")) continue;
      found.push(path.join(dir, f));
    }
  }
  return [...new Set(found)];
}

function esQuizClassExport(data) {
  const row = data[0];
  if (!row) return false;
  return "Stu1" in row && "Mark1" in row && "Points1" in row;
}

function claveAlumno(cct, grupo, nombre, apellido) {
  const n = `${(nombre || "").trim().toUpperCase()}`;
  const a = `${(apellido || "").trim().toUpperCase()}`;
  const g = normalizarGrupo(grupo);
  return `${cct}|${g}|${n}|${a}`;
}

function main() {
  const data = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  const ev = data.evaluaciones?.find((e) => e.id === "aterrizaje-2026");
  if (!ev) {
    console.error("No hay evaluación aterrizaje-2026");
    process.exit(1);
  }
  const ccts = new Set();
  for (const esc of ev.escuelas ?? []) ccts.add(esc.cct);

  const mapa = new Map();
  let archivoUsado = null;

  for (const filePath of buscarExcels()) {
    let wb;
    try {
      wb = XLSX.readFile(filePath, { type: "file" });
    } catch {
      continue;
    }
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    if (!esQuizClassExport(rows) || rows.length < 500) continue;

    const muestra = rows.find((r) => r.CustomID && /^Z\d+EST/i.test(String(r.CustomID)));
    if (!muestra) continue;

    for (const row of rows) {
      const customId = row.CustomID;
      if (customId == null || !String(customId).trim()) continue;
      const customStr = fixUtf8Mojibake(String(customId)).trim();
      if (!/^Z\d+EST/i.test(customStr)) continue;
      const numEscuela = extraerNumeroEscuela(customStr);
      const cct = resolverCct(numEscuela, [...ccts]);
      if (!cct) continue;
      const grupo = normalizarGrupo(customStr);
      const nombre = fixUtf8Mojibake(String(row.FirstName ?? "")).trim().slice(0, 50);
      const apellido = fixUtf8Mojibake(String(row.LastName ?? "")).trim().slice(0, 50);
      const key = claveAlumno(cct, grupo, nombre, apellido);
      mapa.set(key, {
        porcentaje: calcularPorcentaje(row),
        nivel: obtenerNivel(calcularPorcentaje(row)),
        respuestas: Array.from({ length: 12 }, (_, i) => respuesta(row, i + 1)),
        marcas: extraerMarcas(row),
      });
    }
    if (mapa.size > 0) {
      archivoUsado = filePath;
      break;
    }
  }

  if (!mapa.size) {
    console.log("No se encontró export QuizClass combinado (Stu/Mark). Coloca el xlsx en data/excel/2026/");
    process.exit(0);
  }

  let actualizados = 0;
  for (const esc of ev.escuelas ?? []) {
    for (const g of esc.grupos ?? []) {
      for (const a of g.alumnos ?? []) {
        const key = claveAlumno(esc.cct, a.grupo, a.nombre, a.apellido);
        const src = mapa.get(key);
        if (!src) continue;
        a.porcentaje = src.porcentaje;
        a.nivel = src.nivel;
        a.respuestas = src.respuestas;
        a.marcas = src.marcas;
        actualizados++;
      }
    }
  }

  data.generado = new Date().toISOString();
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), "utf8");
  console.log(`OK: ${actualizados} alumnos 2026 actualizados desde ${archivoUsado}`);
}

main();
