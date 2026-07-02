#!/usr/bin/env node
/**
 * Pipeline datos 2026: migrar a multi-eval + importar Excel combinado Aterrizaje 2026.
 */
import * as path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const scripts = ["migrate-resultados-multi-eval.mjs", "parse-excel-combinado-2026.mjs"];

for (const script of scripts) {
  const r = spawnSync("node", [path.join(__dirname, script)], {
    stdio: "inherit",
    cwd: ROOT,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const r2 = spawnSync("node", [path.join(__dirname, "merge-buscador-escuelas.mjs")], {
  stdio: "inherit",
  cwd: ROOT,
});
process.exit(r2.status ?? 0);
