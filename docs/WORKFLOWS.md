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
  `{{custom_values.precio_de_la_oferta}}`, `{{custom_values.moneda_de_la_oferta}}`, `{{custom_values.webinar_antelacion_minutos}}`, `{{custom_values.enlace_de_whatsapp_de_soporte}}`.
- El workflow 4 se dispara con `pago webinar`, que pone el sitio cuando registra un pago: queda listo y empieza a
  correr cuando conectes tu método de pago.
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

Hoy viste el sistema completo. Verlo es una cosa. Tenerlo funcionando en tu negocio es otra, y ahí es donde casi todos se quedan.

Para eso existe **Business Growth Intensive**: un programa intensivo de 16 semanas para convertir tu conocimiento en un negocio digital que vende todos los días.

- **Semana 0, Preparación.** Aterrizas en la plataforma, conoces a tu coach y dejas todo listo para despegar.
- **Fase 1, Speed Webinar (semanas 1 a 3).** Validas tu oferta, creas tu infoproducto y lanzas tu primer webinar en vivo.
- **Fase 2, Profit Machine (semanas 4 a 9).** Automatizas tu webinar: funnel completo, tráfico pago, CRM y métricas.
- **Fase 3, Escalamiento (semanas 10 a 16).** Escalas tu pauta, armas tu equipo mínimo y documentas tu operación.
No avanzas solo: tienes un coach personal 1:1 cada semana, sesiones en vivo con especialistas tres días por semana, comunidad privada, workbooks y un directorio de herramientas.

Inversión: ${{custom_values.precio_de_la_oferta}} {{custom_values.moneda_de_la_oferta}}.

**Ver el programa módulo por módulo** → {{custom_values.enlace_de_la_oferta}}

Equipo de Business Growth Intensive
```

### Paso 3 · Espera

1 día(s).

### Paso 4 · Correo

**Asunto:** Puedes saber muchísimo y seguir sin un negocio que venda con sistema

```text
{{contact.first_name}},

Lo que más escuchamos después de la clase es esto: “Sé exactamente qué tendría que hacer, pero entre clientes y operación nunca me siento a construirlo”.

No es falta de conocimiento. Nadie arma un sistema en los ratos libres que deja la operación.

Por eso Business Growth Intensive no es contenido para ver cuando puedas. Son 16 semanas con plan de vuelo: cada semana sabes exactamente qué construir y qué entregar, con tu coach 1:1 revisando tu avance. Primero vendes en vivo, luego lo automatizas y al final lo escalas. Al terminar la Fase 1 ya lanzaste tu primer webinar en vivo.

Y no necesitas saber de tecnología: avanzas paso a paso con tus workbooks, tu coach y el directorio de herramientas.

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

- **“No sé nada de tecnología.”** No hace falta. Avanzas paso a paso con tus workbooks, tu coach personal y el directorio de herramientas del programa.
- **“¿Es presencial?”** Es 100% en línea y en español: sesiones en vivo con especialistas tres días por semana y una sesión semanal 1:1 con tu coach, desde donde estés.
- **“¿Para quién no es?”** Para quien busca dinero rápido sin construir nada, o no quiere aparecer en cámara. Son 16 semanas de trabajo.
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

Guarda este correo. Por este medio y por WhatsApp te mandamos tu acceso personal a la plataforma de alumnos.

Arrancas con la **semana 0, Preparación**: aterrizas en la plataforma, conoces a tu coach y dejas todo listo para despegar. Después vienen las 16 semanas: Speed Webinar, Profit Machine y Escalamiento.

Si algo no te llega o tienes una duda con tu pago, escríbenos:
{{custom_values.enlace_de_whatsapp_de_soporte}}

Bienvenido.

Equipo de Business Growth Intensive
```

