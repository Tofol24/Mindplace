# Explica-ho · versió amb codis d'accés

La mateixa eina d'estudi, però pensada per oferir-la a diverses persones (per exemple, pacients
adolescents) sense donar-los cap clau: cadascú entra amb un **codi d'accés** i el servidor fa les
crides a Claude amb la clau, que mai arriba al navegador.

- `index.html`: la pàgina. Es genera amb `../fes-pacients.sh` a partir de `../explica-ho.html`; no s'edita a mà.
- `netlify/edge-functions/claude.js`: l'intermediari (ruta `/api/claude`). Comprova el codi, aplica els
  límits, afegeix unes instruccions de seguretat per a menors i passa la resposta de Claude en directe.
- `_headers`: la pàgina només pot parlar amb el seu propi servidor; no s'indexa als cercadors.

## Posar-ho en marxa (una sola vegada)

1. **Clau d'Anthropic.** A platform.claude.com crea un espai de treball (p. ex. «Pacients») amb un
   **límit de despesa mensual** i, dins, una clau de l'API. Sense recàrrega automàtica.
2. **Lloc a Netlify.** Add new site → Import an existing project → GitHub → `Tofol24/Mindplace`:
   - Base directory: `estudi/web-pacients`
   - Publish directory: `estudi/web-pacients`
   - Build command: (buit)
3. **Variables d'entorn** (Site configuration → Environment variables):
   - `ANTHROPIC_API_KEY` = la clau del pas 1.
   - `EXPLICA_CODIS` = els codis, separats per comes. Exemple: `k7m2qp, r9tx4b:30`
     (`:30` vol dir 30 peticions al dia per a aquell codi).
   - Opcionals: `EXPLICA_LIMIT_DIA` (per defecte 60 peticions per codi i dia; 0 = sense límit). Si el comptador diari no funciona, el servidor denega les peticions: per desactivar-lo posa `EXPLICA_LIMIT_DIA=0` i no posis límits als codis,
     `EXPLICA_MODEL` (per defecte `claude-sonnet-5-5`), `EXPLICA_MODEL_COMPLEX`, `EXPLICA_MODEL_QUICK`.
4. **Torna a desplegar** (Deploys → Trigger deploy) perquè agafi les variables.

## Codis

- Fes servir codis **aleatoris** de 6-10 lletres i xifres (no noms ni inicials del pacient).
- Per **donar d'alta** algú: afegeix-ne un a `EXPLICA_CODIS` i torna a desplegar.
- Per **donar de baixa**: treu-lo i torna a desplegar. Deixa de funcionar a l'acte.
- Guarda la correspondència codi ↔ pacient fora d'aquesta eina (per exemple, a la teva fitxa clínica).

## Què es guarda i on

- La feina de cada estudiant (materials, guies, respostes, progrés) es guarda **només al seu
  navegador**. El servidor no desa cap contingut.
- El servidor només compta quantes peticions fa cada codi cada dia (Netlify Blobs).
- El material i les respostes **s'envien a Claude (Anthropic)** per processar-los. Cal explicar-ho a
  la família i recollir-ne el consentiment (per sota dels 14 anys, el dels pares).
- Cada petició gasta crèdit de l'espai de treball del pas 1. Al panell d'Anthropic, a «Coste y gasto»,
  es veu la despesa.

## Salvaguardes per a menors

- La pàgina diu clarament que les respostes les genera una IA i que es pot equivocar.
- El servidor afegeix a cada petició unes instruccions fixes: contingut adequat a l'edat, només estudi.
- Si en una resposta hi apareix malestar emocional greu o risc, la valoració hi afegeix un missatge
  cuidat que anima a parlar-ne amb un adult de confiança i recorda el 024 i el 112.
