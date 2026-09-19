/**
 * Lectura tolerante de la configuración.
 *
 * Los mismos custom values se pueden editar desde /admin (donde hay menús y
 * validación) o directo en la interfaz de GoHighLevel (donde son cajas de
 * texto libre). Lo segundo es el punto del sistema híbrido, así que estos
 * valores tienen que aguantar que alguien escriba "jueves", "Jueves", "8 pm"
 * o "SÍ" sin que la página mienta ni se caiga.
 *
 * Regla: ante algo que no se entiende, se usa el valor por defecto y se
 * registra en consola. Nunca lanzar — una configuración mal escrita no debe
 * tumbar la landing.
 */

const DIAS_POR_NOMBRE: Record<string, number> = {
  domingo: 0, dom: 0, sunday: 0, sun: 0,
  lunes: 1, lun: 1, monday: 1, mon: 1,
  martes: 2, mar: 2, tuesday: 2, tue: 2,
  miercoles: 3, mie: 3, wednesday: 3, wed: 3,
  jueves: 4, jue: 4, thursday: 4, thu: 4,
  viernes: 5, vie: 5, friday: 5, fri: 5,
  sabado: 6, sab: 6, saturday: 6, sat: 6,
};

/** Quita acentos y espacios sobrantes, y pasa a minúsculas. */
function normalizar(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function avisar(campo: string, valor: string, usando: string): void {
  console.warn(
    `[config] "${campo}" trae un valor que no se entiende (${JSON.stringify(valor)}); se usa ${usando}.`,
  );
}

/**
 * Día de la semana como número 0–6 (0 = domingo).
 * Acepta el número, o el nombre en español o inglés, con o sin acento.
 */
export function parsearDia(valor: string, porDefecto = 4): number {
  const v = normalizar(valor);
  if (!v) return porDefecto;

  if (/^[0-6]$/.test(v)) return Number(v);

  const porNombre = DIAS_POR_NOMBRE[v];
  if (porNombre !== undefined) return porNombre;

  avisar('Webinar Dia Semana', valor, `el día ${porDefecto}`);
  return porDefecto;
}

/**
 * Hora en formato 24 h "HH:MM".
 * Acepta "20:00", "8:00 pm", "8 pm", "8pm", "20".
 */
export function parsearHora(valor: string, porDefecto = '20:00'): string {
  const v = normalizar(valor).replace(/\./g, '');
  if (!v) return porDefecto;

  const m = v.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) {
    avisar('Hora del Webinar', valor, porDefecto);
    return porDefecto;
  }

  let horas = Number(m[1]);
  const minutos = Number(m[2] ?? '0');
  const sufijo = m[3];

  if (sufijo === 'pm' && horas < 12) horas += 12;
  if (sufijo === 'am' && horas === 12) horas = 0;

  if (horas > 23 || minutos > 59) {
    avisar('Hora del Webinar', valor, porDefecto);
    return porDefecto;
  }

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

/**
 * Zona horaria IANA válida. Un typo aquí hacía que Intl lanzara y se cayera
 * la página entera, así que se comprueba contra Intl antes de devolverla.
 */
export function parsearZona(
  valor: string,
  porDefecto = 'America/Mexico_City',
): string {
  const v = valor.trim();
  if (!v) return porDefecto;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: v });
    return v;
  } catch {
    avisar('Webinar Zona Horaria', valor, porDefecto);
    return porDefecto;
  }
}

/** Sí / no tolerante: "si", "sí", "yes", "true", "1" son verdadero. */
export function parsearBooleano(valor: string, porDefecto = true): boolean {
  const v = normalizar(valor);
  if (!v) return porDefecto;

  if (['si', 'yes', 'true', '1', 'activo', 'abierto', 'on'].includes(v)) return true;
  if (['no', 'false', '0', 'inactivo', 'cerrado', 'off'].includes(v)) return false;

  avisar('Webinar Activo', valor, porDefecto ? 'abierto' : 'cerrado');
  return porDefecto;
}

/** Entero dentro de un rango, con valor por defecto si no cuadra. */
export function parsearEntero(
  valor: string,
  porDefecto: number,
  minimo: number,
  maximo: number,
): number {
  const n = Number(String(valor).trim());
  if (!Number.isFinite(n) || n < minimo || n > maximo) {
    if (valor.trim()) avisar('valor numérico', valor, String(porDefecto));
    return porDefecto;
  }
  return Math.round(n);
}

/**
 * Una URL utilizable, o cadena vacía. Evita que un "pendiente" escrito en GHL
 * termine como href roto en la página.
 */
export function parsearUrl(valor: string): string {
  const v = valor.trim();
  if (!v) return '';
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : '';
  } catch {
    avisar('un enlace', valor, 'vacío');
    return '';
  }
}

/**
 * Fecha en formato `YYYY-MM-DD`.
 *
 * Acepta también `DD/MM/YYYY` y `DD-MM-YYYY`, que es como la escribiría
 * cualquiera a mano en GoHighLevel. Devuelve cadena vacía si no se entiende.
 */
export function parsearFecha(valor: string): string {
  const v = valor.trim();
  if (!v) return '';

  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, a, m, d] = iso;
    return armarFecha(Number(a), Number(m), Number(d), valor);
  }

  const latino = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (latino) {
    const [, d, m, a] = latino;
    return armarFecha(Number(a), Number(m), Number(d), valor);
  }

  avisar('Fecha del webinar', valor, 'vacío');
  return '';
}

function armarFecha(a: number, m: number, d: number, original: string): string {
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    avisar('Fecha del webinar', original, 'vacío');
    return '';
  }
  // Comprobación real del calendario: descarta 31 de febrero y compañía.
  const prueba = new Date(Date.UTC(a, m - 1, d));
  if (prueba.getUTCMonth() !== m - 1 || prueba.getUTCDate() !== d) {
    avisar('Fecha del webinar', original, 'vacío');
    return '';
  }
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Modo del webinar: recurrente cada semana, o una fecha única. */
export function parsearModo(valor: string): 'recurrente' | 'fecha' {
  const v = normalizar(valor);
  if (['fecha', 'unica', 'unico', 'una vez', 'single', 'once'].includes(v)) {
    return 'fecha';
  }
  return 'recurrente';
}

/**
 * Estado de la puerta de la sala.
 *
 * `auto` la abre sola faltando los minutos configurados. `abierta` y `cerrada`
 * son el mando manual, para cuando algo se sale de lo previsto y no hay tiempo
 * de averiguar por qué.
 */
export function parsearPuerta(valor: string): 'auto' | 'abierta' | 'cerrada' {
  const v = normalizar(valor);
  if (['abierta', 'abierto', 'open', 'si', 'forzar'].includes(v)) return 'abierta';
  if (['cerrada', 'cerrado', 'closed', 'no'].includes(v)) return 'cerrada';
  return 'auto';
}

/** Una etiqueta de GHL utilizable: sin saltos de línea y recortada. */
export function parsearEtiqueta(valor: string, porDefecto: string): string {
  const v = valor.replace(/[\r\n]+/g, ' ').trim().slice(0, 60);
  return v || porDefecto;
}
