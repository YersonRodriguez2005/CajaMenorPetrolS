import React, { useState } from 'react';
import { Calculator, FileText, ArrowRight, DollarSign, Home } from 'lucide-react';
import Box from './components/Box';
import Register from './components/Registros';

export default function App() {
  const [activeComponent, setActiveComponent] = useState(null);

  const NavigationHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <DollarSign className="text-blue-600" size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Gestión
          </h1>
          <p className="text-gray-600 text-lg">
            Selecciona el módulo al que deseas acceder
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Card Box */}
          <div 
            onClick={() => setActiveComponent('box')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calculator className="text-blue-600" size={32} />
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={24} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Componente Box
            </h3>
            <p className="text-gray-600 mb-4">
              Accede al módulo Box para realizar cálculos y operaciones especializadas.
            </p>
            
            <div className="flex items-center text-blue-600 font-medium">
              <span>Ingresar</span>
              <ArrowRight className="ml-2" size={16} />
            </div>
          </div>

          {/* Card Registros */}
          <div 
            onClick={() => setActiveComponent('registros')}
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="text-green-600" size={32} />
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-green-600 transition-colors" size={24} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Caja Menor
            </h3>
            <p className="text-gray-600 mb-4">
              Gestiona entradas y salidas de caja menor, registra movimientos y consulta historiales.
            </p>
            
            <div className="flex items-center text-green-600 font-medium">
              <span>Ingresar</span>
              <ArrowRight className="ml-2" size={16} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Desarrollado para gestión empresarial eficiente
          </p>
        </div>
      </div>
    </div>
  );

  // Wrapper para componentes con botón de regreso
  const ComponentWrapper = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button 
            onClick={() => setActiveComponent(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            <Home size={20} />
            Volver al menú principal
          </button>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );

  // Renderizar componente activo
  if (activeComponent === 'box') {
    return (
      <ComponentWrapper title="Box">
        <Box />
      </ComponentWrapper>
    );
  }

  if (activeComponent === 'registros') {
    return (
      <ComponentWrapper title="Registros">
        <Register />
      </ComponentWrapper>
    );
  }

  // Pantalla principal con cards de navegación
  return <NavigationHome />;
}