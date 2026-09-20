/**
 * LA IDENTIDAD DEL EMBUDO. Es el primer archivo que se edita al adaptar la
 * plantilla: todo lo que dice "quién eres y qué vendes" sale de aquí.
 *
 * Lo que NO va aquí: la fecha, la hora, los enlaces (Zoom, WhatsApp, pago),
 * el precio y el pixel. Eso se edita desde /admin y vive en GoHighLevel.
 *
 * Los valores de ejemplo están marcados con «EJEMPLO» para que
 * `npm run revisar` te avise de lo que sigue sin cambiar.
 */
export const MARCA = {
  /** Quién da la clase. Aparece en la landing, la oferta y el pie. */
  presentador: 'David Iriza', // EJEMPLO
  /** Una línea bajo el nombre: qué eres o qué creaste. */
  rol: 'Fundador de Business Growth Intensive', // EJEMPLO

  /** El nombre corto del webinar. Es el "logo" en texto si no cargas imagen. */
  webinar: 'Business Growth Intensive', // EJEMPLO
  /** Lo que se vende en /oferta. */
  producto: 'Business Growth Intensive', // EJEMPLO

  /** Ruta de tu logo en /public/assets, o '' para usar el nombre en texto. */
  /** La plantilla trae el logo de BGI; cámbialo por el tuyo o deja '' para usar el nombre en texto. */
  logo: '/assets/bgi/bgi-logo-white.png', // EJEMPLO
  /** Foto del presentador en /public/assets, o '' para mostrar un marcador. */
  retrato: '',

  /** Sin barra final. Se usa en metadatos y en el archivo de calendario. */
  sitio: 'https://businessgrowthintensive.com', // EJEMPLO
  /** Identificador corto sin espacios, para el calendario (.ics). */
  slug: 'business-growth-intensive', // EJEMPLO

  /** Lo que ve Google y lo que se comparte en redes. */
  seo: {
    titulo: 'Lleva tu negocio más lejos | Clase gratuita de Business Growth Intensive', // EJEMPLO
    descripcion:
      'Clase online gratuita. El sistema de tres partes para diseñar la trayectoria de tu negocio y ejecutar el crecimiento con un equipo de IA.', // EJEMPLO
    /** es_MX, es_ES, es_CO… */
    locale: 'es_MX',
    /** Color de la barra del navegador en móvil. Usa el color `fondo`. */
    color: '#0b1a3c',
  },

  /** El aviso legal del pie de página. Ajústalo a tu giro y a tu país. */
  avisoLegal:
    'Aviso legal: los resultados descritos en esta página corresponden a experiencias individuales y no constituyen una garantía de resultados. Este contenido es de carácter formativo. Este sitio no está afiliado a Facebook™, Instagram™ ni Meta Platforms™. El manejo de tus datos personales será conforme a la ley, no se compartirán con otras empresas y podrán utilizarse para enviarte información sobre eventos y promociones.',
} as const;
