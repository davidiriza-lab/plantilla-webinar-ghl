/**
 * npm run instalar — prepara una sub-cuenta de GoHighLevel para este embudo.
 *
 * Lee GHL_API_KEY y GHL_LOCATION_ID de `.env.local` (o del entorno) y:
 *   1. comprueba que el token entra a la sub-cuenta;
 *   2. crea los custom values que falten (los de src/lib/campos.ts);
 *   3. crea los custom fields de contacto "Fuente" y "Fecha de su clase"
 *      y escribe sus IDs en `.env.local`;
 *   4. busca el pipeline "Webinars" con sus 4 etapas y, si no está, te dice
 *      exactamente qué crear (la API oficial de GHL no crea pipelines);
 *   5. genera ADMIN_SESSION_SECRET si falta.
 *
 * Es idempotente: córrelo las veces que quieras, solo crea lo que no existe.
 * Con `--revisar` no escribe nada: solo reporta.
 *
 * Para que Claude lo corra de una sola vez, acepta las credenciales como
 * argumentos y las deja en `.env.local` (creándolo desde `.env.example`):
 *   npm run instalar -- --token pit-… --location … --password … [--lada 52]
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { CAMPOS, DERIVADOS, POR_DEFECTO } from '../src/lib/campos.ts';

const SOLO_REVISAR = process.argv.includes('--revisar');
const ENV = '.env.local';

// ── Argumentos → .env.local ──────────────────────────────────────────────────

const ARGS = process.argv.slice(2);
function argumento(nombre: string): string | undefined {
  const i = ARGS.indexOf(nombre);
  return i >= 0 ? ARGS[i + 1] : undefined;
}
const DESDE_ARGS: Record<string, string | undefined> = {
  GHL_API_KEY: argumento('--token'),
  GHL_LOCATION_ID: argumento('--location'),
  ADMIN_PASSWORD: argumento('--password'),
  LADA_POR_DEFECTO: argumento('--lada'),
};
const paresNuevos = Object.entries(DESDE_ARGS).filter((par): par is [string, string] => Boolean(par[1]));
if (paresNuevos.length > 0 && !SOLO_REVISAR) {
  if (!existsSync(ENV)) copyFileSync('.env.example', ENV);
  let texto = readFileSync(ENV, 'utf8');
  for (const [clave, valor] of paresNuevos) {
    const re = new RegExp(`^${clave}=.*$`, 'm');
    texto = re.test(texto) ? texto.replace(re, `${clave}=${valor}`) : `${texto.replace(/\s*$/, '')}\n${clave}=${valor}\n`;
  }
  writeFileSync(ENV, texto);
  console.log(`\n  · ${paresNuevos.map(([k]) => k).join(', ')} → escritas en .env.local`);
}
const BASE = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';

// ── .env.local ───────────────────────────────────────────────────────────────

function leerEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  if (existsSync(ENV)) {
    for (const linea of readFileSync(ENV, 'utf8').split('\n')) {
      const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
  for (const k of Object.keys(process.env)) if (process.env[k]) out[k] = process.env[k] as string;
  return out;
}

const pendientesEnv: string[] = [];
function agregarEnv(clave: string, valor: string, comentario: string): void {
  pendientesEnv.push(`\n# ${comentario}\n${clave}=${valor}`);
}
function guardarEnv(): void {
  if (pendientesEnv.length === 0 || SOLO_REVISAR) return;
  const actual = existsSync(ENV) ? readFileSync(ENV, 'utf8') : '';
  writeFileSync(ENV, actual.replace(/\s*$/, '') + '\n' + pendientesEnv.join('\n') + '\n');
}

// ── GHL ──────────────────────────────────────────────────────────────────────

const env = leerEnv();
const TOKEN = env.GHL_API_KEY ?? '';
const LOCATION = env.GHL_LOCATION_ID ?? '';

async function ghl<T>(ruta: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(`${BASE}${ruta}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(15_000),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* sin cuerpo */
  }
  return { ok: res.ok, status: res.status, data: data as T };
}

const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const slugDe = (fieldKey: string): string =>
  fieldKey.replace(/[{}\s]/g, '').replace(/^custom_values\./, '');

let fallos = 0;
const ok = (t: string) => console.log(`  ✓ ${t}`);
const creado = (t: string) => console.log(`  + ${t}`);
const falta = (t: string) => {
  fallos++;
  console.log(`  ✗ ${t}`);
};
const aviso = (t: string) => console.log(`  · ${t}`);

console.log(`\nInstalador del embudo${SOLO_REVISAR ? ' (solo revisar, no escribe nada)' : ''}\n`);

