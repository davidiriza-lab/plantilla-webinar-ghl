/**
 * La salud del embudo, en una sola pregunta: ¿puede alguien registrarse y
 * entrar a la clase ahora mismo?
 *
 * Lo usan la ruta pública `/api/salud` (para un monitor externo) y el panel
 * (para el banner). Solo marca como falla lo que impide que el embudo
 * funcione — nunca lo que el dueño decidió a propósito (puerta forzada,
 * registro apagado), porque una alerta que grita por todo termina ignorada.
 *
 * No devuelve secretos ni errores crudos: dice "GoHighLevel no responde",
 * nunca el token ni el cuerpo del error.
 */
import 'server-only';
import { reconciliarDesdeGhl, aPublica, type ConfigWebinar } from './config';
import { leerInstantanea } from './almacen';
import { calcularOcurrencia } from './schedule';

export interface Revision {
  clave: 'ghl' | 'copia' | 'clase' | 'enlaces';
  ok: boolean;
  mensaje: string;
}

export interface Salud {
  ok: boolean;
  revisadoEn: string;
  revisiones: Revision[];
}

export async function revisarSalud(): Promise<Salud> {
  const revisiones: Revision[] = [];
  let config: ConfigWebinar | null = null;

  // 1. GoHighLevel responde con el token actual, y de paso se repara la copia.
  const ghl = await reconciliarDesdeGhl({ fresco: true });
  if (ghl.estado === 'ghl-no-respondio') {
    revisiones.push({
      clave: 'ghl',
      ok: false,
      mensaje:
        'GoHighLevel no responde con el token actual. Los registros nuevos fallarán hasta que se corrija.',
    });
  } else {
    revisiones.push({ clave: 'ghl', ok: true, mensaje: 'GoHighLevel responde.' });
    config = ghl.config ?? null;
  }

  // 2. La copia que leen las páginas existe y se puede escribir.
  const copia = await leerInstantanea();
  if (ghl.estado === 'sin-credenciales') {
    revisiones.push({
      clave: 'copia',
      ok: false,
      mensaje:
        'No hay copia de seguridad configurada: las páginas dependen de que GoHighLevel responda en cada visita.',
    });
  } else if (ghl.estado === 'error') {
    revisiones.push({
      clave: 'copia',
      ok: false,
      mensaje:
        'La copia de seguridad no se pudo actualizar: la web puede estar mostrando datos viejos.',
    });
  } else if (!copia) {
    revisiones.push({
      clave: 'copia',
      ok: false,
      mensaje: 'No existe la copia de seguridad: la web está en valores por defecto.',
    });
  } else {
    revisiones.push({
      clave: 'copia',
      ok: true,
      mensaje:
        ghl.estado === 'ghl-no-respondio'
          ? 'La web sigue funcionando con la última copia buena.'
          : 'La copia está al día.',
    });
    config ??= copia.config;
  }

  // 3. Con la configuración que haya, la clase y los enlaces tienen sentido.
  if (config) {
    const publica = aPublica(config);
    const o = calcularOcurrencia(publica);

    if (publica.modo === 'fecha' && o.estado === 'pasado' && publica.activo) {
      revisiones.push({
        clave: 'clase',
        ok: false,
        mensaje: `La fecha única (${o.fechaLegible}) ya pasó: el registro está cerrado. Pon la siguiente fecha o cambia a modo recurrente.`,
      });
    } else {
      revisiones.push({
        clave: 'clase',
        ok: true,
        mensaje: publica.activo
          ? `Próxima clase: ${o.fechaLegible}, ${o.horaLegible}.`
          : 'El registro está apagado a propósito desde el panel.',
      });
    }

    const faltan: string[] = [];
    if (!publica.enlaceIngreso) faltan.push('el enlace de la sala (Zoom)');
    if (publica.precio > 0 && !publica.enlaceCheckout) faltan.push('el enlace de pago');
    revisiones.push({
      clave: 'enlaces',
      ok: faltan.length === 0,
      mensaje:
        faltan.length === 0
          ? 'Enlaces de sala y pago cargados.'
          : `Falta ${faltan.join(' y ')} en el panel.`,
    });
  }

  return {
    ok: revisiones.every((r) => r.ok),
    revisadoEn: new Date().toISOString(),
    revisiones,
  };
}
