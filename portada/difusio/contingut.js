/* APRENS · Espai de difusió. Tot el contingut de les fitxes (textos i diapositives).
   Cada text: { ca, es }. Les diapositives es converteixen en imatges amb
   scripts/difusio/genera-imatges.mjs (no cal tocar res més per afegir-ne una).

   Tipus de diapositiva:
     portada   t (títol gran), x (subtítol), img (opcional, ruta des de portada/),
               contain: true perquè la imatge es vegi sencera (portades de llibre, esquemes)
     text      t, x
     llista    t, items []
     cita      x (frase destacada), t (autor o context, opcional)
     tancament t, x, url (es mostra gran)
*/
window.DIFUSIO = {
  enllacos: {
    web: "aprens.net",
    instagram: "https://www.instagram.com/tofol49/",
    facebook: "https://www.facebook.com/aprens70/",
    contacte: "APRENS Psicologia · Inca · 636 93 76 61 · info@aprens.es"
  },

  fitxes: [
    /* ------------------------------------------------------------------ */
    {
      id: "explica-ho",
      color: "#6d5aa8",
      destacat: true,
      nom: { ca: "Explica-ho", es: "Explica-ho" },
      perAqui: { ca: "Estudiants d'ESO, batxillerat, FP, universitat i oposicions, i les seves famílies", es: "Estudiantes de ESO, bachillerato, FP, universidad y oposiciones, y sus familias" },
      enllac: "https://explica.aprens.net/",
      imatge: "img/novetats/explica-ho-gran.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Si no ho pots explicar, no t'ho saps", x: "Explica-ho, una eina d'estudi actiu d'APRENS", img: "img/novetats/explica-ho-gran.jpg" },
          { tipus: "text", t: "Llegir i subratllar dona la sensació de saber-ho", x: "Però quan arriba l'examen i s'ha d'explicar amb les pròpies paraules, apareixen els buits. Molt sovint el problema no és la falta d'hores, sinó la manera d'estudiar." },
          { tipus: "llista", t: "Com funciona", items: ["Pujes els apunts: fotos, PDF o Word", "Et fa un resum i un mapa conceptual", "Et pregunta en quatre nivells: recordar, comprendre, relacionar i integrar", "Respons parlant o escrivint, i veus fins on t'ho saps"] },
          { tipus: "text", t: "Matemàtiques i Física i Química", x: "Et posa exercicis amb pistes progressives i, quan t'equivoques, et diu en quin pas, quin tipus d'error és i com arreglar-ho." },
          { tipus: "tancament", t: "La IA t'acompanya, no estudia per tu", x: "Català i castellà. Sense instal·lar res. Temes d'exemple oberts per provar-la.", url: "explica.aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "Si no lo puedes explicar, no te lo sabes", x: "Explica-ho, una herramienta de estudio activo de APRENS", img: "img/novetats/explica-ho-gran.jpg" },
          { tipus: "text", t: "Leer y subrayar da la sensación de saberlo", x: "Pero cuando llega el examen y hay que explicarlo con las propias palabras, aparecen los huecos. Muchas veces el problema no es la falta de horas, sino la manera de estudiar." },
          { tipus: "llista", t: "Cómo funciona", items: ["Subes los apuntes: fotos, PDF o Word", "Te hace un resumen y un mapa conceptual", "Te pregunta en cuatro niveles: recordar, comprender, relacionar e integrar", "Respondes hablando o escribiendo, y ves hasta dónde te lo sabes"] },
          { tipus: "text", t: "Matemáticas y Física y Química", x: "Te pone ejercicios con pistas progresivas y, cuando te equivocas, te dice en qué paso, qué tipo de error es y cómo arreglarlo." },
          { tipus: "tancament", t: "La IA te acompaña, no estudia por ti", x: "Catalán y castellano. Sin instalar nada. Temas de ejemplo abiertos para probarla.", url: "explica.aprens.net" }
        ]
      },
      ig: {
        ca: `Si no ho pots explicar, no t'ho saps.

Fa anys que faig feina amb estudiants i amb les seves famílies, i molt sovint veig que el problema no és la falta d'hores, sinó la manera d'estudiar. Llegir i subratllar dona la sensació de saber-ho, però quan s'ha d'explicar amb les pròpies paraules apareixen els buits.

Explica-ho és una eina d'estudi actiu d'APRENS. Puges els apunts, t'ordena les idees en un resum i un mapa conceptual i et fa preguntes en quatre nivells de profunditat. Respons parlant o escrivint, i veus quins conceptes tens sòlids i quins encara no.

La intel·ligència artificial hi és per acompanyar l'estudiant, no per fer-li la feina.

Per a ESO, batxillerat, FP, universitat i oposicions. En català i en castellà.
Prova-la a explica.aprens.net (enllaç a la bio).

#APRENS #estudiactiu #tècniquesdestudi #ESO #batxillerat #Mallorca`,
        es: `Si no lo puedes explicar, no te lo sabes.

Hace años que trabajo con estudiantes y con sus familias, y muchas veces veo que el problema no es la falta de horas, sino la manera de estudiar. Leer y subrayar da la sensación de saberlo, pero cuando hay que explicarlo con las propias palabras aparecen los huecos.

Explica-ho es una herramienta de estudio activo de APRENS. Subes los apuntes, te ordena las ideas en un resumen y un mapa conceptual y te hace preguntas en cuatro niveles de profundidad. Respondes hablando o escribiendo, y ves qué conceptos tienes sólidos y cuáles todavía no.

La inteligencia artificial está para acompañar al estudiante, no para hacerle el trabajo.

Para ESO, bachillerato, FP, universidad y oposiciones. En catalán y en castellano.
Pruébala en explica.aprens.net (enlace en la bio).

#APRENS #estudioactivo #técnicasdeestudio #ESO #bachillerato #Mallorca`
      },
      fb: {
        ca: `Presentam Explica-ho, una eina d'estudi actiu d'APRENS que ja es pot fer servir a explica.aprens.net.

Fa anys que faig feina amb estudiants i amb les seves famílies, i molt sovint veig que el problema no és la falta d'hores, sinó la manera d'estudiar: llegir i subratllar dona la sensació de saber-ho, però quan arriba l'examen i s'ha d'explicar amb les pròpies paraules apareixen els buits. Per això la idea que ho travessa tot és senzilla: si no ho pots explicar, no t'ho saps.

Com funciona:
1. Puges els apunts (fotos del llibre o del quadern, PDF o Word).
2. L'eina t'ordena les idees en un resum, un mapa conceptual i els conceptes clau.
3. Et fa preguntes en quatre nivells: recordar, comprendre, relacionar i integrar. Respons parlant o escrivint i t'ho valora.
4. Veus quins conceptes tens sòlids i fins a quin nivell de profunditat arribes.

A Matemàtiques i Física i Química et posa exercicis amb pistes progressives i et diu en quin pas t'has equivocat i com arreglar-ho.

Està pensada per a ESO i batxillerat, però també serveix per a FP, universitat i oposicions. Funciona en català i en castellà, des de qualsevol navegador, sense instal·lar res. Els temes d'exemple es poden obrir sense codi; per fer-la servir amb el material propi hi ha una subscripció de 6 € al mes.

Les respostes les genera una intel·ligència artificial i es pot equivocar: si alguna cosa no quadra, cal contrastar-ho amb el llibre o amb el professorat.

https://explica.aprens.net/
Més informació: https://aprens.net/explica-ho.html`,
        es: `Presentamos Explica-ho, una herramienta de estudio activo de APRENS que ya se puede usar en explica.aprens.net.

Hace años que trabajo con estudiantes y con sus familias, y muchas veces veo que el problema no es la falta de horas, sino la manera de estudiar: leer y subrayar da la sensación de saberlo, pero cuando llega el examen y hay que explicarlo con las propias palabras aparecen los huecos. Por eso la idea que lo atraviesa todo es sencilla: si no lo puedes explicar, no te lo sabes.

Cómo funciona:
1. Subes los apuntes (fotos del libro o del cuaderno, PDF o Word).
2. La herramienta ordena las ideas en un resumen, un mapa conceptual y los conceptos clave.
3. Te hace preguntas en cuatro niveles: recordar, comprender, relacionar e integrar. Respondes hablando o escribiendo y te lo valora.
4. Ves qué conceptos tienes sólidos y hasta qué nivel de profundidad llegas.

En Matemáticas y Física y Química te pone ejercicios con pistas progresivas y te dice en qué paso te has equivocado y cómo arreglarlo.

Está pensada para ESO y bachillerato, pero también sirve para FP, universidad y oposiciones. Funciona en catalán y en castellano, desde cualquier navegador, sin instalar nada. Los temas de ejemplo se pueden abrir sin código; para usarla con el material propio hay una suscripción de 6 € al mes.

Las respuestas las genera una inteligencia artificial y se puede equivocar: si algo no cuadra, hay que contrastarlo con el libro o con el profesorado.

https://explica.aprens.net/
Más información: https://aprens.net/explica-ho.html`
      },
      yt: {
        titol: { ca: "Si no ho pots explicar, no t'ho saps · Explica-ho (APRENS)", es: "Si no lo puedes explicar, no te lo sabes · Explica-ho (APRENS)" },
        desc: {
          ca: `Explica-ho és una eina d'estudi actiu d'APRENS: ordena els apunts en un resum i un mapa conceptual, et fa preguntes en quatre nivells de profunditat (recordar, comprendre, relacionar i integrar) i corregeix els exercicis pas a pas.

Per a ESO, batxillerat, FP, universitat i oposicions. En català i en castellà.

Prova-la: https://explica.aprens.net/
Més informació: https://aprens.net/explica-ho.html

Tòfol Villalonga · APRENS Psicologia · Inca`,
          es: `Explica-ho es una herramienta de estudio activo de APRENS: ordena los apuntes en un resumen y un mapa conceptual, te hace preguntas en cuatro niveles de profundidad (recordar, comprender, relacionar e integrar) y corrige los ejercicios paso a paso.

Para ESO, bachillerato, FP, universidad y oposiciones. En catalán y en castellano.

Pruébala: https://explica.aprens.net/
Más información: https://aprens.net/explica-ho.html

Tòfol Villalonga · APRENS Psicología · Inca`
        },
        guio: {
          ca: `[0-5 s · Tòfol a càmera] Si no ho pots explicar, no t'ho saps.
[5-15 s] Molts d'estudiants llegeixen i subratllen hores, i tenen la sensació de saber-ho. Però a l'examen, quan ho han d'explicar amb les seves paraules, apareixen els buits.
[15-35 s · gravació de pantalla] Per això hem fet Explica-ho. Puges els apunts, t'ordena les idees en un mapa conceptual i et pregunta en quatre nivells: recordar, comprendre, relacionar i integrar. Respons parlant o escrivint.
[35-50 s] I veus quins conceptes tens sòlids i fins on arribes. La intel·ligència artificial t'acompanya, no estudia per tu.
[50-60 s · rètol] explica.aprens.net. En català i en castellà.`,
          es: `[0-5 s · Tòfol a cámara] Si no lo puedes explicar, no te lo sabes.
[5-15 s] Muchos estudiantes leen y subrayan durante horas, y tienen la sensación de saberlo. Pero en el examen, cuando lo tienen que explicar con sus palabras, aparecen los huecos.
[15-35 s · grabación de pantalla] Por eso hemos hecho Explica-ho. Subes los apuntes, ordena las ideas en un mapa conceptual y te pregunta en cuatro niveles: recordar, comprender, relacionar e integrar. Respondes hablando o escribiendo.
[35-50 s] Y ves qué conceptos tienes sólidos y hasta dónde llegas. La inteligencia artificial te acompaña, no estudia por ti.
[50-60 s · rótulo] explica.aprens.net. En catalán y en castellano.`
        }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "pares-juguen",
      color: "#0d6e69",
      destacat: true,
      nom: { ca: "Els pares també juguen", es: "Los padres también juegan" },
      perAqui: { ca: "Famílies i entrenadors de l'esport de base", es: "Familias y entrenadores del deporte base" },
      enllac: "https://aprens-app.aprens.net/esport-base/",
      imatge: "img/novetats/pares-esport-de-base.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Els pares també juguen", x: "El nostre paper també forma part del partit", img: "img/novetats/clubs-esport-base-gran.jpg" },
          { tipus: "cita", x: "Primer m'acompany a mi mateix per poder acompanyar millor l'esportista." },
          { tipus: "llista", t: "Tres moments, pocs tocs", items: ["Abans: com arrib i quin compromís vull tenir avui", "Durant: una pausa breu quan el partit m'activa", "Després: com rebre el meu fill o la meva filla", "Els ulls al camp, no al mòbil"] },
          { tipus: "text", t: "La pinya de les famílies", x: "Igual que els jugadors fan pinya dins el camp, les famílies també podem fer equip des de fora: un gest voluntari de compromís abans de cada partit." },
          { tipus: "tancament", t: "Sense registre ni dades", x: "El que anotes queda només al teu mòbil. En català i en castellà, per a famílies i entrenadors.", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "Los padres también juegan", x: "Nuestro papel también forma parte del partido", img: "img/novetats/clubs-esport-base-gran.jpg" },
          { tipus: "cita", x: "Primero me acompaño a mí mismo para poder acompañar mejor al deportista." },
          { tipus: "llista", t: "Tres momentos, pocos toques", items: ["Antes: cómo llego y qué compromiso quiero tener hoy", "Durante: una pausa breve cuando el partido me activa", "Después: cómo recibir a mi hijo o a mi hija", "Los ojos en el campo, no en el móvil"] },
          { tipus: "text", t: "La piña de las familias", x: "Igual que los jugadores hacen piña dentro del campo, las familias también podemos hacer equipo desde fuera: un gesto voluntario de compromiso antes de cada partido." },
          { tipus: "tancament", t: "Sin registro ni datos", x: "Lo que anotas queda solo en tu móvil. En catalán y en castellano, para familias y entrenadores.", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `Els pares també juguen.

Des de la grada vivim el partit amb molta intensitat, i és normal. El que ens toca entrenar és reconèixer quan el partit ens activa, aturar-nos uns segons i elegir com volem actuar davant els nostres al·lots i al·lotes, de manera que no hagin de carregar amb les emocions dels adults.

«Els pares també juguen» és una app d'APRENS per a famílies i entrenadors de l'esport de base. Acompanya els tres moments del partit: preparar-se abans, una pausa breu durant i una manera d'acompanyar el jugador després. I inclou la pinya de les famílies, un gest voluntari de compromís abans de cada partit.

No demana cap registre. El que hi anotes queda només al teu mòbil.

Enllaç a la bio.

#APRENS #esportdebase #futbolbase #famílies #psicologiadelesport #Mallorca`,
        es: `Los padres también juegan.

Desde la grada vivimos el partido con mucha intensidad, y es normal. Lo que nos toca entrenar es reconocer cuándo el partido nos activa, pararnos unos segundos y elegir cómo queremos actuar delante de nuestros chicos y chicas, de manera que no tengan que cargar con las emociones de los adultos.

«Los padres también juegan» es una app de APRENS para familias y entrenadores del deporte base. Acompaña los tres momentos del partido: prepararse antes, una pausa breve durante y una manera de acompañar al jugador después. E incluye la piña de las familias, un gesto voluntario de compromiso antes de cada partido.

No pide ningún registro. Lo que anotas queda solo en tu móvil.

Enlace en la bio.

#APRENS #deportebase #futbolbase #familias #psicologiadeldeporte #Mallorca`
      },
      fb: {
        ca: `Els pares també juguen.

Des d'APRENS hem preparat una eina per acompanyar les famílies i els entrenadors de l'esport de base, abans, durant i després de cada partit. Parteix de la guia «Els pares també juguen», i el que proposa no és una xerrada més sobre esportivitat, sinó un entrenament de cada dia: reconèixer quan el partit ens activa, aturar-nos uns segons i elegir com volem actuar davant els nostres al·lots i al·lotes.

- Abans: com arrib al partit, què em pot activar i quin compromís vull tenir avui.
- Durant: el record del compromís i una pausa breu quan ho necessit.
- Després: com rebre el jugador, si he estat fidel al meu compromís i què vull seguir entrenant.

Per als entrenadors hi ha una intenció educativa per a cada partit o sessió, situacions de banqueta i exemples de comunicació que corregeix sense humiliar.

I la pinya de les famílies: igual que els jugadors fan pinya dins el camp, noltros també podem fer equip des de fora, amb un gest voluntari de compromís abans de cada partit.

Funciona des del mòbil, sense instal·lar res i sense cap registre. El que cada persona anota queda només al seu telèfon.

App: https://aprens-app.aprens.net/esport-base/
Guia en PDF: https://aprens.net/descarregues/APRENS-paper-pares-esport-base.pdf`,
        es: `Los padres también juegan.

Desde APRENS hemos preparado una herramienta para acompañar a las familias y a los entrenadores del deporte base, antes, durante y después de cada partido. Parte de la guía «Los padres también juegan», y lo que propone no es una charla más sobre deportividad, sino un entrenamiento de cada día: reconocer cuándo el partido nos activa, pararnos unos segundos y elegir cómo queremos actuar delante de nuestros chicos y chicas.

- Antes: cómo llego al partido, qué me puede activar y qué compromiso quiero tener hoy.
- Durante: el recuerdo del compromiso y una pausa breve cuando la necesito.
- Después: cómo recibir al jugador, si he sido fiel a mi compromiso y qué quiero seguir entrenando.

Para los entrenadores hay una intención educativa para cada partido o sesión, situaciones de banquillo y ejemplos de comunicación que corrige sin humillar.

Y la piña de las familias: igual que los jugadores hacen piña dentro del campo, nosotros también podemos hacer equipo desde fuera, con un gesto voluntario de compromiso antes de cada partido.

Funciona desde el móvil, sin instalar nada y sin ningún registro. Lo que cada persona anota queda solo en su teléfono.

App: https://aprens-app.aprens.net/esport-base/
Guía en PDF (catalán): https://aprens.net/descarregues/APRENS-paper-pares-esport-base.pdf`
      },
      yt: {
        titol: { ca: "Els pares també juguen · Acompanyar sense afegir pressió (APRENS)", es: "Los padres también juegan · Acompañar sin añadir presión (APRENS)" },
        desc: {
          ca: `«Els pares també juguen» és una app d'APRENS per a famílies i entrenadors de l'esport de base. Acompanya els tres moments del partit (abans, durant i després) i inclou la pinya de les famílies, un gest voluntari de compromís abans de cada partit.

Sense registre: el que anotes queda només al teu mòbil. En català i en castellà.

App: https://aprens-app.aprens.net/esport-base/
Per a clubs: https://aprens.net/clubs-esport-base.html
Guia en PDF: https://aprens.net/descarregues/APRENS-paper-pares-esport-base.pdf

Tòfol Villalonga · APRENS Psicologia · Inca`,
          es: `«Los padres también juegan» es una app de APRENS para familias y entrenadores del deporte base. Acompaña los tres momentos del partido (antes, durante y después) e incluye la piña de las familias, un gesto voluntario de compromiso antes de cada partido.

Sin registro: lo que anotas queda solo en tu móvil. En catalán y en castellano.

App: https://aprens-app.aprens.net/esport-base/
Para clubes: https://aprens.net/clubs-esport-base.html

Tòfol Villalonga · APRENS Psicología · Inca`
        },
        guio: {
          ca: `[0-5 s · Tòfol a peu de camp] Els pares també juguen.
[5-20 s] Des de la grada ho vivim molt, i és normal. Però el nostre fill no hauria de carregar amb les nostres emocions. Primer m'acompany a mi mateix, per poder acompanyar millor l'esportista.
[20-40 s · pantalla del mòbil] Abans del partit, un minut per preparar-me i elegir un compromís. Durant, una pausa breu quan el partit m'activa. Després, com el vull rebre.
[40-50 s · imatge de grup] I la pinya de les famílies: un gest de compromís abans de cada partit.
[50-60 s · rètol] Sense registre i sense dades. Enllaç a la descripció.`,
          es: `[0-5 s · Tòfol a pie de campo] Los padres también juegan.
[5-20 s] Desde la grada lo vivimos mucho, y es normal. Pero nuestro hijo no debería cargar con nuestras emociones. Primero me acompaño a mí mismo, para poder acompañar mejor al deportista.
[20-40 s · pantalla del móvil] Antes del partido, un minuto para prepararme y elegir un compromiso. Durante, una pausa breve cuando el partido me activa. Después, cómo lo quiero recibir.
[40-50 s · imagen de grupo] Y la piña de las familias: un gesto de compromiso antes de cada partido.
[50-60 s · rótulo] Sin registro y sin datos. Enlace en la descripción.`
        }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "clubs",
      color: "#0d6e69",
      nom: { ca: "El meu club és un lloc emocionalment segur", es: "Mi club es un lugar emocionalmente seguro" },
      perAqui: { ca: "Directius i coordinadors de clubs esportius de base", es: "Directivos y coordinadores de clubes deportivos de base" },
      enllac: "https://aprens.net/clubs-esport-base.html",
      imatge: "img/novetats/clubs-esport-base.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "El meu club és un lloc emocionalment segur", x: "Proposta d'APRENS per a clubs esportius de base", img: "img/novetats/clubs-esport-base-gran.jpg" },
          { tipus: "llista", t: "El que s'aprèn a cada partit", items: ["Respecte", "Esforç", "Tolerància a la frustració", "Orientació a la tasca", "Cooperació i comunitat"] },
          { tipus: "text", t: "Salut i rendiment van junts", x: "Les mateixes habilitats que protegeixen l'esportista (una atenció més lliure, tornar després d'una errada, la motivació per aprendre) són les que sostenen el seu rendiment a llarg termini." },
          { tipus: "llista", t: "Què inclou", items: ["L'app «Els pares també juguen» amb l'espai del club", "Una guia de treball per a famílies, entrenadors i jugadors", "Cartells amb QR per a la grada i el vestidor", "Formació i acompanyament durant la temporada"] },
          { tipus: "tancament", t: "Comencem amb una prova", x: "Un pilot gratuït de quatre a sis setmanes amb un equip.", url: "aprens.net · Esport de base" }
        ],
        es: [
          { tipus: "portada", t: "Mi club es un lugar emocionalmente seguro", x: "Propuesta de APRENS para clubes deportivos de base", img: "img/novetats/clubs-esport-base-gran.jpg" },
          { tipus: "llista", t: "Lo que se aprende en cada partido", items: ["Respeto", "Esfuerzo", "Tolerancia a la frustración", "Orientación a la tarea", "Cooperación y comunidad"] },
          { tipus: "text", t: "Salud y rendimiento van juntos", x: "Las mismas habilidades que protegen al deportista (una atención más libre, volver después de un error, la motivación por aprender) son las que sostienen su rendimiento a largo plazo." },
          { tipus: "llista", t: "Qué incluye", items: ["La app «Los padres también juegan» con el espacio del club", "Una guía de trabajo para familias, entrenadores y jugadores", "Carteles con QR para la grada y el vestuario", "Formación y acompañamiento durante la temporada"] },
          { tipus: "tancament", t: "Empecemos con una prueba", x: "Un piloto gratuito de cuatro a seis semanas con un equipo.", url: "aprens.net · Deporte base" }
        ]
      },
      ig: {
        ca: `El meu club és un lloc emocionalment segur.

Per mi l'esport de base és un dels contextos on més es pot ajudar un nin o una nina a créixer. A cada entrenament i a cada partit s'aprenen coses que duren tota la vida: respecte, esforç, tolerància a la frustració, cooperació, comunitat.

Hem preparat una proposta per a clubs: l'app «Els pares també juguen» amb l'espai propi del club, una guia de treball per a famílies, entrenadors i jugadors, cartells amb QR i acompanyament durant la temporada.

Si sou d'un club i us agradaria fer-ne una primera experiència, en parlam. Enllaç a la bio.

#APRENS #esportdebase #clubs #futbolbase #Mallorca`,
        es: `Mi club es un lugar emocionalmente seguro.

Para mí el deporte base es uno de los contextos donde más se puede ayudar a un niño o a una niña a crecer. En cada entrenamiento y en cada partido se aprenden cosas que duran toda la vida: respeto, esfuerzo, tolerancia a la frustración, cooperación, comunidad.

Hemos preparado una propuesta para clubes: la app «Los padres también juegan» con el espacio propio del club, una guía de trabajo para familias, entrenadores y jugadores, carteles con QR y acompañamiento durante la temporada.

Si sois de un club y os gustaría hacer una primera experiencia, hablamos. Enlace en la bio.

#APRENS #deportebase #clubes #futbolbase #Mallorca`
      },
      fb: {
        ca: `El meu club és un lloc emocionalment segur.

Presentam una proposta d'APRENS per a clubs esportius de base, de futbol i d'altres disciplines, pensada perquè famílies, entrenadors i directius tenguin un paper actiu en l'educació dels nostres jugadors i jugadores.

Fa anys que faig feina amb esportistes joves, amb les seves famílies i amb els seus entrenadors, i la idea que ho travessa tot és que la salut esportiva no és incompatible amb el rendiment: les mateixes habilitats que protegeixen l'esportista són les que poden sostenir el seu rendiment a llarg termini.

La proposta inclou:
- L'app «Els pares també juguen», amb l'escut, els colors, el codi de conducta i el protocol de protecció de menors del club.
- Una guia de treball psicològic amb mòduls per a famílies, entrenadors, jugadors i club, i un pla de temporada.
- Cartells amb QR per a la grada i el vestidor, i els missatges de difusió a punt.
- Formació i acompanyament al llarg de la temporada.

Es pot començar amb un pilot gratuït de quatre a sis setmanes amb un equip. Si sou d'un club i us agradaria fer-ho amb nosaltres, o només en voleu saber més, en parlam amb molt de gust.

https://aprens.net/clubs-esport-base.html
APRENS Psicologia · Inca · 636 93 76 61 · info@aprens.es`,
        es: `Mi club es un lugar emocionalmente seguro.

Presentamos una propuesta de APRENS para clubes deportivos de base, de fútbol y de otras disciplinas, pensada para que familias, entrenadores y directivos tengan un papel activo en la educación de nuestros jugadores y jugadoras.

Hace años que trabajo con deportistas jóvenes, con sus familias y con sus entrenadores, y la idea que lo atraviesa todo es que la salud deportiva no es incompatible con el rendimiento: las mismas habilidades que protegen al deportista son las que pueden sostener su rendimiento a largo plazo.

La propuesta incluye:
- La app «Los padres también juegan», con el escudo, los colores, el código de conducta y el protocolo de protección de menores del club.
- Una guía de trabajo psicológico con módulos para familias, entrenadores, jugadores y club, y un plan de temporada.
- Carteles con QR para la grada y el vestuario, y los mensajes de difusión preparados.
- Formación y acompañamiento a lo largo de la temporada.

Se puede empezar con un piloto gratuito de cuatro a seis semanas con un equipo. Si sois de un club y os gustaría hacerlo con nosotros, o solo queréis saber más, hablamos con mucho gusto.

https://aprens.net/clubs-esport-base.html
APRENS Psicología · Inca · 636 93 76 61 · info@aprens.es`
      },
      yt: null
    },

    /* ------------------------------------------------------------------ */
    {
      id: "ais-aprens",
      color: "#3d69ab",
      nom: { ca: "App AIS APRENS", es: "App AIS APRENS" },
      perAqui: { ca: "Adults i adolescents que volen entrenar l'atenció cap endins", es: "Adultos y adolescentes que quieren entrenar la atención hacia dentro" },
      enllac: "https://apps.apple.com/es/app/ais-aprens/id6757331269",
      imatge: "img/novetats/ais-aprens-app.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "El mòbil també pot entrenar l'atenció", x: "AIS APRENS: Atenció Interna Sensorial", img: "img/novetats/ais-aprens-app.jpg" },
          { tipus: "text", t: "Prohibir no basta", x: "Si prohibeixes un mitjà, el converteixes en un desig. Proposam una altra cosa: fer servir el mateix mòbil per orientar-nos cap endins." },
          { tipus: "llista", t: "Què hi trobaràs", items: ["Respiració guiada i pràctiques breus d'AIS", "Recursos per baixar l'alerta", "Petites rutines de cada dia", "Per prevenir conductes evitatives i compulsives"] },
          { tipus: "cita", x: "Fer-te visible per dins, perquè el teu organisme se'n pugui fiar i baixar l'activació." },
          { tipus: "tancament", t: "AIS APRENS", x: "Disponible a l'App Store.", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "El móvil también puede entrenar la atención", x: "AIS APRENS: Atención Interna Sensorial", img: "img/novetats/ais-aprens-app.jpg" },
          { tipus: "text", t: "Prohibir no basta", x: "Si prohíbes un medio, lo conviertes en un deseo. Proponemos otra cosa: usar el mismo móvil para orientarnos hacia dentro." },
          { tipus: "llista", t: "Qué encontrarás", items: ["Respiración guiada y prácticas breves de AIS", "Recursos para bajar la alerta", "Pequeñas rutinas de cada día", "Para prevenir conductas evitativas y compulsivas"] },
          { tipus: "cita", x: "Hacerte visible por dentro, para que tu organismo se pueda fiar y bajar la activación." },
          { tipus: "tancament", t: "AIS APRENS", x: "Disponible en la App Store.", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `El mòbil també pot entrenar l'atenció.

Si prohibeixes un mitjà, el converteixes en un desig. Per això, més que lluitar contra el mòbil, proposam fer-lo servir per orientar-nos cap endins.

AIS APRENS és l'app d'Atenció Interna Sensorial: pràctiques breus de respiració i d'atenció al cos, recursos per baixar l'alerta i petites rutines de cada dia, pensades per prevenir conductes evitatives i compulsives.

Disponible a l'App Store. Enllaç a la bio.

#APRENS #AIS #atenció #regulacióemocional #salutmental #Mallorca`,
        es: `El móvil también puede entrenar la atención.

Si prohíbes un medio, lo conviertes en un deseo. Por eso, más que luchar contra el móvil, proponemos usarlo para orientarnos hacia dentro.

AIS APRENS es la app de Atención Interna Sensorial: prácticas breves de respiración y de atención al cuerpo, recursos para bajar la alerta y pequeñas rutinas de cada día, pensadas para prevenir conductas evitativas y compulsivas.

Disponible en la App Store. Enlace en la bio.

#APRENS #AIS #atención #regulaciónemocional #saludmental #Mallorca`
      },
      fb: {
        ca: `El mòbil també pot entrenar l'atenció.

Molta de gent em demana què pot fer amb l'ús del mòbil, propi o dels fills. Si prohibeixes un mitjà, el converteixes en un desig, i per això el que propòs és una altra cosa: fer servir el mateix telèfon per entrenar l'atenció cap endins.

AIS APRENS és l'app d'Atenció Interna Sensorial que faig servir amb els meus pacients, ara disponible a l'App Store. Hi trobareu pràctiques breus de respiració i d'atenció al cos, recursos per baixar l'alerta i petites rutines adaptatives de cada dia, pensades per prevenir conductes evitatives i compulsives.

La idea de fons és senzilla: fer-nos visibles per dins perquè el nostre organisme se'n pugui fiar, baixar l'activació i, a partir d'aquí, elegir millor com actuam.

App Store: https://apps.apple.com/es/app/ais-aprens/id6757331269
Versió web: https://aprens-app.aprens.net/`,
        es: `El móvil también puede entrenar la atención.

Mucha gente me pregunta qué puede hacer con el uso del móvil, propio o de sus hijos. Si prohíbes un medio, lo conviertes en un deseo, y por eso lo que propongo es otra cosa: usar el mismo teléfono para entrenar la atención hacia dentro.

AIS APRENS es la app de Atención Interna Sensorial que uso con mis pacientes, ahora disponible en la App Store. Encontraréis prácticas breves de respiración y de atención al cuerpo, recursos para bajar la alerta y pequeñas rutinas adaptativas de cada día, pensadas para prevenir conductas evitativas y compulsivas.

La idea de fondo es sencilla: hacernos visibles por dentro para que nuestro organismo se pueda fiar, bajar la activación y, a partir de ahí, elegir mejor cómo actuamos.

App Store: https://apps.apple.com/es/app/ais-aprens/id6757331269
Versión web: https://aprens-app.aprens.net/`
      },
      yt: {
        titol: { ca: "El mòbil també pot entrenar l'atenció · AIS APRENS", es: "El móvil también puede entrenar la atención · AIS APRENS" },
        desc: {
          ca: `AIS APRENS és l'app d'Atenció Interna Sensorial d'APRENS: respiració, atenció al cos i petites rutines per baixar l'alerta i prevenir conductes evitatives i compulsives.

App Store: https://apps.apple.com/es/app/ais-aprens/id6757331269
Versió web: https://aprens-app.aprens.net/

Tòfol Villalonga · APRENS Psicologia · Inca`,
          es: `AIS APRENS es la app de Atención Interna Sensorial de APRENS: respiración, atención al cuerpo y pequeñas rutinas para bajar la alerta y prevenir conductas evitativas y compulsivas.

App Store: https://apps.apple.com/es/app/ais-aprens/id6757331269
Versión web: https://aprens-app.aprens.net/

Tòfol Villalonga · APRENS Psicología · Inca`
        },
        guio: {
          ca: `[0-5 s] Si prohibeixes un mitjà, el converteixes en un desig.
[5-20 s · Tòfol a càmera] Per això, més que lluitar contra el mòbil, us propòs fer-lo servir per anar cap endins.
[20-45 s · pantalla de l'app] Una respiració guiada, una pràctica breu d'atenció al cos, un recurs per baixar l'alerta quan el cap s'accelera.
[45-60 s · rètol] AIS APRENS, a l'App Store. Enllaç a la descripció.`,
          es: `[0-5 s] Si prohíbes un medio, lo conviertes en un deseo.
[5-20 s · Tòfol a cámara] Por eso, más que luchar contra el móvil, os propongo usarlo para ir hacia dentro.
[20-45 s · pantalla de la app] Una respiración guiada, una práctica breve de atención al cuerpo, un recurso para bajar la alerta cuando la cabeza se acelera.
[45-60 s · rótulo] AIS APRENS, en la App Store. Enlace en la descripción.`
        }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "infants",
      color: "#a3500d",
      nom: { ca: "Racó de calma i Jocs AIS", es: "Rincón de calma y Juegos AIS" },
      perAqui: { ca: "Infants, famílies i mestres", es: "Niños, familias y maestros" },
      enllac: "https://aprens-app.aprens.net/rincon/",
      imatge: "img/eines/rincon.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Estar amb el que sent, jugant", x: "Racó de calma i Jocs AIS, per als més petits", img: "img/eines/rincon.jpg" },
          { tipus: "text", t: "No es tracta de calmar-los a la força", x: "Es tracta que aprenguin a notar el que senten i a quedar-s'hi una estona acompanyats, sense haver-ho d'eliminar." },
          { tipus: "llista", t: "Què hi ha", items: ["Jocs visuals i curts", "Respiració amb imatges", "Jocs per dur l'atenció cap endins", "Per fer junts, a casa o a l'aula"] },
          { tipus: "tancament", t: "Gratuït i des del navegador", x: "Sense registre ni instal·lació.", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "Estar con lo que siente, jugando", x: "Rincón de calma y Juegos AIS, para los más pequeños", img: "img/eines/rincon.jpg" },
          { tipus: "text", t: "No se trata de calmarlos a la fuerza", x: "Se trata de que aprendan a notar lo que sienten y a quedarse un rato acompañados, sin tener que eliminarlo." },
          { tipus: "llista", t: "Qué hay", items: ["Juegos visuales y cortos", "Respiración con imágenes", "Juegos para llevar la atención hacia dentro", "Para hacer juntos, en casa o en el aula"] },
          { tipus: "tancament", t: "Gratuito y desde el navegador", x: "Sin registro ni instalación.", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `Quan un nin està desbordat, la tendència és voler que es calmi ràpid. Però el que l'ajuda a regular-se de cada vegada millor és aprendre a notar el que sent i quedar-s'hi una estona acompanyat.

El Racó de calma i els Jocs AIS són jocs visuals i curts per practicar-ho, a casa o a l'aula, junts. Gratuïts, des del navegador i sense registre.

Enllaç a la bio.

#APRENS #criança #educacióemocional #infància #mestres #Mallorca`,
        es: `Cuando un niño está desbordado, la tendencia es querer que se calme rápido. Pero lo que le ayuda a regularse cada vez mejor es aprender a notar lo que siente y quedarse un rato acompañado.

El Rincón de calma y los Juegos AIS son juegos visuales y cortos para practicarlo, en casa o en el aula, juntos. Gratuitos, desde el navegador y sin registro.

Enlace en la bio.

#APRENS #crianza #educaciónemocional #infancia #maestros #Mallorca`
      },
      fb: {
        ca: `Racó de calma i Jocs AIS, per als més petits.

Quan un nin o una nina està desbordat, la tendència natural dels adults és voler que es calmi ràpid. El que observam a consulta és que el que l'ajuda a regular-se de cada vegada millor és una altra cosa: aprendre a notar el que sent, posar-hi atenció i quedar-s'hi una estona acompanyat, sense haver-ho d'eliminar.

Per practicar-ho hem preparat dues eines gratuïtes:
- Racó de calma: jocs visuals i curts perquè els infants practiquin estar amb el que senten.
- Jocs AIS: jocs breus per entrenar l'atenció cap endins, per a adults i per als més petits.

Funcionen des del navegador, sense registre, i són per fer junts, a casa o a l'aula.

Racó de calma: https://aprens-app.aprens.net/rincon/
Jocs AIS: https://aprens-app.aprens.net/tools-standalone/juegos-ais.html`,
        es: `Rincón de calma y Juegos AIS, para los más pequeños.

Cuando un niño o una niña está desbordado, la tendencia natural de los adultos es querer que se calme rápido. Lo que observamos en consulta es que lo que le ayuda a regularse cada vez mejor es otra cosa: aprender a notar lo que siente, ponerle atención y quedarse un rato acompañado, sin tener que eliminarlo.

Para practicarlo hemos preparado dos herramientas gratuitas:
- Rincón de calma: juegos visuales y cortos para que los niños practiquen estar con lo que sienten.
- Juegos AIS: juegos breves para entrenar la atención hacia dentro, para adultos y para los más pequeños.

Funcionan desde el navegador, sin registro, y son para hacer juntos, en casa o en el aula.

Rincón de calma: https://aprens-app.aprens.net/rincon/
Juegos AIS: https://aprens-app.aprens.net/tools-standalone/juegos-ais.html`
      },
      yt: null
    },

    /* ------------------------------------------------------------------ */
    {
      id: "histories",
      color: "#3d7a1a",
      nom: { ca: "La història del mono i La manada", es: "La historia del mono y La manada" },
      perAqui: { ca: "Tothom: per entendre la TEC en un minut", es: "Todo el mundo: para entender la TEC en un minuto" },
      enllac: "https://aprens-app.aprens.net/tools-standalone/historia-animada.html",
      imatge: "img/eines/historia-mono.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Qui condueix la teva vida?", x: "La història del mono, animada", img: "img/eines/historia-mono.jpg" },
          { tipus: "text", t: "Tots duim un mono dins", x: "La part de nosaltres que s'alerta, que vol fugir o controlar. No és l'enemic: és un mamífer que necessita sentir-se acompanyat." },
          { tipus: "text", t: "Un mamífer de manada", x: "Per això respiram amb atenció: l'AIS és la manera de no deixar el teu mono tot sol. Quan se sent acompanyat, baixa l'alerta." },
          { tipus: "tancament", t: "Dos contes d'un minut", x: "La història del mono i La manada, animades.", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "¿Quién conduce tu vida?", x: "La historia del mono, animada", img: "img/eines/historia-mono.jpg" },
          { tipus: "text", t: "Todos llevamos un mono dentro", x: "La parte de nosotros que se alerta, que quiere huir o controlar. No es el enemigo: es un mamífero que necesita sentirse acompañado." },
          { tipus: "text", t: "Un mamífero de manada", x: "Por eso respiramos con atención: la AIS es la manera de no dejar a tu mono solo. Cuando se siente acompañado, baja la alerta." },
          { tipus: "tancament", t: "Dos cuentos de un minuto", x: "La historia del mono y La manada, animadas.", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `Qui condueix la teva vida?

Tots duim un mono dins: la part que s'alerta, que vol fugir o controlar-ho tot. No és l'enemic. És un mamífer de manada, i el que necessita és sentir-se acompanyat.

Dos contes animats d'un minut per entendre-ho: La història del mono i La manada. Per mirar sols, en família o a l'aula.

Enllaç a la bio.

#APRENS #TEC #AIS #psicologia #educacióemocional`,
        es: `¿Quién conduce tu vida?

Todos llevamos un mono dentro: la parte que se alerta, que quiere huir o controlarlo todo. No es el enemigo. Es un mamífero de manada, y lo que necesita es sentirse acompañado.

Dos cuentos animados de un minuto para entenderlo: La historia del mono y La manada. Para ver solos, en familia o en el aula.

Enlace en la bio.

#APRENS #TEC #AIS #psicología #educaciónemocional`
      },
      fb: {
        ca: `Qui condueix la teva vida?

A consulta faig servir molt la imatge del mono: la part de nosaltres que s'alerta, que vol fugir, evitar o controlar-ho tot. No és l'enemic. És un mamífer de manada, i el que necessita per baixar l'alerta és sentir-se acompanyat. Per això respiram amb atenció: l'Atenció Interna Sensorial és la manera de no deixar-lo tot sol i d'aprendre a dur el volant acompanyant-lo.

Ho hem convertit en dos contes animats d'un minut, per mirar sols, en família o a l'aula:

La història del mono: https://aprens-app.aprens.net/tools-standalone/historia-animada.html
La manada: https://aprens-app.aprens.net/tools-standalone/historia-manada.html`,
        es: `¿Quién conduce tu vida?

En consulta uso mucho la imagen del mono: la parte de nosotros que se alerta, que quiere huir, evitar o controlarlo todo. No es el enemigo. Es un mamífero de manada, y lo que necesita para bajar la alerta es sentirse acompañado. Por eso respiramos con atención: la Atención Interna Sensorial es la manera de no dejarlo solo y de aprender a llevar el volante acompañándolo.

Lo hemos convertido en dos cuentos animados de un minuto, para ver solos, en familia o en el aula:

La historia del mono: https://aprens-app.aprens.net/tools-standalone/historia-animada.html
La manada: https://aprens-app.aprens.net/tools-standalone/historia-manada.html`
      },
      yt: {
        titol: { ca: "Qui condueix la teva vida? La història del mono (APRENS)", es: "¿Quién conduce tu vida? La historia del mono (APRENS)" },
        desc: {
          ca: `Un conte animat d'un minut sobre qui condueix la teva vida i com aprendre a dur el volant acompanyant el teu mono. De la Teoria de l'Efecte Conscient (TEC) de Tòfol Villalonga.

Versió interactiva: https://aprens-app.aprens.net/tools-standalone/historia-animada.html
La manada: https://aprens-app.aprens.net/tools-standalone/historia-manada.html

APRENS Psicologia · Inca`,
          es: `Un cuento animado de un minuto sobre quién conduce tu vida y cómo aprender a llevar el volante acompañando a tu mono. De la Teoría del Efecto Consciente (TEC) de Tòfol Villalonga.

Versión interactiva: https://aprens-app.aprens.net/tools-standalone/historia-animada.html
La manada: https://aprens-app.aprens.net/tools-standalone/historia-manada.html

APRENS Psicología · Inca`
        },
        guio: {
          ca: `Gravació de pantalla de l'animació (1 min), amb la veu de Tòfol al principi: «Aquest és el teu mono. No és l'enemic.» i al final: «Quan se sent acompanyat, baixa l'alerta.» Format vertical per a Shorts i Reels.`,
          es: `Grabación de pantalla de la animación (1 min), con la voz de Tòfol al principio: «Este es tu mono. No es el enemigo.» y al final: «Cuando se siente acompañado, baja la alerta.» Formato vertical para Shorts y Reels.`
        }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "escala",
      color: "#a3284f",
      nom: { ca: "L'escala: exposició pas a pas", es: "La escalera: exposición paso a paso" },
      perAqui: { ca: "Persones amb pors i evitacions, sempre amb el seu psicòleg", es: "Personas con miedos y evitaciones, siempre con su psicólogo" },
      enllac: "https://aprens-app.aprens.net/exposicion/",
      imatge: "img/eines/escalera.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Un esglaó cada vegada", x: "L'escala: exposició pas a pas", img: "img/eines/escalera.jpg" },
          { tipus: "text", t: "No es tracta d'aguantar la por", x: "Es tracta de fer el pas acompanyant-te per dins, de manera que el cos aprengui que pot estar-hi." },
          { tipus: "llista", t: "Com s'hi fa feina", items: ["Ordenar les situacions de menys a més", "Elegir el pas d'avui", "Notar l'activació abans i després", "Anotar què has après"] },
          { tipus: "tancament", t: "Per fer amb el teu psicòleg", x: "Una eina d'acompanyament a la teràpia.", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "Un escalón cada vez", x: "La escalera: exposición paso a paso", img: "img/eines/escalera.jpg" },
          { tipus: "text", t: "No se trata de aguantar el miedo", x: "Se trata de dar el paso acompañándote por dentro, de manera que el cuerpo aprenda que puede estar ahí." },
          { tipus: "llista", t: "Cómo se trabaja", items: ["Ordenar las situaciones de menos a más", "Elegir el paso de hoy", "Notar la activación antes y después", "Anotar qué has aprendido"] },
          { tipus: "tancament", t: "Para hacer con tu psicólogo", x: "Una herramienta de acompañamiento a la terapia.", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `Un esglaó cada vegada.

Quan una cosa ens fa por, la tendència és evitar-la, i de cada vegada el món es fa més petit. L'exposició no consisteix a aguantar la por, sinó a fer el pas acompanyant-te per dins, perquè el cos aprengui que hi pot estar.

L'escala és una eina d'APRENS per fer-ho pas a pas, sempre dins un procés amb el teu psicòleg.

#APRENS #ansietat #pors #psicologia #AIS`,
        es: `Un escalón cada vez.

Cuando algo nos da miedo, la tendencia es evitarlo, y cada vez el mundo se hace más pequeño. La exposición no consiste en aguantar el miedo, sino en dar el paso acompañándote por dentro, para que el cuerpo aprenda que puede estar ahí.

La escalera es una herramienta de APRENS para hacerlo paso a paso, siempre dentro de un proceso con tu psicólogo.

#APRENS #ansiedad #miedos #psicología #AIS`
      },
      fb: {
        ca: `Un esglaó cada vegada.

Quan una situació ens fa por, la tendència natural és evitar-la. A curt termini alleuja, però a mesura que passa el temps l'evitació fa el món de cada vegada més petit. L'exposició gradual és una de les eines amb més evidència per afrontar-ho, i per mi la clau és la manera de fer-la: no es tracta d'aguantar la por, sinó de fer el pas acompanyant-te per dins, de manera que l'organisme aprengui que hi pot estar.

L'escala és una eina d'APRENS per acompanyar aquest procés: ordenar les situacions de menys a més, elegir el pas d'avui, notar l'activació abans i després i anotar el que s'ha après. Està pensada per fer-la servir dins un procés de teràpia, amb el vostre psicòleg o psicòloga.

https://aprens-app.aprens.net/exposicion/`,
        es: `Un escalón cada vez.

Cuando una situación nos da miedo, la tendencia natural es evitarla. A corto plazo alivia, pero a medida que pasa el tiempo la evitación hace el mundo cada vez más pequeño. La exposición gradual es una de las herramientas con más evidencia para afrontarlo, y para mí la clave es la manera de hacerla: no se trata de aguantar el miedo, sino de dar el paso acompañándote por dentro, de manera que el organismo aprenda que puede estar ahí.

La escalera es una herramienta de APRENS para acompañar este proceso: ordenar las situaciones de menos a más, elegir el paso de hoy, notar la activación antes y después y anotar lo aprendido. Está pensada para usarla dentro de un proceso de terapia, con vuestro psicólogo o psicóloga.

https://aprens-app.aprens.net/exposicion/`
      },
      yt: null
    },

    /* ------------------------------------------------------------------ */
    {
      id: "rendiment",
      color: "#3d69ab",
      nom: { ca: "Esport: atenció i rendiment", es: "Deporte: atención y rendimiento" },
      perAqui: { ca: "Esportistes, entrenadors i famílies", es: "Deportistas, entrenadores y familias" },
      enllac: "https://aprens.net/descarregues/APRENS-piramide-rendiment.pdf",
      imatge: "img/novetats/piramide-rendiment.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "On s'enfoca el cos durant la competició?", x: "La piràmide del rendiment", img: "img/novetats/piramide-rendiment.jpg", contain: true },
          { tipus: "text", t: "Mestria o ego", x: "Quan l'atenció va a la tasca, l'esportista té més control, regula millor l'errada i manté la motivació. Quan va al resultat i a la mirada dels altres, el cos s'alerta." },
          { tipus: "llista", t: "Com s'entrena", items: ["Distingir atenció externa i interna", "Una paraula clau i un gest per tornar a la jugada", "Aprendre de l'errada sense quedar-s'hi", "Competir des de l'amor pel que fas, no des del fuet"] },
          { tipus: "tancament", t: "Guies gratuïtes en PDF", x: "La piràmide del rendiment · Atenció i maneig emocional a l'esport · Pedala des de dins", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "¿Dónde se enfoca el cuerpo durante la competición?", x: "La pirámide del rendimiento", img: "img/novetats/piramide-rendiment.jpg", contain: true },
          { tipus: "text", t: "Maestría o ego", x: "Cuando la atención va a la tarea, el deportista tiene más control, regula mejor el error y mantiene la motivación. Cuando va al resultado y a la mirada de los demás, el cuerpo se alerta." },
          { tipus: "llista", t: "Cómo se entrena", items: ["Distinguir atención externa e interna", "Una palabra clave y un gesto para volver a la jugada", "Aprender del error sin quedarse en él", "Competir desde el amor por lo que haces, no desde el látigo"] },
          { tipus: "tancament", t: "Guías gratuitas en PDF", x: "La pirámide del rendimiento · Atención y manejo emocional en el deporte · Pedalea desde dentro", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `On s'enfoca el cos de l'esportista durant la competició?

Quan l'atenció va a la tasca, hi ha més control, l'errada es regula millor i la motivació es manté. Quan va al resultat i a la mirada dels altres, el cos s'alerta i el rendiment se'n ressent.

A aprens.net hi trobareu, gratuïtes, La piràmide del rendiment i Atenció i maneig emocional a l'esport, i per als ciclistes, Pedala des de dins.

#APRENS #psicologiadelesport #rendiment #atenció #ciclisme #futbol`,
        es: `¿Dónde se enfoca el cuerpo del deportista durante la competición?

Cuando la atención va a la tarea, hay más control, el error se regula mejor y la motivación se mantiene. Cuando va al resultado y a la mirada de los demás, el cuerpo se alerta y el rendimiento se resiente.

En aprens.net encontraréis, gratuitas, La pirámide del rendimiento y Atención y manejo emocional en el deporte, y para los ciclistas, Pedalea desde dentro.

#APRENS #psicologíadeldeporte #rendimiento #atención #ciclismo #fútbol`
      },
      fb: {
        ca: `Atenció i rendiment a l'esport.

Fa anys que faig feina amb esportistes, i una de les coses que més es repeteixen és que el cos decideix on es fixa durant el joc. Quan l'atenció està orientada a la mestria, a la tasca, l'esportista té més control, regula millor l'errada i manté la motivació. Quan està orientada a l'ego, al resultat i a la mirada dels altres, el cos s'alerta i el rendiment se'n ressent.

Ho hem recollit en materials gratuïts:
- La piràmide del rendiment: https://aprens.net/descarregues/APRENS-piramide-rendiment.pdf
- Atenció i maneig emocional a l'esport (exercicis, paraules clau i gests per tornar a la jugada): https://aprens.net/descarregues/APRENS-atencio-maneig-emocional-esport.pdf
- Pedala des de dins, per al ciclisme de competició des de la tasca i l'amor per la bici, no des del fuet: https://aprens-app.aprens.net/tools-standalone/pedalea_desde_dentro_aprens.html`,
        es: `Atención y rendimiento en el deporte.

Hace años que trabajo con deportistas, y una de las cosas que más se repiten es que el cuerpo decide dónde se fija durante el juego. Cuando la atención está orientada a la maestría, a la tarea, el deportista tiene más control, regula mejor el error y mantiene la motivación. Cuando está orientada al ego, al resultado y a la mirada de los demás, el cuerpo se alerta y el rendimiento se resiente.

Lo hemos recogido en materiales gratuitos (en catalán):
- La pirámide del rendimiento: https://aprens.net/descarregues/APRENS-piramide-rendiment.pdf
- Atención y manejo emocional en el deporte (ejercicios, palabras clave y gestos para volver a la jugada): https://aprens.net/descarregues/APRENS-atencio-maneig-emocional-esport.pdf
- Pedalea desde dentro, para el ciclismo de competición desde la tarea y el amor por la bici, no desde el látigo: https://aprens-app.aprens.net/tools-standalone/pedalea_desde_dentro_aprens.html`
      },
      yt: null
    },

    /* ------------------------------------------------------------------ */
    {
      id: "families",
      color: "#3d7a1a",
      nom: { ca: "Guies per a famílies", es: "Guías para familias" },
      perAqui: { ca: "Pares i mares d'infants i adolescents", es: "Padres y madres de niños y adolescentes" },
      enllac: "https://aprens.net/descarregues/APRENS-guia-pares-fills-adolescents.pdf",
      imatge: "img/novetats/guia-pares-fills-adolescents.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Per què no canvia, si ja ho entén?", x: "Guies d'APRENS per a pares i mares", img: "img/novetats/guia-pares-fills-adolescents.jpg" },
          { tipus: "text", t: "Entendre no és aprendre", x: "Els fills poden saber perfectament què han de fer i no fer-ho. Aprendre una conducta nova demana repetició, temps i un adult que acompanyi." },
          { tipus: "cita", x: "Conseqüents amb el que volem ensenyar i compassius amb el que costa aprendre." },
          { tipus: "tancament", t: "Dues guies gratuïtes", x: "Maneig emocional per a pares i mares · Guia per a pares de fills adolescents", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "¿Por qué no cambia, si ya lo entiende?", x: "Guías de APRENS para padres y madres", img: "img/novetats/guia-pares-fills-adolescents.jpg" },
          { tipus: "text", t: "Entender no es aprender", x: "Los hijos pueden saber perfectamente qué tienen que hacer y no hacerlo. Aprender una conducta nueva pide repetición, tiempo y un adulto que acompañe." },
          { tipus: "cita", x: "Consecuentes con lo que queremos enseñar y compasivos con lo que cuesta aprender." },
          { tipus: "tancament", t: "Dos guías gratuitas", x: "Manejo emocional para padres y madres · Guía para padres de hijos adolescentes", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `Per què no canvia, si ja ho entén?

Molts de pares i mares m'ho demanen a consulta. Entendre no és aprendre: una conducta nova demana repetició, temps i un adult que acompanyi des de la calma.

Conseqüents amb el que volem ensenyar i compassius amb el que costa aprendre.

Dues guies gratuïtes en PDF a aprens.net: Maneig emocional per a pares i mares i Guia per a pares de fills adolescents.

#APRENS #criança #adolescència #famílies #educacióemocional`,
        es: `¿Por qué no cambia, si ya lo entiende?

Muchos padres y madres me lo preguntan en consulta. Entender no es aprender: una conducta nueva pide repetición, tiempo y un adulto que acompañe desde la calma.

Consecuentes con lo que queremos enseñar y compasivos con lo que cuesta aprender.

Dos guías gratuitas en PDF en aprens.net: Manejo emocional para padres y madres y Guía para padres de hijos adolescentes.

#APRENS #crianza #adolescencia #familias #educaciónemocional`
      },
      fb: {
        ca: `Per què el fill no canvia, si ja ho entén?

És una de les preguntes que més em fan els pares i mares a consulta. Els fills poden saber perfectament què han de fer i no fer-ho, perquè entendre no és aprendre: una conducta nova demana repetició, temps i un adult que acompanyi des de la calma, conseqüent amb el que vol ensenyar i compassiu amb el que costa aprendre.

He revisat dues xerrades i les he deixades en PDF, gratuïtes:
- Maneig emocional per a pares i mares: https://aprens.net/descarregues/APRENS-manejo-emocional-padres.pdf
- Guia per a pares de fills adolescents: https://aprens.net/descarregues/APRENS-guia-pares-fills-adolescents.pdf

Esper que us siguin útils en el dia a dia.`,
        es: `¿Por qué mi hijo no cambia, si ya lo entiende?

Es una de las preguntas que más me hacen los padres y madres en consulta. Los hijos pueden saber perfectamente qué tienen que hacer y no hacerlo, porque entender no es aprender: una conducta nueva pide repetición, tiempo y un adulto que acompañe desde la calma, consecuente con lo que quiere enseñar y compasivo con lo que cuesta aprender.

He revisado dos charlas y las he dejado en PDF, gratuitas:
- Manejo emocional para padres y madres: https://aprens.net/descarregues/APRENS-manejo-emocional-padres.pdf
- Guía para padres de hijos adolescentes: https://aprens.net/descarregues/APRENS-guia-pares-fills-adolescents.pdf

Espero que os sean útiles en el día a día.`
      },
      yt: null
    },

    /* ------------------------------------------------------------------ */
    {
      id: "llibres",
      color: "#6d5aa8",
      nom: { ca: "Llibres", es: "Libros" },
      perAqui: { ca: "Lectors interessats en la consciència, la criança i la psicologia", es: "Lectores interesados en la conciencia, la crianza y la psicología" },
      enllac: "https://www.amazon.es/stores/T%C3%B2fol-Villalonga/author/B0DWLHLD2V",
      imatge: "img/llibre-lidera-la-teva-monea.jpg",
      slides: {
        ca: [
          { tipus: "portada", t: "Crece, cría y trasciende desde dentro", x: "La col·lecció de llibres de Tòfol Villalonga", img: "img/llibre-lidera-la-teva-monea.jpg", contain: true },
          { tipus: "llista", t: "La col·lecció", items: ["Lidera la teva mon(e)a: reduir el sobrepensament i liderar l'atenció", "Cría desde dentro: criança conscient des de l'amor", "Trasciende desde dentro: la consciència que accepta i transforma", "Teoría del Efecto Consciente: l'atenció com a vector causal"] },
          { tipus: "tancament", t: "Disponibles a Amazon", x: "En paper i en format digital.", url: "aprens.net" }
        ],
        es: [
          { tipus: "portada", t: "Crece, cría y trasciende desde dentro", x: "La colección de libros de Tòfol Villalonga", img: "img/llibre-lidera-tu-monea.jpg", contain: true },
          { tipus: "llista", t: "La colección", items: ["Lidera tu mon(e)a: reducir el sobrepensamiento y liderar la atención", "Cría desde dentro: crianza consciente desde el amor", "Trasciende desde dentro: la conciencia que acepta y transforma", "Teoría del Efecto Consciente: la atención como vector causal"] },
          { tipus: "tancament", t: "Disponibles en Amazon", x: "En papel y en formato digital.", url: "aprens.net" }
        ]
      },
      ig: {
        ca: `La col·lecció «Crece, cría y trasciende desde dentro» és per mi una manera de posar per escrit el que he après amb tots aquests anys de feina amb els meus pacients.

Lidera la teva mon(e)a, Cría desde dentro, Trasciende desde dentro i la Teoría del Efecto Consciente, el metamodel que ho lliga tot.

Disponibles a Amazon. Enllaç a la bio.

#APRENS #llibres #TEC #consciència #criança`,
        es: `La colección «Crece, cría y trasciende desde dentro» es para mí una manera de poner por escrito lo que he aprendido en todos estos años de trabajo con mis pacientes.

Lidera tu mon(e)a, Cría desde dentro, Trasciende desde dentro y la Teoría del Efecto Consciente, el metamodelo que lo une todo.

Disponibles en Amazon. Enlace en la bio.

#APRENS #libros #TEC #conciencia #crianza`
      },
      fb: {
        ca: `La col·lecció «Crece, cría y trasciende desde dentro».

La Teoria de l'Efecte Conscient és per mi una manera de donar sentit a tot el que he après amb tots aquests anys que fa que faig feina amb els meus pacients, i de fer-ho accessible a molta de gent. Els llibres de la col·lecció en són l'aplicació a diferents moments de la vida:

- Lidera la teva mon(e)a (també en castellà): estratègies pràctiques per reduir el sobrepensament, liderar l'atenció i millorar les relacions.
- Cría desde dentro: criança conscient des de l'amor.
- Trasciende desde dentro: la consciència que accepta, transforma i transcendeix.
- Teoría del Efecto Consciente (TEC): l'atenció com a vector causal, un metamodel per a la psicologia clínica.

https://www.amazon.es/stores/T%C3%B2fol-Villalonga/author/B0DWLHLD2V`,
        es: `La colección «Crece, cría y trasciende desde dentro».

La Teoría del Efecto Consciente es para mí una manera de dar sentido a todo lo que he aprendido en todos estos años de trabajo con mis pacientes, y de hacerlo accesible a mucha gente. Los libros de la colección son su aplicación a distintos momentos de la vida:

- Lidera tu mon(e)a (también en catalán): estrategias prácticas para reducir el sobrepensamiento, liderar la atención y mejorar las relaciones.
- Cría desde dentro: crianza consciente desde el amor.
- Trasciende desde dentro: la conciencia que acepta, transforma y trasciende.
- Teoría del Efecto Consciente (TEC): la atención como vector causal, un metamodelo para la psicología clínica.

https://www.amazon.es/stores/T%C3%B2fol-Villalonga/author/B0DWLHLD2V`
      },
      yt: null
    }
  ],

  /* Vídeos que ja existeixen i es poden pujar a YouTube tal qual (en castellà). */
  videos: [
    { titol: "La Teoría del Efecto Consciente (TEC) explicada", fitxer: "https://aprens-app.netlify.app/assets/video/video-tec.mp4", poster: "img/videos/tec.jpg",
      desc: "La Teoría del Efecto Consciente (TEC) es una manera de dar un lenguaje común a muchas orientaciones psicológicas que, por caminos distintos, llegan a un mismo punto: hacernos visibles por dentro para que nuestro organismo se pueda fiar, bajar la activación y la alerta y cambiar la manera de percibir a los demás y al mundo." },
    { titol: "El sobrepensamiento: por qué no podemos parar de pensar", fitxer: "https://aprens-app.netlify.app/assets/video/video-sobrepensamiento.mp4", poster: "img/videos/sobrepensamiento.jpg",
      desc: "Cuando el organismo está en alerta, la mente intenta resolverlo pensando, y cuanto más pensamos más alerta. Qué es el sobrepensamiento desde la TEC y cómo la Atención Interna Sensorial nos ayuda a volver al presente." },
    { titol: "Cómo funciona tu cerebro cuando te alertas", fitxer: "https://aprens-app.netlify.app/assets/video/video-cerebro.mp4", poster: "img/videos/cerebro.jpg",
      desc: "Una explicación sencilla de qué pasa en el cerebro y en el cuerpo cuando nos alertamos, y por qué acompañarnos por dentro ayuda a bajar la activación." },
    { titol: "Respirar es aparecer", fitxer: "https://aprens-app.netlify.app/assets/video/video-respirar.mp4", poster: "img/videos/respirar.jpg",
      desc: "Respirar con atención no es solo relajarse: es aparecer para uno mismo, hacerse visible por dentro para que el organismo se sienta acompañado." },
    { titol: "Sentir conscientemente", fitxer: "https://aprens-app.netlify.app/assets/video/video-sentir.mp4", poster: "img/videos/sentir.jpg",
      desc: "Sentir con consciencia es poder estar con lo que pasa dentro sin tener que eliminarlo, para después elegir cómo actuar." }
  ],

  /* Calendari orientatiu: 3 publicacions per setmana durant 6 setmanes. */
  calendari: [
    { setmana: 1, items: [["explica-ho", "carrusel"], ["explica-ho", "short"], ["pares-juguen", "carrusel"]] },
    { setmana: 2, items: [["pares-juguen", "short"], ["clubs", "fb"], ["video:0", "youtube"]] },
    { setmana: 3, items: [["ais-aprens", "carrusel"], ["histories", "short"], ["explica-ho", "fb"]] },
    { setmana: 4, items: [["families", "carrusel"], ["video:1", "youtube"], ["pares-juguen", "fb"]] },
    { setmana: 5, items: [["infants", "carrusel"], ["rendiment", "carrusel"], ["video:3", "youtube"]] },
    { setmana: 6, items: [["escala", "carrusel"], ["llibres", "carrusel"], ["video:4", "youtube"]] }
  ]
};
