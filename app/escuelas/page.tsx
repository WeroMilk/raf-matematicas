import { cookies } from "next/headers";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";
import ScrollOnlyWhenNeeded from "@/app/components/ScrollOnlyWhenNeeded";
import EscuelasContent from "./EscuelasContent";
import FiltroZona from "@/app/components/FiltroZona";
import SelectorEvaluacion from "@/app/components/SelectorEvaluacion";
import { getEscuelasSync, getEscuelasConCobertura, getResultadosMultiSync } from "@/lib/data-server";
import { getSession } from "@/lib/auth";
import { getZonaFromCct, ZONAS_DISPONIBLES } from "@/lib/zonas";
import { EVALUACION_ATERRIZAJE_2026, EVALUACION_DESPEGUE_2025, parseModoVista } from "@/lib/evaluaciones";

export default async function EscuelasPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string; eval?: string }>;
}) {
  const params = await searchParams;
  const evalMode = parseModoVista(params.eval ?? null);
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("raf_session")?.value ?? null);
  const isSuper = session?.tipo === "super";
  const zonaForced = session?.tipo === "zona" ? session.zona : undefined;
  const zonaParam = params.zona;
  const zonaFromUrl =
    zonaParam && ZONAS_DISPONIBLES.includes(parseInt(zonaParam, 10))
      ? parseInt(zonaParam, 10)
      : null;
  const zonaNum = zonaForced ?? (isSuper ? zonaFromUrl : null);

  const evalId = evalMode === "aterrizaje-2026" ? EVALUACION_ATERRIZAJE_2026 : EVALUACION_DESPEGUE_2025;
  let escuelas = getEscuelasSync(evalId);
  if (zonaNum != null) {
    escuelas = escuelas.filter((e) => getZonaFromCct(e.cct) === zonaNum);
  }

  const backQs = [zonaNum != null ? `zona=${zonaNum}` : "", evalMode !== "despegue-2025" ? `eval=${evalMode}` : ""].filter(Boolean).join("&");
  const backHref = backQs ? `/?${backQs}` : "/";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-2">
      <PageHeader
        leadingOnMobile={<BackButton href={backHref} label="Inicio" />}
        belowLogoOnMobile={<SelectorEvaluacion compact />}
        centerContent={isSuper && zonaForced == null ? <FiltroZona isSuper={isSuper} /> : undefined}
      >
        <h1 className="mt-0.5 text-base font-bold">Por escuela</h1>
        <p className="text-xs text-foreground/80">Selecciona una escuela.</p>
      </PageHeader>

      {escuelas.length === 0 ? (
        <p className="text-xs text-foreground/60">
          {zonaNum != null ? `No hay escuelas en la Zona ${zonaNum}.` : "No hay escuelas cargadas."}
        </p>
      ) : (
        <ScrollOnlyWhenNeeded className="min-h-0 flex-1 overflow-x-hidden">
          <EscuelasContent
            escuelas={escuelas}
            coberturas={getEscuelasConCobertura()}
            dataMulti={getResultadosMultiSync()}
          />
        </ScrollOnlyWhenNeeded>
      )}
    </div>
  );
}
