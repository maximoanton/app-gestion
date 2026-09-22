"use strict";
// ================= cierre diario (Sabor de Casa) =================
function cdPromptFrente(){
  return [
    'Sos el transcriptor de planillas de caja de SABOR DE CASA, un local gastronómico de Argentina. Recibís la foto de la HOJA 1 (frente) de la planilla diaria escrita a mano y devolvés SOLO un objeto JSON válido: sin texto antes ni después, sin bloques de código, sin comentarios.',
    '',
    'HOJA 1 (frente): FECHA, TURNO (MAÑANA o TARDE), CAJA/RESPONSABLE, INICIO DE CAJA (efectivo con el que se abre) y PLANILLA N° x DE y. Debajo, las VENTAS numeradas: detalle, importe cobrado y dos columnas de cobro: EF (efectivo) y TR (transferencia/QR/Mercado Pago). La primera fila, marcada "EJ", es un ejemplo: ignorala.',
    'Si la planilla es del formato viejo (columnas INGRESOS/EGRESOS/GASTOS, "Inicio caja" escrito arriba), transcribila igual según lo escrito y agregá una alerta indicando que es formato viejo.',
    '',
    'REGLAS',
    '1. No inventes nada. Si un valor no se puede leer, poné null y confianza "baja".',
    '2. Dígitos ambiguos (1/7, 2/7, 0/6, 4/9, 5/6, 3/8): la lectura más probable, y en "alternativas" la otra lectura completa. Confianza "media" o "baja".',
    '3. Importes: número entero en pesos, sin puntos ni comas. Si un importe parece de otro orden de magnitud que los demás, avisalo en alertas.',
    '4. Medio de cobro: solo lo marcado. "EF" o "TR". Sin marca → null y alerta. Dos marcas → null y alerta.',
    '5. Detalle: literal, en mayúsculas, sin expandir abreviaturas dudosas (aclará en "nota" qué podría significar).',
    '6. Renglones vacíos: omitilos. Tachados: omitilos y avisalo ("Ventas #N tachado").',
    '7. Fecha en AAAA-MM-DD (null si falta). Turno: "manana", "tarde" o null.',
    '8. No sumes ni calcules nada — eso lo hace la aplicación.',
    '9. Cada fila lleva "confianza" ("alta"/"media"/"baja") y "nota" opcional.',
    '10. "alertas": frases cortas y concretas apuntando al renglón.',
    '',
    'Si recibís más de una foto de esta misma hoja (porque tiene muchas filas), procesalas todas y devolvé una sola lista de ventas continuando la numeración.',
    '',
    'Devolvé SOLO este JSON (sin texto extra):',
    '{"fecha":"AAAA-MM-DD"|null,"turno":"manana"|"tarde"|null,"responsable":string|null,"planilla":{"numero":int|null,"de":int|null},"inicio_caja":int|null,"ventas":[{"n":int,"detalle":string,"importe":int|null,"medio":"EF"|"TR"|null,"confianza":"alta"|"media"|"baja","alternativas":[int],"nota":string|null}],"alertas":[string]}'
  ].join('\n');
}
function cdPromptDorso(){
  return [
    'Sos el transcriptor de planillas de caja de SABOR DE CASA, un local gastronómico de Argentina. Recibís la foto de la HOJA 2 (dorso) de la planilla diaria escrita a mano y devolvés SOLO un objeto JSON válido: sin texto antes ni después, sin bloques de código, sin comentarios.',
    '',
    'HOJA 2 (dorso): COMPRAS A PROVEEDORES (proveedor, qué compró, cantidad, importe total y con qué pagó: EF, TR o CTA = a cuenta, todavía no se pagó), OTROS GASTOS Y RETIROS (concepto, importe, EF/TR) y CIERRE DE CAJA (cantidad de billetes por denominación, efectivo contado, retiro al cierre, queda para mañana), más observaciones.',
    '',
    'REGLAS',
    '1. No inventes nada. Si un valor no se puede leer, poné null y confianza "baja".',
    '2. Dígitos ambiguos (1/7, 2/7, 0/6, 4/9, 5/6, 3/8): la lectura más probable, y en "alternativas" la otra lectura completa. Confianza "media" o "baja".',
    '3. Importes: número entero en pesos, sin puntos ni comas. Avisá en alertas si un importe parece de otro orden de magnitud.',
    '4. Medio de pago: solo lo marcado ("EF","TR", y en compras también "CTA"). Sin marca → null y alerta. Dos marcas → null y alerta.',
    '5. Textos: literal, en mayúsculas, sin expandir abreviaturas dudosas.',
    '6. Renglones vacíos: omitilos. Tachados: omitilos y avisalo.',
    '7. No sumes ni calcules nada — ni totales, ni arqueo. Transcribí las cantidades del cierre tal cual están escritas.',
    '8. Gastos: clasificá "tipo" como "sueldo","servicio","retiro" (plata que se lleva el dueño),"pago_deuda_proveedor" (pago de una compra anterior a cuenta, en ese caso "concepto" es el nombre del proveedor),"insumo" u "otro". Si dudás, "otro".',
    '9. Cada fila lleva "confianza" ("alta"/"media"/"baja") y "nota" opcional.',
    '10. "alertas": frases cortas apuntando al renglón; incluí medios de pago sin marcar y hoja borrosa o cortada.',
    '',
    'Si recibís más de una foto de esta misma hoja, procesalas todas y unilas en un solo objeto.',
    '',
    'Devolvé SOLO este JSON (sin texto extra):',
    '{"compras":[{"n":int,"proveedor":string,"detalle":string|null,"cantidad":string|null,"importe":int|null,"pago":"EF"|"TR"|"CTA"|null,"confianza":"alta"|"media"|"baja","alternativas":[int],"nota":string|null}],"gastos":[{"n":int,"concepto":string,"tipo":string,"importe":int|null,"medio":"EF"|"TR"|null,"confianza":"alta"|"media"|"baja","alternativas":[int],"nota":string|null}],"cierre":{"conteo":{"20000":int|null,"10000":int|null,"2000":int|null,"1000":int|null,"500":int|null,"200":int|null,"100":int|null,"monedas_otros":int|null},"efectivo_contado":int|null,"retiro":int|null,"queda_para_manana":int|null},"observaciones":string|null,"alertas":[string]}'
  ].join('\n');
}
function cdPromptCompleto(){
  return [
    'Sos el transcriptor de planillas de caja de SABOR DE CASA, un local gastronómico de Argentina. Recibís un texto dictado que describe la planilla diaria y devolvés SOLO un objeto JSON válido: sin texto antes ni después, sin bloques de código, sin comentarios.',
    '',
    'Reglas: no inventes nada — si un dato no aparece en el texto, poné null. Importes: número entero en pesos. Medio de cobro/pago: "EF","TR" y en compras también "CTA"; si no está claro, null. Fecha en AAAA-MM-DD. Turno: "manana","tarde" o null. Gastos: clasificá "tipo" como "sueldo","servicio","retiro","pago_deuda_proveedor","insumo" u "otro". No sumes ni calcules nada. Cada fila lleva "confianza" ("alta" si el dato es claro, "media" si es ambiguo) y "nota" opcional. "alertas": lista de avisos cortos.',
    '',
    'Devolvé SOLO este JSON:',
    '{"fecha":"AAAA-MM-DD"|null,"turno":"manana"|"tarde"|null,"responsable":string|null,"planilla":{"numero":int|null,"de":int|null},"inicio_caja":int|null,"ventas":[{"n":int,"detalle":string,"importe":int|null,"medio":"EF"|"TR"|null,"confianza":"alta"|"media"|"baja","alternativas":[int],"nota":string|null}],"compras":[{"n":int,"proveedor":string,"detalle":string|null,"cantidad":string|null,"importe":int|null,"pago":"EF"|"TR"|"CTA"|null,"confianza":"alta"|"media"|"baja","alternativas":[int],"nota":string|null}],"gastos":[{"n":int,"concepto":string,"tipo":string,"importe":int|null,"medio":"EF"|"TR"|null,"confianza":"alta"|"media"|"baja","alternativas":[int],"nota":string|null}],"cierre":{"conteo":{"20000":int|null,"10000":int|null,"2000":int|null,"1000":int|null,"500":int|null,"200":int|null,"100":int|null,"monedas_otros":int|null},"efectivo_contado":int|null,"retiro":int|null,"queda_para_manana":int|null},"observaciones":string|null,"alertas":[string]}'
  ].join('\n');
}
function cdPromptCorreccion(jsonActual, instruccion){
  return [
    'Recibís (1) el JSON actual de un cierre de caja de SABOR DE CASA y (2) una instrucción de corrección del dueño, en lenguaje natural.',
    '',
    'Devolvé SOLO el JSON completo actualizado, con la misma estructura, sin texto extra ni bloques de código.',
    '',
    'Reglas:',
    '- La palabra del dueño manda sobre la lectura original. Aplicá exactamente lo que pide.',
    '- Cambiá únicamente lo que la instrucción menciona. No toques ninguna otra fila.',
    '- En cada fila corregida poné "confianza":"confirmada" y vaciá "alternativas".',
    '- Agregar o borrar renglones está permitido solo si lo pide explícitamente.',
    '- Si la instrucción es ambigua (por ejemplo dice "el de 7000" y hay dos renglones de 7000, o no dice a qué sección se refiere), no adivines: devolvé {"pregunta":"..."} con una única pregunta corta, en vez del JSON.',
    '- No recalcules totales ni el arqueo: lo hace la aplicación.',
    '- Quitá de "alertas" las que la corrección ya resolvió; conservá las demás.',
    '',
    'JSON ACTUAL:',
    JSON.stringify(jsonActual),
    '',
    'INSTRUCCIÓN DEL DUEÑO:',
    instruccion
  ].join('\n');
}

