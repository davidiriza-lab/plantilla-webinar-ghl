/**
 * EL COPY DE LA OFERTA (/oferta).
 *
 * La oferta presenta el programa por MÓDULOS: cada uno con su caja (imagen),
 * su promesa, su detalle y lo que la persona se lleva. Después lo que incluye,
 * los bonos (opcionales), la garantía y la inversión. El precio, la moneda y el
 * enlace de pago NO van aquí: se editan en /admin.
 *
 * Todo lo marcado «EJEMPLO» es el copy de muestra de Business Growth
 * Intensive: reemplázalo con el tuyo. Dos convenciones:
 *   - una imagen en '' muestra un marcador con la descripción de lo que falta;
 *   - un valor en 0 o una lista vacía hacen que ese dato o esa sección no salga.
 */

/** Un módulo del programa, como se ve en la sección "El programa". */
export interface Modulo {
  /** "Semana 0", "Semanas 1–3"… lo que ubica al módulo en el calendario. */
  cuando: string;
  /** "Onboarding", "Fase 1"… opcional. */
  fase: string;
  nombre: string;
  /** La frase corta en cursiva: la idea que resume el módulo. */
  frase: string;
  /** Qué logra la persona en este módulo, en una oración. */
  promesa: string;
  /** Cómo se trabaja o por qué está aquí, en dos o tres líneas. */
  detalle: string;
  /** Lo que se lleva al terminar. Vacío = no aparece la lista. */
  teLlevas: readonly string[];
  /** Ruta en /public/assets de la caja del módulo (retrato 2:3), o '' para un marcador. */
  imagen: string;
  /** Lo que valdría por separado. 0 = no se muestra. */
  valor: number;
}

/** Un bono. La sección entera desaparece si la lista está vacía. */
export interface Bono {
  nombre: string;
  descripcion: string;
  imagen: string;
  valor: number;
}

const MODULOS: readonly Modulo[] = [
  {
    cuando: 'Semana 0', // EJEMPLO
    fase: 'Onboarding', // EJEMPLO
    nombre: 'Preparación', // EJEMPLO
    frase: 'Arrancas con todo listo: plataforma, coach y plan.', // EJEMPLO
    promesa: 'Aterrizas en la plataforma, conoces a tu coach y dejas todo listo para despegar.', // EJEMPLO
    detalle:
      'Antes de la primera semana de trabajo hay una semana de onboarding. Recibes tu acceso personal a la plataforma de alumnos y empiezas el programa acompañado desde el primer día.', // EJEMPLO
    teLlevas: ['Tu acceso a la plataforma de alumnos', 'Tu coach personal asignado', 'Tu plan para las 16 semanas'], // EJEMPLO
    imagen: '/assets/bgi/modulo-0.webp', // EJEMPLO
    valor: 0,
  },
  {
    cuando: 'Semanas 1–3', // EJEMPLO
    fase: 'Fase 1', // EJEMPLO
    nombre: 'Speed Webinar', // EJEMPLO
    frase: 'Primero vendes en vivo.', // EJEMPLO
    promesa: 'Validas tu oferta, creas tu infoproducto y lanzas tu primer webinar en vivo.', // EJEMPLO
    detalle:
      'En tres semanas pasas de tener conocimiento a tener una oferta presentada frente a una audiencia real. Lo que funciona en vivo es lo que después se automatiza.', // EJEMPLO
    teLlevas: ['Tu oferta validada', 'Tu infoproducto creado', 'Tu primer webinar en vivo'], // EJEMPLO
    imagen: '/assets/bgi/modulo-1.webp', // EJEMPLO
    valor: 0,
  },
  {
    cuando: 'Semanas 4–9', // EJEMPLO
    fase: 'Fase 2', // EJEMPLO
    nombre: 'Profit Machine', // EJEMPLO
    frase: 'Luego lo automatizas.', // EJEMPLO
    promesa: 'Automatizas tu webinar evergreen: funnel completo, tráfico pago, CRM y métricas.', // EJEMPLO
    detalle:
      'Un Profit Machine es un webinar automatizado: presenta y vende tu oferta sin que tengas que estar en vivo cada vez. Primero lo lanzaste en vivo; en esta fase lo conviertes en un sistema.', // EJEMPLO
    teLlevas: ['Tu funnel completo', 'Tu tráfico pago', 'Tu CRM', 'Tus métricas'], // EJEMPLO
    imagen: '/assets/bgi/modulo-2.webp', // EJEMPLO
    valor: 0,
  },
  {
    cuando: 'Semanas 10–16', // EJEMPLO
    fase: 'Fase 3', // EJEMPLO
    nombre: 'Escalamiento', // EJEMPLO
    frase: 'Y al final lo escalas.', // EJEMPLO
    promesa: 'Escalas tu pauta, armas tu equipo mínimo y documentas tu operación.', // EJEMPLO
    detalle:
      'Con el sistema vendiendo, el trabajo cambia: más alcance, las primeras personas de tu equipo y una operación que ya no depende de tu memoria.', // EJEMPLO
    teLlevas: ['Tu pauta escalada', 'Tu equipo mínimo', 'Tu operación documentada'], // EJEMPLO
    imagen: '/assets/bgi/modulo-3.webp', // EJEMPLO
    valor: 0,
  },
];

