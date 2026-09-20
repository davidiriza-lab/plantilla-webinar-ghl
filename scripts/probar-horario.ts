/**
 * Pruebas del cálculo de fecha. Se corre con:  npm run probar:horario
 * No usa framework a propósito: es una sola pieza y conviene poder leerla entera.
 */
import {
  calcularOcurrencia,
  fraseFecha,
  type EntradaHorario,
} from '../src/lib/schedule.ts';

const SEMANAL: EntradaHorario = {
  modo: 'recurrente',
  diaSemana: '4', // jueves
  fechaUnica: '',
  hora: '20:00',
  zonaHoraria: 'America/Mexico_City',
  duracionMinutos: 90,
};

let fallos = 0;

function verificar(titulo: string, real: string, esperado: string): void {
  const ok = real === esperado;
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : ' FALLA'} ${titulo}`);
  if (!ok) console.log(`        esperaba: ${esperado}\n        obtuvo:   ${real}`);
}

const en = (iso: string): number => new Date(iso).getTime();

// ─────────────────────────────────────────────────────────────────────────────
console.log('\nRECURRENTE — jueves 20:00 America/Mexico_City, 90 min\n');

{
  const o = calcularOcurrencia(SEMANAL, en('2026-08-19T10:00:00-06:00'));
  verificar('miércoles → apunta al jueves', o.estado, 'proximo');
  verificar(
    '  el 20 de agosto',
    new Date(o.inicioMs).toISOString(),
    '2026-08-21T02:00:00.000Z',
  );
  verificar('  fecha larga', o.fechaLegible, 'jueves 20 de agosto');
  verificar('  fecha corta', o.fechaCorta, 'jueves 20');
  // En UTC ya es día 21: el campo de fecha de GHL debe llevar el día LOCAL.
  verificar('  día para GHL (local, no UTC)', o.fechaIso, '2026-08-20');
}

{
  const o = calcularOcurrencia(SEMANAL, en('2026-08-20T20:30:00-06:00'));
  verificar('jueves 20:30 → en vivo', o.estado, 'en_vivo');
}

{
  const o = calcularOcurrencia(SEMANAL, en('2026-08-20T19:59:00-06:00'));
  verificar('jueves 19:59 → aún próximo', o.estado, 'proximo');
}

{
  const o = calcularOcurrencia(SEMANAL, en('2026-08-20T21:29:00-06:00'));
  verificar('jueves 21:29 → sigue en vivo', o.estado, 'en_vivo');
}

{
  const o = calcularOcurrencia(SEMANAL, en('2026-08-20T21:30:00-06:00'));
  verificar('jueves 21:30 → ya terminó, y el recurrente NUNCA queda en pasado', o.estado, 'proximo');
  verificar(
    '  se recorre solo al 27 de agosto',
    new Date(o.inicioMs).toISOString(),
    '2026-08-28T02:00:00.000Z',
  );
  verificar('  y la fecha del copy cambia sola', o.fechaCorta, 'jueves 27');
}

// Horario de verano: Madrid pasa de UTC+2 a UTC+1 el 25 de octubre de 2026.
{
  const madrid: EntradaHorario = { ...SEMANAL, zonaHoraria: 'Europe/Madrid' };
  const antes = calcularOcurrencia(madrid, new Date('2026-10-20T09:00:00Z').getTime());
  const despues = calcularOcurrencia(madrid, new Date('2026-10-27T09:00:00Z').getTime());
  verificar(
    'Madrid antes del cambio: 22 oct 20:00 = 18:00 UTC',
    new Date(antes.inicioMs).toISOString(),
    '2026-10-22T18:00:00.000Z',
  );
  verificar(
    'Madrid después del cambio: 29 oct 20:00 = 19:00 UTC',
    new Date(despues.inicioMs).toISOString(),
    '2026-10-29T19:00:00.000Z',
  );
}

{
  const la: EntradaHorario = { ...SEMANAL, zonaHoraria: 'America/Los_Angeles' };
  const o = calcularOcurrencia(la, en('2026-08-19T10:00:00-06:00'));
  verificar(
    'Los Ángeles: jueves 20:00 PDT = viernes 03:00 UTC',
    new Date(o.inicioMs).toISOString(),
    '2026-08-21T03:00:00.000Z',
  );
  verificar('  etiqueta correcta', o.etiquetaZona, 'hora Los Ángeles');
}

{
  const domingo: EntradaHorario = { ...SEMANAL, diaSemana: '0', hora: '09:00' };
  const o = calcularOcurrencia(domingo, en('2026-08-19T10:00:00-06:00'));
  verificar(
    'domingo 09:00 → 23 de agosto',
    new Date(o.inicioMs).toISOString(),
    '2026-08-23T15:00:00.000Z',
  );
}

{
  const o = calcularOcurrencia(SEMANAL, en('2026-08-19T10:00:00-06:00'));
  verificar(
    'la frase nombra la fecha, no "todos los jueves"',
    fraseFecha(o),
    'Jueves 20 de agosto · 8:00 pm (hora CDMX)',
  );
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\nFECHA ÚNICA\n');

const UNICA: EntradaHorario = {
  modo: 'fecha',
  diaSemana: '4',
  fechaUnica: '2026-09-03',
  hora: '19:00',
  zonaHoraria: 'America/Mexico_City',
  duracionMinutos: 120,
};

{
  const o = calcularOcurrencia(UNICA, en('2026-08-19T10:00:00-06:00'));
  verificar('antes → próximo', o.estado, 'proximo');
  verificar(
    '  la fecha es la que se pidió',
    new Date(o.inicioMs).toISOString(),
    '2026-09-04T01:00:00.000Z',
  );
  verificar('  el día lo deduce de la fecha', o.fechaCorta, 'jueves 3');
  verificar('  ignora el día de la semana', o.modo, 'fecha');
}

{
  const o = calcularOcurrencia(UNICA, en('2026-09-03T20:00:00-05:00'));
  verificar('durante → en vivo', o.estado, 'en_vivo');
}

{
  const o = calcularOcurrencia(UNICA, en('2026-09-04T10:00:00-05:00'));
  verificar('después → pasado, NO se repite', o.estado, 'pasado');
  verificar(
    '  y se queda en la misma fecha',
    new Date(o.inicioMs).toISOString(),
    '2026-09-04T01:00:00.000Z',
  );
}

{
  // Una fecha en sábado debe reportar sábado aunque diaSemana diga jueves.
  const sabado: EntradaHorario = { ...UNICA, fechaUnica: '2026-09-05' };
  const o = calcularOcurrencia(sabado, en('2026-08-19T10:00:00-06:00'));
  verificar('el nombre del día sale de la fecha real', o.fechaCorta, 'sábado 5');
}

{
  // Sin fecha usable no se deja la página sin nada: cae al recurrente.
  const rota: EntradaHorario = { ...UNICA, fechaUnica: '' };
  const o = calcularOcurrencia(rota, en('2026-08-19T10:00:00-06:00'));
  verificar('fecha vacía → cae al recurrente', o.modo, 'recurrente');
  verificar('  y da una fecha válida', o.fechaCorta, 'jueves 20');
}

console.log('\nClase que cruza la medianoche\n');
{
  // Jueves 23:00, dos horas: el viernes a las 00:20 la clase sigue en vivo.
  const nocturna: EntradaHorario = { ...SEMANAL, hora: '23:00', duracionMinutos: 120 };
  const o = calcularOcurrencia(nocturna, en('2026-08-21T00:20:00-06:00'));
  verificar('viernes 00:20 → sigue en vivo', o.estado, 'en_vivo');
  verificar('  y sigue siendo la del jueves 20', o.fechaIso, '2026-08-20');
  const fin = calcularOcurrencia(nocturna, en('2026-08-21T01:05:00-06:00'));
  verificar('  al terminar pasa a la del jueves 27', fin.fechaIso, '2026-08-27');
}

console.log(
  fallos === 0
    ? '\nTodas las pruebas pasaron.\n'
    : `\n${fallos} prueba(s) fallaron.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
