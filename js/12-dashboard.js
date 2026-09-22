"use strict";
// ================= dashboard =================
function totalesPorNegocioTipo(){
  var periodo = (state.mesFilter && state.mesFilter!=='Todos') ? state.mesFilter : null;
  return negociosNombres().map(function(n){
    var docsN = state.docs.filter(function(d){ return d.negocio===n && (!periodo || d.mes===periodo); });
    var ing = docsN.filter(function(d){return d.tipo==='Ingreso';}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
    var egr = docsN.filter(function(d){return d.tipo==='Egreso';}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
    return {negocio:n, ingresos:ing, egresos:egr};
  });
}

function buildBarChartSvg(totals){
  var W=700,H=320, ml=60, mr=16, mt=16, mb=52;
  var pw=W-ml-mr, ph=H-mt-mb;
  var maxVal = 0;
  totals.forEach(function(t){ maxVal=Math.max(maxVal,t.ingresos,t.egresos); });
  if(maxVal<=0) maxVal=1;
  var n = Math.max(1,totals.length);
  var groupW = pw/n;
  var barW = Math.min(38, groupW*0.34);
  var ingresoColor=cssVar('--ingreso'), egresoColor=cssVar('--egreso'), lineColor=cssVar('--line'),
      inkSoft=cssVar('--ink-soft'), ink=cssVar('--ink');

  var gridLines='', gridLabels=''; var ticks=4;
  for(var i=0;i<=ticks;i++){
    var val = maxVal*i/ticks;
    var y = mt+ph-(val/maxVal*ph);
    gridLines += '<line x1="'+ml+'" y1="'+y.toFixed(1)+'" x2="'+(ml+pw)+'" y2="'+y.toFixed(1)+'" stroke="'+lineColor+'" stroke-width="1" stroke-dasharray="'+(i===0?'0':'3,3')+'"/>';
    gridLabels += '<text x="'+(ml-8)+'" y="'+(y+4).toFixed(1)+'" font-size="10.5" fill="'+inkSoft+'" text-anchor="end">'+escapeHtml(moneyShort(val))+'</text>';
  }

  var bars='', labels='';
  totals.forEach(function(t,i){
    var x0 = ml + i*groupW;
    var hIng = t.ingresos/maxVal*ph, hEgr = t.egresos/maxVal*ph;
    var xIng = x0 + groupW/2 - barW - 3;
    var xEgr = x0 + groupW/2 + 3;
    bars += '<rect x="'+xIng.toFixed(1)+'" y="'+(mt+ph-hIng).toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,hIng).toFixed(1)+'" fill="'+ingresoColor+'" rx="2"><title>'+escapeHtml(t.negocio)+' — Ingresos: '+money(t.ingresos)+'</title></rect>';
    bars += '<rect x="'+xEgr.toFixed(1)+'" y="'+(mt+ph-hEgr).toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,hEgr).toFixed(1)+'" fill="'+egresoColor+'" rx="2"><title>'+escapeHtml(t.negocio)+' — Egresos: '+money(t.egresos)+'</title></rect>';
    labels += '<text x="'+(x0+groupW/2).toFixed(1)+'" y="'+(mt+ph+20)+'" font-size="11" fill="'+ink+'" text-anchor="middle" font-weight="600">'+escapeHtml(t.negocio)+'</text>';
  });

  return '<div class="dash-legend"><span class="dash-swatch" style="background:'+ingresoColor+'"></span>Ingresos'+
    '<span class="dash-swatch" style="margin-left:10px;background:'+egresoColor+'"></span>Egresos</div>'+
    '<svg viewBox="0 0 '+W+' '+H+'" class="dash-svg" role="img" aria-label="Comparativo de ingresos y egresos por negocio">'+
    gridLines+gridLabels+bars+labels+
    '<line x1="'+ml+'" y1="'+(mt+ph)+'" x2="'+(ml+pw)+'" y2="'+(mt+ph)+'" stroke="'+ink+'" stroke-width="1.4"/>'+
    '</svg>';
}

