"use strict";
// ================= form wiring =================
function initMovForm(){
  document.getElementById('f_negocio').value = 'Hotel';
  document.getElementById('f_fecha').value = new Date().toISOString().slice(0,10);
  document.getElementById('f_concepto').addEventListener('change', function(){
    var nc = document.getElementById('f_concepto_nueva');
    if(this.value==='__new__'){ nc.classList.add('show'); nc.focus(); } else nc.classList.remove('show');
  });
  document.getElementById('f_categoria').addEventListener('change', function(){
    var nc = document.getElementById('f_categoria_nueva');
    if(this.value==='__new__'){ nc.classList.add('show'); nc.focus(); } else nc.classList.remove('show');
  });
  document.getElementById('movForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    var conceptoSel = document.getElementById('f_concepto');
    var concepto = conceptoSel.value;
    if(concepto==='__new__'){
      concepto = document.getElementById('f_concepto_nueva').value.trim();
      if(!concepto){ toast('Escribí el nombre del nuevo concepto.'); return; }
    } else if(!concepto){
      toast('Elegí o agregá un concepto.'); return;
    }
    var monto = parseFloat(document.getElementById('f_monto').value);
    if(!monto){ toast('Falta el monto.'); return; }
    var catSel = document.getElementById('f_categoria');
    var categoria = catSel.value;
    if(categoria==='__new__'){
      categoria = document.getElementById('f_categoria_nueva').value.trim();
      if(!categoria){ toast('Escribí el nombre de la nueva categoría.'); return; }
    }
    var fechaVal = document.getElementById('f_fecha').value || null;
    var mesVal = fechaVal ? fechaVal.slice(0,7) : ((state.mesFilter && state.mesFilter!=='Todos') ? state.mesFilter : new Date().toISOString().slice(0,7));
    var row = {
      fecha: fechaVal,
      mes: mesVal,
      concepto: concepto,
      notas: document.getElementById('f_notas').value.trim(),
      monto: monto,
      tipo: document.getElementById('f_tipo').value,
      negocio: document.getElementById('f_negocio').value,
      categoria: categoria
    };
    addToCollection('movimientos', row).then(function(){
      toast('Línea agregada.');
      document.getElementById('f_concepto').value='';
      document.getElementById('f_concepto_nueva').value='';
      document.getElementById('f_concepto_nueva').classList.remove('show');
      document.getElementById('f_notas').value='';
      document.getElementById('f_monto').value='';
      document.getElementById('f_categoria_nueva').value='';
      document.getElementById('f_categoria_nueva').classList.remove('show');
      document.getElementById('f_negocio').focus();
    });
  });
}
function initBienForm(){
  document.getElementById('b_negocio').value = 'Hotel';
  document.getElementById('bienForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    var nombre = document.getElementById('b_nombre').value.trim();
    var valor = parseFloat(document.getElementById('b_valor').value);
    if(!nombre || !valor){ toast('Falta el nombre o el valor de origen.'); return; }
    var row = {
      nombre:nombre, categoria:document.getElementById('b_categoria').value,
      negocio:document.getElementById('b_negocio').value, valorOrigen:valor,
      fechaAlta:document.getElementById('b_fecha').value || null,
      vidaUtilAnios: parseFloat(document.getElementById('b_vida').value)||10
    };
    addToCollection('bienes', row).then(function(){
      toast('Bien agregado.');
      document.getElementById('b_nombre').value=''; document.getElementById('b_valor').value='';
      document.getElementById('b_nombre').focus();
    });
  });
}
function initDeudaForm(){
  document.getElementById('dd_negocio').value = 'Personal';
  document.getElementById('deudaForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    var concepto = document.getElementById('dd_concepto').value.trim();
    var total = parseFloat(document.getElementById('dd_total').value);
    if(!concepto || !total){ toast('Falta el acreedor o el monto total.'); return; }
    var row = {
      concepto:concepto, negocio:document.getElementById('dd_negocio').value,
      tipo:document.getElementById('dd_tipo').value, montoTotal:total,
      montoPagado: parseFloat(document.getElementById('dd_pagado').value)||0,
      fecha: new Date().toISOString().slice(0,10),
      vencimiento: document.getElementById('dd_vencimiento').value || null,
      tasaCompensatoria: parseFloat(document.getElementById('dd_tasa_comp').value)||0,
      tasaPunitoria: parseFloat(document.getElementById('dd_tasa_pun').value)||0
    };
    addToCollection('deudas', row).then(function(){
      toast('Deuda agregada.');
      document.getElementById('dd_concepto').value=''; document.getElementById('dd_total').value=''; document.getElementById('dd_pagado').value='0';
      document.getElementById('dd_vencimiento').value=''; document.getElementById('dd_tasa_comp').value='0'; document.getElementById('dd_tasa_pun').value='0';
      document.getElementById('dd_concepto').focus();
    });
  });
}

