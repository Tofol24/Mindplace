# Explica-ho · versió amb codis d'accés

La mateixa eina d'estudi, però pensada per oferir-la a diverses persones (per exemple, pacients
adolescents) sense donar-los cap clau: cadascú entra amb un **codi d'accés** i el servidor fa les
crides a Claude amb la clau, que mai arriba al navegador.

- `index.html`: la pàgina. Es genera amb `../fes-pacients.sh` a partir de `../explica-ho.html`; no s'edita a mà.
- `netlify/edge-functions/claude.js`: l'intermediari (ruta `/api/claude`). Comprova el codi, aplica els
  límits, afegeix unes instruccions de seguretat per a menors i passa la resposta de Claude en directe.
- `netlify/edge-functions/config.js`, `checkout.js`, `codi.js`, `stripe-webhook.js`, `portal.js`: subscripcions (vegeu més avall).
- `netlify/lib/comu.js`: peces compartides (codis, comptadors, Stripe).
- `subscriu.html`, `gracies.html`, `condicions.html`, `privacitat.html`, `_base.css`: pàgines de subscripció.
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
- El material i les respostes **s'envien a Claude (Anthropic)** per processar-los. Si l'estudiant fa servir
  el botó «Parla», el navegador envia l'àudio al seu servei de reconeixement de veu (a Chrome, Google);
  escriure o dictar amb el teclat del dispositiu són alternatives. Cal explicar-ho a
  la família i recollir-ne el consentiment (per sota dels 14 anys, el dels pares).
- Cada petició gasta crèdit de l'espai de treball del pas 1. Al panell d'Anthropic, a «Coste y gasto»,
  es veu la despesa.

## Subscripcions de pagament (Stripe)

Opcional. Sense aquestes variables, el lloc funciona només amb els codis donats a mà.
Amb elles, qualsevol persona pot subscriure's a `/subscriu.html`, rep un codi i té una quota mensual.
Els codis donats a mà (`EXPLICA_CODIS`) continuen funcionant igual i sense quota mensual.

**Primer, en mode de prova** (claus que comencen per `sk_test_`; targeta de prova `4242 4242 4242 4242`).

1. **Productes i preus.** A Stripe → Product catalog, crea el producte «Explica-ho» amb un preu
   **recurrent mensual** per a cada pla (p. ex. 3 € i 7 €, IVA inclòs). Copia l'id de cada preu (`price_…`).
2. **Portal de clients.** A Stripe → Settings → Billing → Customer portal, activa'l i deixa que es puguin
   donar de baixa i canviar la targeta (i, si vols, canviar de pla). Desa la configuració.
3. **Avisos (webhook).** A Stripe → Developers → Webhooks → Add endpoint:
   - URL: `https://<el-teu-lloc>.netlify.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copia el *Signing secret* (`whsec_…`).
4. **Variables d'entorn a Netlify** (i torna a desplegar):
   - `STRIPE_SECRET_KEY` = la clau secreta de Stripe (`sk_test_…` per provar, `sk_live_…` de debò). Marca-la com a secreta.
   - `STRIPE_WEBHOOK_SECRET` = el `whsec_…` del pas 3. Secreta.
   - `EXPLICA_PLANS` = els plans, separats per `;`, cadascun amb `nom|id del preu|peticions al mes|preu que es mostra`:
     `Bàsic|price_123|200|3 € al mes; Intensiu|price_456|600|7 € al mes`
5. **Prova-ho**: obre `/subscriu.html`, paga amb la targeta de prova i comprova que surt el codi,
   que l'eina el fa servir i que «Gestiona la subscripció» obre el portal.
6. **Abans d'obrir-ho de debò**: completa i fes revisar `condicions.html` i `privacitat.html` (ara són
   esborranys), canvia a les claus `sk_live_…` i crea el webhook també en mode real.

**Com funciona per dins**
- En pagar, Stripe torna a `/gracies.html`, que demana el codi a `/api/codi`. El codi es crea una sola
  vegada per subscripció, es desa al navegador i s'afegeix a les factures (camp «Codi d'accés Explica-ho»).
- Els avisos de Stripe mantenen al dia l'estat de cada subscripció. Un codi funciona mentre la
  subscripció està activa (amb 3 dies de marge si hi ha un pagament pendent).
- Quota: peticions per mes natural segons el pla, més el límit diari (`EXPLICA_LIMIT_DIA`).
- Al servidor només es desa codi ↔ subscripció ↔ client de Stripe, l'estat i els comptadors. Cap nom ni correu.
- Codis de descompte: la pàgina de pagament accepta els cupons que creïs a Stripe (Product catalog → Coupons).

## Salvaguardes per a menors

- La pàgina diu clarament que les respostes les genera una IA i que es pot equivocar.
- El servidor afegeix a cada petició unes instruccions fixes: contingut adequat a l'edat, només estudi.
- Si en una resposta hi apareix malestar emocional greu o risc, la valoració hi afegeix un missatge
  cuidat que anima a parlar-ne amb un adult de confiança i recorda el 024 i el 112.