function buildPiePanel(title, items){
  var total = items.reduce(function(s,it){ return s+Math.max(0,it.value); },0);
  var body;
  if(total<=0){
    body = '<div class="empty" style="padding:14px;">Todavía no hay datos.</div>';
  } else {
    var cx=105, cy=105, r=92;
    var nonZero = items.filter(function(it){ return it.value>0; });
    var paths='';
    if(nonZero.length===1){
      paths = '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+nonZero[0].color+'"><title>'+escapeHtml(nonZero[0].label)+': '+money(nonZero[0].value)+' (100%)</title></circle>';
    } else {
      var angleAcc=0;
      items.forEach(function(it){
        if(it.value<=0) return;
        var slice = it.value/total*360;
        var start = polarToCartesian(cx,cy,r,angleAcc);
        var end = polarToCartesian(cx,cy,r,angleAcc+slice);
        var largeArc = slice>180?1:0;
        paths += '<path d="M'+cx+','+cy+' L'+start.x.toFixed(2)+','+start.y.toFixed(2)+' A'+r+','+r+' 0 '+largeArc+' 1 '+end.x.toFixed(2)+','+end.y.toFixed(2)+' Z" fill="'+it.color+'"><title>'+escapeHtml(it.label)+': '+money(it.value)+' ('+Math.round(it.value/total*100)+'%)</title></path>';
        angleAcc += slice;
      });
    }
    var legend = nonZero.map(function(it){
      return '<div class="pie-legend-row"><span class="dash-swatch" style="background:'+it.color+'"></span>'+
        '<span class="pie-legend-label">'+escapeHtml(it.label)+'</span>'+
        '<span class="pie-legend-val">'+money(it.value)+' · '+Math.round(it.value/total*100)+'%</span></div>';
    }).join('');
    body = '<svg viewBox="0 0 210 210" class="dash-svg pie-svg" role="img" aria-label="'+escapeHtml(title)+'">'+paths+'</svg>'+
      '<div class="pie-legend">'+legend+'</div>';
  }
  return '<div class="pie-card"><h4>'+escapeHtml(title)+'</h4>'+body+'</div>';
}

function buildLineChartSvg(months, series){
  var W=700,H=300, ml=60, mr=16, mt=16, mb=40;
  var pw=W-ml-mr, ph=H-mt-mb;
  var allVals=[0];
  series.forEach(function(s){ s.values.forEach(function(v){ allVals.push(v); }); });
  var maxVal=Math.max.apply(null, allVals), minVal=Math.min.apply(null, allVals);
  if(maxVal===minVal) maxVal += 1;
  var range = maxVal-minVal;
  var n = months.length;
  var xStep = n>1 ? pw/(n-1) : 0;
  function xFor(i){ return n>1 ? ml+i*xStep : ml+pw/2; }
  function yFor(v){ return mt+ph-((v-minVal)/range*ph); }

  var lineColor=cssVar('--line'), inkSoft=cssVar('--ink-soft'), ink=cssVar('--ink');
  var gridLines='', gridLabels=''; var ticks=4;
  for(var i=0;i<=ticks;i++){
    var val = minVal+range*i/ticks;
    var y = yFor(val);
    gridLines += '<line x1="'+ml+'" y1="'+y.toFixed(1)+'" x2="'+(ml+pw)+'" y2="'+y.toFixed(1)+'" stroke="'+lineColor+'" stroke-width="1" stroke-dasharray="'+(Math.abs(val)<0.5?'0':'3,3')+'"/>';
    gridLabels += '<text x="'+(ml-8)+'" y="'+(y+4).toFixed(1)+'" font-size="10.5" fill="'+inkSoft+'" text-anchor="end">'+escapeHtml(moneyShort(val))+'</text>';
  }
  var xLabels='';
  months.forEach(function(m,i){
    xLabels += '<text x="'+xFor(i).toFixed(1)+'" y="'+(mt+ph+20)+'" font-size="10.5" fill="'+ink+'" text-anchor="middle">'+escapeHtml(monthLabel(m))+'</text>';
  });

  var linesHtml='', legendHtml='';
  series.forEach(function(s){
    var pts = s.values.map(function(v,i){ return xFor(i).toFixed(1)+','+yFor(v).toFixed(1); }).join(' ');
    var dots = s.values.map(function(v,i){
      return '<circle cx="'+xFor(i).toFixed(1)+'" cy="'+yFor(v).toFixed(1)+'" r="3.4" fill="'+s.color+'"><title>'+escapeHtml(s.name)+' — '+monthLabel(months[i])+': '+money(v)+'</title></circle>';
    }).join('');
    linesHtml += '<polyline points="'+pts+'" fill="none" stroke="'+s.color+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>'+dots;
    legendHtml += '<span class="dash-swatch" style="background:'+s.color+'"></span>'+escapeHtml(s.name)+'&nbsp;&nbsp; ';
  });

  return '<div class="dash-legend">'+legendHtml+'</div>'+
    '<svg viewBox="0 0 '+W+' '+H+'" class="dash-svg" role="img" aria-label="Tendencia mensual de ingresos, egresos y resultado">'+
    gridLines+gridLabels+linesHtml+xLabels+
    '</svg>';
}

