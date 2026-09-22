"use strict";
// ================= backend local (sin Claude) =================
// Esta app fue escrita originalmente para correr dentro de un Artifact de
// Claude, que le da tres "capacidades" listas para usar: `db` (persistencia),
// `downloads` (descarga de archivos) y `sample` (llamar a un modelo de IA).
// Acá implementamos esas mismas tres interfaces con tecnología de navegador
// estándar, para que la app funcione igual de bien en GitHub Pages o
// cualquier hosting estático. El resto del código (15-db.js, 19-export.js,
// 13-cierre-diario.js) no sabe la diferencia: sigue llamando a
// dbApi/downloadsApi/sampleApi como siempre.

var LOCAL_DB_KEY = 'figallo:db:v1';
var LOCAL_SETTINGS_KEY = 'figallo:settings:v1';

// ---------- almacenamiento (reemplaza a `db`) ----------
function loadLocalDbRaw(){
  try{
    var raw = localStorage.getItem(LOCAL_DB_KEY);
    if(!raw) return {collections:{}, docs:{}};
    var parsed = JSON.parse(raw);
    parsed.collections = parsed.collections || {};
    parsed.docs = parsed.docs || {};
    return parsed;
  }catch(e){
    console.error('No se pudo leer la base local, se reinicia vacía.', e);
    return {collections:{}, docs:{}};
  }
}
function saveLocalDbRaw(data){
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(data));
}
function makeSnapshot(items){
  return { docs: items.map(function(pair){
    var id = pair[0], data = pair[1];
    return { id: id, data: function(){ return data; } };
  }) };
}

function createLocalDbApi(){
  var listeners = {}; // nombre de colección -> [callback,...]

  function notify(name){
    var raw = loadLocalDbRaw();
    var col = raw.collections[name] || {};
    var items = Object.keys(col).map(function(id){ return [id, col[id]]; });
    var snap = makeSnapshot(items);
    (listeners[name]||[]).forEach(function(cb){
      try{ cb(snap); }catch(e){ console.error(e); }
    });
  }

  function collectionRef(name){
    return {
      add: function(data){
        return new Promise(function(resolve){
          var raw = loadLocalDbRaw();
          if(!raw.collections[name]) raw.collections[name] = {};
          var id = 'id_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
          raw.collections[name][id] = data;
          saveLocalDbRaw(raw);
          notify(name);
          resolve({id:id});
        });
      },
      doc: function(id){
        return {
          get: function(){
            return new Promise(function(resolve){
              var raw = loadLocalDbRaw();
              var data = (raw.collections[name]||{})[id];
              resolve({ exists: data!=null, data: function(){ return data; } });
            });
          },
          set: function(data){
            return new Promise(function(resolve){
              var raw = loadLocalDbRaw();
              if(!raw.collections[name]) raw.collections[name] = {};
              raw.collections[name][id] = data;
              saveLocalDbRaw(raw);
              notify(name);
              resolve();
            });
          },
          update: function(patch){
            return new Promise(function(resolve){
              var raw = loadLocalDbRaw();
              if(!raw.collections[name]) raw.collections[name] = {};
              var current = raw.collections[name][id] || {};
              raw.collections[name][id] = Object.assign({}, current, patch);
              saveLocalDbRaw(raw);
              notify(name);
              resolve();
            });
          },
          delete: function(){
            return new Promise(function(resolve){
              var raw = loadLocalDbRaw();
              if(raw.collections[name]) delete raw.collections[name][id];
              saveLocalDbRaw(raw);
              notify(name);
              resolve();
            });
          }
        };
      },
      limit: function(){ return this; }, // no hace falta limitar filas en local
      onSnapshot: function(cb){
        listeners[name] = listeners[name] || [];
        listeners[name].push(cb);
        Promise.resolve().then(function(){ notify(name); }); // primer disparo, como una base real
        return function unsubscribe(){
          listeners[name] = (listeners[name]||[]).filter(function(f){ return f!==cb; });
        };
      }
    };
  }

  return {
    collection: collectionRef,
    doc: function(path){
      return {
        get: function(){
          return new Promise(function(resolve){
            var raw = loadLocalDbRaw();
            var data = raw.docs[path];
            resolve({ exists: data!=null, data: function(){ return data; } });
          });
        },
        update: function(patch){
          return new Promise(function(resolve){
            var raw = loadLocalDbRaw();
            raw.docs[path] = Object.assign({}, raw.docs[path]||{}, patch);
            saveLocalDbRaw(raw);
            resolve();
          });
        },
        acquire: function(opts){
          // Lease simple, solo para no re-sembrar dos veces si hay dos pestañas abiertas.
          return new Promise(function(resolve){
            var raw = loadLocalDbRaw();
            var now = Date.now();
            var current = raw.docs[path] || {};
            var lease = current._lease;
            if(lease && lease.expiresAt > now){ resolve({acquired:false}); return; }
            raw.docs[path] = Object.assign({}, current, {_lease:{holder:opts.holder, expiresAt: now + (opts.ttlMs||30000)}});
            saveLocalDbRaw(raw);
            resolve({acquired:true});
          });
        }
      };
    }
  };
}

