# APRENS · Els pares també juguen

Herramienta web para familias y entrenadores de fútbol base. Parte del documento
«El paper dels pares dins l'esport de base» (Tòfol Villalonga, APRENS) y de
«La piràmide del rendiment». El módulo de entrenadores es una ampliación
profesional coherente con esos principios, no contenido literal del documento.

- Código: `app/esport-base/`
- Dirección una vez publicada: `https://aprens-app.aprens.net/esport-base/`
- Piloto C.E. Constància: `https://aprens-app.aprens.net/esport-base/?club=constancia`

---

## 1. Arquitectura

Una sola página (`index.html`) sin servidor ni cuentas. Funciona en Safari (iPhone)
y Chrome (Android) sin instalar nada.

| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura mínima: cabecera, selector de idioma, contenido, navegación y diálogo de pausa |
| `app.css` | Estilo editorial, móvil primero; respeta «reducir movimiento» |
| `app.js` | Vistas, recorridos, registro local, exportación, pinya, club, QR |
| `silueta.js` | Silueta AIS interactiva en SVG (componente reutilizable) |
| `contingut-ca.js` / `contingut-es.js` | Todos los textos, misma estructura en catalán y castellano |
| `clubs/<club>.json` | Configuración de cada club (nombre, color, idioma, mensaje, código, protocolo) |
| `../vendor/qrcode-generator-1.4.4.js` | Generador de QR (MIT), servido desde el propio sitio |

**Primera entrada:** idioma → aviso de privacidad (no se guarda nada hasta aceptarlo) → rol
(«Som pare, mare o familiar» / «Som entrenador o entrenadora»).

**Navegación inferior:** Inicio · Antes · Durante · Después · Aprende · Registro.

| Pantalla | Funciones |
|---|---|
| Inicio | Mensaje del club, principio «Primer m'acompany a mi mateix…», tres momentos, botón de pausa, compromiso semanal, accesos |
| **Antes** (1-2 min) | 1) cómo llego (multiselección) · 2) qué me puede activar (por rol) · 3) práctica AIS con la silueta · 4) uno o dos compromisos (máx. 2) · entrenador: partido o entrenamiento + intención educativa |
| **La pinya de les famílies** | Ritual tras «Antes»: frase de grupo, animación de manos, «1, 2, 3… EQUIP!», mensaje editable, compartir/copiar, preparar encuesta, invitación del entrenador. Se registra una sola vez por partido |
| **Durante** | Recuerdo del compromiso («Recorda sa mà…»), botón «Necessit fer una pausa» (3 pasos), modo rápido de 10 s, aviso de protección de menores, 12 escenarios con ficha completa |
| **Después** (2 min) | Cómo recibir al deportista (9 estados) o cerrar con el equipo (7) · «He estat fidel a sa meva mà?» · activación 0-10 · detección corporal · uso de AIS · checklist por rol · reacción a reparar (pauta de reparación) · qué repetir y qué seguir entrenando |
| Aprende | 12 microlecciones con pregunta y acción · pirámide del rendimiento interactiva · práctica libre con la silueta · itinerario de entrenadores (10 situaciones, comunicación educativa, corregir no es humillar) |
| Compromiso semanal | Objetivo de la semana; a los 7 días pide una reflexión breve (sin puntos) |
| Registro | Indicadores descriptivos, pausas por semana (6 semanas), compromisos elegidos, situaciones a entrenar, conductas reconocidas, secuencia Situación → Activación → Pausa → Conducta, aprendizajes, historial y registro manual (ningún campo obligatorio) |
| Privacidad | Explicación, consultar, exportar JSON y CSV, borrar todo |
| Para clubes | «Som un equip també fora del camp», compromisos compartidos, código de conducta, protección de menores, recursos APRENS, QR y enlace, configurador |

## 2. La silueta AIS

Figura adulta neutra en SVG con 10 zonas: cabeza, garganta, hombros, pecho, abdomen,
espalda, brazos, manos, piernas y pies.

Mismo código de colores que el resto de herramientas APRENS (Respiro AIS, Mapa interno):
**amarillo = consciencia, atención; azul = respiración**.

| Estado | Qué pasa |
|---|---|
| 1 · Reconec | Tocar donde se nota la activación lleva ahí la **luz amarilla** (mancha llena con puntos): la atención. Mensaje: «Hi has portat l'atenció. No cal eliminar aquesta sensació…» |
| 2 · M'acompany | La **luz azul** (anillo discontinuo), la respiración, acompaña esa zona y se activa la guía (4 s entra, 6 s sale). Convive con la amarilla |
| 3 · Elegesc | Una línea azul sale del pecho hacia el compromiso. **La amarilla no se apaga**: la atención se queda con la sensación y se puede actuar bien aunque siga |

- Seis consignas guiadas, una a una. No pide cerrar los ojos.
- Percepción: «clara», «muy suave» o «no noto nada». Todas son válidas.
- Alternativa externa si atender al cuerpo incomoda: mirar tres cosas, sentir los pies, escuchar dos sonidos.
- Accesibilidad: cada zona es un botón con teclado y lector de pantalla, y hay una lista de zonas equivalente. Amarillo y azul se distinguen también por la forma (puntos frente a anillo) y por el texto.
- Aviso permanente: los colores son pedagógicos y no miden ningún estado fisiológico.

## 3. La pinya de les famílies