function buildTrendSection(){
  var monthsSet = {};
  state.docs.forEach(function(d){ if(d.mes) monthsSet[d.mes]=true; });
  var months = Object.keys(monthsSet).sort();
  if(months.length===0){
    return '<div class="empty">Todavía no hay movimientos cargados para armar una tendencia.</div>';
  }
  var ingSerie=[], egrSerie=[], resSerie=[];
  months.forEach(function(m){
    var ing = state.docs.filter(function(d){return d.tipo==='Ingreso' && d.mes===m;}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
    var egr = state.docs.filter(function(d){return d.tipo==='Egreso' && d.mes===m;}).reduce(function(s,d){return s+(Number(d.monto)||0);},0);
    ingSerie.push(ing); egrSerie.push(egr); resSerie.push(ing-egr);
  });
  var html = '';
  if(months.length<2){
    html += '<p class="pres-note">Necesitás datos de al menos 2 meses distintos para ver una tendencia. Por ahora solo hay datos de '+monthLabel(months[0])+'.</p>';
  }
  html += buildLineChartSvg(months, [
    {name:'Ingresos', color:cssVar('--ingreso'), values:ingSerie},
    {name:'Egresos', color:cssVar('--egreso'), values:egrSerie},
    {name:'Resultado', color:cssVar('--accent'), values:resSerie}
  ]);
  return html;
}

function renderDashboard(){
  var target = document.getElementById('dashboardContent');
  if(!target) return;
  var totals = totalesPorNegocioTipo();
  var hasAny = totals.some(function(t){ return t.ingresos>0 || t.egresos>0; });
  var periodoLabel = (state.mesFilter && state.mesFilter!=='Todos') ? monthLabel(state.mesFilter) : 'todo el historial';

  var html = '<h3 class="dash-heading">Comparativo por negocio — '+escapeHtml(periodoLabel)+'</h3>';
  html += hasAny ? buildBarChartSvg(totals) : '<div class="empty">Todavía no hay movimientos cargados para este período.</div>';

  html += '<h3 class="dash-heading">Ingresos y egresos por negocio — '+escapeHtml(periodoLabel)+'</h3>';
  html += '<div class="dash-pies">';
  html += buildPiePanel('Ingresos por negocio', totals.map(function(t,i){ return {label:t.negocio, value:t.ingresos, color:colorForIndex(i)}; }));
  html += buildPiePanel('Egresos por negocio', totals.map(function(t,i){ return {label:t.negocio, value:t.egresos, color:colorForIndex(i)}; }));
  html += '</div>';

  html += '<h3 class="dash-heading">Tendencia mensual (todo el historial)</h3>';
  html += buildTrendSection();

  target.innerHTML = html;
}

