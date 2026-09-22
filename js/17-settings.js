"use strict";
// ================= configuración (clave de IA) =================
function openSettingsModal(){
  var s = getAnthropicSettings();
  openModal(
    '<h3>Configuración</h3>'+
    '<p class="pres-note">Para usar "Transcribir con Claude" en el Cierre diario necesitás tu propia clave de la API de Anthropic. Se guarda solo en este navegador (localStorage), se usa únicamente para llamar a la API desde acá, y no viaja a ningún otro lado. <strong>No la compartas ni la subas al repositorio de GitHub.</strong> Si esta página la van a usar varias personas, cada una carga la suya.</p>'+
    '<div class="field"><label for="cfgApiKey">Clave de API de Anthropic</label><input type="password" id="cfgApiKey" placeholder="sk-ant-..." value="'+escapeHtml(s.apiKey||'')+'" autocomplete="off"></div>'+
    '<div class="field"><label for="cfgModel">Modelo</label><input type="text" id="cfgModel" placeholder="claude-sonnet-5" value="'+escapeHtml(s.model||'claude-sonnet-5')+'"></div>'+
    '<p class="pres-note">Conseguí una clave en <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. Sin clave configurada, la app funciona igual para todo lo demás — solo queda deshabilitada la transcripción con IA (podés seguir pegando el texto dictado a mano).</p>'+
    '<div class="modal-actions"><button class="btn-ghost" id="cfgClear">Borrar clave</button><button class="btn-ghost" id="cfgCancel">Cancelar</button><button class="btn-primary" id="cfgSave">Guardar</button></div>'
  );
  document.getElementById('cfgCancel').addEventListener('click', closeModal);
  document.getElementById('cfgClear').addEventListener('click', function(){
    saveAnthropicSettings({});
    toast('Clave borrada.');
    closeModal();
  });
  document.getElementById('cfgSave').addEventListener('click', function(){
    var key = document.getElementById('cfgApiKey').value.trim();
    var model = document.getElementById('cfgModel').value.trim() || 'claude-sonnet-5';
    saveAnthropicSettings({apiKey:key, model:model});
    toast('Configuración guardada.');
    closeModal();
  });
}
function initSettings(){
  var btn = document.getElementById('settingsBtn');
  if(btn) btn.addEventListener('click', openSettingsModal);
}
