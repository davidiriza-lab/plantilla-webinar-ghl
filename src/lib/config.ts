/**
 * La configuración del webinar, tal como se edita en /admin.
 *
 * Vive en los custom values de la location de GHL, no en una base aparte.
 * Los campos con `slug` que ya existían los creó la plantilla BGI V2.5;
 * los reutilizamos para que los workflows de correo y esta página lean
 * exactamente el mismo valor.
 */
import 'server-only';
import { revalidateTag } from 'next/cache';
import {
  fetchCustomValues,
  writeCustomValue,
  refrescarValoresPorId,
  CONFIG_CACHE_TAG,
  type CustomValue,
} from './ghl';
import {
  parsearDia,
  parsearHora,
  parsearZona,
  parsearBooleano,
  parsearEntero,
  parsearUrl,
  parsearFecha,
  parsearModo,
  parsearPuerta,
  parsearEtiqueta,
} from './parseo';
import type { EtiquetasGenerales } from './etiquetas';
import { CAMPOS, POR_DEFECTO, DERIVADOS, type CampoConfig, type ConfigWebinar } from './campos';
export { CAMPOS, type CampoConfig, type ConfigWebinar };
import { leerInstantanea, guardarInstantanea } from './almacen';

/** Un campo editable del panel de administración. */
function limpiar(valor: string | null | undefined): string {
  return (valor ?? '').trim();
}

/**
 * Lee la configuración completa desde GHL.
 *
 * Devuelve los valores **crudos**, tal como están en los custom values, para
 * que el panel muestre exactamente lo que hay. La interpretación tolerante
 * (aceptar "jueves" en vez de "4") ocurre en `aPublica`.
 */
export async function leerConfig(): Promise<ConfigWebinar> {
  return (await leerConfigSegura()).config;
}

export type OrigenConfig = 'instantanea' | 'ghl' | 'por-defecto';

/**
 * La configuración que usan las páginas.
 *
 * Orden: la **instantánea** primero, que se resuelve en el edge y no depende de
 * nadie más. Solo si nunca hubo una se sale a GHL, y ese resultado se guarda
 * para no volver a depender de él.
 *
 * `degradado` significa que no hay ningún dato bueno: ni copia ni GHL. Es el
 * único caso en el que se anuncian los valores por defecto, y las páginas que
 * lo necesitan lo tratan aparte — la puerta de la sala, por ejemplo, se abre.
 */
export async function leerConfigSegura(): Promise<{
  config: ConfigWebinar;
  degradado: boolean;
  origen: OrigenConfig;
}> {
  const instantanea = await leerInstantanea();
  if (instantanea) {
    return {
      config: { ...POR_DEFECTO, ...instantanea.config },
      degradado: false,
      origen: 'instantanea',
    };
  }

  const desdeGhl = await leerDesdeGhl();
  if (desdeGhl) {
    // Primera vez: se deja la copia hecha para que las siguientes visitas ya
    // no dependan de GHL.
    void guardarInstantanea(desdeGhl);
    return { config: desdeGhl, degradado: false, origen: 'ghl' };
  }

  return { config: { ...POR_DEFECTO }, degradado: true, origen: 'por-defecto' };
}

/** Lee los custom values de GHL, o null si no respondió. */
export async function leerDesdeGhl(
  opciones?: { fresco?: boolean; porId?: boolean },
): Promise<ConfigWebinar | null> {
  let index: Map<string, CustomValue>;
  try {
    index = await fetchCustomValues(opciones);
    // `porId` es para la reparación manual: el listado puede estar minutos
    // atrás, y ahí sí importa traer la verdad aunque cueste una petición por
    // campo. Ver `refrescarValoresPorId`.
    if (opciones?.porId) index = await refrescarValoresPorId(index);
  } catch (error) {
    console.error('GHL no respondió al leer la configuración:', error);
    return null;
  }

  return configDesdeIndex(index);
}

/**
 * Arma la configuración a partir de un índice de custom values.
 *
 * Se extrajo de `leerDesdeGhl` para que `guardarConfig` pueda reutilizar
 * exactamente las mismas reglas —alias incluidos— sobre un índice que él mismo
 * parchea, sin tener que volver a preguntarle a GHL.
 */
export function configDesdeIndex(
  index: Map<string, CustomValue>,
): ConfigWebinar {
  const config = { ...POR_DEFECTO };
  for (const campo of CAMPOS) {
    let valor = limpiar(index.get(campo.slug)?.value);

    // Si el campo principal está vacío, se busca en los equivalentes: da
    // igual si se llenó "Grupo de Whatsapp" o "Enlace Grupo Whatsapp".
    if (!valor && campo.alias) {
      for (const alias of campo.alias) {
        valor = limpiar(index.get(alias)?.value);
        if (valor) break;
      }
    }

    if (valor) config[campo.clave] = valor;
  }
  return config;
}

