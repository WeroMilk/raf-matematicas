import type { ResultadosRAF, EscuelaResumen, NivelRAF } from "@/types/raf";

let cached: ResultadosRAF | null = null;

async function loadResultados(): Promise<ResultadosRAF> {
  if (cached) return cached;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/data/resultados.json`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("No data");
    cached = await res.json();
    return cached!;
  } catch {
    cached = {
      escuelas: [],
      generado: new Date().toISOString(),
    };
    return cached;
  }
}

export async function getResultados(): Promise<ResultadosRAF> {
  return loadResultados();
}

export async function getEscuela(cct: string): Promise<EscuelaResumen | null> {
  const { escuelas } = await loadResultados();
  return escuelas.find((e) => e.cct === cct) ?? null;
}

export async function getEscuelas(): Promise<EscuelaResumen[]> {
  const { escuelas } = await loadResultados();
  return escuelas;
}

export function getAlumnosPorNivel(
  escuelas: EscuelaResumen[],
  nivel: NivelRAF
): { alumno: { nombre: string; apellido: string; grupo: string; porcentaje: number; nivel: NivelRAF }; cct: string }[] {
  const out: { alumno: { nombre: string; apellido: string; grupo: string; porcentaje: number; nivel: NivelRAF }; cct: string }[] = [];
  for (const esc of escuelas) {
    for (const g of esc.grupos) {
      for (const a of g.alumnos) {
        if (a.nivel === nivel) {
          out.push({
            alumno: {
              nombre: a.nombre,
              apellido: a.apellido,
              grupo: a.grupo,
              porcentaje: a.porcentaje,
              nivel: a.nivel,
            },
            cct: esc.cct,
          });
        }
      }
    }
  }
  return out;
}
