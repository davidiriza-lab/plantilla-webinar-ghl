@AGENTS.md

# Plantilla embudo BGI

Sitio de un webinar en vivo con **GoHighLevel como única base de datos**. No hay
Supabase, Postgres ni cron. Next.js hace las páginas y captura; GHL guarda
contactos, etiquetas y configuración, y dispara correos y WhatsApp.

Lee `README.md` para el funcionamiento completo y `docs/GUIA.html` para el
cuaderno de trabajo paso a paso. Esto es lo mínimo para ayudar bien.

## Dónde vive cada cosa

| Quieres cambiar… | Dónde |
|---|---|
| Quién eres, qué vendes, logo, SEO, aviso legal | `src/contenido/marca.ts` |
| Copy de la landing y de gracias | `src/contenido/landing.ts` |
| Copy de la oferta | `src/contenido/oferta.ts` |
| Colores | `src/app/globals.css` (bloque `@theme`, 9 variables; por defecto la identidad de Business Growth Intensive: navy, azul eléctrico, cian) |
| Tipografías | `src/app/layout.tsx` (Space Grotesk + Inter) |
| Fondos del kit BGI | `public/assets/bgi/` — utilidades `fondo-hero`, `fondo-banda`, `fondo-profundo`, `fondo-nebulosa` en globals.css |
| Iconos de las tarjetas | `imagen` en `landing.ts`: icono 3D generado, WebP cuadrado 512 px con fondo transparente en `public/assets/`. Si queda en `''`, cae al icono lineal de `src/components/Icono.tsx` (`icono: 'cohete'`) |
| Fecha, hora, zona, enlaces, precio, pixel, etiquetas | **NO en código**: `/admin` → custom values de GHL |
| Qué custom values existen | `src/lib/campos.ts` |
| Etiquetas que se mandan a GHL | `src/lib/etiquetas.ts` |
| Etapas del pipeline | `src/lib/pipeline.ts` (se resuelven por nombre) |
| Puerta de la sala (cuándo abre) | `src/lib/puerta.ts` |
| Cálculo de la próxima fecha | `src/lib/schedule.ts` |

## Reglas del proyecto

- **Nada de configuración en código.** Si el dueño quiere cambiar fecha, enlace,
  precio o pixel, se hace en `/admin`, no editando archivos. Si te piden
  "cambia la fecha a…", di que va en el panel.
- **El copy va en `src/contenido/`**, nunca inline en las páginas. Al cambiar un
  texto de ejemplo, borra su marca `// EJEMPLO` (`npm run revisar` las lista).
- **GHL es la fuente de verdad.** Las páginas leen una copia en Vercel Edge
  Config; el panel escribe en los dos lados. Si tocas GHL por API, abre `/admin`
  después para que se reconcilie.
- **Las etiquetas se SUMAN**, nunca se reemplazan: `POST /contacts/{id}/tags`,
  no el arreglo `tags` del upsert. GHL las guarda en minúsculas.
- **La puerta se equivoca abriendo.** Cualquier cambio en `src/lib/puerta.ts`
  debe pasar `npm run probar:puerta`.
- **Meta:** solo el registro manda `Lead`. La puerta manda `Asistio`
  (evento propio); el pago manda `Purchase` desde el webhook. No agregues
  eventos `Lead` en otros formularios: infla el conteo.
- **No uses `any`.** Escrituras a GHL solo desde API routes (`src/app/api/*`).
- Antes de proponer un deploy: `npm run verificar` (tipos + 5 suites).
- Para publicar, la vía es `vercel` (CLI) y `vercel git connect`; no pidas al
  dueño que configure secretos de GitHub salvo que lo quiera explícitamente.
- Para crear la copia de un alumno: `gh repo create <nombre> --template
  davidiriza-lab/plantilla-webinar-ghl --private --clone`.

## Comandos

```bash
npm run instalar    # prepara la sub-cuenta de GHL y escribe IDs en .env.local
npm run revisar     # lista el copy de ejemplo que sigue sin cambiar
npm run dev         # http://localhost:3000  ·  panel en /admin
npm run verificar   # tipos + pruebas (lo mismo que corre GitHub Actions)
npm run subir-env   # copia .env.local al proyecto de Vercel (tras `vercel link`)
vercel --prod       # publica  ·  `vercel git connect` para que cada push publique
```

## Cómo llega un prospecto

`/` (registro) → `POST /api/registro` → contacto en GHL con etiquetas
`registro webinar` + `registro <fecha>`, oportunidad en **Nuevo Registro**,
`Lead` a Meta → `/gracias` (grupo de WhatsApp + calendario) → `/ingreso` abre
15 min antes → etiqueta `ingreso webinar`, etapa **Asistió** → `/oferta` →
botón de pago → etiqueta `carrito webinar`, etapa **Cliente Potencial** →
webhook de Mercado Pago → etiqueta `pago webinar`, etapa **Cliente Ganado**.
