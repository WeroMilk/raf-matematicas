import nombresOficiales from "@/data/nombres-escuelas-oficiales.json";

const POR_CCT = nombresOficiales as Record<string, string>;

/** Corrige mojibake y errores comunes en nombres del buscador SEP. */
export function corregirNombreEscuela(nombre: string): string {
  if (!nombre) return nombre;
  let s = nombre
    .replace(/MUÃOZ/gi, "MUÑOZ")
    .replace(/MUÑZ\b/gi, "MUÑOZ")
    .replace(/BRISEÃO/gi, "BRISEÑO")
    .replace(/BRISEÑ\b/gi, "BRISEÑO")
    .replace(/PEÃA/gi, "PEÑA")
    .replace(/\bPEÑ\b/gi, "PEÑA")
    .replace(/BAÑAGA/gi, "BAÑAGA")
    .replace(/VIDAÃA/gi, "VIDAÑA")
    .replace(/SEPùLVEDA/gi, "SEPULVEDA")
    .replace(/SAñUDO/gi, "SANUDO");
  if (/Ã/.test(s)) {
    try {
      s = Buffer.from(s, "latin1").toString("utf8");
    } catch {
      // mantener s
    }
  }
  return s;
}

/** Nombre oficial por CCT (SEP Sonora, secundarias técnicas). */
export function nombreEscuela(cct: string, fallback?: string): string {
  const oficial = POR_CCT[cct];
  if (oficial) return oficial;
  if (fallback) return corregirNombreEscuela(fallback);
  return cct;
}