function initFijoForm(){
  document.getElementById('fj_negocio').value = 'Hotel';
  document.getElementById('fj_categoria').addEventListener('change', function(){
    var nc = document.getElementById('fj_categoria_nueva');
    if(this.value==='__new__'){ nc.classList.add('show'); nc.focus(); } else nc.classList.remove('show');
  });
  document.getElementById('fijoForm').addEventListener('submit', function(ev){
    ev.preventDefault();
    var nombre = document.getElementById('fj_nombre').value.trim();
    var monto = parseFloat(document.getElementById('fj_monto').value);
    if(!nombre || !monto){ toast('Falta el nombre o el monto.'); return; }
    var catSel = document.getElementById('fj_categoria');
    var categoria = catSel.value;
    if(categoria==='__new__'){
      categoria = document.getElementById('fj_categoria_nueva').value.trim();
      if(!categoria){ toast('Escribí el nombre de la nueva categoría.'); return; }
    }
    var row = {
      nombre: nombre, negocio: document.getElementById('fj_negocio').value,
      tipo: document.getElementById('fj_tipo').value, categoria: categoria || 'Varios',
      monto: monto
    };
    addToCollection('fijos', row).then(function(){
      toast('Fijo agregado.');
      document.getElementById('fj_nombre').value='';
      document.getElementById('fj_monto').value='';
      document.getElementById('fj_categoria_nueva').value='';
      document.getElementById('fj_categoria_nueva').classList.remove('show');
      document.getElementById('fj_nombre').focus();
    });
  });
  document.getElementById('fijosAplicarBtn').addEventListener('click', aplicarFijosDelMes);
}

function initPresupuestoPanel(){
  var root = document.getElementById('presupuestoContent');
  root.addEventListener('change', function(ev){
    var t = ev.target;
    if(!t.classList.contains('pp-presup')) return;
    if(!state.mesFilter || state.mesFilter==='Todos') return;
    var negocio = t.closest('tr').getAttribute('data-negocio');
    var tipo = t.getAttribute('data-tipo');
    var monto = parseFloat(t.value)||0;
    upsertPresupuesto(negocio, state.mesFilter, tipo, monto);
  });
  root.addEventListener('focusout', function(){ setTimeout(maybeRerender, 60); });
}

function initTabs(){
  document.getElementById('negocioTabs').addEventListener('click', function(ev){
    var btn = ev.target.closest('.tab');
    if(!btn) return;
    state.negocioFilter = btn.getAttribute('data-negocio');
    render();
  });
  document.getElementById('addNegocioBtn').addEventListener('click', openAddNegocioModal);
  document.getElementById('manageNegociosBtn').addEventListener('click', openManageNegociosModal);

  document.getElementById('mesTabs').addEventListener('click', function(ev){
    var btn = ev.target.closest('.tab');
    if(!btn) return;
    state.mesFilter = btn.getAttribute('data-mes');
    render();
  });
  document.getElementById('addMesBtn').addEventListener('click', openAddMesModal);
}
function openAddMesModal(){
  openModal(
    '<h3>Ir a un mes</h3>'+
    '<div class="field"><label for="mMes">Mes</label><input type="month" id="mMes"></div>'+
    '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Cancelar</button><button class="btn-primary" id="mSave">Ir</button></div>'
  );
  var inp = document.getElementById('mMes');
  inp.value = (state.mesFilter && state.mesFilter!=='Todos') ? state.mesFilter : new Date().toISOString().slice(0,7);
  inp.focus();
  document.getElementById('mCancel').addEventListener('click', closeModal);
  document.getElementById('mSave').addEventListener('click', function(){
    var v = inp.value;
    if(!v){ toast('Elegí un mes.'); return; }
    state.mesFilter = v;
    closeModal();
    render();
  });
}
function initViewSwitcher(){
  document.getElementById('viewSwitcher').addEventListener('click', function(ev){
    var btn = ev.target.closest('.viewtab');
    if(!btn) return;
    state.view = btn.getAttribute('data-view');
    applyViewVisibility();
  });
}
function initToolbar(){
  document.querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      document.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      state.groupBy = chip.getAttribute('data-group');
      render();
    });
  });
  var search = document.getElementById('searchBox'), t;
  search.addEventListener('input', function(){
    clearTimeout(t);
    var v = search.value;
    t = setTimeout(function(){ state.search = v.trim(); render(); }, 200);
  });
}
function initModalOverlay(){
  document.getElementById('modalOverlay').addEventListener('click', function(ev){
    if(ev.target.id==='modalOverlay') closeModal();
  });
  document.addEventListener('keydown', function(ev){
    if(ev.key==='Escape') closeModal();
  });
}

