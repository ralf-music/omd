/*
IN DEN BESTEHENDEN one-more-day-api WORKER INTEGRIEREN.
Nicht als vollständigen Ersatz des vorhandenen Workers deployen.

Benötigtes Secret:
  ADMIN_KEY

Routen unter /api/v1:
  GET  /day-status?date=YYYY-MM-DD
  POST /admin/day-status
*/

function corsJson(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      'content-type':'application/json; charset=utf-8',
      'access-control-allow-origin':'*',
      'access-control-allow-headers':'Content-Type, X-Admin-Key',
      'access-control-allow-methods':'GET,POST,OPTIONS'
    }
  });
}

async function getDayStatus(request,env){
  const url=new URL(request.url);
  const date=url.searchParams.get('date');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')) return corsJson({ok:false,error:'invalid_date'},400);
  const row=await env.DB.prepare(
    'SELECT day_date,status,updated_at,updated_by FROM day_statuses WHERE day_date=?1'
  ).bind(date).first();
  return corsJson({ok:true,day_status:row||{day_date:date,status:'normal',updated_at:null,updated_by:null}});
}

async function setDayStatus(request,env){
  const supplied=request.headers.get('X-Admin-Key')||'';
  if(!env.ADMIN_KEY || supplied!==env.ADMIN_KEY) return corsJson({ok:false,error:'unauthorized'},401);

  const body=await request.json().catch(()=>null);
  const date=body?.date;
  const status=String(body?.status||'').toLowerCase();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')) return corsJson({ok:false,error:'invalid_date'},400);
  if(!['normal','frei','urlaub','krank'].includes(status)) return corsJson({ok:false,error:'invalid_status'},400);

  await env.DB.prepare(`
    INSERT INTO day_statuses(day_date,status,updated_at,updated_by)
    VALUES(?1,?2,CURRENT_TIMESTAMP,'admin')
    ON CONFLICT(day_date) DO UPDATE SET
      status=excluded.status,
      updated_at=CURRENT_TIMESTAMP,
      updated_by='admin'
  `).bind(date,status).run();

  const row=await env.DB.prepare(
    'SELECT day_date,status,updated_at,updated_by FROM day_statuses WHERE day_date=?1'
  ).bind(date).first();
  return corsJson({ok:true,day_status:row});
}

/*
In deinen bestehenden fetch/router einfügen:

if(request.method==='OPTIONS') return new Response(null,{
  status:204,
  headers:{
    'access-control-allow-origin':'*',
    'access-control-allow-headers':'Content-Type, X-Admin-Key',
    'access-control-allow-methods':'GET,POST,OPTIONS'
  }
});

if(path==='/api/v1/day-status' && request.method==='GET'){
  return getDayStatus(request,env);
}

if(path==='/api/v1/admin/day-status' && request.method==='POST'){
  return setDayStatus(request,env);
}

Die bestehenden /health, /geo/*, /day, /reward, /transaction und /wallet Routen bleiben unverändert.
*/
