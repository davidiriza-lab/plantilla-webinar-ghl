/**
 * Cálculo de la fecha del webinar.
 *
 * Dos modos:
 *  - **recurrente**: se repite cada semana en un día fijo. La próxima
 *    ocurrencia se deriva en cada carga; no hay cron ni tarea programada.
 *  - **fecha única**: una sola transmisión en una fecha concreta. Cuando pasa,
 *    el estado queda en `pasado` y la página lo dice en vez de mentir.
 *
 * En los dos casos la página habla de **una fecha concreta** ("el jueves 20 de
 * agosto"), nunca de "todos los jueves": cada clase debe sentirse única.
 *
 * Todo se resuelve en instantes UTC para que el navegador no tenga que saber
 * nada de zonas horarias: el servidor manda un epoch y el cliente solo resta.
 */

export type EstadoWebinar = 'proximo' | 'en_vivo' | 'pasado';
export type ModoWebinar = 'recurrente' | 'fecha';

export interface Ocurrencia {
  estado: EstadoWebinar;
  modo: ModoWebinar;
  /** Inicio del webinar relevante, en epoch ms. */
  inicioMs: number;
  /** Fin del webinar relevante, en epoch ms. */
  finMs: number;
  /** "jueves", en minúsculas. */
  nombreDia: string;
  /** "8:00 pm" */
  horaLegible: string;
  /** "hora CDMX" */
  etiquetaZona: string;
  /** "jueves 20 de agosto" */
  fechaLegible: string;
  /** "jueves 20" */
  fechaCorta: string;
  /** "20-agosto" — el sufijo de las etiquetas de GHL. */
  etiquetaFecha: string;
  /**
   * "2026-08-20": el día de la clase en la zona del webinar. Va a un custom
   * field de tipo fecha para que los workflows de GHL puedan esperar hasta ese
   * día (una espera no puede apuntar al texto "jueves 20 de agosto").
   */
  fechaIso: string;
}

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

/** Etiquetas cortas para el copy. Si no está en la lista, se usa la ciudad. */
const ETIQUETAS_ZONA: Record<string, string> = {
  'America/Mexico_City': 'hora CDMX',
  'America/Monterrey': 'hora CDMX',
  'America/Tijuana': 'hora Tijuana',
  'America/Cancun': 'hora Cancún',
  'America/Bogota': 'hora Colombia',
  'America/Lima': 'hora Perú',
  'America/Santiago': 'hora Chile',
  'America/Argentina/Buenos_Aires': 'hora Argentina',
  'America/Los_Angeles': 'hora Los Ángeles',
  'America/New_York': 'hora Nueva York',
  'Europe/Madrid': 'hora España',
};

export function etiquetaZona(zona: string): string {
  if (ETIQUETAS_ZONA[zona]) return ETIQUETAS_ZONA[zona];
  const ciudad = zona.split('/').pop()?.replace(/_/g, ' ');
  return ciudad ? `hora ${ciudad}` : zona;
}

interface ParedReloj {
  anio: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
  diaSemana: number;
}

/** Qué hora es, en la zona pedida, para un instante dado. */
function relojEn(instante: number, zona: string): ParedReloj {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: zona,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });

  const partes = fmt.formatToParts(new Date(instante));
  const get = (tipo: string): string =>
    partes.find((p) => p.type === tipo)?.value ?? '0';

  const abreviaturas = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hora = Number(get('hour'));

  return {
    anio: Number(get('year')),
    mes: Number(get('month')),
    dia: Number(get('day')),
    // Intl devuelve 24 para la medianoche en hour12:false.
    hora: hora === 24 ? 0 : hora,
    minuto: Number(get('minute')),
    diaSemana: Math.max(0, abreviaturas.indexOf(get('weekday'))),
  };
}

/** Desfase de la zona respecto a UTC, en ms, para un instante dado. */
function desfase(instante: number, zona: string): number {
  const r = relojEn(instante, zona);
  const comoUtc = Date.UTC(r.anio, r.mes - 1, r.dia, r.hora, r.minuto);
  // Se redondea al minuto porque el reloj de pared no trae segundos.
  return comoUtc - Math.floor(instante / 60000) * 60000;
}

/**
 * Convierte una hora de pared en la zona dada al instante UTC que le
 * corresponde. Se refina una vez para caer bien en los cambios de horario.
 */
function paredAUtc(
  anio: number,
  mes: number,
  dia: number,
  hora: number,
  minuto: number,
  zona: string,
): number {
  const comoUtc = Date.UTC(anio, mes - 1, dia, hora, minuto);
  let instante = comoUtc - desfase(comoUtc, zona);
  instante = comoUtc - desfase(instante, zona);
  return instante;
}

function partirHora(hora: string): { h: number; m: number } {
  const [h, m] = hora.split(':');
  const horas = Number(h);
  const minutos = Number(m);
  return {
    h: Number.isFinite(horas) ? Math.min(23, Math.max(0, horas)) : 20,
    m: Number.isFinite(minutos) ? Math.min(59, Math.max(0, minutos)) : 0,
  };
}

