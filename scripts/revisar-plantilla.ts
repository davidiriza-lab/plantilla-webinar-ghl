/**
 * npm run revisar — ¿qué sigue siendo copy de ejemplo?
 *
 * Recorre src/contenido y lista cada línea marcada con «EJEMPLO». Cuando
 * cambies un texto, borra la marca de esa línea. Cuando la lista quede
 * vacía, la plantilla ya es tuya.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/contenido';
let total = 0;

for (const archivo of readdirSync(DIR).sort()) {
  const lineas = readFileSync(join(DIR, archivo), 'utf8').split('\n');
  const marcadas = lineas
    .map((l, i) => ({ l, n: i + 1 }))
    .filter(({ l }) => /\/\/\s*EJEMPLO/.test(l));
  if (marcadas.length === 0) continue;
  console.log(`\n${archivo} — ${marcadas.length} por cambiar`);
  for (const { l, n } of marcadas) {
    const texto = l.replace(/\/\/\s*EJEMPLO.*$/, '').trim().replace(/,$/, '');
    console.log(`  ${String(n).padStart(3)}  ${texto.slice(0, 96)}${texto.length > 96 ? '…' : ''}`);
  }
  total += marcadas.length;
}

console.log(
  total === 0
    ? '\nSin copy de ejemplo: la plantilla ya es tuya.\n'
    : `\n${total} texto(s) de ejemplo por reemplazar. Borra la marca // EJEMPLO al cambiar cada uno.\n`,
);
