/** Metadata de cada reactivo del diagnóstico RAF Matemáticas */

export interface ReactivoInfo {
  numero: number;
  pregunta: string;
  opciones: { letra: string; texto: string }[];
  respuestaCorrecta: string; // A, B, C o D
  evalua: string;
  argumentacion: string;
}

export const REACTIVOS_MATEMATICAS: ReactivoInfo[] = [
  {
    numero: 1,
    pregunta: "Un grupo de niños recolectó 126 manzanas en un árbol y 97 manzanas en otro árbol. ¿Cuántas manzanas recolectaron en total?",
    opciones: [
      { letra: "a", texto: "113" },
      { letra: "b", texto: "1113" },
      { letra: "c", texto: "223" },
      { letra: "d", texto: "126" },
    ],
    respuestaCorrecta: "C",
    evalua: "Suma de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números naturales.",
  },
  {
    numero: 2,
    pregunta: "En una granja había 150 cerdos, pero vendieron 90. ¿Cuántos cerdos quedan en la granja?",
    opciones: [
      { letra: "a", texto: "80" },
      { letra: "b", texto: "60" },
      { letra: "c", texto: "40" },
      { letra: "d", texto: "140" },
    ],
    respuestaCorrecta: "B",
    evalua: "Resta de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de números naturales.",
  },
  {
    numero: 3,
    pregunta: "Un agricultor tiene 15 surcos de vegetales en su huerto y cada surco tiene 19 plantas. ¿Cuántas plantas tiene en total?",
    opciones: [
      { letra: "a", texto: "285" },
      { letra: "b", texto: "94" },
      { letra: "c", texto: "60" },
      { letra: "d", texto: "300" },
    ],
    respuestaCorrecta: "A",
    evalua: "Multiplicación de números naturales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números naturales.",
  },
  {
    numero: 4,
    pregunta: "Si tienes 80 caramelos y quieres compartirlos equitativamente entre 7 amigos, ¿cuántos caramelos completos le tocan a cada uno?",
    opciones: [
      { letra: "a", texto: "10" },
      { letra: "b", texto: "11" },
      { letra: "c", texto: "12" },
      { letra: "d", texto: "8" },
    ],
    respuestaCorrecta: "B",
    evalua: "División (cociente entero)",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números naturales.",
  },
  {
    numero: 5,
    pregunta: "Se pondrá vitropiso en un área de 25 m². Si el m² tiene un costo de $223.90, ¿cuánto se pagará por el piso?",
    opciones: [
      { letra: "a", texto: "$ 5597.50" },
      { letra: "b", texto: "$ 1567.30" },
      { letra: "c", texto: "$ 1119.50" },
      { letra: "d", texto: "$ 55 975" },
    ],
    respuestaCorrecta: "A",
    evalua: "Multiplicación con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números decimales.",
  },
  {
    numero: 6,
    pregunta: "Laura fue al mercado y compró 1.5 kg de tomate, 0.375 kg de chile serrano, 0.5 kg de cebolla, 0.250 kg de apio y 2.060 kg de repollo. ¿Cuál es el peso total de todo lo que compró?",
    opciones: [
      { letra: "a", texto: "4.685 kg" },
      { letra: "b", texto: "2.705 kg" },
      { letra: "c", texto: "1.481 kg" },
      { letra: "d", texto: "3.585 kg" },
    ],
    respuestaCorrecta: "A",
    evalua: "Suma de números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números decimales.",
  },
  {
    numero: 7,
    pregunta: "Mauricio rompió su alcancía para comprarse unos airpods con un costo de $3299.75. Si tiene ahorrado $5325.50, ¿cuánto dinero le sobrará?",
    opciones: [
      { letra: "a", texto: "$ 2025.75" },
      { letra: "b", texto: "$ 2174.25" },
      { letra: "c", texto: "$ 2026" },
      { letra: "d", texto: "$ 1026.75" },
    ],
    respuestaCorrecta: "A",
    evalua: "Resta de números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la resta de números decimales.",
  },
  {
    numero: 8,
    pregunta: "Sofía tiene 14.45 metros de listón y quiere elaborar moños. Si para cada moño ocupa 0.85 metros, ¿cuántos moños podrá hacer?",
    opciones: [
      { letra: "a", texto: "17" },
      { letra: "b", texto: "27" },
      { letra: "c", texto: "10" },
      { letra: "d", texto: "8" },
    ],
    respuestaCorrecta: "A",
    evalua: "División con números decimales",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números decimales.",
  },
  {
    numero: 9,
    pregunta: "Mario bebió por la mañana 3/4 de litro de jugo y 2/5 de litro de agua. ¿Cuánto líquido bebió en total por la mañana?",
    opciones: [
      { letra: "a", texto: "5/9 litros" },
      { letra: "b", texto: "5/20 litros" },
      { letra: "c", texto: "23/20 litros" },
      { letra: "d", texto: "6/9 litros" },
    ],
    respuestaCorrecta: "C",
    evalua: "Suma de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la suma de números fraccionarios.",
  },
  {
    numero: 10,
    pregunta: "La mamá de Carlos compró 2 kg de tomate de los cuales utilizó 3/4 kg para hacer una salsa. ¿Cuántos kilogramos le quedaron después de hacer la salsa?",
    opciones: [
      { letra: "a", texto: "1/4 kg" },
      { letra: "b", texto: "3/4 kg" },
      { letra: "c", texto: "4/4 kg" },
      { letra: "d", texto: "5/4 kg" },
    ],
    respuestaCorrecta: "D",
    evalua: "Resta de fracciones",
    argumentacion: "Para responder acertadamente, el alumno convierte un número entero en fracción y efectúa la resta de números fraccionarios.",
  },
  {
    numero: 11,
    pregunta: "El área de un rectángulo se calcula multiplicando la base por la altura. Si un rectángulo tiene una base de 2/5 m y una altura de 7/8 m, ¿cuál es su área?",
    opciones: [
      { letra: "a", texto: "9/13 m²" },
      { letra: "b", texto: "40/14 m²" },
      { letra: "c", texto: "7/20 m²" },
      { letra: "d", texto: "20/7 m²" },
    ],
    respuestaCorrecta: "C",
    evalua: "Multiplicación de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la multiplicación de números fraccionarios y simplifica la fracción resultante.",
  },
  {
    numero: 12,
    pregunta: "Karla hace moños y para hacer cada uno utiliza 3/4 m de listón. ¿Cuántos moños podrá hacer con 23/4 m de listón?",
    opciones: [
      { letra: "a", texto: "69/16" },
      { letra: "b", texto: "12/92" },
      { letra: "c", texto: "92/12" },
      { letra: "d", texto: "16/69" },
    ],
    respuestaCorrecta: "C",
    evalua: "División de fracciones",
    argumentacion: "Para responder acertadamente, el alumno efectúa la división de números fraccionarios.",
  },
];

export function getReactivoInfo(numero: number): ReactivoInfo | undefined {
  return REACTIVOS_MATEMATICAS.find((r) => r.numero === numero);
}
