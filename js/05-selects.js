"use strict";
// ================= static selects =================
function fillNegocioSelect(sel){
  if(document.activeElement===sel) return;
  var current = sel.value;
  var names = negociosNombres();
  sel.innerHTML = names.map(function(n){ return '<option value="'+escapeHtml(n)+'">'+escapeHtml(n)+'</option>'; }).join('');
  if(names.indexOf(current)!==-1) sel.value = current;
}
function fillCategoriaSelect(sel){
  if(document.activeElement===sel) return;
  var current = sel.value;
  var cats = allCategorias();
  sel.innerHTML = cats.map(function(c){ return '<option value="'+escapeHtml(c)+'">'+escapeHtml(c)+'</option>'; }).join('')
    + '<option value="__new__">+ Nueva categoría…</option>';
  if(cats.indexOf(current)!==-1) sel.value = current;
}
function fillConceptoSelect(sel){
  if(document.activeElement===sel) return;
  var current = sel.value;
  var conceptos = allConceptos();
  var opts = '<option value="" disabled'+(current?'':' selected')+'>Elegí un concepto…</option>'
    + conceptos.map(function(c){ return '<option value="'+escapeHtml(c)+'"'+(c===current?' selected':'')+'>'+escapeHtml(c)+'</option>'; }).join('')
    + '<option value="__new__">+ Nuevo concepto…</option>';
  sel.innerHTML = opts;
  if(conceptos.indexOf(current)!==-1 || current==='__new__') sel.value = current;
}

function renderTabs(){
  var nav = document.getElementById('negocioTabs');
  var todos = negociosNombres();
  var reales = todos.filter(esNegocioReal);
  var otros = todos.filter(function(n){ return !esNegocioReal(n); });
  function tabBtn(n){
    return '<button class="tab'+(state.negocioFilter===n?' active':'')+'" data-negocio="'+escapeHtml(n)+'">'+escapeHtml(n)+'</button>';
  }
  var html = '<span class="tabs-group-label">Negocios</span>'+
    tabBtn('Todos') + reales.map(tabBtn).join('');
  if(otros.length){
    html += '<span class="tabs-divider"></span><span class="tabs-group-label">Otros</span>'+otros.map(tabBtn).join('');
  }
  nav.innerHTML = html;
}

