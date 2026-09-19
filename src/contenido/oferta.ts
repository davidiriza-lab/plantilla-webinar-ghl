/**
 * EL COPY DE LA OFERTA (/oferta).
 *
 * La oferta es un proceso guiado por etapas (no una lista de módulos y
 * bonos). La página acomoda estas nueve secciones en orden. El precio y el
 * enlace de pago NO van aquí: se editan en /admin.
 *
 * Todo lo marcado «EJEMPLO» es copy de muestra.
 */

export const OFERTA = {
  seo: {
    titulo: 'Programa Impulso | Un proceso guiado de 30 días', // EJEMPLO
    descripcion: 'De la idea a tu primera venta en 30 días, con implementación en vivo.', // EJEMPLO
  },

  hero: {
    titulo: 'Deja de acumular ideas y lanza tu primer programa con un sistema que puedas sostener.', // EJEMPLO
    subtitulo:
      'Un proceso guiado de 30 días para personas que ya saben qué enseñar, pero todavía no tienen una oferta clara ni una forma de venderla.', // EJEMPLO
    lineas: ['No se trata de tener más contenido.', 'No se trata de esperar el momento perfecto.'], // EJEMPLO
    remate: 'Se trata de lanzar con estructura.', // EJEMPLO
    cta: 'Quiero empezar mis 30 días',
  },

  problema: {
    titulo: 'Puedes saber muchísimo y seguir sin vender nada.', // EJEMPLO
    parrafos: [
      'Tal vez ya sabes qué quieres enseñar.',
      'Tal vez ya tienes hasta el nombre.',
      'Tal vez grabaste videos, abriste una cuenta, hiciste una lista de temas y hasta compraste un curso sobre cómo hacer cursos.',
      'Y aun así, algo ocurre:',
    ], // EJEMPLO
    detonante: 'abres el documento, ves la lista, sientes que falta algo…', // EJEMPLO
    consecuencia: 'y lo vuelves a cerrar.', // EJEMPLO
    /** Palabras cortas en cajas: lo que hace la persona cuando se traba. */
    reacciones: ['Investigas.', 'Comparas.', 'Reescribes.', 'Pospones.', 'Consumes.', 'Dudas.'], // EJEMPLO
    puntoDeTrabajo: 'Ese es el punto que trabajamos en el Programa Impulso.', // EJEMPLO
    cierre: 'No buscamos que sepas más. Buscamos que',
    cierreAcento: 'salga a la venta.', // EJEMPLO
    descripcionImagen: 'Ilustración del problema, formato 4:5',
  },

  proceso: {
    etiqueta: 'Qué es el Programa Impulso', // EJEMPLO
    titulo: 'Un proceso de 30 días. No otro curso para acumular.', // EJEMPLO
    parrafo:
      'Durante 30 días vas a recorrer una ruta concreta para definir tu oferta, validarla con gente real y vender las primeras plazas. El proceso está dividido en cuatro etapas.', // EJEMPLO
    etapas: [
      { semana: 'Semana 1', nombre: 'Definir', descripcion: 'Elige el problema, el cliente y la promesa. Sale una oferta de una página.' }, // EJEMPLO
      { semana: 'Semana 2', nombre: 'Validar', descripcion: 'Conversaciones reales con 10 personas antes de construir nada.' }, // EJEMPLO
      { semana: 'Semana 3', nombre: 'Vender', descripcion: 'Tu primera clase en vivo con este mismo embudo: registro, recordatorios y oferta.' }, // EJEMPLO
      { semana: 'Semana 4', nombre: 'Entregar y repetir', descripcion: 'Entregas la primera cohorte y dejas el sistema listo para la siguiente.' }, // EJEMPLO
    ],
    frase: 'El objetivo no es que en 30 días tengas el programa perfecto. Es que tengas uno vendido.', // EJEMPLO
  },

  incluye: {
    etiqueta: 'Qué incluye',
    titulo: 'Todo lo que necesitas para lanzar', // EJEMPLO
    partes: [
      { nombre: 'Proceso guiado de 30 días', descripcion: 'Cuatro etapas diseñadas para pasar de la idea a la primera venta.' }, // EJEMPLO
      { nombre: 'Academia', descripcion: 'Acceso durante 12 meses para volver al contenido, las herramientas y los ejercicios cuando lo necesites.' }, // EJEMPLO
      { nombre: 'Plantillas y herramientas', descripcion: 'La página de oferta, el guion de la clase y este mismo embudo, listos para adaptar.' }, // EJEMPLO
      {
        nombre: 'Sesiones en vivo',
        descripcion: 'Durante tus primeros 30 días, una sesión grupal semanal conmigo para trabajar tu caso: la oferta, el precio, la clase, las objeciones.', // EJEMPLO
        nota: 'No es otra clase. Es el espacio donde llevamos el método a lo que realmente te está pasando.',
      },
    ],
    cta: 'Quiero empezar mis 30 días',
  },

  paraQuien: {
    titulo: 'Es para ti si…',
    lista: [
      'Sabes hacer algo valioso y quieres cobrarlo en línea.', // EJEMPLO
      'Ya intentaste lanzar algo y no vendió, o nunca lo terminaste.', // EJEMPLO
      'Prefieres un proceso corto y concreto a otra biblioteca de videos.', // EJEMPLO
      'Estás dispuesto a hablar con gente real antes de construir.', // EJEMPLO
      'Quieres un sistema que puedas repetir cada mes.', // EJEMPLO
    ],
    noTitulo: 'No es para ti si…',
    no: 'Buscas ingresos sin ofrecer nada real, quieres que alguien lo haga por ti o esperas resultados sin aplicar el proceso.', // EJEMPLO
  },

  enVivo: {
    titulo: 'No vas a tener que hacerlo solo viendo videos.',
    intro: 'Durante tus primeros 30 días tendrás acceso semanal a:',
    etiqueta: 'Sesiones en vivo', // EJEMPLO
    subtitulo: 'Implementación con tu caso',
    parrafo: 'Un espacio para traer aquello que realmente está pasando:',
    frases: [
      'No sé qué precio ponerle.',
      'Hablé con tres personas y ninguna quiso.',
      'Tengo la oferta pero me da miedo publicarla.',
      'Se registraron 40 y llegaron 6.',
      'Vendí uno y no sé cómo entregarlo.',
    ], // EJEMPLO
    cierre: 'No necesitas llegar con todo resuelto.',
    cierreAcento: 'Llegas con el punto exacto donde estás atorado y trabajamos desde ahí.',
  },

  garantia: {
    dias: 5,
    titulo: 'Entra sin tener que apostar a ciegas.',
    linea1: 'No quiero que entres por presión.',
    linea2: 'Quiero que entres con decisión.',
    /** {dias} se reemplaza por el número. */
    texto: 'Por eso, desde el momento en que te inscribes tienes {dias} días para entrar a la plataforma, conocer la primera etapa y ver cómo trabajamos.',
    devolucion: 'Si durante esos primeros {dias} días sientes que no es para ti, escríbenos y te devolvemos el 100% de tu inversión.',
    remate: 'Así de simple.',
  },

  inversion: {
    titulo: 'Tu proceso comienza hoy.',
    etiqueta: 'Acceso al Programa Impulso', // EJEMPLO
    unPago: 'Un solo pago.',
    resumen: [
      '30 días de proceso guiado',
      '4 etapas de implementación',
      'Sesión en vivo semanal durante tus primeros 30 días',
      'Plantillas y herramientas',
      '12 meses de acceso a la academia',
    ], // EJEMPLO
    cta: 'Quiero entrar al Programa Impulso', // EJEMPLO
    /** Lo que ve la persona bajo el botón. Menciona tu pasarela real. */
    pago: 'Pago seguro con Mercado Pago. Las formas de pago disponibles se muestran al entrar al checkout.',
  },

  cierre: {
    titulo: 'Puedes seguir preparándote… o lanzar con lo que ya sabes.', // EJEMPLO
    parrafos: [
      'Probablemente ya sabes más de lo que necesitas para empezar.',
      'La pregunta ahora no es qué más necesitas aprender.',
      'La pregunta es:',
    ], // EJEMPLO
    pregunta: '¿Qué vas a hacer distinto esta vez?', // EJEMPLO
    despues: ['No necesitas más contenido.', 'Necesitas una secuencia y alguien que te acompañe mientras la ejecutas.'], // EJEMPLO
    remate: 'Tus próximos 30 días pueden empezar hoy.',
    /** {precio} se reemplaza por el precio configurado en /admin. */
    cta: 'Empezar hoy — {precio}',
    garantia: 'Tienes {dias} días de garantía para entrar, conocer el proceso y decidir desde la experiencia.',
  },
} as const;
