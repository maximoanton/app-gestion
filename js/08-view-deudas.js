"use strict";
// ================= deudas view =================
function diasEntreFechas(desde, hasta){
  return Math.round((hasta.getTime()-desde.getTime())/86400000);
}
function calcularEstadoDeuda(x){
  var saldo = Math.max(0,(Number(x.montoTotal)||0)-(Number(x.montoPagado)||0));
  var hoy = new Date(); hoy.setHours(0,0,0,0);
  var diasVenc = null;
  if(x.vencimiento){
    var p = x.vencimiento.split('-');
    var venc = new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
    diasVenc = diasEntreFechas(venc, hoy);
  }
  var vencida = diasVenc!=null && diasVenc>0;
  var tasaAplicable = vencida ? (Number(x.tasaPunitoria)||0) : (Number(x.tasaCompensatoria)||0);
  var costoDiario = saldo * (tasaAplicable/100/365);
  var interesAcumulado = vencida ? saldo*(Number(x.tasaPunitoria)||0)/100/365*diasVenc : 0;
  return {saldo:saldo, diasVenc:diasVenc, vencida:vencida, tasaAplicable:tasaAplicable, costoDiario:costoDiario, interesAcumulado:interesAcumulado};
}
function badgeVencimiento(diasVenc){
  if(diasVenc==null) return '';
  if(diasVenc>0) return '<span class="badge-venc venc-vencida">Vencida hace '+diasVenc+' día'+(diasVenc===1?'':'s')+'</span>';
  if(diasVenc===0) return '<span class="badge-venc venc-hoy">Vence hoy</span>';
  var faltan = -diasVenc;
  if(faltan<=7) return '<span class="badge-venc venc-pronto">Vence en '+faltan+' día'+(faltan===1?'':'s')+'</span>';
  return '<span class="badge-venc venc-ok">Vence en '+faltan+' días</span>';
}
function deudaEntryHtml(x){
  var est = calcularEstadoDeuda(x);
  var tag = x.tipo==='Nos deben' ? '<span class="tag-pill nosdeben">Nos deben</span>' : '<span class="tag-pill debemos">Debemos</span>';
  return '<div class="entry entry-deuda" data-id="'+x.id+'" data-coll="deudas">'+
    '<div class="deuda-row1">'+
      '<input type="text" class="e-concepto" value="'+escapeHtml(x.concepto||'')+'" placeholder="Acreedor / concepto">'+
      tag+
      badgeVencimiento(est.diasVenc)+
      '<span class="readval" style="font-weight:700; margin-left:auto;">'+money(est.saldo)+'</span>'+
      '<button class="pago-btn" data-coll="deudas" title="Registrar un pago">+ pago</button>'+
      '<button class="entry-del" data-coll="deudas" title="Eliminar">✕</button>'+
    '</div>'+
    '<div class="deuda-row2">'+
      '<span class="deuda-mini">Total <b>'+money(x.montoTotal)+'</b></span>'+
      '<span class="deuda-mini">Pagado <b>'+money(x.montoPagado)+'</b></span>'+
      '<label class="deuda-mini">Vence <input type="date" class="e-vencimiento" value="'+(x.vencimiento||'')+'"></label>'+
      '<label class="deuda-mini">Tasa comp. % <input type="number" class="e-tasacomp" min="0" step="0.1" value="'+(x.tasaCompensatoria||0)+'"></label>'+
      '<label class="deuda-mini">Tasa punit. % <input type="number" class="e-tasapun" min="0" step="0.1" value="'+(x.tasaPunitoria||0)+'"></label>'+
      (est.interesAcumulado>0.5 ? '<span class="deuda-mini interes-warn">Interés acumulado <b>'+money(est.interesAcumulado)+'</b></span>' : '')+
    '</div>'+
  '</div>';
}
function renderOrdenPago(docs){
  var el = document.getElementById('ordenPagoDeudas');
  if(!el) return;
  var lista = docs.filter(function(x){ return x.tipo==='Debemos'; }).map(function(x){
    var est = calcularEstadoDeuda(x);
    est.concepto = x.concepto; est.negocio = x.negocio;
    return est;
  }).filter(function(x){ return x.saldo>0; });
  if(lista.length===0){ el.innerHTML=''; return; }
  lista.sort(function(a,b){ return b.costoDiario - a.costoDiario || b.saldo - a.saldo; });
  var rows = lista.map(function(x, i){
    var badge = badgeVencimiento(x.diasVenc) || '<span class="badge-venc venc-ok">Sin vencimiento</span>';
    return '<tr'+(i===0 && x.costoDiario>0 ? ' class="orden-top"':'')+'>'+
      '<td>'+(i+1)+'</td>'+
      '<td>'+escapeHtml(x.concepto)+' <span class="entry-negocio-tag">'+escapeHtml(x.negocio)+'</span></td>'+
      '<td>'+money(x.saldo)+'</td>'+
      '<td>'+(x.tasaAplicable>0 ? x.tasaAplicable.toFixed(1)+'% TNA'+(x.vencida?' (punitoria)':'') : '—')+'</td>'+
      '<td>'+(x.costoDiario>=1 ? money(x.costoDiario)+'/día' : '—')+'</td>'+
      '<td>'+badge+'</td>'+
    '</tr>';
  }).join('');
  el.innerHTML = '<div class="orden-pago-card">'+
    '<h3 class="dash-heading" style="margin-top:0;">Orden sugerido de pago</h3>'+
    '<p class="pres-note" style="margin-top:0;">Ordenadas de mayor a menor costo diario de interés — la de arriba es la que más conviene sacarse de encima primero.</p>'+
    '<div style="overflow-x:auto;"><table class="balance-summary-table"><thead><tr><th>#</th><th>Acreedor</th><th>Saldo</th><th>Tasa aplicable</th><th>Costo diario</th><th>Vencimiento</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '</div>';
}
function renderDeudas(){
  var docs = state.negocioFilter==='Todos' ? state.deudas : state.deudas.filter(function(x){return x.negocio===state.negocioFilter;});
  var debemos=0, nosDeben=0;
  docs.forEach(function(x){
    var saldo = Math.max(0,(Number(x.montoTotal)||0)-(Number(x.montoPagado)||0));
    if(x.tipo==='Nos deben') nosDeben+=saldo; else debemos+=saldo;
  });
  document.getElementById('statDeudaDebemos').textContent = money(debemos);
  document.getElementById('statDeudaNosDeben').textContent = money(nosDeben);
  var dif = nosDeben-debemos;
  document.getElementById('statDeudaDif').textContent = money(dif);
  document.getElementById('statDeudaDifBox').className = 'stat '+(dif>=0?'stat--pos':'stat--neg');

  renderOrdenPago(docs);

  var target = document.getElementById('listDeudas');
  if(docs.length===0){
    target.innerHTML = '<div class="empty">Todavía no registraste deudas ni cuentas pendientes para este negocio. Agregá acá lo que el negocio debe (pasivo) o lo que le deben (cuenta por cobrar).</div>';
    return;
  }
  var byNeg = {};
  docs.forEach(function(x){ (byNeg[x.negocio]=byNeg[x.negocio]||[]).push(x); });
  var negs = Object.keys(byNeg).sort(function(a,b){return a.localeCompare('es');});
  var html='';
  negs.forEach(function(n){
    var items = byNeg[n].slice().sort(function(a,b){ return (a.concepto||'').localeCompare(b.concepto||'','es'); });
    var saldoTot = items.reduce(function(s,x){ return s+Math.max(0,(Number(x.montoTotal)||0)-(Number(x.montoPagado)||0))*(x.tipo==='Nos deben'?1:-1); },0);
    html += '<div class="group" data-accent="'+(saldoTot>=0?'pos':'neg')+'" data-tipo="deuda-'+escapeHtml(n)+'">'+
      '<button type="button" class="group-header"><span class="chevron">▸</span>'+
      '<span class="group-name">'+escapeHtml(n)+'</span>'+
      '<span class="group-count">'+items.length+'</span>'+
      '<span class="group-total">'+money(saldoTot)+'</span></button>'+
      '<div class="group-body">'+items.map(deudaEntryHtml).join('')+'</div></div>';
  });
  target.innerHTML = html;
}

