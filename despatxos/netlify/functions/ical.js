// APRENS · Despatxos — proxy de només lectura per a agendes iCal (Doctoralia / Google Calendar).
//
// El navegador no pot llegir directament l'enllaç .ics d'una altra web (CORS), així que
// aquesta funció del servidor el llegeix i el retorna. Mesures de seguretat:
//  · només https, i només amfitrions coneguts (Google Calendar / Doctoralia) → evita SSRF.
//  · només lectura (GET); no desa res; petita memòria cau (5 min).
//  · no rep ni exposa cap clau secreta.
const ALLOWED = [
  'calendar.google.com',
  'www.google.com',
  'doct.to',
  'eu.doct.to',
];
function hostOk(h){
  h = String(h).toLowerCase();
  if (ALLOWED.includes(h)) return true;
  return h.endsWith('.google.com')
      || h.endsWith('.doct.to')
      || h.endsWith('.doctoralia.com')
      || h.endsWith('.doctoralia.es')
      || h.endsWith('.docplanner.com');
}
function txt(statusCode, body){
  return { statusCode, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }, body };
}

exports.handler = async (event) => {
  const raw = (event.queryStringParameters && event.queryStringParameters.url) || '';
  if (!raw) return txt(400, 'Falta el paràmetre url.');
  let u;
  try { u = new URL(raw); } catch (e) { return txt(400, 'URL no vàlida.'); }
  if (u.protocol !== 'https:') return txt(400, 'Només https.');
  if (!hostOk(u.hostname)) return txt(400, 'Amfitrió no permès (només Google Calendar / Doctoralia).');
  try {
    const r = await fetch(u.toString(), {
      redirect: 'follow',
      headers: { 'User-Agent': 'aprens-despatxos/1.0', 'Accept': 'text/calendar, text/plain, */*' },
    });
    if (!r.ok) return txt(502, 'La font ha respost ' + r.status + '.');
    const body = await r.text();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    };
  } catch (e) {
    return txt(502, 'No s\'ha pogut llegir la font.');
  }
};
