<?php
/* ───────────────────────────────────────────────────────────────────────────
   APRENS · /psicologo-ansiedad-mallorca/
   Landing clínica · ansiedad y sobrepensamiento.

   Mismo procedimiento de instalación que profesional.php (fase 3):
   duplica una página existente, y trasplanta las secciones A, B, C y D.

   Reglas de Apache: añadir al bloque de la fase 3 las tres líneas que se
   indican al final de este fichero.
   ─────────────────────────────────────────────────────────────────────────── */
?>

<!-- ═══ SECCIÓN A · TITLE Y META DESCRIPTION ═══════════════════════════════ -->

<title>Psic&oacute;logo para la ansiedad en Inca y Mallorca &middot; APRENS</title>
<meta name="description" content="Preocupaci&oacute;n que no para, rumiaci&oacute;n, ansiedad en el cuerpo, necesidad de control. Qu&eacute; ocurre, c&oacute;mo se eval&uacute;a y c&oacute;mo se trabaja. Inca, Mallorca, y online.">


<!-- ═══ SECCIÓN B · CANONICAL, OPEN GRAPH Y DATOS ESTRUCTURADOS ════════════ -->

<link rel="canonical" href="https://www.aprens.es/psicologo-ansiedad-mallorca/">

<meta property="og:type"        content="article">
<meta property="og:locale"      content="es_ES">
<meta property="og:site_name"   content="Centre APRENS">
<meta property="og:title"       content="Psicólogo para la ansiedad y el sobrepensamiento en Mallorca">
<meta property="og:description" content="Por qué la preocupación no se apaga, por qué la ansiedad se nota en el cuerpo y por qué el control la empeora. Cómo se evalúa y cómo se trabaja.">
<meta property="og:url"         content="https://www.aprens.es/psicologo-ansiedad-mallorca/">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalWebPage",
      "@id": "https://www.aprens.es/psicologo-ansiedad-mallorca/#pagina",
      "url": "https://www.aprens.es/psicologo-ansiedad-mallorca/",
      "name": "Psicólogo para la ansiedad y el sobrepensamiento en Mallorca",
      "description": "Preocupación persistente, rumiación, ansiedad en el cuerpo y necesidad de control: qué ocurre, cómo se evalúa y cómo se trabaja en terapia.",
      "inLanguage": "es",
      "isPartOf":   { "@id": "https://www.aprens.es/#centro" },
      "author":     { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "reviewedBy": { "@id": "https://www.aprens.es/cristofol-villalonga-psicologo-mallorca/#persona" },
      "datePublished": "AAAA-MM-DD",
      "dateModified":  "AAAA-MM-DD",
      "audience": { "@type": "Patient" },
      "about": {
        "@type": "MedicalCondition",
        "name": "Trastornos de ansiedad",
        "alternateName": ["Ansiedad", "Trastorno de ansiedad generalizada", "Sobrepensamiento", "Rumiación"]
      },
      "_comentario_about": "Se declara la condición, pero deliberadamente SIN possibleTreatment: afirmaría eficacia clínica que no procede declarar desde la web de un centro.",
      "citation": [
        {
          "@type": "CreativeWork",
          "name": "Guía de Práctica Clínica para el Tratamiento del Trastorno de Ansiedad Generalizada en Atención Primaria",
          "datePublished": "2024-11-28",
          "identifier": "https://doi.org/10.46995/gpc_641",
          "url": "https://portal.guiasalud.es/gpc/tratamiento-trastorno-ansiedad-generalizada-atencion-primaria/",
          "publisher": { "@type": "Organization", "name": "Ministerio de Sanidad · Programa de GPC en el SNS" }
        },
        {
          "@type": "CreativeWork",
          "name": "Generalised anxiety disorder and panic disorder in adults: management (CG113)",
          "url": "https://www.nice.org.uk/guidance/cg113",
          "publisher": { "@type": "Organization", "name": "National Institute for Health and Care Excellence (NICE)" }
        }
      ],
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.aprens.es/" },
          { "@type": "ListItem", "position": 2, "name": "Ansiedad y sobrepensamiento" }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.aprens.es/psicologo-ansiedad-mallorca/#faq",
      "mainEntity": [
        { "@type": "Question", "name": "¿Por qué no puedo dejar de pensar aunque sé que no sirve de nada?",
          "acceptedAnswer": { "@type": "Answer", "text": "Porque la preocupación produce un alivio momentáneo —la sensación de estar previniendo o controlando— que refuerza el hábito. Saber que no sirve no basta para desactivarlo, porque el mecanismo que lo mantiene no es el razonamiento sino el alivio a corto plazo." } },
        { "@type": "Question", "name": "¿La ansiedad puede dar síntomas físicos reales?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. Taquicardia, opresión en el pecho, mareo, hormigueo o tensión muscular son respuestas fisiológicas reales, no imaginadas. Aun así, ante síntomas nuevos o intensos lo primero es una valoración médica que descarte otras causas." } },
        { "@type": "Question", "name": "¿Se puede tratar la ansiedad sin medicación?",
          "acceptedAnswer": { "@type": "Answer", "text": "La guía de práctica clínica del Sistema Nacional de Salud de 2024 recomienda la terapia cognitivo-conductual como primera línea de tratamiento psicológico del trastorno de ansiedad generalizada, con recomendación fuerte a favor. La conveniencia de tratamiento farmacológico es una decisión médica que se valora caso a caso, y no son opciones excluyentes." } },
        { "@type": "Question", "name": "¿Cuánto dura una terapia para la ansiedad?",
          "acceptedAnswer": { "@type": "Answer", "text": "Depende del problema, de su duración y de las circunstancias de cada persona. Se establece una propuesta con objetivos concretos tras la evaluación, y se revisa periódicamente. Cualquier cifra dada de antemano, sin evaluación, sería inventada." } },
        { "@type": "Question", "name": "¿Sobrepensar es lo mismo que tener ansiedad?",
          "acceptedAnswer": { "@type": "Answer", "text": "No exactamente. El sobrepensamiento —preocupación y rumiación— es uno de los procesos que sostienen la ansiedad, y aparece también en el estado de ánimo bajo. Se puede sobrepensar mucho sin cumplir criterios de un trastorno de ansiedad." } },
        { "@type": "Question", "name": "¿Atendéis online?",
          "acceptedAnswer": { "@type": "Answer", "text": "Sí. Se atiende presencialmente en la consulta de Inca, Mallorca, y también online." } },
        { "@type": "Question", "name": "¿Y si lo que tengo es ansiedad después de un accidente?",
          "acceptedAnswer": { "@type": "Answer", "text": "Cuando el malestar aparece tras un accidente u otra experiencia traumática, el cuadro y el abordaje tienen particularidades propias, y se trabajan de forma específica." } }
      ]
    }
  ]
}
</script>


