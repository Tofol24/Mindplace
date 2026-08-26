<?php
/* ───────────────────────────────────────────────────────────────────────────
   APRENS · /cristofol-villalonga-psicologo-mallorca/
   Página profesional de Cristòfol Villalonga Melis.

   CÓMO INSTALARLA
   1. Duplica una página existente que ya funcione (por ejemplo
      quienes-somos.php) y renómbrala a profesional.php. Así heredas los
      include de cabecera, menú y pie tal como estén hoy en el sitio.
   2. Sustituye en esa copia el bloque de <title> y <meta description> por el
      de la SECCIÓN A de este fichero.
   3. Pega la SECCIÓN B (canonical + Open Graph + JSON-LD) dentro de <head>.
   4. Sustituye todo el contenido de <div id="pageBody"> por la SECCIÓN D.
   5. Pega la SECCIÓN C (estilos) justo antes de </head>.

   Las secciones están delimitadas para que se puedan copiar de una pieza.
   No se ha tocado ningún fichero existente del sitio.
   ─────────────────────────────────────────────────────────────────────────── */
?>

<!-- ═══════════════════════════════════════════════════════════════════════
     SECCIÓN A · TITLE Y META DESCRIPTION
     Sustituyen a los actuales. Son únicos de esta página: no reutilizar la
     descripción genérica que hoy comparten portada, artículos y categorías.
     ═══════════════════════════════════════════════════════════════════════ -->

<title>Cristòfol Villalonga Melis &middot; Psic&oacute;logo en Inca, Mallorca</title>
<meta name="description" content="Psic&oacute;logo General Sanitario y neuropsic&oacute;logo cl&iacute;nico, colegiado B-01599. Consulta en Inca (Mallorca) y online. Fundador de Centre APRENS.">


<!-- ═══════════════════════════════════════════════════════════════════════
     SECCIÓN B · CANONICAL, OPEN GRAPH Y DATOS ESTRUCTURADOS
     Va dentro de <head>. El canonical es imprescindible: sin él, la página
     nueva nace ya duplicada entre las variantes de dominio.
     ═══════════════════════════════════════════════════════════════════════ -->

<link rel="canonical" href="https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/">

