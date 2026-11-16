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

## Llindars dels avisos
L'entrenador els pot canviar a «Compartir › Ítems i avisos». El psicòleg, a la seva vista,
té els seus propis llindars, que s'apliquen als equips que obre en el seu dispositiu.
