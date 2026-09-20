# Los workflows de GoHighLevel del embudo

El sitio no manda correos: pone etiquetas en el contacto y GoHighLevel reacciona. Estos son los cuatro
workflows de la sub-cuenta modelo, con su copy de **ejemplo** (el webinar de Business Growth Intensive).
Si importaste el snapshot ya los tienes en borrador; si no, créalos a mano con esta estructura.

Reglas que valen para los cuatro:

- Disparador: **Contact Tag → Tag Added** con la etiqueta general en minúsculas.
- **Allow Re-Entry activado**: quien se registra a otra edición vuelve a recibir todo.
- **Publicados**: un workflow en borrador no manda nada y no avisa.
- Todo lo que cambia de semana en semana sale de custom values o del contacto, nunca escrito a mano:
  `{{contact.fecha_de_su_clase}}`, `{{custom_values.webinar_proxima_hora}}`, `{{custom_values.titulo_del_webinar}}`,
  `{{custom_values.enlace_de_la_puerta}}`, `{{custom_values.enlace_grupo_whatsapp}}`, `{{custom_values.enlace_de_la_oferta}}`,
  `{{custom_values.precio_de_la_oferta}}`, `{{custom_values.webinar_antelacion_minutos}}`, `{{custom_values.enlace_de_whatsapp_de_soporte}}`.
- Los recordatorios mandan **el enlace de la puerta** (`/ingreso`), nunca el Zoom directo: es lo que pasa lista
  y lo que dispara el workflow 3.
- Las esperas de los recordatorios apuntan al campo de fecha `{{contact.dia_de_su_clase}}` (lo escribe el sitio
  al registrarse). Las horas (9:00 am, 7:00 pm, 7:50 pm) están pensadas para una clase a las 8:00 pm:
  **si tu clase es a otra hora, cámbialas en los tres pasos de espera.** Si la hora ya pasó cuando alguien se
  registra, ese recordatorio se salta.

## Webinar · 1 Confirmación de registro

**Disparador:** etiqueta agregada `registro webinar`

### Paso 1 · Correo

**Asunto:** Tu lugar está apartado: {{contact.fecha_de_su_clase}}, {{custom_values.webinar_proxima_hora}}

```text
Hola {{contact.first_name}},

Tu lugar en **{{custom_values.titulo_del_webinar}}** quedó apartado.

**Cuándo:** {{contact.fecha_de_su_clase}}, {{custom_values.webinar_proxima_hora}}
**Dónde:** en línea y en vivo.

Haz estas dos cosas ahora. Toman un minuto:

**1. Entra al grupo de WhatsApp.** Por ahí mandamos el acceso y los avisos antes de empezar:
{{custom_values.enlace_grupo_whatsapp}}

**2. Bloquea la hora en tu calendario.** Quien la agenda es quien llega, y quien llega es quien aprovecha.

El día de la clase entras por este enlace. La sala abre {{custom_values.webinar_antelacion_minutos}} minutos antes:
{{custom_values.enlace_de_la_puerta}}

**Lo que vamos a trabajar en 90 minutos:**

- Diseñar la trayectoria: de dónde vienen tus clientes hoy y cuál es tu siguiente nivel concreto.
- Montar tu primer equipo de IA: qué se automatiza primero, qué no, y cómo se conecta con tu CRM.
- Ejecutar el crecimiento: el ritmo semanal que sostiene lo que construyes.
Llega con tu negocio en mente y con tus números a la mano. La clase se aprovecha el doble cuando la aplicas a tu caso mientras la ves.

Nos vemos el {{contact.fecha_de_su_clase}}.

Equipo de Business Growth Intensive

¿Dudas? Escríbenos por WhatsApp: {{custom_values.enlace_de_whatsapp_de_soporte}}
```

## Webinar · 2 Recordatorios

**Disparador:** etiqueta agregada `registro webinar`

### Paso 1 · Espera

Hasta `{{contact.dia_de_su_clase}}` a las 9:00 AM. Si ya pasó: saltar.

### Paso 2 · Correo

**Asunto:** Hoy es la clase: {{custom_values.webinar_proxima_hora}}

```text
Hola {{contact.first_name}},

Hoy es **{{custom_values.titulo_del_webinar}}**. Empezamos a las {{custom_values.webinar_proxima_hora}}, en punto.

Este es tu enlace de entrada. La sala abre {{custom_values.webinar_antelacion_minutos}} minutos antes:
{{custom_values.enlace_de_la_puerta}}

Tres cosas para sacarle provecho:

- Conéctate desde una computadora si puedes. Vamos a ver pantallas con detalle.
- Ten a la mano cuántos prospectos te llegaron el mes pasado y cuántos cerraste. Con esos dos números la primera parte de la clase se vuelve tuya.
- Aparta los 90 minutos completos. La parte de ejecución va al final y es la que más se usa al día siguiente.
Si aún no entras al grupo de WhatsApp, por ahí avisamos cuando abrimos la sala:
{{custom_values.enlace_grupo_whatsapp}}

Nos vemos en un rato.

Equipo de Business Growth Intensive
```

### Paso 3 · Espera

Hasta `{{contact.dia_de_su_clase}}` a las 7:00 PM. Si ya pasó: saltar.

### Paso 4 · Correo

**Asunto:** En una hora empezamos

```text
{{contact.first_name}}, en una hora arranca **{{custom_values.titulo_del_webinar}}**.

Deja este enlace abierto en una pestaña. Ahí ves el contador y, cuando abra la sala, confirmas tus datos y entras:
{{custom_values.enlace_de_la_puerta}}

Empezamos puntuales a las {{custom_values.webinar_proxima_hora}}. La primera parte, diseñar la trayectoria, es la base de todo lo demás: si llegas tarde, las otras dos se entienden a medias.

Equipo de Business Growth Intensive
```