<meta property="og:type"        content="profile">
<meta property="og:locale"      content="es_ES">
<meta property="og:site_name"   content="Centre APRENS">
<meta property="og:title"       content="Cristòfol Villalonga Melis · Psicólogo en Inca, Mallorca">
<meta property="og:description" content="Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-01599. Consulta en Inca (Mallorca) y online.">
<meta property="og:url"         content="https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona",
      "name": "Cristòfol Villalonga Melis",
      "alternateName": [
        "Tòfol Villalonga",
        "Tòfol Villalonga Melis",
        "Cristóbal Villalonga Melis"
      ],
      "jobTitle": ["Psicólogo General Sanitario", "Neuropsicólogo clínico"],
      "description": "Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-01599. Consulta en Inca, Mallorca, y atención online. Fundador del Centre APRENS.",
      "url": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/",
      "mainEntityOfPage": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/",
      "identifier": {
        "@type": "PropertyValue",
        "propertyID": "Número de colegiado COPIB",
        "value": "B-01599"
      },
      "memberOf": {
        "@type": "Organization",
        "name": "Col·legi Oficial de Psicologia de les Illes Balears",
        "alternateName": "COPIB",
        "url": "https://copib.es/"
      },
      "worksFor": { "@id": "https://www.aprens.es/#centro" },
      "founder":  { "@id": "https://www.aprens.es/#centro" },
      "affiliation": [
        {
          "@type": "CollegeOrUniversity",
          "name": "Universitat de les Illes Balears",
          "url": "https://www.uib.es/"
        },
        { "@type": "Organization", "name": "Mutua Balear" }
      ],
      "knowsAbout": [
        "Ansiedad",
        "Rumiación y sobrepensamiento",
        "Trastorno de estrés postraumático",
        "Trauma psicológico tras accidentes de tráfico o laborales",
        "Dolor crónico",
        "Depresión",
        "Evaluación neuropsicológica",
        "Terapia cognitivo-conductual",
        "Terapia de aceptación y compromiso",
        "Psicología del deporte"
      ],
      "knowsLanguage": ["ca", "es"],
      "award": "Premio a la Excelencia Profesional en Psicología. III Premios Joan Calafat, Grupo Salut i Força, 2025",

      "_comentario_sameAs": "sameAs SOLO para páginas que identifican al profesional. Las notas del COPIB van en subjectOf, no aquí: una noticia sobre alguien no es su página de identidad.",
      "sameAs": [
        "https://www.tofolvillalonga.com/",
        "https://www.doctoralia.es/tofol-villalonga-melis/psicologo/inca",
        "https://www.mundopsicologos.com/centros/cristofol-villalonga-melis"
      ],

      "_comentario_subjectOf": "Referencias editoriales institucionales. Acreditan el premio y la trayectoria sin ser páginas de identidad.",
      "subjectOf": [
        {
          "@type": "NewsArticle",
          "headline": "El psicólogo colegiado Tòfol Villalonga recibe el premio Joan Calafat a la excelencia profesional del Grupo Salut i Força",
          "url": "https://copib.es/es/noticias/psicologo-tofol-villalonga-recibe-premio-joan-calafat-excelencia-profesional",
          "datePublished": "2025-09-30",
          "publisher": {
            "@type": "Organization",
            "name": "Col·legi Oficial de Psicologia de les Illes Balears",
            "url": "https://copib.es/"
          }
        },
        {
          "@type": "NewsArticle",
          "headline": "El psicólogo Tòfol Villalonga publica «LIDERA TU MON(E)A»",
          "url": "https://copib.es/es/noticias/tofol-villalonga-lidera-tu-monea-estrategias-practicas-reducir-sobrepensamiento-liderar-atencion-y-mejorar-relaciones",
          "datePublished": "2025-02-18",
          "publisher": {
            "@type": "Organization",
            "name": "Col·legi Oficial de Psicologia de les Illes Balears",
            "url": "https://copib.es/"
          }
        }
      ]
    },

    {
      "@type": "ProfessionalService",
      "@id": "https://www.aprens.es/#centro",
      "name": "Centre APRENS",
      "url": "https://www.aprens.es/",
      "foundingDate": "2006",
      "founder":  { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "employee": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "telephone": "+34636937661",
      "email": "info@aprens.es",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "C/ Virgen de la Esperanza, 70, 2º",
        "addressLocality": "Inca",
        "addressRegion": "Illes Balears",
        "postalCode": "07300",
        "addressCountry": "ES"
      },
      "areaServed": [
        { "@type": "City", "name": "Inca" },
        { "@type": "AdministrativeArea", "name": "Mallorca" },
        { "@type": "AdministrativeArea", "name": "Illes Balears" }
      ],
      "availableLanguage": ["ca", "es"],
      "openingHours": "Mo-Fr 09:00-21:00"
    },

    {
      "@type": "WebPage",
      "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#pagina",
      "url": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/",
      "name": "Cristòfol Villalonga Melis · Psicólogo en Inca, Mallorca",
      "inLanguage": "es",
      "about":      { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "mainEntity": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "isPartOf":   { "@id": "https://www.aprens.es/#centro" },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.aprens.es/" },
          { "@type": "ListItem", "position": 2, "name": "Cristòfol Villalonga Melis" }
        ]
      }
    },

    {
      "@type": "FAQPage",
      "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#faq",
      "mainEntity": [
        { "@type": "Question", "name": "¿Cristòfol Villalonga es Psicólogo General Sanitario?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. Es Psicólogo General Sanitario y neuropsicólogo clínico, colegiado B-01599 en el Col·legi Oficial de Psicologia de les Illes Balears." } },
        { "@type": "Question", "name": "¿Es lo mismo Cristòfol Villalonga que Tòfol Villalonga?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. Firma profesionalmente como Tòfol Villalonga, y así aparece en sus libros y en las publicaciones del colegio profesional. En el registro colegial consta como Cristóbal Villalonga Melis. Es la misma persona, con el mismo número de colegiado: B-01599." } },
        { "@type": "Question", "name": "¿Dónde pasa consulta?",
          "acceptedAnswer": { "@type": "Answer", "text": "En el Centre APRENS, C/ Virgen de la Esperanza, 70, 2º, 07300 Inca, Mallorca. También atiende online." } },
        { "@type": "Question", "name": "¿Trabaja la ansiedad?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. La ansiedad y el sobrepensamiento son una de sus cuatro áreas principales de trabajo." } },
        { "@type": "Question", "name": "¿Trabaja el malestar posterior a un accidente?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. Trabaja el trauma y el estrés postraumático, incluido el malestar que persiste tras accidentes de tráfico o laborales." } },
        { "@type": "Question", "name": "¿Trabaja el dolor crónico?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí, desde la perspectiva de la adaptación psicológica al dolor persistente. El acompañamiento psicológico es complementario al tratamiento médico del dolor, no lo sustituye." } },
        { "@type": "Question", "name": "¿Qué enfoque terapéutico utiliza?",
          "acceptedAnswer": { "@type": "Answer", "text": "Un marco cognitivo-conductual y contextual (terapia cognitivo-conductual y terapia de aceptación y compromiso), con la neuropsicología incorporada a la evaluación y trabajo de entrenamiento atencional e interoceptivo." } },
        { "@type": "Question", "name": "¿Se puede comprobar su colegiación?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. El número B-01599 puede consultarse en el buscador público de colegiados del Col·legi Oficial de Psicologia de les Illes Balears." } }
      ]
    }
  ]
}
</script>


