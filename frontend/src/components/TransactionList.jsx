import { useState, useEffect } from 'react';
import { transactions } from '../api/api';
import Toast from './Toast';

function fmt(n) {
  return Number(n).toLocaleString('es-CO', { minimumFractionDigits: 3 });
}

export default function TransactionList({ tipo, onBack }) {
  const isGasto = tipo === 'gasto';
  const label   = isGasto ? 'Gastos' : 'Ingresos';

  const [items,    setItems]    = useState([]);
  const [openId,   setOpenId]   = useState(null);   // Ítem con menú abierto
  const [toast,    setToast]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    transactions.getAll(tipo)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tipo]);

  async function handleDelete(id) {
    try {
      await transactions.remove(id);
      setItems(ts => ts.filter(t => t.id !== id));
      setOpenId(null);
    } catch (err) {
      setToast({ text: err.message, type: 'error' });
    }
  }

  function formatDate(d) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}-${m}-${y}`;
  }

  return (
    <div className={`list-page ${isGasto ? 'gastos' : 'ingresos'}`}>
      <button className="btn-back" onClick={onBack}>← Volver</button>

      {toast && (
        <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />
      )}

      <h1 className="page-title" style={{ paddingTop:44, marginBottom:16 }}>{label}</h1>

      {loading && (
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.85rem' }}>Cargando…</p>
      )}

      {!loading && items.length === 0 && (
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>
          No hay {label.toLowerCase()} registrados.
        </p>
      )}

      {items.map((item) => (
        <div key={item.id} className="transaction-item">
          {/* Círculo de color de categoría */}
          <div
            className="item-dot"
            style={{ background: item.categoria_color || '#808080' }}
          />

          {/* Info */}
          <div className="item-info">
            <div className="item-valor">$ {fmt(item.valor)}</div>
            <div className="item-meta">
              <span>{item.comentario || 'sin comentario'}</span>
              <span>{formatDate(item.fecha)}</span>
            </div>
            <div className="item-cat">{item.categoria}</div>
          </div>

          {/* Botón menú (3 rayas) */}
          <button
            className="item-menu-btn"
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            title="Opciones"
          >
            <span /><span /><span />
          </button>

          {/* Botón eliminar (aparece al abrir menú) */}
          {openId === item.id && (
            <button
              className="btn-eliminar"
              onClick={() => handleDelete(item.id)}
            >
              Eliminar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
