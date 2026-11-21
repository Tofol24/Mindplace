/* Biblioteca de situaciones de juego de la Pizarra del entrenador.
   Cada situación está escrita para el 1-4-2-3-1 y la app la adapta al sistema del plan (cada puesto toma el
   movimiento del puesto equivalente). Así cada jugador sale en la pizarra en su puesto de la alineación.

   Índices de nuestro equipo (1-4-2-3-1): 0 portero, 1 lateral izquierdo, 2 central izquierdo, 3 central derecho,
   4 lateral derecho, 5 pivote izquierdo, 6 pivote derecho, 7 extremo izquierdo, 8 mediapunta, 9 extremo derecho,
   10 delantero centro. Rivales: 0 portero y 1-10.
   Campo: x de 0 (izquierda) a 68 (derecha); y de 0 (portería rival) a 105 (nuestra portería). Atacamos hacia y = 0.

   Formato de cada situación:
   { fase: "ataque" | "defensa", cat, vista: "C" | "A" | "D", a: [11 posiciones], r: [11 posiciones],
     pasos: [{ t, b, a: {índice: [x, y]}, r: {índice: [x, y]}, tips: {índice: { m, f, q }}, tr: "p" | "r" }],
     roles: {índice: función del puesto}, bloque: { titulo, texto, consignas: [], fij, cuando, cond, preg: [] },
     fuente: "de dónde sale la idea" }
   Los pasos solo indican lo que cambia. Para añadir situaciones, usa la skill «movimientos-tacticos». */
