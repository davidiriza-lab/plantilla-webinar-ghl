/**
 * EL COPY DE LA LANDING (/) Y DE LA PÁGINA DE GRACIAS (/gracias).
 *
 * La página solo acomoda lo que hay aquí. Si una lista queda vacía
 * (carrusel, casos), esa sección no se muestra. Si una imagen queda en '',
 * se muestra un marcador con la descripción para que sepas qué falta.
 *
 * Todo lo marcado «EJEMPLO» es el copy de muestra del webinar de Business
 * Growth Intensive: reemplázalo con el tuyo.
 */

export const LANDING = {
  /** La franja de arriba: "Clase online gratuita · jueves 24 de septiembre" */
  franja: 'Clase online gratuita',

  hero: {
    titulo: 'Lleva tu negocio más lejos con un equipo de IA que trabaja mientras tú diriges', // EJEMPLO
    /** Se muestra con las partes en negritas entre ** **. */
    subtitulo:
      'En esta clase gratuita te muestro **el sistema de tres partes** para diseñar la trayectoria de tu negocio y ejecutar el crecimiento **sin contratar más gente ni depender de una agencia**.', // EJEMPLO
  },

  intro: {
    etiqueta: 'Lo que más escucho',
    cita: 'Sé exactamente qué tendría que hacer para crecer, pero entre operar el negocio y apagar fuegos, nunca llego a hacerlo.', // EJEMPLO
    titulo: 'No te falta visión.',
    tituloAcento: 'Te falta propulsión.', // EJEMPLO
    parrafo:
      'Tienes la idea, la estrategia y hasta el plan. Lo que no tienes es un equipo que lo ejecute cada día sin que tú estés encima. Eso es lo que hoy se puede construir con IA.', // EJEMPLO
    remate: 'Ideas. Estrategia. Ejecución. Resultados.', // EJEMPLO
  },

  secretos: {
    etiqueta: 'Lo que vas a aprender',
    titulo: 'Las tres partes del sistema', // EJEMPLO
    subtitulo: 'Lo que hacemos con cada negocio dentro del intensivo, en versión de 90 minutos.', // EJEMPLO
    lista: [
      {
        numero: 'Parte 1',
        titulo: 'Diseñar la trayectoria: de dónde vienen tus clientes y a dónde quieres llegar', // EJEMPLO
        texto: 'Un mapa de una página con tu embudo real, tus números y el siguiente nivel concreto.', // EJEMPLO
        /** Ruta en /public/assets o '' para un marcador. */
        imagen: '/assets/bgi/parte-1-trayectoria.webp' as string, // EJEMPLO
        descripcionImagen: 'Foto o ilustración de la parte 1, formato 16:10',
      },
      {
        numero: 'Parte 2',
        titulo: 'Montar tu primer equipo de IA: agentes que capturan, siguen y cierran', // EJEMPLO
        texto: 'Qué se automatiza primero, qué no, y cómo se conecta con tu CRM sin romper nada.', // EJEMPLO
        imagen: '/assets/bgi/parte-2-equipo-ia.webp' as string, // EJEMPLO
        descripcionImagen: 'Foto o ilustración de la parte 2, formato 16:10',
      },
      {
        numero: 'Parte 3',
        titulo: 'Ejecutar el crecimiento: el ritmo semanal que sostiene la altitud', // EJEMPLO
        texto: 'El embudo exacto que estás viendo ahora: registro, recordatorios, clase en vivo y oferta.', // EJEMPLO
        imagen: '/assets/bgi/parte-3-altitud.webp' as string, // EJEMPLO
        descripcionImagen: 'Foto o ilustración de la parte 3, formato 16:10',
      },
    ],
  },

  presentador: {
    etiqueta: 'Conoce a',
    /** Viñetas de credibilidad: cifras, trayectoria, método. */
    puntos: [
      'Diseña y opera embudos y sistemas de IA para negocios de servicios y educación.', // EJEMPLO
      'Creador de Business Growth Intensive: un intensivo para diseñar la trayectoria y ejecutar el crecimiento.', // EJEMPLO
      'Su trabajo une estrategia, tecnología y una estructura simple que el dueño puede operar.', // EJEMPLO
      'Enseña con casos reales y sistemas en producción, no con teoría.', // EJEMPLO
    ],
    descripcionRetrato: 'Retrato del presentador, formato 4:5',
  },

  detalles: {
    titulo: 'Detalles de la clase',
    donde: '100% en línea\ny gratis',
    nota: 'Se transmite una sola vez. No queda grabada para todos.',
  },

  metodo: {
    titulo: 'No es teoría.',
    tituloAcento: 'Es un sistema que puedes operar tú.', // EJEMPLO
    parrafo:
      'Este método nace de construir sistemas reales para negocios reales. En la clase te muestro el camino completo.', // EJEMPLO
    /** Fotos del carrusel. Vacío = la sección no se muestra. */
    carrusel: [] as ReadonlyArray<{ src: string; alt: string }>,
  },

  paraTi: {
    titulo: 'Esta clase es',
    tituloAcento: 'para ti',
    lista: [
      'Diriges un negocio que ya vende y quieres llevarlo al siguiente nivel sin duplicar el equipo.', // EJEMPLO
      'Has probado herramientas de IA sueltas y ninguna cambió tus números.', // EJEMPLO
      'Quieres un sistema concreto que puedas ver funcionando, no otra charla de tendencias.', // EJEMPLO
    ],
    cierre: 'Este espacio es para ti.',
  },

  noParaTi: {
    lista: [
      'Buscas resultados sin tocar tu operación.', // EJEMPLO
      'Quieres que alguien lo haga por ti sin entender cómo funciona.', // EJEMPLO
      'Esperas crecer sin ejecutar lo que veas en la clase.', // EJEMPLO
    ],
    cierre: 'Esta clase es para quienes están listos para ejecutar.',
  },

  casos: {
    etiqueta: 'Casos de éxito',
    titulo: 'Ya lo hicieron',
    subtitulo: 'Negocios que ya construyeron su sistema con nosotros.', // EJEMPLO
    /** Vacío = la sección no se muestra. `video` puede ir en ''. */
    lista: [] as ReadonlyArray<{ imagen: string; video: string; cita: string; quien: string }>,
  },

  cierre: {
    titulo: 'Diseña la trayectoria. Ejecuta el crecimiento.', // EJEMPLO
    parrafo: 'Crecer no es trabajar más horas. Es',
    parrafoAcento: 'construir el sistema que trabaja por ti', // EJEMPLO
    cta: 'Quiero apartar mi lugar gratis',
  },
} as const;

export const GRACIAS = {
  etiqueta: 'Tu lugar está apartado',
  /** "{nombre}, ya casi." o "Ya casi." */
  titulo: 'ya casi.',
  grupo: {
    titulo: 'Entra al grupo de WhatsApp',
    texto: 'Ahí te mandamos el enlace de acceso y el recordatorio antes de empezar. Es el canal por el que nos vas a escuchar primero.',
    boton: 'Unirme ahora',
  },
  calendario: {
    texto: 'La gente que lo agenda es la que llega, y la que llega es la que aprovecha.',
  },
  puntualidad: 'Llega puntual: lo que se construye en la primera media hora es lo que sostiene el resto.',
} as const;
