"use strict";
// ================= datos base y estado global =================
// NOTA: los movimientos de SEED_MOVIMIENTOS son datos de EJEMPLO genéricos,
// pensados solo para que la app tenga algo que mostrar la primera vez que se
// abre fuera de Claude (ver 18-boot.js -> useReadOnlySeed). Reemplazá este
// array por tus propios datos, o dejalo vacío ([]) y cargá todo desde la UI.
var SEED_MOVIMIENTOS = [
{"fecha": null, "mes": "2026-01", "concepto": "Ejemplo de ingreso", "notas": "dato de muestra", "monto": 50000, "tipo": "Ingreso", "negocio": "Negocio A", "categoria": "Ventas"},
{"fecha": null, "mes": "2026-01", "concepto": "Ejemplo de egreso", "notas": "dato de muestra", "monto": 20000, "tipo": "Egreso", "negocio": "Negocio A", "categoria": "Insumos"},
{"fecha": null, "mes": "2026-01", "concepto": "Alquiler", "notas": "dato de muestra", "monto": 100000, "tipo": "Egreso", "negocio": "Negocio B", "categoria": "Alquiler"},
{"fecha": null, "mes": "2026-01", "concepto": "Sueldo", "notas": "dato de muestra", "monto": 300000, "tipo": "Ingreso", "negocio": "Personal", "categoria": "Sueldo"}
];
var DEFAULT_NEGOCIOS = ["Negocio A","Negocio B","Personal","Transversal"];
var BIEN_CATEGORIAS = ["Instalaciones","Muebles y útiles","Equipamiento","Rodados","Otros"];

var state = {
docs: [],        // movimientos
bienes: [],
deudas: [],
presupuestos: [],
fijos: [],       // ingresos y costos fijos (plantillas recurrentes)
negocios: [],    // [{id, nombre, createdAt}]
negocioFilter: "Todos",
view: "general",
groupBy: "categoria",
search: "",
mesFilter: null,
mesFilterInitialized: false,
cierres: [],
cierreActual: null,
pendingRender: false
};

var dbApi = null, downloadsApi = null, sampleApi = null;
var cdImagenes = {frente: [], dorso: []};
var CD_TOLERANCIA = 500;
var CD_GASTO_CAT = {sueldo:'Varios', servicio:'Servicios', insumo:'Insumos alimenticios', otro:'Varios'};
var CD_TIPO_LABEL = {sueldo:'Sueldos', servicio:'Servicios', retiro:'Retiros', pago_deuda_proveedor:'Pago a proveedores (deuda)', insumo:'Insumos', otro:'Otros'};
