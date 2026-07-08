import Link from "next/link";
import { COLORS } from "@/types/raf";
import type { KPIComparativaNivelKey } from "@/app/components/KPIComparativa";

interface Props {
  nivel: number;
  label: string;
  desc: string;
  color: string;
  pct2025: number;
  pct2026: number;
  deltaPct: number;
  invert: boolean;
  href: string;
}

function deltaClassPct(delta: number, invert: boolean): string {
  if (delta === 0) return "delta-neutral";
  const positive = invert ? delta < 0 : delta > 0;
  return positive ? "delta-up" : "delta-down";
}

function formatDeltaPct(delta: number): string {
  const rounded = Math.round(delta * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return rounded > 0 ? `+${text}%` : `${text}%`;
}

function formatPct(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
}

function deltaHint(invert: boolean, delta: number): string {
  if (delta === 0) return "Sin cambio";
  const positive = invert ? delta < 0 : delta > 0;
  return positive ? "Mejoró respecto a 2025" : "Empeoró respecto a 2025";
}

export default function ComparativaNivelFilaMat({
  nivel,
  label,
  desc,
  color,
  pct2025,
  pct2026,
  deltaPct,
  invert,
  href,
}: Props) {
  const deltaCls = deltaClassPct(deltaPct, invert);

  return (
    <Link href={href} className="comparativa-nivel-fila link-ios group" title={`Ver lista · ${label}`}>
      <div className="comparativa-nivel-fila__accent" style={{ backgroundColor: color }} aria-hidden />
      <div className="comparativa-nivel-fila__body">
        <div className="comparativa-nivel-fila__head">
          <div className="min-w-0 flex-1">
            <p className="comparativa-nivel-fila__title">Nivel {nivel}: {label}</p>
            <p className="comparativa-nivel-fila__desc">{desc}</p>
          </div>
          <div className={`comparativa-nivel-fila__delta ${deltaCls}`} title={deltaHint(invert, deltaPct)}>
            <span className="comparativa-nivel-fila__delta-value tabular-nums">{formatDeltaPct(deltaPct)}</span>
          </div>
        </div>

        <div className="comparativa-nivel-fila__bars">
          <div className="comparativa-bar-row">
            <span className="comparativa-bar-row__year comparativa-bar-row__year--2025">2025</span>
            <div className="comparativa-bar-row__track" aria-hidden>
              <div
                className="comparativa-bar-row__fill"
                style={{ width: `${Math.max(pct2025, 2)}%`, backgroundColor: color }}
              />
            </div>
            <span className="comparativa-bar-row__meta tabular-nums">{formatPct(pct2025)}</span>
          </div>
          <div className="comparativa-bar-row">
            <span className="comparativa-bar-row__year comparativa-bar-row__year--2026">2026</span>
            <div className="comparativa-bar-row__track" aria-hidden>
              <div
                className="comparativa-bar-row__fill comparativa-bar-row__fill--2026"
                style={{ width: `${Math.max(pct2026, 2)}%`, backgroundColor: color }}
              />
            </div>
            <span className="comparativa-bar-row__meta tabular-nums">{formatPct(pct2026)}</span>
          </div>
        </div>

        <p className="comparativa-nivel-fila__cta">Ver alumnos →</p>
      </div>
    </Link>
  );
}