function cdErrorMensaje(e){
  if(!e) return 'Error desconocido.';
  switch(e.code){
    case 'invalid_json': return 'La hoja tiene demasiadas filas para leerla de una sola vez — sacale dos fotos (mitad de arriba, mitad de abajo) y subilas una por una con el botón Transcribir.';
    case 'not_granted': return 'No autorizaste el uso de Claude en esta vista todavía — probá de nuevo.';
    case 'images_unavailable': return 'Esta vista no permite subir fotos acá — pegá el texto dictado más abajo en su lugar.';
    case 'image_rejected': return 'La foto no se pudo procesar (tipo o tamaño no admitido). Probá con otra.';
    case 'rate_limited': return 'Demasiados pedidos por ahora — esperá un momento y probá de nuevo.';
    case 'empty_completion': return 'Claude no devolvió nada — probá con una foto más clara.';
    case 'refused': return 'Claude no pudo procesar esta imagen.';
    case 'not_declared': return e.message || 'Configurá tu clave de la API de Anthropic (botón ⚙ Configuración) para usar la transcripción con IA.';
    case 'invalid_request': return e.message || 'Falta algo para poder transcribir.';
    default: return 'No se pudo procesar: '+(e.message||e.code||'error desconocido');
  }
}
function cdLlamarClaude(promptText, blobs){
  if(!sampleApi){ return Promise.reject({code:'not_declared', message:'Sample no disponible'}); }
  var opts = {modelTier:'default', cache:false};
  if(blobs && blobs.length) opts.images = blobs;
  return sampleApi.json(promptText, opts);
}

function cdAplicarFrente(r){
  var c = state.cierreActual;
  c.fecha = r.fecha || c.fecha;
  c.turno = r.turno || c.turno;
  c.responsable = r.responsable || c.responsable;
  c.planilla = r.planilla || c.planilla;
  c.inicio_caja = (r.inicio_caja!=null) ? r.inicio_caja : c.inicio_caja;
  var maxN = c.ventas.reduce(function(m,v){ return Math.max(m,v.n||0); },0);
  (r.ventas||[]).forEach(function(v,i){ c.ventas.push(Object.assign({}, v, {n:maxN+i+1})); });
  c.alertas = (c.alertas||[]).concat(r.alertas||[]);
}
function cdAplicarDorso(r){
  var c = state.cierreActual;
  var maxNc = c.compras.reduce(function(m,v){ return Math.max(m,v.n||0); },0);
  (r.compras||[]).forEach(function(v,i){ c.compras.push(Object.assign({}, v, {n:maxNc+i+1})); });
  var maxNg = c.gastos.reduce(function(m,v){ return Math.max(m,v.n||0); },0);
  (r.gastos||[]).forEach(function(v,i){ c.gastos.push(Object.assign({}, v, {n:maxNg+i+1})); });
  if(r.cierre) c.cierre = r.cierre;
  if(r.observaciones) c.observaciones = r.observaciones;
  c.alertas = (c.alertas||[]).concat(r.alertas||[]);
}