// 1. Credenciales ─────────────────────────────────────────────────────────────
console.log('1. GoHighLevel');
if (!TOKEN || !LOCATION) {
  falta('Faltan GHL_API_KEY y/o GHL_LOCATION_ID en .env.local. Copia .env.example a .env.local y llénalos.');
  console.log('\nNo se puede continuar.\n');
  process.exit(1);
}
if (!TOKEN.startsWith('pit-')) {
  aviso('GHL_API_KEY no empieza con "pit-": asegúrate de que sea un Private Integration Token, no una API key vieja.');
}
const loc = await ghl<{ location?: { name?: string; timezone?: string } }>(`/locations/${LOCATION}`);
if (!loc.ok || !loc.data?.location) {
  falta(
    `El token no entra a la sub-cuenta ${LOCATION} (HTTP ${loc.status}). Revisa que el PIT tenga los permisos: contacts, opportunities, locations (custom values y custom fields), y que el Location ID sea el de la MISMA sub-cuenta.`,
  );
  console.log('\nNo se puede continuar.\n');
  process.exit(1);
}
ok(`Sub-cuenta "${loc.data.location.name}" · zona horaria ${loc.data.location.timezone}`);
if (loc.data.location.timezone && !/Mexico|Bogota|Lima|Buenos|Madrid|Santiago|Caracas|Guayaquil|America|Europe/.test(loc.data.location.timezone)) {
  aviso(`La zona horaria de la sub-cuenta es ${loc.data.location.timezone}. Los workflows de GHL usan ESA zona: ponla en la de tu audiencia (Configuración → Información de la empresa).`);
}

// 2. Custom values ────────────────────────────────────────────────────────────
console.log('\n2. Custom values (la configuración que edita /admin)');
const cv = await ghl<{ customValues?: Array<{ id: string; name: string; fieldKey: string }> }>(
  `/locations/${LOCATION}/customValues`,
);
if (!cv.ok) {
  falta(`No se pudieron leer los custom values (HTTP ${cv.status}). El PIT necesita el permiso "locations/customValues".`);
} else {
  const existentes = new Map((cv.data.customValues ?? []).map((v) => [slugDe(v.fieldKey), v]));
  const deseados = [
    ...CAMPOS.map((c) => ({ nombre: c.nombre, slug: c.slug, alias: c.alias ?? [], valor: POR_DEFECTO[c.clave] })),
    ...DERIVADOS.map((d) => ({ nombre: d.nombre, slug: d.slug, alias: [] as readonly string[], valor: '' })),
  ];
  let yaEstaban = 0;
  for (const d of deseados) {
    const hay = existentes.get(d.slug) ?? d.alias.map((a) => existentes.get(a)).find(Boolean);
    if (hay) {
      yaEstaban++;
      continue;
    }
    if (SOLO_REVISAR) {
      aviso(`Falta "${d.nombre}" (se crearía)`);
      continue;
    }
    const r = await ghl<{ customValue?: { id: string } }>(`/locations/${LOCATION}/customValues`, {
      method: 'POST',
      body: JSON.stringify({ name: d.nombre, value: d.valor }),
    });
    if (r.ok) creado(`"${d.nombre}"`);
    else falta(`No se pudo crear "${d.nombre}" (HTTP ${r.status})`);
  }
  ok(`${yaEstaban} de ${deseados.length} ya existían`);
}

// 3. Custom fields ────────────────────────────────────────────────────────────
console.log('\n3. Custom fields de contacto (Fuente y Fecha de su clase)');
const cf = await ghl<{ customFields?: Array<{ id: string; name: string; dataType: string }> }>(
  `/locations/${LOCATION}/customFields?model=contact`,
);
if (!cf.ok) {
  falta(`No se pudieron leer los custom fields (HTTP ${cf.status}). El PIT necesita el permiso "locations/customFields".`);
} else {
  const campos = cf.data.customFields ?? [];
  const asegurar = async (nombre: string, claveEnv: string, comentario: string): Promise<void> => {
    if (env[claveEnv]) {
      const porId = campos.find((c) => c.id === env[claveEnv]);
      if (porId) {
        ok(`${claveEnv} ya apunta a "${porId.name}"`);
        return;
      }
      aviso(`${claveEnv} tiene un id que no existe en esta sub-cuenta; se busca por nombre.`);
    }
    let campo = campos.find((c) => normalizar(c.name) === normalizar(nombre));
    if (!campo) {
      if (SOLO_REVISAR) {
        aviso(`Falta el campo "${nombre}" (se crearía)`);
        return;
      }
      const r = await ghl<{ customField?: { id: string; name: string; dataType: string } }>(
        `/locations/${LOCATION}/customFields`,
        { method: 'POST', body: JSON.stringify({ name: nombre, dataType: 'TEXT', model: 'contact' }) },
      );
      if (!r.ok || !r.data?.customField) {
        falta(`No se pudo crear el campo "${nombre}" (HTTP ${r.status})`);
        return;
      }
      campo = r.data.customField;
      creado(`campo "${nombre}"`);
    } else {
      ok(`campo "${campo.name}" existe`);
    }
    if (!env[claveEnv] || env[claveEnv] !== campo.id) {
      agregarEnv(claveEnv, campo.id, comentario);
      aviso(`${claveEnv}=${campo.id} → se escribe en .env.local`);
    }
  };
  await asegurar('Fuente', 'GHL_CAMPO_FUENTE_ID', 'Id del custom field "Fuente" (lo escribió el instalador).');
  await asegurar(
    'Fecha de su clase',
    'GHL_CAMPO_FECHA_CLASE_ID',
    'Id del custom field "Fecha de su clase" (lo escribió el instalador).',
  );
}