### Paso 5 · Espera

Hasta `{{contact.dia_de_su_clase}}` a las 7:50 PM. Si ya pasó: saltar.

### Paso 6 · Correo

**Asunto:** La sala ya está abierta: entra ahora

```text
{{contact.first_name}}, ya abrimos la sala.

Entra por aquí, confirma tus datos y te lleva directo a la clase:
**Entrar a la clase** → {{custom_values.enlace_de_la_puerta}}

Empezamos en 10 minutos.

Si el enlace no abre, cópialo y pégalo en tu navegador: {{custom_values.enlace_de_la_puerta}}

Equipo de Business Growth Intensive
```

## Webinar · 3 Oferta post-clase

**Disparador:** etiqueta agregada `ingreso webinar`

### Paso 1 · Espera

2 horas.

### Paso 2 · Correo

**Asunto:** Lo que viste hoy, y el siguiente paso

```text
Hola {{contact.first_name}},

Gracias por quedarte a la clase. Entrar en vivo y aguantar los 90 minutos ya te separa de la mayoría.

Hoy viste el sistema completo en tres partes: diseñar la trayectoria, montar tu primer equipo de IA y ejecutar el crecimiento con un ritmo semanal. Verlo es una cosa. Tenerlo funcionando en tu negocio es otra, y ahí es donde casi todos se quedan.

Para eso existe **Business Growth Intensive**: un intensivo guiado de 30 días para construirlo con tu caso, no para acumular otro curso.

- **Semana 1, Trayectoria.** Diagnóstico, números y tu siguiente nivel concreto, en un mapa de una página.
- **Semana 2, Propulsión.** Tu primer equipo de IA conectado a tu CRM: captura, seguimiento y agenda.
- **Semana 3, Órbita.** Tu primera clase en vivo con este mismo embudo.
- **Semana 4, Altitud.** El ritmo semanal que sostiene el crecimiento, con métricas y responsables.
Incluye una sesión grupal en vivo cada semana para trabajar tu caso, las plantillas y sistemas listos para adaptar, y acceso a la academia por 12 meses.

Inversión: ${{custom_values.precio_de_la_oferta}} MXN, con garantía: entras, conoces la primera etapa y decides desde la experiencia.

**Ver todos los detalles e inscribirme** → {{custom_values.enlace_de_la_oferta}}

Equipo de Business Growth Intensive
```

### Paso 3 · Espera

1 día(s).

### Paso 4 · Correo

**Asunto:** Puedes tener la estrategia clara y seguir sin despegar

```text
{{contact.first_name}},

Lo que más escuchamos después de la clase es esto: “Sé exactamente qué tendría que hacer, pero entre operar el negocio y atender clientes nunca me siento a construirlo”.

No es falta de visión. Es falta de propulsión: nadie arma un sistema en los ratos libres que deja la operación.

Por eso el intensivo no es contenido para ver cuando puedas. Son 30 días con fechas, una sesión en vivo cada semana y un entregable concreto por etapa. Al terminar la semana 3 ya diste tu primera clase en vivo con tu propio embudo, el mismo que te trajo hasta este correo.

Y si entras y ves que no es para ti, tienes la garantía para decidir desde adentro y no desde la duda.

**Ver el programa completo** → {{custom_values.enlace_de_la_oferta}}

Equipo de Business Growth Intensive
```

### Paso 5 · Espera

1 día(s).

### Paso 6 · Correo

**Asunto:** ¿Qué duda te queda?

```text
{{contact.first_name}},

Este es el último correo que te mandamos sobre Business Growth Intensive.

Si lo estás pensando y algo te detiene, dínoslo. Responde este correo o escríbenos por WhatsApp y te contestamos con lo que aplica a tu negocio, sin guión de ventas:
{{custom_values.enlace_de_whatsapp_de_soporte}}

Las tres dudas más comunes:

- **“No sé nada de tecnología.”** No hace falta. El sistema se arma pidiéndole a la IA, paso a paso, con plantillas.
- **“No tengo tiempo.”** Son 30 días con una sesión en vivo por semana. Lo que construyes es justo lo que te devuelve tiempo después.
- **“¿Y si no es para mí?”** Para eso está la garantía: entras, conoces la primera etapa y decides.
**Ver el programa e inscribirme** → {{custom_values.enlace_de_la_oferta}}

Y si no es el momento, no pasa nada. Te vemos en la próxima clase.

Equipo de Business Growth Intensive
```

## Webinar · 4 Compró

**Disparador:** etiqueta agregada `pago webinar`

### Paso 1 · Sacar del workflow

Quita al contacto de **Webinar · 3 Oferta post-clase**, para no seguir vendiéndole a quien ya compró.

### Paso 2 · Correo

**Asunto:** Tu inscripción a Business Growth Intensive está confirmada

```text
{{contact.first_name}}, recibimos tu pago. Ya estás dentro de **Business Growth Intensive**.

Guarda este correo. Por este medio y por WhatsApp te mandamos tu acceso a la plataforma y la fecha de tu primera sesión en vivo.

Mientras tanto, una sola tarea: ten a la mano cuántos prospectos te llegaron el mes pasado, cuántos cerraste y cuánto vale un cliente para ti. Con esos tres números arrancamos la Semana 1, Trayectoria.

Si algo no te llega o tienes una duda con tu pago, escríbenos:
{{custom_values.enlace_de_whatsapp_de_soporte}}

Bienvenido.

Equipo de Business Growth Intensive
```

