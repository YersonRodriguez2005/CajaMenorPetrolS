import React, { useState, useEffect } from 'react';

const SistemaCajaMenor = () => {
  // Utilidades para LocalStorage
  const guardarDatos = (key, data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const cargarDatos = (key) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  // Estados principales
  const [presupuestoInicial] = useState(() => cargarDatos('caja-presupuesto-inicial') || 4000000);
  const [presupuestoActual, setPresupuestoActual] = useState(() => cargarDatos('caja-presupuesto') || 4000000);
  const [activeTab, setActiveTab] = useState('conteo');
  const [datosCargados, setDatosCargados] = useState(false);

  // Estados inicializados con localStorage
  const [billetes, setBilletes] = useState(() =>
    cargarDatos('caja-billetes') || {
      100000: 0,
      50000: 0,
      20000: 0,
      10000: 0,
      5000: 0,
      2000: 0
    }
  );

  const [monedas, setMonedas] = useState(() =>
    cargarDatos('caja-monedas') || {
      1000: 0,
      500: 0,
      200: 0,
      100: 0,
      50: 0
    }
  );

  const [facturas, setFacturas] = useState(() => cargarDatos('caja-facturas') || []);
  const [vales, setVales] = useState(() => cargarDatos('caja-vales') || []);

  // Formularios y edición
  const [facturaForm, setFacturaForm] = useState({
    fecha: '',
    nit: '',
    nombre: '',
    numeroFactura: '',
    descripcion: '',
    valor: ''
  });

  const [valeForm, setValeForm] = useState({
    fecha: '',
    nit: '',
    nombre: '',
    concepto: '',
    valor: ''
  });

  const [editingFactura, setEditingFactura] = useState(null);
  const [editingVale, setEditingVale] = useState(null);

  // Cargar presupuesto inicial en localStorage (una sola vez)
  useEffect(() => {
    guardarDatos('caja-presupuesto-inicial', presupuestoInicial);
  }, []);

  // Indicar que los datos se han cargado correctamente
  useEffect(() => {
    setDatosCargados(true);
  }, []);

  // Guardar cambios automáticos
  useEffect(() => guardarDatos('caja-billetes', billetes), [billetes]);
  useEffect(() => guardarDatos('caja-monedas', monedas), [monedas]);
  useEffect(() => guardarDatos('caja-facturas', facturas), [facturas]);
  useEffect(() => guardarDatos('caja-vales', vales), [vales]);

  useEffect(() => {
    if (!datosCargados) return;

    const totalEfectivo = calcularTotalEfectivo();
    const totalFacturas = calcularTotalFacturas();
    const totalVales = calcularTotalVales();
    const nuevoPresupuesto = totalEfectivo + totalFacturas + totalVales;

    setPresupuestoActual(nuevoPresupuesto);
    guardarDatos('caja-presupuesto', nuevoPresupuesto);
  }, [billetes, monedas, facturas, vales, datosCargados]);

  // Utilidades
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);

  const calcularTotalEfectivo = () => {
    const totalBilletes = Object.entries(billetes).reduce(
      (sum, [valor, cantidad]) => sum + Number(valor) * Number(cantidad),
      0
    );
    const totalMonedas = Object.entries(monedas).reduce(
      (sum, [valor, cantidad]) => sum + Number(valor) * Number(cantidad),
      0
    );
    return totalBilletes + totalMonedas;
  };

  const calcularTotalFacturas = () =>
    facturas.reduce((sum, factura) => sum + Number(factura.valor), 0);

  const calcularTotalVales = () =>
    vales.reduce((sum, vale) => sum + Number(vale.valor), 0);

  // Handlers de formulario
  const handleBilleteChange = (valor, cantidad) => {
    setBilletes(prev => ({ ...prev, [valor]: Number(cantidad) || 0 }));
  };

  const handleMonedaChange = (valor, cantidad) => {
    setMonedas(prev => ({ ...prev, [valor]: Number(cantidad) || 0 }));
  };

  const handleFacturaSubmit = (e) => {
    e.preventDefault();
    const valor = Number(facturaForm.valor);

    if (valor > 200000) return alert('Las facturas no pueden exceder $200.000');

    const totalEfectivo = calcularTotalEfectivo();
    const totalVales = calcularTotalVales();
    const presupuestoDisponible = presupuestoInicial - totalEfectivo - totalVales;

    if (valor > presupuestoDisponible) {
      return alert('No hay suficiente presupuesto disponible');
    }

    const nuevaFactura = {
      ...facturaForm,
      valor,
      id: Date.now()
    };

    if (editingFactura) {
      setFacturas(prev => prev.map(f => f.id === editingFactura ? nuevaFactura : f));
      setEditingFactura(null);
    } else {
      setFacturas(prev => [...prev, nuevaFactura]);
    }

    setFacturaForm({
      fecha: '', nit: '', nombre: '', numeroFactura: '', descripcion: '', valor: ''
    });
  };

  const handleValeSubmit = (e) => {
    e.preventDefault();
    const valor = Number(valeForm.valor);

    if (valor > 200000) return alert('Los vales no pueden exceder $200.000');

    const totalEjecutado = presupuestoActual + valor;
    if (totalEjecutado > presupuestoInicial) {
      return alert('No hay suficiente presupuesto disponible. Presupuesto restante: ' +
        formatCurrency(presupuestoInicial - presupuestoActual));
    }

    const nuevoVale = {
      ...valeForm,
      valor,
      id: Date.now()
    };

    if (editingVale) {
      setVales(prev => prev.map(v => v.id === editingVale ? nuevoVale : v));
      setEditingVale(null);
    } else {
      setVales(prev => [...prev, nuevoVale]);
    }

    setValeForm({
      fecha: '', nit: '', nombre: '', concepto: '', valor: ''
    });
  };

  // Handlers de edición y eliminación
  const eliminarFactura = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
      setFacturas(prev => prev.filter(f => f.id !== id));
    }
  };

  const eliminarVale = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este vale?')) {
      setVales(prev => prev.filter(v => v.id !== id));
    }
  };

  const editarFactura = (factura) => {
    setFacturaForm(factura);
    setEditingFactura(factura.id);
    setActiveTab('facturas');
  };

  const editarVale = (vale) => {
    setValeForm(vale);
    setEditingVale(vale.id);
    setActiveTab('vales');
  };

  // Reset general
  const limpiarTodosLosDatos = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
      setBilletes({ 100000: 0, 50000: 0, 20000: 0, 10000: 0, 5000: 0, 2000: 0 });
      setMonedas({ 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0 });
      setFacturas([]);
      setVales([]);
      setEditingFactura(null);
      setEditingVale(null);
      setFacturaForm({ fecha: '', nit: '', nombre: '', numeroFactura: '', descripcion: '', valor: '' });
      setValeForm({ fecha: '', nit: '', nombre: '', concepto: '', valor: '' });

      ['caja-billetes', 'caja-monedas', 'caja-facturas', 'caja-vales', 'caja-presupuesto', 'caja-presupuesto-inicial']
        .forEach(key => localStorage.removeItem(key));

      alert('Todos los datos han sido limpiados exitosamente.');
    }
  };

  const exportarDatos = () => {
    const datos = {
      fecha_exportacion: new Date().toISOString(),
      presupuesto_inicial: presupuestoInicial,
      presupuesto_actual: presupuestoActual,
      billetes,
      monedas,
      facturas,
      vales,
      totales: {
        efectivo: calcularTotalEfectivo(),
        facturas: calcularTotalFacturas(),
        vales: calcularTotalVales()
      }
    };

    const dataStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `caja_menor_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
          💰 Sistema de Caja Menor
        </h1>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            💾 <strong>Persistencia de Datos:</strong> En tu propio proyecto, todos los datos se guardan automáticamente en localStorage.
            En este entorno de demostración, los datos se mantienen durante la sesión actual.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={exportarDatos}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center text-sm"
          >
            📊 Exportar Datos
          </button>
          <button
            onClick={limpiarTodosLosDatos}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center text-sm"
          >
            🗑️ Limpiar Todo
          </button>
        </div>

        {/* Resumen financiero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Presupuesto Inicial</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(presupuestoInicial)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Presupuesto Actual</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(presupuestoActual)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800">Total Ejecutado</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(calcularTotalFacturas() + calcularTotalVales())}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Efectivo en Caja</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(calcularTotalEfectivo())}</p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('conteo')}
            className={`flex items-center px-6 py-3 font-medium ${activeTab === 'conteo'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            🧮 Conteo de Efectivo
          </button>
          <button
            onClick={() => setActiveTab('facturas')}
            className={`flex items-center px-6 py-3 font-medium ${activeTab === 'facturas'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            🧾 Facturas ({facturas.length})
          </button>
          <button
            onClick={() => setActiveTab('vales')}
            className={`flex items-center px-6 py-3 font-medium ${activeTab === 'vales'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            📄 Vales ({vales.length})
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {/* Pestaña de Conteo de Efectivo */}
          {activeTab === 'conteo' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Conteo de Efectivo</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Billetes */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-700">Billetes</h3>
                  <div className="space-y-4">
                    {Object.entries(billetes).map(([valor, cantidad]) => (
                      <div key={valor} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <span className="font-medium">{formatCurrency(Number(valor))}</span>
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="0"
                            value={cantidad}
                            onChange={(e) => handleBilleteChange(valor, e.target.value)}
                            className="w-20 px-3 py-1 border rounded-md text-center"
                          />
                          <span className="text-sm text-gray-600 min-w-[100px] text-right">
                            = {formatCurrency(Number(valor) * cantidad)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <span className="font-bold">Total Billetes: {formatCurrency(
                      Object.entries(billetes).reduce((sum, [valor, cantidad]) =>
                        sum + (Number(valor) * Number(cantidad)), 0)
                    )}</span>
                  </div>
                </div>

                {/* Monedas */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-amber-700">Monedas</h3>
                  <div className="space-y-4">
                    {Object.entries(monedas).map(([valor, cantidad]) => (
                      <div key={valor} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                        <span className="font-medium">{formatCurrency(Number(valor))}</span>
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="0"
                            value={cantidad}
                            onChange={(e) => handleMonedaChange(valor, e.target.value)}
                            className="w-20 px-3 py-1 border rounded-md text-center"
                          />
                          <span className="text-sm text-gray-600 min-w-[100px] text-right">
                            = {formatCurrency(Number(valor) * cantidad)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                    <span className="font-bold">Total Monedas: {formatCurrency(
                      Object.entries(monedas).reduce((sum, [valor, cantidad]) =>
                        sum + (Number(valor) * Number(cantidad)), 0)
                    )}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-100 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-blue-800">
                  Total Efectivo en Caja: {formatCurrency(calcularTotalEfectivo())}
                </h3>
              </div>
            </div>
          )}

          {/* Pestaña de Facturas */}
          {activeTab === 'facturas' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Registro de Facturas</h2>

              {/* Formulario de factura */}
              <form onSubmit={handleFacturaSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingFactura ? 'Editar Factura' : 'Nueva Factura'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="date"
                    placeholder="Fecha de Emisión"
                    value={facturaForm.fecha}
                    onChange={(e) => setFacturaForm({ ...facturaForm, fecha: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="NIT"
                    value={facturaForm.nit}
                    onChange={(e) => setFacturaForm({ ...facturaForm, nit: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={facturaForm.nombre}
                    onChange={(e) => setFacturaForm({ ...facturaForm, nombre: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Número de Factura"
                    value={facturaForm.numeroFactura}
                    onChange={(e) => setFacturaForm({ ...facturaForm, numeroFactura: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={facturaForm.descripcion}
                    onChange={(e) => setFacturaForm({ ...facturaForm, descripcion: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Valor (COP)"
                    max="200000"
                    value={facturaForm.valor}
                    onChange={(e) => setFacturaForm({ ...facturaForm, valor: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    ➕ {editingFactura ? 'Actualizar' : 'Registrar'} Factura
                  </button>
                  {editingFactura && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFactura(null);
                        setFacturaForm({
                          fecha: '',
                          nit: '',
                          nombre: '',
                          numeroFactura: '',
                          descripcion: '',
                          valor: ''
                        });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Lista de facturas */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Facturas Registradas ({facturas.length})
                </h3>
                {facturas.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay facturas registradas</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">NIT</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">N° Factura</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Descripción</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Valor</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturas.map((factura) => (
                          <tr key={factura.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{factura.fecha}</td>
                            <td className="border border-gray-300 px-4 py-2">{factura.nit}</td>
                            <td className="border border-gray-300 px-4 py-2">{factura.nombre}</td>
                            <td className="border border-gray-300 px-4 py-2">{factura.numeroFactura}</td>
                            <td className="border border-gray-300 px-4 py-2">{factura.descripcion}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                              {formatCurrency(factura.valor)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => editarFactura(factura)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => eliminarFactura(factura.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {facturas.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-100 rounded-lg text-right">
                    <span className="text-lg font-bold">
                      Total Facturas: {formatCurrency(calcularTotalFacturas())}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pestaña de Vales */}
          {activeTab === 'vales' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Registro de Vales</h2>

              {/* Formulario de vale */}
              <form onSubmit={handleValeSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingVale ? 'Editar Vale' : 'Nuevo Vale'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="date"
                    placeholder="Fecha"
                    value={valeForm.fecha}
                    onChange={(e) => setValeForm({ ...valeForm, fecha: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="NIT"
                    value={valeForm.nit}
                    onChange={(e) => setValeForm({ ...valeForm, nit: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={valeForm.nombre}
                    onChange={(e) => setValeForm({ ...valeForm, nombre: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Concepto"
                    value={valeForm.concepto}
                    onChange={(e) => setValeForm({ ...valeForm, concepto: e.target.value })}
                    className="px-3 py-2 border rounded-md md:col-span-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Valor (COP)"
                    max="200000"
                    value={valeForm.valor}
                    onChange={(e) => setValeForm({ ...valeForm, valor: e.target.value })}
                    className="px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  >
                    ➕ {editingVale ? 'Actualizar' : 'Registrar'} Vale
                  </button>
                  {editingVale && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVale(null);
                        setValeForm({
                          fecha: '',
                          nit: '',
                          nombre: '',
                          concepto: '',
                          valor: ''
                        });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Lista de vales */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Vales Registrados ({vales.length})
                </h3>
                {vales.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay vales registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">NIT</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Concepto</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Valor</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vales.map((vale) => (
                          <tr key={vale.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{vale.fecha}</td>
                            <td className="border border-gray-300 px-4 py-2">{vale.nit}</td>
                            <td className="border border-gray-300 px-4 py-2">{vale.nombre}</td>
                            <td className="border border-gray-300 px-4 py-2">{vale.concepto}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                              {formatCurrency(vale.valor)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => editarVale(vale)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => eliminarVale(vale.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {vales.length > 0 && (
                  <div className="mt-4 p-4 bg-green-100 rounded-lg text-right">
                    <span className="text-lg font-bold">
                      Total Vales: {formatCurrency(calcularTotalVales())}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información de implementación */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="font-bold text-yellow-800 mb-2">📋 Instrucciones para implementar localStorage:</h3>
        <p className="text-yellow-700 text-sm mb-2">
          Para que los datos se guarden permanentemente cuando copies este código a tu proyecto:
        </p>
        <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
          <li>Descomenta las líneas que dicen "localStorage.setItem" en la función guardarDatos</li>
          <li>Descomenta las líneas que dicen "localStorage.getItem" en la función cargarDatos</li>
          <li>Descomenta la línea "localStorage.removeItem" en la función limpiarTodosLosDatos</li>
        </ol>
        <p className="text-yellow-700 text-sm mt-2">
          ✅ Con estos cambios, todos tus datos se guardarán automáticamente y permanecerán al recargar la página.
        </p>
      </div>
    </div>
  );
};

export default SistemaCajaMenor;