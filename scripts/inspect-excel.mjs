#!/usr/bin/env node
import XLSX from "xlsx";

const path = process.argv[2] || "c:/Users/alfon/Desktop/escritorio/matemáticas/26DST0001P_actualizado.xlsx";

try {
  const wb = XLSX.readFile(path, { type: "file" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  const cols = Object.keys(data[0] || {});
  console.log("Archivo:", path);
  console.log("Columnas totales:", cols.length);
  console.log("\nTodas las columnas:");
  cols.sort().forEach((c) => console.log("  -", c));
  console.log("\nColumnas Mark/Answer/Response/Points/Stu (con valor ejemplo):");
  cols
    .filter((c) => /mark|answer|response|points|^stu\d*$/i.test(c))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    })
    .forEach((c) => {
      console.log("  ", c, ":", JSON.stringify(data[0][c]));
    });
  console.log("\nStu1-Stu12 (posible respuesta del alumno):");
  const row = data[0];
  for (let i = 1; i <= 12; i++) {
    const v = row[`Stu${i}`];
    console.log("  Stu" + i + ":", JSON.stringify(v), "| Mark" + i + ":", JSON.stringify(row["Mark" + i]));
  }
  console.log("\nPrimera fila - datos básicos:");
  ["FirstName", "LastName", "QuizClass"].forEach((k) => {
    if (row[k] != null) console.log("  ", k, ":", JSON.stringify(row[k]));
  });
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
