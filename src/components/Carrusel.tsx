'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ruta } from '@/lib/ruta';

interface Props {
  imagenes: ReadonlyArray<{ src: string; alt: string }>;
}

export default function Carrusel({ imagenes }: Props) {
  const [actual, setActual] = useState(0);
  const total = imagenes.length;

  const mover = useCallback(
    (delta: number) => setActual((i) => (i + delta + total) % total),
    [total],
  );

  useEffect(() => {
    const id = setInterval(() => mover(1), 6000);
    return () => clearInterval(id);
  }, [mover]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${actual * 100}%)` }}
        >
          {imagenes.map((img, i) => (
            <Image
              key={img.src}
              src={ruta(img.src)}
              alt={img.alt}
              width={1280}
              height={854}
              priority={i === 0}
              className="min-w-full object-cover"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => mover(-1)}
          aria-label="Imagen anterior"
          className="absolute left-3.5 top-1/2 flex size-[46px] -translate-y-1/2 items-center justify-center rounded-full border border-acento bg-fondo/70 text-xl text-acento"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => mover(1)}
          aria-label="Imagen siguiente"
          className="absolute right-3.5 top-1/2 flex size-[46px] -translate-y-1/2 items-center justify-center rounded-full border border-acento bg-fondo/70 text-xl text-acento"
        >
          ›
        </button>
      </div>

      <div className="mt-4.5 flex justify-center gap-2">
        {imagenes.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActual(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
            aria-current={i === actual}
            className={`size-2 rounded-full transition-colors ${
              i === actual ? 'bg-acento' : 'bg-acento/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
