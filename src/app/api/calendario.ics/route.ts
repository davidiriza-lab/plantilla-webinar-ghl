/**
 * GET /api/calendario.ics — el evento de la próxima clase, para descargar.
 *
 * Sustituye a AddEvent: la página genera su propio archivo de calendario a
 * partir de la misma configuración de GHL, sin depender de un tercero.
 *
 * Es siempre **un solo evento**, nunca una regla de repetición, aunque el
 * webinar sea recurrente: cada clase se agenda como si fuera única.
 */
import { leerConfig, aPublica } from '@/lib/config';
import { calcularOcurrencia } from '@/lib/schedule';
import { MARCA } from '@/contenido/marca';
import { GRACIAS } from '@/contenido/landing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Formato de fecha de iCalendar en UTC: 20260821T020000Z */
function aFechaIcs(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escapa según RFC 5545: las comas, los puntos y comas y las barras
 * invertidas tienen significado, y los saltos de línea van como `\n`.
 */
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Las líneas de iCalendar no deben pasar de 75 octetos. */
function plegar(linea: string): string {
  if (linea.length <= 75) return linea;
  const trozos: string[] = [linea.slice(0, 75)];
  let resto = linea.slice(75);
  while (resto.length > 74) {
    trozos.push(' ' + resto.slice(0, 74));
    resto = resto.slice(74);
  }
  if (resto) trozos.push(' ' + resto);
  return trozos.join('\r\n');
}

export async function GET(request: Request): Promise<Response> {
  const config = aPublica(await leerConfig());
  const o = calcularOcurrencia(config);

  const origen = new URL(request.url).origin;
  const enlace = config.enlaceIngreso || origen;

  const descripcion = [
    `${config.tituloWebinar}.`,
    '',
    config.enlaceIngreso
      ? `Entra aquí: ${config.enlaceIngreso}`
      : 'El enlace de acceso te llega por correo y por WhatsApp.',
    '',
    GRACIAS.puntualidad,
  ].join('\n');

  // El UID identifica esta ocurrencia: si se reagenda la misma, el calendario
  // la actualiza en vez de duplicarla.
  const uid = `${MARCA.slug}-${o.inicioMs}@${new URL(MARCA.sitio).hostname}`;

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${MARCA.webinar}//ES`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${aFechaIcs(Date.now())}`,
    `DTSTART:${aFechaIcs(o.inicioMs)}`,
    `DTEND:${aFechaIcs(o.finMs)}`,
    `SUMMARY:${escapar(config.tituloWebinar)}`,
    `DESCRIPTION:${escapar(descripcion)}`,
    `URL:${escapar(enlace)}`,
    `LOCATION:${escapar(config.enlaceIngreso ? 'En línea' : 'En línea')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapar(`${config.tituloWebinar} empieza en 30 minutos`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const cuerpo = lineas.map(plegar).join('\r\n') + '\r\n';

  return new Response(cuerpo, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${MARCA.slug}.ics"`,
      'Cache-Control': 'no-store',
    },
  });
}
