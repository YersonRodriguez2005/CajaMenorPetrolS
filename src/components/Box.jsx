import React, { useState, useEffect } from 'react';
import { Download, Edit, Trash2, Save, X } from 'lucide-react';

const CajaMenorControl = () => {
  const FONDO_INICIAL = 4000000;
  
  // Estados principales
  const [contadorTotal, setContadorTotal] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoValores, setEditandoValores] = useState({});
  
  // Estados para formularios
  const [activeTab, setActiveTab] = useState('billetes');
  const [cantidadBilletes, setCantidadBilletes] = useState({});
  const [cantidadMonedas, setCantidadMonedas] = useState({});
  const [encomiendas, setEncomiendas] = useState({ tipo: '18000', cantidad: 0 });
  const [factura, setFactura] = useState({ concepto: '', valor: 0 });
  const [vale, setVale] = useState({ concepto: '', valor: 0 });

  // Denominaciones
  const denominacionesBilletes = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
  const denominacionesMonedas = [1000, 500, 200, 100, 50];
  
  const tiposEncomienda = [
    { valor: 18000, label: '$18.000' },
    { valor: 11000, label: '$11.000' }
  ];

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const datosGuardados = localStorage.getItem('cajaMenorData');
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      setContadorTotal(datos.contadorTotal || 0);
      setHistorial(datos.historial || []);
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    const datos = {
      contadorTotal,
      historial
    };
    localStorage.setItem('cajaMenorData', JSON.stringify(datos));
  }, [contadorTotal, historial]);

  const formatearPesos = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const agregarMovimiento = (tipo, detalle, valor) => {
    const nuevoMovimiento = {
      id: Date.now(),
      fecha: new Date().toLocaleString('es-CO'),
      tipo,
      detalle,
      valor
    };
    
    setHistorial(prev => [nuevoMovimiento, ...prev]);
    setContadorTotal(prev => prev + valor);
  };

  const editarMovimiento = (id) => {
    const movimiento = historial.find(m => m.id === id);
    setEditandoId(id);
    setEditandoValores({
      detalle: movimiento.detalle,
      valor: movimiento.valor
    });
  };

  const guardarEdicion = (id) => {
    const movimientoOriginal = historial.find(m => m.id === id);
    const diferencia = editandoValores.valor - movimientoOriginal.valor;
    
    setHistorial(prev => prev.map(m => 
      m.id === id 
        ? { ...m, detalle: editandoValores.detalle, valor: editandoValores.valor }
        : m
    ));
    
    setContadorTotal(prev => prev + diferencia);
    setEditandoId(null);
    setEditandoValores({});
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditandoValores({});
  };

  const eliminarMovimiento = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      const movimiento = historial.find(m => m.id === id);
      setHistorial(prev => prev.filter(m => m.id !== id));
      setContadorTotal(prev => prev - movimiento.valor);
    }
  };

  const generarPDF = (categoria = 'todos') => {
    let movimientosFiltrados = historial;
    
    if (categoria !== 'todos') {
      movimientosFiltrados = historial.filter(m => 
        m.detalle.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    // Crear contenido HTML para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte Caja Menor - ${categoria}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .ingreso { color: green; }
          .egreso { color: red; }
          .total { font-weight: bold; background-color: #e8f4fd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sistema de Control de Caja Menor</h1>
          <h2>Reporte: ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h2>
          <p>Fecha de generación: ${new Date().toLocaleString('es-CO')}</p>
        </div>
        
        <div class="summary">
          <h3>Resumen Financiero</h3>
          <p><strong>Fondo Inicial:</strong> ${formatearPesos(FONDO_INICIAL)}</p>
          <p><strong>Total Movimientos:</strong> ${formatearPesos(contadorTotal)}</p>
          <p><strong>Saldo Actual:</strong> ${formatearPesos(FONDO_INICIAL + contadorTotal)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Detalle</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${movimientosFiltrados.map(m => `
              <tr>
                <td>${m.fecha}</td>
                <td class="${m.tipo}">${m.tipo.toUpperCase()}</td>
                <td>${m.detalle}</td>
                <td class="${m.tipo}">${m.tipo === 'ingreso' ? '+' : '-'}${formatearPesos(m.valor)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3"><strong>TOTAL</strong></td>
              <td><strong>${formatearPesos(movimientosFiltrados.reduce((sum, m) => sum + m.valor, 0))}</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Crear y descargar el PDF
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const registrarBilletes = () => {
    let total = 0;
    let detalle = 'Billetes: ';
    let items = [];
    
    Object.entries(cantidadBilletes).forEach(([denominacion, cantidad]) => {
      if (cantidad > 0) {
        const valor = parseInt(denominacion) * cantidad;
        total += valor;
        items.push(`${cantidad} x ${formatearPesos(parseInt(denominacion))}`);
      }
    });
    
    if (total > 0) {
      detalle += items.join(', ');
      agregarMovimiento('ingreso', detalle, total);
      setCantidadBilletes({});
    }
  };

  const registrarMonedas = () => {
    let total = 0;
    let detalle = 'Monedas: ';
    let items = [];
    
    Object.entries(cantidadMonedas).forEach(([denominacion, cantidad]) => {
      if (cantidad > 0) {
        const valor = parseInt(denominacion) * cantidad;
        total += valor;
        items.push(`${cantidad} x ${formatearPesos(parseInt(denominacion))}`);
      }
    });
    
    if (total > 0) {
      detalle += items.join(', ');
      agregarMovimiento('ingreso', detalle, total);
      setCantidadMonedas({});
    }
  };

  const registrarEncomienda = () => {
    if (encomiendas.cantidad > 0) {
      const valorUnitario = parseInt(encomiendas.tipo);
      const total = valorUnitario * encomiendas.cantidad;
      const detalle = `Encomiendas: ${encomiendas.cantidad} x ${formatearPesos(valorUnitario)}`;
      
      agregarMovimiento('ingreso', detalle, total);
      setEncomiendas({ tipo: '18000', cantidad: 0 });
    }
  };

  const registrarFactura = () => {
    if (factura.concepto && factura.valor > 0) {
      const detalle = `Factura: ${factura.concepto}`;
      agregarMovimiento('egreso', detalle, factura.valor);
      setFactura({ concepto: '', valor: 0 });
    }
  };

  const registrarVale = () => {
    if (vale.concepto && vale.valor > 0) {
      const detalle = `Vale: ${vale.concepto}`;
      agregarMovimiento('egreso', detalle, vale.valor);
      setVale({ concepto: '', valor: 0 });
    }
  };

  const saldoActual = FONDO_INICIAL + contadorTotal;

  const resetearDatos = () => {
    if (window.confirm('¿Está seguro de que desea resetear todos los datos? Esta acción no se puede deshacer.')) {
      setContadorTotal(0);
      setHistorial([]);
      setCantidadBilletes({});
      setCantidadMonedas({});
      setEncomiendas({ tipo: '18000', cantidad: 0 });
      setFactura({ concepto: '', valor: 0 });
      setVale({ concepto: '', valor: 0 });
      localStorage.removeItem('cajaMenorData');
    }
  };

  const tabs = [
    { id: 'billetes', label: '💵 Billetes' },
    { id: 'monedas', label: '🪙 Monedas' },
    { id: 'encomiendas', label: '📦 Encomiendas' },
    { id: 'facturas', label: '📄 Facturas' },
    { id: 'vales', label: '🧾 Vales' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Sistema de Control de Caja Menor
          </h1>
          
          {/* Resumen financiero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-600 mb-1">Fondo Inicial</h3>
              <p className="text-2xl font-bold text-blue-800">{formatearPesos(FONDO_INICIAL)}</p>
            </div>
            <div className={`p-4 rounded-lg border ${contadorTotal >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-sm font-medium mb-1 ${contadorTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Contador Total
              </h3>
              <p className={`text-2xl font-bold ${contadorTotal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {formatearPesos(contadorTotal)}
              </p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${saldoActual >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-orange-50 border-orange-300'}`}>
              <h3 className={`text-sm font-medium mb-1 ${saldoActual >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                Saldo Actual
              </h3>
              <p className={`text-2xl font-bold ${saldoActual >= 0 ? 'text-emerald-800' : 'text-orange-800'}`}>
                {formatearPesos(saldoActual)}
              </p>
            </div>
          </div>

          {/* Botones de descarga PDF */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Descargar Reportes PDF:</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generarPDF('todos')}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Todos los Movimientos
              </button>
              <button
                onClick={() => generarPDF('billetes')}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                Billetes
              </button>
              <button
                onClick={() => generarPDF('monedas')}
                className="flex items-center gap-2 bg-yellow-600 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
              >
                <Download size={16} />
                Monedas
              </button>
              <button
                onClick={() => generarPDF('encomiendas')}
                className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
              >
                <Download size={16} />
                Encomiendas
              </button>
              <button
                onClick={() => generarPDF('facturas')}
                className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                <Download size={16} />
                Facturas
              </button>
              <button
                onClick={() => generarPDF('vales')}
                className="flex items-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors"
              >
                <Download size={16} />
                Vales
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de registro */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Billetes */}
              {activeTab === 'billetes' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Registro de Billetes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {denominacionesBilletes.map(denominacion => (
                      <div key={denominacion} className="border rounded-lg p-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formatearPesos(denominacion)}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={cantidadBilletes[denominacion] || ''}
                          onChange={(e) => setCantidadBilletes(prev => ({
                            ...prev,
                            [denominacion]: parseInt(e.target.value) || 0
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={registrarBilletes}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ➕ Registrar Billetes
                  </button>
                </div>
              )}

              {/* Monedas */}
              {activeTab === 'monedas' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Registro de Monedas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {denominacionesMonedas.map(denominacion => (
                      <div key={denominacion} className="border rounded-lg p-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {formatearPesos(denominacion)}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={cantidadMonedas[denominacion] || ''}
                          onChange={(e) => setCantidadMonedas(prev => ({
                            ...prev,
                            [denominacion]: parseInt(e.target.value) || 0
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={registrarMonedas}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ➕ Registrar Monedas
                  </button>
                </div>
              )}

              {/* Encomiendas */}
              {activeTab === 'encomiendas' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Registro de Encomiendas</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Encomienda
                      </label>
                      <select
                        value={encomiendas.tipo}
                        onChange={(e) => setEncomiendas(prev => ({ ...prev, tipo: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {tiposEncomienda.map(tipo => (
                          <option key={tipo.valor} value={tipo.valor}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={encomiendas.cantidad || ''}
                        onChange={(e) => setEncomiendas(prev => ({ 
                          ...prev, 
                          cantidad: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                    {encomiendas.cantidad > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Total: {formatearPesos(parseInt(encomiendas.tipo) * encomiendas.cantidad)}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={registrarEncomienda}
                    className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ➕ Registrar Encomienda
                  </button>
                </div>
              )}

              {/* Facturas */}
              {activeTab === 'facturas' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Registro de Facturas</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concepto
                      </label>
                      <input
                        type="text"
                        value={factura.concepto}
                        onChange={(e) => setFactura(prev => ({ ...prev, concepto: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Descripción del gasto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={factura.valor || ''}
                        onChange={(e) => setFactura(prev => ({ 
                          ...prev, 
                          valor: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <button
                    onClick={registrarFactura}
                    className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ➖ Registrar Factura
                  </button>
                </div>
              )}

              {/* Vales */}
              {activeTab === 'vales' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Registro de Vales</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Concepto
                      </label>
                      <input
                        type="text"
                        value={vale.concepto}
                        onChange={(e) => setVale(prev => ({ ...prev, concepto: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Descripción del vale"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={vale.valor || ''}
                        onChange={(e) => setVale(prev => ({ 
                          ...prev, 
                          valor: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <button
                    onClick={registrarVale}
                    className="w-full mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ➖ Registrar Vale
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Historial */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Historial de Movimientos</h3>
                <button
                  onClick={resetearDatos}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  Resetear Todo
                </button>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {historial.length === 0 ? (
                <p className="text-gray-500 text-center">No hay movimientos registrados</p>
              ) : (
                <div className="space-y-3">
                  {historial.map((movimiento) => (
                    <div
                      key={movimiento.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        movimiento.tipo === 'ingreso'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      {editandoId === movimiento.id ? (
                        // Modo edición
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editandoValores.detalle}
                            onChange={(e) => setEditandoValores(prev => ({ ...prev, detalle: e.target.value }))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          />
                          <input
                            type="number"
                            value={editandoValores.valor}
                            onChange={(e) => setEditandoValores(prev => ({ ...prev, valor: parseInt(e.target.value) || 0 }))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => guardarEdicion(movimiento.id)}
                              className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >
                              <Save size={12} />
                              Guardar
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              className="flex items-center gap-1 bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
                            >
                              <X size={12} />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {movimiento.detalle}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {movimiento.fecha}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {movimiento.tipo === 'ingreso' ? '+' : '-'}
                              {formatearPesos(movimiento.valor)}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => editarMovimiento(movimiento.id)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => eliminarMovimiento(movimiento.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Eliminar"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaMenorControl;