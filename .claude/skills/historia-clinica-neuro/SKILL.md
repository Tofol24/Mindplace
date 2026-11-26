---
name: historia-clinica-neuro
description: Lee la historia clínica aportada (informes de la Unidad del Dolor, traumatología, rehabilitación, neurocirugía, mutua…) de un paciente candidato a neuroestimulador y devuelve un bloque de datos para el botón «Importar datos» del protocolo de idoneidad para neuroestimulador. Úsala cuando el psicólogo adjunte o pegue informes médicos (PDF o texto) y pida rellenar, volcar o importar la historia clínica en el protocolo de neuroestimulación.
---

# Historia clínica → protocolo de idoneidad para neuroestimulador

El psicólogo adjunta uno o varios informes médicos ya anonimizados. Tu trabajo es
**extraer lo que consta en los documentos** y devolverlo en el formato que importa el
protocolo. No evalúas al paciente: el protocolo se completa después en entrevista, y
el psicólogo revisa cada campo antes de pasarlo.

## Reglas

1. **Solo lo que está escrito.** Ningún dato se deduce, se completa ni se redondea. Si
   algo no consta, el campo no se incluye. Si dos informes se contradicen, recoge las
   dos versiones con su fuente y apúntalo en `revisar`.
2. **Cada dato con su fuente.** En los campos de texto largo, cita el informe del que
   sale: «(Informe Unidad del Dolor, 12/03/2026)».
3. **Nada de juicio clínico.** No rellenes nunca los bloques que son de entrevista o de
   valoración del psicólogo: motivo, dolor percibido actual, relación con el dolor,
   estado emocional (salvo antecedentes), riesgo y consumo, expectativas, cognición,
   observación clínica, batería psicométrica ni integración y juicio.
   - Una EVA o EN que conste en un informe médico es de otra fecha: va dentro de
     `hist.hc` con su fecha, no en las casillas de intensidad.
   - Resultados de escalas psicológicas en informes previos (HADS, PCS…): no se importan
     como puntuación; menciónalos en `revisar`.
4. **Sin datos identificativos.** No incluyas nombres de pacientes, familiares ni
   profesionales, ni DNI, direcciones o teléfonos, aunque se hayan escapado al
   anonimizador. Si ves alguno, avisa en `revisar` («El informe X conserva un nombre»).
   Los centros y servicios sí se pueden nombrar.
5. **Fechas** en formato dd/mm/aaaa tal como constan. Si solo hay mes y año, escribe
   mm/aaaa. No calcules edades ni tiempos de evolución que el documento no dé; si das
   un tiempo de evolución, indica desde qué fecha y hasta cuál.
6. **Medicación literal**: principio activo o marca, dosis y pauta como figuran. No
   conviertas dosis ni interpretes «a demanda».
7. Lenguaje clínico neutro, en castellano, sin siglas propias del centro. Si el informe
   usa una sigla médica, escríbela desarrollada la primera vez.
8. **Notas de psicología.** Si la historia incluye notas del propio psicólogo, no
   importes su valoración, su formulación ni sus pautas: es su trabajo, no un dato
   ajeno. Solo antecedentes biográficos y convivencia, citando la nota, y avísalo en
   `revisar`.
9. **Datos sensibles que no pide el protocolo** (religión, origen, orientación sexual,
   situación migratoria): no los importes.

## Qué buscar además de lo evidente

Para una valoración de idoneidad pesan mucho cosas que no siempre están en los
diagnósticos. Recógelas literalmente, con fecha y fuente:

- En `hist.hc`, **observaciones de otros profesionales sobre la conducta de dolor**:
  «magnificación», discordancia entre la queja y la exploración, uso de ayudas técnicas
  (muletas, collarín, férulas) contra la indicación médica, marcha antiálgica.
- En `hist.hc`, la **adherencia**: sesiones de rehabilitación indicadas frente a días de
  asistencia registrados (cuéntalos si el informe los lista), faltas, abandonos.
- En `revisar`, lo que puede afectar a la **validez de los autoaplicados**: idioma,
  lectura limitada, nivel educativo, déficit sensorial.
- En `revisar`, **contradicciones** dentro del mismo informe (mecanismo del accidente,
  lado afectado, fechas) y **posibles errores de registro** (dosis imposibles,
  lateralidad cambiada). No las corrijas: cítalas.
- En `revisar`, lo que **no se ha podido leer**: páginas escaneadas sin texto y
  documentos adjuntos que se mencionan pero no están en el texto.
- Si no consta dispositivo propuesto ni petición de la Unidad del Dolor, dilo en
  `revisar`.

## Informe general de la mutua

Formato habitual de la mutua (exportación «INFORME GENERAL»):

- Cada página repite un pie con caso, historia, entidad, gestor asistencial y «copia
  fiel del original»: ignóralo; toma el caso y la entidad una sola vez.
- Apartados: Diagnósticos (con códigos CIE; usa los «de confirmación»), Antecedentes,
  Anámnesis, exploración y evolución, Hoja de enfermería, Psicólogo, Pruebas,
  Tratamientos, Rehabilitación y Medicación.