/**
 * Resultado de reconciliar: por qué (no) se tocó la copia. `sin-cambios` no es
 * un error — GHL y la copia ya coincidían. `sin-credenciales` y `error` sí
 * importan: significan que la web puede estar sirviendo datos viejos sin que
 * nadie se entere (fue justo lo que pasó 5 días con un VERCEL_API_TOKEN
 * revocado — la copia se congeló y el panel nunca lo dijo).
 */
export type ResultadoReconciliacion =
  | { estado: 'ok' }
  | { estado: 'sin-cambios' }
  | { estado: 'sin-credenciales' }
  | { estado: 'ghl-no-respondio' }
  | { estado: 'error'; detalle: string };

/**
 * Trae lo que haya en GHL y refresca la copia si difiere.
 *
 * Es lo que mantiene vivo el sistema híbrido: si el dueño edita un custom value
 * directo en la interfaz de GHL, esto lo sube a la instantánea. Se llama desde
 * el panel y desde cada registro, nunca bloqueando la respuesta.
 */
export async function reconciliarDesdeGhl(
  opciones?: { fresco?: boolean; porId?: boolean },
): Promise<ResultadoReconciliacion & { config?: ConfigWebinar }> {
  const deGhl = await leerDesdeGhl(opciones);
  if (!deGhl) return { estado: 'ghl-no-respondio' };

  const actual = await leerInstantanea();
  if (actual && JSON.stringify(actual.config) === JSON.stringify(deGhl)) {
    return { estado: 'sin-cambios', config: deGhl };
  }

  const resultado = await guardarInstantanea(deGhl);
  if (resultado.ok) return { estado: 'ok', config: deGhl };
  if (resultado.razon === 'sin-credenciales') {
    return { estado: 'sin-credenciales', config: deGhl };
  }
  return { estado: 'error', detalle: resultado.detalle, config: deGhl };
}

/** Guarda solo los campos que llegaron en `cambios`. */
export async function guardarConfig(
  cambios: Partial<ConfigWebinar>,
): Promise<ResultadoReconciliacion & { config?: ConfigWebinar }> {
  const index = await fetchCustomValues();

  for (const campo of CAMPOS) {
    const valor = cambios[campo.clave];
    if (valor === undefined) continue;
    const limpio = valor.trim();
    await writeCustomValue(campo.nombre, campo.slug, limpio, index);

    // Se refleja en el índice local lo que se acaba de escribir. Es lo que
    // permite armar la copia sin releer: ver el comentario de abajo.
    const previo = index.get(campo.slug);
    index.set(campo.slug, {
      ...(previo ?? {
        id: '',
        name: campo.nombre,
        fieldKey: `{{ custom_values.${campo.slug} }}`,
      }),
      value: limpio,
    });
  }

  // Invalida para las PRÓXIMAS peticiones (páginas, registros).
  revalidateTag(CONFIG_CACHE_TAG, { expire: 0 });

  // La copia NO se rehace releyendo GHL.
  //
  // El listado `/customValues` de GHL es de consistencia eventual: después de
  // un PUT sigue devolviendo el valor anterior durante un rato, aunque el GET
  // por id ya devuelva el nuevo. Verificado el 1-sep-2026: por id decía
  // 2026-09-17 mientras el listado insistía en 2026-09-10.
  //
  // Releer ahí —con caché o sin ella— hacía que la comparación concluyera
  // "sin cambios" y se saltara la copia: el panel respondía "guardado" y la
  // web seguía sirviendo la configuración vieja. Ese es el bug de los 5 días
  // de agosto.
  //
  // Se arma con el índice ya parcheado, que usa las mismas reglas de alias y
  // limpieza. La reconciliación real contra GHL sigue corriendo en cada
  // registro y al abrir el panel, cuando el listado ya se puso al día.
  const config = configDesdeIndex(index);
  const guardada = await guardarInstantanea(config);
  if (guardada.ok) return { estado: 'ok', config };
  if (guardada.razon === 'sin-credenciales') {
    return { estado: 'sin-credenciales', config };
  }
  return { estado: 'error', detalle: guardada.detalle, config };
}

/**
 * Campos de solo lectura que la app **calcula** y deja escritos en GHL.
 *
 * Los custom values guardan la receta (jueves, 20:00), no el resultado. Estos
 * materializan la fecha ya resuelta para que un correo masivo desde GHL pueda
 * decir "el jueves 20 de agosto" sin calcular nada.
 *
 * Ojo: se actualizan al guardar en el panel, no solos cada semana. Para el
 * correo de confirmación y los recordatorios usa mejor el campo del **contacto**
 * `Fecha de su clase`, que se escribe en cada registro y no se queda viejo.
 */
export { DERIVADOS };

export interface Derivados {
  fechaLegible: string;
  fechaCorta: string;
  horaConZona: string;
}

/**
 * Escribe en GHL la fecha ya calculada de la próxima clase.
 *
 * Solo escribe lo que cambió. Devuelve true si tocó algo, para poder
 * invalidar la caché únicamente cuando hizo falta.
 */
