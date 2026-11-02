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
      className={`flex w-full min-w-0 rounded-xl border border-border bg-[var(--fill-tertiary)] p-0.5 ${
        compact ? "text-[10px] max-[400px]:text-[9px]" : "text-xs"
      }`}
      role="tablist"
      aria-label="Evaluación RAF"
    >
      {MODOS_VISTA.map((modo) => {
        const active = current === modo.id || (current === "comparar" && modo.id === "resultados");
        return (
          <button
            key={modo.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMode(modo.id)}
            className={`min-w-0 flex-1 basis-0 whitespace-normal text-center leading-tight rounded-lg font-semibold transition-all ${
              compact ? "px-1 py-1" : "px-1.5 py-1.5 sm:px-3"
            } ${
              active ? "text-white shadow-md" : "text-foreground/70 hover:bg-white/60 hover:text-foreground"
            }`}
            style={active ? { backgroundColor: modo.color } : undefined}
          >
            {modo.label}
          </button>
        );
      })}
    </div>
  );
}
