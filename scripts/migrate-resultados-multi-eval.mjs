#!/usr/bin/env node
/**
 * Migra public/data/resultados.json del formato legacy { escuelas } al multi-eval.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "public", "data", "resultados.json");

const META_DESPEGUE = {
  id: "despegue-2025",
  nombre: "RAF Despegue 2025",
  nombreCorto: "Despegue 2025",
};

const META_ATERRIZAJE = {
  id: "aterrizaje-2026",
  nombre: "RAF Aterrizaje 2026",
  nombreCorto: "Aterrizaje 2026",
};

export function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

export function isMultiEval(data) {
  return Array.isArray(data.evaluaciones) && data.evaluaciones.length > 0;
}

export function migrateToMultiEval(data) {
  if (isMultiEval(data)) return data;

  const escuelas = data.escuelas || [];
  return {
    evaluaciones: [
      {
        ...META_DESPEGUE,
        escuelas,
      },
    ],
    generado: data.generado || new Date().toISOString(),
  };
}

function main() {
  if (!fs.existsSync(OUT_FILE)) {
    console.error("No existe", OUT_FILE);
    process.exit(1);
  }

  const raw = readJsonFile(OUT_FILE);
  if (isMultiEval(raw)) {
    console.log("Ya está en formato multi-eval. Sin cambios.");
    return;
  }

  const out = migrateToMultiEval(raw);
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log(
    "Migrado a multi-eval:",
    out.evaluaciones[0].escuelas.length,
    "escuelas en",
    META_DESPEGUE.nombre
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
