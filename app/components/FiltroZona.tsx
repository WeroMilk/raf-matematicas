"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ZONAS_DISPONIBLES } from "@/lib/zonas";

interface Props {
  isSuper: boolean;
}

export default function FiltroZona({ isSuper }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  if (!isSuper) return null;

  const zonaParam = searchParams.get("zona");
  const value = zonaParam ? parseInt(zonaParam, 10) : null;
  const isValid = value != null && ZONAS_DISPONIBLES.includes(value);

  const handleChange = (zona: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (zona != null) {
      params.set("zona", String(zona));
    } else {
      params.delete("zona");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <select
      value={isValid ? value : ""}
      onChange={(e) => {
        const v = e.target.value;
        handleChange(v === "" ? null : parseInt(v, 10));
      }}
      className="select-ios w-full min-w-0 max-w-[140px] sm:max-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] min-h-[36px] cursor-pointer"
      title="Filtrar por zona"
    >
      <option value="">Todas las zonas</option>
      {ZONAS_DISPONIBLES.map((z) => (
        <option key={z} value={z}>
          Zona {z}
        </option>
      ))}
    </select>
  );
}
