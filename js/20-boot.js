"use strict";
// ================= boot =================
function boot(){
  renderTabs();
  initTabs();
  initViewSwitcher();
  initToolbar();
  initMovForm();
  initBienForm();
  initDeudaForm();
  initPresupuestoPanel();
  initFijoForm();
  initModalOverlay();
  initListDelegation('listMovimientos');
  initListDelegation('listBienes');
  initListDelegation('listDeudas');
  initListDelegation('listFijos');
  initCierreDiario();
  initSettings();
  document.getElementById('exportBtn').addEventListener('click', exportExcel);
  if(window.matchMedia){
    try{ window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){ render(); }); }catch(e){}
  }

  if(!window.localStorage){
    showBanner('Tu navegador no soporta almacenamiento local: los cambios no se van a guardar.');
    state.docs = SEED_MOVIMIENTOS.map(function(r,i){ var c=Object.assign({},r); c.id='seed_'+i; return docFromMov(c.id,c); });
    state.negocios = DEFAULT_NEGOCIOS.map(function(n,i){ return {id:'neg_'+i, nombre:n, createdAt:i, esNegocio:(n!=='Personal'&&n!=='Transversal')}; });
    fillCategoriaSelect(document.getElementById('f_categoria'));
    render();
    return;
  }

  dbApi = createLocalDbApi();
  downloadsApi = createLocalDownloadsApi();
  sampleApi = createLocalSampleApi();
  document.getElementById('exportBtn').disabled = false;

  seedIfEmpty().then(function(){
    subscribe();
  });
}

function initCierreDiario(){
  document.getElementById('cd_abrir').addEventListener('click', cdAbrir);
  document.getElementById('cd_transcribir').addEventListener('click', cdTranscribir);
  document.getElementById('cd_revision').addEventListener('change', cdOnTablaChange);
  document.getElementById('cd_revision').addEventListener('click', cdOnTablaClick);
  document.getElementById('cd_fecha').value = new Date().toISOString().slice(0,10);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
