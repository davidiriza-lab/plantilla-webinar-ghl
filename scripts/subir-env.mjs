/**
 * npm run subir-env — copia las variables de .env.local al proyecto de Vercel.
 *
 * Requiere haber corrido `vercel link` en esta carpeta. Sube cada variable
 * con valor a Production y Preview (sensibles por defecto en Vercel) y salta
 * las vacías. EDGE_CONFIG también va: la escribe `npm run edge-config`.
 * Con `--ver` solo muestra lo que haría.
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SOLO_VER = process.argv.includes('--ver');
const ES_WINDOWS = process.platform === 'win32';
const NO_SUBIR = new Set([]);

if (!existsSync('.env.local')) {
  console.error('No hay .env.local en esta carpeta.');
  process.exit(1);
}
if (!existsSync('.vercel/project.json') && !SOLO_VER) {
  console.error('Esta carpeta no está ligada a un proyecto de Vercel. Corre primero:  npx vercel link');
  process.exit(1);
}

const vars = [];
for (const linea of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (!m) continue;
  const [, clave, crudo] = m;
  const valor = crudo.replace(/^"(.*)"$/, '$1');
  if (!valor || NO_SUBIR.has(clave)) continue;
  vars.push([clave, valor]);
}

console.log(`\n${SOLO_VER ? 'Se subirían' : 'Subiendo'} ${vars.length} variables a Vercel (production y preview)\n`);
let fallos = 0;
for (const [clave, valor] of vars) {
  for (const entorno of ['production', 'preview']) {
    if (SOLO_VER) {
      console.log(`  vercel env add ${clave} ${entorno} --value ••• --force --yes`);
      continue;
    }
    // --value y no stdin: por stdin Vercel guarda la variable VACÍA sin avisar.
    // En preview la CLI exige decir la rama aunque lleve --yes; la rama vacía
    // significa "todas las ramas de Preview" y evita que se quede preguntando.
    const destino = entorno === 'preview' ? [entorno, ''] : [entorno];
    const args = ['vercel', 'env', 'add', clave, ...destino, '--value', valor, '--force', '--yes'];
    let r;
    if (ES_WINDOWS) {
      // En Windows npx es npx.cmd y Node no lo lanza sin shell. Con shell, cmd
      // interpreta % y " dentro del valor: esos se suben a mano.
      if (/[%"]/.test(valor)) {
        fallos++;
        console.log(`  ✗ ${clave} → ${entorno}: el valor tiene % o comillas; súbela a mano en vercel.com → Settings → Environment Variables.`);
        continue;
      }
      r = spawnSync('npx', args.map((a) => `"${a}"`), { encoding: 'utf8', shell: true });
    } else {
      r = spawnSync('npx', args, { encoding: 'utf8' });
    }
    if (r.status === 0) console.log(`  ✓ ${clave} → ${entorno}`);
    else {
      fallos++;
      const detalle = r.error?.message ?? `${r.stderr ?? ''}${r.stdout ?? ''}`.trim().split('\n').pop();
      console.log(`  ✗ ${clave} → ${entorno}: ${detalle}`);
    }
  }
}
console.log(fallos ? `\n${fallos} variable(s) no se pudieron subir.\n` : '\nListo. Vuelve a desplegar para que tomen efecto.\n');
process.exit(fallos ? 1 : 0);
