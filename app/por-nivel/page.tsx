import { cookies } from "next/headers";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";
import PorNivelContent from "./PorNivelContent";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import { getEscuelasSync, getAlumnosPorNivelSync, getAlumnosPorNivelComparativaSync } from "@/lib/data-server";
import { getSession } from "@/lib/auth";
import { getZonaFromCct, ZONAS_DISPONIBLES } from "@/lib/zonas";
import type { NivelRAF } from "@/types/raf";
import { NIVELES_CON_EXAMEN } from "@/types/raf";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, parseModoVista } from "@/lib/evaluaciones";
import { backLabelFromReturnTo } from "@/lib/evaluacion-url";

const PARAM_TO_NIVEL: Record<string, NivelRAF> = {
  REQUIERE_APOYO: "REQUIERE APOYO",
  EN_DESARROLLO: "EN DESARROLLO",
  ESPERADO: "ESPERADO",
};

export default async function PorNivelPage({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string; grupo?: string; zona?: string; eval?: string; from?: string }>;
}) {
  const params = await searchParams;
  const evalMode = parseModoVista(params.eval ?? null);
  const evalId = evalMode === "aterrizaje-2026" ? EVALUACION_ATERRIZAJE_2026 : EVALUACION_DESPEGUE_2025;
  const nivelParam = params.nivel ?? "";
  const nivelFiltro: NivelRAF | null = PARAM_TO_NIVEL[nivelParam] ?? null;
  const grupoParam = params.grupo ?? "";
  const zonaParam = params.zona;
  const returnTo = params.from ? decodeURIComponent(params.from) : null;

  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("raf_session")?.value ?? null);
  const isSuper = session?.tipo === "super";
  const zonaForced = session?.tipo === "zona" ? session.zona : undefined;
  const zonaNum = zonaForced ?? (isSuper && zonaParam && ZONAS_DISPONIBLES.includes(parseInt(zonaParam, 10))
    ? parseInt(zonaParam, 10)
    : null);

  let escuelas = getEscuelasSync(evalId);
  const buildAlumnosPorNivel = () => {
    if (evalMode === "comparar") {
      const cctsZona =
        zonaNum != null ? new Set(getEscuelasSync(EVALUACION_DESPEGUE_2025).filter((e) => getZonaFromCct(e.cct) === zonaNum).map((e) => e.cct)) : undefined;
      return {
        "REQUIERE APOYO": getAlumnosPorNivelComparativaSync("REQUIERE APOYO", cctsZona),
        "EN DESARROLLO": getAlumnosPorNivelComparativaSync("EN DESARROLLO", cctsZona),
        ESPERADO: getAlumnosPorNivelComparativaSync("ESPERADO", cctsZona),
      };
    }
    return {
      "REQUIERE APOYO": getAlumnosPorNivelSync("REQUIERE APOYO", evalId),
      "EN DESARROLLO": getAlumnosPorNivelSync("EN DESARROLLO", evalId),
      ESPERADO: getAlumnosPorNivelSync("ESPERADO", evalId),
    };
  };

  let alumnosPorNivel = buildAlumnosPorNivel() as Record<
    "REQUIERE APOYO" | "EN DESARROLLO" | "ESPERADO",
    { alumno: { nombre: string; apellido: string; grupo: string; porcentaje: number | null; nivel: NivelRAF }; cct: string }[]
  >;

  let alumnosPorNivel2026: typeof alumnosPorNivel | undefined;
  if (evalMode === "comparar") {
    alumnosPorNivel2026 = {
      "REQUIERE APOYO": getAlumnosPorNivelSync("REQUIERE APOYO", EVALUACION_ATERRIZAJE_2026),
      "EN DESARROLLO": getAlumnosPorNivelSync("EN DESARROLLO", EVALUACION_ATERRIZAJE_2026),
      ESPERADO: getAlumnosPorNivelSync("ESPERADO", EVALUACION_ATERRIZAJE_2026),
    };
  }

  if (zonaNum != null) {
    escuelas = escuelas.filter((e) => getZonaFromCct(e.cct) === zonaNum);
    const cctsZona = new Set(escuelas.map((e) => e.cct));
    if (evalMode !== "comparar") {
      for (const nivel of NIVELES_CON_EXAMEN) {
        alumnosPorNivel[nivel] = alumnosPorNivel[nivel].filter((r) => cctsZona.has(r.cct));
      }
    } else if (alumnosPorNivel2026) {
      for (const nivel of NIVELES_CON_EXAMEN) {
        alumnosPorNivel2026[nivel] = alumnosPorNivel2026[nivel].filter((r) => cctsZona.has(r.cct));
      }
    }
  }

  const gruposOptions = escuelas.flatMap((e) =>
    e.grupos.map((g) => ({
      cct: e.cct,
      grupo: g.nombre,
      label: `${e.cct} - ${g.nombre}`,
    }))
  );

  const qsParts = [
    zonaNum != null ? `zona=${zonaNum}` : "",
    evalMode !== "despegue-2025" ? `eval=${evalMode}` : "",
  ].filter(Boolean);
  const qs = qsParts.length ? `?${qsParts.join("&")}` : "";
  const backHref = returnTo ?? (nivelFiltro ? `/por-nivel${qs}` : `/${qs}`);
  const backLabel = returnTo
    ? backLabelFromReturnTo(returnTo)
    : nivelFiltro
      ? "Por nivel"
      : "Inicio";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden p-2">
      <PageHeader belowLogoOnMobile={<SelectorEvaluacion compact />}>
        <BackButton href={backHref} label={backLabel} />
        <h1 className="mt-0.5 text-base font-bold">
          {nivelFiltro
            ? `Por nivel: ${nivelFiltro === "REQUIERE APOYO" ? "Requieren apoyo" : nivelFiltro === "EN DESARROLLO" ? "En desarrollo" : "Esperado"}`
            : "Por nivel"}
        </h1>
        <p className="text-xs text-foreground/80 max-lg:hidden">
          {evalMode === "comparar"
            ? "Comparativa 2025 vs 2026 por alumno (agrupado por nivel Despegue 2025)."
            : nivelFiltro
              ? "Lista completa."
              : "Organiza por escuela o grupo."}
        </p>
        <p className="text-xs text-foreground/80 lg:hidden">
          {evalMode === "comparar"
            ? "Comparativa 2025 vs 2026"
            : nivelFiltro
              ? "Lista completa"
              : "Toca un nivel para ver alumnos"}
        </p>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <PorNivelContent
          alumnosPorNivel={alumnosPorNivel}
          alumnosPorNivel2026={alumnosPorNivel2026}
          escuelas={escuelas.map((e) => ({ cct: e.cct }))}
          gruposOptions={gruposOptions}
          nivelFiltro={nivelFiltro}
          soloCct={undefined}
          initialGrupo={grupoParam}
          evalMode={evalMode}
          isSuper={isSuper}
          zonaForced={zonaForced}
        />
      </div>
    </div>
  );
}
