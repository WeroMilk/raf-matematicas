"use client";

interface Row {
  label: string;
  value: string | number;
  color: string;
}

interface Props {
  title: string;
  rows: Row[];
  onClose: () => void;
}

export default function ChartTouchTip({ title, rows, onClose }: Props) {
  return (
    <div className="chart-touch-tip mt-1.5 flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-1 space-y-0.5">
          {rows.map((row) => (
            <p key={row.label} className="font-medium" style={{ color: row.color }}>
              {row.label}: {row.value}
            </p>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="touch-target flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-[var(--fill-tertiary)] text-base font-semibold text-foreground/70 active:bg-[var(--fill-secondary)]"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
