# Explica-ho · versió amb codis d'accés

La mateixa eina d'estudi, però pensada per oferir-la a diverses persones (per exemple, pacients
adolescents) sense donar-los cap clau: cadascú entra amb un **codi d'accés** i el servidor fa les
crides a Claude amb la clau, que mai arriba al navegador.

- `index.html`: la pàgina. Es genera amb `../fes-pacients.sh` a partir de `../explica-ho.html`; no s'edita a mà.
- `netlify/edge-functions/claude.js`: l'intermediari (ruta `/api/claude`). Comprova el codi, aplica els
  límits, afegeix unes instruccions de seguretat per a menors i passa la resposta de Claude en directe.
- `netlify/edge-functions/config.js`, `checkout.js`, `codi.js`, `stripe-webhook.js`: subscripcions (vegeu més avall).
- `netlify/edge-functions/recupera.js`, `portal-enllac.js`, `portal-obre.js`: correus amb Resend (vegeu més avall).
- `netlify/lib/comu.js`: peces compartides (codis, comptadors, Stripe, correus).
- `subscriu.html`, `gracies.html`, `recupera.html`, `condicions.html`, `privacitat.html`, `_base.css`: pàgines de subscripció.
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
   - `EXPLICA_CODIS` = els codis, separats per comes. Exemple: `k7m2qpx4, r9tx4bm8:30`
     (`:30` vol dir 30 peticions al dia per a aquell codi; mínim 8 caràcters per codi).
   - Opcionals: `EXPLICA_LIMIT_DIA` (per defecte 60 peticions per codi i dia; 0 = sense límit). Si el comptador diari no funciona, el servidor denega les peticions: per desactivar-lo posa `EXPLICA_LIMIT_DIA=0` i no posis límits als codis,
     `EXPLICA_MODEL` (per defecte `claude-sonnet-5-5`), `EXPLICA_MODEL_COMPLEX`, `EXPLICA_MODEL_QUICK`.
4. **Torna a desplegar** (Deploys → Trigger deploy) perquè agafi les variables.

## Codis

- Fes servir codis **aleatoris** d'almenys 8 lletres i xifres (no noms ni inicials del pacient). Els codis
  de menys de 8 caràcters no s'accepten. Cada connexió té 20 intents de codi incorrecte al dia.
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
   donar de baixa i canviar la targeta (i, si vols, canviar de pla). Desa la configuració. Si no faràs servir
   Resend, copia l'enllaç d'accés del portal (*Login link*, `https://billing.stripe.com/p/login/…`) per a
   la variable `EXPLICA_STRIPE_PORTAL_LOGIN`.
