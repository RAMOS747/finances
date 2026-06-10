import { useState, useEffect } from 'react';
import Toast from './Toast';
import { categories, transactions } from '../api/api';

export default function TransactionForm({ tipo, onBack }) {
  const isGasto = tipo === 'gasto';
  const label   = isGasto ? 'Gastos' : 'Ingresos';

  const [cats,       setCats]       = useState([]);
  const [catSelId,   setCatSelId]   = useState(null);
  const [valor,      setValor]      = useState('');
  const [fecha,      setFecha]      = useState('');
  const [comentario, setComentario] = useState('');
  const [toast,      setToast]      = useState(null);
  const [loading,    setLoading]    = useState(false);

  // Cargar categorías del tipo correspondiente
  useEffect(() => {
    categories.getAll(tipo).then(setCats).catch(console.error);
  }, [tipo]);

  function showToast(text, type = 'error') {
    setToast({ text, type });
  }

  // Validación: valor, fecha y categoría son obligatorios
  const canSave = valor && parseFloat(valor) > 0 && fecha && catSelId;

  async function handleSave(e) {
    e.preventDefault();
    if (!canSave) return;
    setLoading(true);
    try {
      await transactions.create({
        categoria_id: catSelId,
        valor:        parseFloat(valor),
        fecha,
        comentario:   comentario.trim(),
        tipo,
      });
      showToast('Guardado exitosamente', 'success');
      // Limpia formulario
      setValor('');
      setFecha('');
      setComentario('');
      setCatSelId(null);
      setTimeout(onBack, 1500);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Abre el selector de fecha nativo del navegador
  function openDatePicker() {
    document.getElementById('tx-date-input').showPicker?.();
    document.getElementById('tx-date-input').focus();
  }

  // Formatea fecha de YYYY-MM-DD a DD-MM-YYYY
  function displayDate(d) {
    if (!d) return 'Dia-Mes-Año';
    const [y, m, day] = d.split('-');
    return `${day}-${m}-${y}`;
  }

  return (
    <div className={`transaction-page ${isGasto ? 'gastos' : 'ingresos'}`}>
      <button className="btn-back" onClick={onBack}>← Volver</button>

      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Encabezado + fecha */}
      <div className="transaction-header">
        <h1 className="transaction-title">{label}</h1>
        <div className="date-row">
          <button className="btn-calendar" type="button" onClick={openDatePicker}>
            Abrir calendario
          </button>
          <span className="date-display">{displayDate(fecha)}</span>
          {/* Input oculto de fecha */}
          <input
            id="tx-date-input"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{ position:'absolute', opacity:0, pointerEvents:'none', width:0 }}
          />
        </div>
      </div>

      {/* Valor */}
      <input
        className="value-input"
        type="number"
        min="0"
        step="0.001"
        placeholder="$ Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      {/* Categorías */}
      <p className="section-label">Categorias</p>
      <div className="categories-grid">
        {cats.map((cat) => (
          <div
            key={cat.id}
            className={`cat-slot ${catSelId === cat.id ? 'selected' : ''}`}
            onClick={() => setCatSelId(cat.id)}
            title={cat.nombre}
          >
            <div
              className="cat-circle"
              style={{
                background:  cat.color,
                border: catSelId === cat.id ? '3px solid #fff' : 'none',
              }}
            />
            <span className="cat-name">{cat.nombre}</span>
          </div>
        ))}
        {/* Slots vacíos hasta 6 */}
        {Array(Math.max(0, 6 - cats.length)).fill(null).map((_, i) => (
          <div key={`e${i}`} className="cat-slot empty">
            <div className="cat-circle" style={{ background:'rgba(255,255,255,0.12)' }} />
          </div>
        ))}
      </div>

      {cats.length === 0 && (
        <p style={{ fontSize:'1.7rem', color:'rgba(255, 255, 255, 0.84)', marginTop:30 }}>
          No hay categorías. Crea una desde el menú = Categorías de {label}.
        </p>
      )}

      {/* Comentarios + Guardar */}
      <form onSubmit={handleSave}>
        <textarea
          className="comment-area"
          placeholder="Comentarios:"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
        />
        <div className="save-row">
          <button
            className="btn-save"
            type="submit"
            disabled={!canSave || loading}
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
