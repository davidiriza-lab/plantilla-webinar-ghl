/**
 * EL COPY DE LA OFERTA (/oferta).
 *
 * La oferta es un proceso guiado por etapas (no una lista de módulos y
 * bonos). La página acomoda estas nueve secciones en orden. El precio y el
 * enlace de pago NO van aquí: se editan en /admin.
 *
 * Todo lo marcado «EJEMPLO» es el copy de muestra de Business Growth
 * Intensive: reemplázalo con el tuyo.
 */

export const OFERTA = {
  seo: {
    titulo: 'Business Growth Intensive | Un intensivo guiado de 30 días', // EJEMPLO
    descripcion: 'Diseña la trayectoria de tu negocio y ejecuta el crecimiento con tu primer equipo de IA, con implementación en vivo.', // EJEMPLO
  },

  hero: {
    titulo: 'Deja de operar solo y construye el sistema que lleva tu negocio más lejos.', // EJEMPLO
    subtitulo:
      'Un intensivo guiado de 30 días para dueños de negocio que ya venden, pero siguen siendo el cuello de botella de su propio crecimiento.', // EJEMPLO
    lineas: ['No se trata de trabajar más horas.', 'No se trata de contratar a más gente.'], // EJEMPLO
    remate: 'Se trata de construir el sistema.', // EJEMPLO
    cta: 'Quiero empezar mis 30 días',
  },

  problema: {
    titulo: 'Puedes tener la estrategia clara y seguir sin despegar.', // EJEMPLO
    parrafos: [
      'Tal vez ya sabes qué tendrías que hacer.',
      'Tal vez ya lo escribiste en un plan.',
      'Tal vez compraste herramientas, viste tutoriales, contrataste a alguien que no funcionó y volviste a hacerlo tú.',
      'Y aun así, algo ocurre:',
    ], // EJEMPLO
    detonante: 'llega el lunes, se llena la agenda de operación…', // EJEMPLO
    consecuencia: 'y el plan se queda en el documento.', // EJEMPLO
    /** Palabras cortas en cajas: lo que hace la persona cuando se traba. */
    reacciones: ['Apagas fuegos.', 'Pospones.', 'Delegas mal.', 'Retomas.', 'Te frustras.', 'Vuelves a empezar.'], // EJEMPLO
    puntoDeTrabajo: 'Ese es el punto que trabajamos en Business Growth Intensive.', // EJEMPLO
    cierre: 'No buscamos que sepas más. Buscamos que',
    cierreAcento: 'tu negocio ejecute sin ti.', // EJEMPLO
    descripcionImagen: 'Ilustración del problema, formato 4:5',
  },

  proceso: {
    etiqueta: 'Qué es Business Growth Intensive', // EJEMPLO
    titulo: 'Un intensivo de 30 días. No otro curso para acumular.', // EJEMPLO
    parrafo:
      'Durante 30 días vas a recorrer una ruta concreta para diseñar la trayectoria de tu negocio, montar tu primer equipo de IA y dejarlo ejecutando cada semana. El proceso está dividido en cuatro etapas.', // EJEMPLO
    etapas: [
      { semana: 'Semana 1', nombre: 'Trayectoria', descripcion: 'Diagnóstico, números y el siguiente nivel concreto. Sale un mapa de una página.' }, // EJEMPLO
      { semana: 'Semana 2', nombre: 'Propulsión', descripcion: 'Tu primer equipo de IA conectado a tu CRM: captura, seguimiento y agenda.' }, // EJEMPLO
      { semana: 'Semana 3', nombre: 'Órbita', descripcion: 'Tu primera clase en vivo con este mismo embudo: registro, recordatorios y oferta.' }, // EJEMPLO
      { semana: 'Semana 4', nombre: 'Altitud', descripcion: 'El ritmo semanal que sostiene el crecimiento, con métricas y responsables.' }, // EJEMPLO
    ],
    frase: 'El objetivo no es que en 30 días tengas el negocio perfecto. Es que tengas un sistema que ejecuta sin ti.', // EJEMPLO
  },

  incluye: {
    etiqueta: 'Qué incluye',
    titulo: 'Todo lo que necesitas para ejecutar', // EJEMPLO
    partes: [
      { nombre: 'Intensivo guiado de 30 días', descripcion: 'Cuatro etapas diseñadas para pasar de la estrategia a un sistema ejecutando.' }, // EJEMPLO
      { nombre: 'Academia', descripcion: 'Acceso durante 12 meses para volver al contenido, las plantillas y los ejercicios cuando lo necesites.' }, // EJEMPLO
      { nombre: 'Plantillas y sistemas', descripcion: 'Este embudo, el CRM configurado y los agentes de IA, listos para adaptar a tu negocio.' }, // EJEMPLO
      {
        nombre: 'Sesiones en vivo',
        descripcion: 'Durante tus primeros 30 días, una sesión grupal semanal conmigo para trabajar tu caso: tu embudo, tus números, tu equipo de IA.', // EJEMPLO
        nota: 'No es otra clase. Es el espacio donde llevamos el método a lo que realmente está pasando en tu negocio.',
      },
    ],
    cta: 'Quiero empezar mis 30 días',
  },

  paraQuien: {
    titulo: 'Es para ti si…',
    lista: [
      'Diriges un negocio que ya vende y quieres crecer sin duplicar el equipo.', // EJEMPLO
      'Ya intentaste automatizar con herramientas sueltas y no cambió nada.', // EJEMPLO
      'Prefieres un proceso corto y concreto a otra biblioteca de videos.', // EJEMPLO
      'Estás dispuesto a tocar tu operación durante 30 días.', // EJEMPLO
      'Quieres un sistema que puedas repetir cada mes.', // EJEMPLO
    ],
    noTitulo: 'No es para ti si…',
    no: 'Buscas resultados sin tocar tu operación, quieres que alguien lo haga por ti sin entenderlo, o esperas crecer sin ejecutar el proceso.', // EJEMPLO
  },

  enVivo: {
    titulo: 'No vas a tener que hacerlo solo viendo videos.',
    intro: 'Durante tus primeros 30 días tendrás acceso semanal a:',
    etiqueta: 'Sesiones en vivo', // EJEMPLO
    subtitulo: 'Implementación con tu caso',
    parrafo: 'Un espacio para traer aquello que realmente está pasando:',
    frases: [
      'No sé por dónde empezar a automatizar.',
      'Mi CRM es un desorden y no confío en los datos.',
      'Se registraron 80 y llegaron 12.',
      'Tengo el sistema pero mi equipo no lo usa.',
      'Vendí y no sé cómo escalar la entrega.',
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
    titulo: 'Tu trayectoria comienza hoy.', // EJEMPLO
    etiqueta: 'Acceso a Business Growth Intensive', // EJEMPLO
    unPago: 'Un solo pago.',
    resumen: [
      '30 días de intensivo guiado',
      '4 etapas de implementación',
      'Sesión en vivo semanal durante tus primeros 30 días',
      'Plantillas y sistemas listos para adaptar',
      '12 meses de acceso a la academia',
    ], // EJEMPLO
    cta: 'Quiero entrar a Business Growth Intensive', // EJEMPLO
    /** Lo que ve la persona bajo el botón. Menciona tu pasarela real. */
    pago: 'Pago seguro con Mercado Pago. Las formas de pago disponibles se muestran al entrar al checkout.',
  },

  cierre: {
    titulo: 'Puedes seguir operando solo… o construir el sistema que te lleva más lejos.', // EJEMPLO
    parrafos: [
      'Probablemente ya sabes más de lo que necesitas para crecer.',
      'La pregunta ahora no es qué más necesitas aprender.',
      'La pregunta es:',
    ], // EJEMPLO
    pregunta: '¿Quién va a ejecutar la estrategia esta semana?', // EJEMPLO
    despues: ['No necesitas más información.', 'Necesitas un sistema y alguien que te acompañe mientras lo pones a funcionar.'], // EJEMPLO
    remate: 'Tus próximos 30 días pueden empezar hoy.',
    /** {precio} se reemplaza por el precio configurado en /admin. */
    cta: 'Empezar hoy — {precio}',
    garantia: 'Tienes {dias} días de garantía para entrar, conocer el proceso y decidir desde la experiencia.',
  },
} as const;
