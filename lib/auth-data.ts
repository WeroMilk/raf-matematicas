/**
 * Lee auth-data.json (hashes de contraseñas). Solo usar en servidor (API).
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

type AuthData = { superUsuario: string; escuelas: Record<string, string> };

function load(): AuthData {
  const filePath = path.join(process.cwd(), "lib", "auth-data.json");
  try {
    let raw = fs.readFileSync(filePath, "utf8");
    raw = raw.replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const rawSuper =
      typeof parsed["superUsuario"] === "string"
        ? parsed["superUsuario"]
        : typeof parsed["super"] === "string"
          ? parsed["super"]
          : (() => {
              const key = Object.keys(parsed).find((k) => k.replace(/\uFEFF/g, "") === "superUsuario" || k.replace(/\uFEFF/g, "") === "super");
              return key && typeof parsed[key] === "string" ? (parsed[key] as string) : "";
            })();
    const superHash = typeof rawSuper === "string" ? rawSuper.trim() : "";
    const escuelas =
      parsed["escuelas"] && typeof parsed["escuelas"] === "object" && !Array.isArray(parsed["escuelas"])
        ? (parsed["escuelas"] as Record<string, string>)
        : {};
    return { superUsuario: superHash, escuelas };
  } catch (err) {
    console.error("[auth-data] Error leyendo", filePath, err);
    return { superUsuario: "", escuelas: {} };
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password, "utf8").digest("hex");
}

export function verifyPassword(password: string): { tipo: "super" | "escuela"; cct?: string } | null {
  if (!password || typeof password !== "string") return null;
  const normalized = password.trim().replace(/\s+/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!normalized) return null;
  const data = load();
  const hash = hashPassword(normalized);
  const superHash = (data.superUsuario || "").trim();
  if (superHash && hash === superHash) return { tipo: "super" };
  for (const [cct, h] of Object.entries(data.escuelas)) {
    if (h && String(h).trim() === hash) return { tipo: "escuela", cct };
  }
  return null;
}
