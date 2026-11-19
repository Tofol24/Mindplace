# Pizarra del entrenador · sitio propio con suscripción

La app es la misma que `app/pizarra` (no se duplica). Este sitio la publica en su propio dominio
(p. ej. `pizarra.aprens.net`) y añade la suscripción mensual con Stripe, igual que Explica-ho.

- **Gratis:** cuaderno, pizarra y envío de planes como archivo.
- **Con la suscripción:** enlaces cortos cifrados, ficha privada de cada jugador, cuaderno por enlace
  a otro entrenador y sugerencias de Claude (con tope mensual).
- Sin cuentas: quien paga recibe un **código de acceso** y lo escribe en Ajustes → Tu suscripción.
- En `aprens-app` no cambia nada (allí no existe `/api/pizarra-config` y todo sigue libre).

## Puesta en marcha

1. **Netlify:** Add new site → Import an existing project → GitHub → `Tofol24/Mindplace`.
   - **Base directory: `pizarra-web`** (imprescindible). El resto lo pone `netlify.toml`.
   - Dominio: Domain management → añadir `pizarra.aprens.net`.
2. **Stripe:**
   - Crear el producto «Pizarra del entrenador» con un precio mensual recurrente → copiar el `price_…`.
   - Developers → Webhooks → añadir endpoint `https://pizarra.aprens.net/api/pizarra-stripe` con los eventos
     `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
     `customer.subscription.deleted` → copiar el secreto `whsec_…`.
   - Settings → Billing → Customer portal: activarlo (cancelar, cambiar tarjeta, ver facturas).
     Opcional: copia el enlace de acceso al portal (`https://billing.stripe.com/p/login/…`).
3. **Variables de entorno** del sitio nuevo (Site configuration → Environment variables):

| Variable | Valor |
|---|---|
| `PIZARRA_SUSCRIPCION` | `si` |
| `PIZARRA_PLANES` | `Entrenador\|price_XXXX\|100\|4,99 € al mes` (nombre\|precio\|sugerencias de Claude al mes\|texto del precio) |
| `STRIPE_SECRET_KEY` | `sk_live_…` (o `sk_test_…` para probar) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `ANTHROPIC_API_KEY` | la clave de Claude |
| `RESEND_API_KEY` + `PIZARRA_EMAIL_FROM` | **necesarias para abrir altas**: el código llega siempre por correo, y desde ahí se gestiona la suscripción (p. ej. `Pizarra <pizarra@aprens.net>`; el dominio tiene que estar verificado en Resend) |
| `PIZARRA_EMAIL_REPLY` | opcional: correo de respuesta |
| `PIZARRA_STRIPE_PORTAL_LOGIN` | opcional: el enlace de acceso al portal de Stripe, como alternativa para gestionar |
| `PIZARRA_CODIGOS` | opcional: códigos dados a mano, `codigo1234:300, otrocodigo99` (mínimo 8 caracteres; `:n` = sugerencias al mes) |
| `PIZARRA_SECRETO` | opcional: una frase larga aleatoria para las huellas |
| `PIZARRA_TEXTOS_LEGALES` | `revisados` **solo cuando hayas revisado** `condiciones.html` y `privacidad.html`. Sin esto no se abren altas. |

4. Probar con las claves de prueba de Stripe (tarjeta `4242 4242 4242 4242`) y, cuando todo vaya bien,
   cambiar a las claves reales.

## Archivos

- `construir.mjs`: copia `app/pizarra` (y lo que usa de `app/`) y `paginas/` a `publico/` al publicar.
- `paginas/`: suscribirse, gracias, recuperar el código, condiciones y privacidad.
- `netlify/functions/`: envoltorios. La lógica está en `../netlify/lib/pizarra-subs.mjs` y `pizarra-pago.mjs`;
  los enlaces y Claude usan las mismas funciones que `aprens-app` (`../netlify/functions/pizarra*.mjs`).
- Pruebas: `npm test` en la raíz (`netlify/test/pizarra-subs.test.mjs`).

Los enlaces y el cuaderno de cada sitio son independientes: los entrenadores que ya usan la pizarra en
aprens-app pueden pasar su cuaderno con Ajustes → Copia de seguridad.
