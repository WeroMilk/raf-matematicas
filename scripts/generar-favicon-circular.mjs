import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SRC = process.argv[2] ?? path.join(ROOT, "public", "favicon.png");

async function makeCircularIcon(input, outputSize, outputPath) {
  const meta = await sharp(input).metadata();
  const size = Math.min(meta.width, meta.height);
  const left = Math.floor((meta.width - size) / 2);
  const top = Math.floor((meta.height - size) / 2);

  const cropped = await sharp(input)
    .extract({ left, top, width: size, height: size })
    .resize(outputSize, outputSize)
    .png()
    .toBuffer();

  const r = outputSize / 2;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${outputSize}" height="${outputSize}">
      <circle cx="${r}" cy="${r}" r="${r}" fill="white"/>
    </svg>`
  );

  await sharp(cropped).composite([{ input: mask, blend: "dest-in" }]).png().toFile(outputPath);
}

await makeCircularIcon(SRC, 192, path.join(ROOT, "public", "favicon.png"));
await makeCircularIcon(SRC, 180, path.join(ROOT, "public", "apple-icon.png"));
console.log("Favicons circulares generados.");
