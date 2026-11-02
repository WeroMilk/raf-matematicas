/**
 * PDF comparativa RAF Matematicas — hoja horizontal por reporte.
 * Genera: 1 global + 1 por zona. Solo ASCII (Helvetica).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CCTS_OCULTOS = new Set(["26DST0000R", "26DST0023A"]);
const NUM_NIVELES = 3;

const PAGE = { w: 842, h: 595, m: 28, gap: 14, pad: 14 };

function txtCentered(doc, text, bx, by, bw, bh, opts = {}) {
  const size = opts.size ?? 8;
  const color = opts.color ?? C.text;
  const bold = opts.bold ?? false;
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
  const tw = doc.widthOfString(String(text));
  const th = size * 1.2;
  const tx = bx + Math.max(0, (bw - tw) / 2);
  const ty = by + Math.max(0, (bh - th) / 2);
  doc.fillColor(color).text(String(text), tx, ty, { lineBreak: false });
}

const ESCUELA_A_ZONA = {
  1: 5, 5: 1, 6: 10, 10: 9, 11: 7, 12: 8, 19: 4, 20: 18, 22: 3, 23: 17, 24: 3,
  25: 1, 26: 17, 27: 12, 28: 17, 42: 8, 48: 11, 51: 12, 53: 17, 54: 12, 55: 1,
  56: 11, 58: 7, 60: 10, 61: 12, 65: 3, 67: 12, 71: 4, 73: 14, 74: 15, 76: 14, 78: 15,
};

const C = {
  sonora: "#7a2533",
  year2025: "#2563eb",
  year2026: "#15803d",
  nivel1: "#fca5a5",
  nivel2: "#fcd34d",
  nivel3: "#86efac",
  text: "#1a1a1a",
  muted: "#64748b",
  border: "#e2e8f0",
  panel: "#f8fafc",
  white: "#ffffff",
  up: "#15803d",
  down: "#dc2626",
};

const NIVEL_NOMBRES = {
  1: { corto: "N1", lineas: ["Requiere", "Apoyo"] },
  2: { corto: "N2", lineas: ["En", "Desarrollo"] },
  3: { corto: "N3", lineas: ["Esperado"] },
};

function txtBlock(doc, text, x, y, opts = {}) {
  const { size = 7.5, color = C.text, width, lineGap = 1 } = opts;
  doc.font("Helvetica").fontSize(size).fillColor(color);
  doc.text(text, x, y, { width, lineGap, lineBreak: true });
  return doc.y - y;
}

function txtBlockSigned(doc, text, x, y, opts = {}) {
  const { size = 6.5, width, lineGap = 0.5 } = opts;
  const parts = String(text).split(/([+-]\d+%)/g).filter((p) => p !== "");
  doc.font("Helvetica").fontSize(size);
  parts.forEach((part, i) => {
    const color = /^\+\d+%$/.test(part) ? C.up : /^-\d+%$/.test(part) ? C.down : C.text;
    const isLast = i === parts.length - 1;
    const options = { width, lineGap, lineBreak: true, continued: !isLast };
    if (i === 0) doc.fillColor(color).text(part, x, y, options);
    else doc.fillColor(color).text(part, options);
  });
  return Math.max(doc.y - y, size * 1.2);
}

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function getNumeroEscuela(cct) {
  const m = String(cct).match(/26DST(\d{4})/i);
  return m ? parseInt(m[1], 10) : null;
}

function getZonaPorCct(cct) {
  const num = getNumeroEscuela(cct);
  return num != null ? (ESCUELA_A_ZONA[num] ?? null) : null;
}

function escuelasVisibles(list) {
  return (list ?? []).filter((e) => !CCTS_OCULTOS.has(e.cct));
}

function roundPercentagesTo100(counts) {
  const safe = counts.map((c) => (Number.isFinite(c) && c > 0 ? c : 0));
  const total = safe.reduce((s, n) => s + n, 0);
  if (total <= 0) return counts.map(() => 0);
  const exact = safe.map((c) => (c / total) * 100);
  const floors = exact.map((p) => Math.floor(p + 1e-9));
  let remaining = 100 - floors.reduce((s, n) => s + n, 0);
  const order = exact
    .map((p, index) => ({ index, frac: p - floors[index], count: safe[index] }))
    .sort((a, b) => b.frac - a.frac || b.count - a.count || a.index - b.index);
  const result = [...floors];
  if (remaining > 0) {
    for (let i = 0; i < remaining && i < order.length; i++) result[order[i].index] += 1;
  } else if (remaining < 0) {
    const rev = [...order].reverse();
    for (let i = 0; i < -remaining && i < rev.length; i++) {
      if (result[rev[i].index] > 0) result[rev[i].index] -= 1;
    }
  }
  return result;
}

function resumenDesdeEscuelas(escuelas) {
  const total = escuelas.reduce((s, e) => s + (e.totalEstudiantes ?? 0), 0);
  const nivel1 = escuelas.reduce((s, e) => s + (e.requiereApoyo ?? 0), 0);
  const nivel2 = escuelas.reduce((s, e) => s + (e.enDesarrollo ?? 0), 0);
  const nivel3 = escuelas.reduce((s, e) => s + (e.esperado ?? 0), 0);
  const [pctN1, pctN2, pctN3] = roundPercentagesTo100([nivel1, nivel2, nivel3]);
  return {
    total,
    nEscuelas: escuelas.filter((e) => (e.totalEstudiantes ?? 0) > 0).length,
    nivel1,
    nivel2,
    nivel3,
    pctN1,
    pctN2,
    pctN3,
  };
}

function calcularDeltaPct(a, b) {
  return {
    nivel1: b.pctN1 - a.pctN1,
    nivel2: b.pctN2 - a.pctN2,
    nivel3: b.pctN3 - a.pctN3,
  };
}

function pctsEscuela(escuela) {
  if (!escuela) return null;
  const counts = [escuela.requiereApoyo ?? 0, escuela.enDesarrollo ?? 0, escuela.esperado ?? 0];
  if (!(escuela.totalEstudiantes > 0) && counts.every((c) => !c)) return null;
  const [pctN1, pctN2, pctN3] = roundPercentagesTo100(counts);
  return { pctN1, pctN2, pctN3 };
}

function deltaPct(p25, p26, key) {
  if (!p25 || !p26) return { val: null, txt: "-" };
  const d = p26[key] - p25[key];
  return { val: d, txt: varLabelPct(d) };
}

function varLabelPct(d) {
  if (d === 0) return "0%";
  return d > 0 ? `+${d}%` : `${d}%`;
}

function panel(doc, x, y, w, h, opts = {}) {
  const { fill = C.white, stroke = C.border, r = 8 } = opts;
  doc.roundedRect(x, y, w, h, r).fill(fill);
  if (stroke) doc.roundedRect(x, y, w, h, r).strokeColor(stroke).lineWidth(0.6).stroke();
}

function txt(doc, text, x, y, opts = {}) {
  const { size = 8, color = C.muted, bold = false, width, align = "left", lineGap = 0 } = opts;
  doc
    .fillColor(color)
    .font(bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(size)
    .text(String(text), x, y, width != null ? { width, align, lineGap } : undefined);
}

function trunc(s, n) {
  const t = String(s ?? "").trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + ".";
}

function esParcial(escuelas25, escuelas26) {
  const map26 = new Map(escuelas26.map((e) => [e.cct, e.totalEstudiantes]));
  return escuelas25.some((e) => (map26.get(e.cct) ?? 0) < e.totalEstudiantes);
}

function generarLecturaPrograma(r25, r26, deltaPct, parcial, extra = {}) {
  const pctAlto25 = r25.pctN3;
  const pctAlto26 = r26.pctN3;
  const varPctAlto = pctAlto26 - pctAlto25;
  const avanceNivelAlto = deltaPct.nivel3 > 0;
  const bajaNivelesBajos = deltaPct.nivel1 + deltaPct.nivel2 < 0;
  const hayAvance = varPctAlto > 0 && avanceNivelAlto;

  let veredicto;
  let colorVeredicto;
  if (hayAvance && bajaNivelesBajos) {
    veredicto = "El programa muestra avance";
    colorVeredicto = C.up;
  } else if (hayAvance) {
    veredicto = "Hay senales de avance";
    colorVeredicto = C.up;
  } else if (varPctAlto === 0 && deltaPct.nivel3 === 0) {
    veredicto = "Sin cambio relevante aun";
    colorVeredicto = C.muted;
  } else {
    veredicto = extra.porSalon ? "Revisar resultados por salon" : "Revisar resultados por escuela";
    colorVeredicto = C.down;
  }

  const ambito = extra.ambito ?? (extra.zona != null ? "esta zona" : "las Secundarias Tecnicas");
  const parrafos = [
    `De Despegue 2026 a Aterrizaje 2027, en ${ambito} los alumnos en nivel Esperado (N3) pasaron del ${pctAlto25}% al ${pctAlto26}% (${r25.total} a ${r26.total} alumnos evaluados).`,
    `Cambio: N3 ${varLabelPct(deltaPct.nivel3)}; N1 ${varLabelPct(deltaPct.nivel1)} y N2 ${varLabelPct(deltaPct.nivel2)}.`,
  ];

  if (extra.global) {
    const g25 = extra.global.r25.pctN3;
    const g26 = extra.global.r26.pctN3;
    const vs = pctAlto26 - g26;
    const vsTxt = vs === 0 ? "igual al global" : vs > 0 ? `${vs}% arriba del global` : `${Math.abs(vs)}% abajo del global`;
    const sujeto = extra.porSalon ? "Esta escuela" : "Esta zona";
    const sujetoCorto = extra.porSalon ? "escuela" : "zona";
    parrafos.push(
      `Referencia global Tecnicas: N3 (Esperado) paso de ${g25}% a ${g26}%. ${sujeto} en 2026 esta ${vsTxt} (${sujetoCorto} ${pctAlto26}% vs global ${g26}%).`
    );
  } else if (parcial) {
    parrafos.push("Los datos de 2026 son parciales; conviene completar la evaluacion en todas las escuelas.");
  } else {
    parrafos.push("Use este reporte para comparar escuelas y zonas. Entregar una hoja global y una hoja de la zona correspondiente.");
  }

  return { veredicto, colorVeredicto, parrafos };
}

function drawLecturaAt(doc, x, y, w, h, lectura) {
  panel(doc, x, y, w, h);
  const p = PAGE.pad;
  const ix = x + p;
  const iw = w - p * 2;
  const bottom = y + h - p;

  txt(doc, "Lectura general", ix, y + p, { size: 8.5, bold: true, color: C.text });
  txt(doc, lectura.veredicto, ix, y + p + 13, { size: 8.5, bold: true, color: lectura.colorVeredicto, width: iw });

  let ly = y + p + 28;
  lectura.parrafos.forEach((parrafo) => {
    if (ly >= bottom - 6) return;
    const usado = txtBlockSigned(doc, parrafo, ix, ly, { size: 6.5, width: iw, lineGap: 0.5 });
    ly += usado + 4;
  });
}

function drawHeader(doc, generado, meta) {
  const { m } = PAGE;
  doc.save().rect(0, 0, PAGE.w, 40).fill(C.sonora).restore();
  const titulo =
    meta.titulo ??
    (meta.zona != null ? `RAF Matematicas  |  Zona ${meta.zona}` : "RAF Matematicas");
  txt(doc, titulo, m, 11, { size: 14, color: "#ffffff", bold: true });
  const sub =
    meta.subtitulo ??
    (meta.zona != null
      ? `Despegue 2026 vs Aterrizaje 2027  |  Secundarias Tecnicas  |  1er grado  |  Compare con el reporte global`
      : `Despegue 2026 vs Aterrizaje 2027  |  Secundarias Tecnicas  |  Primer grado  |  Todas las zonas`);
  txt(doc, sub, m, 26, { size: 8, color: "#ffffff" });
}

function drawYearCard(doc, x, y, w, h, { title, color, r }) {
  panel(doc, x, y, w, h);
  const p = PAGE.pad;
  const ix = x + p;
  const iw = w - p * 2;

  txt(doc, title, ix, y + p, { size: 8.5, color, bold: true });
  txt(doc, `${r.total.toLocaleString("es-MX")} alumnos  ·  ${r.nEscuelas} escuelas`, ix, y + p + 14, {
    size: 7,
    color: C.muted,
  });

  const chipH = 28;
  const chipY = y + h - p - chipH;
  const chipGap = 4;
  const chipW = (iw - chipGap * (NUM_NIVELES - 1)) / NUM_NIVELES;

  [1, 2, 3].forEach((n, i) => {
    const cx = ix + i * (chipW + chipGap);
    doc.roundedRect(cx, chipY, chipW, chipH, 4).fill(C[`nivel${n}`]);
    txtCentered(doc, `${r[`pctN${n}`]}%`, cx, chipY + 1, chipW, 14, { size: 8, color: "#ffffff", bold: true });
    txtCentered(doc, `N${n}`, cx, chipY + 14, chipW, 13, { size: 6, color: "#ffffff" });
  });
}

function drawDeltaPanel(doc, x, y, w, h, deltaPct) {
  panel(doc, x, y, w, h, { fill: C.panel });
  const p = PAGE.pad;
  txt(doc, "2025 vs 2026", x + p, y + p, { size: 8.5, bold: true, color: C.text });

  const items = [
    { n: 1, d: deltaPct.nivel1 },
    { n: 2, d: deltaPct.nivel2 },
    { n: 3, d: deltaPct.nivel3 },
  ];
  const gap = 8;
  const boxW = (w - p * 2 - gap * (NUM_NIVELES - 1)) / NUM_NIVELES;
  const titleH = 20;
  const labelH = 28;
  const boxY = y + p + titleH;
  const boxH = y + h - p - boxY;

  items.forEach(({ n, d }, i) => {
    const bx = x + p + i * (boxW + gap);
    const lab = NIVEL_NOMBRES[n];
    panel(doc, bx, boxY, boxW, boxH, { fill: C.white, r: 6 });
    const color = d > 0 ? C.up : d < 0 ? C.down : C.muted;
    txtCentered(doc, varLabelPct(d), bx, boxY + 2, boxW, boxH - labelH - 2, { size: 11, color, bold: true });

    let ly = boxY + boxH - labelH + 2;
    txtCentered(doc, lab.corto, bx, ly, boxW, 9, { size: 6.5, color: C.text, bold: true });
    ly += 9;
    lab.lineas.forEach((linea) => {
      txtCentered(doc, linea, bx, ly, boxW, 8, { size: 5.5, color: C.muted });
      ly += 8;
    });
  });
}

function drawStackedAt(doc, px, py, pw, ph, r25, r26) {
  const topPad = 6;
  const yearLblH = 11;
  const legH = 14;
  const axisW = 18;
  const barW = 30;
  const gap = 22;
  const barH = Math.max(ph - topPad - yearLblH - legH - 6, 20);
  const baseY = py + topPad;
  const startX = px + axisW + (pw - axisW - (barW * 2 + gap)) / 2;

  txt(doc, "100%", px + 2, baseY - 1, { size: 5, color: C.muted });
  txt(doc, "0%", px + 6, baseY + barH - 6, { size: 5, color: C.muted });

  function stack(sx, r, yearLabel, yearColor) {
    let cy = baseY + barH;
    [3, 2, 1].forEach((n) => {
      const sh = (r[`pctN${n}`] / 100) * barH;
      cy -= sh;
      doc.rect(sx, cy, barW, sh).fill(C[`nivel${n}`]);
    });
    doc.rect(sx, baseY, barW, barH).strokeColor(C.border).lineWidth(0.5).stroke();
    txtCentered(doc, yearLabel, sx, baseY + barH + 1, barW, yearLblH, { size: 6.5, color: yearColor, bold: true });
  }

  stack(startX, r25, "2025", C.year2025);
  stack(startX + barW + gap, r26, "2026", C.year2026);

  const legY = baseY + barH + yearLblH + 3;
  let lx = px + (pw - NUM_NIVELES * 28) / 2;
  [1, 2, 3].forEach((n) => {
    doc.roundedRect(lx, legY, 7, 7, 1).fill(C[`nivel${n}`]);
    txt(doc, `N${n}`, lx + 9, legY, { size: 6, color: C.muted });
    lx += 28;
  });
}

function drawLevelCompareAt(doc, px, py, pw, ph, r25, r26) {
  const p = 10;
  const headerH = 12;
  const rowH = 16;
  const labelW = 20;
  const pctW = 22;
  const gap = 5;
  const barW = (pw - p * 2 - labelW - pctW * 2 - gap * 3) / 2;
  const barH = 8;

  doc.roundedRect(px + p, py + 2, 7, 7, 1).fill(C.year2025);
  txt(doc, "2025", px + p + 10, py + 2, { size: 6, color: C.text });
  doc.roundedRect(px + p + 32, py + 2, 7, 7, 1).fill(C.year2026);
  txt(doc, "2026", px + p + 42, py + 2, { size: 6, color: C.text });

  const startY = py + headerH + 4;

  [1, 2, 3].forEach((n, i) => {
    const rowY = startY + i * rowH;
    const p25 = r25[`pctN${n}`];
    const p26 = r26[`pctN${n}`];

    doc.roundedRect(px + p, rowY + 2, 7, 7, 1).fill(C[`nivel${n}`]);
    txt(doc, `N${n}`, px + p + 9, rowY + 2, { size: 6, color: C.text, bold: true });

    const b25x = px + p + labelW;
    const pct25x = b25x + barW + 2;
    const b26x = pct25x + pctW + gap;
    const pct26x = b26x + barW + 2;

    doc.roundedRect(b25x, rowY + 3, barW, barH, 2).fill("#eef2f7");
    const f25 = Math.max((p25 / 100) * barW, p25 > 0 ? 2 : 0);
    if (f25 > 0) doc.roundedRect(b25x, rowY + 3, f25, barH, 2).fill(C.year2025);
    txtCentered(doc, `${p25}%`, pct25x, rowY, pctW, rowH, { size: 6, color: C.year2025, bold: true });

    doc.roundedRect(b26x, rowY + 3, barW, barH, 2).fill("#eef2f7");
    const f26 = Math.max((p26 / 100) * barW, p26 > 0 ? 2 : 0);
    if (f26 > 0) doc.roundedRect(b26x, rowY + 3, f26, barH, 2).fill(C.year2026);
    txtCentered(doc, `${p26}%`, pct26x, rowY, pctW, rowH, { size: 6, color: C.year2026, bold: true });
  });
}

function colorDelta(val) {
  if (val == null || val === 0) return C.muted;
  return val > 0 ? C.up : C.down;
}

function drawSchoolTableColumn(doc, x, y, w, filas, { conNombre = false } = {}) {
  const cols = conNombre
    ? [
        { label: "ST", ratio: 0.1 },
        { label: "Escuela", ratio: 0.42 },
        { label: "N1", ratio: 0.16 },
        { label: "N2", ratio: 0.16 },
        { label: "N3", ratio: 0.16 },
      ]
    : [
        { label: "ST", ratio: 0.22 },
        { label: "N1", ratio: 0.26 },
        { label: "N2", ratio: 0.26 },
        { label: "N3", ratio: 0.26 },
      ];
  const rowH = conNombre ? 16 : 14;
  const headerH = 16;
  const pad = 3;
  const usable = w - pad * 2;
  const colWidths = cols.map((c) => Math.floor(usable * c.ratio));

  doc.roundedRect(x, y, w, headerH, 3).fill("#eef2f7");
  let hx = x + pad;
  cols.forEach((c, i) => {
    txtCentered(doc, c.label, hx, y, colWidths[i], headerH, { size: 6.5, color: C.text, bold: true });
    hx += colWidths[i];
  });

  filas.forEach((f, idx) => {
    const ry = y + headerH + idx * rowH;
    if (idx % 2 === 1) doc.rect(x + 1, ry, w - 2, rowH).fill("#fafbfc");

    let cx = x + pad;
    const num = getNumeroEscuela(f.cct);
    const cells = conNombre
      ? [num ?? "-", trunc(f.nombre, 28), f.d1.txt, f.d2.txt, f.d3.txt]
      : [num ?? "-", f.d1.txt, f.d2.txt, f.d3.txt];
    const deltaStart = conNombre ? 2 : 1;
    const vals = [f.d1.val, f.d2.val, f.d3.val];
    cells.forEach((val, ci) => {
      let color = C.text;
      if (ci >= deltaStart) color = colorDelta(vals[ci - deltaStart]);
      if (conNombre && ci === 1) {
        txt(doc, String(val), cx + 2, ry + 3, { size: 6.5, color: C.text, width: colWidths[ci] - 4 });
      } else {
        txtCentered(doc, String(val), cx, ry, colWidths[ci], rowH, { size: 7.5, color, bold: ci >= deltaStart });
      }
      cx += colWidths[ci];
    });
  });
}

function sortNombresGrupo(nombres) {
  return [...nombres].sort((a, b) => {
    const pa = String(a).toUpperCase().match(/^(\d+)([A-Z]+)([MV]?)$/);
    const pb = String(b).toUpperCase().match(/^(\d+)([A-Z]+)([MV]?)$/);
    if (pa && pb) {
      const n = Number(pa[1]) - Number(pb[1]);
      if (n) return n;
      const l = pa[2].localeCompare(pb[2]);
      if (l) return l;
      return (pa[3] || "M").localeCompare(pb[3] || "M");
    }
    return String(a).localeCompare(String(b), "es");
  });
}

function nivelAlumnoMat(alumno) {
  return String(alumno?.nivel ?? "")
    .toUpperCase()
    .replace(/_/g, " ")
    .trim();
}

function resumenGrupo(grupo) {
  if (!grupo) return null;
  const alumnos = grupo.alumnos ?? [];
  const nivel1 = alumnos.filter((a) => nivelAlumnoMat(a) === "REQUIERE APOYO").length;
  const nivel2 = alumnos.filter((a) => nivelAlumnoMat(a) === "EN DESARROLLO").length;
  const nivel3 = alumnos.filter((a) => nivelAlumnoMat(a) === "ESPERADO").length;
  const [pctN1, pctN2, pctN3] = roundPercentagesTo100([nivel1, nivel2, nivel3]);
  return { total: alumnos.length, pctN1, pctN2, pctN3 };
}

function deltaPctVals(from, to) {
  if (from == null && to == null) return { val: null, from: null, to: null };
  if (from == null || to == null) return { val: null, from: from ?? null, to: to ?? null };
  return { val: to - from, from, to };
}

function buildFilasSalon(esc25, esc26) {
  const map25 = new Map((esc25?.grupos ?? []).map((g) => [g.nombre, g]));
  const map26 = new Map((esc26?.grupos ?? []).map((g) => [g.nombre, g]));
  const nombres = sortNombresGrupo([...new Set([...map25.keys(), ...map26.keys()])]);
  return nombres.map((nombre) => {
    const r25 = resumenGrupo(map25.get(nombre));
    const r26 = resumenGrupo(map26.get(nombre));
    return {
      salon: nombre,
      al25: r25 ? r25.total : null,
      al26: r26 ? r26.total : null,
      d1: deltaPctVals(r25?.pctN1, r26?.pctN1),
      d2: deltaPctVals(r25?.pctN2, r26?.pctN2),
      d3: deltaPctVals(r25?.pctN3, r26?.pctN3),
    };
  });
}

function drawSalonTable(doc, x, y, w, h, filas, { numNiveles = 3 } = {}) {
  const nivelRatio = 0.74 / numNiveles;
  const cols = [
    { label: "Salon", ratio: 0.08 },
    { label: "Al 2025", ratio: 0.09 },
    { label: "Al 2026", ratio: 0.09 },
    ...Array.from({ length: numNiveles }, (_, i) => ({ label: `N${i + 1}`, ratio: nivelRatio })),
  ];
  const headerH = 16;
  const pad = 3;
  const usable = w - pad * 2;
  const colWidths = cols.map((c) => Math.floor(usable * c.ratio));
  const rowH = Math.min(18, Math.max(12, Math.floor((h - headerH) / Math.max(filas.length, 1))));

  doc.roundedRect(x, y, w, headerH, 3).fill("#eef2f7");
  let hx = x + pad;
  cols.forEach((c, i) => {
    const label = i >= 3 ? `${c.label}  2025 a 2026` : c.label;
    txtCentered(doc, label, hx, y, colWidths[i], headerH, { size: 6.5, color: C.text, bold: true });
    hx += colWidths[i];
  });

  filas.forEach((f, idx) => {
    const ry = y + headerH + idx * rowH;
    if (ry + rowH > y + h) return;
    if (idx % 2 === 1) doc.rect(x + 1, ry, w - 2, rowH).fill("#fafbfc");

    let cx = x + pad;
    txtCentered(doc, f.salon, cx, ry, colWidths[0], rowH, { size: 7.5, color: C.text, bold: true });
    cx += colWidths[0];
    txtCentered(doc, f.al25 == null ? "-" : String(f.al25), cx, ry, colWidths[1], rowH, { size: 7, color: C.text });
    cx += colWidths[1];
    txtCentered(doc, f.al26 == null ? "-" : String(f.al26), cx, ry, colWidths[2], rowH, { size: 7, color: C.text });
    cx += colWidths[2];

    const deltas = [f.d1, f.d2, f.d3].slice(0, numNiveles);
    deltas.forEach((d, ni) => {
      const cw = colWidths[3 + ni];
      const color = colorDelta(d.val);
      const left = d.from == null ? "-" : `${d.from}%`;
      const right = d.to == null ? "-" : `${d.to}%`;
      const midW = Math.floor(cw * 0.62);
      const dW = cw - midW;
      txtCentered(doc, `${left} a ${right}`, cx, ry, midW, rowH, { size: 6.5, color: C.text });
      txtCentered(doc, d.val == null ? "-" : varLabelPct(d.val), cx + midW, ry, dW, rowH, {
        size: 7,
        color,
        bold: true,
      });
      cx += cw;
    });
  });
}

function drawSinglePage(doc, ctx) {
  const { r25, r26, deltaPct, lectura, filas, generado, meta } = ctx;
  const { m, gap } = PAGE;
  const innerW = PAGE.w - m * 2;
  const porSalon = meta.porSalon === true;
  const conNombre = !porSalon && (meta.zona != null || meta.conNombre === true);

  drawHeader(doc, generado, meta);

  const row1Y = 52;
  const cardH = 102;
  const cardW = 215;
  const deltaW = innerW - cardW * 2 - gap;

  drawYearCard(doc, m, row1Y, cardW, cardH, { title: "Despegue 2026", color: C.year2025, r: r25 });
  drawYearCard(doc, m + cardW + gap, row1Y, cardW, cardH, { title: "Aterrizaje 2027", color: C.year2026, r: r26 });
  drawDeltaPanel(doc, m + (cardW + gap) * 2, row1Y, deltaW, cardH, deltaPct);

  const row2Y = row1Y + cardH + gap;
  const row2H = 130;
  const chart1W = 185;
  const chart2W = 258;
  const destW = innerW - chart1W - chart2W - gap * 2;
  const chartContentY = row2Y + 24;
  const chartContentH = row2H - 28;

  panel(doc, m, row2Y, chart1W, row2H);
  txt(doc, "Distribucion % por nivel", m + PAGE.pad, row2Y + PAGE.pad, { size: 8, bold: true, color: C.text });
  drawStackedAt(doc, m, chartContentY, chart1W, chartContentH, r25, r26);

  panel(doc, m + chart1W + gap, row2Y, chart2W, row2H);
  txt(doc, "Comparacion % por nivel", m + chart1W + gap + PAGE.pad, row2Y + PAGE.pad, {
    size: 8,
    bold: true,
    color: C.text,
  });
  drawLevelCompareAt(doc, m + chart1W + gap, chartContentY, chart2W, chartContentH, r25, r26);

  drawLecturaAt(doc, m + chart1W + chart2W + gap * 2, row2Y, destW, row2H, lectura);

  const row3Y = row2Y + row2H + gap;
  const footH = 22;
  const row3H = PAGE.h - row3Y - footH;
  panel(doc, m, row3Y, innerW, row3H);
  const tableTitle =
    meta.tableTitle ??
    (conNombre
      ? `Escuelas de la zona ${meta.zona} - avance o retroceso por nivel`
      : "Listado de escuelas - avance o retroceso por nivel (2025 vs 2026)");
  txt(doc, tableTitle, m + PAGE.pad, row3Y + PAGE.pad, { size: 9, bold: true, color: C.text });

  const tableY = row3Y + PAGE.pad + 18;
  const tableH = row3H - PAGE.pad - 22;
  if (porSalon) {
    drawSalonTable(doc, m + PAGE.pad, tableY, innerW - PAGE.pad * 2, tableH, filas, {
      numNiveles: 3,
    });
  } else if (conNombre) {
    drawSchoolTableColumn(doc, m + PAGE.pad, tableY, innerW - PAGE.pad * 2, filas, { conNombre: true });
  } else {
    const colGap = 16;
    const colW = (innerW - PAGE.pad * 2 - colGap * 2) / 3;
    const perCol = Math.ceil(filas.length / 3);
    const chunks = [filas.slice(0, perCol), filas.slice(perCol, perCol * 2), filas.slice(perCol * 2)];
    chunks.forEach((chunk, i) => {
      if (chunk.length === 0) return;
      drawSchoolTableColumn(doc, m + PAGE.pad + i * (colW + colGap), tableY, colW, chunk);
    });
  }

  const footY = PAGE.h - footH + 4;
  doc.strokeColor(C.border).moveTo(m, footY).lineTo(PAGE.w - m, footY).stroke();
  txt(doc, "N1 Requiere Apoyo  |  N2 En Desarrollo  |  N3 Esperado", m, footY + 6, {
    size: 6.5,
    color: C.muted,
    width: innerW - 120,
  });
  txt(doc, "RAF Matematicas - Sonora", PAGE.w - m - 110, footY + 6, {
    size: 6.5,
    color: C.muted,
    width: 110,
    align: "right",
  });
}

function getEvaluacion(data, id) {
  if (Array.isArray(data.evaluaciones)) {
    return data.evaluaciones.find((e) => e.id === id) ?? null;
  }
  return null;
}

function buildFilas(escuelas25, escuelas26, nombres) {
  const map25 = new Map(escuelas25.map((e) => [e.cct, e]));
  const map26 = new Map(escuelas26.map((e) => [e.cct, e]));
  const ccts = [...new Set([...map25.keys(), ...map26.keys()])].sort();
  return ccts.map((cct) => {
    const e25 = map25.get(cct);
    const e26 = map26.get(cct);
    const p25 = pctsEscuela(e25);
    const p26 = pctsEscuela(e26);
    const d1 = deltaPct(p25, p26, "pctN1");
    const d2 = deltaPct(p25, p26, "pctN2");
    const d3 = deltaPct(p25, p26, "pctN3");
    return {
      cct,
      nombre: nombres[cct] ?? cct,
      zona: getZonaPorCct(cct),
      d1,
      d2,
      d3,
    };
  });
}

function writePdf(outPath, ctx) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const doc = new PDFDocument({ size: [PAGE.w, PAGE.h], margin: 0, autoFirstPage: true });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    drawSinglePage(doc, ctx);
    doc.end();
    stream.on("finish", () => resolve(outPath));
    stream.on("error", reject);
  });
}

function copyTo(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function parseCctsArg() {
  const raw = process.argv.find((a) => a.startsWith("--ccts="));
  if (!raw) return null;
  return raw
    .slice("--ccts=".length)
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

async function main() {
  const data = loadJson("public/data/resultados.json");
  const nombres = loadJson("data/nombres-escuelas.json");

  const ev25 = getEvaluacion(data, "despegue-2025");
  const ev26 = getEvaluacion(data, "aterrizaje-2026");
  if (!ev25 || !ev26) {
    console.error("Faltan evaluaciones despegue-2025 o aterrizaje-2026");
    process.exit(1);
  }

  const all25 = escuelasVisibles(ev25.escuelas);
  const all26 = escuelasVisibles(ev26.escuelas);
  const parcial = esParcial(all25, all26);
  const generado = data.generado ?? new Date().toISOString();

  const global25 = resumenDesdeEscuelas(all25);
  const global26 = resumenDesdeEscuelas(all26);
  const globalDelta = calcularDeltaPct(global25, global26);
  const globalFilas = buildFilas(all25, all26, nombres);

  const printDir = path.join(ROOT, "..", "reportes-pdf", "matematicas");
  fs.mkdirSync(printDir, { recursive: true });

  const cctsFiltro = parseCctsArg();
  if (cctsFiltro) {
    let escritos = 0;
    for (const cct of cctsFiltro) {
      const e25 = all25.find((e) => e.cct === cct) ?? null;
      const e26 = all26.find((e) => e.cct === cct) ?? null;
      if (!e25 && !e26) {
        console.error("No hay datos para:", cct);
        continue;
      }
      const r25 = resumenDesdeEscuelas(e25 ? [e25] : []);
      const r26 = resumenDesdeEscuelas(e26 ? [e26] : []);
      const deltaPct = calcularDeltaPct(r25, r26);
      const filas = buildFilasSalon(e25, e26);
      const num = getNumeroEscuela(cct);
      const nombreEsc = nombres[cct] ?? `EST ${num}`;
      const slug = String(num ?? cct).padStart(2, "0");
      const outPath = path.join(printDir, `est-${slug}-matematicas.pdf`);
      await writePdf(outPath, {
        r25,
        r26,
        deltaPct,
        lectura: generarLecturaPrograma(r25, r26, deltaPct, parcial, {
          ambito: `EST ${num}`,
          porSalon: true,
          global: { r25: global25, r26: global26 },
        }),
        filas,
        generado,
        meta: {
          porSalon: true,
          titulo: `RAF Matematicas  |  EST ${num}`,
          subtitulo: `Despegue 2026 vs Aterrizaje 2027  |  ${trunc(nombreEsc, 42)}  |  1er grado  |  Compare con el reporte global`,
          tableTitle: "Desglose por salon - como les fue en cada nivel (2025 vs 2026)",
        },
      });
      console.log("OK ->", outPath);
      escritos += 1;
    }
    if (escritos === 0) process.exit(1);
    return;
  }

  const publicDir = path.join(ROOT, "public", "documentos");
  fs.mkdirSync(publicDir, { recursive: true });

  const globalCtx = {
    r25: global25,
    r26: global26,
    deltaPct: globalDelta,
    lectura: generarLecturaPrograma(global25, global26, globalDelta, parcial),
    filas: globalFilas,
    generado,
    meta: { zona: null },
  };

  const globalName = "00-global-matematicas-tecnicas.pdf";
  const globalPath = path.join(printDir, globalName);
  await writePdf(globalPath, globalCtx);
  copyTo(globalPath, path.join(publicDir, "matematicas-raf-comparativa-2025-2026.pdf"));
  console.log("OK global ->", globalPath);

  const zonas = [...new Set(globalFilas.map((f) => f.zona).filter((z) => z != null))].sort((a, b) => a - b);
  const written = [globalPath];

  for (const zona of zonas) {
    const z25 = all25.filter((e) => getZonaPorCct(e.cct) === zona);
    const z26 = all26.filter((e) => getZonaPorCct(e.cct) === zona);
    if (z25.length === 0 && z26.length === 0) continue;
    const r25 = resumenDesdeEscuelas(z25);
    const r26 = resumenDesdeEscuelas(z26);
    const deltaPct = calcularDeltaPct(r25, r26);
    const filas = buildFilas(z25, z26, nombres);
    const name = `zona-${String(zona).padStart(2, "0")}-matematicas.pdf`;
    const outPath = path.join(printDir, name);
    await writePdf(outPath, {
      r25,
      r26,
      deltaPct,
      lectura: generarLecturaPrograma(r25, r26, deltaPct, parcial, {
        zona,
        global: { r25: global25, r26: global26 },
      }),
      filas,
      generado,
      meta: { zona },
    });
    written.push(outPath);
    console.log(`OK zona ${zona} -> ${name}  (${filas.length} escuelas, ${r26.total} alumnos 2026)`);
  }

  const indice = [
    "Reportes estadisticos RAF Matematicas - Secundarias Tecnicas",
    "Despegue 2026 vs Aterrizaje 2027 - Primer grado",
    "",
    "Como entregar:",
    "  1. Imprima 00-global-matematicas-tecnicas.pdf  (todas las tecnicas)",
    "  2. Imprima el PDF de la zona de cada supervisor",
    "  3. Cada zona incluye la comparacion contra el total estatal de Tecnicas",
    "",
    `Global 2025: ${global25.nEscuelas} escuelas, ${global25.total} alumnos`,
    `Global 2026: ${global26.nEscuelas} escuelas, ${global26.total} alumnos`,
    `N3 Esperado: ${global25.pctN3}% -> ${global26.pctN3}%`,
    "",
    "Archivos:",
    ...written.map((p) => "  " + path.basename(p)),
  ].join("\n");
  fs.writeFileSync(path.join(printDir, "00-LEAME.txt"), indice, "utf8");
  console.log(`\n${written.length} PDFs en ${printDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
