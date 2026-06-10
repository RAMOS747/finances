import { useEffect, useState } from 'react';
import { home } from '../api/api';

// Formatea números con punto de miles
function fmt(n) {
  // ✅ sin decimales
return Number(n).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Home({ onNavigate }) {
  const [summary, setSummary] = useState({
    total_gastos:   0,
    total_ingresos: 0,
    disponible:     0,
  });

  useEffect(() => {
    home.getSummary()
      .then(setSummary)
      .catch(() => {}); // silencioso si falla
  }, []);

  return (
    <div className="home-grid">
      {/* ── Panel izquierdo: Gastos + Ingresos ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Gastos */}
        <div className="home-panel gastos" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="home-panel-title"
              onClick={() => onNavigate('lista-gastos')}
              title="Ver gastos"
            >
              Gastos
            </span>
            <button
              className="btn-add-circle"
              onClick={() => onNavigate('registro-gastos')}
              title="Agregar gasto"
            >
              ＋
            </button>
          </div>
          <p className="home-total-label">
            Total Semana = <strong>{fmt(summary.total_gastos)}</strong>
          </p>
        </div>

        {/* Ingresos */}
        <div className="home-panel ingresos" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="home-panel-title"
              onClick={() => onNavigate('lista-ingresos')}
              title="Ver ingresos"
            >
              Ingresos
            </span>
            <button
              className="btn-add-circle"
              onClick={() => onNavigate('registro-ingresos')}
              title="Agregar ingreso"
            >
              ＋
            </button>
          </div>
          <p className="home-total-label">
            Total Semana = <strong>{fmt(summary.total_ingresos)}</strong>
          </p>
        </div>
      </div>

      {/* ── Panel derecho: Dinero Disponible ── */}
      <div className="home-right">
        <p className="disponible-title">Dinero<br />Disponible</p>
        <p className="disponible-amount">$ {fmt(summary.disponible)}</p>
      </div>
    </div>
  );
}