- La línea temporal sale sobre todo de «Anámnesis, exploración y evolución» y de
  «Pruebas»; las hojas de enfermería solo si añaden algo (ayudas técnicas, citas).
- «Medicación» es una lista de dispensaciones con «Fecha desde / hasta», de la más
  reciente a la más antigua. La **pauta vigente** es la del periodo más reciente;
  las anteriores resúmelas en una línea («Pautas previas: …», solo los fármacos).
  La «Medicación que refiere el paciente» de Antecedentes va aparte, tal cual, aunque
  no tenga pauta.
- Los días de baja suelen constar en la evolución médica («tiene N días de evolución
  de baja»): usa la cifra de la visita más reciente y su fecha.

## Campos que puedes rellenar

Usa exactamente estas claves. En los campos de opciones, el valor tiene que ser **una
de las opciones literales** (con sus tildes y barras). Si ninguna encaja, no incluyas el
campo y explícalo en `revisar`.

| Clave | Tipo | Qué va |
|---|---|---|
| `id.edad` | texto | Fecha de nacimiento o edad, si consta |
| `id.prof` | texto | Profesión y puesto |
| `id.dom` | opción | `Diestro/a` · `Zurdo/a` · `Ambidiestro/a` |
| `id.ent` | texto | Entidad (mutua, aseguradora, sistema público) |
| `id.caso` | texto | Nº de caso, expediente o historia |
| `id.deriv` | texto | Servicio solicitante y fecha de la petición |
| `id.disp` | texto | Dispositivo propuesto (medular cervical, lumbar, periférico…) |
| `id.fuentes` | lista | Una o varias de: `Historia clínica aportada` · `Informe Unidad del Dolor` · `Informe traumatología` · `Informe rehabilitación` · `Notas de seguimiento psicológico` |
| `hist.inicio` | texto | Fecha y mecanismo de inicio (accidente laboral, cirugía…) |
| `hist.evol` | texto | Tiempo de evolución, con las fechas de referencia |
| `hist.dx` | texto | Diagnósticos que constan, separados por «; » |
| `hist.loc` | texto | Localización e irradiación |
| `hist.tipo` | lista | Solo si el informe recoge descriptores del dolor: `Quemante` · `Punzante` · `Eléctrico / descargas` · `Hormigueo` · `Opresivo` · `Alodinia` · `Pulsátil` |
| `hist.hc` | texto largo | Línea temporal: una línea por hecho, `dd/mm/aaaa · servicio · intervención, técnica o prueba · resultado según el informe (fuente)`. Incluye cirugías, bloqueos, radiofrecuencia, rehabilitación, pruebas relevantes y EVA registradas |
| `hist.farm` | texto largo | Medicación actual, una línea por fármaco: nombre · dosis · pauta (fuente y fecha) |
| `hist.it` | texto | Situación de incapacidad temporal, días de baja, propuestas de incapacidad |
| `emo.antp` | texto largo | Antecedentes psicológicos o psiquiátricos y tratamientos previos que consten |
| `emo.antf` | texto | Antecedentes familiares relevantes que consten |
| `social.conv` | texto | Con quién convive, si consta |
| `laboral.demandas` | texto | Demandas físicas del puesto, si se describen |
| `laboral.legal` | lista | Solo si el documento lo dice: `Propuesta de incapacidad` · `Incapacidad en trámite` · `Reclamación / litigio` · `Conflicto con la empresa` |

En los textos largos separa las líneas con `\n` dentro de la cadena JSON.

## Respuesta

1. Primero, en pocas líneas y **sin llaves `{ }`**, qué documentos has leído (tipo y
   fecha) y cuántos campos has podido rellenar.
2. Después, un único bloque de código `json` con esta forma:

```json
{
  "v": 1,
  "origen": "Historia clínica",
  "fecha": "dd/mm/aaaa del informe más reciente",
  "campos": {
    "hist.dx": "Síndrome de dolor regional complejo tipo II en miembro superior derecho; …",
    "hist.hc": "14/02/2025 · Traumatología · Osteosíntesis de radio distal · Consolidación correcta, persiste dolor (Informe traumatología, 20/05/2025)\n…"
  },
  "revisar": [
    "Discrepancia en la fecha del accidente: 03/01/2025 (Unidad del Dolor) y 05/01/2025 (traumatología).",
    "Hay un HADS de 2025 en el informe de rehabilitación: no se ha importado."
  ]
}
```

3. Cierra con una frase: «Copia el bloque y pégalo en *Importar datos* del protocolo;
   revisa cada campo antes de pasarlo.»

No añadas nada después de esa frase, ni otros bloques de código.

## Cómo lo usa el protocolo

El botón «Importar datos» del protocolo de idoneidad lee el bloque, comprueba que cada
clave y cada opción existen, ignora lo que no reconoce y muestra una tabla para que el
psicólogo marque qué pasa. Lo que ya estaba escrito no se sobrescribe salvo que lo
marque. La lista `revisar` se muestra encima de la tabla.
