import React, { useState } from 'react';
import { Calculator, Wallet, Home, ChevronRight } from 'lucide-react';
import Box from './components/Box';

export default function App() {
  const [activeComponent, setActiveComponent] = useState(null);

  const THEME = {
    primary: '#4f46e5',
    secondary: '#c8a96e',
    background: '#f4f1eb',
    surface: '#ffffff',
    text: '#1a1a2e',
    muted: '#7c6f5a'
  };

  const NavigationHome = () => (
    <div style={{
      minHeight: '100vh',
      background: THEME.background,
      fontFamily: "'Inter', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <style>{`
        .nav-card {
          background: ${THEME.surface};
          border-radius: 20px;
          padding: 32px;
          cursor: pointer;
          border: 1px solid rgba(200, 169, 110, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .nav-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: ${THEME.primary};
        }
        .nav-card:hover .arrow-icon { transform: translateX(4px); }
        .arrow-icon { transition: transform 0.2s ease; }
      `}</style>

      <div style={{ maxWidth: 860, width: '100%' }}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '24px',
            background: THEME.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
          }}>
            <Wallet size={38} color={THEME.secondary} />
          </div>
          <h1 style={{ fontSize: 38, color: THEME.text, margin: '0 0 12px', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Dashboard Principal
          </h1>
          <p style={{ color: THEME.muted, fontSize: 18, margin: 0, fontWeight: 400 }}>
            Gestión integral de flujos de caja y operaciones
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Tarjeta Única de Navegación */}
          <div className="nav-card" onClick={() => setActiveComponent('box')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Calculator size={32} color={THEME.primary} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 22, color: THEME.text, margin: '0 0 8px', fontWeight: 700 }}>
                  Control de Caja Menor
                </h3>
                <p style={{ color: THEME.muted, fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                  Módulo especializado para el registro de billetes, monedas, facturas y gestión de saldos operativos.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: THEME.primary, fontWeight: 700, fontSize: 16, gap: 4 }}>
                Abrir <ChevronRight size={20} className="arrow-icon" />
              </div>
            </div>
          </div>

        </div>

        <p style={{ textAlign: 'center', color: '#b5a898', fontSize: 13, marginTop: 40 }}>
          Desarrollado para gestión empresarial eficiente
        </p>
      </div>

      {/* Footer de informacion del creador */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none', // Permite hacer clic "a través" del div contenedor
        zIndex: 1000
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '8px 16px',
          borderRadius: 100,
          boxShadow: '0 4px 12px rgba(26,26,46,0.08)',
          border: '1.5px solid rgba(226, 217, 200, 0.5)',
          pointerEvents: 'auto' // Reactiva los clics solo en la pastilla
        }}>
          <p style={{ color: '#7c6f5a', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            Desarrollado por{' '}
            <a
              href="https://github.com/YersonRodriguez2005"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#4f46e5', // Color índigo que resalta
                textDecoration: 'none',
                fontWeight: 700
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Yerson Rodriguez
            </a>
          </p>
        </div>
      </div>


    </div>
  );

  const ComponentWrapper = ({ children }) => (
    <div style={{ minHeight: '100vh', background: '#f4f1eb' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap');`}</style>
      <div style={{
        background: '#1a1a2e', padding: '14px 28px',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={() => setActiveComponent(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#c8a96e', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Source Sans 3', sans-serif", fontWeight: 600, fontSize: 14,
            transition: 'opacity 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}
        >
          <Home size={16} /> Volver al Dashboard
        </button>
      </div>
      {children}
    </div>
  );

  if (activeComponent === 'box') {
    return <ComponentWrapper><Box /></ComponentWrapper>;
  }

  if (activeComponent === 'registros') {
    return <ComponentWrapper><Register /></ComponentWrapper>;
  }

  return <NavigationHome />;
}