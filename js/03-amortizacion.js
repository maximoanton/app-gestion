"use strict";
// ================= amortización =================
function amortizacion(bien){
  var origen = Number(bien.valorOrigen)||0;
  if(bien.valorResidualManual!=null && bien.valorResidualManual!==''){
    var residualManual = Number(bien.valorResidualManual)||0;
    return {acumulada: origen-residualManual, residual: residualManual, manual:true};
  }
  var vidaAnios = Number(bien.vidaUtilAnios)||1;
  var vidaMeses = vidaAnios*12;
  if(!bien.fechaAlta) return {acumulada:0, residual:origen, manual:false};
  var parts = bien.fechaAlta.split('-');
  var alta = new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2])||1);
  var ahora = new Date();
  var meses = (ahora.getFullYear()-alta.getFullYear())*12 + (ahora.getMonth()-alta.getMonth());
  meses = Math.max(0, meses);
  var acumulada = Math.min(origen, vidaMeses>0 ? origen*meses/vidaMeses : origen);
  return {acumulada:acumulada, residual:origen-acumulada, manual:false};
}