async function cdTranscribir(){
  var btn = document.getElementById('cd_transcribir');
  var statusEl = document.getElementById('cd_status');
  btn.disabled = true;
  statusEl.innerHTML = '<p class="pres-note">Pensando… (puede tardar hasta un minuto)</p>';
  try{
    var textoManual = document.getElementById('cd_texto_dictado').value.trim();
    if(textoManual){
      var full = await cdLlamarClaude('TEXTO DICTADO A TRANSCRIBIR:\n\n'+textoManual+'\n\n'+cdPromptCompleto(), null);
      state.cierreActual = Object.assign({}, state.cierreActual, full, {
        ventas: full.ventas||[], compras: full.compras||[], gastos: full.gastos||[],
        cierre: full.cierre||{conteo:{}}, alertas: full.alertas||[]
      });
      document.getElementById('cd_texto_dictado').value = '';
    } else {
      if(!cdImagenes.frente.length && !cdImagenes.dorso.length){
        throw {code:'invalid_request', message:'Subí al menos una foto, o pegá el texto dictado.'};
      }
      if(cdImagenes.frente.length){
        var rF = await cdLlamarClaude(cdPromptFrente(), cdImagenes.frente);
        cdAplicarFrente(rF);
      }
      if(cdImagenes.dorso.length){
        var rD = await cdLlamarClaude(cdPromptDorso(), cdImagenes.dorso);
        cdAplicarDorso(rD);
      }
    }
    statusEl.innerHTML = '';
    renderCierreRevision();
    toast('Transcripción cargada — revisala abajo.');
  } catch(e){
    console.error(e);
    statusEl.innerHTML = '<div class="banner">'+escapeHtml(cdErrorMensaje(e))+'</div>';
  } finally {
    btn.disabled = false;
  }
}

async function cdRenderUploaders(){
  var el = document.getElementById('cd_uploaders');
  var limits = null;
  try{ limits = sampleApi ? await sampleApi.limits() : null; }catch(e){ limits = null; }
  if(!limits || !limits.images){
    el.innerHTML = '<p class="pres-note">Esta vista no permite subir fotos acá — usá el texto dictado de abajo.</p>';
    return;
  }
  var accept = limits.images.mediaTypes.join(',');
  el.innerHTML =
    '<div class="cd-uploader"><label>Hoja 1 — Frente (encabezado y ventas)</label><input type="file" id="cd_file_frente" accept="'+accept+'" multiple></div>'+
    '<div class="cd-uploader"><label>Hoja 2 — Dorso (compras, gastos y cierre)</label><input type="file" id="cd_file_dorso" accept="'+accept+'" multiple></div>';
  document.getElementById('cd_file_frente').addEventListener('change', function(ev){ cdImagenes.frente = Array.prototype.slice.call(ev.target.files); });
  document.getElementById('cd_file_dorso').addEventListener('change', function(ev){ cdImagenes.dorso = Array.prototype.slice.call(ev.target.files); });
}

function cdAbrir(){
  var fecha = document.getElementById('cd_fecha').value;
  var turno = document.getElementById('cd_turno').value;
  if(!fecha){ toast('Elegí una fecha.'); return; }
  var id = 'cierre:'+fecha+':'+turno;
  var existente = state.cierres.filter(function(c){ return c.id===id; })[0];
  if(existente){
    state.cierreActual = JSON.parse(JSON.stringify(existente));
    toast('Cierre existente cargado para corregir.');
  } else {
    state.cierreActual = {fecha:fecha, turno:turno, responsable:null, planilla:{numero:null,de:null}, inicio_caja:null,
      ventas:[], compras:[], gastos:[], cierre:{conteo:{}, efectivo_contado:null, retiro:null, queda_para_manana:null},
      observaciones:null, alertas:[]};
  }
  cdImagenes = {frente:[], dorso:[]};
  document.getElementById('cierreWorkArea').classList.remove('hidden');
  document.getElementById('cd_tituloCarga').textContent = existente ? 'Volver a cargar / corregir esta planilla' : 'Cargar planilla';
  document.getElementById('cd_status').innerHTML = '';
  cdRenderUploaders();
  renderCierreRevision();
}

