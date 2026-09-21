/**
 * Pruebas de la lectura tolerante. Se corre con:  npm run probar:parseo
 *
 * Cubren lo que puede pasar cuando alguien edita los custom values a mano
 * desde GoHighLevel, que es el punto del sistema híbrido.
 */
import { armarEnlaceWa, leerEnlaceWa } from '../src/lib/whatsapp.ts';
import { interpretarVideo } from '../src/lib/video.ts';
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

console.log('\nVideo de bienvenida\n');
{
  const v = (u: string): string => {
    const r = interpretarVideo(u);
    return r ? `${r.tipo}:${r.src}` : 'nada';
  };
  const GHL = 'https://assets.cdn.filesafe.space/abc123/media/6645183f4c28.mp4';
  verificar('media de GHL → reproductor nativo', v(GHL), `archivo:${GHL}`);
  verificar(
    'media de GHL (dominio viejo)',
    v('https://storage.googleapis.com/msgsndr/abc123/media/x.mp4').split(':')[0],
    'archivo',
  );
  verificar('una imagen de GHL no es un video', v('https://assets.cdn.filesafe.space/abc/media/foto.png'), 'nada');
  verificar(
    'YouTube → reproductor oficial sin cookies',
    v('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'iframe:https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  );
  verificar('youtu.be', v('https://youtu.be/dQw4w9WgXcQ'), 'iframe:https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  verificar('Vimeo', v('https://vimeo.com/123456789'), 'iframe:https://player.vimeo.com/video/123456789');
  verificar('una página cualquiera NO se incrusta', v('https://pagina-ajena.com/formulario'), 'nada');
  verificar('http sin s NO', v('http://assets.cdn.filesafe.space/abc/media/x.mp4'), 'nada');
  verificar('javascript: NO', v('javascript:alert(1)'), 'nada');
  verificar('texto que no es URL NO', v('mi video'), 'nada');
}

console.log('\nEnlace de WhatsApp\n');
{
  verificar(
    'arma el enlace con mensaje',
    armarEnlaceWa('+52', '55 1234 5678', 'Hola, tengo una duda sobre la clase.'),
    'https://wa.me/525512345678?text=Hola%2C%20tengo%20una%20duda%20sobre%20la%20clase.',
  );
  verificar('sin mensaje, sin ?text', armarEnlaceWa('+34', '612 345 678', '  '), 'https://wa.me/34612345678');
  verificar('quita el 0 de marcación local', armarEnlaceWa('+54', '011 5555-1234', ''), 'https://wa.me/541155551234');
  verificar('número incompleto → vacío', armarEnlaceWa('+52', '5512', 'Hola'), '');
  verificar('sin número → vacío', armarEnlaceWa('+52', '', 'Hola'), '');
  verificar(
    'lee de vuelta lo que armó',
    JSON.stringify(leerEnlaceWa(armarEnlaceWa('+57', '3001234567', '¿Hay cupo? ¡Gracias!'))),
    JSON.stringify({ lada: '+57', numero: '3001234567', mensaje: '¿Hay cupo? ¡Gracias!' }),
  );
  verificar('+1 no se confunde con otra lada', leerEnlaceWa('https://wa.me/13055551234')?.lada, '+1');
  verificar(
    'formato api.whatsapp.com',
    JSON.stringify(leerEnlaceWa('https://api.whatsapp.com/send?phone=5215512345678&text=Hola')),
    JSON.stringify({ lada: '+52', numero: '15512345678', mensaje: 'Hola' }),
  );
  verificar('un enlace de grupo no es un número', leerEnlaceWa('https://chat.whatsapp.com/AbCdEf123'), null);
  verificar('otra página no es WhatsApp', leerEnlaceWa('https://example.com/?phone=5215512345678'), null);
  verificar('texto que no es URL', leerEnlaceWa('5512345678'), null);
}

console.log(
  fallos === 0
    ? '\nTodas las pruebas pasaron.\n'
    : `\n${fallos} prueba(s) fallaron.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
