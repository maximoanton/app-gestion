"use strict";
// ================= balance view =================
function renderBalance(){
  var target = document.getElementById('balanceContent');
  if(!target) return;
  var neg = state.negocioFilter;
  var b = computeBalance(neg);
  document.getElementById('statActivo').textContent = money(b.activo);
  document.getElementById('statPasivo').textContent = money(b.pasivo);
  document.getElementById('statPatrimonio').textContent = money(b.patrimonio);
  var pnBox = document.getElementById('statPatrimonioBox'); pnBox.className='stat '+(b.patrimonio>=0?'stat--pos':'stat--neg');

  var asOf = (state.mesFilter && state.mesFilter!=='Todos')
    ? '<p class="pres-note">Caja acumulada hasta el cierre de '+monthLabel(state.mesFilter)+'. Bienes y deudas muestran su estado actual.</p>'
    : '<p class="pres-note">Caja acumulada de todos los movimientos históricos.</p>';

  var html = asOf;
  if(neg==='Todos'){
    var names = negociosNombres();
    html += '<table class="balance-summary-table"><thead><tr><th>Negocio</th><th>Caja</th><th>Bienes (residual)</th><th>Cuentas x cobrar</th><th>Activo</th><th>Pasivo</th><th>Patrimonio</th></tr></thead><tbody>';
    names.forEach(function(n){
      var r = computeBalance(n);
      html += '<tr><td>'+escapeHtml(n)+'</td><td>'+money(r.caja)+'</td><td>'+money(r.residualTot)+'</td><td>'+money(r.cxc)+'</td><td>'+money(r.activo)+'</td><td>'+money(r.pasivo)+'</td><td class="'+(r.patrimonio>=0?'pos':'neg')+'">'+money(r.patrimonio)+'</td></tr>';
    });
    html += '</tbody><tfoot><tr><td>Total general</td><td>'+money(b.caja)+'</td><td>'+money(b.residualTot)+'</td><td>'+money(b.cxc)+'</td><td>'+money(b.activo)+'</td><td>'+money(b.pasivo)+'</td><td class="'+(b.patrimonio>=0?'pos':'neg')+'">'+money(b.patrimonio)+'</td></tr></tfoot></table>';
  }
  html += '<div class="balance-t">'+
    '<div class="balance-col activo"><h3>Activo</h3>'+
      '<div class="bline"><span>Caja (acumulada de movimientos)</span><span>'+money(b.caja)+'</span></div>'+
      '<div class="bline"><span>Cuentas por cobrar</span><span>'+money(b.cxc)+'</span></div>'+
      '<div class="bline"><span>Bienes de uso (valor residual)</span><span>'+money(b.residualTot)+'</span></div>'+
      '<div class="bline total"><span>Total Activo</span><span>'+money(b.activo)+'</span></div>'+
    '</div>'+
    '<div class="balance-col pasivo"><h3>Pasivo</h3>'+
      '<div class="bline"><span>Deudas</span><span>'+money(b.pasivo)+'</span></div>'+
      '<div class="bline total"><span>Total Pasivo</span><span>'+money(b.pasivo)+'</span></div>'+
      '<h3 class="pn-heading">Patrimonio neto</h3>'+
      '<div class="bline total pn '+(b.patrimonio>=0?'pos':'neg')+'"><span>Activo − Pasivo</span><span>'+money(b.patrimonio)+'</span></div>'+
    '</div>'+
  '</div>';
  target.innerHTML = html;
}

