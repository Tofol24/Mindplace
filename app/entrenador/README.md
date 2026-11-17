# El quadern de l'entrenador · APRENS

Seguiment setmanal d'equips d'esport de base (hereu del programa APRENS ESPORT i de la
fitxa d'observació de l'entrenador del CE Constància). Sense servidor ni comptes: les dades
queden al mòbil de l'entrenador i només surten dins un fitxer xifrat (AES-GCM, PBKDF2).

## Clubs
`?club=<slug>` carrega `../esport-base/clubs/<slug>.json` (els mateixos fitxers que
«Els pares també juguen»): nom, color, escut, idioma i icones. Exemple: `?club=constancia`.
`?lang=ca|es` fixa l'idioma la primera vegada.

El JSON del club pot dur un camp opcional `quadern` amb la configuració que el psicòleg vol
per a tots els entrenadors del club (s'aplica en crear l'equip):

```json
"quadern": {
  "llindars": { "fin": 3, "min": 2, "ego": 3 },
  "conductes": ["Anima els companys després d'una errada"],
  "climaOff": [], "dimsOff": [], "pssOff": ["higiene"]
}
```

Les claus dels ítems són a `contingut.js` (`clima`, `dims`, `pss`).
Si el club té icones pròpies (`"icones": true`), cal un `clubs/<slug>.webmanifest` aquí
(vegeu `clubs/constancia.webmanifest`) i la seva ruta a `app/_headers`.

## Entrevista
Equip i entrenador (setmana, objectius, clima, fitxa del CE Constància), assistència, els 6
ítems ràpids ítem per ítem amb la clau 0-1-2-3 (2 per defecte), on posen l'atenció, senyals i
incidències, i tancament: 14 passos. Les conductes concretes de la fitxa APRENS ESPORT no són
un bloc a part: quan un jugador té 0, 1 o 3 en un ítem, s'obren com a botons les conductes
d'aquell ítem (`dim`, etiquetes `neg`/`pos` a `contingut.js`). Els recomptes (faltes de
respecte, temps fora) es demanen a «Senyals i notes». La fitxa original tenia 29 conductes;
n'hi queden 19 sense repeticions, i les claus antigues es converteixen soles (`MIGRA`).

## Enviament i panel del psicòleg (sense servidor)
- L'entrenador desa una vegada la «clau del psicòleg» del club (Compartir) i, després de cada
  entrevista, «Envia al psicòleg» xifra les dades amb aquesta clau i les comparteix (WhatsApp,
  correu) o les descarrega. La clau no surt mai dins el fitxer.
- El psicòleg entra amb «Sóc el psicòleg del club» i crea el seu panel amb un codi d'accés.
  El panel es desa a `localStorage` (`aprens_quadern_panel_v1`) xifrat amb AES-GCM i una clau
  derivada del codi (PBKDF2); el codi no es desa enlloc. Les claus dels clubs es desen dins
  el panel xifrat i es proven soles en importar. Un equip ja rebut (mateix `equip.id`)
  s'actualitza amb el fitxer més nou.
- Des del panel: avisos de tot el club, setmanes sense entrevista per equip, llindars propis
  i informes per a les famílies de tot un equip, per imprimir o desar en PDF.

## Llindars dels avisos
L'entrenador els pot canviar a «Compartir › Ítems i avisos». El psicòleg, a la seva vista,
té els seus propis llindars, que s'apliquen als equips que obre en el seu dispositiu.
