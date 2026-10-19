/* APRENS · Comprension — «¿Lo he entendido?» tras un vídeo o una lectura
   ------------------------------------------------------------
   Comprobación formativa de la psicoeducación (no es un examen ni un
   instrumento de evaluación): 5 preguntas clave por pieza, cada respuesta
   con su explicación en la línea TEC, una pregunta de seguridad («¿cuánto
   crees que lo entiendes?») y un «explícalo con tus palabras» opcional que
   se comenta en sesión. Sin nota de aprobado: muestra qué ideas están
   claras y cuáles conviene repasar.

   Uso:
     Comprension.mount(caja, { id:'tec', prev:{...}, onDone:function(r){} });
       r = { f:'AAAA-MM-DD', ok:4, n:5, rep:[2], conf:3, txt:'...' }
     Comprension.tiene(id) → true si hay preguntas para esa pieza
     Comprension.titulo(id)
*/
(function (global) {
  'use strict';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* Preguntas: p = pregunta, o = opciones, c = índice correcto,
     x = explicación (se muestra siempre, aciertes o no), r = idea a repasar. */
  var Q = {
    /* Lecturas (hub y Laboratorio TEC) */
    "porque": {t:"¿Para qué sirven estos ejercicios?", ayuda:"Estos ejercicios sirven para…", q:[
      {"p":"Verdadero o falso: estos ejercicios sirven, sobre todo, para entenderte mejor y saber por qué eres como eres.","o":["Verdadero","Falso"],"c":1,"x":"Comprenderte es importante, pero no basta: el trabajo busca una nueva relación contigo, estar con lo que sientes desde el cuerpo.","r":"Una nueva relación contigo, no solo entenderte"},
      {"p":"Cuando llevas tu atención a lo que siente tu cuerpo, ¿para qué lo haces?","o":["Para quitar la sensación cuanto antes","Para tranquilizarla y que deje de molestar","Para estar con ella, sin quitarla ni calmarla"],"c":2,"x":"No es para quitarla, calmarla ni siquiera entenderla: es para estar con ella. Que te salga querer quitarla es muy humano.","r":"Estar con la sensación, no quitarla"},
      {"p":"Estás en el sofá y aparece una sensación de vacío en el pecho. Según lo aprendido, ¿qué te dirías?","o":["«No necesito que estés bien para estar contigo»","«Primero tengo que averiguar por qué me pasa esto»","«Necesito que esto se vaya para poder estar bien»"],"c":0,"x":"Es una forma de decirle a tu cuerpo, sin palabras, que estás ahí también cuando duele. No hace falta entenderlo para acompañarlo.","r":"Estoy aquí también cuando duele"},
      {"p":"¿Cómo llega el cambio, según este apartado?","o":["El día que por fin lo entiendes todo","Por repetición: tu cuerpo comprueba una y otra vez que no lo abandonas","Cuando consigues dejar de sentir miedo"],"c":1,"x":"No ocurre porque un día lo entiendas, sino por repetición: poco a poco el cuerpo empieza a confiar en ti.","r":"El cambio llega por repetición"},
      {"p":"Llevas unos días practicando y piensas: «Esto ya lo he entendido, no hace falta seguir». ¿Qué dice lo aprendido?","o":["Que tienes razón: entenderlo es lo principal","Que mejor guardarlo para cuando estés mal","Que la terapia es un entrenamiento: la atención se fortalece cada vez que la pones"],"c":2,"x":"La atención funciona como un músculo: se fortalece cada vez que la pones, no desde la razón sino sintiendo conscientemente.","r":"La atención se entrena como un músculo"}
    ]},
    "quien_conduce": {t:"¿Quién conduce tu vida?", ayuda:"En la historia, el mono es… y yo soy…", q:[
      {"p":"En la metáfora, ¿quién es el mono?","o":["Tu parte «mala», la que tienes que vencer","Tus pensamientos y preocupaciones","Tu parte más animal: tu cuerpo, tu niño/a interior, lo que siente y reacciona antes de que te des cuenta"],"c":2,"x":"El mono es tu parte mamífera que siente, y guarda vivencias que en su día no pudiste acompañar. No es un enemigo: es alguien a quien acompañar.","r":"El mono es tu cuerpo, tu niño interior"},
      {"p":"Verdadero o falso: amar al mono significa hacerle caso y dejar que decida por ti.","o":["Verdadero","Falso"],"c":1,"x":"Amar al mono no es obedecerlo: es acompañarlo. Puedes escucharlo y mirarlo mientras el volante sigue en tus manos.","r":"Amar al mono es acompañarlo, no obedecerlo"},
      {"p":"Tras un día duro, pasas la noche con el móvil para no notar nada. ¿Dónde está el mono?","o":["En el maletero","Al volante","Sentado a tu lado"],"c":0,"x":"Taparlo con móvil, trabajo o comida es meterlo en el maletero. Tiene sentido que lo hagas, pero lo que escondes no desaparece: solo espera.","r":"Lo que escondes no desaparece: espera"},
      {"p":"Notas miedo antes de una reunión y te riñes: «¡Cálmate ya, no seas así!». Según la historia, ¿qué suele pasar?","o":["Que el miedo se calma porque te has puesto firme","Que cuanto más lo persigues, más corre","Que desaparece si lo repites varias veces"],"c":1,"x":"Exigirte calma es perseguir al mono para vencerlo, y el miedo no se calma a gritos. Es un intento comprensible, pero lo aviva.","r":"El miedo no se calma a gritos"},
      {"p":"Al final de la historia, ¿qué necesitaba de verdad el mono?","o":["Que lo dejaras conducir un rato","Que nadie se fijara en él","Saber que no iba solo"],"c":2,"x":"«El mono nunca quiso conducir. Solo necesitaba saber que no iba solo.» Sentarlo a tu lado es la forma de dárselo.","r":"El mono necesita saber que no va solo"}
    ]},
    "la_manada": {t:"La manada: por qué respiras", ayuda:"Respiro conscientemente porque mi mono…", q:[
      {"p":"Verdadero o falso: la respiración consciente sirve, sobre todo, para relajarte.","o":["Verdadero","Falso"],"c":1,"x":"Respirar no es relajarte: es volver a aparecer para tu mono. Si llega la calma, bienvenida, pero no es lo que buscas.","r":"Respirar no es relajarte: es aparecer"},
      {"p":"Cuando sales de la manada (trabajo, mil tareas, autonomía), tu mono se pone en alerta. ¿Por qué?","o":["Porque se ha quedado sin manada a la vista y lo interpreta como un riesgo","Porque el mundo es de verdad tan peligroso como parece","Porque algo va mal en tu cuerpo"],"c":0,"x":"Tus sistemas de apego evolucionaron para vivir cerca de los tuyos. No es que el mundo sea peligroso: es que tu mono se ha quedado sin manada a la vista.","r":"Sin manada a la vista, el mono se alarma"},
      {"p":"Tú, como conciencia, vas siempre con tu mono. Entonces, ¿por qué hace falta respirar?","o":["Porque la respiración aporta oxígeno y eso calma","Porque para él eres invisible: necesita poder percibirte","Porque así puedes controlar lo que siente"],"c":1,"x":"Tu mono no puede verte, olerte, oírte ni tocarte. La respiración atenta es la señal con la que empieza a notarte.","r":"Tu mono necesita percibirte, no solo tenerte"},
      {"p":"Llevas días practicando y el miedo sigue apareciendo. ¿Qué te dirías según lo aprendido?","o":["«No funciona: a estas alturas debería sentir menos»","«Tengo que respirar más fuerte hasta que se vaya»","«No practico para sentir menos: practico para que mi mono aprenda que siempre aparezco»"],"c":2,"x":"El mono no necesita que desaparezca el miedo; necesita notar que alguien permanece cuando lo tiene. Que siga apareciendo no significa que lo hagas mal.","r":"No practicas para sentir menos"},
      {"p":"Cuando tu mono confía en ti, ¿cómo cambian tus vínculos con los demás?","o":["Necesitas tener a los tuyos siempre cerca para sentirte a salvo","Puedes tener vínculos sanos: te importan, pero no necesitas que estén siempre a tu lado","Dejan de importarte, porque ya te bastas"],"c":1,"x":"Con apego seguro contigo sales acompañado a todas partes. Los demás siguen importando, pero ya no dependes de su presencia para sentirte a salvo.","r":"Apego seguro contigo: salir acompañado"}
    ]},
    "modelo_atencional": {t:"El control y la presencia", ayuda:"Cuando busco el control dándole vueltas, lo que pasa es…", q:[
      {"p":"Verdadero o falso: según el mapa, el problema es el dolor o el malestar en sí.","o":["Verdadero","Falso"],"c":1,"x":"El dolor no es el problema. El problema es buscar el control sin espacio ni tiempo, con un sobrepensamiento que alivia un momento y refuerza el malestar.","r":"El problema es buscar control sin espacio-tiempo"},
      {"p":"Comprobar, evitar o distraerte te da alivio. ¿Por qué la próxima vez pesa más?","o":["Porque el alivio enseña que huir o controlar «funciona», y eso se refuerza","Porque no lo hiciste suficientes veces","Porque el malestar era más grave de lo que parecía"],"c":0,"x":"El alivio inmediato refuerza la huida. Es lógico que lo busques; el mapa solo te muestra por qué a la larga te atrapa.","r":"El alivio inmediato refuerza la huida"},
      {"p":"Te asalta una preocupación y empiezas a darle vueltas para dar con la respuesta. ¿Qué propone el camino 2?","o":["Seguir pensando hasta encontrar la solución","Distraerte con otra cosa hasta que pase","Parar y llevar la atención al cuerpo con compasión, sin intentar cambiar lo que notas"],"c":2,"x":"La salida no es controlar más, sino la parada: la «flecha atencional» que lleva la atención al cuello, el pecho o la barriga.","r":"Parar: la flecha atencional hacia el cuerpo"},
      {"p":"En el camino 2, ¿para qué llevas la atención al cuerpo?","o":["Para que el malestar se vaya antes","No para que se vaya, sino para no dejarlo solo","Para controlarlo mejor la próxima vez"],"c":1,"x":"Llevas la atención al cuerpo con presencia: no para que el malestar se vaya, sino para no dejarlo solo. Eso es lo que entrenas con el AIS.","r":"No para que se vaya: para no dejarlo solo"},
      {"p":"Al parar y atender al cuerpo, ¿qué se abre?","o":["Un espacio y un tiempo donde puedes elegir y actuar según tus valores","La certeza de que no volverá a pasar","La explicación de por qué te ocurre"],"c":0,"x":"Se abre un espacio-tiempo donde tus valores toman el volante y puedes actuar de forma asertiva, fiel a lo que te importa.","r":"Un espacio para elegir desde tus valores"}
    ]},
    "lab-vector": {t:"El vector atencional", ayuda:"Lo que cambia las cosas no es cuánta atención pongo, sino…", q:[
      {"p":"Verdadero o falso: para estar mejor, lo importante es prestar más atención.","o":["Verdadero","Falso"],"c":1,"x":"Decir «presta más atención» no basta. La atención es un vector: lo que cuenta es su dirección (fuera o dentro) y su cualidad, no la cantidad.","r":"Importan la dirección y la cualidad"},
      {"p":"Cuando tu atención está capturada hacia fuera (amenaza, juicio, futuro), ¿qué respuestas quedan disponibles?","o":["Observar y elegir","Lucha, huida o bloqueo","Ninguna: te quedas en calma"],"c":1,"x":"Con el vector capturado por la amenaza, el cuerpo responde a lo imaginado como si estuviera pasando. Es biología, no un fallo tuyo.","r":"Hacia fuera: lucha, huida o bloqueo"},
      {"p":"Notas un pinchazo y empiezas a escanear el cuerpo para comprobar si algo va mal. ¿Qué está pasando?","o":["Es hipervigilancia: miras hacia dentro, pero vigilando, y la señal gana valor de amenaza","Es presencia: ya estás mirando hacia dentro","Es lo ideal para quedarte tranquilo/a"],"c":0,"x":"Misma dirección, distinta función: escanear y comprobar hace que la sensación pese más. Lo que buscas es mirar hacia dentro de forma receptiva.","r":"Hacia dentro vigilando es hipervigilancia"},
      {"p":"Verdadero o falso: si llevas la atención hacia dentro, ya estás haciendo AIS, la hagas como la hagas.","o":["Verdadero","Falso"],"c":1,"x":"La dirección es necesaria, pero no suficiente: el AIS es mirar hacia dentro de forma receptiva y no contingente, sin buscar alivio ni certeza.","r":"El AIS es dentro y receptivo"},
      {"p":"Con la atención hacia dentro y receptiva, ¿qué propone la TEC que ocurre?","o":["Que la sensación desaparece del todo","Que aumenta el ruido interno","Que la señal pierde fuerza de amenaza y aparece espacio para elegir"],"c":2,"x":"Con presencia se abre la pregunta «¿cuál es el siguiente paso con valor?». La sensación puede seguir ahí; lo que cambia es lo que puedes hacer con ella.","r":"Presencia: observar y elegir"}
    ]},
    "lab-cadena": {t:"La cadena que mantiene el malestar", ayuda:"El malestar se mantiene porque…", q:[
      {"p":"Verdadero o falso: darle vueltas a las cosas (sobrepensar) es un rasgo de tu forma de ser que no se puede cambiar.","o":["Verdadero","Falso"],"c":1,"x":"El sobrepensamiento es una conducta mantenida por el alivio que da, no un rasgo. Por eso se puede entrenar otra cosa en su lugar.","r":"Sobrepensar es una conducta, no un rasgo"},
      {"p":"¿Qué eslabón hace que la cadena se repita una y otra vez?","o":["La activación corporal en sí","El alivio inmediato de evitar, que refuerza la evitación","El primer pensamiento que aparece"],"c":1,"x":"La evitación «funcionó» a corto plazo, y por eso se repite. No es un fallo tuyo: intervenir es romper ese eslabón del alivio.","r":"El alivio inmediato refuerza la evitación"},
      {"p":"En la ruta AIS, ¿dónde se interviene?","o":["En el punto exacto donde la sensación se convierte en discurso","Antes, impidiendo que aparezca el pensamiento temido","Al final, cuando ya ha pasado todo"],"c":0,"x":"El AIS no exige que el disparador deje de aparecer: interviene en la activación corporal, justo antes de que se convierta en vueltas y explicaciones.","r":"Intervenir donde la sensación se vuelve discurso"},
      {"p":"Tras el STOP, el anclaje y la frase honesta, ¿cómo se cierra la ruta AIS?","o":["Comprobando si la sensación ha bajado","Buscando una explicación para lo ocurrido","Con una micro-acción con valor: pequeña, realizable ahora y no orientada al alivio"],"c":2,"x":"El ciclo se cierra con conducta: «¿qué haría la persona que quiero ser?». No hace falta que la sensación se haya ido.","r":"Cerrar con una micro-acción con valor"},
      {"p":"Llevas meses practicando y un día vuelve una sensación que creías superada. ¿Qué significa?","o":["Que todo el trabajo ha sido inútil","Que extinguir no es borrar: puede volver, y por eso la práctica se mantiene","Que deberías dejar de practicar"],"c":1,"x":"Es normal que vuelva: el aprendizaje antiguo compite con el nuevo. Lo que cambia es la función de la sensación, no que desaparezca para siempre.","r":"Extinguir no es borrar"}
    ]},
    "lab-pilares": {t:"Los cuatro pilares", ayuda:"Los cuatro pilares son… y se refuerzan porque…", q:[
      {"p":"¿Qué significa «la interocepción como conducta»?","o":["Que notar el cuerpo es algo que te pasa o no, sin más","Que dirigir y sostener la atención en el cuerpo es un acto que se entrena: se hace, no se espera","Que hay que analizar cada sensación con detalle"],"c":1,"x":"Llevar la atención al pecho, la barriga o el cuello y sostenerla sin juzgar es algo que haces y mejora con práctica.","r":"Notar el cuerpo se hace, no se espera"},
      {"p":"¿Qué es la latencia?","o":["El tiempo entre la activación interna y tu respuesta: el espacio para elegir","Lo que tarda en irse el malestar","Las horas de práctica que llevas acumuladas"],"c":0,"x":"Con latencia corta manda el automatismo; con latencia ampliada hay espacio para elegir. Ahí es donde ocurre el cambio.","r":"Latencia: el espacio para elegir"},
      {"p":"Verdadero o falso: en la densidad (D), que es el ruido interno, lo deseable es que baje.","o":["Verdadero","Falso"],"c":0,"x":"La densidad es el ruido interno que compite con la señal del cuerpo, así que lo deseable es que baje. En latencia y continuidad, en cambio, más es mejor.","r":"Densidad es ruido: mejor que baje"},
      {"p":"Según la TEC, ¿qué es la presencia?","o":["El objetivo final de la terapia","Un estado de calma total, sin pensamientos","La condición para actuar con valor: un centro de gravedad alrededor del cual orbitan rumiación e impulsos"],"c":2,"x":"La presencia no es la meta ni la ausencia de pensamientos: es lo que permite que lo periférico gire alrededor sin capturarte.","r":"La presencia es un centro de gravedad"},
      {"p":"Tras unas semanas practicando, notas que avanzas más deprisa que al principio. ¿Por qué puede pasar?","o":["Por pura casualidad","Porque L, D y C se refuerzan: menos ruido facilita el espacio, y el espacio practicado fortalece la continuidad","Porque ya no necesitas seguir practicando"],"c":1,"x":"Los tres parámetros son circulares y se alimentan entre sí; por eso el progreso tiende a acelerarse tras las primeras semanas.","r":"L, D y C se refuerzan entre sí"}
    ]},
    "lab-afeccion": {t:"La afección interna segura", ayuda:"Practicar también en calma le enseña a mi cuerpo que…", q:[
      {"p":"Solo haces AIS cuando notas ansiedad. ¿Qué puede aprender tu cuerpo?","o":["Que nunca está solo","A activarse para ser atendido","Que su señal no cuenta"],"c":1,"x":"Si la atención acude solo cuando hay alarma, el cuerpo aprende a alarmarse para recibirla. Es muy habitual empezar así, y tiene arreglo.","r":"Atender solo en alarma enseña a alarmarse"},
      {"p":"Verdadero o falso: la respiración calma porque aporta más oxígeno.","o":["Verdadero","Falso"],"c":1,"x":"Calma porque mueve la atención hacia dentro: el aire es el cebo. Por eso, si la atención se va a «hacerlo bien», el mecanismo falla.","r":"El aire es el cebo de la atención"},
      {"p":"Te das cuenta de que practicas sobre todo cuando estás mal. ¿Qué propone la TEC?","o":["Dejar de atender al cuerpo cuando hay alarma","Practicar muchas más veces cuando estés mal","Atender igual en calma y en alarma, con momentos fijos al día"],"c":2,"x":"Retirar la atención en la alarma sería pasar al patrón evitativo. La salida es atender igual en los dos momentos: tres momentos fijos al día.","r":"Atender igual en calma y en alarma"},
      {"p":"Al decir «No sé por qué, pero siento esto aquí», ¿de qué depende tu seguridad?","o":["No depende de la respuesta de quien escucha: es tu conciencia dando la cara por el cuerpo","De que la otra persona reaccione bien","De poder explicar bien el motivo"],"c":0,"x":"La honestidad emocional protege por sí misma; se puede empezar a solas, luego con tu terapeuta y después con vínculos de confianza.","r":"La seguridad no depende del receptor"},
      {"p":"¿Qué forma de atender enseña al cuerpo que no hace falta demandar?","o":["Atender solo cuando hay alarma","Ignorar o controlar la señal","Acudir también en calma, sin que haga falta"],"c":2,"x":"Es el patrón seguro: la presencia no contingente. La proporción de práctica en calma pesa más que la cantidad total.","r":"Presencia no contingente: patrón seguro"}
    ]},
    "lab-sentir": {t:"Sentir, pensar, interpretar", ayuda:"Sé que estoy en el nivel de sentir cuando…", q:[
      {"p":"«Estoy estresado porque mañana tengo la reunión.» ¿En qué nivel está esta frase?","o":["Sentir","Pensar","Interpretar"],"c":1,"x":"Busca una causa, así que es pensar. El AIS opera solo en el nivel de sentir, como «noto presión en el pecho».","r":"El AIS opera en el nivel de sentir"},
      {"p":"Te descubres pensando «esto significa que no voy a poder». ¿Qué pregunta te devuelve al cuerpo?","o":["«¿Y dónde lo notas?»","«¿Por qué me pasa esto?»","«¿Cómo me convenzo de que sí podré?»"],"c":0,"x":"Cuando la mente piensa o interpreta, no hace falta discutirle: basta volver a dónde se nota en el cuerpo.","r":"¿Y dónde lo notas?"},
      {"p":"Verdadero o falso: mirar hacia dentro para comprobar si algo va mal es lo mismo que hacer AIS.","o":["Verdadero","Falso"],"c":1,"x":"Comparten el objeto, el cuerpo, pero no la función. Comprobar y buscar certeza es hipervigilancia; el AIS acompaña sin buscar nada.","r":"AIS no es comprobar: es acompañar"},
      {"p":"De los cuatro criterios que distinguen el AIS de la hipervigilancia, ¿cuál es el decisivo?","o":["Cuánto rato miras","Lo intensa que sea la sensación","Cuándo miras: de forma programada, también en calma"],"c":2,"x":"La contingencia es la clave: si solo miras cuando algo inquieta, la mirada se vuelve chequeo, aunque tu intención sea buena.","r":"Lo decisivo es cuándo miras"},
      {"p":"Notas un nudo en la barriga y te descubres revisando el cuerpo cada pocos minutos para ver si sigue. ¿Qué propone el laboratorio?","o":["Aumentar la dosis de práctica hasta que se vaya","No aumentar la dosis: volver a la práctica programada y a la actitud receptiva","Apartar la atención del cuerpo del todo"],"c":1,"x":"Es una señal de «práctica convertida en chequeo». La respuesta no es más práctica ni huir del cuerpo, sino cambiar cuándo y cómo acudes.","r":"Ante el chequeo, volver a lo programado"}
    ]},
    "lab-ais": {t:"La práctica AIS guiada", ayuda:"Los cuatro pasos son… y los practico…", q:[
      {"p":"Hoy estás bien, sin ansiedad. ¿Tiene sentido hacer la práctica?","o":["No, mejor guardarla para cuando la necesite","Sí: practicar en calma enseña al cuerpo que no tiene que estar mal para merecer tu presencia","Solo si me sobra tiempo"],"c":1,"x":"Practicar también cuando no lo necesitas es justo lo que construye la confianza. La práctica programada es la base.","r":"Practicar también cuando estás bien"},
      {"p":"Verdadero o falso: si en el paso SIENTE no notas nada, lo estás haciendo mal.","o":["Verdadero","Falso"],"c":1,"x":"«No noto nada» también vale: la presencia actúa igual. Si nada está claro, puedes anclarte en manos o pies.","r":"No notar nada también vale"},
      {"p":"¿Cuál es el orden de los cuatro pasos?","o":["Siente · Para · Actúa · Acompaña","Para · Acompaña · Siente · Actúa","Para · Siente · Acompaña · Actúa"],"c":2,"x":"Primero paras, luego sientes y respiras hacia la zona, después acompañas con la frase honesta y cierras actuando con valor.","r":"Para · Siente · Acompaña · Actúa"},
      {"p":"Al respirar hacia la zona (inhala 4 · ancla 2 · exhala 6), ¿qué buscas?","o":["Seguir el aire con tu atención, sin intentar cambiar lo que notas","Relajarte lo antes posible","Hacer la respiración técnicamente perfecta"],"c":0,"x":"No busques relajarte ni hacerlo perfecto: sigue el aire con tu atención y acompaña. Si llega la calma, la recibes.","r":"Seguir el aire, no buscar relajarte"},
      {"p":"¿Cómo es la micro-acción del paso ACTÚA?","o":["Algo grande que demuestre que has superado el malestar","Lo que más te calme en ese momento","Pequeña, observable, realizable ahora y no pensada para aliviarte"],"c":2,"x":"Basta un paso pequeño con sentido, como contestar un mensaje con calma o caminar cinco minutos: «¿qué haría la persona que quiero ser?».","r":"Micro-acción pequeña, con valor, no alivio"}
    ]},
    "lab-perfiles": {t:"La teoría aplicada a cada situación", ayuda:"En mi situación, el AIS se adapta así…", q:[
      {"p":"Tienes dolor crónico. ¿Qué propone la TEC?","o":["Apartar la atención del cuerpo para no notar el dolor","No apartarla: cambiar cuándo y cómo acude, con curiosidad","Esperar a que el dolor desaparezca para empezar a avanzar"],"c":1,"x":"Apartar la atención sería evitación. La pregunta útil no es «¿cómo está tu dolor?», sino «¿qué acción valiosa pudiste hacer hoy a pesar del dolor?».","r":"Cambiar cómo y cuándo miras el dolor"},
      {"p":"Verdadero o falso: para volver al trabajo después de una baja, primero tienes que dejar de tener síntomas.","o":["Verdadero","Falso"],"c":1,"x":"El retorno es acción valiosa en presencia de síntomas. La conducta valiosa no espera a la emoción correcta: la emoción correcta emerge de ella.","r":"Actuar con valor aunque haya síntomas"},
      {"p":"Tienes ansiedad por la salud y notas una sensación extraña. ¿Para qué harías el AIS?","o":["Solo para acompañarla, no para que desaparezca","Para comprobar que no es nada grave","Para que se vaya cuanto antes"],"c":0,"x":"«No necesitas hacer el AIS para que desaparezca la sensación. Solo para acompañarla.» Así evitas que la práctica se convierta en un ritual de chequeo.","r":"El AIS acompaña, no comprueba"},
      {"p":"En familia, ¿cómo aprende un niño a regularse?","o":["Porque el adulto le explica cómo hacerlo","Porque se le corrige cada vez que se desborda","Porque el adulto se regula delante de él"],"c":2,"x":"Por eso se empieza por el AIS del adulto: la familia es un entorno de co-regulación, no un terapeuta.","r":"Primero el AIS del adulto"},
      {"p":"Si tu cuerpo vive en alerta por experiencias traumáticas, ¿por dónde se empieza?","o":["Por sostener cuanto antes la sensación más intensa","Por la seguridad: buscar un punto tranquilo y anclarte en manos o pies","Por evitar cualquier contacto con el cuerpo"],"c":1,"x":"Seguridad antes que latencia: «¿hay algún punto de tu cuerpo que esté tranquilo ahora mismo?». Los anclajes periféricos van antes que los internos.","r":"En trauma, seguridad primero"}
    ]},
    "ais-vistazo": {t:"El AIS en un vistazo", ayuda:"El gesto que entrenan todas las herramientas es…", q:[
      {"p":"En la silueta, ¿qué representa la luz amarilla?","o":["El aire que entra por la nariz","Tu atención consciente, que nace arriba, en la cabeza","La zona del cuerpo donde hay tensión"],"c":1,"x":"La luz amarilla es tu atención consciente, que suele vivir arriba, pensando y dándole vueltas.","r":"Luz amarilla: tu atención consciente"},
      {"p":"¿Qué papel tiene el aire (la luz azul)?","o":["Hace de cebo: le da a tu atención algo sencillo que seguir hacia dentro","Es lo que te relaja","Es lo principal: lo importante es respirar bien"],"c":0,"x":"El aire es un cebo para la atención, no el objetivo. Lo importante es adónde va tu atención, no la técnica.","r":"El aire hace de cebo"},
      {"p":"Verdadero o falso: aunque el aire vuelva a salir, tu atención puede quedarse abajo, en la barriga, dando presencia.","o":["Verdadero","Falso"],"c":0,"x":"Tu atención baja hasta la barriga y se queda ahí dando presencia, aunque el aire vuelva a salir. Aparecer y permanecer.","r":"La atención baja y se queda"},
      {"p":"Haces el ejercicio y te pones a analizar tu cuerpo e intentar arreglar lo que notas. ¿Qué te diría este apartado?","o":["Que vas bien: pensar el cuerpo es el gesto","Que lo ideal es calmarlo cuanto antes","Que se trata de estar con lo que hay, con una actitud amable, no de pensarlo ni arreglarlo"],"c":2,"x":"Es normal que la mente quiera arreglar. El gesto es más sencillo: estar con lo que hay para que el cuerpo compruebe que no lo abandonas.","r":"Estar con lo que hay, sin arreglarlo"},
      {"p":"¿Qué buscan, en el fondo, todas las herramientas de este espacio?","o":["Que dejes de sentir lo que te molesta","Que el gesto de bajar y dar presencia se vuelva tuyo, casi automático","Que entiendas el origen de cada sensación"],"c":1,"x":"Repetido, ese gesto de tu atención es la nueva relación contigo: aparecer para el cuerpo, permanecer, y que se sienta querido.","r":"Que el gesto se vuelva tuyo"}
    ]},
    /* Vídeos (transcripción de cada vídeo) */
    "v-tec": {t:"Vídeo: la Teoría del Efecto Consciente", ayuda:"La idea que sostiene todo esto es…", q:[
      {"p":"Según el vídeo, ¿para qué sirve la conciencia?","o":["Para controlar lo que siento y sentirme distinto","Para estar presente, aquí dentro","Para analizar por qué me pasa lo que me pasa"],"c":1,"x":"La conciencia no sirve para controlarlo todo ni para obligarte a sentir distinto. Sirve para algo más humilde y más potente: estar presente, aquí dentro.","r":"La conciencia sirve para estar presente"},
      {"p":"Verdadero o falso: el objetivo de la TEC es eliminar el malestar.","o":["Verdadero","Falso"],"c":1,"x":"Igual que en la terapia de aceptación y compromiso (ACT), no buscamos eliminar el malestar ni discutir con los pensamientos, sino hacerle sitio y aun así avanzar hacia lo que te importa.","r":"Hacer sitio al malestar, no eliminarlo"},
      {"p":"¿Qué es la «latencia»?","o":["El tiempo que tardo en calmarme","El pequeño espacio entre lo que siento y lo que hago","Un síntoma de ansiedad"],"c":1,"x":"Cuando llevas la atención dentro, sin pelearte con lo que pasa, aparece un pequeño espacio entre lo que sientes y lo que haces. Ahí cabe tu libertad: ahí puedes elegir.","r":"Latencia: el espacio entre sentir y hacer"},
      {"p":"Estás dando vueltas a algo que te preocupa. Según el vídeo, ¿qué te ayudaría más?","o":["Preguntarme por qué me pasa hasta entenderlo","Acompañarme mejor y actuar según lo que me importa","Pensar más para encontrar la solución"],"c":1,"x":"No se trata de pensar más, ni de analizarte más, ni de preguntarte el porqué: se trata de acompañarte mejor y actuar según tus valores.","r":"Acompañarse, no analizarse más"},
      {"p":"¿Qué entrena todo lo que hay en la app?","o":["Parar, sentir y elegir desde ahí","Relajarme lo antes posible","Hacerlo perfecto cada día"],"c":0,"x":"Todo entrena lo mismo: parar, sentir y elegir desde ahí. Y no tienes que hacerlo perfecto: solo tienes que empezar.","r":"Parar, sentir y elegir"}
    ]},
    "v-sobrepensamiento": {t:"Vídeo: el sobrepensamiento", ayuda:"Cuando le doy mil vueltas a algo, lo que me ayuda es…", q:[
      {"p":"Según el vídeo, ¿cuál es la salida cuando le das mil vueltas a las cosas?","o":["Pensar mejor hasta dar con la respuesta","Bajar del pensamiento al cuerpo","Distraerme con el móvil"],"c":1,"x":"La salida no es pensar mejor: es bajar del pensamiento al cuerpo, a lo que sí puedes tocar, el presente.","r":"Bajar del pensamiento al cuerpo"},
      {"p":"Verdadero o falso: si vuelvo al cuerpo y al rato me descubro otra vez pensando, lo he hecho mal.","o":["Verdadero","Falso"],"c":1,"x":"Volver «una y otra vez» es la práctica. Darte cuenta de que te has ido y volver no es un fallo: es exactamente lo que se entrena.","r":"Volver una y otra vez es la práctica"},
      {"p":"En la TEC, ¿qué busca en el fondo el sobrepensamiento?","o":["Alivio","Conocimiento","Castigarme"],"c":0,"x":"La mente cree que busca explicaciones, pero el cuerpo busca alivio. Por eso no es un rasgo de tu forma de ser: es una conducta que busca alivio, y se puede entrenar otra.","r":"El sobrepensamiento busca alivio"},
      {"p":"Estás en la cama repasando una conversación por quinta vez. ¿Qué harías según lo aprendido?","o":["Seguir hasta encontrar qué dije mal","STOP, una respiración y llevar la atención unos segundos a la barriga, el pecho o el cuello","Levantarme a buscar la respuesta en internet"],"c":1,"x":"Para · respira · vuelve: STOP, una respiración y 4–5 segundos de atención en el cuerpo, aunque no sientas nada. Sin discutir con el pensamiento.","r":"Para · respira · vuelve (STOP)"},
      {"p":"¿A qué te invita a volver el vídeo?","o":["A lo que pasó, para entenderlo","A lo que puede pasar, para prepararme","A lo que sí puedes tocar: el presente"],"c":2,"x":"El pasado y el futuro alimentan el bucle; el presente —lo que notas ahora en el cuerpo— es lo único que sí puedes tocar.","r":"Volver al presente, a lo que puedes tocar"}
    ]},
    "v-cerebro": {t:"Vídeo: cómo funciona tu cerebro", ayuda:"Mi sistema de alarma…", q:[
      {"p":"Según el vídeo, ¿cómo es tu sistema de alarma?","o":["Muy antiguo y muy rápido","Moderno y racional","Lento pero preciso"],"c":0,"x":"Tienes un sistema de alarma muy antiguo y muy rápido: reacciona antes de que tú elijas.","r":"La alarma es antigua y rápida"},
      {"p":"Verdadero o falso: cuando la alarma salta sin peligro real, es que algo está roto en mí.","o":["Verdadero","Falso"],"c":1,"x":"No es un error, es protección. Tu cuerpo intenta cuidarte con lo que aprendió; no hay nada roto en ti.","r":"La alarma no es un error: es protección"},
      {"p":"¿Qué se aprende al entrenar la latencia?","o":["A no sentir nada","A sentir sin obedecer","A obedecer más rápido a lo que siento"],"c":1,"x":"Aprendes que puedes sentir sin obedecer: la sensación está, pero entre lo que sientes y lo que haces aparece un espacio en el que puedes elegir.","r":"Sentir sin obedecer"},
      {"p":"Notas un nudo en el estómago antes de una reunión. ¿Qué harías según lo aprendido?","o":["Cancelar la reunión para que se pase","Notar el nudo, acompañarlo con la atención y elegir qué hago","Convencerme de que no siento nada"],"c":1,"x":"No hace falta que el nudo desaparezca ni obedecerlo: lo notas, te quedas con él un momento y eliges desde ahí.","r":"Notar, acompañar y elegir"},
      {"p":"Entrenar la latencia es…","o":["Hacer que el espacio entre sentir y actuar sea un poco más grande","Reaccionar antes que la alarma","Pensar más antes de actuar"],"c":0,"x":"La latencia es ese espacio entre lo que sientes y lo que haces. Cada vez que paras y sientes sin reaccionar en automático, ese espacio se ensancha.","r":"Ensanchar el espacio entre sentir y hacer"}
    ]},
    "v-cuerpo": {t:"Vídeo: «El día que tu cuerpo empezó a notarte»", ayuda:"Lo que mi cuerpo necesita de mí es…", q:[
      {"p":"En la historia, ¿qué necesitaba el niño pequeño que tenía miedo?","o":["Que le solucionaran el miedo","Sentir que alguien permanecía con él","Que le explicaran que no había peligro"],"c":1,"x":"Ese niño nunca necesitó que le solucionaran el miedo: necesitaba sentir que alguien permanecía con él. Algo cambia no porque desaparezca lo que asusta, sino porque ya no está solo.","r":"Permanecer, no solucionar"},
      {"p":"Según el vídeo, ¿qué necesita tu cuerpo?","o":["Que lo controles","Notar que estás con él","Que lo ignores hasta que se calme"],"c":1,"x":"Tu cuerpo no necesita que lo controles: necesita notar que estás con él.","r":"El cuerpo necesita notarte"},
      {"p":"Verdadero o falso: si por fuera parezco estar bien pero por dentro es una batalla, es que hay algo roto en mí.","o":["Verdadero","Falso"],"c":1,"x":"Mucha gente lo vive así y llega a pensarlo, pero no hay nada roto: hay un cuerpo que lleva tiempo esperando que alguien esté con él.","r":"No hay nada roto en ti"},
      {"p":"¿Quién puede empezar a hacer por ti lo que quizá esperaste de otros?","o":["Solo mi psicólogo/a","Tú mismo/a: aprender a estar contigo","Nadie: es demasiado tarde"],"c":1,"x":"Quizá esperaste durante mucho tiempo que alguien hiciera esto por ti. Por primera vez puedes aprender a estar tú contigo.","r":"Aprender a estar contigo"},
      {"p":"¿Cómo se acerca uno al niño asustado en la historia?","o":["Agachándose a su altura y quedándose","Diciéndole que no tenga miedo","Distrayéndole con otra cosa"],"c":0,"x":"Te acercas, te agachas a su altura y te quedas; solo estás. Es lo que haces con tu cuerpo cuando llevas tu atención a él.","r":"Acercarse y quedarse"}
    ]},
    "v-respirar": {t:"Vídeo: «Respirar es aparecer»", ayuda:"Cuando respiro, no busco calmarme, sino…", q:[
      {"p":"Verdadero o falso: respirar sirve para relajarte.","o":["Verdadero","Falso"],"c":1,"x":"Te dijeron que era para eso y por eso pudo parecer que no te servía. Respirar no está hecho para relajarte: es aparecer, decirle a tu cuerpo «estoy aquí».","r":"Respirar es aparecer, no relajarse"},
      {"p":"Lo intentaste, respiraste y no pasó nada (o te sentiste peor). Según el vídeo…","o":["Respirar no es para mí","No fallaste tú: te dijeron que era para otra cosa","Tengo que respirar más fuerte"],"c":1,"x":"No fallaste tú: simplemente te dijeron para qué servía, y no era para eso.","r":"No fallaste: el objetivo era otro"},
      {"p":"¿Por qué cambia la respiración de un mamífero cuando deja de sentirse solo?","o":["Porque el peligro ha desaparecido","Porque nota que alguien permanece con él","Porque se ha cansado"],"c":1,"x":"No porque haya desaparecido el peligro, sino porque por fin ha notado que alguien permanece con él.","r":"Notar que alguien permanece"},
      {"p":"La próxima vez que respires, ¿qué te propone el vídeo?","o":["Pedirle al cuerpo que se calme","Quedarte un momento más y que tu atención baje con el aire para que el cuerpo te note","Contar las respiraciones hasta relajarte"],"c":1,"x":"No le pidas que se calme: quédate un momento más. El aire es el cebo; tu atención lo sigue y baja (la luz amarilla de la silueta) para que el cuerpo pueda notarte.","r":"El aire es el cebo de la atención"},
      {"p":"Respiras con atención y hoy todavía no cambia nada. ¿Qué significa?","o":["Que no funciona","Que no pasa nada: el cambio llega despacio, cuando alguien permanece","Que lo estoy haciendo mal"],"c":1,"x":"Un niño asustado tampoco deja de tener miedo solo porque alguien llegue. Pero cuando alguien permanece, algo empieza a cambiar muy despacio desde dentro.","r":"El cambio llega despacio, permaneciendo"}
    ]},
    "v-sentir": {t:"Vídeo: «Sentir conscientemente»", ayuda:"Hago AIS para…", q:[
      {"p":"¿Para qué llevas la atención a lo que sientes en el AIS?","o":["Para quitar la sensación","Para entender por qué la tengo","Simplemente para estar con ella"],"c":2,"x":"No para quitar la sensación, ni para tranquilizarla, ni siquiera para entenderla: simplemente para estar con ella.","r":"AIS: estar con la sensación"},
      {"p":"Verdadero o falso: basta con entenderme bien para que algo cambie.","o":["Verdadero","Falso"],"c":1,"x":"Comprenderte es importante, pero la transformación llega cuando tu cuerpo experimenta una y otra vez algo distinto. La reconstrucción no puede quedarse en entender: tiene que ser una nueva relación contigo.","r":"Entender no basta: hace falta experiencia"},
      {"p":"¿Cómo llega el cuerpo a confiar en ti?","o":["Un día, cuando lo entiendes","Por repetición: comprobando una y otra vez que no lo abandonas","Cuando dejas de sentir cosas difíciles"],"c":1,"x":"No ocurre porque un día lo entiendas: ocurre por repetición. Cada AIS es una experiencia en la que el cuerpo comprueba que no lo abandonas cuando aparecen sensaciones difíciles.","r":"La confianza se construye por repetición"},
      {"p":"¿Qué mensaje le das a tu cuerpo, sin palabras, cada vez que haces AIS?","o":["«Cálmate ya»","«No necesito que estés bien para estar contigo»","«Ya pasará, no le hagas caso»"],"c":1,"x":"«No necesito que estés bien para estar contigo. Estoy aquí también cuando duele.»","r":"Estar también cuando duele"},
      {"p":"Cuando el cuerpo siente una presencia estable dentro, ¿qué puede disminuir?","o":["La necesidad de buscar seguridad fuera (personas, control, actividad, sobrepensamiento)","Las ganas de hacer cosas","La capacidad de sentir"],"c":0,"x":"Cuando ese mamífero experimenta que tiene una presencia estable en su propia manada, disminuye la necesidad de buscar seguridad fuera.","r":"Menos búsqueda de seguridad fuera"}
    ]},
    "v-pregunta": {t:"Vídeo: «La pregunta que casi nunca nos hacemos»", ayuda:"La pregunta que me llevo es…", q:[
      {"p":"¿Cuál es la pregunta que casi nunca nos hacemos?","o":["¿Qué me ocurre?","¿Por qué me ocurre?","¿Cómo me relaciono con lo que me ocurre?"],"c":2,"x":"No es qué te ocurre ni por qué: es cómo te relacionas con eso que te ocurre.","r":"Cómo me relaciono con lo que me pasa"},
      {"p":"Llevas años intentando controlar, tapar o vencer algo de ti y siempre vuelve. ¿Qué propone el vídeo?","o":["Esforzarme más","Quedarme con ello: quizá no hacía falta vencer nada","Ignorarlo del todo"],"c":1,"x":"Quizá eso que llevas tanto tiempo intentando cambiar nunca dejó de esperarte. Puede que no hiciera falta vencer nada: solo que te quedaras.","r":"No vencer: quedarse"},
      {"p":"Según el vídeo, ¿qué es lo que cambia?","o":["Lo que sientes","La relación que tienes con lo que sientes","Las circunstancias"],"c":1,"x":"Lo que cambia no es lo que sientes: es la relación que tienes con lo que sientes.","r":"Cambia la relación, no lo sentido"},
      {"p":"¿En qué orden van las fases?","o":["Primero permanecer, luego aparecer","Primero aparecer, luego permanecer","Da igual el orden"],"c":1,"x":"En la fase anterior aprendiste a aparecer (que tu cuerpo notara que estabas). Permanecer es el paso siguiente, y el orden importa.","r":"Primero aparecer, después permanecer"},
      {"p":"Hoy, en lugar de «¿cómo cambio esto de mí?», ¿qué puedes preguntarte?","o":["¿Cómo lo acompaño, cómo lo acojo?","¿Quién tiene la culpa?","¿Cuándo se irá?"],"c":0,"x":"La invitación es cambiar la pregunta: de cómo cambiarlo a cómo acompañarlo y acogerlo.","r":"Acompañar y acoger"}
    ]},
    "v-quedarte": {t:"Vídeo: «Aprender a quedarte»", ayuda:"Quedarme significa…", q:[
      {"p":"¿Necesitas estar tranquilo/a o que sea un buen momento para practicar?","o":["Sí, si no, no sirve","No: solo parar un segundo y llevar la atención dentro","Solo cuando estoy muy mal"],"c":1,"x":"No necesitas estar tranquilo ni que sea un buen momento: solo parar un segundo y llevar la atención hacia dentro.","r":"Se practica en cualquier momento"},
      {"p":"Llevas la atención dentro y no aparece nada claro. ¿Qué haces?","o":["Lo dejo: no está funcionando","Busco hasta encontrar algo","Me quedo con lo que haya: también está bien"],"c":2,"x":"Si no aparece nada claro, también está bien: te quedas con lo que haya.","r":"Si no noto nada, también vale"},
      {"p":"Si pones una mano donde lo notas, ¿para qué es?","o":["Para apretarlo y que se vaya","Para decirle que estás","Para medir cuánto dura"],"c":1,"x":"No para apretarlo: para decirle que estás.","r":"La mano dice «estoy aquí»"},
      {"p":"¿Cuál es «toda la práctica»?","o":["Quedarte un poco más de lo que el cuerpo te pide para irte","Aguantar hasta que desaparezca","Respirar hasta calmarte"],"c":0,"x":"Ese poco más, quedarte un poco más allá del impulso de irte, es toda la práctica. No estás esperando que cambie: le enseñas a tu cuerpo que no te vas.","r":"Quedarse un poco más allá del impulso"},
      {"p":"Terminas y no ha cambiado nada. Según el vídeo…","o":["Ha sido inútil","No hacía falta: te has quedado con ello, y basta","Tengo que repetirlo hasta que cambie"],"c":1,"x":"Quizá no ha cambiado nada; no hacía falta. Te has quedado, y eso basta: cada vez que te quedas, tu cuerpo lo registra.","r":"Quedarse basta, aunque no cambie nada"}
    ]},
    "v-honestidad": {t:"Vídeo: la honestidad emocional", ayuda:"Ser honesto/a conmigo es…", q:[
      {"p":"Según el vídeo, la honestidad emocional es…","o":["Decir todo lo que sientes a todo el mundo","Dejar de mentirte a ti","Explicar siempre por qué te sientes así"],"c":1,"x":"No es decir todo lo que sientes a todo el mundo: es dejar de mentirte a ti.","r":"Dejar de mentirse a uno mismo"},
      {"p":"¿Por dónde te propone empezar?","o":["Por lo más simple: ¿qué estoy sintiendo ahora?","Por entender de dónde viene","Por contárselo a toda mi familia"],"c":0,"x":"Empieza por lo más simple: ¿qué estoy sintiendo? Es verdad ahora. Reconócelo.","r":"Empezar por lo más simple"},
      {"p":"Notas algo en el pecho y no sabes por qué. ¿Cuál es una frase honesta según la TEC?","o":["«Estoy perfectamente»","«Seguro que es por culpa de…»","«No sé por qué, pero lo noto aquí»"],"c":2,"x":"No hace falta tener el porqué. «No sé por qué, pero lo noto aquí» es la conciencia dando la cara por el cuerpo.","r":"«No sé por qué, pero lo noto aquí»"},
      {"p":"Verdadero o falso: para ser honesto/a necesito saber primero por qué me siento así.","o":["Verdadero","Falso"],"c":1,"x":"El «¿por qué?» puede convertirse en una campana (como la de Pavlov) que dispara el bucle. Lo honesto es lo que notas ahora, aunque no sepas por qué.","r":"Lo honesto no necesita el porqué"},
      {"p":"¿Qué haces con lo que sientes según el vídeo?","o":["Lo tapo para no molestar","Lo reconozco: es verdad ahora","Lo analizo hasta que se vaya"],"c":1,"x":"Reconocerlo, sin taparlo ni analizarlo: es lo que estás sintiendo y es verdad ahora.","r":"Reconocer lo que siento ahora"}
    ]},
    "v-yo": {t:"Vídeo: «El yo que se construyó sin ti»", ayuda:"Lo que dejé fuera de mí…", q:[
      {"p":"Según el vídeo, ¿cómo se construyó muchas veces el yo?","o":["Contando siempre con el cuerpo","Sin contar con el cuerpo, a veces en contra de él","Por casualidad"],"c":1,"x":"Se construyó con lo que viviste y necesitaste para sobrevivir, muchas veces silenciando el cansancio, tapando el miedo y tirando hacia delante.","r":"El yo se construyó sin el cuerpo"},
      {"p":"Verdadero o falso: construir ese yo que aguanta y funciona fue un error.","o":["Verdadero","Falso"],"c":1,"x":"No fue un error: fue tu manera de llegar hasta aquí. Ese yo hizo su trabajo.","r":"No fue un error: te trajo hasta aquí"},
      {"p":"¿Qué se quedó fuera?","o":["El cuerpo que sentía","Tu inteligencia","Tus recuerdos"],"c":0,"x":"Se quedó fuera el cuerpo que sentía, el que no encajaba en el yo que tenías que ser. Y no se fue: siguió ahí, esperando.","r":"Se quedó fuera el cuerpo que sentía"},
      {"p":"Según el vídeo, ¿qué es reconciliarse?","o":["Derribar lo que construiste y empezar de cero","Ensanchar ese yo hasta que quepa también tu cuerpo","Dejar de ser quien eres"],"c":1,"x":"No hace falta volver a empezar ni dejar de ser quien eres: reconciliarse es ensanchar lo que construiste hasta que quepa también tu cuerpo.","r":"Reconciliarse es ensanchar, no derribar"},
      {"p":"¿Qué te invita a hacer el vídeo?","o":["Volver a por quien dejaste fuera","Esforzarte más para aguantar","Olvidar el pasado"],"c":0,"x":"Solo volver a por quien dejaste fuera, para que el yo que construiste para protegerte pueda construirse ahora contigo entero, también con lo que sientes.","r":"Volver a por quien dejaste fuera"}
    ]},
    "v-ira": {t:"Vídeo: la ira, con Tòfol Villalonga", ayuda:"Cuando noto la ira…", q:[
      {"p":"Según el vídeo, la ira es…","o":["Tu enemiga","Energía","Un defecto de carácter"],"c":1,"x":"La ira no es tu enemiga: es energía.","r":"La ira es energía"},
      {"p":"¿Qué hay entre el impulso y la acción?","o":["Nada: van juntos","Un espacio pequeñito, que es tu oportunidad","Una explicación"],"c":1,"x":"Entre el impulso y la acción hay un espacio pequeñito. Ese espacio —la latencia— es tu oportunidad.","r":"El espacio entre impulso y acción"},
      {"p":"Verdadero o falso: la ira bien acompañada explota igual, pero más tarde.","o":["Verdadero","Falso"],"c":1,"x":"La ira bien acompañada no explota: informa. Te dice algo de lo que te importa.","r":"La ira acompañada informa"},
      {"p":"Alguien te habla mal y notas calor en el pecho y ganas de contestar. ¿Qué harías según lo aprendido?","o":["Contestar ya, antes de que se me pase","Tragármelo y hacer como si nada","Parar, notar dónde está la ira en el cuerpo, respirar y elegir qué hago"],"c":2,"x":"Ni explotar ni tragártelo: paras, la acompañas en el cuerpo unos segundos y, desde ese espacio, eliges cómo responder.","r":"Parar, acompañar y elegir"},
      {"p":"Acompañar la ira significa…","o":["Quedarte con la sensación en el cuerpo sin obedecerla ni taparla","Convencerte de que no estás enfadado/a","Desahogarte golpeando algo"],"c":0,"x":"Acompañar es estar con la energía en el cuerpo, sin obedecerla ni negarla. Así puede informarte en lugar de arrastrarte.","r":"Acompañar sin obedecer ni tapar"}
    ]}
  };

  var css = '' +
    '.cq{margin-top:8px;font-size:14.5px;line-height:1.45}' +
    '.cq .cq-q{margin:12px 0;padding:12px;border-radius:12px;background:var(--bg2,#f2f0ea);border:1px solid var(--line,#ddd)}' +
    '.cq .cq-n{font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--acc,#3f6b74)}' +
    '.cq .cq-p{font-weight:700;margin:4px 0 8px}' +
    '.cq button.cq-o{display:block;width:100%;text-align:left;font:inherit;color:inherit;background:var(--card,#fff);border:1px solid var(--line,#ccc);border-radius:10px;padding:9px 11px;margin:6px 0;min-height:42px;cursor:pointer}' +
    '.cq button.cq-o[disabled]{cursor:default;opacity:.75}' +
    '.cq button.cq-o.si{border-color:var(--ok,#2e7d5e);background:var(--ok-soft,#d9eee2);opacity:1}' +
    '.cq button.cq-o.no{border-color:var(--gold,#a9781f);background:var(--gold-soft,#f4e7cc);opacity:1}' +
    '.cq .cq-x{margin-top:6px;font-size:13.5px}' +
    '.cq .cq-fin{margin-top:12px;padding:12px;border-radius:12px;border:1px dashed var(--acc,#3f6b74)}' +
    '.cq .cq-esc{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}' +
    '.cq .cq-esc button{font:inherit;min-width:42px;min-height:40px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--card,#fff);color:inherit;cursor:pointer}' +
    '.cq .cq-esc button.on{background:var(--acc,#3f6b74);color:var(--acc-ink,#fff);border-color:var(--acc,#3f6b74)}' +
    '.cq textarea{width:100%;box-sizing:border-box;min-height:70px;font:inherit;border-radius:10px;border:1px solid var(--line,#ccc);padding:8px;background:var(--card,#fff);color:inherit}' +
    '.cq .cq-b{font:inherit;font-weight:700;border:0;border-radius:18px;padding:8px 14px;min-height:40px;margin:8px 6px 0 0;cursor:pointer;background:var(--acc,#3f6b74);color:var(--acc-ink,#fff)}' +
    '.cq .cq-b.g{background:transparent;color:var(--acc,#3f6b74);border:1px solid var(--acc,#3f6b74)}';
  function estilo() {
    if (document.getElementById('cq-css')) return;
    var s = document.createElement('style'); s.id = 'cq-css'; s.textContent = css; document.head.appendChild(s);
  }
  function hoy() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }

  function mount(box, opt) {
    var base = Q[opt.id]; if (!box || !base) return null;
    // Baraja las opciones (salvo verdadero/falso) para que la correcta no esté siempre en el mismo sitio.
    var data = { q: base.q.map(function (q) {
      if (q.o.length < 3) return q;
      var idx = q.o.map(function (_, i) { return i; });
      for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      return { p: q.p, o: idx.map(function (i) { return q.o[i]; }), c: idx.indexOf(q.c), x: q.x, r: q.r };
    }), ayuda: base.ayuda };
    estilo();
    var resp = [], conf = 0;
    function pintar() {
      resp = []; conf = 0;
      var h = '<div class="cq">';
      if (opt.prev) h += '<p class="small muted">La última vez (' + esc(opt.prev.f) + '): ' + opt.prev.ok + ' de ' + opt.prev.n + ' ideas claras. Puedes repetirlo cuando quieras.</p>';
      h += '<p class="small muted">No es un examen: sirve para ver qué ideas te han quedado claras. Cada respuesta trae su explicación.</p>';
      data.q.forEach(function (q, i) {
        h += '<div class="cq-q" data-i="' + i + '"><div class="cq-n">Pregunta ' + (i + 1) + ' de ' + data.q.length + '</div><div class="cq-p">' + esc(q.p) + '</div>' +
          q.o.map(function (o, j) { return '<button type="button" class="cq-o" data-j="' + j + '">' + esc(o) + '</button>'; }).join('') +
          '<div class="cq-x" hidden></div></div>';
      });
      h += '<div class="cq-fin" hidden></div></div>';
      box.innerHTML = h;
      Array.prototype.forEach.call(box.querySelectorAll('.cq-q'), function (qd) {
        var i = +qd.getAttribute('data-i'), q = data.q[i];
        Array.prototype.forEach.call(qd.querySelectorAll('.cq-o'), function (b) {
          b.onclick = function () {
            if (resp[i] != null) return;
            var j = +b.getAttribute('data-j'); resp[i] = j;
            Array.prototype.forEach.call(qd.querySelectorAll('.cq-o'), function (x) {
              var k = +x.getAttribute('data-j'); x.disabled = true;
              if (k === q.c) x.classList.add('si'); else if (k === j) x.classList.add('no');
            });
            var xd = qd.querySelector('.cq-x'); xd.hidden = false;
            xd.innerHTML = (j === q.c ? '<b>✓ Exacto.</b> ' : '<b>Es una idea muy habitual, pero la TEC lo plantea de otra forma.</b> ') + esc(q.x);
            if (resp.filter(function (r) { return r != null; }).length === data.q.length) fin();
          };
        });
      });
    }
    function fin() {
      var ok = 0, rep = [];
      data.q.forEach(function (q, i) { if (resp[i] === q.c) ok++; else rep.push(i); });
      var f = box.querySelector('.cq-fin'); f.hidden = false;
      var h = '<b>' + ok + ' de ' + data.q.length + ' ideas claras.</b> ';
      h += rep.length ? 'Para repasar (vuelve a ver o leer esa parte, o coméntalo en sesión):<ul>' + rep.map(function (i) { return '<li>' + esc(data.q[i].r) + '</li>'; }).join('') + '</ul>'
        : 'Las ideas clave están claras. Lo que importa ahora es llevarlo a la práctica.';
      h += '<p style="margin:10px 0 0"><b>¿Cuánto crees que lo entiendes?</b> <span class="small muted">(1 = poco · 5 = mucho)</span></p><div class="cq-esc">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-c="' + n + '">' + n + '</button>'; }).join('') + '</div>';
      h += '<p style="margin:10px 0 4px"><b>Explícalo con tus palabras</b> <span class="small muted">(opcional; como si se lo contaras a un amigo. Lo podéis comentar en sesión)</span></p>' +
        '<textarea maxlength="600" placeholder="' + esc(data.ayuda || 'Lo que me llevo de aquí es…') + '"></textarea>';
      h += '<div><button type="button" class="cq-b" data-a="g">Guardar</button><button type="button" class="cq-b g" data-a="r">Repetir</button></div>';
      f.innerHTML = h;
      Array.prototype.forEach.call(f.querySelectorAll('.cq-esc button'), function (b) {
        b.onclick = function () { conf = +b.getAttribute('data-c'); Array.prototype.forEach.call(f.querySelectorAll('.cq-esc button'), function (x) { x.classList.toggle('on', x === b); }); };
      });
      f.querySelector('[data-a="r"]').onclick = function () { pintar(); box.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
      f.querySelector('[data-a="g"]').onclick = function () {
        var r = { f: hoy(), ok: ok, n: data.q.length, rep: rep, conf: conf || null, txt: (f.querySelector('textarea').value || '').trim() };
        if (opt.onDone) opt.onDone(r);
      };
      f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    pintar();
    return { destroy: function () { box.innerHTML = ''; } };
  }

  global.Comprension = {
    Q: Q, mount: mount,
    tiene: function (id) { return !!Q[id]; },
    titulo: function (id) { return Q[id] ? Q[id].t : id; },
    idea: function (id, i) { return Q[id] && Q[id].q[i] ? Q[id].q[i].r : ''; }
  };
})(window);
