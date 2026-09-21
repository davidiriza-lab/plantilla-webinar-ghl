/**
 * Video de bienvenida de la página de gracias.
 *
 * La URL sale de la configuración de GHL, así que el dueño puede cambiarla o
 * quitarla sin tocar código. Lo normal es un video subido a Media Storage de
 * GHL; qué se acepta y por qué está en `src/lib/video.ts`.
 */
import { interpretarVideo } from '@/lib/video';

export default function VideoBienvenida({ url }: { url: string }) {
  if (!url) return null;

  const embed = interpretarVideo(url);
  if (!embed) return null;

  return (
    <div className="mx-auto mb-11 aspect-video max-w-[720px] overflow-hidden rounded-xl border border-linea shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
      {embed.tipo === 'iframe' ? (
        <iframe
          src={embed.src}
          title="Video de bienvenida"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          // Aislado: puede reproducir, pero no navegar tu página ni abrir ventanas.
          sandbox="allow-scripts allow-same-origin allow-presentation"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          className="size-full"
        />
      ) : (
        // preload="metadata": carga la duración y el primer cuadro, no el archivo
        // entero, hasta que la persona le da reproducir.
        <video src={embed.src} controls playsInline preload="metadata" className="size-full">
          Tu navegador no puede reproducir este video.
        </video>
      )}
    </div>
  );
}
