# Plantilla · Embudo de webinar con GoHighLevel

Un embudo completo de webinar en vivo que **usa GoHighLevel como única base de
datos**: registro, página de gracias, puerta de la sala, oferta y panel de
control. Sin Supabase, sin Postgres, sin cron. Lo copias, lo conectas a tu
sub-cuenta de GHL en 30 minutos y lo adaptas con tu copy.

- **Cuaderno de trabajo paso a paso:** [`docs/GUIA.html`](docs/GUIA.html) (ábrelo en el navegador)
- **Para Claude Code:** [`CLAUDE.md`](CLAUDE.md) explica el proyecto para que te ayude a adaptarlo

---

## En una frase

El sitio hace las páginas y captura a la gente; **GoHighLevel es la base de
datos y el motor de mensajería**; una copia de la configuración en Vercel Edge
Config evita que el sitio dependa de que GHL esté vivo.

```
                    ┌──────────────────────────┐
   visitante ─────► │  el sitio (Next.js)      │
                    │  / /gracias /ingreso     │
                    │  /oferta                 │
                    └────┬────────────────┬────┘
                         │                │
              lee config │                │ escribe prospectos
                         ▼                ▼
              ┌──────────────────┐   ┌──────────────────────┐
              │  Edge Config     │   │  GoHighLevel         │
              │  (copia rápida)  │◄──┤  contactos, etiquetas│
              └──────────────────┘   │  custom values       │
                     ▲                │  workflows y correos │
                     │  el panel      └──────────────────────┘
              ┌──────┴───────┐
              │  /admin      │──── escribe en los DOS lados
              └──────────────┘
```

---

## Empezar (resumen; la guía lo lleva paso a paso)

Todo se hace desde VS Code con Claude Code abierto, con GitHub (`gh auth login`)
y Vercel (`vercel login`) conectados una sola vez.

```bash
# 1. Tu copia (desde Claude Code: "crea mi copia de la plantilla…")
gh repo create webinar-mi-programa --template davidiriza-lab/plantilla-webinar-ghl --private --clone
cd webinar-mi-programa && npm install && cp .env.example .env.local

# 2. Prepara tu sub-cuenta de GHL (custom values, campos, revisa el pipeline)
npm run instalar

# 3. Arranca y configura desde el panel
npm run dev                       # http://localhost:3000/admin

# 4. Pon tu copy en src/contenido/{marca,landing,oferta}.ts
npm run revisar                   # lista lo que sigue siendo ejemplo

# 5. Publica
vercel link && npm run subir-env && vercel --prod
vercel git connect                # cada push a main publica solo
```

El pipeline "Webinars" con sus 4 etapas se crea **a mano** en GHL (la API no
crea pipelines): Nuevo Registro · Asistió al Webinar · Cliente Potencial ·
Cliente Ganado. El instalador te avisa si falta.

---

## Las páginas

| Ruta | Qué hace | Caché |
|---|---|---|
| `/` | Registro al webinar | 60 s |
| `/gracias` | Confirmación, grupo de WhatsApp y calendario | 60 s |
| `/ingreso` | **La puerta de la sala.** Abre sola poco antes de empezar | ninguna |
| `/oferta` | La oferta del programa | 60 s |
| `/admin` | Panel de configuración, con contraseña | ninguna |

Rutas de API: `/api/registro`, `/api/calendario.ics`, `/api/salud` (pública,
diagnóstico), `/api/pago/mercadopago` (webhook de pago) y `/api/admin/*` (con
sesión).

---

## Qué se edita dónde

| Quieres cambiar… | Dónde |
|---|---|
| Quién eres, qué vendes, logo, SEO, aviso legal | `src/contenido/marca.ts` |
| Copy de la landing y de gracias | `src/contenido/landing.ts` |
| Copy de la oferta | `src/contenido/oferta.ts` |
| Colores | `src/app/globals.css` (9 variables en `@theme`; trae la paleta de Business Growth Intensive) |
| Tipografías | `src/app/layout.tsx` (Space Grotesk + Inter, del kit BGI) |
| Fondos y logo del kit | `public/assets/bgi/` (WebP optimizados; los PNG master viven en el kit) |
| Fecha, hora, zona, enlaces, precio, pixel, etiquetas | **`/admin`** (viven en GHL, no en código) |

Las imágenes van en `public/assets/` y se referencian desde los archivos de
contenido. Si una ruta queda en `''`, el sitio muestra un marcador con la
descripción de lo que falta: la plantilla se ve terminada desde el primer día.

---

### Comprobaciones

