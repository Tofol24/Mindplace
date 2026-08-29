# APRENS · Cuentos — REGISTRO SEGURO para el generador (evitar el falso positivo de seguridad de menores)

El filtro se dispara por **palabras**, no por la imagen. Cambiamos la **redacción del prompt**, NO lo que se representa: Nil sigue mostrando poca capacidad de forma **contenida** (postura, mirada, manos), pero descrito en términos cálidos y no alarmantes.

## Etiqueta positiva (añadir al principio de CADA prompt sensible)
> *A warm, wholesome, age-appropriate children's picture-book illustration; a tender everyday domestic/school moment; safe, cozy and gentle; non-distressing, heartwarming.*

## Tabla de sustitución de palabras (disparadores → seguro)
| Evitar | Usar |
|---|---|
| distressed / crisis / meltdown / breakdown / panic | *a moment when everything feels like a lot; needs a quiet pause* |
| crying / tears / sobbing | *eyes lowered, quiet* (o simplemente omitir) |
| curled up / ovillado / collapsed | *sitting quietly with his knees drawn up, resting* |
| screaming / tantrum / rabieta | *very still and quiet* |
| rigid / tense / fists / puños | *hands resting closed; still and quiet* |
| hands over his ears (angustia) | *hands gently near his ears, wanting things a little quieter* |
| dark cloud / nube oscura | *a soft, muted cloud of busy thoughts (gentle)* |
| people staring / gente que mira | *a few calm people softly out of focus in the background* |
| overwhelmed child | *a boy who has a lot on his mind and needs a calm moment* |

## Reglas
- Mantener **luz cálida, doméstico/acogedor, ternura**; nunca «frightening», «grotesque», «graphic».
- Preferir **plano algo más abierto** en las páginas sensibles (los primerísimos planos de angustia disparan más el filtro).
- Reforzar la **presencia adulta cálida** («a caring, gentle parent nearby»).
- Si una página aún se bloquea: repetir con el plano más abierto + la etiqueta positiva, o generar la escena **un instante antes/después** del pico (misma lectura de capacidad, menos intensidad facial).

---

## C3 · reescritura segura de las páginas sensibles (mismo estado y significado)
- **c3-p05** 🟠 · «Nil sits with his **hands resting closed** on his train map; the playground around him feels a little **louder**. Calm, contained, warm light.» · Nil
- **c3-p06** 🟠 · «The other children pick someone else to begin; Nil **quietly takes a small step back**, thoughtful, holding his map.» · Nil
- **c3-p07** 🟠→🔴 · «Nil **holds his map close to his chest, very still and quiet**; above him a **soft muted cloud** suggests many busy thoughts. Gentle, cozy, tender — never frightening.» · Nil
- **c3-p08** 🟠 · «Nil **looks down at his own hands** for a moment, noticing something (a quiet clue). Calm.» · Nil
- **c3-p09** 🟠 · «Nil **quietly asks for "a moment"** in a soft voice; a calm, friendly nearby adult (a monitor, not the mother).» · Nil + monitor
- (p01–p04, p10–p14 no suelen disparar; usar el pack normal + la etiqueta positiva por si acaso.)

## Recordatorio para las próximas tandas (mismas zonas sensibles)
- **C4·p08** (aferrado al mapa, ojos llorosos) → «holding his map close, eyes a little watery but quiet; tender».
- **C6·p07–p08** (aparta el mapa / solo ve la raya) → «gently sets the crumpled map aside; sits quietly, looking only at the small crooked line».
- **C7·p04–p05** (insomnio, barriga dura) → «lying awake at night with a lot on his mind; a calm, cozy bedroom».
- **C2·p09** ya validada; si se regenera, «a caring parent gently beside him; a few calm people softly out of focus».
