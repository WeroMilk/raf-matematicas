interface Props {
  escuelasConDatos: number;
  escuelasTotales: number;
  totalAlumnos2026: number;
}

export default function BannerCobertura2026({
  escuelasConDatos,
  escuelasTotales,
  totalAlumnos2026,
}: Props) {
  return (
    <div className="info-banner">
      <svg className="mt-0.5 size-4 shrink-0 text-[#2E7D32]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>
        <span className="font-semibold text-[#2E7D32]">Aterrizaje 2026 — datos parciales: </span>
        {escuelasConDatos} de {escuelasTotales} escuelas · {totalAlumnos2026.toLocaleString("es-MX")} alumnos
        evaluados. La comparativa solo incluye alumnos con datos en ambas evaluaciones.
      </p>
    </div>
  );
}
