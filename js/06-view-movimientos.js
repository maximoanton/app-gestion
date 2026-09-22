"use strict";
// ================= movimientos view =================
function filteredDocs(){
  return state.docs.filter(function(d){
    if(state.negocioFilter!=='Todos' && d.negocio!==state.negocioFilter) return false;
    if(state.mesFilter && state.mesFilter!=='Todos' && d.mes!==state.mesFilter) return false;
    if(state.search){
      var s = state.search.toLowerCase();
      var hay = (d.concepto||'').toLowerCase()+' '+(d.notas||'').toLowerCase();
      if(hay.indexOf(s)===-1) return false;
    }
    return true;
  });
}
function groupKeyFor(d){
  if(state.groupBy==='categoria') return d.categoria||'Sin categoría';
  if(state.groupBy==='negocio') return d.negocio||'Sin negocio';
  return d.concepto||'Sin concepto';
}
function buildGroups(docs, tipo){
  var groups = {};
  docs.filter(function(d){ return d.tipo===tipo; }).forEach(function(d){
    var key = groupKeyFor(d);
    if(!groups[key]) groups[key] = [];
    groups[key].push(d);
  });
  var keys = Object.keys(groups).sort(function(a,b){ return a.localeCompare('es'); });
  return keys.map(function(k){
    var entries = groups[k].slice().sort(function(a,b){ return (b.monto||0)-(a.monto||0); });
    var total = entries.reduce(function(s,e){ return s+(Number(e.monto)||0); },0);
    return {key:k, entries:entries, total:total};
  });
}
function movEntryHtml(d){
  var warn = isFlagged(d.notas) ? '<span class="entry-warn" title="Dato dudoso del registro original">⚠</span>' : '<span></span>';
  return '<div class="entry" data-id="'+d.id+'" data-coll="movimientos">'+
    '<input type="date" class="e-fecha" value="'+(d.fecha||'')+'">'+
    '<input type="text" class="e-notas" value="'+escapeHtml(d.notas||'')+'" placeholder="Notas">'+
    '<input type="number" class="e-monto entry-monto" value="'+(d.monto||0)+'">'+
    '<span class="entry-negocio-tag">'+escapeHtml(d.negocio)+'</span>'+
    warn+
    '<button class="entry-del" data-coll="movimientos" title="Eliminar">✕</button>'+
    '</div>';
}
function movGroupHtml(g, tipo){
  var catSelectHtml = '';
  if(state.groupBy==='concepto'){
    var cats = allCategorias();
    var currentCat = g.entries[0] ? g.entries[0].categoria : '';
    var opts = cats.map(function(c){
      return '<option value="'+escapeHtml(c)+'"'+(c===currentCat?' selected':'')+'>'+escapeHtml(c)+'</option>';
    }).join('') + '<option value="__new__">+ Nueva…</option>';
    catSelectHtml = '<select class="group-categoria-select" title="Recategorizar todo este grupo">'+opts+'</select>';
  }
  var accent = tipo==='Ingreso' ? 'pos' : 'neg';
  return '<div class="group" data-accent="'+accent+'" data-tipo="'+tipo+'" data-key="'+escapeHtml(g.key)+'">'+
    '<button type="button" class="group-header">'+
      '<span class="chevron">▸</span>'+
      '<span class="group-name">'+escapeHtml(g.key)+'</span>'+
      '<span class="group-count">'+g.entries.length+'</span>'+
      catSelectHtml+
      '<span class="group-total">'+money(g.total)+'</span>'+
    '</button>'+
    '<div class="group-body">'+g.entries.map(movEntryHtml).join('')+'</div>'+
  '</div>';
}
function renderMovimientos(){
  fillConceptoSelect(document.getElementById('f_concepto'));
  var docs = filteredDocs();
  var ingresos = docs.filter(function(d){return d.tipo==='Ingreso';}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
  var egresos = docs.filter(function(d){return d.tipo==='Egreso';}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
  var neto = ingresos-egresos;
  document.getElementById('statIngresos').textContent = money(ingresos);
  document.getElementById('statEgresos').textContent = money(egresos);
  document.getElementById('statNeto').textContent = money(neto);
  var box = document.getElementById('statNetoBox'); box.className='stat '+(neto>=0?'stat--pos':'stat--neg');

  var target = document.getElementById('listMovimientos');
  if(docs.length===0){ target.innerHTML = '<div class="empty">No hay movimientos que coincidan.</div>'; return; }
  var ing = buildGroups(docs,'Ingreso'), egr = buildGroups(docs,'Egreso');
  var html='';
  if(ing.length){
    html += '<section class="tipo-section"><div class="tipo-heading ingreso"><h2>Ingresos</h2><span class="tipo-total">'+money(ingresos)+'</span></div>';
    html += ing.map(function(g){return movGroupHtml(g,'Ingreso');}).join('');
    html += '</section>';
  }
  if(egr.length){
    html += '<section class="tipo-section"><div class="tipo-heading egreso"><h2>Egresos</h2><span class="tipo-total">'+money(egresos)+'</span></div>';
    html += egr.map(function(g){return movGroupHtml(g,'Egreso');}).join('');
    html += '</section>';
  }
  target.innerHTML = html;
}

