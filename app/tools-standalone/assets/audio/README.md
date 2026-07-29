# Grabaciones de voz para las historias animadas

Aquí van los clips de voz (uno por escena) que sustituyen a la voz del
navegador. Mientras no existan, cada historia usa la voz sintética del
dispositivo automáticamente.

## Convención de archivos

Una carpeta por historia, un archivo por escena, numerado con dos dígitos:

```
assets/audio/mono/01.m4a … 08.m4a      → La historia del mono (historia-animada.html)
assets/audio/manada/01.m4a … 08.m4a    → La manada (historia-manada.html)
assets/audio/control/01.m4a … 08.m4a   → El control y la presencia (historia-control.html)
```

- Formato recomendado: `.m4a` (el que exporta Notas de voz del iPhone).
  También sirven `.mp3` o `.wav` (cambiando la extensión en el código).
- Un clip por escena: se reproduce esa escena mientras se oye el clip y,
  al terminar, pasa a la siguiente tras una breve pausa.

## Cómo se activan

En cada historia (`historia-*.html`) hay una línea:

```js
var AUDIO_DIR=null; // p. ej. 'assets/audio/mono/'
```

Cuando los clips estén subidos, se cambia `null` por la carpeta
correspondiente y se añaden los archivos al precache del service worker
(`sw.js`). Si un clip concreto falta o falla, esa escena vuelve sola a la
voz del navegador.