function cdConfBadge(conf){
  var c = conf || 'alta';
  return '<span class="conf-dot '+escapeHtml(c)+'" title="Confianza: '+escapeHtml(c)+'"></span>';
}
function cdRowClass(conf){
  if(conf==='baja') return 'conf-baja';
  if(conf==='media') return 'conf-media';
  return '';
}
function cdTablaVentas(rows){
  if(!rows.length) return '<p class="empty">Sin ventas cargadas.</p>';
  var trs = rows.map(function(v, idx){
    var alt = (v.alternativas&&v.alternativas.length) ? '<span class="cd-nota">¿'+v.alternativas.join(' / ')+'?</span>' : '';
    var nota = v.nota ? '<span class="cd-nota">'+escapeHtml(v.nota)+'</span>' : '';
    return '<tr class="'+cdRowClass(v.confianza)+'" data-arr="ventas" data-idx="'+idx+'">'+
      '<td>'+cdConfBadge(v.confianza)+(v.n||idx+1)+'</td>'+
      '<td><input type="text" class="cd-f-detalle" value="'+escapeHtml(v.detalle||'')+'">'+nota+'</td>'+
      '<td><input type="number" class="cd-f-importe" value="'+(v.importe!=null?v.importe:'')+'">'+alt+'</td>'+
      '<td><select class="cd-f-medio"><option value=""'+(!v.medio?' selected':'')+'>—</option><option value="EF"'+(v.medio==='EF'?' selected':'')+'>EF</option><option value="TR"'+(v.medio==='TR'?' selected':'')+'>TR</option></select></td>'+
      '<td><button type="button" class="entry-del cd-del">✕</button></td>'+
    '</tr>';
  }).join('');
  return '<div style="overflow-x:auto;"><table class="cd-table"><thead><tr><th>#</th><th>Detalle</th><th>Importe</th><th>Medio</th><th></th></tr></thead><tbody>'+trs+'</tbody></table></div>';
}
function cdTablaCompras(rows){
  if(!rows.length) return '<p class="empty">Sin compras cargadas.</p>';
  var trs = rows.map(function(v, idx){
    var alt = (v.alternativas&&v.alternativas.length) ? '<span class="cd-nota">¿'+v.alternativas.join(' / ')+'?</span>' : '';
    return '<tr class="'+cdRowClass(v.confianza)+'" data-arr="compras" data-idx="'+idx+'">'+
      '<td>'+cdConfBadge(v.confianza)+(v.n||idx+1)+'</td>'+
      '<td><input type="text" class="cd-f-proveedor" value="'+escapeHtml(v.proveedor||'')+'"></td>'+
      '<td><input type="text" class="cd-f-detalle" value="'+escapeHtml(v.detalle||'')+'"></td>'+
      '<td><input type="number" class="cd-f-importe" value="'+(v.importe!=null?v.importe:'')+'">'+alt+'</td>'+
      '<td><select class="cd-f-pago"><option value=""'+(!v.pago?' selected':'')+'>—</option><option value="EF"'+(v.pago==='EF'?' selected':'')+'>EF</option><option value="TR"'+(v.pago==='TR'?' selected':'')+'>TR</option><option value="CTA"'+(v.pago==='CTA'?' selected':'')+'>CTA</option></select></td>'+
      '<td><button type="button" class="entry-del cd-del">✕</button></td>'+
    '</tr>';
  }).join('');
  return '<div style="overflow-x:auto;"><table class="cd-table"><thead><tr><th>#</th><th>Proveedor</th><th>Detalle</th><th>Importe</th><th>Pago</th><th></th></tr></thead><tbody>'+trs+'</tbody></table></div>';
}
function cdTablaGastos(rows){
  if(!rows.length) return '<p class="empty">Sin gastos cargados.</p>';
  var tipos = ['sueldo','servicio','retiro','pago_deuda_proveedor','insumo','otro'];
  var trs = rows.map(function(v, idx){
    var alt = (v.alternativas&&v.alternativas.length) ? '<span class="cd-nota">¿'+v.alternativas.join(' / ')+'?</span>' : '';
    var opts = tipos.map(function(t){ return '<option value="'+t+'"'+(v.tipo===t?' selected':'')+'>'+(CD_TIPO_LABEL[t]||t)+'</option>'; }).join('');
    return '<tr class="'+cdRowClass(v.confianza)+'" data-arr="gastos" data-idx="'+idx+'">'+
      '<td>'+cdConfBadge(v.confianza)+(v.n||idx+1)+'</td>'+
      '<td><input type="text" class="cd-f-concepto" value="'+escapeHtml(v.concepto||'')+'"></td>'+
      '<td><select class="cd-f-tipo">'+opts+'</select></td>'+
      '<td><input type="number" class="cd-f-importe" value="'+(v.importe!=null?v.importe:'')+'">'+alt+'</td>'+
      '<td><select class="cd-f-medio"><option value=""'+(!v.medio?' selected':'')+'>—</option><option value="EF"'+(v.medio==='EF'?' selected':'')+'>EF</option><option value="TR"'+(v.medio==='TR'?' selected':'')+'>TR</option></select></td>'+
      '<td><button type="button" class="entry-del cd-del">✕</button></td>'+
    '</tr>';
  }).join('');
  return '<div style="overflow-x:auto;"><table class="cd-table"><thead><tr><th>#</th><th>Concepto</th><th>Tipo</th><th>Importe</th><th>Medio</th><th></th></tr></thead><tbody>'+trs+'</tbody></table></div>';
}
function cdTablaCierre(cierre){
  cierre = cierre || {};
  var conteo = cierre.conteo || {};
  var denoms = ['20000','10000','2000','1000','500','200','100'];
  var celdas = denoms.map(function(d){
    return '<div class="field"><label>$'+d+'</label><input type="number" class="cd-conteo" data-denom="'+d+'" value="'+(conteo[d]!=null?conteo[d]:'')+'"></div>';
  }).join('');
  return '<div class="addgrid gauto">'+celdas+
    '<div class="field"><label>Monedas / otros</label><input type="number" id="cde_monedas" value="'+(conteo.monedas_otros!=null?conteo.monedas_otros:'')+'"></div>'+
    '<div class="field"><label>Efectivo contado</label><input type="number" id="cde_contado" value="'+(cierre.efectivo_contado!=null?cierre.efectivo_contado:'')+'"></div>'+
    '<div class="field"><label>Retiro al cierre</label><input type="number" id="cde_retiro_cierre" value="'+(cierre.retiro!=null?cierre.retiro:'')+'"></div>'+
    '<div class="field"><label>Queda para mañana</label><input type="number" id="cde_queda" value="'+(cierre.queda_para_manana!=null?cierre.queda_para_manana:'')+'"></div>'+
  '</div>';
}

function renderCierreRevision(){
  var root = document.getElementById('cd_revision');
  var c = state.cierreActual;
  if(!root) return;
  if(!c){ root.innerHTML=''; return; }
  var html = '';
  if(c.alertas && c.alertas.length){
    html += '<div class="cd-alert-list"><b>Avisos:</b><ul>'+c.alertas.map(function(a){ return '<li>'+escapeHtml(a)+'</li>'; }).join('')+'</ul></div>';
  }
  html += '<div class="cd-section-title">Encabezado</div>';
  html += '<div class="addgrid gauto">'+
    '<div class="field"><label>Fecha</label><input type="date" id="cde_fecha" value="'+(c.fecha||'')+'"></div>'+
    '<div class="field"><label>Turno</label><select id="cde_turno"><option value="manana"'+(c.turno==='manana'?' selected':'')+'>Mañana</option><option value="tarde"'+(c.turno==='tarde'?' selected':'')+'>Tarde</option></select></div>'+
    '<div class="field"><label>Responsable</label><input type="text" id="cde_responsable" value="'+escapeHtml(c.responsable||'')+'"></div>'+
    '<div class="field"><label>Inicio de caja</label><input type="number" id="cde_inicio" value="'+(c.inicio_caja!=null?c.inicio_caja:'')+'"></div>'+
  '</div>';
  html += '<div class="cd-section-title">Ventas ('+c.ventas.length+')</div>'+cdTablaVentas(c.ventas);
  html += '<div class="cd-section-title">Compras a proveedores ('+c.compras.length+')</div>'+cdTablaCompras(c.compras);
  html += '<div class="cd-section-title">Otros gastos y retiros ('+c.gastos.length+')</div>'+cdTablaGastos(c.gastos);
  html += '<div class="cd-section-title">Cierre de caja</div>'+cdTablaCierre(c.cierre);
  root.innerHTML = html;
  cdWireEncabezado();
  renderCierreArqueo();
}

