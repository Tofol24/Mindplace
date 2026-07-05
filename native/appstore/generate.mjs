const { chromium } = require('playwright');
const OUT = '/home/user/Mindplace/native/appstore';
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

const URL = 'http://localhost:8080/bienestar/index.html';

// Estado sembrado (perfil completo + datos para que se vea poblado)
function seedScript() {
  const d = new Date();
  const ymd = x => x.getFullYear() + '-' + ('0'+(x.getMonth()+1)).slice(-2) + '-' + ('0'+x.getDate()).slice(-2);
  const day = off => { const x = new Date(); x.setDate(x.getDate()-off); return ymd(x); };
  const A = {
    perfil: { nombre: '', aceptado: true, fecha: day(0) },
    historiaVista: true,
    eval: { fecha: day(1), L: 5, D: 4, C: 6, foco: 'D' },
    plan: { fase: 2 },
    visitas: { [day(0)]: [0,2], [day(1)]: [0,1,3], [day(2)]: [0,4], [day(3)]: [1,2], [day(4)]: [0], [day(6)]: [0,2,4] },
    amenaza: [ {fecha:day(12),v:2}, {fecha:day(8),v:2}, {fecha:day(4),v:3}, {fecha:day(0),v:4} ],
    rutina: { avisos: true, momentos: [
      { label:'Por la mañana', hora:'00:01', on:true, practica:'respira' },
      { label:'A mediodía', hora:'14:00', on:true, practica:'valores' },
      { label:'Por la tarde', hora:'20:00', on:true, practica:'sentarse' }
    ] }
  };
  const db = { schema:1, paciente:{codigo:''}, tools:{
    estado_mono: { meta:{nombre:'Estado del mono',v:1}, records:[
      {id:1,date:day(6),ts:1,modo:'conduce',estado:'El mono conduce'},
      {id:2,date:day(4),ts:2,modo:'maletero',estado:'En el maletero'},
      {id:3,date:day(3),ts:3,modo:'allado',estado:'Lo llevo a mi lado'},
      {id:4,date:day(1),ts:4,modo:'allado',estado:'Lo llevo a mi lado'},
      {id:5,date:day(0),ts:5,modo:'persecucion',estado:'Lo persigo'}
    ]},
    respiracion_curiosa: { meta:{nombre:'Respiración curiosa',v:1}, records:[
      {id:10,date:day(2),ts:10,param:'densidad'}, {id:11,date:day(0),ts:11,param:'densidad'}
    ]},
    bajar_alerta: { meta:{nombre:'Bajar la alerta',v:1}, records:[ {id:20,date:day(3),ts:20,antes:8,despues:4} ]}
  }};
  localStorage.setItem('aprens_anclado', JSON.stringify(A));
  localStorage.setItem('aprens_db', JSON.stringify(db));
}

async function appBuffer(ctx, setup) {
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await setup(page);
  await page.waitForTimeout(500);
  const buf = await page.screenshot(); // viewport 1290x2796 (dsf3 sobre 430x932)
  await page.close();
  return buf;
}