<!-- ═══════════════════════════════════════════════════════════════════════
     SECCIÓN C · ESTILOS
     Todo va bajo .pgProfesional para no afectar a ninguna otra página.
     Usa las variables tipográficas y de color ya presentes en el sitio.
     ═══════════════════════════════════════════════════════════════════════ -->

<style>
.pgProfesional{ padding-bottom:50px; }
.pgProfesional .lead-prof{
  font-size:19px; line-height:1.55; font-weight:600; color:#1B4F8C;
  margin:0 0 22px; max-width:38em;
}
.pgProfesional p{ font-size:17px; line-height:1.72; max-width:38em; margin:0 0 1.05em; }
.pgProfesional h2{
  font-size:25px; line-height:1.25; margin:44px 0 14px; color:#1B4F8C;
  font-weight:700;
}
.pgProfesional h3{
  font-size:13px; letter-spacing:.08em; text-transform:uppercase;
  color:#6B7280; font-weight:700; margin:28px 0 8px;
}
.pgProfesional ul.prof-lista{ list-style:none; padding-left:0; margin:0 0 1.3em; max-width:38em; }
.pgProfesional ul.prof-lista li{
  position:relative; padding:7px 0 7px 22px; font-size:16.5px; line-height:1.55;
  border-bottom:1px solid #E6ECF3;
}
.pgProfesional ul.prof-lista li:before{
  content:"—"; position:absolute; left:0; color:#9AA7B8;
}
.pgProfesional .prof-nota{ font-size:15px; color:#6B7280; font-style:italic; }
.pgProfesional .prof-xref{
  display:inline-block; margin:-.4em 0 1.4em; font-size:16px;
  color:#1B4F8C; font-weight:600; text-decoration:none;
}
.pgProfesional .prof-xref:hover{ text-decoration:underline; }
.pgProfesional .prof-firma{
  margin-top:48px; padding-top:22px; border-top:2px solid #1B4F8C;
  font-size:14.5px; line-height:1.85; color:#6B7280; max-width:38em;
}
.pgProfesional .prof-firma strong{ color:#1a1a2e; }
@media (max-width:767px){
  .pgProfesional p{ font-size:16.5px; }
  .pgProfesional h2{ font-size:22px; margin-top:36px; }
}
</style>


<!-- ═══════════════════════════════════════════════════════════════════════
     SECCIÓN D · CONTENIDO
     Sustituye al contenido de <div id="pageBody">.
     Un solo <h1> en toda la página — ver correcciones-en-paginas-existentes.md
     para el arreglo de los dos <h1 class="lema"> del cabecero, sin el cual
     esta página seguiría teniendo tres.
     ═══════════════════════════════════════════════════════════════════════ -->

<div id="pageBody">

  <div class="container tituloSeccion">
    <h1>Crist&ograve;fol Villalonga Melis | Psic&oacute;logo en Mallorca</h1>
  </div>

  <div class="container pgProfesional">
    <div class="row">
      <div class="col-xs-12 col-md-9">

        <p class="lead-prof">Psic&oacute;logo General Sanitario y neuropsic&oacute;logo cl&iacute;nico. Colegiado B-01599. Consulta en Inca, Mallorca, y atenci&oacute;n online.</p>

        <p>Crist&ograve;fol Villalonga Melis es psic&oacute;logo general sanitario y neuropsic&oacute;logo cl&iacute;nico, colegiado n&uacute;mero B-01599 en el Col&middot;legi Oficial de Psicologia de les Illes Balears. Pasa consulta en Inca, en el Centre APRENS, que fund&oacute; en 2006, y atiende tambi&eacute;n en formato online. Trabaja con adultos, adolescentes y familias, principalmente en ansiedad y sobrepensamiento, trauma, dolor cr&oacute;nico y estado de &aacute;nimo.</p>

        <p>Profesionalmente firma tambi&eacute;n como <strong>T&ograve;fol Villalonga</strong>, y as&iacute; aparece en sus libros y en las publicaciones del colegio profesional. En el registro colegial consta como Crist&oacute;bal Villalonga Melis. Son la misma persona y el mismo n&uacute;mero de colegiado.</p>

        <h2>&iquest;Qui&eacute;n es Crist&ograve;fol Villalonga Melis?</h2>
        <p>Es el psic&oacute;logo fundador del Centre APRENS, en Inca, donde ejerce desde 2006.</p>
        <p>Su trabajo combina dos formaciones que no siempre van juntas: la cl&iacute;nica y la neuropsicolog&iacute;a. Eso determina c&oacute;mo mira lo que le trae una persona a consulta. Antes de preguntarse qu&eacute; etiqueta corresponde a un malestar, se pregunta qu&eacute; est&aacute; haciendo la atenci&oacute;n de esa persona, qu&eacute; est&aacute; haciendo su cuerpo y qu&eacute; ha dejado de hacer en su vida desde que aparecieron las dificultades.</p>
        <p>Adem&aacute;s de la consulta, mantiene actividad docente e institucional: es profesor asociado en la Universitat de les Illes Balears y ha estado vinculado durante a&ntilde;os al Col&middot;legi Oficial de Psicologia de les Illes Balears en el &aacute;mbito de la psicolog&iacute;a del deporte y la actividad f&iacute;sica.</p>

        <h2>&iquest;Qu&eacute; titulaci&oacute;n y colegiaci&oacute;n tiene?</h2>
        <p>Es <strong>Psic&oacute;logo General Sanitario</strong>, la titulaci&oacute;n que habilita en Espa&ntilde;a para el ejercicio sanitario de la psicolog&iacute;a, y <strong>neuropsic&oacute;logo cl&iacute;nico</strong>. Su n&uacute;mero de colegiado es <strong>B-01599</strong>, en el Col&middot;legi Oficial de Psicologia de les Illes Balears (COPIB), y puede comprobarse en el buscador p&uacute;blico de colegiados del propio colegio.</p>
        <ul class="prof-lista">
          <li>Psic&oacute;logo General Sanitario</li>
          <li>Neuropsic&oacute;logo cl&iacute;nico</li>
          <li>Colegiado B-01599 &mdash; COPIB, Col&middot;legi Oficial de Psicologia de les Illes Balears</li>
          <li>M&aacute;ster Internacional en Psicolog&iacute;a Cl&iacute;nica (AEPC)</li>
          <li>Formaci&oacute;n espec&iacute;fica en psicolog&iacute;a del deporte y en psicolog&iacute;a educativa</li>
        </ul>
        <p class="prof-nota">En algunos documentos el n&uacute;mero aparece como B-1599, sin el cero. Es el mismo.</p>

        <h2>&iquest;D&oacute;nde pasa consulta?</h2>
        <p>En <strong>Inca, Mallorca</strong>, en el Centre APRENS: C/ Virgen de la Esperanza, 70, 2&ordm; &middot; 07300 Inca &middot; Illes Balears.</p>
        <p>Inca est&aacute; en el centro de la isla y bien comunicada por tren y por la Ma-13, lo que la hace accesible desde Palma, desde el Raiguer y desde buena parte del Pla y del norte de Mallorca. El horario del centro es de 9 a 21 h.</p>
        <p>Adem&aacute;s de la consulta presencial, atiende <strong>online</strong>, lo que permite mantener la continuidad del proceso cuando la distancia, los horarios o un desplazamiento lo complican.</p>

        <h2>&iquest;Con qu&eacute; dificultades trabaja?</h2>
        <p>Principalmente con cuatro tipos de dificultad. En las cuatro hay algo en com&uacute;n: la atenci&oacute;n queda capturada por algo &mdash;un pensamiento, una sensaci&oacute;n, un recuerdo, un vac&iacute;o&mdash; y la vida se va estrechando alrededor de eso.</p>

        <h3>Ansiedad y sobrepensamiento</h3>
        <p>Preocupaci&oacute;n que no para, rumiaci&oacute;n, anticipaci&oacute;n, activaci&oacute;n del cuerpo, miedo a las propias sensaciones, evitaci&oacute;n y necesidad de controlarlo todo.</p>
        <a class="prof-xref" href="/psicologo-ansiedad-mallorca/">Psic&oacute;logo para la ansiedad y el sobrepensamiento en Mallorca &rsaquo;</a>

        <h3>Trauma y estr&eacute;s postraum&aacute;tico</h3>
        <p>Malestar que persiste despu&eacute;s de un accidente de tr&aacute;fico o laboral, una agresi&oacute;n u otra experiencia traum&aacute;tica: hipervigilancia, recuerdos que vuelven sin permiso, evitaci&oacute;n de lo que recuerda a lo ocurrido, sensaci&oacute;n de seguir en peligro.</p>
        <a class="prof-xref" href="/psicologo-trauma-tept-mallorca/">Psic&oacute;logo para trauma y TEPT en Mallorca &rsaquo;</a>

        <h3>Dolor cr&oacute;nico</h3>
        <p>Adaptaci&oacute;n psicol&oacute;gica a un dolor que se mantiene en el tiempo: la relaci&oacute;n entre dolor y amenaza, la hipervigilancia corporal, la evitaci&oacute;n y la recuperaci&oacute;n progresiva de actividades que importan.</p>
        <a class="prof-xref" href="/psicologia-dolor-cronico-mallorca/">Psicolog&iacute;a para el dolor cr&oacute;nico en Mallorca &rsaquo;</a>

        <h3>Depresi&oacute;n y bloqueo conductual</h3>
        <p>P&eacute;rdida de ganas y de disfrute, aislamiento, abandono de actividades significativas, desesperanza, y esa distancia entre saber lo que uno deber&iacute;a hacer y no conseguir arrancar.</p>
        <a class="prof-xref" href="/psicologo-depresion-mallorca/">Psic&oacute;logo para la depresi&oacute;n y el bloqueo en Mallorca &rsaquo;</a>

        <p>Tambi&eacute;n realiza <a href="categoria_servicio.php?id=7">evaluaci&oacute;n neuropsicol&oacute;gica</a> y trabaja en <a href="categoria_servicio.php?id=4">psicolog&iacute;a del deporte</a>, &aacute;mbito en el que ha desarrollado buena parte de su trayectoria.</p>

        <h2>&iquest;Con qu&eacute; poblaci&oacute;n trabaja?</h2>
        <p>Con <strong>adultos, adolescentes y familias</strong>.</p>
        <p>En adolescentes y familias el trabajo suele incluir a las personas del entorno, porque a esas edades buena parte de lo que sostiene una dificultad &mdash;o de lo que ayuda a salir de ella&mdash; ocurre en casa y en el centro educativo, no solo en la consulta.</p>

        <h2>&iquest;Desde qu&eacute; enfoque trabaja?</h2>
        <p>Desde un marco cognitivo-conductual y contextual, con la mirada de la neuropsicolog&iacute;a incorporada a la evaluaci&oacute;n.</p>
        <ul class="prof-lista">
          <li><strong>Terapia cognitivo-conductual (TCC).</strong> Trabajo sobre la relaci&oacute;n entre lo que una persona piensa, lo que siente y lo que hace, y sobre los patrones que mantienen el problema aunque busquen aliviarlo.</li>
          <li><strong>Terapia de aceptaci&oacute;n y compromiso (ACT).</strong> En lugar de pelear con lo que se siente, aprender a sostenerlo mientras se recupera la conducta que importa. Especialmente pertinente cuando el intento de controlar el malestar se ha convertido en parte del problema.</li>
          <li><strong>Neuropsicolog&iacute;a.</strong> Atenci&oacute;n, memoria y funciones ejecutivas no son un adorno: condicionan lo que una persona puede sostener en un momento dado, y por tanto qu&eacute; intervenci&oacute;n es realista.</li>
          <li><strong>Entrenamiento atencional e interoceptivo.</strong> Trabajo sistem&aacute;tico con d&oacute;nde se pone la atenci&oacute;n y con c&oacute;mo se registra lo que ocurre dentro del cuerpo, integrado dentro de lo anterior.</li>
        </ul>
        <p>En su pr&aacute;ctica ha desarrollado adem&aacute;s un marco propio, <strong>TEC/AIS</strong>, orientado al entrenamiento atencional e interoceptivo. Se trata de un <strong>marco cl&iacute;nico en desarrollo</strong>, integrado dentro del trabajo descrito, y no de un tratamiento con eficacia diferencial establecida.</p>
        <a class="prof-xref" href="/enfoque/">C&oacute;mo trabajamos en APRENS &rsaquo;</a>

        <h2>&iquest;Atiende online?</h2>
        <p><strong>S&iacute;.</strong> Atiende tanto presencialmente en la consulta de Inca como en formato online.</p>
        <p>La modalidad online permite mantener la continuidad del proceso cuando la distancia, los horarios o un traslado lo complican. No todas las demandas se trabajan igual de bien a distancia; es algo que se valora en la primera visita.</p>

        <h2>Trayectoria profesional</h2>
        <p>Ejerce desde 2006, cuando fund&oacute; el Centre APRENS en Inca.</p>
        <ul class="prof-lista">
          <li><strong>Desde 2006</strong> &middot; Fundador y psic&oacute;logo responsable del Centre APRENS, Inca</li>
          <li><strong>Desde 2009</strong> &middot; Psic&oacute;logo de la Mutua Balear</li>
          <li><strong>2002&ndash;2020</strong> &middot; Psic&oacute;logo del CD Constancia</li>
          <li><strong>2015&ndash;2024</strong> &middot; Exvocal del &Aacute;rea de Psicolog&iacute;a del Deporte y la Actividad F&iacute;sica del COPIB, y posteriormente vinculado a su Grupo de Trabajo de Psicolog&iacute;a Deportiva</li>
          <li>Profesor asociado y tutor de pr&aacute;cticas en la Universitat de les Illes Balears</li>
        </ul>
        <a class="prof-xref" href="/trayectoria-y-publicaciones/">Trayectoria y publicaciones &rsaquo;</a>

        <h2>Publicaciones y reconocimientos</h2>
        <p>Es autor de varios libros divulgativos sobre manejo emocional y atenci&oacute;n consciente, publicados bajo la firma <strong>T&ograve;fol Villalonga</strong>:</p>
        <ul class="prof-lista">
          <li><em>Lidera tu mon(e)a. Estrategias pr&aacute;cticas para reducir el sobrepensamiento, liderar tu atenci&oacute;n y mejorar tus relaciones</em> (2025), con edici&oacute;n en catal&aacute;n como <em>Lidera la teva mon(e)a</em></li>
          <li><em>Cr&iacute;a desde dentro</em></li>
          <li><em>Trasciende desde dentro</em></li>
          <li><em>Gu&iacute;a de manejo emocional para padres</em></li>
        </ul>
        <p>En septiembre de 2025 recibi&oacute; el <strong>Premio a la Excelencia Profesional en Psicolog&iacute;a</strong> en la III edici&oacute;n de los Premios Joan Calafat, otorgados por el Grupo Salut i For&ccedil;a, seg&uacute;n <a href="https://copib.es/es/noticias/psicologo-tofol-villalonga-recibe-premio-joan-calafat-excelencia-profesional" rel="noopener">public&oacute; el Col&middot;legi Oficial de Psicologia de les Illes Balears</a>.</p>

        <h2>&iquest;C&oacute;mo pedir una primera visita?</h2>
        <p>Escribiendo a <a href="mailto:info@aprens.es">info@aprens.es</a>, llamando al <a href="tel:+34636937661">636 93 76 61</a> en horario de 9 a 21 h, o desde la <a href="contactar.php">p&aacute;gina de contacto</a>.</p>
        <p>La primera visita sirve para entender qu&eacute; est&aacute; pasando y decidir juntos si tiene sentido seguir, y de qu&eacute; manera. No hay compromiso de continuidad: si lo que necesitas se atiende mejor desde otro sitio, se te dice.</p>
        <a class="prof-xref" href="/en-que-podemos-ayudarte/">&iquest;En qu&eacute; podemos ayudarte? &rsaquo;</a>

        <div class="prof-firma">
          <strong>Crist&ograve;fol Villalonga Melis</strong><br>
          Psic&oacute;logo General Sanitario &middot; Neuropsic&oacute;logo cl&iacute;nico<br>
          Colegiado B-01599 &middot; COPIB<br>
          Publicado: <!-- FECHA DE PUBLICACIÓN --> &middot;
          &Uacute;ltima revisi&oacute;n: <!-- FECHA DE REVISIÓN -->
        </div>

      </div>
    </div>
  </div>

</div>
