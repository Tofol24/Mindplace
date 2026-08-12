# Formentor Flow — Changelog V1 → V2

Evolución (auditar → refinar → integrar → evolucionar). Se conserva la arquitectura
conceptual, visual y funcional de la V1; no se reconstruye desde cero.

## Arquitectura de metodología (nuevo)

Formentor Flow se articula ahora en cuatro activos con un lenguaje común compartido
por la propuesta y la app: **Flow Map** (detecta) · **Flow Leaders** (entrena) ·
**Flow Manager** (transfiere) · **Season Memory** (conserva y mejora), atravesados por
la medición PRE → DURANTE → POST.

---

## A · Propuesta RRHH V2

- **Evidencia corregida (crítico).** Eliminada toda cifra no documentable (el piloto de
  «8 semanas / 12 personas / 40 % / 28 %»). Sustituida por *«Un proyecto diseñado para
  generar su propia evidencia»*: línea de base propia, indicadores pre/durante/post,
  decisiones de escalado con evidencia del propio contexto Formentor. Sin promesas de
  causalidad económica.
- **No culpabilizar a los mandos.** La afirmación categórica («el punto de decisión vive
  casi siempre en los mandos») pasa a hipótesis: *«uno de los nodos con mayor potencial de
  influencia… el diagnóstico debe comprobarlo»*, con lista explícita de otras posibles
  fuentes de fricción (dirección, procedimientos, recursos, ratios, sistemas, roles,
  interfaces, prioridades contradictorias, incorporación, reapertura). Principio:
  *no buscamos quién funciona mal, sino dónde pierde fluidez el sistema.*
- **Flow Map** como producto propio: analiza **interfaces, no personas** (claridad, tiempo,
  prioridad, feedback, fricción, sobrecarga, dependencias) con estados fluidez alta /
  fricción moderada / punto crítico.
- **Flow Leaders**: entrenamiento aplicado (no «curso»), 10 competencias.
- **Flow Manager**: presentado como herramienta de **transferencia**, no como «la solución».
- **Season Memory**: elevado a activo organizacional. *«Que el hotel cierre la temporada,
  pero no pierda lo aprendido.»*
- **Estacionalidad como ciclo** (Season Memory alimenta la siguiente pre-apertura).
- **Evaluación**: se añade **Flow Map pre/post**; se habla de indicadores de evolución.
- **Presupuesto en dos versiones**: la versión RRHH **no ancla precios** (niveles de
  colaboración Essential / Professional / Signature + «presupuesto tras definir alcance»);
  las horquillas internas se mantienen aparte para uso del consultor.
- **Diagrama de integración** (Diagnóstico → Flow Map → Flow Leaders → Flow Manager →
  Evaluación → Season Memory ↺).
- Formato: 4-5 páginas, premium/sobrio/ejecutivo, sin jerga clínica ni promesas.

---

## B · Manager V2

- **VERIFICA** añadido como cierre operacional: Situación → PARA → ORDENA → COMUNICA →
  **VERIFICA** (checklist rápido, no obligatorio).
- **Nueva situación: RELEVO** (handover), con estructura PENDIENTE / ESTADO / RESPONSABLE /
  PRIORIDAD / SIGUIENTE REVISIÓN.
- **ORDENA adaptativo**: preguntas distintas por situación (antes eran fijas). En «Cambio de
  prioridad» se destaca la pregunta clave: *«si esto pasa a ser prioritario, ¿qué deja de serlo?»*.
- **PARA V2**: mismo ejercicio de respiración 4-4, nuevo lenguaje —pregunta central
  *«¿Vas a transmitir información o activación?»*; «¿cómo llegas a esta situación?»; sin
  «relájate»; objetivo = recuperar capacidad ejecutiva.
- **COMUNICA**: descendente (QUÉ/QUIÉN/CUÁNDO/PRIORIDAD/CRITERIO), ascendente **S·I·N·P**
  potenciada, y estructura de **relevo** (sin toggle). Dictado por voz y copiar.
- **Ejemplos contextuales**: cada situación tiene *«Ver ejemplo»* con ❌ reactivo / ✓ operativo,
  realistas de hotel premium y sin nombres reales.
- **Microaprendizaje**: una microfrase por contexto (nunca sermón).
- **Privacidad**: mensaje explícito *«Esta herramienta no evalúa cómo trabajas. Te ayuda a
  ordenar cómo responder.»* Se mantiene sin backend, sin tracking, sin analytics, sin
  localStorage de contenido personal, sin perfiles ni rankings.
- **Identidad**: Centre APRENS aparece discretamente como método; estética premium mediterránea.
- Se conserva: PWA instalable, offline (service worker, cache `formentor-flow-v2`), ES/EN,
  rapidez (uso en 30-90 s), dictado por voz, respiración 4-4.

### Decisión de diseño registrada
`ORDENA` se mantiene como **preguntas reflexivas sin campos de entrada** (no vuelca datos a
COMUNICA) para preservar el objetivo de uso en 30-90 s y la ausencia de formularios largos
(prioridad UX). La composición se hace en COMUNICA con placeholders por situación y dictado.
Es una decisión coherente y reversible: el volcado ORDENA→COMUNICA puede añadirse si se prefiere.

---

## No hecho (por diseño)
Sin IA externa · sin APIs · sin login · sin backend · sin base de datos · sin métricas
individuales · sin evidencia inventada · sin presentar TEC como teoría validada · sin
identidad visual protegida del hotel.