async function frame(browser, buf, caption, out) {
  const ctx = await browser.newContext({ viewport: { width: 1290, height: 2796 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const b64 = buf.toString('base64');
  await page.setContent(`<html><body style="margin:0">
    <div style="width:1290px;height:2796px;box-sizing:border-box;background:linear-gradient(165deg,#e8f4ef,#c7e2d7);
      font-family:-apple-system,system-ui,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;padding:150px 60px 0">
      <div style="font-size:72px;font-weight:800;color:#1f423a;text-align:center;line-height:1.14;max-width:1090px;letter-spacing:-1.5px">${caption}</div>
      <img src="data:image/png;base64,${b64}" style="width:940px;margin-top:80px;border-radius:64px;box-shadow:0 44px 100px rgba(20,60,50,.30)"/>
    </div></body></html>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: out });
  await ctx.close();
  console.log('✅', out);
}

(async () => {
  const browser = await chromium.launch();
  const vp = { viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 };

  // 1 — Marca (paso de perfil del onboarding: "Anclado en mí · Vuelve a ti")
  let b1 = await appBuffer(await browser.newContext(vp), async (p) => {
    await p.waitForSelector('#onb', { state: 'visible' });
    for (let i=0;i<6;i++){ await p.click('#obNext'); }   // hasta el paso perfil
    await p.waitForSelector('#onbCard h1');
  });
  await frame(browser, b1, 'Entrena tu mente,<br>un poco cada día', OUT+'/1-marca.png');

  // 2 — Historia del mono (slide "Tú conduces, el mono a tu lado")
  let b2 = await appBuffer(await browser.newContext(vp), async (p) => {
    await p.waitForSelector('#onb', { state: 'visible' });
    await p.click('#obNext'); await p.click('#obNext');   // STORY[2]
  });
  await frame(browser, b2, '¿Quién conduce<br>tu vida?', OUT+'/2-historia.png');

  // 3 — Hoy (paso sugerido + Visitas al mono), sembrado
  const ctx3 = await browser.newContext(vp);
  let b3 = await appBuffer(ctx3, async (p) => {
    await p.evaluate(seedScript); await p.reload({ waitUntil:'networkidle' });
    await p.waitForSelector('#app', { state:'visible' });
  });
  await frame(browser, b3, 'Un plan que te dice<br>qué hacer hoy', OUT+'/3-hoy.png');

  // 4 — Una práctica (Respiración curiosa · paso del orbe)
  const ctx4 = await browser.newContext(vp);
  let b4 = await appBuffer(ctx4, async (p) => {
    await p.evaluate(seedScript);
    await p.evaluate(() => {
      var A = JSON.parse(localStorage.getItem('aprens_anclado'));
      A.rutina = { avisos:true, momentos:[{ label:'Por la mañana', hora:'00:01', on:true, practica:'respira' }] };
      localStorage.setItem('aprens_anclado', JSON.stringify(A));
      var db = JSON.parse(localStorage.getItem('aprens_db')); var t = new Date().toISOString().slice(0,10);
      db.tools.respiracion_curiosa.records = db.tools.respiracion_curiosa.records.filter(r => r.date !== t);
      localStorage.setItem('aprens_db', JSON.stringify(db));
    });
    await p.reload({ waitUntil:'networkidle' });
    await p.waitForSelector('#app', { state:'visible' });
    await p.click('#nudgeGo');                 // abre respiración curiosa
    await p.waitForSelector('#miniOverlay', { state:'visible' });
    await p.click('#miniNext');                // paso 2 (orbe: respira con curiosidad)
    await p.waitForSelector('#orb');
  });
  await frame(browser, b4, 'Prácticas de un minuto<br>para volver a ti', OUT+'/4-practica.png');

  // 5 — Mi rutina diaria (momentos + avisos)
  const ctx5 = await browser.newContext(vp);
  let b5 = await appBuffer(ctx5, async (p) => {
    await p.evaluate(seedScript); await p.reload({ waitUntil:'networkidle' });
    await p.waitForSelector('#app', { state:'visible' });
    await p.click('#btnAjustes'); await p.click('#ajRutina');
    await p.waitForSelector('#rutina', { state:'visible' });
  });
  await frame(browser, b5, 'Tus momentos del día,<br>con recordatorios', OUT+'/5-rutina.png');

  // 6 — Mi progreso (racha + amenaza→reto + actividad)
  const ctx6 = await browser.newContext(vp);
  let b6 = await appBuffer(ctx6, async (p) => {
    await p.evaluate(seedScript); await p.reload({ waitUntil:'networkidle' });
    await p.waitForSelector('#app', { state:'visible' });
    await p.click('.tab[data-view="progreso"]');
    await p.waitForSelector('#view-progreso', { state:'visible' });
    await p.waitForTimeout(600);
  });
  await frame(browser, b6, 'Mira tu evolución:<br>de la amenaza al reto', OUT+'/6-progreso.png');

  await browser.close();
  console.log('\n=== 6 capturas generadas en native/appstore/ ===');
})();
