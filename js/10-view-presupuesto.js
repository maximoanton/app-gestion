"use strict";
// ================= presupuesto view =================
function getPresupuesto(negocio, mes, tipo){
  var found = state.presupuestos.filter(function(p){ return p.negocio===negocio && p.mes===mes && p.tipo===tipo; })[0];
  return found ? found.monto : 0;
}
function realDelMes(negocio, mes, tipo){
  return state.docs.filter(function(d){
    return d.negocio===negocio && d.tipo===tipo && d.mes===mes;
  }).reduce(function(s,d){ return s+(Number(d.monto)||0); },0);
}
function budgetBarHtml(real, presup){
  if(presup<=0) return '';
  var pct = Math.min(150, (real/presup)*100);
  var cls = real>presup ? 'over' : 'ok';
  return '<div class="budget-bar"><div class="budget-bar-fill '+cls+'" style="width:'+Math.min(100,pct)+'%"></div></div>';
}
function renderPresupuesto(){
  var target = document.getElementById('presupuestoContent');
  if(!target) return;
  if(!state.mesFilter || state.mesFilter==='Todos'){
    target.innerHTML = '<div class="empty">Elegí un mes puntual arriba (no "Todos los meses") para ver su presupuesto.</div>';
    ['statPresupResultado','statPresupReal','statPresupDif'].forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent='$0'; });
    return;
  }
  var mes = state.mesFilter;
  var names = negociosNombres();

  var totPresupIng=0, totRealIng=0, totPresupEgr=0, totRealEgr=0;
  var rows = names.map(function(n){
    var presupIng = getPresupuesto(n, mes, 'Ingreso');
    var realIng = realDelMes(n, mes, 'Ingreso');
    var presupEgr = getPresupuesto(n, mes, 'Egreso');
    var realEgr = realDelMes(n, mes, 'Egreso');
    totPresupIng+=presupIng; totRealIng+=realIng; totPresupEgr+=presupEgr; totRealEgr+=realEgr;
    return {negocio:n, presupIng:presupIng, realIng:realIng, presupEgr:presupEgr, realEgr:realEgr};
  });

  var resultadoPresup = totPresupIng-totPresupEgr, resultadoReal = totRealIng-totRealEgr;
  document.getElementById('statPresupResultado').textContent = money(resultadoPresup);
  document.getElementById('statPresupReal').textContent = money(resultadoReal);
  document.getElementById('statPresupDif').textContent = money(resultadoReal-resultadoPresup);
  document.getElementById('statPresupDifBox').className = 'stat '+((resultadoReal-resultadoPresup)>=0?'stat--pos':'stat--neg');

  var html = '<p class="pres-note" style="margin-top:0;">Presupuesto de '+escapeHtml(monthLabel(mes))+'.</p>';
  html += '<table class="balance-summary-table"><thead><tr><th>Negocio</th>'+
    '<th>Presup. Ingresos</th><th>Real Ingresos</th><th>Presup. Egresos</th><th>Real Egresos</th></tr></thead><tbody>';
  rows.forEach(function(r){
    html += '<tr data-negocio="'+escapeHtml(r.negocio)+'">'+
      '<td>'+escapeHtml(r.negocio)+'</td>'+
      '<td><input type="number" class="pres-input pp-presup" data-tipo="Ingreso" min="0" step="1" value="'+r.presupIng+'"></td>'+
      '<td>'+money(r.realIng)+budgetBarHtml(r.realIng, r.presupIng)+'</td>'+
      '<td><input type="number" class="pres-input pp-presup" data-tipo="Egreso" min="0" step="1" value="'+r.presupEgr+'"></td>'+
      '<td>'+money(r.realEgr)+budgetBarHtml(r.realEgr, r.presupEgr)+'</td>'+
    '</tr>';
  });
  html += '</tbody><tfoot><tr><td>Total general</td>'+
    '<td>'+money(totPresupIng)+'</td><td>'+money(totRealIng)+'</td>'+
    '<td>'+money(totPresupEgr)+'</td><td>'+money(totRealEgr)+'</td>'+
    '</tr></tfoot></table>';
  html += '<p class="pres-note">La barra debajo de "Real" se pone roja cuando superás el presupuesto de esa fila.</p>';
  target.innerHTML = html;
}