// 4. Pipeline ─────────────────────────────────────────────────────────────────
console.log('\n4. Pipeline de oportunidades');
const NOMBRE_PIPELINE = env.GHL_PIPELINE_NOMBRE || 'Webinars';
const ETAPAS: Array<[string, string[]]> = [
  ['Nuevo Registro', ['nuevo registro', 'registro']],
  ['Asistió al Webinar', ['asistio al webinar', 'asistio', 'ingreso']],
  ['Cliente Potencial', ['cliente potencial', 'potencial', 'carrito']],
  ['Cliente Ganado', ['cliente ganado', 'ganado', 'pago']],
];
const pl = await ghl<{ pipelines?: Array<{ id: string; name: string; stages: Array<{ id: string; name: string }> }> }>(
  `/opportunities/pipelines?locationId=${LOCATION}`,
);
if (!pl.ok) {
  falta(`No se pudieron leer los pipelines (HTTP ${pl.status}). El PIT necesita el permiso "opportunities".`);
} else {
  const objetivo = normalizar(NOMBRE_PIPELINE);
  const pipeline =
    (pl.data.pipelines ?? []).find((p) => normalizar(p.name) === objetivo) ??
    (pl.data.pipelines ?? []).find((p) => normalizar(p.name).includes(objetivo));
  if (!pipeline) {
    falta(`No existe un pipeline llamado "${NOMBRE_PIPELINE}".`);
    console.log(`
     GHL no deja crear pipelines por API. Créalo a mano (2 minutos):
       Oportunidades → Pipelines → + Crear pipeline → nombre "${NOMBRE_PIPELINE}"
       y estas 4 etapas, en este orden:
         1. Nuevo Registro
         2. Asistió al Webinar
         3. Cliente Potencial
         4. Cliente Ganado
     Luego vuelve a correr  npm run instalar`);
  } else {
    const faltantes = ETAPAS.filter(
      ([, alias]) => !pipeline.stages.some((s) => alias.some((a) => normalizar(s.name).includes(a))),
    ).map(([n]) => n);
    if (faltantes.length) {
      falta(`Al pipeline "${pipeline.name}" le faltan las etapas: ${faltantes.join(', ')}. Tiene: ${pipeline.stages.map((s) => s.name).join(' | ')}`);
    } else {
      ok(`Pipeline "${pipeline.name}" con sus 4 etapas`);
    }
  }
}

// 5. Panel ────────────────────────────────────────────────────────────────────
console.log('\n5. Panel /admin');
if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 24) {
  const secreto = randomBytes(32).toString('base64url');
  agregarEnv('ADMIN_SESSION_SECRET', secreto, 'Secreto de la cookie del panel (lo generó el instalador).');
  aviso('ADMIN_SESSION_SECRET generado → se escribe en .env.local');
} else ok('ADMIN_SESSION_SECRET presente');
if (!env.ADMIN_PASSWORD) falta('Falta ADMIN_PASSWORD en .env.local: la contraseña con la que entrarás a /admin.');
else ok('ADMIN_PASSWORD presente');
if (!env.LADA_POR_DEFECTO) aviso('LADA_POR_DEFECTO no está: se asume 52 (México).');

guardarEnv();

// Resumen ─────────────────────────────────────────────────────────────────────
console.log('');
if (fallos === 0) {
  console.log('Todo listo del lado de GoHighLevel. Siguiente paso: npm run dev y abre http://localhost:3000/admin\n');
} else {
  console.log(`${fallos} cosa(s) por resolver arriba. Corrígelas y vuelve a correr  npm run instalar\n`);
  process.exit(1);
}
