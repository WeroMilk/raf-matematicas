// Minimal 1x1 PNG (67 bytes) - run: node scripts/gen-icons.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "public", "icons");
const minimal = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "icon-192.png"), minimal);
fs.writeFileSync(path.join(dir, "icon-512.png"), minimal);
console.log("Icons placeholder written. Replace with 192x192 and 512x512 PNG for production.");
