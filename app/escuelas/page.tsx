import { cookies } from "next/headers";
import BackButton from "@/app/components/BackButton";
import PageHeader from "@/app/components/PageHeader";
import ScrollOnlyWhenNeeded from "@/app/components/ScrollOnlyWhenNeeded";
import EscuelasContent from "./EscuelasContent";
import FiltroZona from "@/app/components/FiltroZona";
import { getEscuelasSync } from "@/lib/data-server";
import { getSession } from "@/lib/auth";
import { getZonaFromCct, ZONAS_DISPONIBLES } from "@/lib/zonas";

export default async function EscuelasPage({
  searchParams,
}: {
  searchParams: Promise<{ zona?: string }>;
}) {
  const params = await searchParams;
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

  let escuelas = getEscuelasSync();
  if (zonaNum != null) {
    escuelas = escuelas.filter((e) => getZonaFromCct(e.cct) === zonaNum);
  }

  const zonaHref = (path: string) =>
    zonaNum != null ? `${path}${path.includes("?") ? "&" : "?"}zona=${zonaNum}` : path;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-2">
      <PageHeader centerContent={isSuper && zonaForced == null ? <FiltroZona isSuper={isSuper} /> : undefined}>
        <BackButton href={zonaHref("/")} label="Inicio" />
        <h1 className="mt-0.5 text-base font-bold">Por escuela</h1>
        <p className="text-xs text-foreground/80">Selecciona una escuela.</p>
      </PageHeader>

      {escuelas.length === 0 ? (
        <p className="text-xs text-foreground/60">
          {zonaNum != null ? `No hay escuelas en la Zona ${zonaNum}.` : "No hay escuelas cargadas."}
        </p>
      ) : (
        <ScrollOnlyWhenNeeded className="min-h-0 flex-1 overflow-x-hidden">
          <EscuelasContent escuelas={escuelas} />
        </ScrollOnlyWhenNeeded>
      )}
    </div>
  );
}
