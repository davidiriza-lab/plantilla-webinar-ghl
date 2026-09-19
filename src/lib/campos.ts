/**
 * LOS CUSTOM VALUES DE GOHIGHLEVEL, declarados.
 *
 * Este archivo es solo datos (sin `server-only`) para que lo puedan leer
 * tanto el sitio como el instalador (`npm run instalar`), que los crea en
 * una sub-cuenta nueva.
 *
 * Cada campo: cómo se llama en GHL (`nombre`), su slug (`slug`), cómo se
 * muestra en /admin (`etiqueta`, `ayuda`, `grupo`) y cómo se interpreta
 * (`tipo`). `alias` acepta slugs alternativos por si la sub-cuenta ya traía
 * uno parecido.
 */
export interface CampoConfig {
  clave: keyof ConfigWebinar;
  /** Nombre del custom value en GHL (el que se ve en su interfaz). */
  nombre: string;
  /** Slug del fieldKey, para localizarlo. */
  slug: string;
  /**
   * Otros custom values de la location que significan lo mismo. Si el
   * principal está vacío se lee del primero de estos que traiga valor, para
   * que dé igual cuál se llene desde la interfaz de GHL.
   */
  alias?: readonly string[];
  etiqueta: string;
  ayuda?: string;
  tipo:
    | 'texto'
    | 'url'
    | 'hora'
    | 'dia'
    | 'numero'
    | 'zona'
    | 'interruptor'
    | 'modo'
    | 'fecha'
    | 'puerta';
  grupo:
    | 'Programación'
    | 'La sala'
    | 'Enlaces'
    | 'La oferta'
    | 'Etiquetas'
    | 'Contenido'
    | 'Seguimiento';
}

export interface ConfigWebinar {
  tituloWebinar: string;
  modo: string;
  fechaUnica: string;
  diaSemana: string;
  hora: string;
  zonaHoraria: string;
  duracionMinutos: string;
  activo: string;
  antelacionMinutos: string;
  puerta: string;
  etiquetaRegistro: string;
  etiquetaIngreso: string;
  etiquetaInteresado: string;
  etiquetaOferta: string;
  enlaceIngreso: string;
  enlaceGrupoWhatsapp: string;
  enlaceSoporte: string;
  enlaceOferta: string;
  enlaceRepeticion: string;
  enlaceCheckout: string;
  enlaceApartado: string;
  precio: string;
  minutosOferta: string;
  pixelFacebook: string;
  tokenFacebook: string;
  videoGracias: string;
}

/**
 * El mapa entre el panel y GHL. Cambiar un `slug` aquí cambia a qué custom
 * value apunta el campo — no lo toques sin revisar los workflows de GHL.
 */
