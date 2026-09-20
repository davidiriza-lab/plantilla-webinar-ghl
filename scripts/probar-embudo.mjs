/**
 * npm run probar:embudo — un registro de prueba, de punta a punta.
 *
 *   npm run probar:embudo                         → contra http://localhost:3000
 *   npm run probar:embudo -- https://mi-dominio.com
 *   npm run probar:embudo -- --puerta             → además prueba /ingreso
 *   npm run probar:embudo -- --email tu@correo.com → con tu correo, para
 *                                                    recibir lo que mande GHL
 *   npm run probar:embudo -- --limpiar            → borra el contacto al final
 *
 * Manda un registro por /api/registro como lo haría la landing y luego va a
 * GoHighLevel a comprobar que el contacto existe, que lleva las etiquetas y
 * que cayó en el pipeline. Es la prueba que en el cuaderno antes se hacía a
 * mano registrándose con el correo propio. Necesita GHL_API_KEY y
 * GHL_LOCATION_ID en .env.local (o en el entorno).
 */
import { readFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const BASE = (args.find((a) => a.startsWith('http')) ?? 'http://localhost:3000').replace(/\/$/, '');
const PUERTA = args.includes('--puerta');
const EMAIL_PROPIO = args[args.indexOf('--email') + 1];
const LIMPIAR = args.includes('--limpiar');
const GHL = 'https://services.leadconnectorhq.com';

const env = {};
if (existsSync('.env.local')) {
  for (const linea of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}
const TOKEN = process.env.GHL_API_KEY || env.GHL_API_KEY;
const LOCATION = process.env.GHL_LOCATION_ID || env.GHL_LOCATION_ID;
if (!TOKEN || !LOCATION) {
  console.error('\nFaltan GHL_API_KEY y GHL_LOCATION_ID en .env.local. Corre antes  npm run instalar\n');
  process.exit(1);
}

let fallos = 0;
const ok = (t) => console.log(`  ✓ ${t}`);
const falla = (t) => {
  fallos++;
  console.log(`  ✗ ${t}`);
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function ghl(ruta, init = {}) {
  const res = await fetch(`${GHL}${ruta}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: '2021-07-28',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* sin cuerpo */
  }
  return { ok: res.ok, status: res.status, data };
}

async function enviar(tipo, email) {
  const res = await fetch(`${BASE}/api/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo,
      nombre: 'Prueba del embudo',
      email,
      telefono: '5500000001',
      utm: { source: 'prueba', medium: 'cuaderno', campaign: 'probar-embudo' },
    }),
    signal: AbortSignal.timeout(20_000),
  }).catch((e) => ({ ok: false, status: 0, json: async () => ({ error: e.message }) }));
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* sin cuerpo */
  }
  return { ok: res.ok, status: res.status, data };
}

async function buscarContacto(email) {
  const r = await ghl('/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      locationId: LOCATION,
      pageLimit: 5,
      filters: [{ field: 'email', operator: 'eq', value: email }],
    }),
  });
  return r.ok ? (r.data?.contacts?.[0] ?? null) : null;
}

const sello = Date.now().toString(36);
const email =
  args.includes('--email') && EMAIL_PROPIO && EMAIL_PROPIO.includes('@')
    ? EMAIL_PROPIO.toLowerCase()
    : `prueba-embudo-${sello}@example.com`;
console.log(`\nPrueba del embudo contra ${BASE}\n  contacto de prueba: ${email}\n`);

// 1. Registro
console.log('1. Registro (/api/registro, tipo registro)');
const reg = await enviar('registro', email);
if (!reg.ok) {
  falla(`El sitio respondió HTTP ${reg.status}: ${reg.data?.error ?? 'sin detalle'}`);
  if (reg.status === 0) console.log('     ¿Está corriendo el sitio? npm run dev en otra terminal, o pasa la URL publicada.');
  console.log('\nNo se puede continuar.\n');
  process.exit(1);
}
ok('El sitio aceptó el registro');

await espera(2500);
let contacto = await buscarContacto(email);
if (!contacto) {
  await espera(3000);
  contacto = await buscarContacto(email);
}
if (!contacto) {
  falla('El contacto no aparece en GoHighLevel. Revisa que el token del sitio sea el de esta sub-cuenta.');
  console.log('\nNo se puede continuar.\n');
  process.exit(1);
}
ok(`Contacto creado en GHL (${contacto.id})`);
const tags = (contacto.tags ?? []).map((t) => String(t).toLowerCase());
const tieneRegistro = tags.some((t) => t.startsWith('registro'));
if (tieneRegistro) ok(`Etiquetas: ${tags.join(', ')}`);
else falla(`El contacto no tiene etiqueta de registro. Tiene: ${tags.join(', ') || 'ninguna'}`);
const fuente = Object.values(contacto.customFields ?? {}).length;
if (fuente) ok('Custom fields (Fuente / Fecha de su clase) escritos');
else console.log('  · Sin custom fields en el contacto (revisa GHL_CAMPO_FUENTE_ID en .env.local)');

// 2. Pipeline
const opp = await ghl(`/opportunities/search?location_id=${LOCATION}&contact_id=${contacto.id}`);
const oportunidad = opp.ok ? opp.data?.opportunities?.[0] : null;
if (oportunidad) ok(`Oportunidad en el pipeline: etapa "${oportunidad.pipelineStageName ?? oportunidad.pipelineStageId}"`);
else falla('No hay oportunidad en el pipeline. Revisa que exista "Webinars" con sus 4 etapas (npm run instalar).');

// 3. Puerta
if (PUERTA) {
  console.log('\n2. Puerta de la sala (/api/registro, tipo ingreso)');
  const ing = await enviar('ingreso', email);
  if (ing.status === 409) {
    falla('La sala está cerrada. En el panel pon la puerta en "abierta", guarda y vuelve a correr con --puerta.');
  } else if (!ing.ok) {
    falla(`El sitio respondió HTTP ${ing.status}: ${ing.data?.error ?? 'sin detalle'}`);
  } else {
    ok(`La puerta abrió${ing.data?.enlaceIngreso ? ` y devolvió el enlace de la sala` : ''}`);
    await espera(2500);
    const c2 = await buscarContacto(email);
    const t2 = (c2?.tags ?? []).map((t) => String(t).toLowerCase());
    if (t2.some((t) => t.startsWith('ingreso'))) ok(`Etiqueta de ingreso puesta: ${t2.filter((t) => t.startsWith('ingreso')).join(', ')}`);
    else falla(`Sin etiqueta de ingreso. Tiene: ${t2.join(', ')}`);
  }
}

// 4. Limpieza
if (LIMPIAR) {
  const del = await ghl(`/contacts/${contacto.id}`, { method: 'DELETE' });
  if (del.ok) ok('Contacto de prueba borrado');
  else falla(`No se pudo borrar el contacto (HTTP ${del.status})`);
} else {
  console.log(`\n  · El contacto de prueba se queda en GHL (${email}). Bórralo con --limpiar o a mano.`);
}

console.log(fallos === 0 ? '\nEl embudo escribe bien en GoHighLevel.\n' : `\n${fallos} cosa(s) por revisar arriba.\n`);
process.exit(fallos === 0 ? 0 : 1);
