"use strict";
// ================= master render =================
function render(){
  var active = document.activeElement;
  var inList = active && (active.closest('#listMovimientos') || active.closest('#listBienes') || active.closest('#listDeudas') || active.closest('#presupuestoContent') || active.closest('#listFijos'));
  if(inList && (active.tagName==='INPUT' || active.tagName==='SELECT')){
    state.pendingRender = true;
    return;
  }
  state.pendingRender = false;

  ensureDefaultMes();
  renderTabs();
  renderMesTabs();
  fillNegocioSelect(document.getElementById('f_negocio'));
  fillNegocioSelect(document.getElementById('b_negocio'));
  fillNegocioSelect(document.getElementById('dd_negocio'));
  fillCategoriaSelect(document.getElementById('f_categoria'));
  var hint = document.getElementById('hintMesActivo');
  if(hint) hint.textContent = (state.mesFilter && state.mesFilter!=='Todos') ? '— se guarda en '+monthLabel(state.mesFilter)+' salvo que pongas otra fecha' : '';

  renderMovimientos();
  renderBienes();
  renderDeudas();
  renderBalance();
  renderPresupuesto();
  renderDashboard();
  renderFijos();
  renderCierreDiario();
  applyViewVisibility();
}
function maybeRerender(){ if(state.pendingRender) render(); }

function renderMesTabs(){
  var nav = document.getElementById('mesTabs');
  if(!nav) return;
  var opts = ['Todos'].concat(mesesDisponibles());
  nav.innerHTML = opts.map(function(m){
    var label = m==='Todos' ? 'Todos los meses' : monthLabel(m);
    var active = state.mesFilter===m ? ' active' : '';
    return '<button class="tab'+active+'" data-mes="'+escapeHtml(m)+'">'+escapeHtml(label)+'</button>';
  }).join('');
}

function applyViewVisibility(){
  var cierreTab = document.querySelector('.viewtab[data-view="cierre"]');
  var mostrarCierre = state.negocioFilter==='Casona';
  if(cierreTab) cierreTab.classList.toggle('hidden', !mostrarCierre);
  if(state.view==='cierre' && !mostrarCierre) state.view = 'general';

  ['general','bienes','deudas','presupuesto','fijos','cierre'].forEach(function(v){
    var panel = document.getElementById('panel-'+v);
    if(panel) panel.classList.toggle('hidden', state.view!==v);
  });
  document.getElementById('statsMovimientos').classList.toggle('hidden', state.view!=='general');
  document.getElementById('statsBalance').classList.toggle('hidden', state.view!=='general');
  document.getElementById('statsBienes').classList.toggle('hidden', state.view!=='bienes');
  document.getElementById('statsDeudas').classList.toggle('hidden', state.view!=='deudas');
  document.getElementById('statsPresupuesto').classList.toggle('hidden', state.view!=='presupuesto');
  document.getElementById('statsFijos').classList.toggle('hidden', state.view!=='fijos');
  var mesRow = document.getElementById('mesTabsRow');
  if(mesRow) mesRow.classList.toggle('hidden', state.view==='bienes' || state.view==='deudas');
  document.querySelectorAll('.viewtab').forEach(function(t){
    t.classList.toggle('active', t.getAttribute('data-view')===state.view);
  });
}

