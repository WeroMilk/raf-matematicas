import { cookies } from "next/headers";
import { getResultadosSync } from "@/lib/data-server";
import { getSession } from "@/lib/auth";
import DashboardHomeClient from "@/app/components/DashboardHomeClient";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore.get("raf_session")?.value ?? null);
  const isSuper = session?.tipo === "super";
  const zonaForced = session?.tipo === "zona" ? session.zona : undefined;

  const data = getResultadosSync();

  return <DashboardHomeClient data={data} isSuper={!!isSuper} zonaForced={zonaForced} />;
}