function cdWireEncabezado(){
  var c = state.cierreActual;
  [['cde_fecha','fecha'],['cde_turno','turno'],['cde_responsable','responsable'],['cde_inicio','inicio_caja']].forEach(function(pair){
    var el = document.getElementById(pair[0]);
    if(!el) return;
    el.addEventListener('change', function(){
      if(pair[1]==='inicio_caja') c.inicio_caja = el.value===''?null:parseFloat(el.value);
      else if(pair[1]==='responsable') c.responsable = el.value.trim()||null;
      else c[pair[1]] = el.value||null;
      renderCierreArqueo();
    });
  });
  [['cde_monedas','monedas_otros'],['cde_contado','efectivo_contado'],['cde_retiro_cierre','retiro'],['cde_queda','queda_para_manana']].forEach(function(pair){
    var el = document.getElementById(pair[0]);
    if(!el) return;
    el.addEventListener('change', function(){
      c.cierre = c.cierre || {};
      var v = el.value===''?null:parseFloat(el.value);
      if(pair[1]==='monedas_otros'){ c.cierre.conteo = c.cierre.conteo||{}; c.cierre.conteo.monedas_otros = v; }
      else c.cierre[pair[1]] = v;
      renderCierreArqueo();
    });
  });
  document.querySelectorAll('.cd-conteo').forEach(function(inp){
    inp.addEventListener('change', function(){
      c.cierre = c.cierre || {}; c.cierre.conteo = c.cierre.conteo || {};
      c.cierre.conteo[inp.getAttribute('data-denom')] = inp.value===''?null:parseFloat(inp.value);
      renderCierreArqueo();
    });
  });
}
function cdOnTablaChange(ev){
  var t = ev.target;
  var row = t.closest('tr[data-arr]');
  if(!row) return;
  var arrName = row.getAttribute('data-arr');
  var idx = parseInt(row.getAttribute('data-idx'),10);
  var c = state.cierreActual;
  if(!c || !c[arrName] || !c[arrName][idx]) return;
  var item = c[arrName][idx];
  if(t.classList.contains('cd-f-detalle')) item.detalle = t.value;
  else if(t.classList.contains('cd-f-proveedor')) item.proveedor = t.value;
  else if(t.classList.contains('cd-f-concepto')) item.concepto = t.value;
  else if(t.classList.contains('cd-f-importe')) item.importe = t.value===''?null:parseFloat(t.value);
  else if(t.classList.contains('cd-f-medio')) item.medio = t.value||null;
  else if(t.classList.contains('cd-f-pago')) item.pago = t.value||null;
  else if(t.classList.contains('cd-f-tipo')) item.tipo = t.value;
  else return;
  item.confianza = 'confirmada';
  row.classList.remove('conf-baja','conf-media');
  var dot = row.querySelector('.conf-dot');
  if(dot){ dot.className = 'conf-dot confirmada'; dot.title = 'Confianza: confirmada'; }
  renderCierreArqueo();
}
function cdOnTablaClick(ev){
  var del = ev.target.closest('.cd-del');
  if(del){
    var row = del.closest('tr[data-arr]');
    var arrName = row.getAttribute('data-arr');
    var idx = parseInt(row.getAttribute('data-idx'),10);
    state.cierreActual[arrName].splice(idx,1);
    renderCierreRevision();
  }
}

function calcularArqueoCierre(c){
  function sum(arr, pred){ return (arr||[]).filter(pred).reduce(function(s,x){ return s+(Number(x.importe)||0); },0); }
  var ventas_ef = sum(c.ventas, function(v){ return v.medio==='EF'; });
  var ventas_tr = sum(c.ventas, function(v){ return v.medio==='TR'; });
  var compras_ef = sum(c.compras, function(v){ return v.pago==='EF'; });
  var compras_tr = sum(c.compras, function(v){ return v.pago==='TR'; });
  var compras_cta = sum(c.compras, function(v){ return v.pago==='CTA'; });
  var gastos_ef = sum(c.gastos, function(v){ return v.medio==='EF'; });
  var gastos_tr = sum(c.gastos, function(v){ return v.medio==='TR'; });
  var inicio = Number(c.inicio_caja)||0;
  var efectivo_esperado = inicio + ventas_ef - compras_ef - gastos_ef;
  var efectivo_contado = (c.cierre && c.cierre.efectivo_contado!=null) ? Number(c.cierre.efectivo_contado) : null;
  var diferencia = efectivo_contado!=null ? (efectivo_contado-efectivo_esperado) : null;
  var estado = diferencia==null ? null : (diferencia>0?'sobrante':(diferencia<0?'faltante':'exacto'));
  return {ventas_ef:ventas_ef, ventas_tr:ventas_tr, compras_ef:compras_ef, compras_tr:compras_tr, compras_cta:compras_cta,
    gastos_ef:gastos_ef, gastos_tr:gastos_tr, efectivo_esperado:efectivo_esperado, efectivo_contado:efectivo_contado,
    diferencia:diferencia, estado:estado};
}

