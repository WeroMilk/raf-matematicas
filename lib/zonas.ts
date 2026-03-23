/**
 * Mapeo escuela secundaria técnica (número) → zona
 * Cada zona es responsable de ciertas escuelas.
 */
const ESCUELA_A_ZONA: Record<number, number> = {
  1: 5,
  5: 1,
  6: 10,
  10: 9,
  11: 7,
  12: 8,
  19: 4,
  20: 18,
  22: 3,
  23: 17,
  24: 3,
  25: 1,
  26: 17,
  27: 12,
  28: 17,
  42: 8,
  48: 11,
  51: 12,
  53: 17,
  54: 12,
  55: 1,
  56: 11,
  58: 7,
  60: 10,
  61: 12,
  65: 3,
  67: 12,
  71: 4,
  73: 14,
  74: 15,
  76: 14,
  78: 15,
};

/** Extrae el número de escuela del CCT (ej: 26DST0001P → 1) */
export function getNumeroEscuela(cct: string): number | null {
  const match = cct.match(/26DST(\d{4})/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return num > 0 ? num : null;
}

/** Obtiene la zona de una escuela por su CCT. Devuelve null si no hay mapeo. */
export function getZonaFromCct(cct: string): number | null {
  const num = getNumeroEscuela(cct);
  if (num == null) return null;
  return ESCUELA_A_ZONA[num] ?? null;
}

/** Solo zonas que tienen escuelas asignadas (del mapeo) */
export const ZONAS_DISPONIBLES = [...new Set(Object.values(ESCUELA_A_ZONA))].sort((a, b) => a - b);