export const CAMPOS: readonly CampoConfig[] = [
  {
    clave: 'tituloWebinar',
    nombre: 'Titulo del webinar',
    slug: 'titulo_del_webinar',
    alias: ['nombre_del_webinar'],
    etiqueta: 'Título del webinar',
    ayuda: 'Aparece en la barra superior y en los correos.',
    tipo: 'texto',
    grupo: 'Contenido',
  },
  {
    clave: 'modo',
    nombre: 'Webinar Modo',
    slug: 'webinar_modo',
    etiqueta: '¿Se repite cada semana?',
    ayuda: 'Elige "una sola fecha" para una edición especial que no se repite.',
    tipo: 'modo',
    grupo: 'Programación',
  },
  {
    clave: 'fechaUnica',
    nombre: 'Fecha del webinar',
    slug: 'fecha_del_webinar',
    etiqueta: 'Fecha de la clase',
    ayuda: 'Solo se usa cuando la clase NO se repite.',
    tipo: 'fecha',
    grupo: 'Programación',
  },
  {
    clave: 'diaSemana',
    nombre: 'Webinar Dia Semana',
    slug: 'webinar_dia_semana',
    etiqueta: 'Día de la semana',
    ayuda: 'El día en que se transmite cada semana.',
    tipo: 'dia',
    grupo: 'Programación',
  },
  {
    clave: 'hora',
    nombre: 'Hora del Webinar',
    slug: 'hora_del_webinar',
    etiqueta: 'Hora de inicio',
    ayuda: 'Formato 24 horas, por ejemplo 20:00.',
    tipo: 'hora',
    grupo: 'Programación',
  },
  {
    clave: 'zonaHoraria',
    nombre: 'Webinar Zona Horaria',
    slug: 'webinar_zona_horaria',
    etiqueta: 'Zona horaria',
    ayuda: 'La hora de arriba se interpreta en esta zona.',
    tipo: 'zona',
    grupo: 'Programación',
  },
  {
    clave: 'duracionMinutos',
    nombre: 'Webinar Duracion Minutos',
    slug: 'webinar_duracion_minutos',
    etiqueta: 'Duración en minutos',
    ayuda: 'Mientras dura, la página muestra el botón de entrar en vivo.',
    tipo: 'numero',
    grupo: 'Programación',
  },
  {
    clave: 'activo',
    nombre: 'Webinar Activo',
    slug: 'webinar_activo',
    etiqueta: 'Registro abierto',
    ayuda: 'Apágalo para pausar los registros sin bajar la página.',
    tipo: 'interruptor',
    grupo: 'Programación',
  },
  {
    clave: 'antelacionMinutos',
    nombre: 'Webinar Antelacion Minutos',
    slug: 'webinar_antelacion_minutos',
    etiqueta: 'La sala abre cuántos minutos antes',
    ayuda: 'Antes de eso, la página de ingreso no muestra el formulario.',
    tipo: 'numero',
    grupo: 'La sala',
  },
  {
    clave: 'puerta',
    nombre: 'Webinar Puerta',
    slug: 'webinar_puerta',
    etiqueta: 'Mando de la puerta',
    ayuda:
      'Déjalo en automático. Ábrela a la fuerza solo si algo falla y la gente no puede entrar.',
    tipo: 'puerta',
    grupo: 'La sala',
  },
  {
    clave: 'etiquetaRegistro',
    nombre: 'Etiqueta General Registro',
    slug: 'etiqueta_general_registro',
    etiqueta: 'Etiqueta al registrarse',
    ayuda: 'La que dispara tu automatización de registro en GHL.',
    tipo: 'texto',
    grupo: 'Etiquetas',
  },
  {
    clave: 'etiquetaIngreso',
    nombre: 'Etiqueta General Ingreso',
    slug: 'etiqueta_general_ingreso',
    etiqueta: 'Etiqueta al entrar a la sala',
    ayuda: 'La que dispara tu automatización de asistencia.',
    tipo: 'texto',
    grupo: 'Etiquetas',
  },
  {
    clave: 'etiquetaInteresado',
    nombre: 'Etiqueta General Interesado',
    slug: 'etiqueta_general_interesado',
    etiqueta: 'Etiqueta al mostrar interés',
    ayuda: 'La que dispara tu automatización de seguimiento de ventas.',
    tipo: 'texto',
    grupo: 'Etiquetas',
  },
  {
    clave: 'etiquetaOferta',
    nombre: 'Etiqueta General Carrito',
    slug: 'etiqueta_general_carrito',
    etiqueta: 'Etiqueta al llegar al pago',
    ayuda:
      'Se pone al dar clic en "Comprar" en /oferta, la conozcamos o no. Distinta de "interesado": esa es de quien dice que hoy no puede pagar.',
    tipo: 'texto',
    grupo: 'Etiquetas',
  },
  {
    clave: 'enlaceIngreso',
    nombre: 'Enlace de ingreso al webinar',
    slug: 'enlace_de_ingreso_al_webinar',
    alias: ['enlace_zoom_webinar'],
    etiqueta: 'Enlace para entrar al webinar',
    ayuda: 'El Zoom o la sala. Es el botón que aparece a la hora del evento.',
    tipo: 'url',
    grupo: 'Enlaces',
  },
  {
    clave: 'enlaceGrupoWhatsapp',
    nombre: 'Enlace Grupo Whatsapp',
    slug: 'enlace_grupo_whatsapp',
    alias: ['grupo_de_whatsapp'],
    etiqueta: 'Grupo de WhatsApp',
    ayuda: 'Se le ofrece al prospecto en la página de gracias.',
    tipo: 'url',
    grupo: 'Enlaces',
  },
  {
    clave: 'enlaceSoporte',
    nombre: 'Enlace de Whatsapp de Soporte',
    slug: 'enlace_de_whatsapp_de_soporte',
    etiqueta: 'WhatsApp de soporte',
    ayuda: 'Para dudas. Aparece en el pie de página.',
    tipo: 'url',
    grupo: 'Enlaces',
  },
  {
    clave: 'enlaceOferta',
    nombre: 'Enlace de la oferta',
    slug: 'enlace_de_la_oferta',
    etiqueta: 'Enlace de la oferta',
    ayuda: 'A dónde va la gente que quiere comprar el protocolo.',
    tipo: 'url',
    grupo: 'Enlaces',
  },
  {
    clave: 'enlaceRepeticion',
    nombre: 'Enlace de Repeticion',
    slug: 'enlace_de_repeticion',
    etiqueta: 'Enlace de la repetición',
    tipo: 'url',
    grupo: 'Enlaces',
  },
  {
    clave: 'enlaceCheckout',
    nombre: 'Enlace de Checkout',
    slug: 'enlace_de_checkout',
    etiqueta: 'Enlace de pago del protocolo',
    ayuda: 'A dónde manda el botón de comprar. Sin esto la página de oferta no vende.',
    tipo: 'url',
    grupo: 'La oferta',
  },
  {
    clave: 'enlaceApartado',
    nombre: 'Enlace de Apartado',
    slug: 'enlace_de_apartado',
    etiqueta: 'Enlace para apartar el lugar',
    ayuda: 'El pago de $50 que congela el precio. Si lo dejas vacío, ese bloque no aparece.',
    tipo: 'url',
    grupo: 'La oferta',
  },
  {
    clave: 'precio',
    nombre: 'Precio de la Oferta',
    slug: 'precio_de_la_oferta',
    etiqueta: 'Precio en pesos',
    ayuda: 'Solo el número. Se muestra como $4,997 MXN.',
    tipo: 'numero',
    grupo: 'La oferta',
  },
  {
    clave: 'minutosOferta',
    nombre: 'Minutos de la Oferta',
    slug: 'minutos_de_la_oferta',
    etiqueta: 'Duración del contador de la oferta',
    ayuda: 'En minutos. Arranca cuando la persona abre la página y se guarda en su navegador.',
    tipo: 'numero',
    grupo: 'La oferta',
  },
  {
    clave: 'videoGracias',
    nombre: 'Video de Gracias',
    slug: 'video_de_gracias',
    etiqueta: 'Video de bienvenida (página de gracias)',
    ayuda: 'YouTube, Vimeo o un MP4. Si lo dejas vacío, no aparece el bloque.',
    tipo: 'url',
    grupo: 'Contenido',
  },
  {
    clave: 'pixelFacebook',
    nombre: 'Facebook Pixel',
    slug: 'facebook_pixel',
    etiqueta: 'ID del pixel de Meta',
    ayuda: 'Déjalo vacío si no hay tráfico pagado.',
    tipo: 'texto',
    grupo: 'Seguimiento',
  },
  {
    clave: 'tokenFacebook',
    nombre: 'Facebook Token',
    slug: 'facebook_token',
    etiqueta: 'Token de la API de conversiones',
    ayuda: 'Sirve para acreditar los registros del lado del servidor.',
    tipo: 'texto',
    grupo: 'Seguimiento',
  },
] as const;

