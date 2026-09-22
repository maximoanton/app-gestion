# Gestión Integral Figallo

App de gestión financiera (movimientos, balance, bienes de uso, deudas,
presupuesto, ingresos/costos fijos y cierre diario) para varios negocios.
Es una SPA en HTML/CSS/JS puro (sin build ni frameworks), extraída y
modularizada a partir de un Artifact de Claude.

## Estructura

```
index.html            estructura de la página (sin lógica)
css/
  styles.css           todos los estilos (tema claro/oscuro con CSS vars)
js/
  00-data.js             constantes, estado global (`state`) y datos de ejemplo
  01-local-backend.js    ★ NUEVO: reemplazo local de db/downloads/sample (ver abajo)
  02-helpers.js          formateo de fechas/montos, utilidades varias
  03-amortizacion.js     cálculo de amortización de bienes de uso
  04-balance.js          cálculo de balance (activo/pasivo/patrimonio) por negocio
  05-selects.js          llenado de selects estáticos (negocio, categoría, etc.)
  06-view-movimientos.js   listado y filtros de movimientos (ingresos/egresos)
  07-view-bienes.js      listado de bienes de uso
  08-view-deudas.js      listado de deudas / cuentas pendientes
  09-view-balance.js     render del panel de balance
  10-view-presupuesto.js   presupuesto vs. real
  11-view-fijos.js       ingresos y costos fijos (plantillas recurrentes)
  12-dashboard.js        gráficos/resúmenes del dashboard
  13-cierre-diario.js    flujo de cierre de caja diario ("Sabor de Casa")
  14-render.js           función de render maestra que orquesta las vistas
  15-db.js               alta/baja/edición contra dbApi (sin cambios vs. el original)
  16-modal.js            modal genérico reutilizable
  17-settings.js         ★ NUEVO: modal para cargar tu clave de la API de Anthropic
  18-forms.js            wiring de todos los formularios de alta/edición
  19-export.js           exportación a Excel (SheetJS)
  20-boot.js             arranque de la app (`boot()`), ahora sin `window.claude`
```

Los archivos se cargan como `<script>` clásicos (no ES modules), en el orden
del `index.html`, y comparten estado a través de variables globales (tal cual
funcionaba el código original dentro de su única IIFE). Por eso el orden de
carga importa: no lo cambies sin revisar dependencias.

## Standalone: ya NO depende de las APIs de Claude

La versión original de este Artifact usaba `window.claude.use('db')`,
`window.claude.use('downloads')` y `window.claude.use('sample')`, que solo
existen dentro de claude.ai. Esta versión las reemplaza por completo
(`js/01-local-backend.js`) para que funcione en cualquier hosting estático
(GitHub Pages incluido), sin backend propio:

| Capacidad original | Reemplazo local | Dónde |
|---|---|---|
| `db` (persistencia) | `localStorage`, con la misma interfaz (`collection().add/doc().update/delete/get`, `onSnapshot`) | `01-local-backend.js` → `createLocalDbApi()` |
| `downloads` (descarga) | Blob + link `<a download>` | `01-local-backend.js` → `createLocalDownloadsApi()` |
| `sample` (IA para el cierre diario) | Llamada directa al API de Anthropic (`api.anthropic.com/v1/messages`) con tu propia clave | `01-local-backend.js` → `createLocalSampleApi()` |

Como el resto del código (`15-db.js`, `19-export.js`, `13-cierre-diario.js`)
solo conocía la interfaz de esas tres capacidades — no cómo estaban
implementadas — no hizo falta tocarlo: el reemplazo es un "drop-in".

### Persistencia (`db`)

Todos los datos (movimientos, bienes, deudas, presupuestos, fijos, negocios,
cierres) se guardan en `localStorage`, bajo la clave `figallo:db:v1`, como un
único JSON. Es persistente entre sesiones en el mismo navegador, pero **no
se sincroniza entre dispositivos ni pestañas distintas** (a diferencia de la
base de datos real de Claude). Para eso necesitarías un backend propio
(Firebase, Supabase, tu propia API, etc.).

### Exportar a Excel (`downloads`)

Ya no depende de nada: genera el archivo con SheetJS (como antes) y dispara
la descarga con un link temporal — funciona en cualquier navegador moderno.

### Transcripción con IA (`sample`)

Esta es la única función que sigue necesitando un servicio de IA por detrás
(subís una foto de la planilla escrita a mano y algo tiene que leerla). Para
que siga funcionando fuera de Claude, agregamos un botón **⚙ Configuración**
en la barra superior donde cargás tu propia clave de la
[API de Anthropic](https://console.anthropic.com/settings/keys). Con eso:

- La clave se guarda **solo en el `localStorage` de tu navegador** — nunca
  se sube al repositorio ni se comparte con nadie.
- La llamada a `api.anthropic.com` se hace directo desde el navegador (con
  el header `anthropic-dangerous-direct-browser-access`), que es la forma
  que ofrece Anthropic para probar la API sin backend. **Esto expone tu
  clave a quien tenga acceso a las devtools de esa página**, así que:
  - Si el sitio es solo para vos (uso personal, repo privado o público pero
    lo usás solo vos), no hay problema.
  - Si vas a publicar la página para que la use más gente, cada persona
    debería cargar su propia clave (la de configuración es por navegador,
    no global) — no pongas una clave "compartida" fija en el código.
- **Sin clave configurada, la app funciona igual para todo lo demás.** Solo
  se deshabilita la transcripción automática; podés seguir pegando el texto
  dictado a mano en el cierre diario (esa parte también pasa por
  `sampleApi.json(...)`, así que también necesita la clave — pero cargar los
  movimientos manualmente desde "Agregar movimiento" siempre funciona sin
  clave).

## Datos de ejemplo

`js/00-data.js` incluye un `SEED_MOVIMIENTOS` genérico y ficticio, muy
reducido, solo para que la interfaz tenga algo que mostrar en modo de solo
lectura. **No es** el dataset real que tenía el Artifact original (ese
contenía datos financieros y nombres de personas reales de otro negocio/
familia, y no correspondía subirlo tal cual a un repositorio). Reemplazalo
por tus propios datos cuando conectes una persistencia real.

## Cómo probarlo localmente

Como usa `fetch`/módulos externos vía CDN (Google Fonts, SheetJS), basta con
servirlo con cualquier servidor estático, por ejemplo:

```bash
npx serve .
# o
python3 -m http.server 8000
```

Abrilo en el navegador y vas a ver la interfaz en modo de solo lectura con
los datos de ejemplo.
