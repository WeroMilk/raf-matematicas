import type { ModoVista } from "@/types/raf";

export function appendQueryParams(
  href: string,
  params: Record<string, string | number | null | undefined>
): string {
  const [path, existingQuery] = href.split("?");
  const search = new URLSearchParams(existingQuery ?? "");
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export function appendEvalParam(href: string, evalMode: ModoVista): string {
  if (evalMode === "despegue-2025") return href;
  return appendQueryParams(href, { eval: evalMode });
}

export function appendNavParams(
  href: string,
  opts: { evalMode?: ModoVista; zona?: number | null; from?: string | null }
): string {
  let out = href;
  if (opts.zona != null) {
    out = appendQueryParams(out, { zona: opts.zona });
  }
  if (opts.evalMode && opts.evalMode !== "despegue-2025") {
    out = appendQueryParams(out, { eval: opts.evalMode });
  }
  if (opts.from) {
    out = appendQueryParams(out, { from: opts.from });
  }
  return out;
}

export function withReturnTo(href: string, returnTo: string): string {
  return appendQueryParams(href, { from: returnTo });
}

export function backLabelFromReturnTo(from: string | null | undefined): string {
  if (!from) return "Regresar";
  const path = from.split("?")[0];
  if (path === "/") return "Inicio";
  if (path === "/escuelas") return "Escuelas";
  if (path.includes("/grupo/")) return "Grupo";
  if (path.startsWith("/escuela/")) return "Escuela";
  if (path === "/por-nivel") return "Por nivel";
  return "Regresar";
}
