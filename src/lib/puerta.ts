/**
 * La puerta de la sala.
 *
 * Es la pieza más delicada del sistema: si se queda cerrada cuando no debe,
 * nadie entra al webinar. Por eso todas las decisiones aquí están sesgadas a
 * **dejar entrar**:
 *
 *  - si no se pudo leer la configuración, se abre;
 *  - si hay un mando manual, gana sobre el cálculo;
 *  - la ventana se cierra al terminar la clase, no al empezar, para que quien
 *    llega tarde pueda entrar.
 *
 * No toca la red ni el reloj de nadie: recibe los instantes ya resueltos y
 * devuelve una decisión. Así el servidor y el navegador pueden calcular lo
 * mismo, y el navegador la reevalúa cada segundo sin recargar la página.
 */

export type EstadoPuerta =
  | 'esperando' // aún falta para que abra
  | 'abierta' // se puede entrar
  | 'terminada'; // la clase ya acabó

export interface EntradaPuerta {
  /** Inicio de la clase, epoch ms. */
  inicioMs: number;
  /** Fin de la clase, epoch ms. */
  finMs: number;
  /** Cuántos minutos antes del inicio se abre. */
  antelacionMinutos: number;
  /** Mando manual desde el panel. */
  mando: 'auto' | 'abierta' | 'cerrada';
  /** true si no se pudo leer la configuración de GHL. */
  degradado: boolean;
}

export interface DecisionPuerta {
  estado: EstadoPuerta;
  /** Instante en que abre, epoch ms. Para el contador. */
  abreMs: number;
  /** Por qué está así. Se muestra en el panel, no al visitante. */
  motivo: string;
}

export function evaluarPuerta(
  entrada: EntradaPuerta,
  ahoraMs: number = Date.now(),
): DecisionPuerta {
  const antelacion = Math.max(0, entrada.antelacionMinutos) * 60_000;
  const abreMs = entrada.inicioMs - antelacion;

  // 1. Si no sabemos la configuración real, se abre. Es preferible que alguien
  //    entre antes de tiempo a que la sala entera se quede fuera.
  if (entrada.degradado) {
    return {
      estado: 'abierta',
      abreMs,
      motivo: 'No se pudo leer la configuración; la puerta se abrió por seguridad.',
    };
  }

  // 2. El mando manual gana sobre cualquier cálculo.
  if (entrada.mando === 'abierta') {
    return { estado: 'abierta', abreMs, motivo: 'Abierta a la fuerza desde el panel.' };
  }
  if (entrada.mando === 'cerrada') {
    return { estado: 'esperando', abreMs, motivo: 'Cerrada a la fuerza desde el panel.' };
  }

  // 3. Automático.
  if (ahoraMs >= entrada.finMs) {
    return { estado: 'terminada', abreMs, motivo: 'La clase ya terminó.' };
  }
  if (ahoraMs >= abreMs) {
    return { estado: 'abierta', abreMs, motivo: 'Dentro de la ventana de acceso.' };
  }
  return { estado: 'esperando', abreMs, motivo: 'Todavía no abre.' };
}
