"use client";

import LogoSonoraSec from "@/app/components/LogoSonoraSec";

function MobileLogo({ narrow = false }: { narrow?: boolean }) {
  return <LogoSonoraSec maxWidth={narrow ? 100 : 120} compact className="page-header-mobile__logo" />;
}

function MobileControlsRow({
  centerContent,
  belowLogoOnMobile,
  narrow = false,
}: {
  centerContent?: React.ReactNode;
  belowLogoOnMobile?: React.ReactNode;
  narrow?: boolean;
}) {
  if (!centerContent && !belowLogoOnMobile) return null;

  return (
    <div className={`page-header-mobile__controls flex items-center gap-1.5 ${narrow ? "w-full" : ""}`}>
      {centerContent && <div className="page-header-mobile__zona min-w-[5.75rem] max-w-[8rem] shrink-0">{centerContent}</div>}
      {belowLogoOnMobile && (
        <div
          className={
            narrow
              ? "shrink-0 w-[min(calc(100vw-6.5rem),12.5rem)]"
              : "w-[min(calc(100vw-5.5rem),13.5rem)] shrink-0 justify-self-end"
          }
        >
          {belowLogoOnMobile}
        </div>
      )}
    </div>
  );
}

/**
 * Header compartido para todas las pantallas (excepto login).
 * Logo Sonora siempre en la esquina superior derecha.
 * Pantallas ≤400px: apilado (título | logo, luego zona + selector).
 * Móvil ancho: [título o ←] · [zona] · [logo] en fila superior.
 */
export default function PageHeader({
  children,
  centerContent,
  belowLogoOnMobile,
  leadingOnMobile,
  className = "",
}: {
  children: React.ReactNode;
  centerContent?: React.ReactNode;
  belowLogoOnMobile?: React.ReactNode;
  leadingOnMobile?: React.ReactNode;
  className?: string;
}) {
  const showControls = centerContent || belowLogoOnMobile;
  const hasZona = !!centerContent;

  return (
    <header className={`shrink-0 min-h-0 ${className}`}>
      {/* Móvil estrecho (≤400px): sin solapamientos */}
      <div className="flex flex-col gap-1.5 md:hidden min-[401px]:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pr-1">
            {leadingOnMobile}
            {!leadingOnMobile && children}
          </div>
          <MobileLogo narrow />
        </div>

        {leadingOnMobile && <div className="min-w-0">{children}</div>}

        <MobileControlsRow centerContent={centerContent} belowLogoOnMobile={belowLogoOnMobile} narrow />
      </div>

      {/* Móvil ancho (401px–767px) con zona */}
      {hasZona && (
        <div
          className={`hidden min-[401px]:grid min-w-0 grid-rows-[auto_auto] items-start gap-x-1.5 gap-y-1.5 md:hidden ${
            leadingOnMobile ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[minmax(0,1fr)_auto_auto]"
          }`}
        >
          {leadingOnMobile ? (
            <div className="col-start-1 row-start-1 shrink-0 self-center">{leadingOnMobile}</div>
          ) : (
            <div className="col-start-1 row-start-1 min-w-0 pr-1">{children}</div>
          )}

          <div
            className={`row-start-1 self-start ${
              leadingOnMobile ? "col-start-2 min-w-[5.75rem] max-w-[8rem]" : "col-start-2 w-[6.25rem] shrink-0"
            }`}
          >
            {centerContent}
          </div>

          <div className="col-start-3 row-start-1 flex shrink-0 flex-col items-end gap-1.5 self-start">
            <MobileLogo />
          </div>

          {leadingOnMobile && <div className="col-span-2 col-start-1 row-start-2 min-w-0">{children}</div>}

          {belowLogoOnMobile && (
            <div className="col-start-3 row-start-2 w-[min(calc(100vw-5.5rem),13.5rem)] justify-self-end self-end">
              {belowLogoOnMobile}
            </div>
          )}
        </div>
      )}

      {/* Móvil ancho sin zona */}
      {!hasZona && (
        <div className="hidden min-[401px]:grid min-w-0 grid-cols-[1fr_auto] items-start gap-x-2 gap-y-1.5 md:hidden">
          <div className="col-start-1 row-start-1 min-w-0 pr-1">{children}</div>
          <div className="col-start-2 row-start-1 flex shrink-0 flex-col items-end gap-1.5 self-start">
            <MobileLogo />
            {belowLogoOnMobile && (
              <div className="w-[min(calc(100vw-5.5rem),13.5rem)]">{belowLogoOnMobile}</div>
            )}
          </div>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden min-w-0 items-start justify-between gap-3 md:flex">
        <div className="min-w-0 flex-1">
          {leadingOnMobile && <div className="mb-2">{leadingOnMobile}</div>}
          {children}
        </div>

        {showControls && (
          <div className="flex shrink-0 items-center gap-3 self-center">
            {belowLogoOnMobile}
            {centerContent}
          </div>
        )}

        <div className="shrink-0">
          <LogoSonoraSec maxWidth={160} />
        </div>
      </div>
    </header>
  );
}
