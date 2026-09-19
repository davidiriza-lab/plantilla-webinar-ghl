/**
 * Pruebas de la puerta de la sala y de las etiquetas.
 * Se corre con:  npm run probar:puerta
 *
 * La puerta es la pieza donde un fallo deja a la gente fuera del webinar, así
 * que aquí interesa sobre todo comprobar que **se equivoca abriendo**.
 */
import { evaluarPuerta, type EntradaPuerta } from '../src/lib/puerta.ts';
import { etiquetasDe } from '../src/lib/etiquetas.ts';

let fallos = 0;

function verificar(titulo: string, real: unknown, esperado: unknown): void {
  const a = JSON.stringify(real);
  const b = JSON.stringify(esperado);
  const ok = a === b;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : ' FALLA'} ${titulo}`);
  if (!ok) console.log(`        esperaba ${b}, obtuvo ${a}`);
}

const MIN = 60_000;
const INICIO = new Date('2026-08-21T02:00:00Z').getTime(); // jue 20, 20:00 CDMX
const FIN = INICIO + 90 * MIN;

const BASE: EntradaPuerta = {
  inicioMs: INICIO,
  finMs: FIN,
  antelacionMinutos: 15,
  mando: 'auto',
  degradado: false,
};

console.log('\nPuerta automática — abre 15 min antes, cierra al terminar\n');

verificar('16 min antes → esperando', evaluarPuerta(BASE, INICIO - 16 * MIN).estado, 'esperando');
verificar('15 min antes justo → abierta', evaluarPuerta(BASE, INICIO - 15 * MIN).estado, 'abierta');
verificar('14 min antes → abierta', evaluarPuerta(BASE, INICIO - 14 * MIN).estado, 'abierta');
verificar('a la hora en punto → abierta', evaluarPuerta(BASE, INICIO).estado, 'abierta');
verificar('a media clase → sigue abierta (los que llegan tarde)', evaluarPuerta(BASE, INICIO + 45 * MIN).estado, 'abierta');
verificar('último minuto → abierta', evaluarPuerta(BASE, FIN - MIN).estado, 'abierta');
verificar('al terminar → terminada', evaluarPuerta(BASE, FIN).estado, 'terminada');
verificar('un día antes → esperando', evaluarPuerta(BASE, INICIO - 1440 * MIN).estado, 'esperando');

console.log('\nMando manual — gana sobre el cálculo\n');

verificar(
  'forzada abierta una semana antes',
  evaluarPuerta({ ...BASE, mando: 'abierta' }, INICIO - 10080 * MIN).estado,
  'abierta',
);
verificar(
  'forzada abierta aunque ya terminó',
  evaluarPuerta({ ...BASE, mando: 'abierta' }, FIN + 60 * MIN).estado,
  'abierta',
);
verificar(
  'forzada cerrada durante la clase',
  evaluarPuerta({ ...BASE, mando: 'cerrada' }, INICIO + 10 * MIN).estado,
  'esperando',
);

console.log('\nA prueba de fallos — si no sabemos, se abre\n');

verificar(
  'sin poder leer la configuración → abierta',
  evaluarPuerta({ ...BASE, degradado: true }, INICIO - 10080 * MIN).estado,
  'abierta',
);
verificar(
  'degradado gana incluso sobre el mando cerrado',
  evaluarPuerta({ ...BASE, degradado: true, mando: 'cerrada' }, INICIO).estado,
  'abierta',
);

console.log('\nAntelación configurable\n');

verificar(
  'con 0 min abre justo a la hora',
  evaluarPuerta({ ...BASE, antelacionMinutos: 0 }, INICIO - MIN).estado,
  'esperando',
);
verificar(
  'con 0 min, a la hora en punto abre',
  evaluarPuerta({ ...BASE, antelacionMinutos: 0 }, INICIO).estado,
  'abierta',
);
verificar(
  'con 60 min abre una hora antes',
  evaluarPuerta({ ...BASE, antelacionMinutos: 60 }, INICIO - 59 * MIN).estado,
  'abierta',
);
verificar(
  'antelación negativa se trata como cero',
  evaluarPuerta({ ...BASE, antelacionMinutos: -30 }, INICIO - MIN).estado,
  'esperando',
);

console.log('\nEtiquetas — una general y una con fecha\n');

const GEN = {
  registro: 'Registro webinar',
  ingreso: 'Ingreso webinar',
  interesado: 'Interesado webinar',
  oferta: 'Carrito webinar',
};

verificar('registro', etiquetasDe('registro', GEN, '20-agosto'), [
  'Registro webinar',
  'registro 20-agosto',
]);
verificar('ingreso', etiquetasDe('ingreso', GEN, '20-agosto'), [
  'Ingreso webinar',
  'ingreso 20-agosto',
]);
verificar('interesado', etiquetasDe('interesado', GEN, '3-septiembre'), [
  'Interesado webinar',
  'interesado 3-septiembre',
]);
verificar('oferta (carrito)', etiquetasDe('oferta', GEN, '3-septiembre'), [
  'Carrito webinar',
  'carrito 3-septiembre',
]);
verificar(
  'sin fecha solo queda la general',
  etiquetasDe('registro', GEN, ''),
  ['Registro webinar'],
);
verificar(
  'general vacía no ensucia con una etiqueta en blanco',
  etiquetasDe('registro', { ...GEN, registro: '' }, '20-agosto'),
  ['registro 20-agosto'],
);

console.log(
  fallos === 0
    ? '\nTodas las pruebas pasaron.\n'
    : `\n${fallos} prueba(s) fallaron.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
