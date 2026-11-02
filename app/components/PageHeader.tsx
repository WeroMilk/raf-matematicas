"use client";

import LogoSonoraSec from "@/app/components/LogoSonoraSec";

function MobileLogo({ narrow = false }: { narrow?: boolean }) {
  return <LogoSonoraSec maxWidth={narrow ? 128 : 150} compact className="page-header-mobile__logo" />;
}

function MobileControlsRow({
  centerContent,
  belowLogoOnMobile,
}: {
  centerContent?: React.ReactNode;
  belowLogoOnMobile?: React.ReactNode;
}) {
  if (!centerContent && !belowLogoOnMobile) return null;

  return (
    <div className="page-header-mobile__controls flex w-full min-w-0 items-center gap-1.5">
      {centerContent && <div className="page-header-mobile__zona w-[5.75rem] shrink-0">{centerContent}</div>}
      {belowLogoOnMobile && <div className="min-w-0 flex-1">{belowLogoOnMobile}</div>}
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

  return (
    <header className={`shrink-0 min-h-0 ${className}`}>
      <div className="flex min-w-0 flex-col gap-1.5 md:hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pr-1">
            {leadingOnMobile}
            {!leadingOnMobile && children}
          </div>
          <MobileLogo narrow />
        </div>

        {leadingOnMobile && <div className="min-w-0">{children}</div>}

        <MobileControlsRow centerContent={centerContent} belowLogoOnMobile={belowLogoOnMobile} />
      </div>

      {/* Desktop */}
      <div className="hidden min-w-0 items-start justify-between gap-3 md:flex">
        <div className="min-w-0 flex-1">
          {leadingOnMobile && <div className="mb-2">{leadingOnMobile}</div>}
          {children}
        </div>

        {showControls && (
          <div className="flex min-w-0 max-w-[28rem] flex-1 items-center justify-end gap-3 self-center">
            {centerContent && <div className="w-[6.5rem] shrink-0">{centerContent}</div>}
            {belowLogoOnMobile && <div className="min-w-0 flex-1">{belowLogoOnMobile}</div>}
          </div>
        )}

        <div className="shrink-0">
          <LogoSonoraSec maxWidth={210} />
        </div>
      </div>
    </header>
  );
}