// ---------- descarga de archivos (reemplaza a `downloads`) ----------
function createLocalDownloadsApi(){
  return {
    save: function(opts){
      return new Promise(function(resolve, reject){
        try{
          var blob = (opts.data instanceof Blob) ? opts.data : new Blob([opts.data]);
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = opts.filename || 'descarga';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
          resolve();
        }catch(e){ reject(e); }
      });
    }
  };
}

// ---------- IA (reemplaza a `sample`) ----------
// Llama directo a la API de Anthropic con la clave que el usuario carga en
// Configuración (ver 17-settings.js). La clave se guarda SOLO en
// localStorage de este navegador — nunca se sube al repositorio ni se
// comparte con nadie más. Si vas a desplegar esta página en un sitio público
// para que la usen otras personas, cada una necesita cargar su propia clave.
function getAnthropicSettings(){
  try{
    var raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}
function saveAnthropicSettings(s){
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(s));
}
function fileToBase64(file){
  return new Promise(function(resolve, reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(String(reader.result).split(',')[1]); };
    reader.onerror = function(){ reject(reader.error); };
    reader.readAsDataURL(file);
  });
}

function createLocalSampleApi(){
  return {
    limits: function(){
      var s = getAnthropicSettings();
      if(!s.apiKey) return Promise.resolve(null);
      return Promise.resolve({ images: { mediaTypes: ['image/jpeg','image/png','image/webp'] } });
    },
    json: async function(promptText, opts){
      opts = opts || {};
      var s = getAnthropicSettings();
      if(!s.apiKey){
        throw {code:'not_declared', message:'Configurá tu clave de la API de Anthropic (botón ⚙ Configuración) para usar la transcripción con IA.'};
      }

      var content = [];
      if(opts.images && opts.images.length){
        for(var i=0;i<opts.images.length;i++){
          var f = opts.images[i];
          var b64;
          try{ b64 = await fileToBase64(f); }
          catch(e){ throw {code:'image_rejected', message:'No se pudo leer una de las imágenes.'}; }
          content.push({type:'image', source:{type:'base64', media_type: f.type||'image/jpeg', data:b64}});
        }
      }
      content.push({type:'text', text: promptText});

      var model = s.model || 'claude-sonnet-5';
      var resp;
      try{
        resp = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'x-api-key': s.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({ model: model, max_tokens: 4096, messages: [{role:'user', content: content}] })
        });
      }catch(networkErr){
        throw {code:'invalid_request', message:'No se pudo conectar con la API de Anthropic. Revisá tu conexión.'};
      }

      if(resp.status===429) throw {code:'rate_limited'};
      if(resp.status===401 || resp.status===403) throw {code:'invalid_request', message:'Clave de API inválida o sin permisos — revisala en Configuración.'};
      if(!resp.ok){
        var errBody = null;
        try{ errBody = await resp.json(); }catch(e){}
        throw {code:'invalid_request', message: (errBody && errBody.error && errBody.error.message) || ('Error HTTP '+resp.status)};
      }

      var data = await resp.json();
      var text = (data.content||[]).filter(function(b){ return b.type==='text'; }).map(function(b){ return b.text; }).join('\n').trim();
      if(!text) throw {code:'empty_completion'};
      var clean = text.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
      try{ return JSON.parse(clean); }
      catch(e){ throw {code:'invalid_json', message:'La respuesta no vino en JSON válido.'}; }
    }
  };
}