```bash
npm run verificar        # tipos + 5 suites de pruebas (lo mismo que corre el deploy)
npm run probar:horario   # cálculo de la fecha
npm run probar:parseo    # lectura tolerante de los custom values
npm run probar:puerta    # la puerta y las etiquetas
npm run probar:red       # timeout y reintento hacia GHL (~17 s)
npm run probar:intentos  # freno de fuerza bruta del login
npm run probar:movil     # que ninguna página se desborde a lo ancho
```

---

## De dónde salen los datos

### La configuración

Vive en los **custom values de la location de GHL** — los mismos que leen los
workflows de correo. Pero **las páginas no leen GHL**: leen una copia en
**Vercel Edge Config** que se resuelve en el edge sin salir a un tercero.

El motivo no es la velocidad. Cuando GHL no respondía, la app caía a los valores
por defecto del código y **anunciaba una fecha inventada con total seguridad**:
con martes configurado, la página decía jueves. Eso es peor que un error visible.

| | |
|---|---|
| **Escribir** | El panel guarda en GHL **y** en la copia. GHL sigue duplicado. |
| **Leer** | Solo la copia. Ninguna página bloquea esperando a GHL. |
| **Reconciliar** | Si se edita un custom value directo en GHL, se sube a la copia al abrir el panel y en cada registro. |
| **Sin copia y sin GHL** | Único caso en que se usan los valores por defecto. El panel lo avisa en rojo. |

> Si tocas un custom value por API sin pasar por el panel, **abre `/admin`
> después** para que la copia se ponga al día. No hay cron.

### Los prospectos

Son contactos de GHL. Cada envío hace *upsert*: si el correo ya existe, se
actualiza el mismo contacto en vez de duplicarlo. El teléfono se normaliza a
E.164 (`3312345678` → `+523312345678`) porque sin eso GHL duplica.

---

## La fecha del webinar

**Cada clase se anuncia como única.** La página nunca dice "todos los jueves":
dice *"el jueves 20 de agosto"*. Por dentro puede ser recurrente, pero por fuera
se siente como una sola transmisión, y la fecha se recorre sola.

| Modo | Qué hace |
|---|---|
| **Recurrente** | Se repite cada semana. Al terminar una, ya anuncia la siguiente. Nunca queda en `pasado`. |
| **Una sola fecha** | Una transmisión concreta. Al terminar queda en `pasado` y **el registro se cierra solo**. |

No hay cron: la ocurrencia se **calcula** en cada carga desde el día, la hora y
la zona horaria del panel. `src/lib/schedule.ts`, con pruebas que cubren los
cambios de horario de verano y los días borde.

### Para los correos de GHL

Los custom values guardan la receta (jueves, 20:00), no el resultado. Un correo
no puede calcular "jueves 20 de agosto" solo, así que la app se lo deja escrito:

| Dónde | Qué guarda | Para qué |
|---|---|---|
| `{{ contact.fecha_de_su_clase }}` | La fecha a la que **esa persona** se apuntó | Confirmación y recordatorios. Nunca se queda viejo. |
| `{{ custom_values.webinar_proxima_fecha }}` | La próxima fecha, para todos | Correos masivos |

También `webinar_proxima_fecha_corta` ("jueves 20") y `webinar_proxima_hora`.
Se corrigen solas: cada registro las compara y reescribe si cambiaron.

---

## La puerta de la sala (`/ingreso`)

Es la pieza más delicada: **si se queda cerrada cuando no debe, nadie entra al
webinar.** Por eso todo aquí está sesgado a dejar entrar.

| Regla | Por qué |
|---|---|
| La página **nunca se cachea** | Un HTML guardado podría decir "todavía no abre" cuando ya abrió |
| El navegador la reevalúa **cada segundo** | Abre a la hora exacta sin que nadie recargue |
| Cierra **al terminar la clase**, no al empezar | Quien llega tarde sigue entrando |
| Si no se puede leer la configuración, **se abre** | Que alguien entre antes es menor; que la sala se quede fuera, no |
| Si GHL no acepta la asistencia, **se deja pasar igual** | Queda en el log como `[asistencia-sin-guardar]` |
| `ENLACE_SALA_RESPALDO` | El Zoom vive en GHL; si GHL cae a esa hora, no habría llave |
| Mando manual en el panel | Para cuando algo se salga de lo previsto |

La antelación son 15 minutos por defecto, configurable. La API vuelve a
comprobar la puerta antes de devolver el enlace, así que no se puede sacar antes
de tiempo (409). Lógica aislada en `src/lib/puerta.ts`.

