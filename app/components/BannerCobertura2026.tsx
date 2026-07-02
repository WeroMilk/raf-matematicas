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
    <div className="rounded-xl border border-[#2E7D32]/30 bg-[#2E7D32]/8 px-3 py-2 text-xs text-foreground/85">
      <span className="font-semibold text-[#2E7D32]">Aterrizaje 2026 — datos parciales: </span>
      {escuelasConDatos} de {escuelasTotales} escuelas · {totalAlumnos2026.toLocaleString("es-MX")} alumnos
      evaluados. La comparativa solo incluye alumnos con datos en ambas evaluaciones.
    </div>
  );
}
