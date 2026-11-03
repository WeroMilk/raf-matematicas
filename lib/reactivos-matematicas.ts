import type { EvaluacionId } from "@/types/raf";

/** Metadata de cada reactivo del diagnóstico RAF Matemáticas */

export interface ReactivoInfo {
  numero: number;
  pregunta: string;
  opciones: { letra: string; texto: string }[];
  respuestaCorrecta: string; // A, B, C o D
  evalua: string;
  argumentacion: string;
}

/** RAF Despegue 2026 — examen diagnóstico (20 reactivos). */
export const REACTIVOS_DESPEGUE_2025: ReactivoInfo[] = [
  {
    numero: 1,
    pregunta:
      "El dueño de un negocio elaboró dos cheques para pagar a sus proveedores. El primer cheque lo hizo por la cantidad de dos mil quinientos cinco pesos y el segundo por la cantidad de trece mil setecientos sesenta y dos pesos. ¿Cuánto dinero pagó en total?",
    opciones: [
      { letra: "a", texto: "$15267" },
      { letra: "b", texto: "$16267" },
      { letra: "c", texto: "$16312" },
      { letra: "d", texto: "$16177" },
    ],
    respuestaCorrecta: "B",
    evalua: "Suma de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números naturales: 2505 + 13762 = 16267.",
  },
  {
    numero: 2,
    pregunta: "En una biblioteca hay 125 libros de ciencias y 78 de matemáticas. ¿Cuántos libros hay en total?",
    opciones: [
      { letra: "a", texto: "103" },
      { letra: "b", texto: "193" },
      { letra: "c", texto: "203" },
      { letra: "d", texto: "905" },
    ],
    respuestaCorrecta: "C",
    evalua: "Suma de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números naturales: 125 + 78 = 203.",
  },
  {
    numero: 3,
    pregunta: "En una caja había 240 lápices y se repartieron 95. ¿Cuántos lápices quedaron?",
    opciones: [
      { letra: "a", texto: "135" },
      { letra: "b", texto: "145" },
      { letra: "c", texto: "155" },
      { letra: "d", texto: "165" },
    ],
    respuestaCorrecta: "B",
    evalua: "Resta de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de números naturales: 240 − 95 = 145.",
  },
  {
    numero: 4,
    pregunta: "Una caja contiene 36 paquetes de galletas y cada paquete tiene 12 galletas. ¿Cuántas galletas hay en total?",
    opciones: [
      { letra: "a", texto: "108" },
      { letra: "b", texto: "332" },
      { letra: "c", texto: "422" },
      { letra: "d", texto: "432" },
    ],
    respuestaCorrecta: "D",
    evalua: "Multiplicación de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números naturales: 36 × 12 = 432.",
  },
  {
    numero: 5,
    pregunta: "Hay 756 dulces para repartir en partes iguales entre 54 niños. ¿Cuántos dulces recibe cada niño?",
    opciones: [
      { letra: "a", texto: "10" },
      { letra: "b", texto: "11" },
      { letra: "c", texto: "12" },
      { letra: "d", texto: "14" },
    ],
    respuestaCorrecta: "D",
    evalua: "División (cociente entero)",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números naturales: 756 ÷ 54 = 14.",
  },
  {
    numero: 6,
    pregunta: "Luis compró 2.5 kg de arroz y 1.75 kg de frijol. ¿Cuántos kilogramos compró en total?",
    opciones: [
      { letra: "a", texto: "3.25 kg" },
      { letra: "b", texto: "3.75 kg" },
      { letra: "c", texto: "4.25 kg" },
      { letra: "d", texto: "4.75 kg" },
    ],
    respuestaCorrecta: "C",
    evalua: "Suma de números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números decimales: 2.5 + 1.75 = 4.25.",
  },
  {
    numero: 7,
    pregunta: "Ana tenía 50 pesos y gastó 12.75 pesos en una libreta. ¿Cuánto dinero le quedó?",
    opciones: [
      { letra: "a", texto: "36.75" },
      { letra: "b", texto: "37.25" },
      { letra: "c", texto: "37.35" },
      { letra: "d", texto: "38.35" },
    ],
    respuestaCorrecta: "B",
    evalua: "Resta de números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de números decimales: 50 − 12.75 = 37.25.",
  },
  {
    numero: 8,
    pregunta:
      "Una maestra dictó a sus alumnos la siguiente operación para practicar la lectura de números decimales: “Siete enteros y tres centésimas menos seis décimas”. ¿Cuál es el resultado de la operación?",
    opciones: [
      { letra: "a", texto: "6.43" },
      { letra: "b", texto: "6.403" },
      { letra: "c", texto: "6.97" },
      { letra: "d", texto: "7.63" },
    ],
    respuestaCorrecta: "A",
    evalua: "Resta de números decimales",
    argumentacion: "Para responder acertadamente, el alumno identifica 7.03 − 0.6 y efectúa la resta: 6.43.",
  },
  {
    numero: 9,
    pregunta:
      "Lucero desea colocar una botella de refresco de 3.5 litros en cada una de las 15 mesas de un salón de fiestas. ¿Cuántos litros de refresco necesitará en total?",
    opciones: [
      { letra: "a", texto: "5.25" },
      { letra: "b", texto: "18.5" },
      { letra: "c", texto: "45.0" },
      { letra: "d", texto: "52.5" },
    ],
    respuestaCorrecta: "D",
    evalua: "Multiplicación con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números decimales: 3.5 × 15 = 52.5.",
  },
  {
    numero: 10,
    pregunta: "Si el litro de gasolina cuesta 23.26 pesos, ¿cuánto costarán 6.5 litros?",
    opciones: [
      { letra: "a", texto: "$150.95" },
      { letra: "b", texto: "$151.16" },
      { letra: "c", texto: "$151.19" },
      { letra: "d", texto: "$151.90" },
    ],
    respuestaCorrecta: "C",
    evalua: "Multiplicación con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números decimales: 23.26 × 6.5 = 151.19.",
  },
  {
    numero: 11,
    pregunta:
      "Sofía tiene 10.5 metros de listón y quiere elaborar moños. Si para cada moño ocupa 0.7 metros, ¿cuántos moños podrá hacer?",
    opciones: [
      { letra: "a", texto: "13" },
      { letra: "b", texto: "14" },
      { letra: "c", texto: "15" },
      { letra: "d", texto: "16" },
    ],
    respuestaCorrecta: "C",
    evalua: "División con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números decimales: 10.5 ÷ 0.7 = 15.",
  },
  {
    numero: 12,
    pregunta:
      "Don Raúl elaboró 7.2 kg de chorizo casero y desea repartirlo en 12 bolsitas con la misma cantidad. ¿Cuántos kilogramos de chorizo deberá empacar en cada bolsita?",
    opciones: [
      { letra: "a", texto: "0.5 kg" },
      { letra: "b", texto: "0.6 kg" },
      { letra: "c", texto: "0.7 kg" },
      { letra: "d", texto: "1.2 kg" },
    ],
    respuestaCorrecta: "B",
    evalua: "División con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números decimales: 7.2 ÷ 12 = 0.6.",
  },
  {
    numero: 13,
    pregunta:
      "El perímetro de un triángulo equilátero se calcula sumando sus tres lados iguales. Si uno de sus lados mide 5/6 m, ¿cuánto medirá su perímetro?",
    opciones: [
      { letra: "a", texto: "5/9 m" },
      { letra: "b", texto: "5/2 m" },
      { letra: "c", texto: "4/3 m" },
      { letra: "d", texto: "5/6 m" },
    ],
    respuestaCorrecta: "B",
    evalua: "Perímetro con fracciones",
    argumentacion: "Para responder acertadamente, el alumno multiplica el lado por 3: 3 × 5/6 = 15/6 = 5/2 m.",
  },
  {
    numero: 14,
    pregunta:
      "Mario bebió por la mañana 3/10 de litro de jugo y 1/2 de litro de agua. ¿Cuánto líquido bebió en total por la mañana?",
    opciones: [
      { letra: "a", texto: "3/5 litros" },
      { letra: "b", texto: "1/5 litros" },
      { letra: "c", texto: "4/5 litros" },
      { letra: "d", texto: "17/20 litros" },
    ],
    respuestaCorrecta: "C",
    evalua: "Suma de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de fracciones: 3/10 + 5/10 = 8/10 = 4/5.",
  },
  {
    numero: 15,
    pregunta:
      "La mamá de Carlos compró 8/4 kg de tomate, de los cuales utilizó 3/4 kg para hacer una salsa. ¿Cuántos kilogramos le quedaron después de hacer la salsa?",
    opciones: [
      { letra: "a", texto: "1/4 kg" },
      { letra: "b", texto: "5/4 kg" },
      { letra: "c", texto: "4/4 kg" },
      { letra: "d", texto: "11/8 kg" },
    ],
    respuestaCorrecta: "B",
    evalua: "Resta de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de fracciones: 8/4 − 3/4 = 5/4 kg.",
  },
  {
    numero: 16,
    pregunta: "Miriam compró 8 3/8 m de tela, pero solo utilizó 6 1/4 m para hacer un vestido. ¿Cuántos metros de tela le sobraron?",
    opciones: [
      { letra: "a", texto: "2 2/4 m" },
      { letra: "b", texto: "2 1/4 m" },
      { letra: "c", texto: "2 1/8 m" },
      { letra: "d", texto: "2 2/32 m" },
    ],
    respuestaCorrecta: "C",
    evalua: "Resta de fracciones",
    argumentacion: "Para responder acertadamente, el alumno resta números mixtos: 8 3/8 − 6 1/4 = 2 1/8 m.",
  },
  {
    numero: 17,
    pregunta:
      "El área de un rectángulo se calcula multiplicando la base por la altura. Si un rectángulo tiene una base de 2/5 m y una altura de 2/8 m, ¿cuál es su área?",
    opciones: [
      { letra: "a", texto: "9/13 m²" },
      { letra: "b", texto: "16/35 m²" },
      { letra: "c", texto: "2/20 m²" },
      { letra: "d", texto: "40/14 m²" },
    ],
    respuestaCorrecta: "C",
    evalua: "Multiplicación de fracciones",
    argumentacion: "Para responder acertadamente, el alumno multiplica las fracciones: 2/5 × 2/8 = 4/40 = 2/20 m².",
  },
  {
    numero: 18,
    pregunta: "Es el resultado de efectuar la siguiente operación: (5/6)(1/3) =",
    opciones: [
      { letra: "a", texto: "5/18" },
      { letra: "b", texto: "5/2" },
      { letra: "c", texto: "5/15" },
      { letra: "d", texto: "4/3" },
    ],
    respuestaCorrecta: "A",
    evalua: "Multiplicación de fracciones",
    argumentacion: "Para responder acertadamente, el alumno multiplica las fracciones: 5/6 × 1/3 = 5/18.",
  },
  {
    numero: 19,
    pregunta: "Rosa hace pasteles y para hacer cada uno utiliza 3/4 kg de harina. ¿Cuántos pasteles podrá hacer con 5 1/4 kg de harina?",
    opciones: [
      { letra: "a", texto: "2" },
      { letra: "b", texto: "4" },
      { letra: "c", texto: "6" },
      { letra: "d", texto: "7" },
    ],
    respuestaCorrecta: "D",
    evalua: "División de fracciones",
    argumentacion: "Para responder acertadamente, el alumno divide: 5 1/4 ÷ 3/4 = 21/4 × 4/3 = 7.",
  },
  {
    numero: 20,
    pregunta: "Es el resultado de efectuar la siguiente operación: 5/6 ÷ 1/3 =",
    opciones: [
      { letra: "a", texto: "5/18" },
      { letra: "b", texto: "6/9" },
      { letra: "c", texto: "15/6" },
      { letra: "d", texto: "4/3" },
    ],
    respuestaCorrecta: "C",
    evalua: "División de fracciones",
    argumentacion: "Para responder acertadamente, el alumno divide fracciones: 5/6 ÷ 1/3 = 5/6 × 3/1 = 15/6.",
  },
];

