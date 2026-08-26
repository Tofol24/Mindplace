# FASE 3 · Guía de instalación

Cuatro pasos. El orden importa: el punto 1 debe verificarse antes que el resto.

---

## Paso 1 · Reglas de Apache

Fichero: **`htaccess-fragmento.txt`** → contenido al `.htaccess` de la raíz.

⚠️ **La redirección de host canónico es la única parte de toda la fase que puede tumbar el
sitio si se configura mal.** Si el hosting está detrás de un proxy o balanceador, `%{HTTPS}`
puede llegar siempre en `off` y la regla entra en bucle infinito.

**Comprobación previa**, subiendo un `test.php` temporal:

```php
<?php echo 'HTTPS=' . (isset($_SERVER['HTTPS']) ? $_SERVER['HTTPS'] : 'no definido') . "\n";
echo 'X-Forwarded-Proto=' . (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) ? $_SERVER['HTTP_X_FORWARDED_PROTO'] : 'no definido') . "\n"; ?>
```

Visitándolo por `https://`, si `HTTPS` sale `on`, la regla del fragmento sirve tal cual. Si sale
`no definido` pero `X-Forwarded-Proto` sale `https`, usa la condición alternativa que el propio
fragmento indica en su comentario.

**Verificación posterior:**

```
curl -sI -o /dev/null -w "%{http_code} → %{redirect_url}\n" http://aprens.es/
curl -sI -o /dev/null -w "%{http_code} → %{redirect_url}\n" https://aprens.es/
curl -sI -o /dev/null -w "%{http_code} → %{redirect_url}\n" http://www.aprens.es/
```

Las tres deben devolver **301** apuntando a `https://www.aprens.es/`. Un solo salto, no dos.

---

## Paso 2 · La página profesional

1. Duplica `quienes-somos.php` → `profesional.php`. Así hereda cabecera, menú y pie reales.
2. Abre **`profesional.php`** de esta carpeta y trasplanta sus cuatro secciones:

| Sección | Qué contiene | Dónde va |
|---|---|---|
| **A** | `<title>` y `<meta description>` | sustituyen a los actuales |
| **B** | canonical, Open Graph y JSON-LD | dentro de `<head>` |
| **C** | estilos, todos bajo `.pgProfesional` | antes de `</head>` |
| **D** | el contenido | sustituye al interior de `<div id="pageBody">` |

3. Rellena las dos fechas de la firma al pie (publicación y revisión).

**Verificación:** `https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/` debe cargar,
y `https://www.aprens.es/profesional.php` debe redirigir a ella con 301.

---

## Paso 3 · Correcciones en páginas existentes

Fichero: **`correcciones-en-paginas-existentes.md`**.

El punto 1 de ese documento —los dos `<h1 class="lema">` del cabecero— **es necesario para que
la página nueva tenga un solo `<h1>`**. Sin él tendría tres, y la promesa de encabezado único
no se cumple.

El punto 3 es la corrección factual del cargo en el COPIB.

---

## Paso 4 · Comprobaciones finales

```
# Un solo H1 en la página nueva (en la consola del navegador)
document.querySelectorAll('h1').length          →  1

# Canonical correcto
document.querySelector('link[rel=canonical]').href
   →  https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/

# JSON-LD válido
JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
   →  objeto con @graph de 4 nodos, sin error
```

Y en la [herramienta de prueba de resultados enriquecidos de Google](https://search.google.com/test/rich-results):
deben detectarse **FAQPage** y **BreadcrumbList** sin errores. `Person` y `ProfessionalService`
no generan resultado enriquecido visible, pero sí se leen: eso es precisamente lo que buscamos.

---

## Lo que NO hay que hacer

- **No** retirar ni redirigir ninguna URL existente. Todas están indexadas.
- **No** tocar `robots.txt`: ya permite el rastreo general, que es lo que necesitan los
  sistemas de IA.
- **No** publicar la página sin las fechas de publicación y revisión rellenadas.
- **No** añadir a `sameAs` los agregadores que replican datos sin verificación
  (cocosano, deandrespsicologo, confines, infopsicologos). Diluyen la señal.

---

## Pendiente para la FASE 8

- URL nominal de la ficha en `uib.es`, si existe → entraría en `sameAs`.
- URL estable del registro de colegiado en el buscador del COPIB → entraría en `sameAs`.
- ISBN de los libros, cuando haya referencia bibliográfica verificable.
- Alineación de `tofolvillalonga.com` / Doctoralia con APRENS: nombre, colegiado, ubicación
  y especialidades coherentes, y enlace hacia aprens.es como fuente canónica de trayectoria.
- Sustituir Universal Analytics por GA4.
- Regenerar `sitemap.xml` en `https://`, con `lastmod`, y declararlo en `robots.txt`.
