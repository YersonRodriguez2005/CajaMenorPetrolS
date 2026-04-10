import React, { useState, useEffect } from 'react';
import { Download, Edit, Trash2, Save, X, TrendingDown, TrendingUp, Banknote, Coins, Package, Receipt, FileCheck } from 'lucide-react';

const FONDO_INICIAL = 4000000;

const formatearPesos = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);

const denominacionesBilletes = [100000, 50000, 20000, 10000, 5000, 2000, 1000];
const denominacionesMonedas = [1000, 500, 200, 100, 50];
const tiposEncomienda = [{ valor: 18000, label: '$18.000' }, { valor: 11000, label: '$11.000' }];

const tabs = [
  { id: 'billetes', label: 'Billetes', icon: Banknote, color: '#10b981' },
  { id: 'monedas', label: 'Monedas', icon: Coins, color: '#f59e0b' },
  { id: 'encomiendas', label: 'Encomiendas', icon: Package, color: '#6366f1' },
  { id: 'facturas', label: 'Facturas', icon: Receipt, color: '#ef4444' },
  { id: 'vales', label: 'Vales', icon: FileCheck, color: '#f97316' },
];

export default function CajaMenorControl() {
  const [contadorTotal, setContadorTotal] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [editandoValores, setEditandoValores] = useState({});
  const [activeTab, setActiveTab] = useState('billetes');
  const [cantidadBilletes, setCantidadBilletes] = useState({});
  const [cantidadMonedas, setCantidadMonedas] = useState({});
  const [encomiendas, setEncomiendas] = useState({ tipo: '18000', cantidad: 0 });
  const [factura, setFactura] = useState({ concepto: '', valor: 0 });
  const [vale, setVale] = useState({ concepto: '', valor: 0 });

  useEffect(() => {
    const d = localStorage.getItem('cajaMenorData');
    if (d) {
      const datos = JSON.parse(d);
      setContadorTotal(datos.contadorTotal || 0);
      setHistorial(datos.historial || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cajaMenorData', JSON.stringify({ contadorTotal, historial }));
  }, [contadorTotal, historial]);

  // Se añade el parámetro "desglose" para guardar las cantidades exactas
  const agregarMovimiento = (tipo, detalle, valor, desglose = null) => {
    const m = { id: Date.now(), fecha: new Date().toLocaleString('es-CO'), tipo, detalle, valor, desglose };
    setHistorial(prev => [m, ...prev]);
    setContadorTotal(prev => prev + (tipo === 'ingreso' ? valor : -valor));
  };

  const guardarEdicion = (id) => {
    const original = historial.find(m => m.id === id);
    const nuevoValor = Number(editandoValores.valor);
    const diferencia = nuevoValor - original.valor;

    let nuevoDetalle = editandoValores.detalle;
    
    // Si la edición fue de billetes/monedas (tiene desglose), reconstruimos el texto automáticamente
    if (editandoValores.desglose) {
      let items = [];
      Object.entries(editandoValores.desglose).forEach(([d, c]) => {
        if (c > 0) items.push(`${c} × ${formatearPesos(+d)}`);
      });
      const prefix = original.detalle.split(':')[0] + ': ';
      nuevoDetalle = items.length > 0 ? prefix + items.join(', ') : prefix + '0';
    }

    setHistorial(prev => prev.map(m => m.id === id ? { ...m, detalle: nuevoDetalle, valor: nuevoValor, desglose: editandoValores.desglose } : m));
    setContadorTotal(prev => prev + (original.tipo === 'ingreso' ? diferencia : -diferencia));
    setEditandoId(null);
  };

  const eliminarMovimiento = (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    const m = historial.find(x => x.id === id);
    setHistorial(prev => prev.filter(x => x.id !== id));
    setContadorTotal(prev => prev + (m.tipo === 'ingreso' ? -m.valor : m.valor));
  };

  const registrarBilletes = () => {
    let total = 0; let items = []; let desglose = {};
    Object.entries(cantidadBilletes).forEach(([d, c]) => { 
      if (c > 0) { 
        total += +d * c; 
        items.push(`${c} × ${formatearPesos(+d)}`); 
        desglose[d] = c; // Guardamos la cantidad exacta de esta denominación
      } 
    });
    if (total > 0) { agregarMovimiento('ingreso', 'Billetes: ' + items.join(', '), total, desglose); setCantidadBilletes({}); }
  };

  const registrarMonedas = () => {
    let total = 0; let items = []; let desglose = {};
    Object.entries(cantidadMonedas).forEach(([d, c]) => { 
      if (c > 0) { 
        total += +d * c; 
        items.push(`${c} × ${formatearPesos(+d)}`); 
        desglose[d] = c; // Guardamos la cantidad exacta de esta denominación
      } 
    });
    if (total > 0) { agregarMovimiento('ingreso', 'Monedas: ' + items.join(', '), total, desglose); setCantidadMonedas({}); }
  };

  const registrarEncomienda = () => {
    if (encomiendas.cantidad > 0) {
      const val = +encomiendas.tipo * encomiendas.cantidad;
      agregarMovimiento('ingreso', `Encomiendas: ${encomiendas.cantidad} × ${formatearPesos(+encomiendas.tipo)}`, val);
      setEncomiendas({ tipo: '18000', cantidad: 0 });
    }
  };

  const registrarFactura = () => {
    if (factura.concepto && factura.valor > 0) {
      agregarMovimiento('egreso', `Factura: ${factura.concepto}`, factura.valor);
      setFactura({ concepto: '', valor: 0 });
    }
  };

  const registrarVale = () => {
    if (vale.concepto && vale.valor > 0) {
      agregarMovimiento('egreso', `Vale: ${vale.concepto}`, vale.valor);
      setVale({ concepto: '', valor: 0 });
    }
  };

  const generarPDF = (categoria = 'todos') => {
    const filtrados = categoria === 'todos' ? historial : historial.filter(m => m.detalle.toLowerCase().includes(categoria));
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reporte Caja Menor</title>
    <style>body{font-family: 'Inter', sans-serif;margin:40px;color:#1a1a2e}h1{color:#1a1a2e;border-bottom:3px solid #c8a96e;padding-bottom:10px}
    .summary{background:#f8f4ee;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #c8a96e}
    table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1a1a2e;color:#c8a96e;padding:10px;text-align:left}
    td{padding:8px 10px;border-bottom:1px solid #e0d5c5}.ingreso{color:#059669}.egreso{color:#dc2626}
    .total{font-weight:bold;background:#f8f4ee}</style></head><body>
    <h1>Reporte de Caja Menor — ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h1>
    <div class="summary">
      <p><strong>Fondo Inicial:</strong> ${formatearPesos(FONDO_INICIAL)}</p>
      <p><strong>Saldo Actual:</strong> ${formatearPesos(FONDO_INICIAL + contadorTotal)}</p>
      <p><strong>Generado:</strong> ${new Date().toLocaleString('es-CO')}</p>
    </div>
    <table><thead><tr><th>Fecha</th><th>Tipo</th><th>Detalle</th><th>Valor</th></tr></thead><tbody>
    ${filtrados.map(m => `<tr><td>${m.fecha}</td><td class="${m.tipo}">${m.tipo.toUpperCase()}</td><td>${m.detalle}</td>
    <td class="${m.tipo}">${m.tipo === 'ingreso' ? '+' : '-'}${formatearPesos(m.valor)}</td></tr>`).join('')}
    <tr class="total"><td colspan="3">TOTAL</td><td>${formatearPesos(filtrados.reduce((s, m) => s + m.valor, 0))}</td></tr>
    </tbody></table></body></html>`;
    const w = window.open('', '', 'height=600,width=800');
    w.document.write(html); w.document.close(); w.focus();
    setTimeout(() => { w.print(); w.close(); }, 250);
  };

  const saldoActual = contadorTotal;
  const porcentaje = Math.max(0, Math.min(100, (saldoActual / FONDO_INICIAL) * 100));
  const activeTabData = tabs.find(t => t.id === activeTab);

  const resetearDatos = () => {
    if (!window.confirm('¿Resetear todos los datos? Esta acción no se puede deshacer.')) return;
    setContadorTotal(0); setHistorial([]); setCantidadBilletes({}); setCantidadMonedas({});
    setEncomiendas({ tipo: '18000', cantidad: 0 }); setFactura({ concepto: '', valor: 0 }); setVale({ concepto: '', valor: 0 });
    localStorage.removeItem('cajaMenorData');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f1eb', padding: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');
        .caja-root { font-family: 'Inter', sans-serif; }
        .caja-heading { font-family: 'Inter', sans-serif; }
        .tab-btn { transition: all 0.3s ease; border: none; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab-btn:hover { background: rgba(0,0,0,0.02); }
        .card { background: #fff; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05); }
        .action-btn { border: none; cursor: pointer; border-radius: 12px; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .input-field { width: 100%; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 14px; background: #f8fafc; color: #1a1a2e; transition: all 0.2s; box-sizing: border-box; }
        .input-field:focus { outline: none; border-color: #c8a96e; background: #fff; }
        .hist-item { border-radius: 12px; padding: 16px; margin-bottom: 12px; transition: all 0.2s; border: 1px solid transparent; }
        .hist-item:hover { transform: scale(1.01); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .progress-bar { height: 12px; border-radius: 99px; background: #f1f5f9; overflow: hidden; border: 1px solid rgba(0,0,0,0.03); }
        .progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
        select.input-field { cursor: pointer; }
      `}</style>
      <div className="caja-root" style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div className="card" style={{ padding: '32px', marginBottom: 24 }}>
          <h1 className="caja-heading" style={{ color: '#1a1a2e', fontSize: 28, margin: '0 0 6px', fontWeight: 800 }}>Control de Caja Menor</h1>
          <p style={{ color: '#64748b', fontSize: 15, margin: '0 0 32px' }}>Balance de fondo autorizado: <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{formatearPesos(FONDO_INICIAL)}</span></p>

          <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '32px', marginBottom: 24, boxShadow: '0 20px 25px -5px rgba(26,26,46,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <p style={{ color: '#c8a96e', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>Saldo Disponible</p>
                <p className="caja-heading" style={{ color: '#fff', fontSize: 42, margin: 0, lineHeight: 1, fontWeight: 700 }}>{formatearPesos(saldoActual)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 2px' }}>del fondo inicial</p>
                <p style={{ color: porcentaje > 50 ? '#10b981' : porcentaje > 25 ? '#f59e0b' : '#ef4444', fontSize: 22, fontWeight: 700, margin: 0 }}>
                  {porcentaje.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${porcentaje}%`,
                background: porcentaje > 50 ? 'linear-gradient(90deg,#059669,#10b981)' : porcentaje > 25 ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'linear-gradient(90deg,#dc2626,#ef4444)'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Fondo Inicial', value: formatearPesos(FONDO_INICIAL), color: '#c8a96e', bg: '#faf8f4' },
              { label: 'Saldo Actual', value: formatearPesos(saldoActual), color: saldoActual >= 2000000 ? '#059669' : saldoActual >= 1000000 ? '#d97706' : '#dc2626', bg: '#f8f4ee', bold: true },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, borderRadius: 10, padding: '14px 16px', border: '1.5px solid #e2d9c8' }}>
                <p style={{ color: '#7c6f5a', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 4px' }}>{c.label}</p>
                <p style={{ color: c.color, fontSize: 18, fontWeight: c.bold ? 700 : 600, margin: 0 }}>{c.prefix || ''}{c.value}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1.5px solid #e2d9c8', paddingTop: 16 }}>
            <p style={{ color: '#7c6f5a', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 10px' }}>Descargar Reportes</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'Todos', cat: 'todos', color: '#1a1a2e' },
                { label: 'Billetes', cat: 'billetes', color: '#10b981' },
                { label: 'Monedas', cat: 'monedas', color: '#f59e0b' },
                { label: 'Encomiendas', cat: 'encomiendas', color: '#6366f1' },
                { label: 'Facturas', cat: 'facturas', color: '#ef4444' },
                { label: 'Vales', cat: 'vales', color: '#f97316' },
              ].map(btn => (
                <button key={btn.cat} className="action-btn" onClick={() => generarPDF(btn.cat)}
                  style={{ background: btn.color, color: '#fff', padding: '7px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Download size={14} /> {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>

          {/* ── Panel de Registro ── */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1.5px solid #e2d9c8', overflowX: 'auto' }}>
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '14px 18px', fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3',sans-serif",
                      background: active ? '#fff' : '#faf8f4',
                      color: active ? tab.color : '#9ca3af',
                      borderBottom: active ? `3px solid ${tab.color}` : '3px solid transparent',
                      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    <Icon size={15} />{tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: 24 }}>
              <p className="caja-heading" style={{ fontSize: 18, color: '#1a1a2e', margin: '0 0 20px' }}>
                Registrar — {activeTabData?.label}
              </p>

              {activeTab === 'billetes' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                    {denominacionesBilletes.map(d => (
                      <div key={d} style={{ background: '#faf8f4', borderRadius: 10, padding: '10px 12px', border: '1.5px solid #e2d9c8' }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#7c6f5a', marginBottom: 4, fontWeight: 600 }}>{formatearPesos(d)}</label>
                        <input type="number" min="0" placeholder="0" className="input-field"
                          value={cantidadBilletes[d] || ''} style={{ marginTop: 0 }}
                          onChange={e => setCantidadBilletes(p => ({ ...p, [d]: +e.target.value || 0 }))} />
                        {(cantidadBilletes[d] > 0) && (
                          <p style={{ fontSize: 11, color: '#10b981', margin: '4px 0 0', fontWeight: 600 }}>= {formatearPesos(d * cantidadBilletes[d])}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="action-btn" onClick={registrarBilletes}
                    style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff' }}>
                    + Registrar Billetes
                  </button>
                </div>
              )}

              {activeTab === 'monedas' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
                    {denominacionesMonedas.map(d => (
                      <div key={d} style={{ background: '#faf8f4', borderRadius: 10, padding: '10px 12px', border: '1.5px solid #e2d9c8' }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#7c6f5a', marginBottom: 4, fontWeight: 600 }}>{formatearPesos(d)}</label>
                        <input type="number" min="0" placeholder="0" className="input-field"
                          value={cantidadMonedas[d] || ''}
                          onChange={e => setCantidadMonedas(p => ({ ...p, [d]: +e.target.value || 0 }))} />
                        {(cantidadMonedas[d] > 0) && (
                          <p style={{ fontSize: 11, color: '#f59e0b', margin: '4px 0 0', fontWeight: 600 }}>= {formatearPesos(d * cantidadMonedas[d])}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="action-btn" onClick={registrarMonedas}
                    style={{ width: '100%', padding: '12px', background: '#f59e0b', color: '#fff' }}>
                    + Registrar Monedas
                  </button>
                </div>
              )}

              {activeTab === 'encomiendas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#7c6f5a', marginBottom: 6, fontWeight: 600 }}>Tipo de Encomienda</label>
                    <select className="input-field" value={encomiendas.tipo} onChange={e => setEncomiendas(p => ({ ...p, tipo: e.target.value }))}>
                      {tiposEncomienda.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#7c6f5a', marginBottom: 6, fontWeight: 600 }}>Cantidad</label>
                    <input type="number" min="0" placeholder="0" className="input-field"
                      value={encomiendas.cantidad || ''}
                      onChange={e => setEncomiendas(p => ({ ...p, cantidad: +e.target.value || 0 }))} />
                  </div>
                  {encomiendas.cantidad > 0 && (
                    <div style={{ background: '#eef2ff', borderRadius: 10, padding: '12px 16px', border: '1.5px solid #c7d2fe' }}>
                      <p style={{ color: '#4338ca', fontWeight: 700, margin: 0 }}>Total: {formatearPesos(+encomiendas.tipo * encomiendas.cantidad)}</p>
                    </div>
                  )}
                  <button className="action-btn" onClick={registrarEncomienda}
                    style={{ width: '100%', padding: '12px', background: '#6366f1', color: '#fff' }}>
                    + Registrar Encomienda
                  </button>
                </div>
              )}

              {activeTab === 'facturas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#7c6f5a', marginBottom: 6, fontWeight: 600 }}>Concepto</label>
                    <input type="text" placeholder="Descripción del gasto" className="input-field"
                      value={factura.concepto} onChange={e => setFactura(p => ({ ...p, concepto: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#7c6f5a', marginBottom: 6, fontWeight: 600 }}>Valor</label>
                    <input type="number" min="0" placeholder="0" className="input-field"
                      value={factura.valor || ''} onChange={e => setFactura(p => ({ ...p, valor: +e.target.value || 0 }))} />
                  </div>
                  <button className="action-btn" onClick={registrarFactura}
                    style={{ width: '100%', padding: '12px', background: '#ef4444', color: '#fff' }}>
                    − Registrar Factura (Egreso)
                  </button>
                </div>
              )}

              {activeTab === 'vales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#7c6f5a', marginBottom: 6, fontWeight: 600 }}>Concepto</label>
                    <input type="text" placeholder="Descripción del vale" className="input-field"
                      value={vale.concepto} onChange={e => setVale(p => ({ ...p, concepto: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: '#7c6f5a', marginBottom: 6, fontWeight: 600 }}>Valor</label>
                    <input type="number" min="0" placeholder="0" className="input-field"
                      value={vale.valor || ''} onChange={e => setVale(p => ({ ...p, valor: +e.target.value || 0 }))} />
                  </div>
                  <button className="action-btn" onClick={registrarVale}
                    style={{ width: '100%', padding: '12px', background: '#f97316', color: '#fff' }}>
                    − Registrar Vale (Egreso)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Historial ── */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', maxHeight: 640 }}>
            <div style={{ padding: '20px 20px 14px', borderBottom: '1.5px solid #e2d9c8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="caja-heading" style={{ fontSize: 17, color: '#1a1a2e', margin: 0 }}>Historial</p>
              <button className="action-btn" onClick={resetearDatos}
                style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 12px', fontSize: 12 }}>
                Resetear Todo
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: 16, flex: 1 }}>
              {historial.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                  <p style={{ fontSize: 14 }}>Sin movimientos registrados</p>
                </div>
              ) : historial.map(m => (
                <div key={m.id} className="hist-item" style={{
                  background: m.tipo === 'ingreso' ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${m.tipo === 'ingreso' ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  {editandoId === m.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      
                      {/* LÓGICA DE EDICIÓN CONDICIONAL */}
                      {editandoValores.desglose ? (
                        // Si el registro tiene desglose (es billetes/monedas múltiples), mostramos cada denominación
                        <div style={{ background: '#fff', borderRadius: 8, padding: '10px', border: '1px solid #e2d9c8' }}>
                          <p style={{ fontSize: 12, color: '#7c6f5a', fontWeight: 600, margin: '0 0 8px' }}>Editar Cantidades:</p>
                          {Object.entries(editandoValores.desglose).map(([denominacion, cantidad]) => (
                            <div key={denominacion} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, color: '#1a1a2e', width: '70px' }}>{formatearPesos(denominacion)}</span>
                              <span style={{ fontSize: 12, color: '#9ca3af' }}>x</span>
                              <input type="number" min="0" className="input-field" style={{ padding: '6px', flex: 1 }}
                                value={cantidad}
                                onChange={(e) => {
                                  const nuevaCantidad = parseInt(e.target.value) || 0;
                                  setEditandoValores(prev => {
                                    const nuevoDesglose = { ...prev.desglose, [denominacion]: nuevaCantidad };
                                    
                                    // Recalculamos el total automáticamente iterando sobre todas las monedas/billetes
                                    let nuevoTotal = 0;
                                    Object.entries(nuevoDesglose).forEach(([d, c]) => { nuevoTotal += Number(d) * c; });
                                    
                                    return { ...prev, desglose: nuevoDesglose, valor: nuevoTotal };
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Si NO tiene desglose (Facturas, Vales, Encomiendas o registros viejos), mostramos la edición simple
                        <>
                          <input className="input-field" value={editandoValores.detalle} placeholder="Detalle del registro"
                            onChange={e => setEditandoValores(p => ({ ...p, detalle: e.target.value }))} />
                          <input type="number" className="input-field" value={editandoValores.valor} placeholder="Valor"
                            onChange={e => setEditandoValores(p => ({ ...p, valor: +e.target.value || 0 }))} />
                        </>
                      )}

                      {/* Muestra visual del Total Calculado */}
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', textAlign: 'right', padding: '4px 0' }}>
                        Total recalculado: {formatearPesos(editandoValores.valor || 0)}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="action-btn" onClick={() => guardarEdicion(m.id)}
                          style={{ flex: 1, padding: '6px', background: '#10b981', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <Save size={12} /> Guardar
                        </button>
                        <button className="action-btn" onClick={() => setEditandoId(null)}
                          style={{ flex: 1, padding: '6px', background: '#6b7280', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <X size={12} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {m.tipo === 'ingreso'
                            ? <TrendingUp size={13} color="#10b981" />
                            : <TrendingDown size={13} color="#ef4444" />}
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.detalle}
                          </p>
                        </div>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{m.fecha}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: m.tipo === 'ingreso' ? '#059669' : '#dc2626' }}>
                          {m.tipo === 'ingreso' ? '+' : '-'}{formatearPesos(m.valor)}
                        </span>
                        <button onClick={() => {
                          setEditandoId(m.id);
                          // Al editar, copiamos todo (incluyendo el nuevo desglose si existe)
                          setEditandoValores({
                            detalle: m.detalle,
                            valor: m.valor,
                            desglose: m.desglose ? { ...m.desglose } : null
                          });
                        }}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6366f1', padding: 3 }}>
                          <Edit size={13} />
                        </button>
                        <button onClick={() => eliminarMovimiento(m.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: 3 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}