<!-- ═══ SECCIÓN C · ESTILOS ════════════════════════════════════════════════ -->

<style>
.pgClinica{ padding-bottom:50px; }
.pgClinica .lead-cl{ font-size:19px; line-height:1.55; font-weight:600; color:#1B4F8C; margin:0 0 24px; max-width:38em; }
.pgClinica p{ font-size:17px; line-height:1.72; max-width:38em; margin:0 0 1.05em; }
.pgClinica h2{ font-size:25px; line-height:1.25; margin:46px 0 14px; color:#1B4F8C; font-weight:700; }
.pgClinica .resp{ font-weight:600; color:#1a1a2e; }
.pgClinica ul.cl-lista{ list-style:none; padding-left:0; margin:0 0 1.3em; max-width:38em; }
.pgClinica ul.cl-lista li{ position:relative; padding:8px 0 8px 22px; font-size:16.5px; line-height:1.55; border-bottom:1px solid #E6ECF3; }
.pgClinica ul.cl-lista li:before{ content:"—"; position:absolute; left:0; color:#9AA7B8; }
/* Aviso discreto: nota al margen del texto, no bloque de alarma */
.pgClinica .cl-nota{
  font-size:15px; line-height:1.6; color:#5B6A82; max-width:38em;
  border-left:2px solid #D5DEE9; padding:2px 0 2px 16px; margin:0 0 1.4em;
}
.pgClinica .cl-nota strong{ color:#1a1a2e; }
.pgClinica table.cl-frases{ width:100%; max-width:38em; border-collapse:collapse; margin:8px 0 1.6em; }
.pgClinica table.cl-frases td{ padding:10px 14px 10px 0; border-bottom:1px solid #E6ECF3; font-size:16px; vertical-align:top; }
.pgClinica table.cl-frases td:first-child{ font-style:italic; }
.pgClinica table.cl-frases td:last-child{ color:#6B7280; }
.pgClinica .cl-xref{ display:inline-block; margin:-.4em 0 1.4em; font-size:16px; color:#1B4F8C; font-weight:600; text-decoration:none; }
.pgClinica .cl-xref:hover{ text-decoration:underline; }
.pgClinica .cl-refs{ margin-top:44px; padding-top:20px; border-top:1px solid #E6ECF3; font-size:14.5px; line-height:1.65; color:#6B7280; max-width:40em; }
.pgClinica .cl-refs h2{ font-size:15px; letter-spacing:.06em; text-transform:uppercase; color:#6B7280; margin:0 0 12px; }
.pgClinica .cl-refs li{ margin-bottom:10px; }
.pgClinica .cl-firma{ margin-top:36px; padding-top:22px; border-top:2px solid #1B4F8C; font-size:14.5px; line-height:1.85; color:#6B7280; max-width:40em; }
.pgClinica .cl-firma strong{ color:#1a1a2e; }
@media (max-width:767px){
  .pgClinica p{ font-size:16.5px; }
  .pgClinica h2{ font-size:22px; margin-top:38px; }
}
</style>


<!-- ═══ SECCIÓN D · CONTENIDO ══════════════════════════════════════════════ -->

<div id="pageBody">

  <div class="container tituloSeccion">
    <h1>Psic&oacute;logo para la ansiedad y el sobrepensamiento en Mallorca</h1>
  </div>

  <div class="container pgClinica">
    <div class="row">
      <div class="col-xs-12 col-md-9">

        <p class="lead-cl">Preocupaci&oacute;n que no se apaga, pensamientos que vuelven una y otra vez, un cuerpo que parece en alerta sin motivo aparente. Esto explica por qu&eacute; ocurre y c&oacute;mo se trabaja en terapia. Consulta en Inca, Mallorca, y atenci&oacute;n online.</p>

        <h2>&iquest;Por qu&eacute; no puedo dejar de pensar?</h2>
        <p class="resp">Porque la mente ha aprendido que pensar sirve para algo, y no est&aacute; del todo equivocada.</p>
        <p>Darle vueltas a un problema produce, durante unos segundos, la sensaci&oacute;n de estar haciendo algo: de estar previniendo, resolviendo o controlando. Esa sensaci&oacute;n de alivio momentáneo es la que mantiene el h&aacute;bito. Cuando la preocupaci&oacute;n se convierte en la estrategia principal para manejar la incertidumbre, la mente recurre a ella cada vez con m&aacute;s facilidad y ante cosas cada vez m&aacute;s peque&ntilde;as.</p>
        <p>Cl&iacute;nicamente esto tiene dos formas que conviene distinguir, aunque a menudo se alternen:</p>
        <ul class="cl-lista">
          <li><strong>Preocupaci&oacute;n</strong>: cadenas de pensamiento sobre lo que <em>podr&iacute;a</em> pasar. Mira hacia adelante. &laquo;&iquest;Y si&hellip;?&raquo;</li>
          <li><strong>Rumiaci&oacute;n</strong>: dar vueltas a lo que <em>ya</em> pas&oacute;, a por qu&eacute; pas&oacute;, o a por qu&eacute; uno es como es. Mira hacia atr&aacute;s.</li>
        </ul>
        <p>Ambas comparten algo: prometen una conclusi&oacute;n que nunca llega. Se pueden sostener durante horas sin resolver nada, porque la pregunta que las alimenta &mdash;&laquo;&iquest;estar&eacute; seguro?&raquo;, &laquo;&iquest;por qu&eacute; me pasa esto?&raquo;&mdash; no tiene una respuesta que la mente pueda darse a s&iacute; misma.</p>
        <p>Hay adem&aacute;s un elemento que casi nadie ve desde dentro: <strong>pensar mucho sobre algo doloroso puede funcionar como una manera de no sentirlo del todo</strong>. El pensamiento verbal, en forma de palabras, amortigua la respuesta emocional del cuerpo. Es decir, no solo el sobrepensamiento no resuelve: adem&aacute;s impide que la emoci&oacute;n se procese y se agote por s&iacute; sola.</p>

        <h2>&iquest;Por qu&eacute; noto la ansiedad en el cuerpo?</h2>
        <p class="resp">Porque la ansiedad es, antes que un pensamiento, una respuesta corporal de preparaci&oacute;n ante algo que el organismo interpreta como amenaza.</p>
        <p>Taquicardia, opresi&oacute;n en el pecho, respiraci&oacute;n corta, nudo en el est&oacute;mago, tensi&oacute;n en la mand&iacute;bula o en los hombros, mareo, hormigueo, sensaci&oacute;n de irrealidad. Ninguna de esas sensaciones es un fallo: son un cuerpo prepar&aacute;ndose para actuar. El problema no es que aparezcan, sino que aparezcan cuando no hay nada de lo que huir.</p>
        <p>A partir de ah&iacute; ocurre algo que explica buena parte del sufrimiento posterior: <strong>las sensaciones empiezan a dar miedo por s&iacute; mismas</strong>. Uno deja de temer la situaci&oacute;n y pasa a temer lo que su cuerpo hace en esa situaci&oacute;n. Se empieza a vigilar el pecho, a comprobar el pulso, a interpretar cada sensaci&oacute;n como se&ntilde;al de que algo va mal.</p>
        <p>Esa vigilancia tiene un efecto contraintuitivo: <strong>atender a una sensaci&oacute;n la amplifica</strong>. Cuanto m&aacute;s se busca, m&aacute;s se encuentra, y cuanto m&aacute;s se encuentra, m&aacute;s se confirma la sospecha de que algo va mal. El circuito se cierra sobre s&iacute; mismo.</p>
        <p class="cl-nota"><strong>Conviene descartar otras causas.</strong> Algunas condiciones m&eacute;dicas &mdash;alteraciones tiroideas, anemia, problemas card&iacute;acos, efectos de medicaci&oacute;n, cafe&iacute;na u otras sustancias&mdash; producen s&iacute;ntomas parecidos. Si estas sensaciones son nuevas o han cambiado de forma, empieza por una valoraci&oacute;n m&eacute;dica.</p>

        <h2>&iquest;Por qu&eacute; cuanto m&aacute;s intento controlar la ansiedad, peor me siento?</h2>
        <p class="resp">Porque los m&eacute;todos que funcionan para resolver problemas del mundo exterior no funcionan igual aplicados al mundo interior.</p>
        <p>Fuera, si algo molesta, se quita. Dentro, la operaci&oacute;n no da el mismo resultado. Intentar no pensar en algo obliga a comprobar si se est&aacute; pensando, lo que trae ese algo de vuelta. Intentar relajarse a la fuerza convierte la relajaci&oacute;n en una tarea con nota, y el fracaso en una prueba m&aacute;s de que uno no puede. Vigilar si la ansiedad ha bajado mantiene abierta la pregunta que la sostiene.</p>
        <p>Adem&aacute;s, cada estrategia de control tiene un coste que se paga despu&eacute;s. Evitar una reuni&oacute;n calma esta tarde y hace la pr&oacute;xima m&aacute;s dif&iacute;cil. Pedir que alguien confirme que todo est&aacute; bien alivia diez minutos y ense&ntilde;a a la mente que sin esa confirmaci&oacute;n no se puede estar tranquilo. Comprobar las cosas una vez m&aacute;s reduce la duda un instante y la refuerza a largo plazo.</p>
        <p>Esto tiene nombre en la literatura cl&iacute;nica. La gu&iacute;a de pr&aacute;ctica cl&iacute;nica del Sistema Nacional de Salud lo describe as&iacute;: las personas con ansiedad generalizada &laquo;reaccionan negativamente a sus experiencias internas, juzg&aacute;ndolas, luchando contra ellas o tratando de controlarlas, pues las perciben como amenazantes&raquo;, un fen&oacute;meno que denomina <strong>evitaci&oacute;n experiencial</strong>.</p>
        <p>Dicho de otro modo: <strong>el intento de control se ha convertido en parte del problema</strong>. Y ese es precisamente uno de los puntos donde la terapia puede intervenir.</p>

        <h2>&iquest;Qu&eacute; puede estar ocurriendo?</h2>
        <p>Lo que se describe en esta p&aacute;gina aparece en varios cuadros cl&iacute;nicos distintos, y tambi&eacute;n en personas que no cumplen criterios de ninguno.</p>
        <ul class="cl-lista">
          <li><strong>Ansiedad generalizada.</strong> Preocupaci&oacute;n excesiva y dif&iacute;cil de controlar sobre varios &aacute;mbitos, la mayor parte de los d&iacute;as, con tensi&oacute;n, fatiga, irritabilidad o problemas de sue&ntilde;o.</li>
          <li><strong>Crisis de p&aacute;nico.</strong> Episodios de miedo intenso que alcanzan su pico en minutos, con s&iacute;ntomas corporales fuertes, y el miedo posterior a que se repitan.</li>
          <li><strong>Ansiedad social.</strong> Miedo intenso a la evaluaci&oacute;n de los dem&aacute;s, con anticipaci&oacute;n previa y repaso posterior de lo que uno hizo o dijo.</li>
          <li><strong>Ansiedad ante la salud.</strong> Preocupaci&oacute;n persistente por padecer una enfermedad, con comprobaciones corporales y b&uacute;squeda de informaci&oacute;n o de tranquilizaci&oacute;n.</li>
          <li><strong>Ansiedad ligada a un momento vital.</strong> Una separaci&oacute;n, un despido, un diagn&oacute;stico, un cambio de etapa. Aqu&iacute; no hay trastorno: hay una respuesta comprensible a algo dif&iacute;cil, que a veces necesita ayuda igualmente.</li>
        </ul>
        <p>La ansiedad rara vez viene sola: convive con frecuencia con el estado de &aacute;nimo bajo, con el dolor persistente y con el malestar posterior a una experiencia traum&aacute;tica.</p>
        <p><strong>Nada de esto se decide leyendo una p&aacute;gina web.</strong> Un listado de s&iacute;ntomas no es un diagn&oacute;stico, y reconocerse en una descripci&oacute;n no equivale a tener un trastorno. Para eso est&aacute; la evaluaci&oacute;n.</p>

        <h2>&iquest;C&oacute;mo se eval&uacute;a?</h2>
        <p class="resp">Con una entrevista cl&iacute;nica, un an&aacute;lisis de c&oacute;mo funciona el problema en tu vida concreta y, cuando aporta informaci&oacute;n, instrumentos estandarizados.</p>
        <p>Lo que se busca no es principalmente la etiqueta. Es entender el mecanismo:</p>
        <ul class="cl-lista">
          <li><strong>En qu&eacute; situaciones aparece</strong> y en cu&aacute;les no. Las excepciones informan tanto como los episodios.</li>
          <li><strong>Qu&eacute; hace la atenci&oacute;n</strong> en esos momentos: hacia d&oacute;nde va, en qu&eacute; se queda enganchada.</li>
          <li><strong>Qu&eacute; hace el cuerpo</strong> y c&oacute;mo se interpreta lo que hace.</li>
          <li><strong>Qu&eacute; se hace despu&eacute;s</strong>: qu&eacute; se evita, qu&eacute; se comprueba, a qui&eacute;n se pregunta, qu&eacute; se pospone.</li>
          <li><strong>Qu&eacute; ha dejado de hacerse</strong> desde que esto empez&oacute;. Esta suele ser la pregunta m&aacute;s reveladora.</li>
          <li><strong>Qu&eacute; se ha intentado ya</strong>, y qu&eacute; pas&oacute;. Lo que no funcion&oacute; tambi&eacute;n es un dato.</li>
        </ul>
        <p>Cuando es pertinente se incorpora evaluaci&oacute;n neuropsicol&oacute;gica &mdash;atenci&oacute;n sostenida, memoria de trabajo, funciones ejecutivas&mdash;, porque condiciona qu&eacute; intervenci&oacute;n es realista en un momento dado.</p>
        <p>De la evaluaci&oacute;n sale una <strong>formulaci&oacute;n</strong>: una explicaci&oacute;n de c&oacute;mo se mantiene tu problema en particular, que se comparte contigo y sobre la que se decide qu&eacute; hacer. Si el trabajo psicol&oacute;gico no es lo indicado, o no es lo &uacute;nico indicado, tambi&eacute;n se dice.</p>

        <h2>&iquest;Qu&eacute; papel tienen la atenci&oacute;n, la evitaci&oacute;n y la conducta?</h2>
        <p class="resp">Son los tres mecanismos que mantienen el problema una vez que ha empezado, y por eso son el objetivo del trabajo.</p>
        <p><strong>La atenci&oacute;n</strong> determina qu&eacute; parte de la realidad llega. En ansiedad tiende a estrecharse sobre la amenaza &mdash;la sensaci&oacute;n corporal, el pensamiento temido, la cara seria de alguien&mdash; y a filtrar el resto. No es falta de voluntad: es un sesgo que se puede entrenar en otra direcci&oacute;n.</p>
        <p><strong>La evitaci&oacute;n</strong> es la que explica que el problema no se corrija solo. Cada vez que se evita algo temido, se pierde la ocasi&oacute;n de comprobar qu&eacute; habr&iacute;a pasado. La predicci&oacute;n de cat&aacute;strofe queda intacta, sin desmentir, lista para la pr&oacute;xima vez. Y la evitaci&oacute;n crece: empieza en una situaci&oacute;n concreta y se va extendiendo a lo que se le parece.</p>
        <p><strong>La conducta</strong> es donde se ve el coste real. La vida se va estrechando alrededor del problema: menos planes, menos relaciones, menos cosas que importan. Y esa reducci&oacute;n alimenta el malestar, porque quedan menos fuentes de sentido y m&aacute;s tiempo disponible para pensar.</p>
        <p>Por eso el trabajo no consiste solo en pensar distinto. Consiste en <strong>cambiar qu&eacute; se hace con la atenci&oacute;n, qu&eacute; se deja de evitar y qu&eacute; se recupera de la vida propia</strong>.</p>

        <h2>&iquest;C&oacute;mo se trabaja en terapia?</h2>
        <p class="resp">Con intervenciones psicol&oacute;gicas cuya eficacia est&aacute; respaldada por gu&iacute;as de pr&aacute;ctica cl&iacute;nica, empezando por la terapia cognitivo-conductual.</p>
        <p>La terapia cognitivo-conductual dispone de la base de evidencia m&aacute;s amplia y es la intervenci&oacute;n psicol&oacute;gica de referencia: la gu&iacute;a de pr&aacute;ctica cl&iacute;nica del Sistema Nacional de Salud publicada en 2024 la recomienda como <strong>primera l&iacute;nea de tratamiento psicol&oacute;gico</strong> para el trastorno de ansiedad generalizada, con una recomendaci&oacute;n fuerte a favor.</p>
        <p>La terapia de aceptaci&oacute;n y compromiso cuenta tambi&eacute;n con evidencia favorable en el trastorno de ansiedad generalizada, pero esa misma gu&iacute;a la sit&uacute;a por detr&aacute;s: recomendaci&oacute;n d&eacute;bil a favor, como <strong>una de las opciones de segunda l&iacute;nea</strong> cuando no se obtiene respuesta con la terapia cognitivo-conductual. La elecci&oacute;n se individualiza en cada caso.</p>
        <p>El trabajo suele incluir, adaptado a cada persona:</p>
        <ul class="cl-lista">
          <li><strong>Entender el mecanismo.</strong> Comprender por qu&eacute; la preocupaci&oacute;n se mantiene y qu&eacute; papel juega cada estrategia de control no es teor&iacute;a: cambia lo que uno hace en el momento.</li>
          <li><strong>Trabajo con el pensamiento.</strong> No consiste en &laquo;pensar en positivo&raquo;, que rara vez sostiene nada. Consiste en examinar predicciones, ponerlas a prueba, y aprender a relacionarse de otra manera con los pensamientos que no se pueden resolver.</li>
          <li><strong>Exposici&oacute;n gradual y planificada.</strong> Acercarse de forma progresiva y acordada a lo que se ha ido evitando, para que la experiencia pueda desmentir lo que la anticipaci&oacute;n afirma. Por pasos, nunca de golpe, y siempre con acuerdo.</li>
          <li><strong>Trabajo con las sensaciones corporales.</strong> Aprender a registrar lo que ocurre dentro sin interpretarlo autom&aacute;ticamente como peligro, y a sostenerlo sin tener que suprimirlo.</li>
          <li><strong>Entrenamiento atencional.</strong> Pr&aacute;ctica sistem&aacute;tica para poder retirar la atenci&oacute;n de donde se queda enganchada y llevarla a donde uno decide.</li>
          <li><strong>Recuperaci&oacute;n de la vida.</strong> Volver a poner en marcha, de forma progresiva, lo que importa y se hab&iacute;a ido abandonando. No al final, cuando la ansiedad baje: durante.</li>
        </ul>
        <p><strong>Sobre qu&eacute; se puede esperar.</strong> Estas intervenciones cuentan con apoyo emp&iacute;rico, pero ning&uacute;n tratamiento psicol&oacute;gico funciona igual en todas las personas ni garantiza un resultado concreto. El objetivo realista no es una vida sin ansiedad &mdash;la ansiedad es una respuesta normal y necesaria&mdash; sino que deje de organizar tus decisiones.</p>

        <h2>&iquest;Cu&aacute;ndo conviene pedir ayuda?</h2>
        <p class="resp">Cuando la ansiedad ha empezado a decidir por ti.</p>
        <ul class="cl-lista">
          <li>Lleva <strong>semanas o meses</strong>, no d&iacute;as.</li>
          <li><strong>Interfiere</strong>: en el sue&ntilde;o, en el trabajo o los estudios, en las relaciones, en la salud.</li>
          <li>Has <strong>dejado de hacer cosas</strong> que antes hac&iacute;as, o las haces solo bajo ciertas condiciones.</li>
          <li>Hay <strong>estrategias de alivio que est&aacute;n creciendo</strong>: comprobaciones, tranquilizaci&oacute;n ajena, alcohol, cannabis, pantallas hasta caer rendido.</li>
          <li>Aparecen <strong>crisis</strong> con s&iacute;ntomas corporales intensos, o miedo a que se repitan.</li>
          <li>Lo has intentado por tu cuenta y <strong>el terreno se sigue estrechando</strong>.</li>
        </ul>
        <p class="cl-nota">Si aparecen ideas de hacerte da&ntilde;o o de que no vale la pena seguir, no esperes a una cita: el <strong>024</strong> es la l&iacute;nea de atenci&oacute;n a la conducta suicida, gratuita y disponible las 24 horas. En caso de riesgo inmediato, <strong>112</strong> o urgencias.</p>

        <h2>&iquest;C&oacute;mo trabajamos en APRENS?</h2>
        <p class="resp">Empezando por entender el mecanismo antes de proponer nada.</p>
        <p>La primera visita se dedica a saber qu&eacute; est&aacute; pasando: cu&aacute;ndo aparece, qu&eacute; hace la atenci&oacute;n, qu&eacute; hace el cuerpo, qu&eacute; se ha ido evitando y qu&eacute; se ha ido perdiendo por el camino. De ah&iacute; sale una explicaci&oacute;n compartida y una propuesta de trabajo con objetivos concretos.</p>
        <p>El trabajo combina la terapia cognitivo-conductual con elementos de terapia de aceptaci&oacute;n y compromiso, la mirada de la neuropsicolog&iacute;a en la evaluaci&oacute;n, y <strong>entrenamiento atencional e interoceptivo</strong>: pr&aacute;ctica sistem&aacute;tica con d&oacute;nde se pone la atenci&oacute;n y con c&oacute;mo se registra lo que ocurre dentro del cuerpo.</p>
        <p>Ese trabajo atencional e interoceptivo se apoya en un marco propio, <strong>TEC/AIS</strong>, desarrollado por Crist&ograve;fol Villalonga a partir de su pr&aacute;ctica cl&iacute;nica. Es un <strong>marco en desarrollo</strong>, integrado dentro de las intervenciones anteriores, y no un tratamiento con eficacia diferencial establecida. Se explica con transparencia en la primera visita, y no sustituye a nada de lo anterior.</p>
        <p>Entre sesiones hay pr&aacute;ctica. La terapia no ocurre principalmente en la consulta: ocurre en la semana.</p>
        <a class="cl-xref" href="/cristofol-villalonga-psicologo-mallorca/">Crist&ograve;fol Villalonga Melis, psic&oacute;logo en Mallorca &rsaquo;</a>

        <h2>Frases que quiz&aacute; reconozcas</h2>
        <p>Si alguna de estas es tuya, esta p&aacute;gina va de lo que te pasa:</p>
        <table class="cl-frases">
          <tr><td>&laquo;Mi cabeza nunca se apaga&raquo;</td><td>Rumiaci&oacute;n y preocupaci&oacute;n persistente</td></tr>
          <tr><td>&laquo;No puedo dejar de darle vueltas&raquo;</td><td>Pensamiento repetitivo</td></tr>
          <tr><td>&laquo;Necesito saber que todo va a salir bien&raquo;</td><td>Intolerancia a la incertidumbre</td></tr>
          <tr><td>&laquo;Estoy pendiente de mi cuerpo todo el rato&raquo;</td><td>Hipervigilancia interoceptiva</td></tr>
          <tr><td>&laquo;Me da miedo que me d&eacute; algo&raquo;</td><td>Miedo a las sensaciones corporales</td></tr>
          <tr><td>&laquo;Cuanto m&aacute;s lo intento controlar, peor&raquo;</td><td>Evitaci&oacute;n experiencial</td></tr>
          <tr><td>&laquo;Prefiero no ir, por si acaso&raquo;</td><td>Evitaci&oacute;n conductual</td></tr>
          <tr><td>&laquo;Estoy agotado de estar en tensi&oacute;n&raquo;</td><td>Activaci&oacute;n fisiol&oacute;gica sostenida</td></tr>
        </table>

        <h2>&iquest;C&oacute;mo pedir una primera visita?</h2>
        <p>Escribiendo a <a href="mailto:info@aprens.es">info@aprens.es</a>, llamando al <a href="tel:+34636937661">636 93 76 61</a> de 9 a 21 h, o desde la <a href="contactar.php">p&aacute;gina de contacto</a>. La consulta est&aacute; en Inca, y tambi&eacute;n se atiende online.</p>
        <p>La primera visita sirve para entender qu&eacute; est&aacute; pasando y decidir juntos si tiene sentido seguir, y de qu&eacute; manera. No hay compromiso de continuidad.</p>

        <div class="cl-refs">
          <h2>Referencias</h2>
          <ul>
            <li>Ministerio de Sanidad. <em>Gu&iacute;a de Pr&aacute;ctica Cl&iacute;nica para el Tratamiento del Trastorno de Ansiedad Generalizada en Atenci&oacute;n Primaria</em>. Programa de GPC en el SNS. Servicio de Evaluaci&oacute;n del Servicio Canario de la Salud, 2024. <a href="https://portal.guiasalud.es/gpc/tratamiento-trastorno-ansiedad-generalizada-atencion-primaria/" rel="noopener">portal.guiasalud.es</a></li>
            <li>National Institute for Health and Care Excellence. <em>Generalised anxiety disorder and panic disorder in adults: management</em>. Clinical guideline CG113. <a href="https://www.nice.org.uk/guidance/cg113" rel="noopener">nice.org.uk</a></li>
          </ul>
        </div>

        <div class="cl-firma">
          <strong>Crist&ograve;fol Villalonga Melis</strong><br>
          Psic&oacute;logo General Sanitario &middot; Neuropsic&oacute;logo cl&iacute;nico &middot; Colegiado B-01599 &middot; COPIB<br>
          Publicado: <!-- FECHA --> &middot; &Uacute;ltima revisi&oacute;n: <!-- FECHA --><br>
          <em>Esta p&aacute;gina tiene finalidad informativa y no sustituye una valoraci&oacute;n cl&iacute;nica individual.</em>
        </div>

      </div>
    </div>
  </div>

</div>

<?php /*
─────────────────────────────────────────────────────────────────────────────
REGLAS DE APACHE · añadir al bloque de la fase 3, en la sección 2

  RewriteCond %{THE_REQUEST} \s/+c-ansiedad\.php[\s?] [NC]
  RewriteRule ^ /psicologo-ansiedad-mallorca/ [R=301,L]

  RewriteRule ^psicologo-ansiedad-mallorca$  /psicologo-ansiedad-mallorca/ [R=301,L]
  RewriteRule ^psicologo-ansiedad-mallorca/$ c-ansiedad.php [L]

─────────────────────────────────────────────────────────────────────────────
ANTES DE PUBLICAR
  · Rellenar las dos fechas de la firma y los dos campos "AAAA-MM-DD" del JSON-LD.
  · Confirmar visualmente en nice.org.uk las fechas de CG113: el sitio devuelve
    403 al rastreo automatizado y no han podido verificarse por esa vía.
  · Esta página NO enlaza a /enfoque/, que todavía no existe. Cuando exista,
    añadir el enlace en la sección "¿Cómo trabajamos en APRENS?".
───────────────────────────────────────────────────────────────────────────── */ ?>