/** RAF Aterrizaje 2027 — Examen Final RAF Matemáticas. */
export const REACTIVOS_ATERRIZAJE_2026: ReactivoInfo[] = [
  {
    numero: 1,
    pregunta:
      "En una granja hay 148 gallinas y 92 patos. ¿Cuántas aves hay en total?",
    opciones: [
      { letra: "a", texto: "230" },
      { letra: "b", texto: "240" },
      { letra: "c", texto: "250" },
      { letra: "d", texto: "210" },
    ],
    respuestaCorrecta: "B",
    evalua: "Suma de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números naturales.",
  },
  {
    numero: 2,
    pregunta:
      "En una tienda había 350 dulces y se vendieron 128. ¿Cuántos dulces quedaron?",
    opciones: [
      { letra: "a", texto: "222" },
      { letra: "b", texto: "232" },
      { letra: "c", texto: "228" },
      { letra: "d", texto: "200" },
    ],
    respuestaCorrecta: "A",
    evalua: "Resta de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de números naturales.",
  },
  {
    numero: 3,
    pregunta:
      "Una caja contiene 24 paquetes de jugo y cada paquete tiene 10 jugos. ¿Cuántos jugos hay en total?",
    opciones: [
      { letra: "a", texto: "240" },
      { letra: "b", texto: "220" },
      { letra: "c", texto: "200" },
      { letra: "d", texto: "250" },
    ],
    respuestaCorrecta: "A",
    evalua: "Multiplicación de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números naturales.",
  },
  {
    numero: 4,
    pregunta:
      "Si tienes 72 pelotas de ping pong y quieres repartirlas equitativamente entre 6 amigos, ¿cuántas pelotas le tocan a cada amigo?",
    opciones: [
      { letra: "a", texto: "10" },
      { letra: "b", texto: "11" },
      { letra: "c", texto: "12" },
      { letra: "d", texto: "14" },
    ],
    respuestaCorrecta: "C",
    evalua: "División (cociente entero)",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números naturales.",
  },
  {
    numero: 5,
    pregunta:
      "En un evento se colocará una garrafa de agua de 4.25 litros en cada una de las 12 mesas. ¿Cuántos litros de agua se necesitan?",
    opciones: [
      { letra: "a", texto: "50.00 litros" },
      { letra: "b", texto: "50.90 litros" },
      { letra: "c", texto: "51.00 litros" },
      { letra: "d", texto: "510.0 litros" },
    ],
    respuestaCorrecta: "C",
    evalua: "Multiplicación con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números decimales.",
  },
  {
    numero: 6,
    pregunta:
      "Martha compró 3.25 kg de azúcar y 2.75 kg de harina. ¿Cuántos kilogramos compró en total?",
    opciones: [
      { letra: "a", texto: "5.00 kg" },
      { letra: "b", texto: "5.25 kg" },
      { letra: "c", texto: "6.00 kg" },
      { letra: "d", texto: "6.25 kg" },
    ],
    respuestaCorrecta: "C",
    evalua: "Suma de números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números decimales.",
  },
  {
    numero: 7,
    pregunta: "Una maestra dictó la operación 5.2 – 0.04. ¿Cuál es el resultado?",
    opciones: [
      { letra: "a", texto: "5.16" },
      { letra: "b", texto: "5.18" },
      { letra: "c", texto: "4.98" },
      { letra: "d", texto: "5.02" },
    ],
    respuestaCorrecta: "A",
    evalua: "Resta de números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de números decimales.",
  },
  {
    numero: 8,
    pregunta:
      "Laura tiene 9.6 metros de tela y quiere hacer cortinas usando 1.2 m por cortina. ¿Cuántas cortinas puede hacer?",
    opciones: [
      { letra: "a", texto: "6" },
      { letra: "b", texto: "7" },
      { letra: "c", texto: "8" },
      { letra: "d", texto: "9" },
    ],
    respuestaCorrecta: "C",
    evalua: "División con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números decimales.",
  },
  {
    numero: 9,
    pregunta:
      "Juan corrió 5/8 km por la mañana y 3/4 km por la noche. ¿Cuánto corrió en total?",
    opciones: [
      { letra: "a", texto: "8/12 km" },
      { letra: "b", texto: "8/32 km" },
      { letra: "c", texto: "11/4 km" },
      { letra: "d", texto: "11/8 km" },
    ],
    respuestaCorrecta: "D",
    evalua: "Suma de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números fraccionarios.",
  },
  {
    numero: 10,
    pregunta:
      "La mamá de Kike compró un queso de 3 kg. Para preparar caldo de queso utilizó 3/4 kg. ¿Cuántos kilogramos le quedaron después de hacer el caldo?",
    opciones: [
      { letra: "a", texto: "1/4 kg" },
      { letra: "b", texto: "5/4 kg" },
      { letra: "c", texto: "9/4 kg" },
      { letra: "d", texto: "13/4 kg" },
    ],
    respuestaCorrecta: "C",
    evalua: "Resta de fracciones",
    argumentacion:
      "Para responder acertadamente, el alumno convierte un número entero en fracción y efectúa la resta de números fraccionarios.",
  },
  {
    numero: 11,
    pregunta:
      "El área de un rectángulo se calcula multiplicando la base por la altura. Si un rectángulo tiene una base de 1/8 m y una altura de 3/5 m, ¿cuál es su área?",
    opciones: [
      { letra: "a", texto: "3/40 m²" },
      { letra: "b", texto: "40/3 m²" },
      { letra: "c", texto: "24/5 m²" },
      { letra: "d", texto: "5/24 m²" },
    ],
    respuestaCorrecta: "A",
    evalua: "Multiplicación de fracciones",
    argumentacion:
      "Para responder acertadamente, el alumno efectúa la multiplicación de números fraccionarios y simplifica la fracción resultante.",
  },
  {
    numero: 12,
    pregunta:
      "En una fiesta prepararon 36/8 de litros de jugo para servir en vasos que tienen capacidad de 2/8 de litro. ¿Cuántos vasos se pueden llenar completamente con el jugo disponible?",
    opciones: [
      { letra: "a", texto: "6" },
      { letra: "b", texto: "12" },
      { letra: "c", texto: "18" },
      { letra: "d", texto: "24" },
    ],
    respuestaCorrecta: "C",
    evalua: "División de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números fraccionarios.",
  },
];

/** @deprecated Usar REACTIVOS_DESPEGUE_2025 o getReactivosPorEvaluacion */
export const REACTIVOS_MATEMATICAS = REACTIVOS_DESPEGUE_2025;

const REACTIVOS_POR_EVAL = {
  "despegue-2025": REACTIVOS_DESPEGUE_2025,
  "aterrizaje-2026": REACTIVOS_ATERRIZAJE_2026,
} satisfies Record<EvaluacionId, ReactivoInfo[]>;

export function getReactivosPorEvaluacion(evalId: EvaluacionId): ReactivoInfo[] {
  return REACTIVOS_POR_EVAL[evalId];
}

export function getClaveRespuestas(evalId: EvaluacionId): string[] {
  return getReactivosPorEvaluacion(evalId).map((r) => r.respuestaCorrecta);
}

export function getReactivoInfo(
  numero: number,
  evalId: EvaluacionId = "despegue-2025"
): ReactivoInfo | undefined {
  return getReactivosPorEvaluacion(evalId).find((r) => r.numero === numero);
}