**Esta es la única página donde GHL es best-effort.** En `/` y en el formulario
de interesados sigue siendo la base de datos: si la escritura falla, el envío
falla.

---

## Las etiquetas

Cada formulario pone **dos**: una general, que dispara la automatización en GHL,
y una con la fecha, para segmentar.

| Formulario | General | Con fecha |
|---|---|---|
| Registro | `registro webinar` | `registro 20-agosto` |
| Ingreso | `ingreso webinar` | `ingreso 20-agosto` |
| Interesado | `interesado webinar` | `interesado 20-agosto` |

Los nombres generales se cambian desde `/admin` → **Etiquetas**.

**Dos cosas que cuestan un bug si se olvidan:**

1. **El `upsert` de GHL reemplaza el arreglo `tags`.** Por eso las etiquetas van
   por `POST /contacts/{id}/tags`, que suma. Sin eso, quien se registraba y
   luego entraba a la sala perdía su etiqueta de registro.
2. **GHL no vuelve a agregar una etiqueta que el contacto ya tiene**: devuelve
   `tagsAdded: []` y el disparador no corre. En un webinar semanal, el repetidor
   se quedaba sin confirmación y sin caer en el Sheet. El sitio lo resuelve
   quitando y reponiendo la etiqueta — **y en GHL hay que activar
   `Allow Re-Entry`** en cada workflow que deba correr más de una vez.

> GHL guarda las etiquetas en minúsculas. En los disparadores: `registro webinar`.

---

## El panel (`/admin`)

Contraseña verificada en el servidor; la sesión es una cookie `httpOnly` firmada
con HMAC que dura 12 h.

| Grupo | Campos |
|---|---|
| Programación | recurrente o fecha única, día, fecha, hora, zona horaria, duración, abrir o cerrar registros |
| La sala | minutos de antelación, mando de la puerta |
| Enlaces | ingreso, grupo de WhatsApp, soporte, oferta, repetición |
| La oferta | checkout, apartado, precio, minutos del contador |
| Etiquetas | los tres nombres generales |
| Contenido | título del webinar, video de bienvenida |
| Seguimiento | pixel de Meta y token de la API de conversiones |

La API solo acepta las claves declaradas en `CAMPOS` (`src/lib/config.ts`): no se
pueden escribir custom values arbitrarios desde el navegador.

### Se puede editar desde los dos lados

Los mismos custom values se editan en `/admin` o directo en GHL. Como allá son
cajas de texto libre, la lectura es tolerante (`src/lib/parseo.ts`):

| Campo | También acepta |
|---|---|
| Día | `4`, `jueves`, `Jueves`, `jue`, `Thursday` |
| Hora | `20:00`, `8:00 pm`, `8 pm`, `20` |
| Zona horaria | cualquier zona IANA; **un typo no tumba la página** |
| Registro abierto | `si`, `sí`, `yes`, `true` / `no`, `false`, `cerrado` |
| Fecha única | `2026-09-03` y `03/09/2026` |

Ante algo que no se entiende usa el valor por defecto y lo registra. **Nunca
lanza.** El panel avisa arriba qué campos reinterpretó.

---

## La oferta (`/oferta`)

La oferta se presenta como **un proceso guiado por etapas**, no como una lista
de módulos y bonos: nueve secciones (hero, problema, etapas, qué incluye, para
quién es, sesiones en vivo, garantía, inversión y cierre). Todo el copy vive en
`src/contenido/oferta.ts`; la página solo lo acomoda. No hay valores tachados,
contador ni urgencia: si los quieres, es una decisión tuya, no del sistema.

Precio (en MXN) y enlace de pago se editan desde el panel. **Si no hay enlace de
pago, el botón lo dice** en vez de fingir.

Quien llega sin cookie de identidad llena nombre, correo y WhatsApp antes de ir a
pagar (queda con la etiqueta de carrito); quien ya se registró desde ese navegador
va directo al checkout.

---

## Cómo entra un prospecto

`POST /api/registro` con `tipo: 'registro' | 'ingreso' | 'interesado'`

1. Valida el correo, y el teléfono solo en el registro.
2. Resuelve la fecha de la clase y las dos etiquetas.
3. En `ingreso`, vuelve a comprobar la puerta (409 si está cerrada).
4. **Espera** el alta en GHL. Si falla, el registro falla — salvo en `ingreso`.
5. **Sin esperar**: refresca la fecha derivada en GHL y manda el evento `Lead` a
   la API de Conversiones de Meta, con un `event_id` que el navegador reusa para
   que Meta no cuente doble.

