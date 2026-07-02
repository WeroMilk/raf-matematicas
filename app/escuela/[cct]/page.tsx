import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getResultadosMultiSync, getEscuelasConCobertura } from "@/lib/data-server";
import { getSession } from "@/lib/auth";
import EscuelaPageClient from "./EscuelaPageClient";

export default async function EscuelaPage({ params }: { params: Promise<{ cct: string }> }) {
  const { cct } = await params;
  const data = getResultadosMultiSync();
  const tiene = data.evaluaciones.some((ev) => ev.escuelas.some((e) => e.cct === cct));
  if (!tiene) notFound();

  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("raf_session")?.value ?? null);
  const zonaNum = session?.tipo === "zona" ? session.zona : null;
  const backHref = zonaNum != null ? `/escuelas?zona=${zonaNum}` : "/escuelas";
  const cobertura = getEscuelasConCobertura().find((c) => c.cct === cct);

  return (
    <EscuelaPageClient
      cct={cct}
      data={data}
      backHref={backHref}
      showBack={session?.tipo === "super" || session?.tipo === "zona"}
      cobertura={cobertura}
    />
  );
}
