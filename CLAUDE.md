# Instrucciones para Claude

## Antes de dar una tarea por cerrada

### 1. Comprobaciones automáticas (siempre, gratis)
Al terminar cualquier tarea que modifique archivos HTML o JavaScript, ejecuta
`npm run check` desde la raíz (la primera vez: `npm run check:instalar`).
Revisa lo cambiado frente a `main`: HTML, accesibilidad (axe en Chromium), errores
de JavaScript y privacidad (nada de terceros en `app/`, material clínico cifrado).
No cierres la tarea con errores; los avisos, valóralos y corrige los que tengan sentido.
Si la app tiene pruebas propias (p. ej. `cd albaranes && npm test`), pásalas también.

### 2. Autorrevisión de Claude (siempre que haya código, gratis)
Después del punto 1, si la tarea cambia lógica (JavaScript, funciones, flujos de datos),
pasa la skill `/code-review` sobre lo cambiado (nivel `medium` por defecto; `high` si
toca datos de pacientes o servidor) y corrige lo que confirme. Si toca pantallas que
usan pacientes, añade `design:accessibility-review`. Si toca servidor o datos sensibles,
añade también `/security-review`.
No hace falta para cambios solo de textos o estilos.

### 3. Revisión con Codex (solo cuando aporta; tiene coste)
Usa la skill `codex-review` (`.claude/skills/codex-review/`) cuando la tarea:
- toque funciones de servidor (`*/functions/`, `netlify/`, `lib/`) o integraciones externas;
- cambie cómo se guardan, cifran o envían datos de pacientes;
- sea una app nueva o un cambio grande de arquitectura;
- o cuando el usuario lo pida.

Para lo demás (textos, estilos, una página nueva sencilla) bastan los puntos 1 y 2.

Cómo usarla para que salga barata:
- Pasa antes `npm run check` y la autorrevisión del punto 2, para que Codex no gaste
  en lo que ya está cubierto.
- Revisa solo la tarea: `--desde <commit en el que empezó la tarea>`.
- Una pasada al final. Si corriges algo crítico o importante, como mucho una segunda
  pasada `--desde` el commit revisado. No en bucle.
- `--completa` y `--a-fondo` solo para apps nuevas con servidor o datos sensibles.
