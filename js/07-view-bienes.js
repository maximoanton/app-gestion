"use strict";
// ================= bienes view =================
function bienEntryHtml(b){
  var a = amortizacion(b);
  return '<div class="entry entry-bien" data-id="'+b.id+'" data-coll="bienes">'+
    '<input type="text" class="e-nombre" value="'+escapeHtml(b.nombre||'')+'" placeholder="Nombre">'+
    '<input type="date" class="e-fechaAlta" value="'+(b.fechaAlta||'')+'">'+
    '<input type="number" class="e-vida" value="'+(b.vidaUtilAnios||10)+'" min="1" title="Vida útil (años)">'+
    '<span class="readval">'+money(b.valorOrigen)+'</span>'+
    '<span class="readval">'+money(a.acumulada)+'</span>'+
    '<span class="valorresidual-cell">'+
      '<input type="number" class="e-valorresidual'+(a.manual?' manual':'')+'" value="'+Math.round(a.residual)+'" title="'+(a.manual?'Valor residual fijado a mano':'Calculado automáticamente — editalo para fijarlo a mano')+'">'+
      (a.manual ? '<button type="button" class="reset-residual" data-coll="bienes" title="Volver al cálculo automático">↺</button>' : '')+
    '</span>'+
    '<button class="entry-del" data-coll="bienes" title="Eliminar">✕</button>'+
    '</div>';
}
function renderBienes(){
  var docs = state.negocioFilter==='Todos' ? state.bienes : state.bienes.filter(function(b){return b.negocio===state.negocioFilter;});
  var origenTot=0, amortTot=0, residualTot=0;
  docs.forEach(function(b){ var a=amortizacion(b); origenTot+=Number(b.valorOrigen)||0; amortTot+=a.acumulada; residualTot+=a.residual; });
  document.getElementById('statBienOrigen').textContent = money(origenTot);
  document.getElementById('statBienAmort').textContent = money(amortTot);
  document.getElementById('statBienResidual').textContent = money(residualTot);

  var target = document.getElementById('listBienes');
  if(docs.length===0){
    target.innerHTML = '<div class="empty">Todavía no cargaste bienes de uso para este negocio. Sumá instalaciones, muebles, equipamiento u otros activos con vida útil para ver acá su amortización y valor residual.</div>';
    return;
  }
  var byNeg = {};
  docs.forEach(function(b){ (byNeg[b.negocio]=byNeg[b.negocio]||[]).push(b); });
  var negs = Object.keys(byNeg).sort(function(a,b){return a.localeCompare('es');});
  var html = '';
  negs.forEach(function(n){
    var items = byNeg[n].slice().sort(function(a,b){ return (a.categoria||'').localeCompare(b.categoria||'','es') || (a.nombre||'').localeCompare(b.nombre||'','es'); });
    var totalResidual = items.reduce(function(s,b){ return s+amortizacion(b).residual; },0);
    html += '<div class="group" data-accent="neutral" data-tipo="bien-'+escapeHtml(n)+'">'+
      '<button type="button" class="group-header"><span class="chevron">▸</span>'+
      '<span class="group-name">'+escapeHtml(n)+'</span>'+
      '<span class="group-count">'+items.length+'</span>'+
      '<span class="group-total">'+money(totalResidual)+'</span></button>'+
      '<div class="group-body">'+items.map(bienEntryHtml).join('')+'</div></div>';
  });
  target.innerHTML = html;
}

