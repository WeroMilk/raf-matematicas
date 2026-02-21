/**
 * Genera lib/auth-data.json a partir del listado oficial de 32 contraseñas.
 * Ejecutar: node scripts/build-auth-from-list.mjs
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = path.join(process.cwd());
const AUTH_DATA_PATH = path.join(ROOT, "lib", "auth-data.json");

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

// Misma normalización que en lib/auth-data.ts verifyPassword
function normalizePassword(s) {
  if (typeof s !== "string") return "";
  return s
    .trim()
    .replace(/\s+/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

// Listado oficial — 1 super + 31 escuelas (no subir a git)
const SUPER_PASSWORD = "uj9dmhVQVbFeRx";
const ESCUELAS = [
  ["26DST0001P", "XquNcYw4xaNk"],
  ["26DST0005L", "zsfai4rbu4eG"],
  ["26DST0006K", "SGpsbhsrJYaq"],
  ["26DST0010X", "txbTDq7Rv4z9"],
  ["26DST0011W", "zycZgxpwm8Jp"],
  ["26DST0012V", "DqEAHe2GN5jz"],
  ["26DST0019O", "78Mz8fuenpKr"],
  ["26DST0020D", "vvYEcy4JzyiP"],
  ["26DST0022B", "s8BR2K8M3qUm"],
  ["26DST0023A", "PTTCG2Pqea4C"],
  ["26DST0024Z", "JPkSMrP3mmzP"],
  ["26DST0025Z", "HGBEKPqe8qB7"],
  ["26DST0026Y", "X26N6mmNByX5"],
  ["26DST0027X", "NVkurujRfNAe"],
  ["26DST0028W", "CSxpGVqQpMFp"],
  ["26DST0042P", "5ugqRSJvCUkK"],
  ["26DST0048J", "8cp8xyS4mCp4"],
  ["26DST0051X", "gpMZJDEjXZ6Y"],
  ["26DST0053V", "SXPEvmYEDPCR"],
  ["26DST0054U", "ChJdEBUY6Rgw"],
  ["26DST0055T", "2cQeSAY2NB2U"],
  ["26DST0056S", "zgFXBjKZbMvA"],
  ["26DST0060E", "Rp6Q7bswe2Jj"],
  ["26DST0061D", "MdnEiGvZiYqG"],
  ["26DST0065Z", "asKZPzxuBaNn"],
  ["26DST0067Y", "wJ54GdTi6FHT"],
  ["26DST0071K", "NkHS8PpPBCrU"],
  ["26DST0073I", "tQwNMFQsmxp5"],
  ["26DST0074H", "UKNMehDKsfTF"],
  ["26DST0076F", "2uhcrtvMxS6H"],
  ["26DST0078D", "JfaF7cbrUFiC"],
];

const superHash = sha256(normalizePassword(SUPER_PASSWORD));
const escuelas = {};
for (const [cct, pwd] of ESCUELAS) {
  escuelas[cct] = sha256(normalizePassword(pwd));
}

const authData = { superUsuario: superHash, escuelas };
fs.mkdirSync(path.dirname(AUTH_DATA_PATH), { recursive: true });
fs.writeFileSync(AUTH_DATA_PATH, JSON.stringify(authData, null, 2), "utf8");

console.log("OK: auth-data.json generado con 1 super + 31 escuelas.");
console.log("Super hash (primeros 16):", superHash.slice(0, 16) + "...");
