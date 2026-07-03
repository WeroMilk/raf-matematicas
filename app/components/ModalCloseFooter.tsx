"use client";

interface Props {
  onClose: () => void;
  label?: string;
}

export default function ModalCloseFooter({ onClose, label = "Cerrar" }: Props) {
  return (
    <div className="border-t border-[var(--border)] bg-[var(--card)] px-5 py-3">
      <button
        type="button"
        onClick={onClose}
        className="btn-ios touch-target w-full cursor-pointer rounded-xl bg-[var(--guinda)] py-3.5 text-sm font-semibold text-white active:opacity-90"
      >
        {label}
      </button>
    </div>
  );
}