3. **Avisos (webhook).** A Stripe → Developers → Webhooks → Add endpoint:
   - URL: `https://<el-teu-lloc>.netlify.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copia el *Signing secret* (`whsec_…`).
4. **Variables d'entorn a Netlify** (i torna a desplegar). Les subscripcions no s'obren fins que hi ha
   totes aquestes, inclosa la confirmació que els textos legals ja no són esborranys:
   - `STRIPE_SECRET_KEY` = la clau secreta de Stripe (`sk_test_…` per provar, `sk_live_…` de debò). Marca-la com a secreta.
   - `STRIPE_WEBHOOK_SECRET` = el `whsec_…` del pas 3. Secreta.
   - `EXPLICA_PLANS` = els plans, separats per `;`, cadascun amb `nom|id del preu|peticions al mes|preu que es mostra`:
     `Bàsic|price_123|200|3 € al mes; Intensiu|price_456|600|7 € al mes`
   - (sense `STRIPE_WEBHOOK_SECRET` les subscripcions tampoc s'obren: no s'assabentarien de baixes ni impagats)
   - `EXPLICA_TEXTOS_LEGALS` = `revisats`, **només** quan `condicions.html` i `privacitat.html` estiguin
     completes i revisades (per provar en mode de prova, posa-la temporalment).
5. **Prova-ho**: obre `/subscriu.html`, paga amb la targeta de prova i comprova que surt el codi,
   que l'eina el fa servir i que «Gestiona la subscripció» obre el portal.
6. **Abans d'obrir-ho de debò**: completa i fes revisar `condicions.html` i `privacitat.html` (ara són
   esborranys), canvia a les claus `sk_live_…` i crea el webhook també en mode real.

**Com funciona per dins**
- En pagar, Stripe torna a `/gracies.html`, que demana el codi a `/api/codi`. El codi es crea una sola
  vegada per subscripció, es desa al navegador i s'afegeix a les factures a partir de la segona (camp «Codi d'accés Explica-ho»;
  la primera ja s'ha creat quan es genera el codi). Amb Resend, també
  s'envia per correu (vegeu més avall).
- Els avisos de Stripe mantenen al dia l'estat de cada subscripció (sempre es consulta l'estat actual a Stripe,
  perquè els avisos poden arribar desordenats). Un codi funciona mentre la
  subscripció està activa (amb 3 dies de marge si hi ha un pagament pendent).
- Quota: peticions per mes natural segons el pla, més el límit diari (`EXPLICA_LIMIT_DIA`). Si una petició
  falla abans d'arribar a Claude o Claude respon amb error, no es descompta.
- «Gestiona la subscripció» sempre passa per una verificació del correu de qui paga: un enllaç d'un sol ús
  (Resend) o el codi que envia Stripe a la seva pàgina d'accés. El codi d'accés sol no hi dona entrada.
- Al servidor només es desa codi ↔ subscripció ↔ client de Stripe, l'estat i els comptadors. Cap nom ni correu.
- **Neteja diària** (`netlify/functions/neteja.mjs`, funció programada de Netlify): esborra els comptadors
  d'altres dies i mesos, els enllaços caducats i, 12 mesos després de la baixa, el registre de la subscripció,
  el codi i l'empremta del correu. És el que promet `privacitat.html`; si es canvia un termini, cal canviar-lo als dos llocs.
- **Estadístiques** (`/estadistiques.html`): peticions, tokens i cost de Claude per dia i per codi, a partir del que
  Claude informa a cada resposta. Cal la variable secreta `EXPLICA_ADMIN` (una contrasenya de 16 caràcters o més);
  sense ella, la pàgina no mostra res. Es conserven 13 mesos. Els preus per model són a `netlify/lib/comu.js` (PRICES).
- **Consentiment**: la pàgina de subscripció demana acceptar condicions i privacitat i, a part, que el servei
  comenci de seguida dins el termini de desistiment (amb descompte proporcional si es desisteix). Queda a les
  metadades de la sessió de Stripe (`consentiment`, `inici_immediat`).
- Codis de descompte: la pàgina de pagament accepta els cupons que creïs a Stripe (Product catalog → Coupons).

## Correus amb Resend (opcional)

Amb Resend configurat:
- **En pagar**, el codi d'accés s'envia al correu de qui paga (una sola vegada per subscripció).
- **«He perdut el codi»** (`/recupera.html`): s'escriu el correu i, si hi ha subscripcions actives, s'hi
  envien els codis. La resposta és sempre la mateixa (no revela qui està subscrit). Màxim 3 intents al
  dia per correu i 10 per connexió.
- **«Gestiona la subscripció»** envia un **enllaç d'un sol ús** (30 minuts) al correu de qui paga, que obre
  el portal de Stripe. Ja no cal escriure el correu, i només hi pot entrar qui té accés a aquell correu.
  En obrir l'enllaç surt una pàgina amb un botó: l'enllaç només es gasta en prémer-lo (els programes de
  correu que previsualitzen enllaços no el gasten), i si Stripe falla en aquell moment es pot tornar a provar.
  Màxim 5 enllaços al dia per codi.

Sense Resend, el codi surt a la pàgina de gràcies i a les factures (a partir de la segona), i
«Gestiona la subscripció» porta a la pàgina d'accés del portal de Stripe, on Stripe mateix verifica el correu
amb un codi. Per a això cal la variable `EXPLICA_STRIPE_PORTAL_LOGIN` (vegeu el pas 2 de Stripe).
Les subscripcions no s'obren sense una de les dues vies (Resend o la pàgina d'accés de Stripe).

**Configurar-lo**
1. Crea un compte a resend.com.
2. **Domini:** a Resend → Domains, afegeix el teu domini (p. ex. `aprens.cat`) i posa al DNS els registres
   que et dona (SPF, DKIM). Quan surti «Verified», ja pots enviar des de qualsevol adreça d'aquell domini.
   Per provar sense domini, Resend permet enviar des de `onboarding@resend.dev`, però **només al correu
   del teu propi compte de Resend**.
3. **Clau:** Resend → API Keys → Create (permís «Sending access»).
4. **Variables a Netlify** (i torna a desplegar):
   - `RESEND_API_KEY` = la clau (`re_…`). Marca-la com a secreta.
   - `EXPLICA_EMAIL_FROM` = remitent, p. ex. `Explica-ho <hola@aprens.cat>`
   - `EXPLICA_EMAIL_REPLY` (opcional) = adreça on arribaran les respostes, p. ex. la teva.
   - `EXPLICA_SECRET` (opcional) = un text llarg aleatori per fer les empremtes dels comptadors d'intents
     (si no hi és, se'n fa servir un dels altres secrets).
5. Afegeix Resend a la política de privacitat (encarregat del tractament; ja hi ha la línia preparada).

## Salvaguardes per a menors

- La pàgina diu clarament que les respostes les genera una IA i que es pot equivocar.
- El servidor afegeix a cada petició unes instruccions fixes: contingut adequat a l'edat, només estudi.
- Si en una resposta hi apareix malestar emocional greu o risc, la valoració hi afegeix un missatge
  cuidat que anima a parlar-ne amb un adult de confiança i recorda el 024 i el 112.
