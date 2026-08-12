# Formentor Flow · Manager

PWA independiente (instalable, offline, sin backend) — ayuda de decisión para
mandos intermedios: convierte la presión en información.

**Flujo:** elegir situación → **PARA** (anclaje breve) → **ORDENA** (preguntas) →
**COMUNICA** (estructura descendente QUÉ/QUIÉN/CUÁNDO/PRIORIDAD/CRITERIO o
ascendente S·I·N·P), con botón *Copiar* para pegar en radio / WhatsApp / relevo.

## Características
- Un solo `index.html` (HTML/CSS/JS inline, sin dependencias externas → cumple la CSP del sitio).
- Bilingüe **ES / EN**.
- **Sin almacenamiento**: nada se guarda, sin registro individual. La información no sale del dispositivo.
- Instalable: `manifest.webmanifest` + `sw.js` (precache del shell) + iconos SVG.

## Marco
Traducción organizacional de la TEC (Cap. 16 · AIS organizacional). La herramienta
**entrena el gesto, no lo sustituye** (principio TEC 16.5): crea las condiciones para
que el mando pare y decida, sin fabricar dependencia.

## Despliegue
Se publica con el sitio (Netlify `publish = app/`). Ruta: `/formentor-flow/`.
No está en `js/registry.js` a propósito: es un producto de cliente, ajeno al hub de pacientes.

## Privacidad
Si en el futuro se añaden datos para RRHH, deberán ser **agregados y anonimizados**
(patrones organizacionales, nunca conducta individual), conforme al RGPD y, si existe,
con consulta previa a la representación de los trabajadores.
