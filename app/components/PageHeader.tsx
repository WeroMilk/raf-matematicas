"use client";

import LogoSonoraSec from "@/app/components/LogoSonoraSec";

/**
 * Header compartido para todas las pantallas (excepto login).
 * El logo Sonora siempre aparece en la esquina superior derecha.
 * centerContent: contenido opcional (ej: filtro zona). En móvil va en fila aparte para mejor responsive.
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
      className={`shrink-0 flex flex-col gap-2 min-h-0 sm:flex-row sm:flex-nowrap sm:items-start sm:justify-between sm:gap-2 ${className}`}
    >
      <div className="flex flex-row flex-nowrap items-start justify-between gap-2 sm:contents">
        <div className="min-w-0 flex-1 order-1">{children}</div>
        <div className="flex shrink-0 self-start order-3 sm:ml-auto">
          <LogoSonoraSec maxWidth={160} className="hidden sm:block" />
          <LogoSonoraSec maxWidth={130} className="sm:hidden" compact />
        </div>
      </div>
      {centerContent && (
        <div className="flex shrink-0 items-center order-2 sm:mr-4 sm:self-center">
          {centerContent}
        </div>
      )}
    </header>
  );
}
