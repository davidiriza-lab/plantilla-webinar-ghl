/**
 * Video de bienvenida de la página de gracias.
 *
 * La URL sale de la configuración de GHL, así que el dueño puede cambiarla o
 * quitarla sin tocar código. Soporta YouTube, Vimeo y archivos directos.
 */

function aEmbed(url: string): { tipo: 'iframe' | 'archivo'; src: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${id}` };
      // formato /embed/<id> o /shorts/<id>
      const m = u.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/);
      if (m) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${m[1]}` };
    }

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${id}` };
    }

    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id) return { tipo: 'iframe', src: `https://player.vimeo.com/video/${id}` };
    }

    if (host === 'player.vimeo.com' || host.endsWith('.leadconnectorhq.com')) {
      return { tipo: 'iframe', src: u.toString() };
    }

    if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) {
      return { tipo: 'archivo', src: u.toString() };
    }

    // Cualquier otra cosa se intenta como iframe.
    return { tipo: 'iframe', src: u.toString() };
  } catch {
    return null;
  }
}

export default function VideoBienvenida({ url }: { url: string }) {
  if (!url) return null;

  const embed = aEmbed(url);
  if (!embed) return null;

  return (
    <div className="mx-auto mb-11 aspect-video max-w-[720px] overflow-hidden rounded-xl border border-linea shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
      {embed.tipo === 'iframe' ? (
        <iframe
          src={embed.src}
          title="Video de bienvenida"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      ) : (
        <video src={embed.src} controls playsInline className="size-full">
          Tu navegador no puede reproducir este video.
        </video>
      )}
    </div>
  );
}
