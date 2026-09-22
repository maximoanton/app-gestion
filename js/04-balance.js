"use strict";
// ================= balance per negocio =================
function computeBalance(negocio){
  var base = negocio==='Todos' ? state.docs : state.docs.filter(function(d){ return d.negocio===negocio; });
  var cutoff = (state.mesFilter && state.mesFilter!=='Todos') ? state.mesFilter : null;
  var movs = cutoff ? base.filter(function(d){ return d.mes && d.mes<=cutoff; }) : base;
  var ingresos = movs.filter(function(d){return d.tipo==='Ingreso';}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
  var egresos = movs.filter(function(d){return d.tipo==='Egreso';}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
  var caja = ingresos-egresos;

  var biens = negocio==='Todos' ? state.bienes : state.bienes.filter(function(b){ return b.negocio===negocio; });
  var origenTot=0, amortTot=0, residualTot=0;
  biens.forEach(function(b){
    var a = amortizacion(b);
    origenTot += Number(b.valorOrigen)||0; amortTot += a.acumulada; residualTot += a.residual;
  });

  var deud = negocio==='Todos' ? state.deudas : state.deudas.filter(function(d){ return d.negocio===negocio; });
  var pasivo=0, cxc=0;
  deud.forEach(function(x){
    var saldo = Math.max(0,(Number(x.montoTotal)||0)-(Number(x.montoPagado)||0));
    if(x.tipo==='Nos deben') cxc += saldo; else pasivo += saldo;
  });

  var activo = caja + residualTot + cxc;
  var patrimonio = activo - pasivo;
  return {negocio:negocio, ingresos:ingresos, egresos:egresos, resultado:ingresos-egresos, caja:caja,
    origenTot:origenTot, amortTot:amortTot, residualTot:residualTot, pasivo:pasivo, cxc:cxc,
    activo:activo, patrimonio:patrimonio};
}

