import Image from 'next/image';
import { MARCA } from '@/contenido/marca';

/**
 * El logo del embudo. Si `MARCA.logo` apunta a una imagen en /public/assets,
 * se muestra; si no, el nombre del webinar en texto con la tipografía de
 * títulos. Así la plantilla se ve terminada aunque no haya logo todavía.
 */
export default function Marca({
  texto = MARCA.webinar,
  className = '',
  tamano = 'grande',
}: {
  texto?: string;
  className?: string;
  tamano?: 'grande' | 'chico';
}) {
  if (MARCA.logo) {
    return (
      <Image
        src={MARCA.logo}
        alt={texto}
        width={1400}
        height={614}
        priority={tamano === 'grande'}
        className={className}
      />
    );
  }
  return (
    <div className={className}>
      <span
        className={`titulo block text-crema ${
          tamano === 'grande' ? 'text-[34px] max-sm:text-[26px]' : 'text-[20px]'
        }`}
      >
        {texto}
      </span>
    </div>
  );
}