/** Vacío en el ejemplo: BGI no ofrece bonos. Llénalo si tú sí. */
const BONOS: readonly Bono[] = [];

export const OFERTA = {
  seo: {
    titulo: 'Business Growth Intensive | 16 semanas para construir tu Profit Machine', // EJEMPLO
    descripcion:
      'Un programa intensivo para marcas personales, coaches, consultores e infoproductores de habla hispana: construyes tu oferta, lanzas tu primer webinar y lo conviertes en un sistema que trabaja todos los días.', // EJEMPLO
  },

  hero: {
    titulo: 'Convierte tu conocimiento en un negocio digital que vende todos los días.', // EJEMPLO
    subtitulo:
      'Un programa intensivo de 16 semanas para marcas personales, coaches, consultores e infoproductores de habla hispana. Construyes tu oferta, lanzas tu primer webinar y lo conviertes en un sistema que trabaja todos los días: un Profit Machine.', // EJEMPLO
    lineas: ['No se trata de publicar más.', 'No se trata de otro curso para acumular.'], // EJEMPLO
    remate: 'Se trata de construir el sistema.', // EJEMPLO
    cta: 'Quiero entrar al programa', // EJEMPLO
    /** Tres datos cortos bajo el botón. */
    datos: ['16 semanas', '100% en línea', 'En español'], // EJEMPLO
  },

  problema: {
    titulo: 'Puedes saber muchísimo y seguir sin un negocio que venda con sistema.', // EJEMPLO
    parrafos: [
      'Tal vez ya sabes qué tendrías que hacer.',
      'Tal vez ya grabaste contenido, abriste una comunidad o lanzaste algo que vendió una vez.',
      'Tal vez compraste herramientas, viste tutoriales y armaste un embudo a medias.',
      'Y aun así, algo ocurre:',
    ], // EJEMPLO
    detonante: 'llega el lunes, se llena la agenda de clientes y operación…', // EJEMPLO
    consecuencia: 'y el sistema se queda a medio construir.', // EJEMPLO
    /** Palabras cortas en cajas: lo que hace la persona cuando se traba. */
    reacciones: ['Publicas.', 'Pospones.', 'Improvisas un lanzamiento.', 'Te agotas.', 'Vuelves a empezar.'], // EJEMPLO
    puntoDeTrabajo: 'Ese es el punto que trabajamos en Business Growth Intensive.', // EJEMPLO
    cierre: 'No buscamos que sepas más. Buscamos que',
    cierreAcento: 'tu conocimiento venda con sistema.', // EJEMPLO
    /** Ruta en /public/assets o '' para un marcador. */
    imagen: '/assets/bgi/oferta-problema.webp' as string, // EJEMPLO
    descripcionImagen: 'Ilustración del problema, formato 4:5',
  },

  programa: {
    etiqueta: 'El programa', // EJEMPLO
    titulo: 'Dieciséis semanas con plan de vuelo.', // EJEMPLO
    parrafo:
      'Antes de arrancar hay una semana 0 de onboarding. Después, tres fases en orden: primero vendes en vivo, luego lo automatizas y al final lo escalas. No se saltan: lo que abre la siguiente es lo que resolviste en la anterior.', // EJEMPLO
    /** Cómo se numeran las cajas: "Módulo 01 / 04". */
    nombreUnidad: 'Módulo',
    modulos: MODULOS,
    /** Bajo los módulos, a la derecha. Solo sale si algún módulo tiene valor. */
    textoTotal: 'Los módulos, por separado',
    frase: 'Primero vendes en vivo. Luego lo automatizas. Al final lo escalas.', // EJEMPLO
    nota: 'El detalle de cada semana se entrega dentro de la plataforma al inscribirte.', // EJEMPLO
  },

  incluye: {
    etiqueta: 'Qué incluye',
    titulo: 'No avanzas solo: avanzas acompañado', // EJEMPLO
    partes: [
      { nombre: 'Coach personal 1:1', descripcion: 'Una sesión semanal con tu coach, dedicada a tu negocio y a tu avance.' }, // EJEMPLO
      { nombre: 'Sesiones en vivo con especialistas', descripcion: 'Tres días por semana, en vivo, con especialistas de cada tema del programa.' }, // EJEMPLO
      { nombre: 'Comunidad privada', descripcion: 'Avanzas acompañado de otros dueños de negocio que van en el mismo camino.' }, // EJEMPLO
      { nombre: 'Workbooks y entregables', descripcion: 'Cada semana sabes exactamente qué construir y qué entregar.' }, // EJEMPLO
      { nombre: 'Directorio de herramientas', descripcion: 'Las herramientas que vas a usar, organizadas y explicadas en un solo lugar.' }, // EJEMPLO
      {
        nombre: 'Coordinación académica',
        descripcion: 'Un equipo que acompaña tu avance de la semana 0 a la semana 16.', // EJEMPLO
        nota: 'No necesitas saber de tecnología: avanzas paso a paso con tus workbooks, tu coach y el directorio de herramientas.',
      },
    ],
    cta: 'Quiero entrar al programa', // EJEMPLO
  },

  bonos: {
    etiqueta: 'Y además',
    titulo: 'Los bonos', // EJEMPLO
    parrafo: '',
    lista: BONOS,
  },

  paraQuien: {
    titulo: 'Es para ti si…',
    lista: [
      'Eres coach, consultor, experto o dueño de una marca, personal o de empresa, con conocimiento que vender.', // EJEMPLO
      'Quieres construir un negocio digital serio, con sistema, no publicaciones sueltas.', // EJEMPLO
      'Estás dispuesto a trabajar las 16 semanas y a aparecer en cámara.', // EJEMPLO
    ],
    noTitulo: 'No es para ti si…',
    no: 'Buscas dinero rápido sin construir nada, o no quieres aparecer en cámara ni ponerte frente a tu audiencia.', // EJEMPLO
  },

  enVivo: {
    titulo: 'No vas a tener que hacerlo solo viendo videos.',
    intro: 'Durante las 16 semanas tienes, cada semana:', // EJEMPLO
    etiqueta: 'Acompañamiento en vivo', // EJEMPLO
    subtitulo: 'Tu coach 1:1 y especialistas tres días por semana', // EJEMPLO
    parrafo: 'Espacios para traer aquello que realmente está pasando:',
    frases: [
      'No sé cómo validar mi oferta.',
      'Mi webinar en vivo no convirtió.',
      'Se registraron 80 y llegaron 12.',
      'No sé leer las métricas de mi pauta.',
      'Vendí y no sé cómo escalar la entrega.',
    ], // EJEMPLO
    cierre: 'No necesitas llegar con todo resuelto.',
    cierreAcento: 'Llegas con el punto exacto donde estás atorado y trabajamos desde ahí.',
  },

  garantia: {
    dias: 5, // EJEMPLO: pon los días de TU garantía real
    titulo: 'Entra sin tener que apostar a ciegas.',
    linea1: 'No quiero que entres por presión.',
    linea2: 'Quiero que entres con decisión.',
    /** {dias} se reemplaza por el número. */
    texto: 'Por eso, desde el momento en que te inscribes tienes {dias} días para entrar a la plataforma, conocer a tu coach y ver cómo trabajamos.', // EJEMPLO
    devolucion: 'Si durante esos primeros {dias} días sientes que no es para ti, escríbenos y te devolvemos el 100% de tu inversión.', // EJEMPLO
    remate: 'Así de simple.',
  },

  inversion: {
    titulo: 'Tu trayectoria comienza hoy.', // EJEMPLO
    etiqueta: 'Acceso a Business Growth Intensive', // EJEMPLO
    /** Escalera de precio: lo que vale todo por separado y el precio regular, tachados. 0 = no sale. */
    textoValorTotal: 'Todo lo que incluye, por separado',
    valorTotal: 0,
    textoPrecioRegular: 'Precio regular',
    precioRegular: 0,
    textoHoy: 'Tu inversión hoy',
    unPago: 'Un solo pago.', // EJEMPLO
    resumen: [
      '16 semanas de programa, más la semana 0 de onboarding',
      '3 fases: Speed Webinar, Profit Machine y Escalamiento',
      'Coach personal 1:1 cada semana',
      'Sesiones en vivo con especialistas 3 días por semana',
      'Comunidad privada, workbooks y directorio de herramientas',
    ], // EJEMPLO
    cta: 'Quiero entrar a Business Growth Intensive', // EJEMPLO
    /** Lo que ve la persona bajo el botón. Menciona tu pasarela real. */
    pago: 'Pago seguro. Las formas de pago disponibles se muestran al entrar al checkout.', // EJEMPLO
  },

  cierre: {
    titulo: 'Puedes seguir vendiendo a ratos… o construir el sistema que vende todos los días.', // EJEMPLO
    parrafos: [
      'Probablemente ya sabes más de lo que necesitas para vender tu conocimiento.',
      'La pregunta ahora no es qué más necesitas aprender.',
      'La pregunta es:',
    ], // EJEMPLO
    pregunta: '¿Quién va a vender tu conocimiento esta semana?', // EJEMPLO
    despues: ['No necesitas más información.', 'Necesitas un sistema y alguien que te acompañe mientras lo pones a funcionar.'], // EJEMPLO
    remate: 'Tus próximas 16 semanas pueden empezar hoy.', // EJEMPLO
    /** {precio} se reemplaza por el precio configurado en /admin. */
    cta: 'Empezar hoy — {precio}',
    garantia: 'Tienes {dias} días de garantía para entrar, conocer el proceso y decidir desde la experiencia.',
  },
} as const;
