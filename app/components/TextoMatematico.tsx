/** Renderiza texto con fracciones (p. ej. 5/8) como numerador/denominador apilados. */
export default function TextoMatematico({ texto }: { texto: string }) {
  const partes = texto.split(/(\d+\/\d+)/g);

  return (
    <>
      {partes.map((parte, i) => {
        const fraccion = parte.match(/^(\d+)\/(\d+)$/);
        if (fraccion) {
          return (
            <span
              key={i}
              className="mx-0.5 inline-flex flex-col align-middle text-center text-[0.88em] leading-none"
              aria-label={`${fraccion[1]} sobre ${fraccion[2]}`}
            >
              <span className="border-b border-current px-0.5 pb-px">{fraccion[1]}</span>
              <span className="pt-px">{fraccion[2]}</span>
            </span>
          );
        }
        return <span key={i}>{parte}</span>;
      })}
    </>
  );
}
