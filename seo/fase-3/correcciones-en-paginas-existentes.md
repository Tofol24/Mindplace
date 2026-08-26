# FASE 3 · Correcciones en páginas ya existentes

Tres cambios pequeños sobre ficheros que ya están en producción. Ninguno altera el
diseño ni el contenido visible, salvo el tercero, que es la corrección factual del COPIB.

---

## 1. 🔴 Los dos `<h1 class="lema">` del cabecero — afecta a TODO el sitio

**Dónde:** en la plantilla de cabecera, la que incluyen todas las páginas.

Aparecen dos veces en cada página del sitio, una para escritorio y otra para móvil:

```html
<div class="hidden-xs">
  <h1 class="lema">Gabinete de psicologia, psiquiatría, terapia clínica, psicoeducativa, psicologia del deporte, Neuropsicología</h1>
</div>
<div class="visible-xs text-center">
  <h1 class="lema">Gabinete de psicologia, psiquiatría, terapia clínica, psicoeducativa, psicologia del deporte, Neuropsicología</h1>
</div>
```

**Por qué importa:** este es el origen de la duplicación de encabezados de todo el sitio.
Son dos `<h1>` idénticos que se suman al `<h1>` real de cada página. Es también la razón
por la que la página profesional nueva tendría **tres** `<h1>` en lugar de uno si no se corrige.

Un eslogan de marca no es el encabezado principal de la página: es la identidad del sitio,
que ya está en el `<title>` y en el logotipo.

**Cambio:** sustituir `h1` por `p` en ambos casos. Nada más.

```html
<div class="hidden-xs">
  <p class="lema">Gabinete de psicologia, psiquiatría, terapia clínica, psicoeducativa, psicologia del deporte, Neuropsicología</p>
</div>
<div class="visible-xs text-center">
  <p class="lema">Gabinete de psicologia, psiquiatría, terapia clínica, psicoeducativa, psicologia del deporte, Neuropsicología</p>
</div>
```

**Cuidado con el CSS.** Si `estilsJ.css` tiene reglas del tipo `h1.lema { … }`, hay que
ampliarlas para que sigan aplicando:

```css
/* antes */  h1.lema { … }
/* después */ h1.lema, p.lema { … }
```

Si en cambio están escritas como `.lema { … }`, no hay que tocar nada.

**Comprobación:** tras el cambio, cualquier página del sitio debe tener exactamente un `<h1>`.
En el navegador, consola: `document.querySelectorAll('h1').length` → debe devolver `1`.

---

## 2. 🟠 El `<h1>` dentro del carrusel

**Dónde:** `categoria_servicio.php` y cualquier plantilla con `#myCarruselSuperGuais`.

```html
<div class="carousel-caption">
  <h1>…</h1>
</div>
```

Un pie de imagen de carrusel no es el encabezado principal de la página. **Cambio:**
sustituir por `<p class="carousel-title">` (o el `h2` que corresponda si encabeza
realmente una sección), y trasladar al CSS el estilo que tuviera `h1` en ese contexto.

Esto no es imprescindible para la fase 3, pero es la otra mitad del problema de encabezados
y conviene hacerlo en la misma intervención.

---

## 3. 🔴 Corrección factual del cargo en el COPIB

**Dónde:** `quienes-somos.php`, ficha de Cristòfol Villalonga Melis.

**Texto actual** — afirma en presente un cargo que el colegio profesional da por concluido:

> Vocal de psicología de l'esport del COPIB (Col.legi Oficial de Psicologia de les Illes Balears)

**Texto corregido:**

> Exvocal del Área de Psicología del Deporte y la Actividad Física del COPIB (2015–2024),
> y posteriormente vinculado a su Grupo de Trabajo de Psicología Deportiva

**Fuente:** Col·legi Oficial de Psicologia de les Illes Balears, nota del 30 de septiembre de 2025,
que lo identifica como «exvocal del Área de Psicología del Deporte y la Actividad Física»
en el periodo 2015–2024.

**Por qué no decimos «actualmente coordinador»:** el COPIB indicó en su momento que, tras salir
de la Junta, la vinculación continuaba como responsable del Grupo de Trabajo. Pero no existe
confirmación institucional de 2026, y afirmar vigencia sin fuente actual es exactamente el tipo
de dato que un sistema puede contrastar y encontrar desmentido. La fórmula «posteriormente
vinculado a» es defendible con la fuente que sí tenemos.

---

### Mientras se corrige el punto 3

Conviene aprovechar el mismo cambio para dos arreglos triviales en la misma ficha:

- El número de colegiado figura como **B-1599**. La forma institucional del COPIB es **B-01599**.
  Unificarlo en toda la web reduce la ambigüedad de la entidad.
- Añadir un enlace desde la ficha de `quienes-somos.php` hacia
  `/cristofol-villalonga-psicologo-mallorca/`, para que la página nueva reciba enlace interno
  desde el primer día.
