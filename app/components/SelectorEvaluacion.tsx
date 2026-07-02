"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MODOS_VISTA, parseModoVista } from "@/lib/evaluaciones";
import type { ModoVista } from "@/types/raf";

export function useEvalMode(): ModoVista {
  const searchParams = useSearchParams();
  return parseModoVista(searchParams.get("eval"));
}

interface Props {
  compact?: boolean;
}

export default function SelectorEvaluacion({ compact = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseModoVista(searchParams.get("eval"));

  const setMode = (mode: ModoVista) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "despegue-2025") {
      params.delete("eval");
    } else {
      params.set("eval", mode);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div
      className={`flex rounded-xl border border-border bg-[var(--fill-tertiary)] p-0.5 ${compact ? "text-[10px]" : "text-xs"}`}
      role="tablist"
      aria-label="Evaluación RAF"
    >
      {MODOS_VISTA.map((modo) => {
        const active = current === modo.id;
        return (
          <button
            key={modo.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(modo.id)}
            className={`rounded-lg px-2 py-1.5 font-semibold transition-all sm:px-3 ${
              active ? "text-white shadow-sm" : "text-foreground/70 hover:text-foreground"
            }`}
            style={active ? { backgroundColor: modo.color } : undefined}
          >
            {compact && modo.id === "comparar" ? "vs" : modo.label}
          </button>
        );
      })}
    </div>
  );
}
