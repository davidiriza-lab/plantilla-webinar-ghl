/**
 * Qué hacer con la URL del video de bienvenida.
 *
 * El camino recomendado es subir el video a **Media Storage de GoHighLevel**
 * (ya está pagado con la sub-cuenta) y pegar su enlace: es un archivo, y un
 * archivo se muestra con el reproductor del navegador (`<video>`), que no puede
 * ejecutar nada ni mostrar otra página.
 *
 * YouTube y Vimeo se aceptan como alternativa y van en un iframe aislado.
 * Cualquier otra URL NO se incrusta: antes se intentaba como iframe, y eso
 * dejaba poner una página ajena dentro de la de gracias, bajo tu dominio.
 */
export type Video = { tipo: 'archivo' | 'iframe'; src: string };

const EXTENSION_VIDEO = /\.(mp4|webm|mov|m4v)$/i;

/** Los dominios desde los que GHL sirve lo que subes a Media Storage. */
function esMediaDeGhl(u: URL): boolean {
  const host = u.hostname.toLowerCase();
  return (
    host === 'assets.cdn.filesafe.space' ||
    host.endsWith('.filesafe.space') ||
    (host === 'storage.googleapis.com' && u.pathname.startsWith('/msgsndr/')) ||
    host.endsWith('.leadconnectorhq.com') ||
    host.endsWith('.msgsndr.com')
  );
}

export function interpretarVideo(url: string): Video | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;

  const host = u.hostname.toLowerCase().replace(/^www\./, '');

  // 1. Un archivo de video: el de GHL o cualquier otro alojado por https.
  if (esMediaDeGhl(u) || EXTENSION_VIDEO.test(u.pathname)) {
    // En GHL también se suben imágenes y PDFs: eso no es un video.
    if (esMediaDeGhl(u) && /\.[a-z0-9+]+$/i.test(u.pathname) && !EXTENSION_VIDEO.test(u.pathname)) {
      return null;
    }
    return { tipo: 'archivo', src: u.toString() };
  }

  // 2. YouTube y Vimeo, siempre reescritos a su reproductor oficial.
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = u.searchParams.get('v') ?? u.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    return id && /^[\w-]{6,20}$/.test(id)
      ? { tipo: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` }
      : null;
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1);
    return /^[\w-]{6,20}$/.test(id)
      ? { tipo: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` }
      : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.split('/').filter(Boolean).pop() ?? '';
    return /^\d{5,12}$/.test(id)
      ? { tipo: 'iframe', src: `https://player.vimeo.com/video/${id}` }
      : null;
  }

  // 3. Lo demás no se incrusta.
  return null;
}