export function horaLegible(hora: string): string {
  const { h, m } = partirHora(hora);
  const sufijo = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

export interface EntradaHorario {
  modo: ModoWebinar;
  diaSemana: string;
  /** Solo en modo fecha única. Formato YYYY-MM-DD. */
  fechaUnica: string;
  hora: string;
  zonaHoraria: string;
  duracionMinutos: number;
}

/** Da formato a un instante: "jueves 20 de agosto" y "jueves 20". */
function describirFecha(
  inicioMs: number,
  zona: string,
): { larga: string; corta: string; etiqueta: string } {
  const larga = new Intl.DateTimeFormat('es-MX', {
    timeZone: zona,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(new Date(inicioMs))
    // es-MX mete una coma tras el día ("jueves, 20 de agosto"); estorba al leerlo.
    .replace(',', '');

  const corta = new Intl.DateTimeFormat('es-MX', {
    timeZone: zona,
    weekday: 'long',
    day: 'numeric',
  })
    .format(new Date(inicioMs))
    .replace(',', '');

  // "20-agosto": va dentro de las etiquetas de GHL, así que sin espacios,
  // sin acentos y siempre en minúsculas.
  const partes = new Intl.DateTimeFormat('es-MX', {
    timeZone: zona,
    day: 'numeric',
    month: 'long',
  }).formatToParts(new Date(inicioMs));
  const dia = partes.find((p) => p.type === 'day')?.value ?? '';
  const mes = (partes.find((p) => p.type === 'month')?.value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const etiqueta = `${dia}-${mes}`;

  return { larga, corta, etiqueta };
}

/**
 * Resuelve el webinar relevante en este momento.
 *
 * En modo recurrente: la ocurrencia en curso si estamos dentro de la ventana
 * en vivo, si no la siguiente. En modo fecha única: esa fecha, y `pasado`
 * cuando ya terminó.
 */
export function calcularOcurrencia(
  horario: EntradaHorario,
  ahoraMs: number = Date.now(),
): Ocurrencia {
  const zona = horario.zonaHoraria || 'America/Mexico_City';
  const { h, m } = partirHora(horario.hora);
  const duracionMs = Math.max(1, horario.duracionMinutos || 90) * 60_000;
  const modo: ModoWebinar = horario.modo === 'fecha' ? 'fecha' : 'recurrente';

  let inicioMs: number;

  if (modo === 'fecha') {
    const [anio, mes, dia] = horario.fechaUnica
      .split('-')
      .map((n) => Number(n));

    // Sin una fecha usable se cae al comportamiento recurrente, que siempre
    // devuelve algo válido, en vez de dejar la página sin fecha.
    if (!anio || !mes || !dia) {
      return calcularOcurrencia({ ...horario, modo: 'recurrente' }, ahoraMs);
    }

    inicioMs = paredAUtc(anio, mes, dia, h, m, zona);
  } else {
    const objetivo = Math.min(6, Math.max(0, Number(horario.diaSemana) || 0));
    const hoy = relojEn(ahoraMs, zona);

    // Ocurrencia de esta semana: se parte de hoy y se corre al día objetivo.
    const diferenciaDias = (objetivo - hoy.diaSemana + 7) % 7;
    inicioMs = paredAUtc(hoy.anio, hoy.mes, hoy.dia + diferenciaDias, h, m, zona);

    // Una clase que cruza la medianoche (jueves 23:00, 2 horas) sigue en vivo
    // el viernes a las 00:20, pero "hoy" ya es viernes y el cálculo de arriba
    // salta al jueves siguiente: la puerta se cerraría a media clase. Si la
    // ocurrencia de hace una semana de esa aún no termina, es la vigente.
    const anterior = paredAUtc(hoy.anio, hoy.mes, hoy.dia + diferenciaDias - 7, h, m, zona);
    if (ahoraMs < anterior + duracionMs) inicioMs = anterior;

    // Si ya terminó, la siguiente es dentro de siete días.
    if (ahoraMs >= inicioMs + duracionMs) {
      inicioMs = paredAUtc(
        hoy.anio,
        hoy.mes,
        hoy.dia + diferenciaDias + 7,
        h,
        m,
        zona,
      );
    }
  }

  const finMs = inicioMs + duracionMs;
  const enVivo = ahoraMs >= inicioMs && ahoraMs < finMs;
  const estado: EstadoWebinar = enVivo
    ? 'en_vivo'
    : ahoraMs >= finMs
      ? 'pasado'
      : 'proximo';

  const { larga, corta, etiqueta } = describirFecha(inicioMs, zona);
  const pared = relojEn(inicioMs, zona);
  const diaSemanaReal = pared.diaSemana;
  const dosDigitos = (n: number): string => String(n).padStart(2, '0');
  const fechaIso = `${pared.anio}-${dosDigitos(pared.mes)}-${dosDigitos(pared.dia)}`;

  return {
    estado,
    modo,
    inicioMs,
    finMs,
    nombreDia: DIAS[diaSemanaReal],
    horaLegible: horaLegible(horario.hora),
    etiquetaZona: etiquetaZona(zona),
    fechaLegible: larga,
    fechaCorta: corta,
    etiquetaFecha: etiqueta,
    fechaIso,
  };
}

/**
 * "Jueves 20 de agosto · 8:00 pm (hora CDMX)"
 *
 * Siempre una fecha concreta. Nunca "todos los jueves": cada clase se anuncia
 * como si fuera única, aunque por dentro sea recurrente.
 */
export function fraseFecha(o: Ocurrencia): string {
  const fecha = o.fechaLegible.charAt(0).toUpperCase() + o.fechaLegible.slice(1);
  return `${fecha} · ${o.horaLegible} (${o.etiquetaZona})`;
}
