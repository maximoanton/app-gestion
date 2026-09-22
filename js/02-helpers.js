"use strict";
// ================= helpers =================
function money(n){
  n = Math.round(Number(n)||0);
  var s = Math.abs(n).toLocaleString('es-AR');
  return (n<0?'-$':'$') + s;
}
function moneyShort(n){
  n = Math.round(Number(n)||0);
  var abs = Math.abs(n), sign = n<0?'-':'';
  if(abs>=1000000) return sign+'$'+(abs/1000000).toFixed(abs%1000000===0?0:1)+'M';
  if(abs>=1000) return sign+'$'+Math.round(abs/1000)+'k';
  return sign+'$'+abs;
}
function cssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
}
var NEGOCIO_PALETTE = ['#2B6E77','#B87F32','#6B4C6B','#5B7F9E','#8A7B4E','#A6473D','#3D7A57','#946B8A'];
function colorForIndex(i){ return NEGOCIO_PALETTE[i % NEGOCIO_PALETTE.length]; }
var MESES_ABR = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function monthLabel(m){
  if(!m) return '';
  var parts = m.split('-');
  var idx = parseInt(parts[1],10)-1;
  return (MESES_ABR[idx]||'?')+' '+parts[0];
}
function polarToCartesian(cx,cy,r,angleDeg){
  var a = (angleDeg-90)*Math.PI/180;
  return {x:cx+r*Math.cos(a), y:cy+r*Math.sin(a)};
}
function fmtFecha(iso){
  if(!iso) return '—';
  var p = iso.split('-');
  if(p.length!==3) return iso;
  return p[2]+'/'+p[1]+'/'+p[0];
}
function toast(msg){
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._h);
  toast._h = setTimeout(function(){ t.classList.remove('show'); }, 2400);
}
function escapeHtml(s){
  return String(s==null?'':s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function isFlagged(notas){
  if(!notas) return false;
  var n = notas.toLowerCase();
  return n.indexOf('posible error') !== -1 || n.indexOf('ilegible') !== -1;
}
function uniqSorted(arr){
  var set = {}; arr.forEach(function(v){ if(v) set[v]=true; });
  return Object.keys(set).sort(function(a,b){ return a.localeCompare('es'); });
}
function allCategorias(){ return uniqSorted(state.docs.map(function(d){ return d.categoria; })); }
function allConceptos(){ return uniqSorted(state.docs.map(function(d){ return d.concepto; })); }

function esNegocioReal(nombre){
  var n = state.negocios.filter(function(x){ return x.nombre===nombre; })[0];
  return n ? (n.esNegocio!==false) : true;
}
function negociosNombres(){
  var fromList = state.negocios.slice().sort(function(a,b){ return (a.createdAt||0)-(b.createdAt||0); }).map(function(n){ return n.nombre; });
  var extra = uniqSorted(
    state.docs.map(function(d){ return d.negocio; })
      .concat(state.bienes.map(function(d){ return d.negocio; }))
      .concat(state.deudas.map(function(d){ return d.negocio; }))
  ).filter(function(n){ return fromList.indexOf(n)===-1; });
  return fromList.concat(extra);
}

function mesesDisponibles(){
  var set = {};
  state.docs.forEach(function(d){ if(d.mes) set[d.mes]=true; });
  set[new Date().toISOString().slice(0,7)] = true;
  if(state.mesFilter && state.mesFilter!=='Todos') set[state.mesFilter]=true;
  return Object.keys(set).sort();
}
function ensureDefaultMes(){
  if(state.mesFilterInitialized) return;
  if(state.docs.length===0) return;
  var conDatos = uniqSorted(state.docs.map(function(d){ return d.mes; }));
  state.mesFilter = conDatos.length ? conDatos[conDatos.length-1] : new Date().toISOString().slice(0,7);
  state.mesFilterInitialized = true;
}

