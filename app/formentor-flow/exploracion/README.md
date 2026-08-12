# Exploración inicial RRHH — cuestionario para Isabel

Cuestionario de escucha (Centre APRENS) para enviar a RRHH **antes** de la primera reunión.
Se despliega con el sitio (Netlify `publish = app/`). Ruta pública: `/formentor-flow/exploracion/`.

- Standalone, sin dependencias externas (cumple la CSP del sitio).
- **Sin backend, sin almacenamiento, sin analítica.** Las respuestas viven solo en memoria;
  al finalizar, Isabel copia / envía por email (`mailto:`) / imprime a PDF.
- Responsive, español, ~10-15 min, barra de progreso, revisión final.

> El **panel de interpretación** del psicólogo (hipótesis A–H + Perfil Inicial) se mantiene
> deliberadamente **fuera del despliegue**: es un documento interno y no debe ser accesible
> desde el enlace que recibe el hotel.