function initListDelegation(rootId){
  var root = document.getElementById(rootId);
  root.addEventListener('click', function(ev){
    var header = ev.target.closest('.group-header');
    if(header && !ev.target.closest('select')){
      header.closest('.group').classList.toggle('open');
      return;
    }
    var pago = ev.target.closest('.pago-btn');
    if(pago){
      var entryP = pago.closest('.entry');
      var idP = entryP.getAttribute('data-id');
      var deuda = state.deudas.filter(function(d){return d.id===idP;})[0];
      if(!deuda) return;
      var restante = Math.max(0,(Number(deuda.montoTotal)||0)-(Number(deuda.montoPagado)||0));
      var val = prompt('Monto del pago (saldo actual: '+money(restante)+'):');
      if(val===null) return;
      var num = parseFloat(val);
      if(isNaN(num) || num<=0){ toast('Monto inválido.'); return; }
      var nuevoPagado = Math.min((Number(deuda.montoTotal)||0), (Number(deuda.montoPagado)||0)+num);
      updateInCollection('deudas', idP, {montoPagado:nuevoPagado});
      return;
    }
    var reset = ev.target.closest('.reset-residual');
    if(reset){
      var entryR = reset.closest('.entry');
      updateInCollection('bienes', entryR.getAttribute('data-id'), {valorResidualManual:null});
      toast('Vuelve a calcularse automáticamente.');
      return;
    }
    var del = ev.target.closest('.entry-del');
    if(del){
      var entry = del.closest('.entry');
      var id = entry.getAttribute('data-id');
      var coll = del.getAttribute('data-coll');
      if(confirm('¿Eliminar esta línea?')) deleteFromCollection(coll, id);
      return;
    }
  });
  root.addEventListener('change', function(ev){
    var t = ev.target;
    if(t.classList.contains('group-categoria-select')){
      var groupEl = t.closest('.group');
      var key = groupEl.getAttribute('data-key');
      var tipo = groupEl.getAttribute('data-tipo');
      var newCat = t.value;
      if(newCat==='__new__'){
        newCat = prompt('Nombre de la nueva categoría:');
        if(!newCat){ render(); return; }
      }
      var ids = filteredDocs().filter(function(d){
        if(d.tipo!==tipo) return false;
        return groupKeyFor(d)===key;
      }).map(function(d){ return d.id; });
      ids.forEach(function(id){ updateInCollection('movimientos', id, {categoria:newCat}); });
      toast('Recategorizado: '+key+' → '+newCat+' ('+ids.length+' líneas)');
      return;
    }
    var entryEl = t.closest('.entry');
    if(!entryEl) return;
    var id2 = entryEl.getAttribute('data-id');
    var coll2 = entryEl.getAttribute('data-coll');
    if(t.classList.contains('e-fecha')) updateInCollection(coll2, id2, {fecha:t.value||null});
    else if(t.classList.contains('e-notas')) updateInCollection(coll2, id2, {notas:t.value.trim()});
    else if(t.classList.contains('e-monto')){ var v=parseFloat(t.value); if(!isNaN(v)) updateInCollection(coll2, id2, {monto:v}); }
    else if(t.classList.contains('e-nombre')) updateInCollection(coll2, id2, {nombre:t.value.trim()});
    else if(t.classList.contains('e-fechaAlta')) updateInCollection(coll2, id2, {fechaAlta:t.value||null});
    else if(t.classList.contains('e-vida')){ var vv=parseFloat(t.value); if(!isNaN(vv)&&vv>0) updateInCollection(coll2, id2, {vidaUtilAnios:vv}); }
    else if(t.classList.contains('e-valorresidual')){ var vr=parseFloat(t.value); if(!isNaN(vr)) updateInCollection(coll2, id2, {valorResidualManual:vr}); }
    else if(t.classList.contains('e-concepto')) updateInCollection(coll2, id2, {concepto:t.value.trim()});
    else if(t.classList.contains('e-vencimiento')) updateInCollection(coll2, id2, {vencimiento:t.value||null});
    else if(t.classList.contains('e-tasacomp')){ var tc=parseFloat(t.value); updateInCollection(coll2, id2, {tasaCompensatoria:isNaN(tc)?0:tc}); }
    else if(t.classList.contains('e-tasapun')){ var tp=parseFloat(t.value); updateInCollection(coll2, id2, {tasaPunitoria:isNaN(tp)?0:tp}); }
  });
  root.addEventListener('focusout', function(){ setTimeout(maybeRerender, 60); });
}