Los UTM sin resolver (`{{campaign.name}}`) se descartan antes de guardarlos.

---

## Variables de entorno

Documentadas en [`.env.example`](.env.example).

| Variable | Para qué |
|---|---|
| `GHL_API_KEY` | Private Integration Token de la sub-cuenta |
| `GHL_LOCATION_ID` | Id de la location |
| `GHL_TAG_REGISTRO` | Etiqueta de respaldo si no hay etiquetas configuradas |
| `GHL_CAMPO_FUENTE_ID` | Id del custom field "Fuente" |
| `GHL_CAMPO_FECHA_CLASE_ID` | Id del custom field "Fecha de su clase" |
| `ADMIN_PASSWORD` | Contraseña de `/admin` |
| `ADMIN_SESSION_SECRET` | Secreto de la cookie (mín. 24 caracteres) |
| `LADA_POR_DEFECTO` | Lada que se asume con números de 10 dígitos |
| `ENLACE_SALA_RESPALDO` | Zoom de último recurso si GHL no responde |
| `EDGE_CONFIG` | Cadena de lectura del Edge Config |
| `EDGE_CONFIG_ID` | Id del Edge Config, para escribir la copia |
| `VERCEL_TEAM_ID` | Team dueño del Edge Config |
| `VERCEL_API_TOKEN` | Token de Vercel para escribir la copia. Va como **sensitive** |
| `MP_ACCESS_TOKEN` | Credencial de producción de Mercado Pago (webhook de pago) |
| `MP_WEBHOOK_SECRET` | Clave secreta del webhook de Mercado Pago |
| `GHL_PIPELINE_NOMBRE` | Nombre del pipeline (por defecto `Webinars`). Opcional |
| `GHL_PIPELINE_ID`, `GHL_ETAPA_*` | Solo si se quieren fijar los IDs a mano. Opcional |

Ninguna lleva `NEXT_PUBLIC_`: el token de GHL nunca llega al navegador.

Si faltan las cuatro últimas la app sigue funcionando: lee y escribe en GHL como
antes, solo pierde la copia de seguridad. El panel lo avisa.

---

## Estructura

```
src/
  contenido/
    marca.ts                quién eres, qué vendes, logo, SEO, aviso legal
    landing.ts              copy de / y de /gracias
    oferta.ts               copy de /oferta
  app/
    page.tsx                landing de registro
    gracias/                confirmación
    ingreso/                la puerta de la sala
    oferta/                 la oferta
    admin/                  panel (Login + Panel)
    api/registro/           alta de prospectos
    api/calendario.ics/     el evento para descargar
    api/salud/              diagnóstico público (200 / 503)
    api/pago/mercadopago/   webhook de pago
    api/admin/              sesión, guardado, re-sincronizar, respaldo
  components/               contador, formularios, carrusel, puerta, pixel, marca
  lib/
    campos.ts               los custom values declarados (los lee el instalador)
    config.ts               mapa entre el panel y los custom values
    ghl.ts                  cliente de GoHighLevel
    red.ts                  timeout y reintento hacia GHL
    almacen.ts              la copia en Edge Config
    schedule.ts             cálculo de la fecha
    puerta.ts               cuándo se puede entrar a la sala
    etiquetas.ts            las dos etiquetas de cada formulario
    pipeline.ts             etapas del pipeline, resueltas por nombre
    parseo.ts               lectura tolerante de lo editado en GHL
    salud.ts                la revisión que usan /api/salud y el panel
    intentos.ts             freno de fuerza bruta del login
    auth.ts                 sesión del panel
    capi.ts                 API de Conversiones de Meta
scripts/
  instalar-ghl.ts           prepara la sub-cuenta (npm run instalar)
  revisar-plantilla.ts      lista el copy de ejemplo (npm run revisar)
  probar-*.ts               las suites de pruebas
docs/
  GUIA.html                 el cuaderno de trabajo
```

---

## Operación y robustez

### Salud y monitor externo

`GET /api/salud` responde **200** cuando el embudo puede recibir gente y **503**
con la lista de lo que falla cuando no. Revisa cuatro cosas: que GoHighLevel
responde con el token actual, que la copia de seguridad existe y está al día, que
la próxima clase tiene sentido (una fecha única ya pasada cuenta como falla), y que
están los enlaces de sala y de pago. No devuelve secretos.

Solo alerta lo que impide que el embudo funcione, nunca lo que el dueño eligió a
propósito (registro apagado, puerta forzada).

