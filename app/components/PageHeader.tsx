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
  belowLogoOnMobile,
  className = "",
}: {
  children: React.ReactNode;
  centerContent?: React.ReactNode;
  /** En móvil se muestra debajo del logo (derecha); en desktop pasa al área central. */
  belowLogoOnMobile?: React.ReactNode;
  className?: string;
}) {
  const showCenterRow = centerContent || belowLogoOnMobile;

  return (
    <header
      className={`shrink-0 flex flex-col gap-2 min-h-0 sm:flex-row sm:flex-nowrap sm:items-start sm:justify-between sm:gap-2 ${className}`}
    >
      <div className="flex flex-row flex-nowrap items-start justify-between gap-2 sm:contents">
        <div className="min-w-0 flex-1 order-1">{children}</div>
        <div className="order-3 flex shrink-0 flex-col items-end gap-1.5 self-start sm:ml-auto">
          <LogoSonoraSec maxWidth={160} className="hidden sm:block" />
          <LogoSonoraSec maxWidth={130} className="sm:hidden" compact />
          {belowLogoOnMobile && (
            <div className="w-[min(calc(100vw-5.5rem),13.5rem)] sm:hidden">{belowLogoOnMobile}</div>
          )}
        </div>
      </div>
      {showCenterRow && (
        <div
          className={`order-2 flex shrink-0 flex-col gap-2 sm:mb-0 sm:mr-4 sm:flex-row sm:items-center sm:self-center ${
            centerContent ? "mb-3" : "hidden sm:flex"
          }`}
        >
          {belowLogoOnMobile && <div className="hidden sm:block">{belowLogoOnMobile}</div>}
          {centerContent}
        </div>
      )}
    </header>
  );
}
