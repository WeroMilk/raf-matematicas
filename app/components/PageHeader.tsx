"use client";

import LogoSonoraSec from "@/app/components/LogoSonoraSec";

/**
 * Header compartido para todas las pantallas (excepto login).
 * El logo Sonora siempre aparece en la esquina superior derecha,
 * tanto en desktop como en móvil.
 * centerContent: contenido opcional entre el título y el logo (ej: filtro zona).
 */
export default function PageHeader({
  children,
  centerContent,
  className = "",
}: {
  children: React.ReactNode;
  centerContent?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`shrink-0 flex flex-row flex-nowrap items-start justify-between gap-2 min-h-0 ${className}`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {centerContent && (
        <div className="flex shrink-0 self-center mr-4">
          {centerContent}
        </div>
      )}
      <div className="flex shrink-0 self-start ml-auto">
        <LogoSonoraSec maxWidth={160} className="hidden sm:block" />
        <LogoSonoraSec maxWidth={130} className="sm:hidden" compact />
      </div>
    </header>
  );
}