export async function guardarDerivados(
  valores: Derivados,
  opciones?: { fresco?: boolean },
): Promise<boolean> {
  const index = await fetchCustomValues(opciones);
  const contenido = [
    valores.fechaLegible,
    valores.fechaCorta,
    valores.horaConZona,
  ];

  let cambio = false;
  for (let i = 0; i < DERIVADOS.length; i++) {
    const d = DERIVADOS[i];
    if (limpiar(index.get(d.slug)?.value) === contenido[i]) continue;
    await writeCustomValue(d.nombre, d.slug, contenido[i], index);
    cambio = true;
  }
  return cambio;
}

/** Solo lo que el navegador puede ver sin filtrar secretos. */
export interface ConfigPublica {
  tituloWebinar: string;
  modo: 'recurrente' | 'fecha';
  fechaUnica: string;
  diaSemana: string;
  hora: string;
  zonaHoraria: string;
  duracionMinutos: number;
  activo: boolean;
  antelacionMinutos: number;
  puerta: 'auto' | 'abierta' | 'cerrada';
  etiquetas: EtiquetasGenerales;
  /**
   * Si hay enlace de sala cargado. El enlace en sí NO es público: todo lo que
   * está en esta interfaz puede acabar en el HTML de una página, y la llave de
   * la sala solo la entrega la puerta cuando está abierta (`enlaceDeLaSala`).
   */
  haySala: boolean;
  /** La URL pública de /ingreso, si el dueño la cargó en el panel. */
  enlacePuerta: string;
  enlaceGrupoWhatsapp: string;
  enlaceSoporte: string;
  enlaceOferta: string;
  enlaceCheckout: string;
  enlaceApartado: string;
  precio: number;
  /** Código de moneda de tres letras, en mayúsculas. */
  moneda: string;
  minutosOferta: number;
  pixelFacebook: string;
  videoGracias: string;
}

/**
 * La llave de la sala (Zoom). Solo para el servidor: la usa la puerta al
 * responder a quien ya pasó lista, nunca una página ni el calendario.
 *
 * Respaldo por variable de entorno: si GHL no responde a la hora de la clase
 * no hay de dónde sacarla.
 */
export function enlaceDeLaSala(config: ConfigWebinar): string {
  return (
    parsearUrl(config.enlaceIngreso) ||
    parsearUrl(process.env.ENLACE_SALA_RESPALDO ?? '')
  );
}

/**
 * Interpreta la configuración cruda para usarla en la página.
 *
 * Aquí es donde el sistema aguanta que alguien haya editado los custom values
 * a mano desde GHL: se aceptan "jueves", "8 pm", "SÍ" y una zona horaria con
 * typo no tumba nada. Ver `parseo.ts`.
 */
export function aPublica(config: ConfigWebinar): ConfigPublica {
  return {
    tituloWebinar: config.tituloWebinar,
    modo: parsearModo(config.modo),
    fechaUnica: parsearFecha(config.fechaUnica),
    diaSemana: String(parsearDia(config.diaSemana)),
    hora: parsearHora(config.hora),
    zonaHoraria: parsearZona(config.zonaHoraria),
    duracionMinutos: parsearEntero(config.duracionMinutos, 90, 5, 600),
    activo: parsearBooleano(config.activo),
    antelacionMinutos: parsearEntero(config.antelacionMinutos, 15, 0, 240),
    puerta: parsearPuerta(config.puerta),
    etiquetas: {
      registro: parsearEtiqueta(config.etiquetaRegistro, 'Registro webinar'),
      ingreso: parsearEtiqueta(config.etiquetaIngreso, 'Ingreso webinar'),
      interesado: parsearEtiqueta(config.etiquetaInteresado, 'Interesado webinar'),
      oferta: parsearEtiqueta(config.etiquetaOferta, 'Carrito webinar'),
    },
    haySala: enlaceDeLaSala(config) !== '',
    enlacePuerta: parsearUrl(config.enlacePuerta),
    enlaceGrupoWhatsapp: parsearUrl(config.enlaceGrupoWhatsapp),
    enlaceSoporte: parsearUrl(config.enlaceSoporte),
    enlaceOferta: parsearUrl(config.enlaceOferta),
    enlaceCheckout: parsearUrl(config.enlaceCheckout),
    enlaceApartado: parsearUrl(config.enlaceApartado),
    // Tope alto: en pesos colombianos o chilenos un programa son millones.
    precio: parsearEntero(config.precio, 9997, 1, 100_000_000),
    moneda: /^[a-z]{3}$/i.test(config.moneda.trim()) ? config.moneda.trim().toUpperCase() : 'MXN',
    minutosOferta: parsearEntero(config.minutosOferta, 30, 1, 1440),
    // Solo dígitos: el id se interpola en un <script>, así que cualquier otra
    // cosa (el snippet entero pegado por error, o algo peor) se descarta.
    pixelFacebook: /^\d{5,20}$/.test(config.pixelFacebook.trim()) ? config.pixelFacebook.trim() : '',
    videoGracias: parsearUrl(config.videoGracias),
  };
}