function renderCierreArqueo(){
  var el = document.getElementById('cd_arqueoBox');
  var c = state.cierreActual;
  if(!el) return;
  if(!c){ el.innerHTML=''; return; }
  var a = calcularArqueoCierre(c);
  var denoms = ['20000','10000','2000','1000','500','200','100'];
  var conteo = (c.cierre&&c.cierre.conteo)||{};
  var conteoSuma = 0;
  denoms.forEach(function(d){ conteoSuma += (Number(conteo[d])||0)*Number(d); });
  conteoSuma += Number(conteo.monedas_otros)||0;

  var avisos = [];
  var conteoCargado = denoms.some(function(d){ return conteo[d]!=null; }) || conteo.monedas_otros!=null;
  if(conteoCargado && c.cierre.efectivo_contado!=null && Math.abs(conteoSuma-Number(c.cierre.efectivo_contado))>1){
    avisos.push('La suma del conteo de billetes ('+money(conteoSuma)+') no coincide con el efectivo contado.');
  }
  if(c.cierre && c.cierre.efectivo_contado!=null && c.cierre.retiro!=null && c.cierre.queda_para_manana!=null){
    if(Math.abs((c.cierre.efectivo_contado-c.cierre.retiro)-c.cierre.queda_para_manana)>1){
      avisos.push('Efectivo contado menos retiro no coincide con "queda para mañana".');
    }
  }
  if((c.ventas||[]).some(function(v){return !v.medio;}) || (c.compras||[]).some(function(v){return !v.pago;})){
    avisos.push('Hay ventas o compras sin medio de pago marcado — el arqueo todavía no es exacto.');
  }

  var html = '<table class="balance-summary-table"><tbody>'+
    '<tr><td>Ventas efectivo</td><td>'+money(a.ventas_ef)+'</td><td>Ventas transferencia</td><td>'+money(a.ventas_tr)+'</td></tr>'+
    '<tr><td>Compras efectivo</td><td>'+money(a.compras_ef)+'</td><td>Compras transferencia</td><td>'+money(a.compras_tr)+'</td></tr>'+
    '<tr><td>Compras a cuenta (deuda)</td><td>'+money(a.compras_cta)+'</td><td>Gastos efectivo</td><td>'+money(a.gastos_ef)+'</td></tr>'+
    '<tr><td>Gastos transferencia</td><td>'+money(a.gastos_tr)+'</td><td>Inicio de caja</td><td>'+money(c.inicio_caja||0)+'</td></tr>'+
  '</tbody></table>';

  var semaforo = 'verde', estadoTexto = 'Todavía no cargaste el efectivo contado.';
  if(a.diferencia!=null){
    var fuera = Math.abs(a.diferencia) > CD_TOLERANCIA;
    semaforo = fuera ? 'rojo' : 'verde';
    estadoTexto = a.estado==='exacto' ? 'Caja exacta.' : (a.estado==='sobrante' ? 'Sobrante de '+money(a.diferencia) : 'Faltante de '+money(-a.diferencia));
  }
  html += '<div class="cd-arqueo '+semaforo+'"><h3>Arqueo</h3>'+
    '<p><b>Efectivo esperado:</b> '+money(a.efectivo_esperado)+' &nbsp; <b>Efectivo contado:</b> '+(a.efectivo_contado!=null?money(a.efectivo_contado):'—')+'</p>'+
    '<p style="font-size:16px; font-weight:700;">'+estadoTexto+'</p>'+
    (avisos.length ? '<ul style="margin:6px 0 0; padding-left:18px; font-size:12.5px;">'+avisos.map(function(x){return '<li>⚠ '+escapeHtml(x)+'</li>';}).join('')+'</ul>' : '')+
  '</div>';

  html += '<div class="cd-correccion-row"><input type="text" id="cd_correccion" placeholder="Ej: el renglón 6 de ventas es 2000, no 7000"><button type="button" class="btn-primary" id="cd_aplicar_correccion">Aplicar</button></div>'+
    '<div id="cd_correccion_status"></div>'+
    '<div class="addbtn-row"><button type="button" class="btn-ghost" id="cd_cancelar">Cancelar</button><button type="button" class="btn-primary" id="cd_confirmar">Confirmar y guardar</button></div>';

  el.innerHTML = html;
  document.getElementById('cd_aplicar_correccion').addEventListener('click', cdAplicarCorreccion);
  document.getElementById('cd_confirmar').addEventListener('click', cdConfirmar);
  document.getElementById('cd_cancelar').addEventListener('click', function(){
    state.cierreActual = null;
    document.getElementById('cierreWorkArea').classList.add('hidden');
  });
  var inp = document.getElementById('cd_correccion');
  inp.addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); cdAplicarCorreccion(); } });
}

async function cdAplicarCorreccion(){
  var input = document.getElementById('cd_correccion');
  var instruccion = input.value.trim();
  if(!instruccion) return;
  var statusEl = document.getElementById('cd_correccion_status');
  statusEl.innerHTML = '<p class="pres-note">Pensando…</p>';
  try{
    var result = await cdLlamarClaude(cdPromptCorreccion(state.cierreActual, instruccion), null);
    if(result && result.pregunta){
      statusEl.innerHTML = '<div class="cd-pregunta">'+escapeHtml(result.pregunta)+'</div>';
      return;
    }
    state.cierreActual = result;
    input.value = '';
    statusEl.innerHTML = '';
    renderCierreRevision();
    toast('Corrección aplicada.');
  } catch(e){
    console.error(e);
    statusEl.innerHTML = '<div class="banner">'+escapeHtml(cdErrorMensaje(e))+'</div>';
  }
}

