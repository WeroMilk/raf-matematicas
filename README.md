# RAF Matemáticas — Secundarias Técnicas SEC Sonora

PWA para maestros: visualización de resultados del examen diagnóstico RAF Matemáticas por escuela, grupo y nivel (Requiere apoyo, En desarrollo, Esperado).

## Stack

- **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**
- **Recharts** (gráficas), **TanStack Table** (tablas), **xlsx** (lectura de Excel en build)
- PWA instalable (Chrome: “Añadir a pantalla de inicio”)

## Cómo cargar tus datos

1. Coloca los archivos **`*_actualizado.xlsx`** (uno por escuela) en la carpeta **`data/excel/`**.
2. Ejecuta:
   ```bash
   npm run build:data
   ```
3. Se generará **`public/data/resultados.json`**. La app lo usa en cada build y en desarrollo.

La estructura del Excel debe coincidir con la del script **MARTA.PY**: primera hoja con columnas `FirstName`, `LastName`, `QuizClass`, `Points1`–`Points12`, `Mark1`–`Mark12`.

## Desarrollo

```bash
npm install
npm run build:data   # opcional si ya hay JSON
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build y deploy (Vercel)

```bash
npm run build
```

El script `build:data` se ejecuta antes del build de Next.js. En Vercel, los archivos Excel deben estar en el repositorio (por ejemplo en `data/excel/`) para que el build genere el JSON. Si no hay Excel, se genera un JSON vacío y la app muestra “No hay datos”.

- **Build command en Vercel:** `npm run build` (por defecto).
- **Node:** 20.x (configurado en `engines`).

## Rutas

- **/** — Dashboard (resumen por nivel, acceso a escuelas y por nivel)
- **/escuelas** — Lista de escuelas (CCT)
- **/escuela/[cct]** — Detalle de una escuela (gráficas y grupos)
- **/escuela/[cct]/grupo/[grupo]** — Detalle de un grupo (tabla de alumnos)
- **/por-nivel** — Listados por nivel: Requiere apoyo, En desarrollo, Esperado

## Íconos PWA

En **`public/icons/`** hay placeholders (1×1 px). Para producción, sustituye por PNG de 192×192 y 512×512.
# raf_est
