"use strict";
// ================= ingresos y costos fijos =================
function fijoEntryHtml(f){
  return '<div class="entry entry-fijo" data-id="'+f.id+'" data-coll="fijos">'+
    '<input type="text" class="e-nombre" value="'+escapeHtml(f.nombre||'')+'" placeholder="Nombre">'+
    '<span class="entry-negocio-tag">'+escapeHtml(f.negocio)+'</span>'+
    '<span class="entry-negocio-tag">'+escapeHtml(f.categoria)+'</span>'+
    '<input type="number" class="e-monto entry-monto" value="'+(f.monto||0)+'">'+
    '<button class="entry-del" data-coll="fijos" title="Eliminar">✕</button>'+
    '</div>';
}
function renderFijos(){
  fillNegocioSelect(document.getElementById('fj_negocio'));
  fillCategoriaSelect(document.getElementById('fj_categoria'));

  var ingresos = state.fijos.filter(function(f){ return f.tipo==='Ingreso'; });
  var egresos = state.fijos.filter(function(f){ return f.tipo==='Egreso'; });
  var totIng = ingresos.reduce(function(s,f){ return s+(Number(f.monto)||0); },0);
  var totEgr = egresos.reduce(function(s,f){ return s+(Number(f.monto)||0); },0);
  document.getElementById('statFijosIngresos').textContent = money(totIng);
  document.getElementById('statFijosEgresos').textContent = money(totEgr);
  document.getElementById('statFijosNeto').textContent = money(totIng-totEgr);
  var box = document.getElementById('statFijosNetoBox'); box.className='stat '+((totIng-totEgr)>=0?'stat--pos':'stat--neg');

  var aplicarLabel = document.getElementById('fijosAplicarLabel');
  var aplicarBtn = document.getElementById('fijosAplicarBtn');
  if(aplicarLabel && aplicarBtn){
    if(state.mesFilter && state.mesFilter!=='Todos'){
      aplicarLabel.textContent = 'Genera movimientos en '+monthLabel(state.mesFilter)+' por cada fijo cargado (si ya los habías aplicado a este mes, los reemplaza sin duplicar).';
      aplicarBtn.disabled = state.fijos.length===0;
    } else {
      aplicarLabel.textContent = 'Elegí un mes puntual arriba (no "Todos los meses") para poder aplicar los fijos.';
      aplicarBtn.disabled = true;
    }
  }

  var target = document.getElementById('listFijos');
  if(!target) return;
  if(state.fijos.length===0){ target.innerHTML = '<div class="empty">Todavía no cargaste ingresos ni costos fijos.</div>'; return; }
  var html = '';
  if(ingresos.length){
    html += '<section class="tipo-section"><div class="tipo-heading ingreso"><h2>Ingresos fijos</h2><span class="tipo-total">'+money(totIng)+'</span></div>'+
      ingresos.map(fijoEntryHtml).join('')+'</section>';
  }
  if(egresos.length){
    html += '<section class="tipo-section"><div class="tipo-heading egreso"><h2>Costos fijos</h2><span class="tipo-total">'+money(totEgr)+'</span></div>'+
      egresos.map(fijoEntryHtml).join('')+'</section>';
  }
  target.innerHTML = html;
}
function aplicarFijosDelMes(){
  if(!state.mesFilter || state.mesFilter==='Todos'){ toast('Elegí un mes puntual arriba primero.'); return; }
  if(state.fijos.length===0){ toast('No hay fijos cargados.'); return; }
  if(!dbApi){ toast('Sin conexión a la base.'); return; }
  var mes = state.mesFilter;
  var fijoIds = state.fijos.map(function(f){ return f.id; });
  var viejos = state.docs.filter(function(d){ return d.origenFijo && fijoIds.indexOf(d.origenFijo)!==-1 && d.mes===mes; });
  var btn = document.getElementById('fijosAplicarBtn');
  if(btn) btn.disabled = true;
  Promise.all(viejos.map(function(d){ return deleteFromCollection('movimientos', d.id); }))
    .then(function(){
      return Promise.all(state.fijos.map(function(f){
        return addToCollection('movimientos', {
          fecha: null, mes: mes, concepto: f.nombre, notas: 'Fijo aplicado', monto: Number(f.monto)||0,
          tipo: f.tipo, negocio: f.negocio, categoria: f.categoria, origenFijo: f.id
        });
      }));
    })
    .then(function(){ toast('Fijos aplicados a '+monthLabel(mes)+'.'); })
    .catch(function(err){ console.error(err); toast('No se pudo aplicar los fijos.'); })
    .then(function(){ if(btn) btn.disabled = false; renderFijos(); });
}

function upsertPresupuesto(negocio, mes, tipo, monto){
  var found = state.presupuestos.filter(function(p){ return p.negocio===negocio && p.mes===mes && p.tipo===tipo; })[0];
  if(found) updateInCollection('presupuestos', found.id, {monto:monto});
  else addToCollection('presupuestos', {negocio:negocio, mes:mes, tipo:tipo, monto:monto});
}

