import { notFound } from "next/navigation";
import { getResultadosMultiSync } from "@/lib/data-server";
import AlumnosGrupoClient from "./AlumnosGrupoClient";

export default async function AlumnosGrupoPage({ params }: { params: Promise<{ cct: string; grupo: string }> }) {
  const { cct, grupo } = await params;
  const grupoDecoded = decodeURIComponent(grupo);
  const data = getResultadosMultiSync();
  const existe = data.evaluaciones.some((ev) => ev.escuelas.some((e) => e.cct === cct));
  if (!existe) notFound();

  return <AlumnosGrupoClient cct={cct} grupo={grupoDecoded} data={data} />;
}
