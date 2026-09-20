/**
 * npm run diagnostico — ¿está listo el taller?
 *
 * Revisa lo que el cuaderno pide en el módulo 01 y 02: Node 20+, Git, la
 * CLI de Claude, GitHub y Vercel con sesión iniciada, dependencias, el
 * .env.local y si la carpeta ya está ligada a un proyecto de Vercel. No
 * cambia nada: solo dice qué falta y cómo resolverlo, para que Claude lo
 * corra y actúe sobre el resultado.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const filas = [];
let faltanBase = 0;

function correr(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  return { ok: r.status === 0, salida: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}
const ok = (t, detalle = '') => filas.push(['✓', t, detalle]);
const falta = (t, arreglo, base = true) => {
  if (base) faltanBase++;
  filas.push(['✗', t, arreglo]);
};

// 1. Herramientas base
// 22.18 es el primer Node que corre archivos .ts sin banderas, y el instalador
// (scripts/instalar-ghl.ts) es TypeScript.
const [nodeMayor, nodeMenor] = process.versions.node.split('.').map(Number);
if (nodeMayor > 22 || (nodeMayor === 22 && nodeMenor >= 18)) ok(`Node ${process.versions.node}`);
else falta(`Node ${process.versions.node} es viejo`, 'Instala la versión LTS desde nodejs.org (22.18 o más nueva).');

const git = correr('git', ['--version']);
if (git.ok) ok(git.salida);
else falta('Git no está instalado', 'Mac: abre la Terminal, escribe git y acepta instalar. Windows: git-scm.com.');

const claude = correr('claude', ['--version']);
if (claude.ok) ok(`Claude Code ${claude.salida.split('\n')[0]}`);
else falta('La CLI de Claude no responde', 'Mac: curl -fsSL https://claude.ai/install.sh | bash · Windows: irm https://claude.ai/install.ps1 | iex · luego abre una terminal nueva.');

const gh = correr('gh', ['auth', 'status']);
if (gh.ok) {
  const cuenta = gh.salida.match(/account (\S+)/)?.[1] ?? '';
  ok(`GitHub conectado${cuenta ? ` como ${cuenta}` : ''}`);
} else if (correr('gh', ['--version']).ok) {
  falta('GitHub instalado pero sin sesión', 'Corre: gh auth login  (GitHub.com → HTTPS → Login with a web browser).');
} else {
  falta('La CLI de GitHub (gh) no está instalada', 'Mac: brew install gh · Windows: winget install GitHub.cli · luego gh auth login.');
}

const vercel = correr('npx', ['vercel', 'whoami']);
// La CLI a veces agrega líneas de ayuda: el usuario es la última línea "limpia".
const usuarioVercel = vercel.salida
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /^[\w.-]+$/.test(l))
  .pop();
if (vercel.ok && usuarioVercel) ok(`Vercel conectado como ${usuarioVercel}`);
else falta('Vercel sin sesión', 'Corre: npx vercel login  (se abre el navegador).');

// 2. El proyecto
if (existsSync('node_modules')) ok('Dependencias instaladas');
else falta('Faltan las dependencias', 'Corre: npm install', false);

if (existsSync('.env.local')) {
  const env = readFileSync('.env.local', 'utf8');
  const tiene = (k) => new RegExp(`^${k}=.+$`, 'm').test(env);
  const faltantes = ['GHL_API_KEY', 'GHL_LOCATION_ID', 'ADMIN_PASSWORD'].filter((k) => !tiene(k));
  if (faltantes.length === 0) ok('.env.local con GHL y contraseña del panel');
  else falta(`.env.local sin ${faltantes.join(', ')}`, 'Módulo 04: llena .env.local y corre  npm run instalar', false);
  if (tiene('EDGE_CONFIG') && tiene('EDGE_CONFIG_ID')) ok('Copia en Edge Config configurada');
  else falta('Sin copia en Edge Config todavía', 'Módulo 11: pon VERCEL_API_TOKEN en .env.local y corre  npm run edge-config', false);
} else {
  falta('No existe .env.local', 'Módulo 04: conecta GoHighLevel (copia .env.example a .env.local, llénalo y corre  npm run instalar)', false);
}

if (existsSync('.vercel/project.json')) {
  const p = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
  ok(`Carpeta ligada al proyecto de Vercel "${p.projectName}"`);
} else falta('La carpeta no está ligada a Vercel', 'Módulo 11: npx vercel link', false);

// Salida
console.log('\nDiagnóstico del taller\n');
for (const [s, t, d] of filas) console.log(`  ${s} ${t}${d ? `\n      → ${d}` : ''}`);
console.log(
  faltanBase === 0
    ? '\nHerramientas listas. Lo marcado con ✗ (si hay) son módulos que aún no tocan.\n'
    : `\n${faltanBase} herramienta(s) base por resolver. Arréglalas y vuelve a correr  npm run diagnostico\n`,
);
process.exit(faltanBase === 0 ? 0 : 1);