async function cdUpsertDeuda(proveedor, monto, accion){
  var existing = state.deudas.filter(function(d){ return d.negocio==='Roti' && d.tipo==='Debemos' && d.concepto===proveedor; })[0];
  if(accion==='sumar'){
    if(existing) await updateInCollection('deudas', existing.id, {montoTotal:(Number(existing.montoTotal)||0)+monto});
    else await addToCollection('deudas', {concepto:proveedor, negocio:'Roti', tipo:'Debemos', montoTotal:monto, montoPagado:0, fecha:new Date().toISOString().slice(0,10)});
  } else if(accion==='pagar' && existing){
    await updateInCollection('deudas', existing.id, {montoPagado:(Number(existing.montoPagado)||0)+monto});
  }
}
async function cdAplicarDeudas(c){
  var ctaPorProv = {};
  (c.compras||[]).forEach(function(cp){ if(cp.pago==='CTA' && cp.importe && cp.proveedor) ctaPorProv[cp.proveedor] = (ctaPorProv[cp.proveedor]||0)+Number(cp.importe); });
  for(var prov in ctaPorProv){ await cdUpsertDeuda(prov, ctaPorProv[prov], 'sumar'); }
  var pagoPorProv = {};
  (c.gastos||[]).forEach(function(g){ if(g.tipo==='pago_deuda_proveedor' && g.importe && g.concepto) pagoPorProv[g.concepto] = (pagoPorProv[g.concepto]||0)+Number(g.importe); });
  for(var prov2 in pagoPorProv){ await cdUpsertDeuda(prov2, pagoPorProv[prov2], 'pagar'); }
}
async function cdGenerarMovimientos(cierreId, c, a){
  var mes = c.fecha.slice(0,7);
  var base = {fecha:c.fecha, mes:mes, negocio:'Roti', origenCierre:cierreId};
  var nuevos = [];
  if(a.ventas_ef>0) nuevos.push(Object.assign({}, base, {concepto:'Ventas (efectivo)', notas:'Cierre de caja — turno '+c.turno, monto:a.ventas_ef, tipo:'Ingreso', categoria:'Ventas'}));
  if(a.ventas_tr>0) nuevos.push(Object.assign({}, base, {concepto:'Ventas (transferencia)', notas:'Cierre de caja — turno '+c.turno, monto:a.ventas_tr, tipo:'Ingreso', categoria:'Ventas'}));
  if(a.compras_ef>0) nuevos.push(Object.assign({}, base, {concepto:'Compras (efectivo)', notas:'Cierre de caja — turno '+c.turno, monto:a.compras_ef, tipo:'Egreso', categoria:'Insumos alimenticios'}));
  if(a.compras_tr>0) nuevos.push(Object.assign({}, base, {concepto:'Compras (transferencia)', notas:'Cierre de caja — turno '+c.turno, monto:a.compras_tr, tipo:'Egreso', categoria:'Insumos alimenticios'}));
  var gastosPorTipoMedio = {};
  (c.gastos||[]).forEach(function(g){
    if(!g.importe || g.tipo==='retiro' || g.tipo==='pago_deuda_proveedor') return;
    var key = (g.tipo||'otro')+'|'+(g.medio||'EF');
    gastosPorTipoMedio[key] = (gastosPorTipoMedio[key]||0)+Number(g.importe);
  });
  Object.keys(gastosPorTipoMedio).forEach(function(key){
    var tipo = key.split('|')[0];
    nuevos.push(Object.assign({}, base, {concepto:'Gastos: '+(CD_TIPO_LABEL[tipo]||tipo), notas:'Cierre de caja — turno '+c.turno, monto:gastosPorTipoMedio[key], tipo:'Egreso', categoria:CD_GASTO_CAT[tipo]||'Varios'}));
  });
  var retiroTotal = 0;
  (c.gastos||[]).forEach(function(g){ if(g.tipo==='retiro' && g.importe) retiroTotal += Number(g.importe); });
  if(retiroTotal>0) nuevos.push({fecha:c.fecha, mes:mes, negocio:'Personal', origenCierre:cierreId, concepto:'Retiro caja Roti', notas:'Cierre de caja — turno '+c.turno, monto:retiroTotal, tipo:'Egreso', categoria:'Varios'});
  for(var i=0;i<nuevos.length;i++){ await addToCollection('movimientos', nuevos[i]); }
}

async function cdConfirmar(){
  var c = state.cierreActual;
  if(!c.fecha || !c.turno){ toast('Falta la fecha o el turno.'); return; }
  var a = calcularArqueoCierre(c);
  if(a.diferencia!=null && Math.abs(a.diferencia)>CD_TOLERANCIA){
    if(!confirm('Hay una diferencia de '+money(a.diferencia)+' fuera de tolerancia (±'+money(CD_TOLERANCIA)+'). ¿Confirmar igual?')) return;
  }
  if(!dbApi){ toast('Sin conexión a la base.'); return; }
  var id = 'cierre:'+c.fecha+':'+c.turno;
  var existente = state.cierres.filter(function(x){ return x.id===id; })[0];
  var revision = existente ? (existente.revision||1)+1 : 1;
  var doc = Object.assign({}, c, {
    arqueo: Object.assign({}, a, {reconocido: !!(a.diferencia!=null && Math.abs(a.diferencia)>CD_TOLERANCIA)}),
    confirmado_en: new Date().toISOString(),
    revision: revision
  });
  var btn = document.getElementById('cd_confirmar');
  btn.disabled = true;
  try{
    await dbApi.collection('cierres').doc(id).set(doc);
    var viejos = state.docs.filter(function(m){ return m.origenCierre===id; });
    for(var i=0;i<viejos.length;i++){ await deleteFromCollection('movimientos', viejos[i].id); }
    await cdGenerarMovimientos(id, c, a);
    if(revision===1){
      await cdAplicarDeudas(c);
      toast('Cierre guardado y movimientos generados.');
    } else {
      toast('Cierre actualizado. Si cambiaste compras a cuenta o pagos a proveedores, revisá Deudas a mano.');
    }
    state.cierreActual = null;
    document.getElementById('cierreWorkArea').classList.add('hidden');
  } catch(e){
    console.error(e);
    toast('No se pudo guardar el cierre.');
  } finally {
    btn.disabled = false;
  }
}

