/**
 * Pruebas de la lectura tolerante. Se corre con:  npm run probar:parseo
 *
 * Cubren lo que puede pasar cuando alguien edita los custom values a mano
 * desde GoHighLevel, que es el punto del sistema híbrido.
 */
import {
  parsearDia,
  parsearHora,
  parsearZona,
  parsearBooleano,
  parsearEntero,
  parsearUrl,
} from '../src/lib/parseo.ts';

let fallos = 0;

function verificar(titulo: string, real: unknown, esperado: unknown): void {
  const ok = real === esperado;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : ' FALLA'} ${titulo}`);
  if (!ok) console.log(`        esperaba ${esperado!}, obtuvo ${real!}`);
}

// Se silencian los avisos: aquí se espera que aparezcan.
const avisoOriginal = console.warn;
console.warn = () => {};

console.log('\nDía de la semana\n');
verificar('número "4"', parsearDia('4'), 4);
verificar('"jueves"', parsearDia('jueves'), 4);
verificar('"Jueves" con mayúscula', parsearDia('Jueves'), 4);
verificar('"miércoles" con acento', parsearDia('miércoles'), 3);
verificar('"miercoles" sin acento', parsearDia('miercoles'), 3);
verificar('"Thursday" en inglés', parsearDia('Thursday'), 4);
verificar('"sáb" abreviado', parsearDia('sáb'), 6);
verificar('"domingo" → 0', parsearDia('domingo'), 0);
verificar('vacío → el por defecto', parsearDia(''), 4);
verificar('basura → el por defecto', parsearDia('cuando sea'), 4);
verificar('"9" fuera de rango → por defecto', parsearDia('9'), 4);

console.log('\nHora\n');
verificar('"20:00"', parsearHora('20:00'), '20:00');
verificar('"8:00 pm"', parsearHora('8:00 pm'), '20:00');
verificar('"8 pm"', parsearHora('8 pm'), '20:00');
verificar('"8pm"', parsearHora('8pm'), '20:00');
verificar('"8:30 PM"', parsearHora('8:30 PM'), '20:30');
verificar('"9 am"', parsearHora('9 am'), '09:00');
verificar('"12 am" es medianoche', parsearHora('12 am'), '00:00');
verificar('"12 pm" es mediodía', parsearHora('12 pm'), '12:00');
verificar('"20"', parsearHora('20'), '20:00');
verificar('"7:05"', parsearHora('7:05'), '07:05');
verificar('"25:00" inválida → por defecto', parsearHora('25:00'), '20:00');
verificar('"en la noche" → por defecto', parsearHora('en la noche'), '20:00');

console.log('\nZona horaria\n');
verificar('válida pasa', parsearZona('Europe/Madrid'), 'Europe/Madrid');
verificar(
  'con typo NO tumba, cae al defecto',
  parsearZona('America/Mexico_Cty'),
  'America/Mexico_City',
);
verificar('vacía → por defecto', parsearZona(''), 'America/Mexico_City');

console.log('\nSí / no\n');
verificar('"si"', parsearBooleano('si'), true);
verificar('"sí" con acento', parsearBooleano('sí'), true);
verificar('"SÍ" en mayúsculas', parsearBooleano('SÍ'), true);
verificar('"yes"', parsearBooleano('yes'), true);
verificar('"true"', parsearBooleano('true'), true);
verificar('"no"', parsearBooleano('no'), false);
verificar('"NO"', parsearBooleano('NO'), false);
verificar('"false"', parsearBooleano('false'), false);
verificar('"cerrado"', parsearBooleano('cerrado'), false);
verificar('basura → abierto (falla del lado seguro)', parsearBooleano('???'), true);

console.log('\nNúmeros\n');
verificar('"90"', parsearEntero('90', 90, 5, 600), 90);
verificar('"120"', parsearEntero('120', 90, 5, 600), 120);
verificar('"0" fuera de rango', parsearEntero('0', 90, 5, 600), 90);
verificar('"noventa"', parsearEntero('noventa', 90, 5, 600), 90);
verificar('vacío', parsearEntero('', 90, 5, 600), 90);

console.log('\nEnlaces\n');
verificar(
  'https pasa',
  parsearUrl('https://zoom.us/j/123'),
  'https://zoom.us/j/123',
);
verificar('vacío se queda vacío', parsearUrl(''), '');
verificar('"pendiente" no se usa', parsearUrl('pendiente'), '');
verificar('sin protocolo no se usa', parsearUrl('zoom.us/j/123'), '');
verificar('javascript: se bloquea', parsearUrl('javascript:alert(1)'), '');

console.warn = avisoOriginal;

console.log(
  fallos === 0
    ? '\nTodas las pruebas pasaron.\n'
    : `\n${fallos} prueba(s) fallaron.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
