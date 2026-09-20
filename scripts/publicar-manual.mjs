// Genera public/manual-embudo.html a partir de docs/GUIA.html con las imágenes
// embebidas (data URI), para que el cuaderno se sirva en /manual-embudo desde
// cualquier dominio o ruta sin depender de assets relativos. Corre antes de
// `next build` (ver package.json). El fuente que se edita es docs/GUIA.html.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = resolve(raiz, 'docs/GUIA.html');
const destino = resolve(raiz, 'public/manual-embudo.html');
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

let html = readFileSync(fuente, 'utf8');
const usados = new Set();
html = html.replace(/(src="|url\()assets\/([^")]+)/g, (todo, prefijo, archivo) => {
  const tipo = mime[extname(archivo)];
  if (!tipo) throw new Error(`Tipo desconocido para docs/assets/${archivo}`);
  const datos = readFileSync(resolve(raiz, 'docs/assets', archivo)).toString('base64');
  usados.add(archivo);
  return `${prefijo}data:${tipo};base64,${datos}`;
});

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, html);
console.log(`manual → public/manual-embudo.html (${Math.round(html.length / 1024)} KB, ${usados.size} imágenes embebidas)`);
