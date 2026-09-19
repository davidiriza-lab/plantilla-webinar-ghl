/**
 * Marcador de una foto que todavía no existe, con la misma tarjeta
 * `rounded-xl border-linea bg-superficie` que usan las fotos reales del resto del
 * sitio (secretos, casos de éxito, el retrato del presentador) — para que cuando
 * se reemplace por la imagen real, el marco ya sea el mismo que en todas
 * las demás páginas.
 *
 * Uso: <PlaceholderImagen numero={1} descripcion="..." aspecto="retrato" />
 */
interface Props {
  numero: number;
  descripcion: string;
  aspecto?: 'retrato' | 'paisaje' | 'cuadrado';
  className?: string;
}

export default function PlaceholderImagen({
  numero,
  descripcion,
  aspecto = 'retrato',
  className = '',
}: Props) {
  const proporcion =
    aspecto === 'retrato'
      ? 'aspect-[4/5]'
      : aspecto === 'paisaje'
        ? 'aspect-video'
        : 'aspect-square';

  return (
    <div
      className={`${proporcion} relative overflow-hidden rounded-xl border border-linea bg-fondo/70 ${className}`}
    >
      <div className="flex h-full flex-col justify-between p-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-acento">
          Imagen {String(numero).padStart(2, '0')}
        </span>
        <p className="max-w-[26ch] text-[13.5px] leading-snug text-texto-tenue">
          {descripcion}
        </p>
      </div>
    </div>
  );
}
