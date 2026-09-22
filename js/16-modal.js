"use strict";
// ================= modal =================
function openModal(html){
  document.getElementById('modalCard').innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal(){ document.getElementById('modalOverlay').classList.add('hidden'); }

function openAddNegocioModal(){
  openModal(
    '<h3>Agregar negocio</h3>'+
    '<div class="field"><label for="mNombre">Nombre</label><input type="text" id="mNombre" placeholder="Ej: Ferretería"></div>'+
    '<div class="field" style="flex-direction:row; align-items:center; gap:8px; margin-top:10px;"><input type="checkbox" id="mEsNegocio" checked style="width:auto;"><label for="mEsNegocio" style="font-weight:400;">Es un negocio propiamente dicho (desmarcá esto para algo general como "Personal" o "Proveedores")</label></div>'+
    '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Cancelar</button><button class="btn-primary" id="mSave">Agregar</button></div>'
  );
  document.getElementById('mNombre').focus();
  document.getElementById('mCancel').addEventListener('click', closeModal);
  document.getElementById('mSave').addEventListener('click', function(){
    var v = document.getElementById('mNombre').value.trim();
    if(!v){ toast('Escribí un nombre.'); return; }
    var existing = negociosNombres().map(function(n){return n.toLowerCase();});
    if(existing.indexOf(v.toLowerCase())!==-1){ toast('Ya existe un negocio con ese nombre.'); return; }
    var esNeg = document.getElementById('mEsNegocio').checked;
    addToCollection('negocios', {nombre:v, createdAt:Date.now(), esNegocio:esNeg}).then(function(){
      toast('Agregado: '+v);
      closeModal();
    });
  });
}

function renameNegocio(id, oldName, newName){
  newName = newName.trim();
  if(!newName || newName===oldName) return;
  var existing = negociosNombres().filter(function(n){return n!==oldName;}).map(function(n){return n.toLowerCase();});
  if(existing.indexOf(newName.toLowerCase())!==-1){ toast('Ya existe otro negocio con ese nombre.'); return; }
  state.docs.filter(function(d){return d.negocio===oldName;}).forEach(function(d){ updateInCollection('movimientos', d.id, {negocio:newName}); });
  state.bienes.filter(function(d){return d.negocio===oldName;}).forEach(function(d){ updateInCollection('bienes', d.id, {negocio:newName}); });
  state.deudas.filter(function(d){return d.negocio===oldName;}).forEach(function(d){ updateInCollection('deudas', d.id, {negocio:newName}); });
  updateInCollection('negocios', id, {nombre:newName});
  if(state.negocioFilter===oldName) state.negocioFilter = newName;
  toast('Negocio renombrado a "'+newName+'".');
}

function openManageNegociosModal(){
  var list = state.negocios.slice().sort(function(a,b){return (a.createdAt||0)-(b.createdAt||0);});
  var rows = list.map(function(n){
    return '<div class="manage-row" data-id="'+n.id+'" data-old="'+escapeHtml(n.nombre)+'">'+
      '<input type="text" class="mn-nombre" value="'+escapeHtml(n.nombre)+'">'+
      '<label style="display:flex; align-items:center; gap:4px; font-size:11.5px; color:var(--ink-soft); white-space:nowrap;"><input type="checkbox" class="mn-esnegocio" style="width:auto;"'+(n.esNegocio!==false?' checked':'')+'>Negocio</label>'+
      '<button class="entry-del mn-del" title="Eliminar">✕</button></div>';
  }).join('') || '<p style="color:var(--ink-soft); font-size:13px;">Todavía no hay negocios cargados.</p>';
  openModal('<h3>Gestionar negocios</h3><div class="manage-list">'+rows+'</div>'+
    '<p class="pres-note">Destildá "Negocio" para algo general como Personal o Proveedores — pasa al grupo "Otros" en las pestañas.</p>'+
    '<div class="modal-actions"><button class="btn-ghost" id="mClose">Cerrar</button></div>');
  document.getElementById('mClose').addEventListener('click', closeModal);
  document.getElementById('modalCard').querySelectorAll('.mn-nombre').forEach(function(inp){
    inp.addEventListener('change', function(){
      var row = inp.closest('.manage-row');
      renameNegocio(row.getAttribute('data-id'), row.getAttribute('data-old'), inp.value);
      row.setAttribute('data-old', inp.value.trim());
    });
  });
  document.getElementById('modalCard').querySelectorAll('.mn-esnegocio').forEach(function(chk){
    chk.addEventListener('change', function(){
      var row = chk.closest('.manage-row');
      updateInCollection('negocios', row.getAttribute('data-id'), {esNegocio: chk.checked});
    });
  });
  document.getElementById('modalCard').querySelectorAll('.mn-del').forEach(function(btn){
    btn.addEventListener('click', function(){
      var row = btn.closest('.manage-row');
      var name = row.getAttribute('data-old');
      if(confirm('¿Eliminar el negocio "'+name+'"? Los movimientos, bienes y deudas ya cargados con este negocio no se borran, solo dejan de estar en la lista.')){
        deleteFromCollection('negocios', row.getAttribute('data-id'));
        if(state.negocioFilter===name) state.negocioFilter='Todos';
        row.remove();
      }
    });
  });
}

