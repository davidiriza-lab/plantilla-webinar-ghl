/**
 * npm run edge-config — crea la copia en Vercel Edge Config sin pasar por
 * vercel.com.
 *
 *   npm run edge-config -- --token <token de la API de Vercel>
 *   npm run edge-config             (si VERCEL_API_TOKEN ya está en .env.local)
 *   npm run edge-config -- --ver    (solo muestra lo que haría)
 *
 * Lo único que no puede hacer por ti es crear el token: Vercel → tu foto →
 * Account Settings → Tokens → Create. Con él, este script crea el Edge
 * Config, le saca un token de lectura y deja en .env.local las cuatro
 * variables que el sitio usa (EDGE_CONFIG, EDGE_CONFIG_ID, VERCEL_API_TOKEN,
 * VERCEL_TEAM_ID). Es idempotente: si ya hay EDGE_CONFIG_ID no crea otro.
 * Después: npm run subir-env && npx vercel --prod
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const SOLO_VER = args.includes('--ver');
const ENV = '.env.local';
const API = 'https://api.vercel.com';

function leerEnv() {
  const out = {};
  if (existsSync(ENV)) {
    for (const linea of readFileSync(ENV, 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
  return out;
}
function fijarEnv(pares) {
  if (!existsSync(ENV)) copyFileSync('.env.example', ENV);
  let texto = readFileSync(ENV, 'utf8');
  for (const [k, v] of Object.entries(pares)) {
    const re = new RegExp(`^${k}=.*$`, 'm');
    texto = re.test(texto) ? texto.replace(re, () => `${k}=${v}`) : `${texto.replace(/\s*$/, '')}\n${k}=${v}\n`;
  }
  writeFileSync(ENV, texto);
}

const env = leerEnv();
const token = arg('--token') ?? env.VERCEL_API_TOKEN;
if (!token) {
  console.error(
    '\nFalta el token de la API de Vercel.\n  Créalo en vercel.com → tu foto → Account Settings → Tokens → Create (alcance: tu cuenta o tu equipo).\n  Luego:  npm run edge-config -- --token <token>\n',
  );
  process.exit(1);
}
let proyecto = null;
if (existsSync('.vercel/project.json')) proyecto = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
const teamId =
  arg('--team') ?? env.VERCEL_TEAM_ID ?? (proyecto?.orgId?.startsWith('team_') ? proyecto.orgId : '');
const q = teamId ? `?teamId=${teamId}` : '';

async function vercel(ruta, init = {}) {
  const res = await fetch(`${API}${ruta}${q}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(20_000),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* sin cuerpo */
  }
  return { ok: res.ok, status: res.status, data };
}

console.log(`\nCopia en Edge Config${SOLO_VER ? ' (solo ver)' : ''}\n`);

// 1. ¿El token sirve?
const yo = await vercel('/v2/user');
if (!yo.ok) {
  console.error(`  ✗ El token no entra a Vercel (HTTP ${yo.status}). Créalo de nuevo y revisa que copiaste todo.\n`);
  process.exit(1);
}
console.log(`  ✓ Token válido (${yo.data?.user?.username ?? yo.data?.user?.email ?? 'usuario'})${teamId ? ` · equipo ${teamId}` : ' · cuenta personal'}`);

// 2. ¿Ya existe?
if (env.EDGE_CONFIG_ID && env.EDGE_CONFIG && !args.includes('--nuevo')) {
  const existe = await vercel(`/v1/edge-config/${env.EDGE_CONFIG_ID}`);
  if (existe.ok) {
    console.log(`  ✓ Ya hay un Edge Config (${env.EDGE_CONFIG_ID}) y .env.local lo conoce. Nada que crear.`);
    if (arg('--token') && env.VERCEL_API_TOKEN !== token && !SOLO_VER) {
      fijarEnv({ VERCEL_API_TOKEN: token });
      console.log('  · VERCEL_API_TOKEN actualizado en .env.local');
    }
    console.log('\nSiguiente: npm run subir-env && npx vercel --prod\n');
    process.exit(0);
  }
  console.log(`  · EDGE_CONFIG_ID=${env.EDGE_CONFIG_ID} ya no existe en Vercel: se crea uno nuevo.`);
}

// 3. Crear
const base = (proyecto?.projectName ?? 'webinar').toLowerCase().replace(/[^a-z0-9-]/g, '-');
const slug = `${base.slice(0, 24)}-config`;
if (SOLO_VER) {
  console.log(`  · Se crearía el Edge Config "${slug}", su token de lectura, y se escribirían EDGE_CONFIG, EDGE_CONFIG_ID, VERCEL_API_TOKEN${teamId ? ', VERCEL_TEAM_ID' : ''} en .env.local\n`);
  process.exit(0);
}
const creado = await vercel('/v1/edge-config', { method: 'POST', body: JSON.stringify({ slug }) });
if (!creado.ok || !creado.data?.id) {
  console.error(`  ✗ No se pudo crear el Edge Config (HTTP ${creado.status}): ${JSON.stringify(creado.data).slice(0, 200)}\n`);
  process.exit(1);
}
const id = creado.data.id;
console.log(`  + Edge Config "${slug}" → ${id}`);

const lectura = await vercel(`/v1/edge-config/${id}/token`, { method: 'POST', body: JSON.stringify({ label: 'sitio' }) });
if (!lectura.ok || !lectura.data?.token) {
  console.error(`  ✗ Se creó el Edge Config pero no su token de lectura (HTTP ${lectura.status}). Bórralo en vercel.com → Storage y vuelve a correr.\n`);
  process.exit(1);
}
console.log('  + Token de lectura creado');

const pares = {
  EDGE_CONFIG: `https://edge-config.vercel.com/${id}?token=${lectura.data.token}`,
  EDGE_CONFIG_ID: id,
  VERCEL_API_TOKEN: token,
};
if (teamId) pares.VERCEL_TEAM_ID = teamId;
fijarEnv(pares);
console.log(`  · ${Object.keys(pares).join(', ')} → escritas en .env.local`);
console.log('\nListo. Ahora súbelas y publica:  npm run subir-env && npx vercel --prod\nLuego guarda una vez en /admin para sembrar la copia.\n');
