/**
 * EL COPY DE LA LANDING (/) Y DE LA PÁGINA DE GRACIAS (/gracias).
 *
 * La página solo acomoda lo que hay aquí. Si una lista queda vacía
 * (carrusel, casos), esa sección no se muestra. Si una imagen queda en '',
 * se muestra un marcador con la descripción para que sepas qué falta.
 *
 * Todo lo marcado «EJEMPLO» es copy de muestra: reemplázalo con el tuyo.
 */

export const LANDING = {
  /** La franja de arriba: "Clase online gratuita · jueves 24 de septiembre" */
  franja: 'Clase online gratuita',

  hero: {
    titulo: 'Vende tu primer programa en línea en 30 días, aunque hoy no tengas audiencia ni equipo', // EJEMPLO
    /** Se muestra con las partes en negritas entre ** **. */
    subtitulo:
      'En esta clase gratuita te muestro **el método de 3 pasos** para convertir lo que sabes en un programa que se vende **sin depender de anuncios caros ni de un lanzamiento perfecto**.', // EJEMPLO
  },

  intro: {
    etiqueta: 'Lo que más escucho',
    cita: 'Sé mucho de lo mío, pero cada vez que intento venderlo en línea me trabo: no sé por dónde empezar ni cómo hacer que alguien pague.', // EJEMPLO
    titulo: 'No te falta conocimiento.',
    tituloAcento: 'Te falta un sistema.', // EJEMPLO
    parrafo:
      'Has tomado cursos, visto videos y guardado ideas. Pero mientras no tengas una secuencia clara de qué hacer primero y qué después, cada intento empieza de cero.', // EJEMPLO
    remate: 'Lo que no tiene sistema no escala. Se improvisa.', // EJEMPLO
  },

  secretos: {
    etiqueta: 'Lo que vas a aprender',
    titulo: 'Los 3 pasos que verás en la clase', // EJEMPLO
    subtitulo: 'Sin audiencia grande, sin equipo y sin un lanzamiento perfecto.', // EJEMPLO
    lista: [
      {
        numero: 'Paso 1',
        titulo: 'Cómo elegir el problema por el que la gente ya está pagando', // EJEMPLO
        texto: 'No se trata de lo que más te gusta enseñar, sino de lo que tu cliente ya intenta resolver.', // EJEMPLO
        /** Ruta en /public/assets o '' para un marcador. */
        imagen: '',
        descripcionImagen: 'Foto o ilustración del paso 1, formato 16:10',
      },
      {
        numero: 'Paso 2',
        titulo: 'Cómo armar una oferta clara antes de grabar un solo video', // EJEMPLO
        texto: 'Primero vendes, después construyes. Así validas sin perder meses.', // EJEMPLO
        imagen: '',
        descripcionImagen: 'Foto o ilustración del paso 2, formato 16:10',
      },
      {
        numero: 'Paso 3',
        titulo: 'Cómo llenar una clase en vivo con un presupuesto mínimo', // EJEMPLO
        texto: 'El embudo exacto que estás viendo ahora: registro, recordatorios y oferta.', // EJEMPLO
        imagen: '',
        descripcionImagen: 'Foto o ilustración del paso 3, formato 16:10',
      },
    ],
  },

  presentador: {
    etiqueta: 'Conoce a',
    /** Viñetas de credibilidad: cifras, trayectoria, método. */
    puntos: [
      'Ha acompañado a más de 300 personas a lanzar su primer programa en línea.', // EJEMPLO
      'Creadora del Programa Impulso: un sistema de 30 días de la idea a la primera venta.', // EJEMPLO
      'Su trabajo une estrategia, copy y una estructura simple que cualquiera puede operar.', // EJEMPLO
      'Enseña con casos reales, no con teoría.', // EJEMPLO
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
      'Este método nace de lanzar programas reales, con presupuestos reales. En la clase te muestro el camino completo.', // EJEMPLO
    /** Fotos del carrusel. Vacío = la sección no se muestra. */
    carrusel: [] as ReadonlyArray<{ src: string; alt: string }>,
  },

  paraTi: {
    titulo: 'Esta clase es',
    tituloAcento: 'para ti',
    lista: [
      'Sabes hacer algo valioso y quieres cobrarlo en línea, pero no sabes por dónde empezar.', // EJEMPLO
      'Ya intentaste vender un curso o una asesoría y no pasó nada.', // EJEMPLO
      'Estás cansado de consumir contenido y quieres una secuencia concreta.', // EJEMPLO
    ],
    cierre: 'Este espacio es para ti.',
  },

  noParaTi: {
    lista: [
      'Buscas una fórmula para ganar dinero sin ofrecer nada real.', // EJEMPLO
      'Quieres que alguien lo haga por ti sin involucrarte.', // EJEMPLO
      'Esperas resultados sin aplicar lo que veas en la clase.', // EJEMPLO
    ],
    cierre: 'Esta clase es para quienes están listos para hacerlo.',
  },

  casos: {
    etiqueta: 'Casos de éxito',
    titulo: 'Ya lo hicieron',
    subtitulo: 'Personas que ya hicieron este trabajo con Ana.', // EJEMPLO
    /** Vacío = la sección no se muestra. `video` puede ir en ''. */
    lista: [] as ReadonlyArray<{ imagen: string; video: string; cita: string; quien: string }>,
  },

  cierre: {
    titulo: 'Es hora de lanzar', // EJEMPLO
    parrafo: 'Lanzar no es tener todo listo. Es',
    parrafoAcento: 'empezar con lo que ya sabes', // EJEMPLO
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
