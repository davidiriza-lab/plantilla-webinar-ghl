'use client';

/**
 * El botón de compra cuando ya sabemos quién es (se registró o entró a la
 * sala, y quedó su identidad en cookie). No hace falta preguntarle nada:
 * al dar clic, se le pone la etiqueta de "llegó al carrito" en silencio —
 * con `keepalive` para que la petición sobreviva aunque el navegador ya esté
 * saliendo hacia la pasarela de pago — y se le manda derecho a pagar.
 */
interface Props {
  nombre: string;
  email: string;
  /** En E.164 si la cookie lo trae; vacío si no. */
  telefono?: string;
  enlaceCheckout: string;
  texto: string;
}

export default function BotonCompra({
  nombre,
  email,
  telefono = '',
  enlaceCheckout,
  texto,
}: Props) {
  function ir(): void {
    fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ tipo: 'oferta', nombre, email, telefono }),
    }).catch(() => {
      // No se bloquea la compra por esto — la etiqueta es valiosa, no
      // indispensable.
    });
    window.location.href = enlaceCheckout;
  }

  return (
    <button
      type="button"
      onClick={ir}
      className="boton-acento mx-auto max-w-[420px]"
    >
      {texto}
    </button>
  );
}
