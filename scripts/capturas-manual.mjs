/**
 * Capturas de pantalla para el cuaderno (docs/assets/capturas/*.jpg).
 *
 *   npm run capturas                                  → contra la demo publicada
 *   npm run capturas -- http://localhost:3000
 *   ADMIN_PASSWORD=… npm run capturas                 → incluye el panel por dentro
 *
 * Se corren cuando cambia el diseño, para que el cuaderno muestre las páginas
 * reales y no dibujos. JPEG a 1440 px (y 390 px para la vista móvil).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = (process.argv[2] ?? 'https://www.mibgi.com/plantilla').replace(/\/$/, '');
const CLAVE = process.env.ADMIN_PASSWORD ?? '';
const DIR = 'docs/assets/capturas';
mkdirSync(DIR, { recursive: true });

const navegador = await chromium.launch();
const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'es-MX' });
const pagina = await contexto.newPage();

async function foto(nombre, ruta, opciones = {}) {
  await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(600);
  await pagina.screenshot({ path: `${DIR}/${nombre}.jpg`, type: 'jpeg', quality: 82, ...opciones });
  console.log(`  ✓ ${nombre}.jpg  ←  ${ruta}`);
}

console.log(`\nCapturas contra ${BASE}\n`);
await foto('landing-hero', '/');
await foto('landing-completa', '/', { fullPage: true });
await foto('gracias', '/gracias');
await foto('ingreso', '/ingreso');
await foto('oferta-hero', '/oferta');
await foto('oferta-completa', '/oferta', { fullPage: true });
await foto('admin-login', '/admin');

if (CLAVE) {
  const r = await pagina.request.post(`${BASE}/api/admin/sesion`, { data: { contrasena: CLAVE } });
  if (r.ok()) {
    await foto('admin-panel', '/admin');
    await foto('admin-panel-completo', '/admin', { fullPage: true });
  } else console.log(`  ✗ El panel no aceptó la contraseña (HTTP ${r.status()}); sin capturas del panel por dentro.`);
} else console.log('  · Sin ADMIN_PASSWORD: no se captura el panel por dentro.');

const movil = await navegador.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
await movil.goto(BASE + '/', { waitUntil: 'networkidle' });
await movil.waitForTimeout(600);
await movil.screenshot({ path: `${DIR}/movil-landing.jpg`, type: 'jpeg', quality: 82 });
console.log('  ✓ movil-landing.jpg  ←  / (390 px)');

await navegador.close();
console.log('\nListo. Las usa docs/GUIA.html; npm run manual las publica.\n');