**Para recibir avisos:** dar de alta la URL en un monitor gratuito (UptimeRobot,
Better Stack, etc.) con revisión cada 5 minutos y alerta por correo. Sin código
que mantener y funciona aunque el propio sitio esté caído. El panel muestra el
mismo diagnóstico en su banner.

### El cliente de GHL: timeout y reintento

Toda llamada a GHL pasa por `fetchGhl` (`src/lib/red.ts`): 8 segundos por
intento y un solo reintento ante timeout, 429 o 5xx. Nunca reintenta 4xx de datos
o de token. Así un GHL lento no cuelga registros ni la puerta.

### El pipeline se resuelve por nombre

`src/lib/pipeline.ts` busca en la sub-cuenta un pipeline llamado `Webinars` (o
`GHL_PIPELINE_NOMBRE`) con las etapas **Nuevo Registro**, **Asistió al Webinar**,
**Cliente Potencial** y **Cliente Ganado** (se comparan sin acentos ni
mayúsculas) y cachea los IDs 10 minutos. Si prefieres fijarlos, `GHL_PIPELINE_ID` +
`GHL_ETAPA_*` mandan sobre la detección. Si no encuentra el pipeline, el registro
sigue entrando: solo no se mueve la oportunidad, y queda en los logs.

### Webhook de pago (Mercado Pago)

`POST /api/pago/mercadopago` recibe el aviso, valida la firma, consulta el pago
por id a MP (nunca confía en el cuerpo del aviso) y, si está aprobado: pone las
etiquetas `pago webinar` + `pago <fecha>`, mueve la oportunidad a **Cliente
Ganado** con el monto, y manda un `Purchase` a Meta por CAPI. Es idempotente.

Alta: Mercado Pago → Tus integraciones → la app → Webhooks → URL
`https://TU-DOMINIO/api/pago/mercadopago`, evento **Pagos**. La clave secreta se
genera al guardar: va en `MP_WEBHOOK_SECRET`. Crear la ruta (desplegar) **antes**
de darla de alta, o la notificación de prueba se topa con 404.

### Login del panel

Contraseña única comparada en tiempo constante, 600 ms de espera por intento y
**5 fallos en 15 minutos bloquean la IP 15 minutos** (`src/lib/intentos.ts`). El
conteo vive en memoria: no es perfecto en serverless, pero vuelve inviable
adivinar una contraseña decente.

### Respaldo

Botón **Descargar respaldo** en el panel (`GET /api/admin/respaldo`): un CSV con
todos los contactos que llevan la etiqueta general de registro, con teléfono,
fuente, fecha de su clase, etiquetas e id de GHL. Guardarlo cada semana. Es lo
que permite recuperar si alguien borra contactos o una etiqueta en GHL.

### Pruebas en cada push

`.github/workflows/deploy.yml`: cada push corre `npm run verificar`. El deploy lo
hace la integración de Git de Vercel (`vercel git connect`); el flujo solo
despliega él mismo si existen los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID` y
`VERCEL_PROJECT_ID`.

---

## Publicar en Vercel

Desde la terminal, con `vercel login` hecho:

1. `vercel link` crea el proyecto (deja `.vercel/`, que no se sube a GitHub).
2. `npm run subir-env` copia todas las variables de `.env.local` a Production y
   Preview (usa `--value`: por stdin Vercel guarda la variable vacía).
3. `vercel --prod` publica. Entra a `/admin` con tu contraseña.
4. En vercel.com: **Storage → Create → Edge Config**, conéctalo al proyecto
   (`EDGE_CONFIG` se crea solo). Copia `EDGE_CONFIG_ID` (`ecfg_…`), crea un
   token en **Account → Tokens** (`VERCEL_API_TOKEN`) y, si es equipo,
   `VERCEL_TEAM_ID`. Vuelve a `npm run subir-env && vercel --prod`.
5. Guarda una vez en `/admin`: siembra la copia y el banner de salud queda limpio.
6. `vercel git connect` liga el repo: cada push a `main` publica solo.
7. `vercel domains add tu-dominio.com` y sigue las instrucciones de DNS.

GitHub Actions corre `npm run verificar` en cada push (sin configurar nada).
Si además pones `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` como
secretos del repo, el flujo también despliega, para quien quiera que nada se
publique sin pasar las pruebas.

No hay base de datos que migrar: los contactos y la configuración viven en tu
GoHighLevel.

---

## Licencia y origen

Plantilla del programa **Business Growth Intensive**. Úsala en
tus proyectos y en los de tus clientes; no la revendas como producto.
