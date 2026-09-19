/**
 * Las etiquetas que se le ponen a un contacto en GoHighLevel.
 *
 * Cada formulario pone **dos**:
 *
 *  - una **general**, siempre la misma, que es la que dispara la automatización
 *    correspondiente en GHL ("Registro webinar", "Ingreso webinar"…);
 *  - una **específica con la fecha**, que no dispara nada y sirve para
 *    segmentar después ("registro 20-agosto").
 *
 * La general se configura desde el panel, porque tiene que coincidir con el
 * disparador que el dueño haya puesto en su workflow. La específica se arma sola
 * a partir de la fecha de la clase.
 */

export type TipoFormulario = 'registro' | 'ingreso' | 'interesado' | 'oferta';

export const TIPOS: readonly TipoFormulario[] = [
  'registro',
  'ingreso',
  'interesado',
  'oferta',
] as const;

export function esTipoValido(valor: unknown): valor is TipoFormulario {
  return typeof valor === 'string' && (TIPOS as readonly string[]).includes(valor);
}

/** El prefijo de la etiqueta específica. */
const PREFIJO: Record<TipoFormulario, string> = {
  registro: 'registro',
  ingreso: 'ingreso',
  interesado: 'interesado',
  // "carrito" y no "oferta": es la etiqueta de quien llegó al botón de pago,
  // para no confundirla con "interesado" (quien dejó sus datos porque hoy no
  // puede pagar — son dos intenciones distintas, aunque las dos pasan por /oferta).
  oferta: 'carrito',
};

export interface EtiquetasGenerales {
  registro: string;
  ingreso: string;
  interesado: string;
  oferta: string;
}

/**
 * Las dos etiquetas de un envío.
 *
 * @param tipo        qué formulario se envió
 * @param generales   los nombres configurados en el panel
 * @param fechaEtiqueta  "20-agosto", de `Ocurrencia.etiquetaFecha`
 */
export function etiquetasDe(
  tipo: TipoFormulario,
  generales: EtiquetasGenerales,
  fechaEtiqueta: string,
): string[] {
  const general = generales[tipo].trim();
  const especifica = fechaEtiqueta
    ? `${PREFIJO[tipo]} ${fechaEtiqueta}`
    : '';

  // Se filtran vacíos por si alguien borró el nombre de la general en el panel.
  return [general, especifica].filter(Boolean);
}
