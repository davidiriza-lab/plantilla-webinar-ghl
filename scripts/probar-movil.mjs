/**
 * Comprueba que ninguna página se desborde a lo ancho en móvil.
 *
 *   npm run probar:movil                     → contra producción
 *   npm run probar:movil http://localhost:3000
 *
 * Es una revisión tonta pero atrapa un defecto que se ve feísimo y que en las
 * capturas de escritorio pasa desapercibido: una imagen con `max-w` pero sin
 * `w-full` se queda en su ancho intrínseco y hace que la página entera
 * scrollee de lado.
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3000';
const RUTAS = ['/', '/gracias', '/ingreso', '/oferta'];
const ANCHOS = [390, 360];

const navegador = await chromium.launch();
let fallos = 0;

for (const ancho of ANCHOS) {
  console.log(`\n  Ventana de ${ancho}px\n`);
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 844 } });

  for (const ruta of RUTAS) {
    await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' });

    const { documento, culpables } = await pagina.evaluate((v) => {
      const culpables = [];
      document.querySelectorAll('*').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > v + 1 && r.width > 0) {
          culpables.push(
            `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${Math.round(r.width)}px)`,
          );
        }
      });
      return { documento: document.documentElement.scrollWidth, culpables: culpables.slice(0, 3) };
    }, ancho);

    const desborda = documento > ancho + 1;
    if (desborda) fallos++;
    console.log(
      `  ${desborda ? 'FALLA' : ' ok  '} ${ruta.padEnd(12)} documento ${String(documento).padStart(4)}px`,
    );
    if (desborda) culpables.forEach((c) => console.log(`         └ ${c}`));
  }

  await pagina.close();
}

await navegador.close();
console.log(
  fallos === 0
    ? '\n  Ninguna página se desborda.\n'
    : `\n  ${fallos} página(s) se desbordan.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
