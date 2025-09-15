import React, { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Trash2, DollarSign, FileText, Calendar } from 'lucide-react';

const Register = () => {
  const [registros, setRegistros] = useState([]);
  const [concepto, setConcepto] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('entrada');

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
  try {
    const datosGuardados = JSON.parse(localStorage.getItem('cajaMenorRegistros')) || [];
    if (Array.isArray(datosGuardados)) {
      setRegistros(datosGuardados);
    }
  } catch (error) {
    console.error('Error al cargar datos guardados:', error);
    setRegistros([]); // fallback
  }
}, []);


  // Guardar datos en localStorage cada vez que cambien los registros
  useEffect(() => {
  try {
    localStorage.setItem('cajaMenorRegistros', JSON.stringify(registros));
  } catch (error) {
    console.error('Error al guardar registros:', error);
  }
}, [registros]);


  // Formatear número a pesos colombianos
  const formatearPesos = (numero) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numero);
  };

  // Agregar nuevo registro
  const agregarRegistro = () => {
    if (!concepto.trim() || !valor.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(/[^\d]/g, ''));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      alert('Por favor ingresa un valor válido');
      return;
    }

    const nuevoRegistro = {
      id: Date.now(),
      concepto: concepto.trim(),
      valor: valorNumerico,
      tipo,
      fecha: new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setRegistros([nuevoRegistro, ...registros]);
    setConcepto('');
    setValor('');
  };

  // Eliminar registro individual
  const eliminarRegistro = (id) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      setRegistros(registros.filter(registro => registro.id !== id));
    }
  };

  // Eliminar los primeros 10 registros
  const eliminarPrimeros10 = () => {
    if (registros.length === 0) {
      alert('No hay registros para eliminar');
      return;
    }
    
    const cantidadAEliminar = Math.min(10, registros.length);
    if (confirm(`¿Estás seguro de eliminar los primeros ${cantidadAEliminar} registros?`)) {
      setRegistros(registros.slice(cantidadAEliminar));
    }
  };

  // Manejar cambio en el input de valor
  const manejarCambioValor = (e) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setValor(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="text-green-600" />
            Dashboard Caja Menor
          </h1>
          <p className="text-gray-600 mt-2">Gestión de entradas y salidas de caja menor</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle className="text-blue-600" size={24} />
            Nuevo Registro
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="entrada">📈 Entrada</option>
                <option value="salida">📉 Salida</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concepto</label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Pago factura luz, Reintegro cheque..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor (COP)</label>
              <input
                type="text"
                value={valor}
                onChange={manejarCambioValor}
                placeholder="50000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {valor && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatearPesos(parseFloat(valor.replace(/[^\d]/g, '')) || 0)}
                </p>
              )}
            </div>
            
            <div className="flex items-end">
              <button
                onClick={agregarRegistro}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <PlusCircle size={20} />
                Agregar
              </button>
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="text-gray-600" size={24} />
              Historial de Registros ({registros.length})
            </h2>
            
            {registros.length > 0 && (
              <button
                onClick={eliminarPrimeros10}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar primeros 10
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {registros.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">No hay registros aún</p>
                <p className="text-gray-400">Agrega tu primer movimiento de caja menor</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Calendar size={16} className="inline mr-1" />
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registros.map((registro) => (
                    <tr key={registro.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {registro.fecha}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          registro.tipo === 'entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registro.tipo === 'entrada' ? <PlusCircle size={14} /> : <MinusCircle size={14} />}
                          {registro.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {registro.concepto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${
                          registro.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {registro.tipo === 'entrada' ? '+' : '-'}{formatearPesos(registro.valor)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => eliminarRegistro(registro.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                          title="Eliminar registro"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;