"use strict";
// ================= db plumbing =================
function docFromMov(id, data){
  return {id:id, fecha:data.fecha||null, mes:data.mes||null, concepto:data.concepto||'', notas:data.notas||'',
    monto:Number(data.monto)||0, tipo:data.tipo||'Egreso', negocio:data.negocio||'Personal',
    categoria:data.categoria||'Varios', origenCierre:data.origenCierre||null, origenFijo:data.origenFijo||null};
}
function docFromFijo(id, data){
  return {id:id, nombre:data.nombre||'', negocio:data.negocio||'Personal', tipo:data.tipo||'Egreso',
    categoria:data.categoria||'Varios', monto:Number(data.monto)||0};
}
function docFromBien(id, data){
  return {id:id, nombre:data.nombre||'', categoria:data.categoria||'Otros', negocio:data.negocio||'Hotel',
    valorOrigen:Number(data.valorOrigen)||0, fechaAlta:data.fechaAlta||null, vidaUtilAnios:Number(data.vidaUtilAnios)||10,
    valorResidualManual: (data.valorResidualManual==null || data.valorResidualManual==='') ? null : Number(data.valorResidualManual)};
}
function docFromDeuda(id, data){
  return {id:id, concepto:data.concepto||'', negocio:data.negocio||'Personal', tipo:data.tipo||'Debemos',
    montoTotal:Number(data.montoTotal)||0, montoPagado:Number(data.montoPagado)||0, fecha:data.fecha||null,
    vencimiento:data.vencimiento||null, tasaCompensatoria:Number(data.tasaCompensatoria)||0, tasaPunitoria:Number(data.tasaPunitoria)||0};
}
function docFromPresupuesto(id, data){
  return {id:id, negocio:data.negocio||'', mes:data.mes||'', tipo:data.tipo||'Egreso', monto:Number(data.monto)||0};
}

function addToCollection(name, data){
  if(!dbApi){ toast('Sin conexión a la base — no se guardó.'); return Promise.resolve(); }
  return dbApi.collection(name).add(data).catch(function(err){ console.error(err); toast('No se pudo agregar.'); });
}
function updateInCollection(name, id, patch){
  if(!dbApi){ toast('Sin conexión a la base.'); return Promise.resolve(); }
  return dbApi.collection(name).doc(id).update(patch).catch(function(err){ console.error(err); toast('No se pudo guardar el cambio.'); });
}
function deleteFromCollection(name, id){
  if(!dbApi){ toast('Sin conexión a la base.'); return Promise.resolve(); }
  dbApi.collection(name).doc(id).delete().catch(function(err){ console.error(err); toast('No se pudo eliminar.'); });
}

function seedIfEmpty(){
  return dbApi.doc('meta/config').get().then(function(snap){
    var cfg = snap.exists ? snap.data() : null;
    if(cfg && cfg.seeded) return;
    return dbApi.doc('meta/config').acquire({holder:'seed-'+Date.now()+'-'+Math.random().toString(36).slice(2), ttlMs:60000}).then(function(lease){
      if(!lease.acquired) return; // another tab/session is already seeding
      return dbApi.doc('meta/config').get().then(function(snap2){
        var cfg2 = snap2.exists ? snap2.data() : null;
        if(cfg2 && cfg2.seeded) return;
        var listEl = document.getElementById('listMovimientos');
        if(listEl) listEl.innerHTML = '<div class="empty">Cargando el registro inicial…</div>';
        var col = dbApi.collection('movimientos');
        var chunks = [];
        for(var i=0;i<SEED_MOVIMIENTOS.length;i+=25) chunks.push(SEED_MOVIMIENTOS.slice(i,i+25));
        var p = Promise.resolve();
        chunks.forEach(function(chunk){
          p = p.then(function(){ return Promise.all(chunk.map(function(row){ return col.add(row); })); });
        });
        p = p.then(function(){
          var negCol = dbApi.collection('negocios');
          return Promise.all(DEFAULT_NEGOCIOS.map(function(n,idx){ return negCol.add({nombre:n, createdAt:Date.now()+idx}); }));
        });
        return p.then(function(){ return dbApi.doc('meta/config').update({seeded:true, seededAt:Date.now()}); });
      });
    });
  }).catch(function(err){ console.error('seed error', err); });
}

function migrateMesIfNeeded(rawDocs){
  if(state.mesMigrationDone) return;
  var missing = rawDocs.filter(function(d){ return !d.data().mes; });
  state.mesMigrationDone = true;
  missing.forEach(function(d){
    var data = d.data();
    var mes = data.fecha ? data.fecha.slice(0,7) : '2026-08';
    updateInCollection('movimientos', d.id, {mes:mes});
  });
}

function subscribe(){
  dbApi.collection('movimientos').limit(1000).onSnapshot(function(snap){
    state.docs = snap.docs.map(function(d){ return docFromMov(d.id, d.data()); });
    migrateMesIfNeeded(snap.docs);
    render();
  }, function(err){ console.error(err); showBanner('Hubo un problema leyendo los movimientos ('+err.code+').'); });

  dbApi.collection('bienes').limit(500).onSnapshot(function(snap){
    state.bienes = snap.docs.map(function(d){ return docFromBien(d.id, d.data()); });
    render();
  }, function(err){ console.error(err); });

  dbApi.collection('deudas').limit(500).onSnapshot(function(snap){
    state.deudas = snap.docs.map(function(d){ return docFromDeuda(d.id, d.data()); });
    render();
  }, function(err){ console.error(err); });

  dbApi.collection('negocios').limit(200).onSnapshot(function(snap){
    state.negocios = snap.docs.map(function(d){ var nd=d.data()||{}; return {id:d.id, nombre:nd.nombre||'', createdAt:nd.createdAt||0, esNegocio:nd.esNegocio!==false}; });
    render();
  }, function(err){ console.error(err); });

  dbApi.collection('presupuestos').limit(500).onSnapshot(function(snap){
    state.presupuestos = snap.docs.map(function(d){ return docFromPresupuesto(d.id, d.data()); });
    render();
  }, function(err){ console.error(err); });

  dbApi.collection('cierres').limit(500).onSnapshot(function(snap){
    state.cierres = snap.docs.map(function(d){ return Object.assign({id:d.id}, d.data()); });
    render();
  }, function(err){ console.error(err); });

  dbApi.collection('fijos').limit(300).onSnapshot(function(snap){
    state.fijos = snap.docs.map(function(d){ return docFromFijo(d.id, d.data()); });
    render();
  }, function(err){ console.error(err); });
}

function showBanner(msg){
  document.getElementById('banner-slot').innerHTML = '<div class="banner">'+escapeHtml(msg)+'</div>';
}