function renderCierreInforme(){
  var el = document.getElementById('cd_informe');
  if(!el) return;
  var mes = (state.mesFilter && state.mesFilter!=='Todos') ? state.mesFilter : null;
  if(!mes){ el.innerHTML = '<p class="pres-note">Elegí un mes puntual arriba (no "Todos los meses") para ver el informe.</p>'; return; }
  var cierresMes = state.cierres.filter(function(c){ return c.fecha && c.fecha.slice(0,7)===mes; });
  if(cierresMes.length===0){ el.innerHTML = '<p class="empty">Todavía no hay cierres confirmados en '+escapeHtml(monthLabel(mes))+'.</p>'; return; }

  var totalVentasEf=0, totalVentasTr=0, ticketCount=0;
  var porDia = {}, comprasPorProveedor = {}, gastosPorTipo = {}, retirosTotal = 0, diferenciaAcumulada = 0, diasFueraTolerancia = 0, diasConCierre = {};

  cierresMes.forEach(function(c){
    var a = c.arqueo || calcularArqueoCierre(c);
    totalVentasEf += a.ventas_ef||0; totalVentasTr += a.ventas_tr||0;
    ticketCount += (c.ventas||[]).length;
    var totalDia = (a.ventas_ef||0)+(a.ventas_tr||0);
    porDia[c.fecha] = (porDia[c.fecha]||0) + totalDia;
    diasConCierre[c.fecha] = true;
    (c.compras||[]).forEach(function(cp){
      if(!cp.proveedor) return;
      comprasPorProveedor[cp.proveedor] = comprasPorProveedor[cp.proveedor] || {ef:0,tr:0,cta:0};
      if(cp.pago==='EF') comprasPorProveedor[cp.proveedor].ef += Number(cp.importe)||0;
      else if(cp.pago==='TR') comprasPorProveedor[cp.proveedor].tr += Number(cp.importe)||0;
      else if(cp.pago==='CTA') comprasPorProveedor[cp.proveedor].cta += Number(cp.importe)||0;
    });
    (c.gastos||[]).forEach(function(g){
      if(!g.importe) return;
      if(g.tipo==='retiro'){ retirosTotal += Number(g.importe); return; }
      if(g.tipo==='pago_deuda_proveedor') return;
      gastosPorTipo[g.tipo||'otro'] = (gastosPorTipo[g.tipo||'otro']||0)+Number(g.importe);
    });
    if(a.diferencia!=null){
      diferenciaAcumulada += a.diferencia;
      if(Math.abs(a.diferencia)>CD_TOLERANCIA) diasFueraTolerancia++;
    }
  });

  var totalVentas = totalVentasEf+totalVentasTr;
  var comprasTotal = 0; Object.keys(comprasPorProveedor).forEach(function(p){ var x=comprasPorProveedor[p]; comprasTotal += x.ef+x.tr+x.cta; });
  var gastosTotal = 0; Object.keys(gastosPorTipo).forEach(function(t){ gastosTotal += gastosPorTipo[t]; });
  var resultadoCaja = totalVentas-comprasTotal-gastosTotal;
  var dias = Object.keys(porDia);
  var promedioDiario = dias.length ? totalVentas/dias.length : 0;
  var mejorDia=null, peorDia=null;
  dias.forEach(function(d){ if(!mejorDia||porDia[d]>porDia[mejorDia]) mejorDia=d; if(!peorDia||porDia[d]<porDia[peorDia]) peorDia=d; });

  var partsMes = mes.split('-'); var anio=Number(partsMes[0]), mesNum=Number(partsMes[1]);
  var diasEnMes = new Date(anio, mesNum, 0).getDate();
  var hoy = new Date();
  var esMesActual = (anio===hoy.getFullYear() && mesNum===hoy.getMonth()+1);
  var diasSinCierre = [];
  for(var d=1; d<=(esMesActual?hoy.getDate():diasEnMes); d++){
    var fechaStr = mes+'-'+(d<10?'0'+d:d);
    if(!diasConCierre[fechaStr]) diasSinCierre.push(d);
  }

  var html = '<div class="stats" style="margin-bottom:16px;">'+
    '<div class="stat stat--pos"><span class="stat-label">Ventas del mes</span><span class="stat-value">'+money(totalVentas)+'</span></div>'+
    '<div class="stat stat--neutral"><span class="stat-label">Resultado (base caja)</span><span class="stat-value">'+money(resultadoCaja)+'</span></div>'+
    '<div class="stat '+(diferenciaAcumulada>=0?'stat--pos':'stat--neg')+'"><span class="stat-label">Arqueo acumulado</span><span class="stat-value">'+money(diferenciaAcumulada)+'</span></div>'+
  '</div>';
  html += '<table class="balance-summary-table"><tbody>'+
    '<tr><td>Ventas efectivo</td><td>'+money(totalVentasEf)+'</td><td>Ventas transferencia</td><td>'+money(totalVentasTr)+'</td></tr>'+
    '<tr><td>Promedio diario</td><td>'+money(promedioDiario)+'</td><td>Ticket promedio</td><td>'+(ticketCount?money(totalVentas/ticketCount):'—')+'</td></tr>'+
    '<tr><td>Mejor día</td><td>'+(mejorDia?fmtFecha(mejorDia)+' ('+money(porDia[mejorDia])+')':'—')+'</td><td>Peor día</td><td>'+(peorDia?fmtFecha(peorDia)+' ('+money(porDia[peorDia])+')':'—')+'</td></tr>'+
    '<tr><td>Retiros del dueño</td><td>'+money(retirosTotal)+'</td><td>Días fuera de tolerancia</td><td>'+diasFueraTolerancia+'</td></tr>'+
  '</tbody></table>';
  html += '<div class="cd-section-title">Compras por proveedor</div>';
  html += '<table class="balance-summary-table"><thead><tr><th>Proveedor</th><th>Efectivo</th><th>Transferencia</th><th>A cuenta</th><th>Deuda pendiente</th></tr></thead><tbody>'+
    Object.keys(comprasPorProveedor).map(function(p){
      var x = comprasPorProveedor[p];
      var deudaDoc = state.deudas.filter(function(dd){ return dd.negocio==='Roti' && dd.concepto===p && dd.tipo==='Debemos'; })[0];
      var pendiente = deudaDoc ? Math.max(0,(Number(deudaDoc.montoTotal)||0)-(Number(deudaDoc.montoPagado)||0)) : x.cta;
      return '<tr><td>'+escapeHtml(p)+'</td><td>'+money(x.ef)+'</td><td>'+money(x.tr)+'</td><td>'+money(x.cta)+'</td><td>'+money(pendiente)+'</td></tr>';
    }).join('')+
  '</tbody></table>';
  html += '<div class="cd-section-title">Gastos por tipo</div>';
  html += '<table class="balance-summary-table"><thead><tr><th>Tipo</th><th>Total</th></tr></thead><tbody>'+
    Object.keys(gastosPorTipo).map(function(t){ return '<tr><td>'+(CD_TIPO_LABEL[t]||t)+'</td><td>'+money(gastosPorTipo[t])+'</td></tr>'; }).join('')+
  '</tbody></table>';
  if(diasSinCierre.length) html += '<p class="pres-note">Días de '+escapeHtml(monthLabel(mes))+' sin cierre cargado: '+diasSinCierre.join(', ')+'.</p>';
  html += '<p class="pres-note">Resultado en base caja: ventas menos compras (incluidas las a cuenta) menos gastos operativos. No incluye retiros del dueño ni pagos de deuda, y no es la ganancia contable (no descuenta stock, impuestos ni costos no anotados en la planilla).</p>';
  el.innerHTML = html;
}

function renderCierreDiario(){
  renderCierreInforme();
}

