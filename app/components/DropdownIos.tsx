"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";

export type DropdownOption = { value: string; label: string };

interface Props {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  ariaLabel?: string;
  className?: string;
  minPanelWidth?: number;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-foreground/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function DropdownIos({
  options,
  value,
  onChange,
  placeholder = "Seleccionar",
  title,
  ariaLabel,
  className = "",
  minPanelWidth = 220,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;
  const sheetTitle = title ?? ariaLabel ?? placeholder;

  const handleSelect = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
    },
    [onChange]
  );

  const updateLayout = useCallback(() => {
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    setIsMobile(mobile);
    if (open && !mobile && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuRect({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, minPanelWidth),
      });
    } else {
      setMenuRect(null);
    }
  }, [open, minPanelWidth]);

  useEffect(() => {
    updateLayout();
    if (!open) return;
    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout, true);
    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout, true);
    };
  }, [open, updateLayout]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = isMobile ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, isMobile]);

  const optionList = (
    <ul role="listbox" id={listId} aria-label={ariaLabel ?? sheetTitle} className="m-0 list-none p-1.5">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <li key={opt.value || "__empty"} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(opt.value)}
              className={`dropdown-ios__option flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors sm:py-2.5 ${
                isSelected
                  ? "bg-[#7b2d3e]/10 text-[#7b2d3e]"
                  : "text-foreground hover:bg-[var(--fill-tertiary)] active:bg-[var(--fill-secondary)]"
              }`}
            >
              <span className="min-w-0 break-words">{opt.label}</span>
              {isSelected && (
                <span className="shrink-0 text-[#7b2d3e]">
                  <CheckIcon />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  const menu =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <div
          className="dropdown-ios__backdrop fixed inset-0 z-[9998] bg-black/25 backdrop-blur-[2px] animate-fade-in"
          onClick={() => setOpen(false)}
          aria-hidden
        />
        {isMobile ? (
          <div
            className="dropdown-ios__sheet fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
            style={{
              paddingTop: "max(1rem, env(safe-area-inset-top))",
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            }}
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={sheetTitle}
            >
              <div className="border-b border-border/60 px-4 py-3">
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  {sheetTitle}
                </p>
              </div>
              <div className="max-h-[min(60dvh,420px)] overflow-y-auto">{optionList}</div>
            </div>
          </div>
        ) : (
          menuRect && (
            <div
              className="dropdown-ios__panel fixed z-[9999] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl animate-scale-in"
              style={{
                top: menuRect.top,
                left: menuRect.left,
                width: menuRect.width,
                maxHeight: `calc(100dvh - ${menuRect.top + 16}px)`,
              }}
            >
              <div className="max-h-[min(320px,calc(100dvh-120px))] overflow-y-auto">{optionList}</div>
            </div>
          )
        )}
      </>,
      document.body
    );

  return (
    <div className={`relative w-full min-w-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="dropdown-ios__trigger select-ios flex w-full min-h-[40px] items-center justify-between gap-2 rounded-xl border border-border bg-[var(--fill-tertiary)] px-3 py-2.5 text-xs font-medium text-foreground shadow-sm transition-[box-shadow,transform,border-color] hover:border-[#7b2d3e]/30 hover:shadow-md active:scale-[0.98] lg:py-2"
      >
        <span className="truncate text-left">{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {menu}
    </div>
  );
}