- Aparece al terminar «Antes»: «Ja has preparat es teu paper. Ara, vols sumar sa teva mà a sa pinya de famílies?»
- «Avui preferesc continuar sense compartir» lleva directamente a «Durante», sin penalizar nada.
- Las manos dibujadas son simbólicas y lo dice el propio dibujo. **No hay contador colectivo.**
- Solo se comparte el mensaje de compromiso (editable). Emociones, sensaciones, pensamientos, historial y datos del hijo nunca salen del móvil.
- Compartir usa el menú nativo del móvil y, si no existe, `api.whatsapp.com/send?text=`. La app no afirma que el mensaje se haya enviado.
- «Preparar s'enquesta»: copiar la pregunta, copiar cada opción, abrir WhatsApp, y pasos para crearla a mano (una sola respuesta y, si se puede, ocultar votantes). El recuento está solo en WhatsApp.

**Fase 2 (sin implementar):** una sesión por partido creada por el club (id de equipo, fecha,
id de sesión), con un recuento agregado de participaciones voluntarias. Requeriría: base
jurídica y aviso transparente; un token aleatorio de un solo uso por dispositivo y sesión,
contra duplicados, sin huella del dispositivo; guardar solo un número, nunca contenido
emocional ni identidad; umbral mínimo antes de mostrar nada; y ningún ranking entre familias ni entre clubes.

## 4. Verificación hecha

Probado con Playwright (Chromium, 390×844):

- Recorrido completo **familia en catalán** y **entrenador en castellano**: Antes → silueta → compromisos (bloquea el tercero) → pinya → compartir y copiar (portapapeles verificado) → encuesta → Durante → pausa de 3 pasos → modo rápido → escenario → Después con reparación → Registro.
- La pinya se registra **una sola vez** aunque se repita la animación.
- Exportación JSON y CSV (con BOM para Excel), descarga del QR en PNG y borrado total (localStorage queda vacío).
- Club por `?club=exemple` y `?club=constancia`, y configurador por parámetros.
- axe-core (WCAG 2.1 AA + buenas prácticas) en 15 vistas × 2 idiomas: sin incidencias.
- `npm run check`: 0 errores, 0 avisos.
- Ningún error de JavaScript en consola.
- Revisión con Codex (dos pasadas). Corregido: borrado sincronizado entre pestañas, borrar la preparación activa no deja copia, gráfico semanal con fechas locales (fallaba en Europe/Madrid), cambiar de rol cierra el partido en curso, y la sincronización entre pestañas no interrumpe una pausa abierta.

No probado en un iPhone ni en un Android reales. Conviene hacerlo antes del piloto, sobre todo el menú de compartir.

## 5. Publicar y compartir

1. Al fusionar la rama en `main`, Netlify publica `app/` en `https://aprens-app.aprens.net`.
2. Enlace general: `https://aprens-app.aprens.net/esport-base/`
3. Enlace del Constància: `https://aprens-app.aprens.net/esport-base/?club=constancia`
4. **Escudo:** guardar la imagen como `app/esport-base/clubs/constancia-escut.png` (PNG con fondo transparente, unos 300 px). Mientras no exista, no se muestra nada.
5. **QR:** abrir el enlace del club → «Per a clubs» → «Descarregar el QR». El PNG sirve para carteles y circulares.
6. **Club nuevo, opción rápida:** «Per a clubs» → «Configurar per a un club» (nombre, color, idioma, mensaje) genera el enlace y el QR sin tocar el código.
7. **Club nuevo, opción completa:** copiar `clubs/exemple.json` como `clubs/<nombre-club>.json` (letras minúsculas, números y guiones) y usar `?club=<nombre-club>`.

**PWA instalable (segunda fase):** haría falta un `manifest.webmanifest` propio con iconos
192/512 y `start_url: "./"`, y registrar el service worker. Los archivos ya están en
la precarga de `app/sw.js` (v200).

## 6. Mensajes de difusión

Los mensajes están en `docs/ELS-PARES-TAMBE-JUGUEN-difusio.md`.

## 7. Piloto con el C.E. Constància (4-6 semanas)

**Objetivo:** viabilidad, experiencia de uso y posibles cambios de conducta percibidos.
No se trata de demostrar eficacia.

| Semana | Qué se hace |
|---|---|
| 0 | Reunión con coordinación y entrenadores. Se configura el club, se imprime el QR y se presenta a las familias (10 min antes de un entrenamiento o en una reunión) |
| 1-4 | Uso libre. Cada partido, el delegado prepara la encuesta de la pinya. Los entrenadores hacen «Antes» y «Después» |
| 2 | Contacto breve con entrenadores: dificultades técnicas y ajustes |
| 4-6 | Cierre: cuestionario anónimo voluntario y un grupo de conversación con 4-6 familias y entrenadores |

**Indicadores (agregados y voluntarios):**

- Facilidad de uso y utilidad percibida (escala 1-5).
- Frecuencia de práctica autodeclarada.
- Reconocimiento de activaciones y uso de pausas antes de reaccionar.
- Autopercepción de conductas de respeto.
- Ejemplos de reparación (cualitativos).
- Participación en las encuestas de WhatsApp: solo el número total por partido, que ya ve el grupo.
- Valoración cualitativa de entrenadores y familias.

**Qué no se hace:** no se recogen los registros de la app, que siguen en cada móvil; no se identifica
quién participa; y no se compara entre familias. Si más adelante se quiere una evaluación
sistemática (por ejemplo, exportaciones voluntarias o cuestionarios pre/post), hará falta un
protocolo aparte con hoja informativa, consentimiento, seudonimización, plazo de conservación
y revisión del RGPD y de la normativa de protección de menores.
