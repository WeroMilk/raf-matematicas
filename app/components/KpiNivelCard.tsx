import Link from "next/link";
import type { ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  apoyo: (
    <svg className="size-4 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  ),
  desarrollo: (
    <svg className="size-4 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  esperado: (
    <svg className="size-4 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

interface Props {
  href: string;
  count: number;
  label: string;
  pct: number;
  baseColor: string;
  variant: "apoyo" | "desarrollo" | "esperado";
}

export default function KpiNivelCard({ href, count, label, pct, baseColor, variant }: Props) {
  return (
    <Link
      href={href}
      className="kpi-card link-ios group relative flex min-w-0 flex-col overflow-hidden rounded-2xl p-3 text-white shadow-md lg:p-4"
      style={
        {
          "--kpi-base": baseColor,
          background: `linear-gradient(145deg, color-mix(in srgb, ${baseColor} 92%, white) 0%, ${baseColor} 55%, color-mix(in srgb, ${baseColor} 88%, black) 100%)`,
        } as React.CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-1">
        <span className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm">{ICONS[variant]}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tabular-nums backdrop-blur-sm lg:text-xs">
          {pct}%
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums leading-none lg:text-3xl">{count.toLocaleString("es-MX")}</div>
      <div className="mt-1 text-[10px] font-medium leading-tight opacity-95 lg:text-sm">{label}</div>
    </Link>
  );
}