(function () {
  "use strict";
  const T = (m, f, q) => { const o = {}; if (m) o.m = m; if (f) o.f = f; if (q) o.q = q; return o; };
  const S = {
    // ------------------------------------------------------------------ ataque
    salida3: {
      fase: "ataque", cat: "salida", vista: "D",
      a: [[34, 100], [6, 76], [20, 94], [48, 94], [62, 76], [34, 82], [48, 68], [8, 58], [30, 62], [60, 58], [34, 50]],
      r: [[34, 3], [56, 52], [42, 50], [26, 50], [12, 52], [54, 70], [40, 72], [28, 72], [14, 70], [40, 88], [28, 88]],
      pasos: [
        { t: "Saque de puerta: sus dos delanteros tapan a los centrales", b: [34, 98.5] },
        { t: "El pivote baja entre los centrales: salimos con tres", b: [34, 92.5], a: { 5: [34, 93], 2: [14, 92], 3: [54, 92], 1: [4, 66], 4: [64, 66] },
          tips: { 5: T("Baja entre los centrales y recibe de cara", "Dónde están los dos delanteros", "Cuando el portero pone el balón en el suelo"), 0: T("Juega al pivote o al central libre", "Quién queda solo") } },
        { t: "Tres contra dos: el central libre conduce", b: [54, 81.5], a: { 3: [54, 82] }, r: { 9: [50, 86] },
          tips: { 3: T("Conduce hacia delante hasta que alguien salga a por ti", "El rival que te sale", "En cuanto recibas libre") } },
        { t: "Fija y pasa: al pivote entre líneas o al lateral", b: [44, 62.5], a: { 6: [44, 62], 4: [64, 58] }, r: { 5: [60, 72], 6: [46, 70] },
          tips: { 6: T("Ofrécete a la espalda del medio que salta", "El medio rival", "Cuando el central atrae a su rival") } }
      ],
      roles: { 0: "Portero: busca al pivote o al central que quede libre.", 2: "Central izquierdo: ábrete y conduce si te dejan libre.", 3: "Central derecho: ábrete y conduce si te dejan libre.",
        5: "Pivote: baja entre los centrales para salir con tres.", 1: "Lateral izquierdo: sube por la banda para dar amplitud.", 4: "Lateral derecho: sube por la banda para dar amplitud.",
        6: "Pivote: ofrécete a la espalda del medio que salta." },
      bloque: { titulo: "Salida de tres: el pivote se incrusta", texto: "Portero, centrales, pivotes y laterales contra dos delanteros y cuatro medios. Desde el saque de puerta, el pivote baja entre los centrales para tener uno más que los delanteros que presionan.",
        consignas: ["Uno más que los que presionan", "Si te dejan libre, conduce", "Fija a un rival antes de pasar"], fij: "Cuántos rivales presionan arriba y quién queda libre", cuando: "Cuando el portero pone el balón en el suelo y antes de cada recepción",
        cond: "El gol vale doble si se supera la primera línea con un pase raso desde atrás", preg: ["¿Cuántos nos presionaban y cuántos éramos atrás?", "¿Quién estaba libre para conducir?"] },
      fuente: "Salida en tres con el pivote entre centrales (salida «lavolpiana»), habitual contra presión de dos delanteros."
    },
    tercerhombre: {
      fase: "ataque", cat: "situacion", vista: "C",
      a: [[34, 98], [8, 70], [22, 84], [46, 84], [60, 72], [28, 70], [40, 72], [6, 50], [32, 56], [60, 48], [34, 40]],
      r: [[34, 3], [12, 34], [26, 30], [42, 30], [56, 34], [12, 56], [26, 54], [42, 54], [56, 56], [32, 78], [46, 78]],
      pasos: [
        { t: "El lateral tiene el balón: el extremo abierto, el pivote cerca", b: [8, 69.5] },
        { t: "Pase al pivote, que se ofrece por dentro", b: [22, 62.5], a: { 5: [22, 62] }, r: { 5: [10, 62] },
          tips: { 5: T("Ofrécete por dentro, de cara", "El medio rival que sale al lateral", "Cuando el lateral levanta la cabeza"), 1: T("Atrae al medio rival y suelta", "El medio que sale a por ti") } },
        { t: "Tercer hombre: del pivote al extremo, que ya miraba antes", b: [8, 44.5], a: { 7: [8, 44] }, r: { 1: [12, 40] },
          tips: { 7: T("Recibe orientado hacia dentro o hacia delante", "Dónde está el lateral rival", "Antes de que te llegue el balón") } },
        { t: "El lateral dobla por fuera y el mediapunta ataca el espacio", b: [4, 34.5], a: { 1: [4, 34], 8: [24, 36] },
          tips: { 1: T("Dobla por fuera a toda velocidad", "El extremo y el lateral rival", "Cuando el extremo conduce hacia dentro"), 8: T("Arranca al espacio entre central y lateral", "El central rival", "Cuando el extremo recibe") } }
      ],
      roles: { 1: "Lateral izquierdo: atrae al medio rival y dobla por fuera.", 5: "Pivote: ofrécete por dentro para encontrar al tercer hombre.", 7: "Extremo izquierdo: abierto, mira antes de recibir y decide.",
        8: "Mediapunta: ataca el espacio entre central y lateral." },
      bloque: { titulo: "Progresión por banda: el tercer hombre", texto: "Lateral, pivote, extremo y mediapunta contra lateral, medio y central rivales en el carril de banda. Del lateral al pivote, del pivote al extremo (el tercer hombre) y llegada por fuera.",
        consignas: ["Atrae y suelta", "El tercer hombre mira antes de recibir", "Dobla por fuera cuando el extremo va hacia dentro"], fij: "El rival que sale a presionar y el compañero que queda libre detrás", cuando: "Cuando el rival salta al poseedor",
        cond: "El gol vale si antes ha habido una pared o un tercer hombre", preg: ["¿Quién quedaba libre cuando el medio rival salía?", "¿Cuándo has decidido doblar?"] },
      fuente: "Juego de posición: tercer hombre y doblaje del lateral en carril exterior."
    },
    ruptura: {
      fase: "ataque", cat: "situacion", vista: "A",
      a: [[34, 98], [10, 52], [24, 66], [44, 66], [58, 52], [28, 46], [40, 48], [10, 30], [34, 36], [58, 30], [36, 24]],
      r: [[34, 3], [14, 18], [28, 16], [42, 16], [56, 18], [14, 34], [28, 40], [42, 40], [56, 34], [30, 52], [40, 54]],
      pasos: [
        { t: "El pivote tiene el balón: su defensa está adelantada", b: [40, 47.5] },
        { t: "El delantero amaga hacia el balón", a: { 10: [38, 30] }, r: { 3: [40, 22] },
          tips: { 10: T("Acércate como si fueras a recibir al pie", "El central rival", "Cuando el pivote levanta la cabeza") } },
        { t: "Ruptura a la espalda: pase al espacio", b: [32, 10.5], a: { 10: [32, 10] },
          tips: { 10: T("Arranca en diagonal a la espalda del central", "La línea de los defensas: no te adelantes", "Cuando el central sale contigo"), 6: T("Pasa al espacio, no al pie", "La carrera del delantero", "Justo cuando arranca") } },
        { t: "El mediapunta y el extremo acompañan la jugada", b: [30, 6.5], a: { 8: [40, 14], 9: [54, 12] },
          tips: { 8: T("Llega al borde del área para el pase atrás", "El balón y el espacio libre", "Cuando el delantero controla"), 9: T("Ataca el segundo palo", "El balón", "Cuando el delantero levanta la cabeza") } }
      ],
      roles: { 10: "Delantero: amaga hacia el balón y ataca la espalda del central.", 6: "Pivote: pasa al espacio, no al pie.", 8: "Mediapunta: llega al borde del área para el pase atrás.",
        9: "Extremo derecho: acompaña hasta el segundo palo.", 7: "Extremo izquierdo: estírate para que la defensa no pueda cerrar." },
      bloque: { titulo: "Atacar la espalda: el desmarque de ruptura", texto: "Pivotes, mediapunta, extremos y delantero contra la línea de cuatro defensas y dos medios. El delantero amaga hacia el balón y ataca la espalda cuando el pasador levanta la cabeza.",
        consignas: ["Amaga antes de romper", "Pase al espacio, no al pie", "No te adelantes a la línea"], fij: "La línea de los defensas y la cabeza del pasador", cuando: "Cuando el poseedor levanta la cabeza",
        cond: "El gol vale doble si llega tras un pase a la espalda de la defensa", preg: ["¿Cuándo has arrancado?", "¿Qué te decía la línea de defensas?"] },
      fuente: "Desmarque de apoyo y ruptura (movimiento de ida y vuelta del delantero)."
    },
    cambiorient: {
      fase: "ataque", cat: "situacion", vista: "C",
      a: [[34, 98], [8, 60], [22, 80], [44, 80], [62, 56], [26, 66], [38, 68], [8, 40], [24, 46], [62, 36], [34, 34]],
      r: [[34, 3], [10, 30], [22, 28], [34, 28], [46, 30], [8, 48], [20, 48], [32, 50], [44, 50], [18, 72], [30, 74]],
      pasos: [
        { t: "Atraemos por la izquierda: el rival se junta", b: [8, 59.5] },
        { t: "Pase atrás al pivote, que ya ha mirado el otro lado", b: [36, 66.5], a: { 6: [36, 66] },
          tips: { 6: T("Antes de recibir, mira el lado contrario", "Dónde está el lateral derecho y quién lo vigila", "Mientras viaja el balón") } },
        { t: "Cambio de orientación al lateral derecho", b: [62, 50.5], a: { 4: [62, 50] },
          tips: { 4: T("Abre al máximo y pide el balón largo", "El espacio libre por delante", "Cuando el pivote se perfila") } },
        { t: "Ventaja en el lado débil: lateral y extremo contra uno", b: [62, 36.5], a: { 4: [62, 36], 9: [54, 22] }, r: { 4: [52, 30] },
          tips: { 9: T("Ve por dentro para arrastrar al lateral rival", "El lateral rival", "Cuando nuestro lateral conduce") } }
      ],
      roles: { 6: "Pivote: mira el lado contrario antes de recibir y cambia el juego.", 4: "Lateral derecho: abierto, preparado para el cambio.", 9: "Extremo derecho: arrastra al lateral rival por dentro.",
        1: "Lateral izquierdo: atrae al rival hacia tu banda.", 7: "Extremo izquierdo: junta rivales en tu lado." },
      bloque: { titulo: "Cambio de orientación al lado débil", texto: "Todo el equipo contra un bloque rival que se junta en un lado. Atraemos por una banda y cambiamos el juego al lado contrario para atacar con ventaja.",
        consignas: ["Atrae en un lado, ataca en el otro", "Mira el lado contrario antes de recibir", "Amplitud máxima en el lado débil"], fij: "Dónde se junta el rival y qué lado queda libre", cuando: "Antes de recibir, cuando el rival se ha volcado a un lado",
        cond: "El gol vale doble si antes se ha cambiado el juego de banda", preg: ["¿Dónde estaban juntos los rivales?", "¿Qué has mirado antes de recibir?"] },
      fuente: "Atraer y cambiar: atacar el lado débil tras basculación rival."
    },
    centro: {
      fase: "ataque", cat: "situacion", vista: "A",
      a: [[34, 98], [10, 46], [24, 62], [44, 62], [58, 44], [28, 40], [40, 42], [10, 26], [34, 28], [58, 20], [36, 22]],
      r: [[34, 2], [14, 14], [28, 10], [40, 10], [54, 14], [18, 30], [30, 32], [42, 30], [56, 26], [30, 48], [42, 48]],
      pasos: [
        { t: "El extremo derecho conduce hacia la línea de fondo", b: [58, 20.5] },
        { t: "Cada uno a su zona: primer palo, segundo palo y frontal", b: [62, 8.5], a: { 9: [62, 8], 10: [38, 7], 7: [26, 9], 8: [34, 17] },
          tips: { 10: T("Ataca el primer palo", "El balón y el central", "Cuando el extremo levanta la cabeza"), 7: T("Llega al segundo palo, por detrás del defensa", "El balón", "Cuando el balón sale del pie"),
            8: T("Quédate en la frontal para el rechace", "El balón y el espacio", "Durante el centro") } },
        { t: "Centro raso atrás o al primer palo: remate", b: [38, 7.5],
          tips: { 9: T("Centra raso atrás si el portero sale; si no, al primer palo", "Dónde está el portero", "Antes de centrar") } }
      ],
      roles: { 9: "Extremo derecho: llega a línea de fondo y centra mirando antes.", 10: "Delantero: ataca el primer palo.", 7: "Extremo izquierdo: llega al segundo palo.",
        8: "Mediapunta: frontal del área para el rechace.", 6: "Pivote: vigila el contraataque por detrás." },
      bloque: { titulo: "Centro lateral y llegada al área", texto: "Extremos, mediapunta y delantero contra la defensa y un pivote rival. El extremo llega a línea de fondo y cada uno ataca su zona: primer palo, segundo palo y frontal.",
        consignas: ["Cada uno a su zona", "Llega, no esperes", "Mira al portero antes de centrar"], fij: "Dónde está el portero y los huecos del área", cuando: "Cuando el extremo levanta la cabeza",
        cond: "El gol de remate tras centro vale doble", preg: ["¿Qué zona has atacado?", "¿Cuándo has arrancado?"] },
      fuente: "Ocupación de zonas en centros laterales: primer palo, segundo palo y frontal."
    },
    // ------------------------------------------------------------------ defensa
    bloquemedio: {
      fase: "defensa", cat: "situacion", vista: "C",
      a: [[34, 98], [12, 78], [26, 82], [42, 82], [56, 78], [28, 66], [40, 66], [12, 58], [34, 52], [56, 58], [34, 46]],
      r: [[34, 3], [60, 40], [44, 28], [24, 28], [8, 40], [54, 52], [40, 48], [28, 48], [14, 52], [40, 70], [28, 70]],
      pasos: [
        { t: "Bloque medio: juntos y compactos", b: [44, 28.5] },
        { t: "Pase a su lateral: basculamos hacia el balón", b: [8, 40.5],
          a: { 7: [8, 48], 5: [18, 62], 6: [30, 64], 8: [24, 50], 10: [28, 42], 1: [8, 72], 2: [20, 80], 3: [34, 80], 4: [46, 78], 9: [42, 56] },
          tips: { 7: T("Sal al lateral cerrando su pase hacia dentro", "El lateral y el pase interior", "Mientras viaja el balón"), 5: T("Cierra por dentro, a la altura del balón", "El medio rival más cercano", "Cuando el balón va a la banda") } },
        { t: "Le encerramos en la banda: no puede jugar por dentro", b: [8, 41], a: { 1: [8, 62] }, r: { 8: [8, 58] },
          tips: { 1: T("Vigila al medio rival que se va a la banda", "El jugador a tu espalda", "Cuando nuestro extremo salta") } },
        { t: "Pase atrás: volvemos a juntarnos", b: [24, 28.5],
          a: { 7: [12, 54], 5: [24, 64], 6: [36, 64], 8: [30, 50], 10: [32, 40], 1: [12, 74], 2: [24, 80], 3: [38, 80], 4: [52, 76], 9: [50, 56] } }
      ],
      roles: { 7: "Extremo izquierdo: sal al lateral cerrando el pase hacia dentro.", 9: "Extremo derecho: cierra por dentro cuando el balón está lejos.", 5: "Pivote izquierdo: cierra por dentro a la altura del balón.",
        6: "Pivote derecho: junto a tu compañero, tapa el pase entre líneas.", 1: "Lateral izquierdo: vigila al que se va a tu espalda.", 2: "Central: bascula con la línea, juntos.", 3: "Central: bascula con la línea, juntos.",
        4: "Lateral derecho: cierra por dentro cuando el balón está en la otra banda.", 8: "Mediapunta: tapa el pase a su pivote.", 10: "Delantero: tapa el pase entre sus centrales." },
      bloque: { titulo: "Bloque medio: bascular y cerrar por dentro", texto: "Todo el equipo defiende en bloque medio contra la salida del rival. Basculamos hacia el balón, cerramos los pases por dentro y encerramos al rival en la banda.",
        consignas: ["Juntos y compactos", "Bascula hacia el balón", "Primero cierra por dentro"], fij: "Dónde está el balón y el pase por dentro más peligroso", cuando: "Mientras viaja el balón",
        cond: "Si robamos y marcamos en menos de 8 segundos, el gol vale doble", preg: ["¿Qué pase teníamos que cerrar primero?", "¿Cuándo has saltado?"] },
      fuente: "Defensa zonal en bloque medio: basculación y orientación de la presión hacia la banda."
    },
    perdida5: {
      fase: "defensa", cat: "transicion", vista: "A",
      a: [[34, 96], [10, 48], [24, 62], [44, 62], [58, 46], [28, 42], [40, 44], [12, 28], [34, 30], [56, 26], [36, 22]],
      r: [[34, 2], [56, 14], [42, 10], [26, 10], [12, 14], [54, 28], [40, 26], [28, 30], [14, 30], [46, 52], [22, 54]],
      pasos: [
        { t: "Atacamos: el mediapunta pierde el balón", b: [34, 30.5] },
        { t: "¡Pérdida! Los tres más cercanos saltan", tr: "p", b: [32, 30.5], r: { 7: [32, 30] }, a: { 8: [34, 33], 5: [28, 37], 7: [22, 30], 10: [37, 26] },
          tips: { 8: T("Presiona enseguida al que ha robado", "El balón", "En el primer segundo"), 5: T("Cierra su pase hacia delante", "La línea de pase más fácil"), 7: T("Cierra por fuera y estrecha", "El pase a la banda") } },
        { t: "Los demás cierran: si no robamos, repliegue", a: { 6: [38, 40], 2: [26, 56], 3: [40, 56], 1: [14, 46], 4: [54, 44] },
          tips: { 6: T("Vigila al rival que se ofrece entre líneas", "El jugador libre", "Mientras tus compañeros presionan") } },
        { t: "Robamos en 5 segundos: ataque rápido", tr: "r", b: [30, 28.5], a: { 10: [40, 12], 9: [54, 14] },
          tips: { 10: T("Desmárcate a la espalda", "La línea de defensas", "En cuanto robamos") } }
      ],
      roles: { 8: "Si pierdes el balón, presiona enseguida.", 5: "Pivote: cierra el pase hacia delante.", 6: "Pivote: vigila al rival libre entre líneas.", 7: "Extremo: cierra por fuera y estrecha.",
        2: "Central: adelanta la línea y vigila al delantero.", 3: "Central: adelanta la línea y vigila al delantero.", 10: "Delantero: presiona y, si robamos, a la espalda." },
      bloque: { titulo: "Tras pérdida: presión en 5 segundos", texto: "Atacamos en campo rival; al perder, los tres más cercanos presionan y el resto cierra. Si robamos, ataque rápido; si no, repliegue.",
        consignas: ["El que pierde, presiona", "Los cercanos cierran pases", "Cinco segundos y repliegue"], fij: "El balón, el que ha robado y su pase más fácil", cuando: "En los primeros 5 segundos tras perder",
        cond: "Si robamos en 5 segundos tras perder, el gol vale doble", preg: ["¿Quién ha saltado primero?", "¿Qué pase teníais que cerrar?"] },
      fuente: "Transición defensiva: presión tras pérdida («regla de los 5 segundos»)."
    },
    defcentro: {
      fase: "defensa", cat: "situacion", vista: "D",
      a: [[34, 101], [14, 88], [28, 96], [38, 96], [54, 90], [30, 86], [40, 86], [10, 76], [34, 78], [58, 78], [34, 70]],
      r: [[34, 3], [60, 92], [30, 94], [40, 92], [24, 88], [46, 84], [34, 80], [58, 70], [12, 80], [38, 60], [26, 60]],
      pasos: [
        { t: "Centro desde la derecha: cada uno con su referencia", b: [60, 92.5] },
        { t: "Antes del centro: perfilados, viendo balón y rival", a: { 4: [58, 92], 2: [30, 97], 3: [38, 98], 1: [22, 96], 6: [44, 90] },
          tips: { 3: T("Defiende el primer palo, delante de tu rival", "El balón y el delantero", "Antes del centro"), 1: T("Cierra el segundo palo", "El rival que llega por detrás", "Mientras viaja el balón"),
            4: T("Sal al extremo y no le dejes centrar cómodo", "Su pierna buena", "Cuando controla") } },
        { t: "Centro: atacamos el balón y despejamos fuera", b: [38, 96.5], tips: { 0: T("Si llegas, sal decidido y grita «mía»", "La trayectoria del balón", "En cuanto sale del pie") } },
        { t: "Despeje a la banda y salimos", b: [8, 72.5], a: { 7: [8, 72], 8: [30, 70], 10: [34, 60] } }
      ],
      roles: { 0: "Portero: manda en tu área.", 2: "Central izquierdo: delante de tu rival, atento al centro.", 3: "Central derecho: defiende el primer palo, delante de tu rival.",
        1: "Lateral izquierdo: cierra el segundo palo.", 4: "Lateral derecho: sal al extremo y no le dejes centrar cómodo.", 5: "Pivote: frontal del área para el rechace.", 6: "Pivote: frontal del área para el rechace." },
      bloque: { titulo: "Defensa del centro lateral", texto: "Defensa, pivotes y portero contra extremo, delanteros y llegadores rivales. Defendemos el centro perfilados, atacamos el balón y salimos tras el despeje.",
        consignas: ["Perfilado: balón y rival a la vez", "Delante de tu rival", "Despeja lejos y fuera"], fij: "El balón y tu rival a la vez (perfilado)", cuando: "Antes y durante el centro",
        cond: "Si despejamos y salimos con dos pases, punto", preg: ["¿Veías a la vez el balón y tu rival?", "¿Quién atacaba el primer palo?"] },
      fuente: "Defensa del centro lateral: marcas, zonas de primer y segundo palo y rechace."
    }
  };
  // Las plantillas de la pizarra que ya existían, con su ficha de apartado (la pizarra la monta la app)
  const DE_PLANTILLA = {
    salida: { fase: "ataque", cat: "salida", plantilla: "salida",
      roles: { 0: "Portero: si un central está solo, saca en corto.", 2: "Central izquierdo: ábrete con el perfil abierto hacia el campo.", 3: "Central derecho: ábrete con el perfil abierto hacia el campo.",
        4: "Lateral derecho: alto y abierto; atrae y suelta.", 6: "Pivote: ofrécete de cara entre los presionadores.", 8: "Mediapunta: entre líneas para el último pase de la salida." },
      bloque: { titulo: "Salida de balón en corto desde saque de puerta", texto: "Desde el saque de puerta, salimos en corto: los centrales se abren, los laterales suben y el pivote se ofrece. Atraemos la presión y la superamos.",
        consignas: ["Abrimos el campo", "Atrae y suelta", "Busca al hombre libre"], fij: "Quién presiona y dónde queda el compañero libre", cuando: "Cuando el portero pone el balón en el suelo",
        cond: "El gol vale doble si salimos jugando desde el portero", preg: ["¿Quién estaba libre?", "¿Dónde estaba el presionador?"] } },
    presion: { fase: "defensa", cat: "presion", plantilla: "presion",
      roles: { 10: "Delantero: sal al central tapando el pase al otro central.", 9: "Extremo derecho: cierra el pase al lateral y salta cuando reciba.", 8: "Mediapunta: vigila al pivote rival.",
        6: "Pivote: cierra el pase por dentro.", 4: "Lateral derecho: adelántate para saltar al extremo rival.", 0: "Portero: adelantado para cubrir la espalda." },
      bloque: { titulo: "Presión alta en el saque de puerta rival", texto: "Presionamos el saque de puerta rival orientándolo hacia la banda para encerrarlo y robar arriba.",
        consignas: ["Juntos y colocados", "Oriéntalo hacia la banda", "Salta cuando recibe de espaldas"], fij: "Hacia dónde va el pase y si recibe de espaldas", cuando: "Mientras viaja el balón",
        cond: "Robo en campo rival y gol en menos de 10 segundos vale doble", preg: ["¿Hacia dónde lo hemos llevado?", "¿Quién ha saltado primero?"] } }
  };
  window.PZ_TACTICAS = { situaciones: S, dePlantilla: DE_PLANTILLA };
})();
