/**
 * Añade la sección "escuelas" a lib/auth-data.json con los CCT y contraseñas indicados.
 * Uso: node scripts/add-escuelas-auth.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = path.join(process.cwd());
const AUTH_DATA_PATH = path.join(ROOT, "lib", "auth-data.json");

function normalizePassword(text) {
  return String(text ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "");
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

const ESCUELAS_LIST = [
  ["26DST0001P", "dst0001pF+"],
  ["26DST0005L", "dst0005lB+"],
  ["26DST0006K", "dst0006kA+"],
  ["26DST0010X", "dst0010xS+"],
  ["26DST0011W", "dst0011wR+"],
  ["26DST0012V", "dst0012vQ+"],
  ["26DST0019O", "dst0019oG+"],
  ["26DST0020D", "dst0020dH+"],
  ["26DST0022B", "dst0022bF+"],
  ["26DST0023A", "dst0023aE+"],
  ["26DST0024Z", "dst0024zM+"],
  ["26DST0025Z", "dst0025zW+"],
  ["26DST0026Y", "dst0026yV+"],
  ["26DST0027X", "dst0027xU+"],
  ["26DST0028W", "dst0028wT+"],
  ["26DST0042P", "dst0042pA+"],
  ["26DST0048J", "dst0048jU+"],
  ["26DST0051X", "dst0051xM+"],
  ["26DST0053V", "dst0053vJ+"],
  ["26DST0054U", "dst0054uH+"],
  ["26DST0055T", "dst0055tG+"],
  ["26DST0056S", "dst0056sF+"],
  ["26DST0060E", "dst0060eD+"],
  ["26DST0061D", "dst0061dC+"],
  ["26DST0065Z", "dst0065zF+"],
  ["26DST0067Y", "dst0067yQ+"],
  ["26DST0071K", "dst0071kN+"],
  ["26DST0073I", "dst0073iK+"],
  ["26DST0074H", "dst0074hJ+"],
  ["26DST0076F", "dst0076fG+"],
  ["26DST0078D", "dst0078dE+"],
];

const escuelas = {};
for (const [cct, password] of ESCUELAS_LIST) {
  escuelas[cct] = sha256(normalizePassword(password));
}

const raw = fs.readFileSync(AUTH_DATA_PATH, "utf8");
const authData = JSON.parse(raw);
authData.escuelas = escuelas;
fs.writeFileSync(AUTH_DATA_PATH, JSON.stringify(authData, null, 2), "utf8");

console.log("auth-data.json actualizado con", Object.keys(escuelas).length, "escuelas.");
