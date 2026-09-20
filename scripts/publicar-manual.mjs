// Genera lo que se publica como /manual-embudo a partir de docs/GUIA.html:
//   - public/manual-embudo.html: la guía con el logo y el fondo embebidos
//     (data URI) para que no dependa de rutas relativas en ningún dominio;
//   - public/manual-capturas/: las capturas de pantalla, referenciadas con
//     ruta absoluta bajo BASE_PATH (en BGI, /plantilla/manual-capturas/…).
// Corre antes de `next build` (ver package.json). El fuente que se edita es
// docs/GUIA.html; las capturas se regeneran con `npm run capturas`.
//
// Solo publica si PUBLICAR_MANUAL=1 (así está en la demo de BGI). En la copia
// de un alumno no hace nada: su dominio no tiene por qué servir este manual.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.PUBLICAR_MANUAL !== '1' && !process.argv.includes('--forzar')) {
  console.log('manual → no se publica en este sitio (PUBLICAR_MANUAL no está en 1)');
  process.exit(0);
}

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = resolve(raiz, 'docs/GUIA.html');
const destino = resolve(raiz, 'public/manual-embudo.html');
const capturasFuente = resolve(raiz, 'docs/assets/capturas');
const capturasDestino = resolve(raiz, 'public/manual-capturas');
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

let html = readFileSync(fuente, 'utf8');

// 1. Capturas: se copian como archivos y se apuntan con ruta absoluta.
let capturas = 0;
if (existsSync(capturasFuente)) {
  rmSync(capturasDestino, { recursive: true, force: true });
  mkdirSync(capturasDestino, { recursive: true });
  for (const archivo of readdirSync(capturasFuente)) {
    if (!mime[extname(archivo)]) continue;
    copyFileSync(resolve(capturasFuente, archivo), resolve(capturasDestino, archivo));
    capturas++;
  }
}
html = html.replace(/(src="|url\()assets\/capturas\//g, `$1${basePath}/manual-capturas/`);

// 2. El resto de docs/assets (logo, fondo) va embebido.
const embebidas = new Set();
html = html.replace(/(src="|url\()assets\/([^")]+)/g, (todo, prefijo, archivo) => {
  const tipo = mime[extname(archivo)];
  if (!tipo) throw new Error(`Tipo desconocido para docs/assets/${archivo}`);
  const datos = readFileSync(resolve(raiz, 'docs/assets', archivo)).toString('base64');
  embebidas.add(archivo);
  return `${prefijo}data:${tipo};base64,${datos}`;
});

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, html);
console.log(
  `manual → public/manual-embudo.html (${Math.round(html.length / 1024)} KB, ${embebidas.size} imágenes embebidas, ${capturas} capturas en public/manual-capturas/)`,
);
