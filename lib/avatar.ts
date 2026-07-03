import { NIVEL_COLOR } from "@/types/raf";
import type { NivelRAF } from "@/types/raf";

export function inicialesAlumno(nombre: string, apellido: string): string {
  const n = nombre.trim().charAt(0);
  const a = apellido.trim().charAt(0);
  return `${n}${a}`.toUpperCase() || "?";
}

export function colorNivel(nivel: NivelRAF | string): string {
  return NIVEL_COLOR[nivel as keyof typeof NIVEL_COLOR] ?? "#757575";
}
