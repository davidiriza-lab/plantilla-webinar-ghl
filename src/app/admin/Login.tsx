'use client';

import { MARCA } from '@/contenido/marca';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ruta } from '@/lib/ruta';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    setError('');

    try {
      const res = await fetch(ruta('/api/admin/sesion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contrasena: String(datos.get('contrasena')) }),
      });
      if (!res.ok) {
        setError('Contraseña incorrecta.');
        setEnviando(false);
        return;
      }
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo otra vez.');
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-fondo px-6">
      <form
        onSubmit={entrar}
        className="w-full max-w-[400px] rounded-[14px] border border-linea bg-superficie p-9"
      >
        <h1 className="titulo mb-2 text-[26px] text-crema">Panel de control</h1>
        <p className="mb-7 text-sm text-texto-tenue">
          {MARCA.webinar} · configuración del webinar
        </p>

        <label
          htmlFor="contrasena"
          className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
        >
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mb-5 w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema focus:border-acento focus:outline-none"
        />

        <button type="submit" className="boton-acento" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-[#F0A0A0]">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
