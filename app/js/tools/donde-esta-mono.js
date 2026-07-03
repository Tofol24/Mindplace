/* ============================================================
   APRENS · Herramienta: "¿Dónde está tu mono?" (detective del mono)
   ------------------------------------------------------------
   PORTADA desde el HTML legacy (sin core, sin localStorage: era navegacional).
   Se conserva SIN cambios: clasificador local por palabras (ES/CA), las 4
   posiciones (conduce/delante/maletero/lado) con dibujo SVG, las 4 preguntas,
   el mensaje-puente que valida la emoción y la captura de "aprendizaje
   supervisado" (frase a validar por el psicólogo).

   MIGRACIÓN: al enviar, además del resumen de WhatsApp, se guarda un registro
   en el aprens_db ÚNICO y se ofrece export aprens-export para el panel.
   ============================================================ */
(function () {
  const TOOL_ID = "donde_esta_mono", TOOL_NAME = "¿Dónde está el mono?";

  function MONO_SVG(id){
    var C={conduce:['#c0584e','#f6e3e0'],delante:['#d98a3d','#f8ecdc'],maletero:['#8d6fb0','#eee8f5'],lado:['#5f9070','#e7f0ea']}[id];
    var ac=C[0], bg=C[1], fig='';
    if(id==='conduce') fig='<text x="14" y="74" font-size="20">💨</text><text x="188" y="100" font-size="29">🐒</text><text x="116" y="100" font-size="17" opacity="0.4">🙂</text><text x="150" y="146" font-size="15">🔁</text>';
    else if(id==='delante') fig='<text x="186" y="100" font-size="24">🙂</text><text x="252" y="98" font-size="32">🐒</text><text x="280" y="74" font-size="18">💢</text>';
    else if(id==='maletero') fig='<text x="190" y="100" font-size="24">🙂</text><rect x="30" y="108" width="48" height="32" rx="6" fill="'+ac+'" opacity="0.9"/><text x="40" y="133" font-size="18">🙈</text>';
    else fig='<text x="174" y="100" font-size="24">🙂</text><text x="206" y="100" font-size="24">🐒</text><text x="193" y="76" font-size="15">🧡</text>';
    return '<svg viewBox="0 0 340 170" width="100%" style="max-width:320px;display:block;margin:0 auto" role="img" aria-label="Coche con el mono '+id+'">'
      +'<line x1="14" y1="154" x2="326" y2="154" stroke="#e3dcd0" stroke-width="4" stroke-linecap="round"/>'
      +'<rect x="24" y="98" width="292" height="48" rx="18" fill="'+bg+'" stroke="'+ac+'" stroke-width="2.5"/>'
      +'<path d="M96 98 Q104 60 150 58 L214 60 Q250 64 256 98 Z" fill="#ffffff" stroke="'+ac+'" stroke-width="2.5"/>'
      +'<line x1="176" y1="59" x2="176" y2="98" stroke="'+ac+'" stroke-width="2"/>'
      +'<circle cx="92" cy="148" r="20" fill="#3a3631"/><circle cx="92" cy="148" r="8" fill="#d8d2c8"/>'
      +'<circle cx="252" cy="148" r="20" fill="#3a3631"/><circle cx="252" cy="148" r="8" fill="#d8d2c8"/>'
      +'<circle cx="312" cy="114" r="6" fill="#f4d98a" stroke="'+ac+'" stroke-width="1.5"/>'
      +fig+'</svg>';
  }

  var POS = {
    conduce:{ em:'🐒🚗', tit:'El mono conduce', etiqueta:'conduciendo', color:'conduce', param:'latencia',
      galt:'Conduce el mono', gald:'Hago conductas evitativas y compulsivas para aliviarlo.',
      donde:'El mono lleva el volante: actúas en piloto automático para evitar o aliviar lo que sientes (comprobar, huir, repetir, consumir, mantenerte ocupado/a). Son conductas evitativas y compulsivas: calman un momento, pero alimentan el malestar.',
      pasos:['<b>PARA.</b> Nota el impulso de hacer «eso» que alivia y di STOP un momento.',
             '<b>SIENTE.</b> Lleva la atención al cuerpo: ¿dónde está la urgencia? Pecho, manos, estómago.',
             '<b>ACOMPAÑA.</b> Respira hacia ahí y sostén la sensación 20-60 seg SIN ejecutar la conducta.',
             '<b>ACTÚA.</b> Cuando baje la ola, elige un paso pequeño con sentido, no el alivio rápido.'],
      tool:{nombre:'Bajar la alerta', url:'https://aprens-bajaralerta.netlify.app', desc:'Para parar antes de actuar y bajar revoluciones cuando el impulso compulsivo te empuja.'},
      alt:{nombre:'Acompañar la sensación', url:'https://aprens-acompanar-sensacion.netlify.app'} },
    delante:{ em:'🐒🙅', tit:'Lo llevo delante, juzgándolo', etiqueta:'delante (lo juzgo)', color:'delante', param:'densidad',
      galt:'Delante, juzgándolo', gald:'Lo juzgo, me reprocho y me sobreexijo no sentir.',
      donde:'Lo tienes delante para señalarlo: lo juzgas, te reprochas por sentirlo y te sobreexiges («no debería estar así», «tendría que poder»). Pelear con el mono y exigirle calma no lo tranquiliza: lo asusta más.',
      pasos:['<b>PARA.</b> Date cuenta de que te estás juzgando o exigiendo. Suelta el reproche un momento.',
             '<b>SIENTE.</b> Deja de pelear: lleva la atención a la sensación tal como está, sin etiquetarla de «mala».',
             '<b>ACOMPAÑA.</b> Respira hacia ahí y trátala como tratarías a alguien con miedo: con amabilidad.',
             '<b>ACTÚA.</b> Da un paso amable contigo, no uno exigente.'],
      tool:{nombre:'AIS desde el amor', url:'https://aprens-aisdiaadia.netlify.app', desc:'Para dejar de pelearte y exigirte, y acompañar lo que sientes desde el cariño, no el control.'},
      alt:{nombre:'Acompañar la sensación', url:'https://aprens-acompanar-sensacion.netlify.app'} },
    maletero:{ em:'🐒📦', tit:'Lo llevo detrás, escondido', etiqueta:'detrás (lo escondo)', color:'maletero', param:'densidad',
      galt:'Detrás, escondido', gald:'Lo reprimo, lo tapo y me avergüenzo de sentirlo.',
      donde:'Lo escondes detrás: reprimes lo que sientes, lo tapas y te avergüenzas de ello. Te distraes o aparentas que no pasa nada. Pero lo que encierras no desaparece: sigue ahí, esperando, y vuelve con más fuerza.',
      pasos:['<b>PARA.</b> Baja el volumen de la distracción o del «no pasa nada» un momento.',
             '<b>SIENTE.</b> Abre con cuidado lo que escondes: ¿dónde lo notas en el cuerpo?',
             '<b>ACOMPAÑA.</b> Respira hacia esa zona y quédate 20-60 seg. No hay nada de qué avergonzarse: solo es una sensación.',
             '<b>ACTÚA.</b> Elige un paso que cuide, no que tape.'],
      tool:{nombre:'AIS desde la curiosidad', url:'https://aprens-aiscuriosidad.netlify.app', desc:'Para girarte hacia lo que escondes y mirarlo con curiosidad sensorial (temperatura, peso, textura), sin vergüenza.'},
      alt:{nombre:'Acompañar la sensación', url:'https://aprens-acompanar-sensacion.netlify.app'} },
    lado:{ em:'🐒🧡', tit:'Lo llevo a mi lado', etiqueta:'a mi lado', color:'lado', param:'continuidad',
      galt:'A mi lado', gald:'Aparezco, sostengo el dolor y decido según mis valores.',
      donde:'Aquí apareces tú, a nivel consciente: te haces cargo del dolor, lo sostienes sin pelearte con él y, aun así, decides hacia dónde ir según lo que te importa, a pesar del camino y sus circunstancias. El volante sigue en tus manos.',
      pasos:['<b>Quédate.</b> Nota que el mono viaja a tu lado y que apareces tú, consciente.',
             '<b>Sostén.</b> Hazte cargo del dolor sin pelearte con él: respíralo, déjalo estar.',
             '<b>Decide.</b> Elige el paso coherente con lo que te importa, a pesar del camino y sus circunstancias.',
             '<b>Vuelve.</b> Acompáñalo otra vez a lo largo del día; el AIS también se practica cuando estás bien.'],
      tool:{nombre:'Brújula de valores', url:'https://aprens-brujulavalores.netlify.app', desc:'Para decidir hacia dónde ir según lo que te importa, sosteniendo el malestar y a pesar del camino.'},
      alt:{nombre:'AIS desde el amor', url:'https://aprens-aisdiaadia.netlify.app'} }
  };
  var ORDEN=['conduce','delante','maletero','lado'];

  // Circuito interno: herramientas ya migradas a la app → ruta interna (sin salir a Netlify).
  // Añade aquí cada URL a medida que se migre su herramienta.
  var INTERNAL_ROUTES = {
    'https://aprens-bajaralerta.netlify.app':  '#/tool/bajar_alerta',
    'https://aprens-aiscuriosidad.netlify.app':'#/tool/ais_curiosidad'
  };

  var KW = {
    conduce:['exploté','explote','reaccioné','reaccione','sin pensar','me dejé llevar','me deje llevar','impulso','de golpe','comprobar','compruebo','reviso','revisar','no paro de mirar','repetir','repito','una y otra vez','ritual','compulsi','necesito hacer','no puedo evitar hacer','tengo que hacer','para calmarme','para aliviar','me distraigo haciendo','huyo','escapo','salí corriendo','sali corriendo','consumo','como para','bebo para','me lavo','limpio','ordeno sin parar','no puedo parar de','para no sentir hago',
      'perdí el control','perdi el control','me cegué','me cegue','me pudo','me superó','me supero','salté','salte','me lancé','me lance','piloto automático','piloto automatico','en automático','en automatico','sin darme cuenta','no me reconozco','me arrepiento','grité','grite','di un portazo','portazo','mandé un mensaje','mande un mensaje','escribí sin pensar','escribi sin pensar','llamé sin parar','llame sin parar','atracón','atracon','comí sin parar','comi sin parar','picoteo','me fui de compras','compré sin','compre sin','gasté','gaste','fumé','fume','vapeé','vapee','un porro','beber','copas','me emborraché','me emborrache','scroll','el móvil sin parar','el movil sin parar','las redes','redes sociales','porno','me rasqué','me rasque','me mordí','me mordi','me corté','me corte','autolesión','autolesion','evito','evitar','cancelé','cancele','no fui','no salí','no sali','me quedé en casa','me quede en casa','postergo','procrastino','lo dejo para luego','lo aplazo','me anestesio','me evado','me desconecto','para que pare','que pare ya','no aguanto el malestar','lo que sea con tal de','busco alivio','busqué alivio','busque alivio','para no pensar hago','hice algo para',
      'vaig esclatar','vaig explotar','em vaig deixar dur','em vaig deixar endur','de cop','de sobte','comprovar','no puc parar de','per calmar-me','per alleujar','vaig fugir','vaig sortir corrents','vaig perdre el control','pilot automàtic','pilot automatic','cop de porta','el mòbil sense parar','el mobil sense parar','les xarxes','no vaig sortir','vaig quedar a casa','ho deix per després','ho deix per despres','vaig beure','em vaig emborratxar','no aguant el malestar','per no sentir','menj per','bec per','evadesc','em distrec',
      'ya lo haré mañana','ya lo hare mañana','lo haré mañana','no tengo ganas de pensar','mejor me distraigo','no quiero ir','lo pasaré mal','lo pasare mal','prefiero quedarme en casa','no le cojo el teléfono','no le cojo el telefono','evitando hablar','evitando','no tendré que enfrentarme','no tendre que enfrentarme','enfrentarme a ello','si no voy','cambio de conversación','cambio de conversacion','no quiero remover','remover el pasado','hasta que no lo tenga claro','no puedo estar tranquilo','necesito saber','qué va a pasar','que va a pasar','mil vueltas','le doy vueltas','darle vueltas','no puedo dejar de pensar','no dejo de pensar','veinte veces','mirar el móvil','mirar el movil','miro el móvil','miro el movil','asegurarme','necesito asegurar','busco información','busco informacion','no paro de preguntar','preguntar a los demás','preguntar a los demas','qué harían','que harian','repaso la conversación','repaso la conversacion','solución perfecta','solucion perfecta','mi cabeza no para','la cabeza no para','toda la noche pensando','y si sale mal','y si pasa algo','apagar la mente','no puedo apagar','imaginando escenarios','imagino escenarios','pienso demasiado','cabeza va más rápido','cabeza va mas rapido','no consigo desconectar','no puedo desconectar','no logro desconectar','acabé explotando','acabe explotando','perdí los nervios','perdi los nervios','le grité','le grite','a la mínima','a la minima','me arrepentí','me arrepenti','de lo que dije','si no lo tengo controlado','tenerlo todo controlado','no paro de darle vueltas',
      'ja ho faré demà','ja ho fare dema','ho faré demà','no hi vull anar','prefereixo quedar a casa','no li agaf el telèfon','no li agaf el telefon','evit aquest tema','si no hi vaig','canviam de tema','canvio de tema','no vull remoure','remoure el passat','fins que no ho tengui clar','no estaré tranquil','no estare tranquil','necessit saber','què passarà','que passara','mil voltes','li don voltes','donar voltes','no puc deixar de pensar','vint vegades','comprovar una altra vegada','ho he de comprovar','cerc informació','cerc informacio','que qualcú em digui','què he de fer','que he de fer','repàs la conversa','repas la conversa','solució perfecta','solucio perfecta','el meu cap no atura','es meu cap no atura','el cap no atura','tota la nit pensant','i si surt malament','i si passa qualque cosa','i si passa res','apagar es cap','apagar el cap','imagin escenaris','pens massa','penso massa','cap va més ràpid','cap va mes rapid','no aconseguesc desconnectar','no puc desconnectar','he acabat explotant','he perdut es papers','he perdut els papers','li he cridat','he botat a la mínima','he botat a la minima','men he penedit','del que he dit','si no ho tenc controlat','tenc controlat','no atur de donar','donar-li voltes',
      'ya se arreglará solo','ya se arreglara solo','no tengo energía para eso','no tengo energia para eso','hoy no es el día','hoy no es el dia','dejarlo correr','dejar correr','mejor no entrar en ese tema','no me apetece verlo','no me apetece','lo voy dejando','ya veré qué hago','ya vere que hago','me cuesta ponerme','se me quitan las ganas','pendiente todo el rato','estoy pendiente','no bajo la guardia','siempre estoy alerta','estoy alerta','por si acaso','atento a cualquier señal','atento a cualquier senal','no me fío','no me fio','va a pasar algo','algo no va bien','observando constantemente','qué harías','que harias','dime que estoy exagerando','segunda opinión','segunda opinion','está todo bien','esta todo bien','seguro que no pasa nada','dime que no es grave','estás enfadado conmigo','estas enfadado conmigo','lo he hecho mal','te parece bien','necesito saber qué piensas','necesito saber que piensas','pendiente de cómo está','pendiente de como esta','necesito saber si me quiere','vueltas a sus mensajes','que tarde en contestar','quiero que cambie','interpretando lo que hace','no quiero equivocarme','cien vueltas','antes de enviarlo','me llevo el trabajo a casa','pendiente del correo','me cuesta desconectar','quiero que salga perfecto','no quiero decepcionar','me preocupa lo que pensarán','me preocupa lo que pensaran','haciéndome cargo de todo','haciendome cargo de todo','ya da igual','paso de todo','me da igual lo que me pase','me he dejado ir','no me cuido como debería','no me cuido como deberia','cabeza como un bombo',
      'ja passarà','ja passara','no tenc es cap per això','no tenc el cap per això','no tenc es cap per aixo','ho deixarem per més endavant','ho deixarem per mes endavant','no em ve de gust','millor no entrar-hi','ho deix córrer','ho deix correr','no és bon moment','no es bon moment','ja ho veurem','em costa posar','ho pens i ja em cans','estic pendent de tot','estic pendent','no baix la guàrdia','no baix la guardia','sempre estic alerta','estic alerta','per si de cas','em fa botar','no men refii','mal pressentiment','no em quadra','ho vigil constantment','ho vigil','tu què faries','tu que faries','digues-me que no és res','digues-me que no es res','una altra opinió','una altra opinio','creus que està bé','creus que esta be','segur que no passa res','digues-me que no és greu','digues-me que no es greu','estàs enfadat amb jo','estas enfadat amb jo','ho he fet malament','tho sembla bé','què en penses','que en penses','estic pendent de com està','estic pendent de com esta','necessit saber si','voltes als seus','que no contesti','voldria que canviàs','voldria que canvias','interpret tot el que fa','interpret tot','no em vull equivocar','ho revis mil vegades','revis mil vegades','sa feina a casa','mir es correu','mir el correu','em costa desconnectar','ho vull perfecte','no vull decebre','em preocupa què pensaran','em preocupa que pensaran','acab carregant amb tot','carregant amb tot','tant me fa','pass de tot','deixat anar','no em cuid gens','passat de voltes','vaig passat de voltes','cap com un timbal','es cap com un timbal'],
    delante:['me juzgo','me critico','me reprocho','reprocho','no debería','no deberia','tendría que','tendria que','debería poder','deberia poder','me exijo','me sobreexijo','soy débil','soy debil','soy un desastre','qué tontería','que tonteria','no tengo que estar así','no tengo que estar asi','no tendría que sentir','me riño','me enfado conmigo','me machaco','está mal sentir','esta mal sentir','no debería sentir','no deberia sentir','me culpo','soy patético','soy patetico','vaya mierda de','no puedo estar así',
      'no debería pasarme','no deberia pasarme','exagero','soy un exagerado','soy una exagerada','qué ridículo','que ridiculo','qué ridícula','que ridicula','me obligo a estar bien','tengo que poder','debería superarlo','deberia superarlo','otros pueden y yo no','no es para tanto','me frustro conmigo','rabia conmigo','me regaño','me castigo','no me lo permito','no me doy permiso','lucho contra','peleo con lo que siento','quiero quitármelo','quiero quitarmelo','quiero que desaparezca','intento controlarlo','me esfuerzo en no sentir','me presiono','soy demasiado sensible','demasiado sensible','tendría que ser más fuerte','tendria que ser mas fuerte','soy un cobarde','soy una cobarde','me da rabia sentirme así','me da rabia sentirme asi','me odio por','no me lo perdono','tendría que estar bien ya','tendria que estar bien ya','soy tonto por','soy tonta por','vaya inútil','vaya inutil','no valgo','soy un fracaso','me avergüenzo de mí','me averguenzo de mi','me fuerzo a','me obligo a',
      'em jutj','em jutjo','em critic','em critico','exigesc','exigeixo','no hauria de','hauria de poder','som dèbil','som debil','som un desastre','quina ximpleria','no hauria de sentir','ràbia de sentir','rabia de sentir','em culp','em culpo','som patètic','som patetic','som un fracàs','som un fracas','massa sensible','hauria de ser més fort','hauria de ser mes fort','em castig','em castigo','lluit contra','vull que desaparegui','no ho permet','em fot ràbia','em fot rabia'],
    maletero:['me avergüenzo','me averguenzo','vergüenza','verguenza','lo escondo','escondo lo que siento','lo reprimo','reprimo','disimulo','que no se note','aparento','aparentar','hago como si nada','como si no pasara','no quiero que sepan','no quiero que me vean','me lo trago','me lo guardo','aguanto y callo','finjo','fingir','oculto','lo tapo','lo entierro','no lo demuestro','me hago el fuerte','me hago la fuerte','trago',
      'que nadie lo note','que no se den cuenta','sonrío por fuera','sonrio por fuera','pongo buena cara','buena cara','una máscara','una mascara','hago teatro','finjo que estoy bien','digo que estoy bien','estoy bien (mentira)','me lo callo','no lo cuento','no se lo digo a nadie','me lo guardo dentro','en un cajón','en un cajon','mejor no remover','prefiero no pensarlo','prefiero no sentir','cambio de tema','miro hacia otro lado','lo ignoro','hago como que no','no quiero molestar','no quiero preocupar','me trago las lágrimas','me trago las lagrimas','aguanto el tipo','en privado me derrumbo','a solas lloro','nadie sabe lo que','escondo cómo me siento','escondo como me siento','me contengo','contengo','me aguanto','no muestro debilidad','no quiero dar pena','me escondo','lo callo','lo silencio','lo guardo para mí','lo guardo para mi','que no me noten','disimular',
      'em fa vergonya','vergonya','ho amag','ho amago','amagar','ho reprimesc','ho reprimeixo','reprimir','dissimul','dissimular','que no es noti','faig com si res','com si no passàs','com si no passas','no vull que ho sàpiguen','no vull que ho sapiguen','ho call','ho callo','ho guard','ho guardo','fingesc','ho tap','ho tapo','pos bona cara','faig bona cara','una màscara','una mascara','faig teatre','dic que estic bé','dic que estic be','no ho cont a ningú','no ho cont a ningu','en privat','no vull molestar','no vull preocupar','em faig el fort','em faig la forta','ho engul',
      'no se lo cuento a nadie','no se lo cuento','son cosas mías','son cosas mias','cosas mías','ya se me pasará','ya se me pasara','se me pasará','no vale la pena','no merece la pena hablar','nadie entendería','nadie entenderia','nadie me entiende','son tonterías','son tonterias','es una tontería','por dentro esté fatal','por dentro estoy fatal','por dentro fatal','por dentro estoy mal','lloro cuando no hay nadie','cuando no hay nadie','espero a estar solo','para desahogarme','encerrarme','me encierro en','me aparto de todos','me alejo de todos','me aíslo','me aislo','no quiero que me vean así','no quiero que me vean asi','no quiero hablar de eso','no quiero hablar de ello','lo llevo todo por dentro','todo por dentro','necesito estar solo','por dentro estoy roto','por dentro estoy hecho polvo','nadie sabe cómo estoy','nadie sabe como estoy','me muerdo la lengua','aguanto hasta que exploto','hago como que estoy bien','hago ver que estoy bien','hecho polvo pero tiro adelante','ya se me irá pasando','ya se me ira pasando',
      'són coses meves','son coses meves','coses meves','ja em passarà','ja em passara','em passarà','no val la pena','no val la pena parlar','ningú entendria','ningu entendria','ningú ho entendria','són beneitures','son beneitures','beneitures','faig veure que no passa res','faig veure que','per dins estigui fet pols','per dins estic fet pols','plor quan estic tot sol','ploro quan estic sol','esper estar sol','per desfogar-me','encerro a','tancar-me','no vull que em vegin','que em vegin així','que em vegin aixi','alluny de tothom','no en vull parlar','no vull parlar-ne','anirà passant','anira passant','ho duc tot per dins','tot per dins','necessit estar tot sol','necessito estar sol','em faig fort','per dins estic rebentat','ningú sap com estic','ningu sap com estic','em mosseg la llengua','em mossego la llengua','aguant fins que explot','faig veure que estic bé','faig veure que estic be',
      'me lo he tragado otra vez','me lo he tragado','he vuelto a callarme','vuelto a callarme','no dije nada para evitar','para evitar problemas','me hervía la sangre','me hervia la sangre','estaba a punto de saltar','a punto de saltar','aguanté demasiado','aguante demasiado','me fui para no decir','lo dejé pasar pero me dolió','lo deje pasar pero me dolio','me quedé con ganas de decir','me quede con ganas de decir','espero que se dé cuenta solo','espero que se de cuenta solo','no le digo nada','acabaremos discutiendo','me callo para evitar','no quiero parecer pesado','no me atrevo a decir que no','no me atrevo a decir',
      'tornat a empassar','he tornat callar','tornat a callar','no he dit res','bullia per dins','estava a punt','he aguantat massa','he partit abans de dir','ho he deixat passar','deixat passar','moltes coses per dir','coses per dir','adoni tot sol','no li dic res','call per evitar','no vull semblar pesat','atrevesc a dir'],
    lado:['me hago cargo','lo sostengo','sostengo','lo acepto','lo acompaño','acompañándolo','acompanandolo','respiro y sigo','decido','elijo','aun así sigo','aun asi sigo','a pesar de','sigo mi camino','con mis valores','aparezco','soy consciente','lo dejo estar','sin pelear','sin luchar','lo abrazo','me cuido','con cariño','lo escucho','estoy presente','en calma','convivo con',
      'lo noto y respiro','le hago sitio','le doy espacio','dejo que esté','dejo que este','permito sentir','me permito sentir','me permito','está bien sentir','esta bien sentir','puedo con esto','lo miro de frente','le pongo nombre','validar lo que siento','valido lo que siento','me trato con amabilidad','con compasión','con compasion','me hablo bien','soy amable conmigo','me acompaño','no estoy solo','no estoy sola','me siento a su lado','sigo adelante','doy un paso','hago lo que importa','lo que me importa','fiel a mis valores','hacia lo que quiero','avanzo despacio','paso a paso','acepto que es duro','observo sin juzgar','dejo que pase','suelto','aquí y ahora','aqui y ahora','me responsabilizo','tomo las riendas','llevo yo el volante','conduzco yo','sin pelearme con','dejo que fluya','me quedo con lo que siento','lo atiendo','le doy un abrazo','con amabilidad','con ternura',
      'faig càrrec','faig carrec','ho sostenc','ho sostinc','ho accept','ho accepto','acompany','acompanyo','respir i seguesc','respir i segueixo','decidesc','decideixo','tot i així','tot i aixo','malgrat','el meu camí','el meu cami','amb els meus valors','som conscient','ho deix estar','sense barallar-me','sense lluitar','abraç','abraço','em cuid','em cuido','amb tendresa','amb estima','escoltar','ho escolt','estic present','convisc amb','li faig lloc','em permet sentir','em permeto sentir','està bé sentir','esta be sentir','ho mir de cara','li pos nom','li poso nom','pas a pas','cap al que vull','el que importa','observ sense jutjar','observar sense jutjar','deix que passi','agaf les regnes','agafo les regnes','condueixo jo','conduesc jo']
  };

  var CONTEXTOS = ['En casa','En el trabajo','Solo/a','Con la pareja','Con la familia','Con los hijos/as','Por salud','Otro'];
  var MICROS = ['Respirar 1 minuto','Beber agua / pausa','Dar un paseo corto','Decir cómo me siento','Hacer una sola tarea','Pedir ayuda','Descansar sin culpa','Un gesto amable conmigo'];

  var PREGUNTAS = [
    { q:'Cuando aparece la emoción incómoda, ¿qué haces con ella?', opts:[
      {t:'Hago algo para aliviarla ya (comprobar, huir, repetir)', em:'🚗', pos:'conduce'},
      {t:'Me juzgo y me exijo no sentirla', em:'🙅', pos:'delante'},
      {t:'La escondo y disimulo, me da vergüenza', em:'📦', pos:'maletero'},
      {t:'Me hago cargo de ella y sigo según lo que me importa', em:'🧡', pos:'lado'} ]},
    { q:'¿Cómo te tratas a ti mismo/a ahora?', opts:[
      {t:'Me dejo llevar por el impulso', em:'🚗', pos:'conduce'},
      {t:'Me reprocho y me sobreexijo', em:'🙅', pos:'delante'},
      {t:'Me avergüenzo y lo reprimo', em:'📦', pos:'maletero'},
      {t:'Me acompaño con amabilidad', em:'🧡', pos:'lado'} ]},
    { q:'¿Qué pasa con lo que sientes?', opts:[
      {t:'Acabo haciendo cosas para no sentirlo', em:'🚗', pos:'conduce'},
      {t:'Lo tengo delante, criticándolo todo el rato', em:'🙅', pos:'delante'},
      {t:'Lo empujo hacia atrás para que no se vea', em:'📦', pos:'maletero'},
      {t:'Lo sostengo y decido igualmente', em:'🧡', pos:'lado'} ]},
    { q:'Si imaginas el mono en el coche…', opts:[
      {t:'Lleva él el volante (hago cosas sin parar)', em:'🚗', pos:'conduce'},
      {t:'Va delante y lo riño o lo señalo', em:'🙅', pos:'delante'},
      {t:'Lo he escondido detrás', em:'📦', pos:'maletero'},
      {t:'Va a mi lado y conduzco yo', em:'🧡', pos:'lado'} ]}
  ];

  var EMO=['triste','tristeza','tristesa','estic trist','no tengo ganas','no tinc ganes','sin ganas','sense ganes','no me apetece nada','no em ve de gust res','no disfruto','no gaudesc','no gaudeixo','no siento placer','no sent plaer','no me ilusiona','no em fa il','vacío','vacio','buit','apático','apatico','apàtic','apatia','desganado','desganada','desganat','desanimado','desanimada','desanimat','desánimo','desanimo','desànim','bajón','bajon','baixó','baixon','hundido','hundida','enfonsat','enfonsada','sin energía','sin energia','sense energia','agotado','agotada','esgotat','esgotada','sin fuerzas','sense forces','angustia','angoixa','ansioso','ansiosa','ansiós','ansietat','ansiedad','nervioso','nerviosa','nerviós','miedo','por','rabia','ràbia','enfadado','enfadada','enfadat','culpa','solo','sola','tot sol','tota sola','no le veo sentido','no li veig sentit','no le encuentro sentido','llorar','plorar','lloro','plor','quiero llorar','vull plorar','no me reconozco','no em reconec','perdido','perdida','perdut','perduda','hecho polvo','feta pols','fet pols'];

  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function fechaBonita(){var d=new Date(),m=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];return d.getDate()+' de '+m[d.getMonth()]+' de '+d.getFullYear()+', '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
  function hoy(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}

  function mount(app){
    var sel={ texto:'', contexto:'', respuestas:[null,null,null,null], pos:null, conf:'', pistas:'', micro:'', aprende:null, ts:0 };
    if(window.Aprens){ Aprens.config({ toolId:TOOL_ID, toolName:TOOL_NAME, toolVersion:1 }); Aprens.collect(()=> app._aprensRec || null); }

    app.innerHTML = `<div class="dmono">
      <div class="dm-head">
        <span class="kicker">🐒 El detective del mono</span>
        <h1>¿Dónde está tu mono ahora mismo?</h1>
        <p class="sub">Cuéntame qué estás viviendo (o responde unas preguntas) y trato de adivinar cómo estás tratando a tu mono. Verás el dibujo de dónde lo llevas y una herramienta para acompañarlo.</p>
      </div>

      <section class="screen active" data-s="s-intro">
        <div class="card">
          <h3>Tu mono puede ir en 4 sitios</h3>
          <p class="lead">El «mono» es tu parte emocional, tu niño/a interior. Lo que cambia no es la emoción, sino <b>cómo la tratas</b>:</p>
          <div class="gal" data-galeria></div>
          <button class="btn" data-go="s-escribir">Empezar</button>
          <p class="aviso">No se guarda nada ni se envía a ningún sitio: todo ocurre en tu móvil.</p>
        </div>
      </section>

      <section class="screen" data-s="s-escribir">
        <div class="card">
          <h3>Cuéntamelo con tus palabras</h3>
          <p class="lead">¿Qué estás sintiendo o viviendo ahora mismo? Escribe con naturalidad, como se lo contarías a alguien.</p>
          <textarea data-in-texto placeholder="Ej.: «Estoy fatal y encima me reprocho estar así, me digo que no debería sentirme tan débil…»"></textarea>
          <p class="lead" style="margin:14px 0 4px">¿Dónde te pasa? (opcional)</p>
          <div class="chips" data-ctx-chips></div>
          <button class="btn" data-act="adivinar-texto">🔍 Adivinar dónde está mi mono</button>
          <button class="lnk" data-act="ir-preguntas">Prefiero responder unas preguntas →</button>
        </div>
      </section>

      <section class="screen" data-s="s-preg">
        <div class="card">
          <h3>4 preguntas rápidas</h3>
          <div data-puente class="puente" style="display:none"></div>
          <p class="lead">Elige la opción que más se parezca a ti ahora. No hay respuestas correctas.</p>
          <div data-preg-box></div>
          <button class="btn" data-act="ver-preg" disabled>Ver dónde está mi mono</button>
          <button class="lnk" data-go="s-escribir">← Prefiero escribirlo</button>
        </div>
      </section>

      <section class="screen" data-s="s-result">
        <div class="resHead" data-res-head></div>
        <div class="card">
          <h3 data-res-donde></h3>
          <p class="lead" data-res-texto></p>
          <div class="pistas" data-res-pistas></div>
        </div>
        <div class="card">
          <h3>Cómo llevarlo a tu lado · AIS en 4 pasos</h3>
          <p class="lead">El AIS es la forma concreta de sentarte junto al mono:</p>
          <ol class="pasos" data-res-pasos></ol>
        </div>
        <div class="card">
          <h3>Tu herramienta de esta vez</h3>
          <p class="lead">La que mejor encaja con cómo estás tratando a tu mono ahora:</p>
          <a class="tool" data-tool-main href="#" target="_blank" rel="noopener"></a>
          <p class="alt" data-tool-alt></p>
        </div>
        <div class="card">
          <h3>Y un paso pequeño con valor</h3>
          <p class="lead">Algo mínimo, en tu dirección, mientras el mono va a tu lado:</p>
          <div class="chips" data-micro-chips></div>
        </div>
        <div class="card">
          <h3>Envíaselo a tu psicólogo/a</h3>
          <p class="lead">Para que pueda acompañarte mejor entre sesiones.</p>
          <div class="wa">
            <h4>📋 Tu resumen</h4>
            <textarea data-out readonly></textarea>
            <div style="background:#fff5e9;border-left:4px solid #d99a3a;border-radius:10px;padding:11px 13px;margin:0 0 13px;font-size:13.5px;line-height:1.45;color:#7a5510;text-align:left"><b>⏱️ ¿Cuándo enviármelo?</b> En cuanto termines, <b>mándamelo en ese momento</b>. Esta herramienta se usa cuando te pasa algo.</div>
            <div class="row2">
              <button class="btn wabtn" data-send="wa">Enviar por WhatsApp</button>
              <button class="btn copybtn" data-send="copy">Copiar</button>
            </div>
          </div>
          <button class="btn ghost" data-act="reiniciar">Volver a empezar</button>
          <p class="aviso">¿Quieres el check-in completo del mono con el cuento? <a data-nav="#/tool/estado_mono" href="#/tool/estado_mono" style="color:var(--terra-d);font-weight:600">Ábrelo aquí</a> · o vuelve a tu <a data-nav="#/" href="#/" style="color:var(--terra-d);font-weight:600">inicio</a>.</p>
        </div>
      </section>

      <div class="dm-footer">
        <div><span class="logo">APRENS</span> · Psicología (TEC / AIS / ACT)</div>
        <div>Una herramienta de acompañamiento, no un diagnóstico.</div>
      </div>
    </div>`;

    var root=app.querySelector('.dmono');
    var $=s=>root.querySelector(s), $$=s=>root.querySelectorAll(s);
    function go(id){ $$('.screen').forEach(s=>s.classList.toggle('active', s.dataset.s===id)); window.scrollTo({top:0,behavior:'smooth'}); }

    // galería
    $('[data-galeria]').innerHTML = ORDEN.map(id=>{var p=POS[id];return '<div class="galc">'+MONO_SVG(id)+'<div class="gt">'+esc(p.galt)+'</div><div class="gd">'+esc(p.gald)+'</div></div>';}).join('');

    // contexto
    function pintaContexto(){
      $('[data-ctx-chips]').innerHTML = CONTEXTOS.map(c=>`<button class="chip" data-ctx="${esc(c)}">${esc(c)}</button>`).join('');
      $$('[data-ctx]').forEach(b=>b.onclick=()=>{ var on=b.classList.contains('sel'); $$('[data-ctx]').forEach(x=>x.classList.remove('sel')); if(!on){b.classList.add('sel');sel.contexto=b.dataset.ctx;} else sel.contexto=''; });
    }

    // preguntas
    function pintaPreguntas(){
      $('[data-preg-box]').innerHTML = PREGUNTAS.map((p,i)=>`<div class="qcard"><div class="qtit">${i+1}. ${esc(p.q)}</div>`+
        p.opts.map((o,j)=>`<button class="opt" data-q="${i}" data-pos="${o.pos}"><span class="em">${o.em}</span><span>${esc(o.t)}</span></button>`).join('')+`</div>`).join('');
      $$('[data-preg-box] .opt').forEach(btn=>btn.onclick=()=>{
        var qi=+btn.dataset.q; sel.respuestas[qi]=btn.dataset.pos;
        btn.parentNode.querySelectorAll('.opt').forEach(b=>b.classList.remove('sel')); btn.classList.add('sel');
        var done=sel.respuestas.filter(r=>r).length; $('[data-act="ver-preg"]').disabled = done<2;
      });
    }

    // clasificador
    function scoreTexto(txt){ var s={conduce:0,delante:0,maletero:0,lado:0}; if(!txt) return s; var t=' '+txt.toLowerCase().replace(/\s+/g,' ')+' '; ORDEN.forEach(k=>{KW[k].forEach(w=>{if(t.indexOf(w)>=0)s[k]++;});}); return s; }
    function scorePreguntas(){ var s={conduce:0,delante:0,maletero:0,lado:0}; sel.respuestas.forEach(r=>{if(r)s[r]++;}); return s; }
    function clasificar(usarTexto,usarPreg){
      var s={conduce:0,delante:0,maletero:0,lado:0};
      if(usarTexto){var st=scoreTexto(sel.texto);ORDEN.forEach(k=>s[k]+=st[k]);}
      if(usarPreg){var sp=scorePreguntas();ORDEN.forEach(k=>s[k]+=sp[k]*2);}
      var top=ORDEN[0]; ORDEN.forEach(k=>{if(s[k]>s[top])top=k;});
      var total=s.conduce+s.delante+s.maletero+s.lado;
      var seg=null,segV=-1; ORDEN.forEach(k=>{if(k!==top&&s[k]>segV){segV=s[k];seg=k;}});
      var margen=s[top]-segV, conf;
      if(total===0) conf='Necesito un poco más para acertar';
      else if(s[top]>=3&&margen>=2) conf='Bastante claro';
      else if(margen>=1) conf='Probablemente';
      else conf='No del todo claro';
      return {scores:s,top:top,seg:seg,margen:margen,total:total,conf:conf};
    }
    function mensajePuente(txt){
      var t=(txt||'').toLowerCase().replace(/\s+/g,' ');
      var emo=EMO.some(w=>t.indexOf(w)>=0);
      if(emo) return '<b>Has nombrado muy bien cómo te sientes</b> 🧡. Eso ya es un paso importante.<br>Ahora vamos a mirar <b>qué sueles hacer</b> con ese malestar: ahí está la pista de dónde llevas a tu mono.';
      return 'Con esto solo no acabo de pillarlo 🙈. Vamos a unas preguntas rápidas para afinar dónde llevas a tu mono.';
    }
    function irAPreguntas(){ var pu=$('[data-puente]'); if(pu){pu.style.display='none';pu.innerHTML='';} go('s-preg'); }
    function adivinarDesdeTexto(){
      sel.texto=$('[data-in-texto]').value.trim();
      if(!sel.texto){ irAPreguntas(); return; }
      var r=clasificar(true,false);
      if(r.total===0){ var pu=$('[data-puente]'); if(pu){pu.innerHTML=mensajePuente(sel.texto);pu.style.display='block';} go('s-preg'); return; }
      mostrarResultado(r,'texto');
    }
    function adivinarDesdePreguntas(){ sel.texto=$('[data-in-texto]').value.trim(); mostrarResultado(clasificar(!!sel.texto,true),'preg'); }

    function pistaFrase(r,fuente){
      if(fuente==='preg'){ var n=sel.respuestas.filter(x=>x).length; return 'Lo deduzco por tus respuestas ('+n+' de 4)'+(sel.texto?' y por lo que has escrito':'')+'. '; }
      return 'Lo deduzco por cómo lo has descrito. ';
    }
    function mostrarResultado(r,fuente){
      var p=POS[r.top]; sel.pos=r.top; sel.conf=r.conf; sel.ts=Date.now();
      sel.aprende=null;
      if(sel.texto && fuente==='preg'){ var stOnly=scoreTexto(sel.texto); if(stOnly[r.top]===0) sel.aprende={frase:sel.texto,pos:r.top}; }
      var c=p.color, head=$('[data-res-head]');
      head.style.background='linear-gradient(135deg,var(--'+c+') 0%,var(--'+c+'-d) 100%)';
      head.innerHTML=MONO_SVG(r.top)+'<h2>'+esc(p.tit)+'</h2><div class="conf">'+esc(r.conf)+(r.conf==='No del todo claro'&&r.seg?' · mira también «'+esc(POS[r.seg].tit)+'»':'')+'</div>';
      $('[data-res-donde]').textContent='Qué estás haciendo con tu mono';
      $('[data-res-texto]').textContent=p.donde;
      var pis=pistaFrase(r,fuente);
      if(r.conf==='No del todo claro'&&r.seg) pis+='Si no te encaja del todo, podrías estar también «'+POS[r.seg].tit.toLowerCase()+'».';
      else pis+='Lo importante no es acertar el nombre, sino acercarte a tu lado.';
      sel.pistas=pis; $('[data-res-pistas]').innerHTML='💡 '+pis;
      $('[data-res-pasos]').innerHTML=p.pasos.map(x=>'<li>'+x+'</li>').join('');
      var tm=$('[data-tool-main]'); var rMain=INTERNAL_ROUTES[p.tool.url];
      if(rMain){ tm.setAttribute('href',rMain); tm.removeAttribute('target'); tm.removeAttribute('rel'); }
      else { tm.setAttribute('href',p.tool.url); tm.setAttribute('target','_blank'); tm.setAttribute('rel','noopener'); }
      tm.innerHTML='<span class="tn">🧰 '+esc(p.tool.nombre)+'</span><span class="td">'+esc(p.tool.desc)+'</span><span class="go">'+(rMain?'Abrir en la app →':'Abrir herramienta →')+'</span>';
      var rAlt=INTERNAL_ROUTES[p.alt.url];
      var altA = rAlt ? '<a href="'+rAlt+'">'+esc(p.alt.nombre)+'</a>'
                      : '<a href="'+esc(p.alt.url)+'" target="_blank" rel="noopener">'+esc(p.alt.nombre)+'</a>';
      $('[data-tool-alt]').innerHTML='¿No te encaja? Prueba también: '+altA+'.';
      pintaMicros(); construirResumen(); go('s-result');
    }
    function pintaMicros(){
      $('[data-micro-chips]').innerHTML = MICROS.map(m=>`<button class="chip${sel.micro===m?' sel':''}" data-mic="${esc(m)}">${esc(m)}</button>`).join('');
      $$('[data-mic]').forEach(b=>b.onclick=()=>{ var on=b.classList.contains('sel'); $$('[data-mic]').forEach(x=>x.classList.remove('sel')); if(!on){b.classList.add('sel');sel.micro=b.dataset.mic;} else sel.micro=''; construirResumen(); });
    }

    function construirResumen(){
      var p=POS[sel.pos]; if(!p) return '';
      var L=[];
      L.push('¿DÓNDE ESTÁ TU MONO? · APRENS · '+fechaBonita()); L.push('');
      if(sel.texto) L.push('Lo que estoy viviendo: '+sel.texto);
      if(sel.contexto) L.push('Contexto: '+sel.contexto);
      L.push('🐒 Dónde está mi mono: '+p.tit+' ('+p.etiqueta+')');
      L.push('Seguridad de la app: '+sel.conf);
      L.push('Foco TEC sugerido: '+p.param);
      L.push('Herramienta sugerida: '+p.tool.nombre+' → '+p.tool.url);
      if(sel.micro) L.push('Microacción con valor: '+sel.micro);
      if(sel.aprende){ L.push(''); L.push('🧠 Para afinar el detective (psicólogo/a):'); L.push('· El texto no activó ninguna pista; lo resolvió el cuestionario.'); L.push('· Frase a aprender → «'+sel.aprende.frase+'»'); L.push('· Posición del cuestionario: '+POS[sel.aprende.pos].tit+' ('+POS[sel.aprende.pos].etiqueta+')'); }
      L.push(''); L.push('(Generado en la app «¿Dónde está tu mono?» de APRENS)');
      var txt=L.join('\n'); var out=$('[data-out]'); if(out) out.value=txt; return txt;
    }

    // persistencia al aprens_db unico
    function persist(){
      var p=POS[sel.pos]; if(!p) return;
      var rec={ id:sel.ts||Date.now(), date:hoy(), ts:sel.ts||Date.now(),
        pos:sel.pos, estado:p.tit, param:p.param, conf:sel.conf,
        herramienta:p.tool.nombre, micro:sel.micro, contexto:sel.contexto, texto:sel.texto };
      if(sel.aprende) rec.aprende={ frase:sel.aprende.frase, pos:sel.aprende.pos };
      app._aprensRec=rec;
      if(window.Aprens) Aprens.save(rec);
    }

    function copiarTexto(txt,btn){
      var ok=()=>{ var t=btn.textContent; btn.textContent='✓ Copiado'; setTimeout(()=>btn.textContent=t,1500); };
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(ok).catch(()=>fallback(txt,ok)); }
      else fallback(txt,ok);
    }
    function fallback(txt,ok){ var ta=$('[data-out]'); ta.focus(); ta.select(); try{document.execCommand('copy');ok();}catch(e){} }

    function reiniciar(){
      sel={ texto:'', contexto:'', respuestas:[null,null,null,null], pos:null, conf:'', pistas:'', micro:'', aprende:null, ts:0 };
      $('[data-in-texto]').value=''; pintaContexto(); pintaPreguntas();
      $('[data-act="ver-preg"]').disabled=true; go('s-intro');
    }

    // wiring
    $$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
    $('[data-act="adivinar-texto"]').onclick=adivinarDesdeTexto;
    $('[data-act="ir-preguntas"]').onclick=irAPreguntas;
    $('[data-act="ver-preg"]').onclick=adivinarDesdePreguntas;
    $('[data-act="reiniciar"]').onclick=reiniciar;
    $$('[data-send]').forEach(b=>b.onclick=()=>{
      persist(); var txt=construirResumen();
      if(b.dataset.send==='wa') window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
      else copiarTexto(txt,b);
      if(window.Aprens) Aprens.mountBar();
    });
    $$('[data-nav]').forEach(a=>a.onclick=e=>{ e.preventDefault(); location.hash=a.dataset.nav; });

    // init
    pintaContexto(); pintaPreguntas();
  }

  window.APRENS_TOOL_donde_esta_mono = { mount };
})();
