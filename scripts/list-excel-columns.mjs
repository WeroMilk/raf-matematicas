#!/usr/bin/env node
/**
 * Lista las columnas del primer archivo Excel en data/excel.
 * Útil para verificar si hay columnas Answer1, Answer2, etc. con la respuesta real del alumno.
 *
 * Uso: node scripts/list-excel-columns.mjs
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data", "excel");

const files = fs.existsSync(DATA_DIR)
  ? fs.readdirSync(DATA_DIR).filter((f) => f.endsWith("_actualizado.xlsx"))
  : [];
if (!files.length) {
  console.log("No hay archivos *_actualizado.xlsx en data/excel");
  process.exit(0);
}

const filePath = path.join(DATA_DIR, files[0]);
const wb = XLSX.readFile(filePath, { type: "file" });
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log("Archivo:", files[0]);
console.log("Columnas:", Object.keys(data[0] || {}).sort().join(", "));
console.log("\nColumnas relacionadas con respuestas:");
const cols = Object.keys(data[0] || {});
cols
  .filter((c) => /mark|answer|response|points/i.test(c))
  .sort()
  .forEach((c) => console.log("  -", c, ":", JSON.stringify(data[0][c])));