/** Lo que se usa cuando el custom value está vacío. */
export const POR_DEFECTO: ConfigWebinar = {
  tituloWebinar: 'Clase en vivo',
  modo: 'recurrente',
  fechaUnica: '',
  diaSemana: '4',
  hora: '20:00',
  zonaHoraria: 'America/Mexico_City',
  duracionMinutos: '90',
  activo: 'si',
  antelacionMinutos: '15',
  puerta: 'auto',
  etiquetaRegistro: 'Registro webinar',
  etiquetaIngreso: 'Ingreso webinar',
  etiquetaInteresado: 'Interesado webinar',
  etiquetaOferta: 'Carrito webinar',
  enlaceIngreso: '',
  enlaceGrupoWhatsapp: '',
  enlaceSoporte: '',
  enlaceOferta: '',
  enlaceRepeticion: '',
  enlaceCheckout: '',
  enlaceApartado: '',
  precio: '397',
  minutosOferta: '30',
  pixelFacebook: '',
  tokenFacebook: '',
  videoGracias: '',
};

export const DERIVADOS = [
  { nombre: 'Webinar Proxima Fecha', slug: 'webinar_proxima_fecha' },
  { nombre: 'Webinar Proxima Fecha Corta', slug: 'webinar_proxima_fecha_corta' },
  { nombre: 'Webinar Proxima Hora', slug: 'webinar_proxima_hora' },
] as const;
