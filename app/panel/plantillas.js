/* APRENS · Panel — plantillas de mensajes para copiar en WhatsApp («💬 Mensajes»).
   Cada plantilla tiene versión en castellano (es) y en catalán (ca). Para añadir
   otra, copia el bloque de «bienvenida» con otra clave. Los cambios que guardes
   desde el panel se quedan en tu panel (cifrados) y no tocan este archivo. */
window.APRENS_PLANTILLAS = {
  bienvenida: {
    nombre: "Bienvenida · Espai APRENS y Screening",
    es:
"Hola, te doy la bienvenida al proceso de terapia. Además de las sesiones, vamos a trabajar con el Espai APRENS, un conjunto de herramientas que podrás usar desde el móvil entre sesión y sesión y que me permiten ir conociendo cómo estás, para poder acompañarte de manera más ajustada a lo que necesitas en cada momento.\n\n" +
"Para empezar, te pido que hagas la autoevaluación inicial (Screening TEC/AIS). Se hace en unos 10-15 minutos, no hay respuestas correctas ni incorrectas y lo importante es que respondas según cómo te has sentido últimamente:\n" +
"https://aprens-app.netlify.app/#/tool/screening_tec\n\n" +
"Al empezar te pedirá tu código de paciente, que son las iniciales de tu nombre y de tus dos apellidos seguidas de tu edad (por ejemplo, DFG22). Al terminar, pulsa WhatsApp y envíame el mensaje tal cual sale, con el enlace que aparece al final.\n\n" +
"Con tus respuestas podré orientarte sobre qué conviene priorizar trabajar en este momento y te iré enviando las pautas. Más adelante te pediré registros cortos de seguimiento, que nos permitirán ver tu evolución y ajustar el trabajo a lo que vayas necesitando.\n\n" +
"Tus respuestas se guardan solo en tu móvil y únicamente me llegan cuando decides enviármelas.\n\n" +
"Cualquier duda me la puedes comentar por aquí.\n\n" +
"Tòfol Villalonga",
    ca:
"Hola, et don la benvinguda al procés de teràpia. A més de les sessions, farem feina amb l'Espai APRENS, un conjunt d'eines que podràs fer servir des del mòbil entre sessió i sessió i que em permeten anar coneixent com estàs, per poder-te acompanyar de manera més ajustada al que necessites a cada moment.\n\n" +
"Per començar, et deman que facis l'autoavaluació inicial (Screening TEC/AIS). Es fa en uns 10-15 minuts, no hi ha respostes correctes ni incorrectes i l'important és que responguis segons com t'has sentit darrerament:\n" +
"https://aprens-app.netlify.app/#/tool/screening_tec\n\n" +
"En començar et demanarà el teu codi de pacient, que són les inicials del teu nom i dels teus dos llinatges seguides de la teva edat (per exemple, DFG22). En acabar, pitja WhatsApp i envia'm el missatge tal com surt, amb l'enllaç que apareix al final.\n\n" +
"Amb les teves respostes et podré orientar sobre què convé prioritzar treballar en aquest moment i t'aniré enviant les pautes. Més endavant et demanaré registres curts de seguiment, que ens permetran veure la teva evolució i ajustar la feina al que vagis necessitant.\n\n" +
"Les teves respostes es guarden només al teu mòbil i únicament m'arriben quan tu decideixes enviar-me-les.\n\n" +
"Qualsevol dubte me'l pots comentar per aquí.\n\n" +
"Tòfol Villalonga"
  },
  seguimiento: {
    nombre: "Seguimiento semanal · registro del Screening",
    es:
"Hola, te recuerdo el registro de seguimiento de esta semana. Son unos 2-3 minutos y me ayuda a ver cómo vas y a ajustar lo que estamos trabajando:\n" +
"https://aprens-app.netlify.app/#/tool/screening_tec\n\n" +
"Entra como paciente, elige «Ya tengo mi código de seguimiento» y escribe el código de 3 cifras que te di (si no lo tienes a mano, pídemelo por aquí). Responde pensando en cómo has estado estos últimos días y, al terminar, pulsa WhatsApp y envíame el mensaje tal cual sale.\n\n" +
"Con tu registro revisaré tu evolución y te diré qué conviene priorizar esta semana.\n\n" +
"Tòfol Villalonga",
    ca:
"Hola, et record el registre de seguiment d'aquesta setmana. Són uns 2-3 minuts i m'ajuda a veure com vas i a ajustar el que estam treballant:\n" +
"https://aprens-app.netlify.app/#/tool/screening_tec\n\n" +
"Entra com a pacient, tria «Ya tengo mi código de seguimiento» i escriu el codi de 3 xifres que et vaig donar (si no el tens a mà, demana-me'l per aquí). Respon pensant en com has estat aquests darrers dies i, en acabar, pitja WhatsApp i envia'm el missatge tal com surt.\n\n" +
"Amb el teu registre revisaré la teva evolució i et diré què convé prioritzar aquesta setmana.\n\n" +
"Tòfol Villalonga"
  },
  // Pauta libre: los [corchetes] se rellenan antes de enviar. La pauta automática
  // según el Screening está en la ficha («Pauta de esta semana»).
  pauta: {
    nombre: "Pauta semanal · rellenar los [corchetes]",
    es:
"Hola, te dejo la pauta para esta semana.\n\n" +
"Lo que vamos a priorizar: [foco de la semana]\n\n" +
"Para recordarlo, quédate con esta frase:\n«[frase o consigna]»\n\n" +
"Tarea de la semana:\n[qué hacer, cuándo y cuántas veces]\n\n" +
"Para acompañarte, te recomiendo esta herramienta del Espai APRENS: [nombre de la herramienta]\n" +
"https://aprens-app.netlify.app\n" +
"Cuando la uses, pulsa WhatsApp y envíame el mensaje tal cual sale, así podré ir viendo cómo te va.\n\n" +
"No hace falta que salga perfecto. Lo importante es hacerlo con presencia y no con exigencia. Lo revisamos en la próxima sesión.\n\n" +
"Tòfol Villalonga",
    ca:
"Hola, et deix la pauta per a aquesta setmana.\n\n" +
"El que prioritzarem: [focus de la setmana]\n\n" +
"Per recordar-ho, queda't amb aquesta frase:\n«[frase o consigna]»\n\n" +
"Tasca de la setmana:\n[què fer, quan i quantes vegades]\n\n" +
"Per acompanyar-te, et recoman aquesta eina de l'Espai APRENS: [nom de l'eina]\n" +
"https://aprens-app.netlify.app\n" +
"Quan la facis servir, pitja WhatsApp i envia'm el missatge tal com surt, així podré anar veient com et va.\n\n" +
"No cal que surti perfecte. L'important és fer-ho amb presència i no amb exigència. Ho revisarem a la propera sessió.\n\n" +
"Tòfol Villalonga"
  }
};
