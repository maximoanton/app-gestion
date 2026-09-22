"use strict";
// ================= export =================
function exportExcel(){
  if(!downloadsApi){ toast('La descarga no está disponible en esta vista.'); return; }
  if(typeof XLSX === 'undefined'){ toast('No se pudo cargar la librería de Excel.'); return; }
  var docs = state.docs.slice().sort(function(a,b){
    if(a.tipo!==b.tipo) return a.tipo==='Ingreso' ? -1 : 1;
    var ck = (a.concepto||'').localeCompare(b.concepto||'','es');
    if(ck!==0) return ck;
    return (b.monto||0)-(a.monto||0);
  });
  var wb = XLSX.utils.book_new();

  var names = negociosNombres();
  var resumenAoa = [['Negocio','Activo','Pasivo','Patrimonio neto','Ingresos','Egresos','Resultado']];
  names.forEach(function(n){
    var r = computeBalance(n);
    resumenAoa.push([n, r.activo, r.pasivo, r.patrimonio, r.ingresos, r.egresos, r.resultado]);
  });
  var tot = computeBalance('Todos');
  resumenAoa.push(['Total general', tot.activo, tot.pasivo, tot.patrimonio, tot.ingresos, tot.egresos, tot.resultado]);
  var wsR = XLSX.utils.aoa_to_sheet(resumenAoa);
  wsR['!cols'] = [{wch:16},{wch:14},{wch:14},{wch:15},{wch:14},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsR, 'Resumen');

  var movAoa = [['Mes','Fecha','Concepto','Notas','Monto','Tipo','Negocio','Categoría']].concat(docs.map(function(d){
    return [d.mes||'', d.fecha?fmtFecha(d.fecha):'', d.concepto, d.notas, d.monto, d.tipo, d.negocio, d.categoria];
  }));
  var wsM = XLSX.utils.aoa_to_sheet(movAoa);
  wsM['!cols'] = [{wch:9},{wch:12},{wch:22},{wch:28},{wch:13},{wch:10},{wch:12},{wch:20}];
  XLSX.utils.book_append_sheet(wb, wsM, 'Todos los movimientos');

  var bienAoa = [['Negocio','Nombre','Categoría','Valor de origen','Fecha de alta','Vida útil (años)','Amortización acumulada','Valor residual','¿Residual manual?']];
  state.bienes.forEach(function(b){
    var a = amortizacion(b);
    bienAoa.push([b.negocio, b.nombre, b.categoria, b.valorOrigen, b.fechaAlta?fmtFecha(b.fechaAlta):'', b.vidaUtilAnios, Math.round(a.acumulada), Math.round(a.residual), a.manual?'Sí':'No']);
  });
  var wsB = XLSX.utils.aoa_to_sheet(bienAoa);
  wsB['!cols'] = [{wch:12},{wch:22},{wch:16},{wch:14},{wch:12},{wch:14},{wch:16},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsB, 'Bienes de uso');

  var deudaAoa = [['Negocio','Acreedor / concepto','Tipo','Monto total','Pagado','Saldo pendiente','Fecha alta','Vencimiento','Tasa comp. % TNA','Tasa punit. % TNA','Interés acumulado']];
  state.deudas.forEach(function(x){
    var est = calcularEstadoDeuda(x);
    deudaAoa.push([x.negocio, x.concepto, x.tipo, x.montoTotal, x.montoPagado, est.saldo,
      x.fecha?fmtFecha(x.fecha):'', x.vencimiento?fmtFecha(x.vencimiento):'',
      x.tasaCompensatoria||0, x.tasaPunitoria||0, Math.round(est.interesAcumulado)]);
  });
  var wsD = XLSX.utils.aoa_to_sheet(deudaAoa);
  wsD['!cols'] = [{wch:12},{wch:22},{wch:12},{wch:13},{wch:12},{wch:14},{wch:12},{wch:12},{wch:14},{wch:14},{wch:16}];
  XLSX.utils.book_append_sheet(wb, wsD, 'Deudas');

  var presAoa = [['Negocio','Mes','Tipo','Presupuesto','Real','Diferencia']];
  state.presupuestos.slice().sort(function(a,b){
    return a.mes.localeCompare(b.mes) || a.negocio.localeCompare(b.negocio,'es') || a.tipo.localeCompare(b.tipo,'es');
  }).forEach(function(p){
    var real = realDelMes(p.negocio, p.mes, p.tipo);
    presAoa.push([p.negocio, p.mes, p.tipo, p.monto, real, real-p.monto]);
  });
  var wsP = XLSX.utils.aoa_to_sheet(presAoa);
  wsP['!cols'] = [{wch:12},{wch:10},{wch:10},{wch:13},{wch:13},{wch:13}];
  XLSX.utils.book_append_sheet(wb, wsP, 'Presupuesto');

  var wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
  var blob = new Blob([wbout], {type:'application/octet-stream'});
  downloadsApi.save({filename:'Gestion_Integral_Figallo.xlsx', data:blob}).then(function(){
    toast('Excel descargado.');
  }).catch(function(err){
    if(err && err.code==='declined') return;
    console.error(err); toast('No se pudo generar la descarga.');
  });
}

