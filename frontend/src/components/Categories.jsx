import { useState, useEffect, useRef } from 'react';
import Toast from './Toast';
import { categories } from '../api/api';

const MAX_CATS = 8;
const EMPTY    = Array(MAX_CATS).fill(null);

export default function Categories({ tipo, onBack }) {
  const isGasto = tipo === 'gasto';
  const label   = isGasto ? 'Gastos' : 'Ingresos';

  const [cats,       setCats]       = useState([]);
  const [nombre,     setNombre]     = useState('');
  const [color,      setColor]      = useState('#d51db3');
  const [toast,      setToast]      = useState(null);
  const [mode,       setMode]       = useState('idle'); // 'idle'|'edit'|'delete'
  const [editId,     setEditId]     = useState(null);
  const [dropdown,   setDropdown]   = useState(false);
  const [loading,    setLoading]    = useState(false);

  const colorRef = useRef(null);

  // Carga categorías al montar
  useEffect(() => {
    categories.getAll(tipo).then(setCats).catch(console.error);
  }, [tipo]);

  // Slots: categorías + espacios vacíos hasta MAX_CATS
  const slots = [...cats, ...EMPTY].slice(0, MAX_CATS);

  function showToast(text, type = 'error', duration = 4000) {
    setToast({ text, type, duration });
  }

  // ── Crear / Actualizar categoría ─────────────────────────────
  async function handleCreate(e) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      if (mode === 'edit' && editId) {
        // Actualizar
        const updated = await categories.update(editId, { nombre: nombre.trim(), color, tipo });
        setCats(cs => cs.map(c => c.id === editId ? { ...c, ...updated } : c));
        showToast('Categoría actualizada', 'success', 2500);
      } else {
        // Crear
        const created = await categories.create({ nombre: nombre.trim(), color, tipo });
        setCats(cs => [...cs, created]);
        showToast('Categoría creada', 'success', 2500);
      }
      setNombre('');
      setColor('#d51db3');
      setMode('idle');
      setEditId(null);
    } catch (err) {
      showToast(err.message, 'error', 4000);
    } finally {
      setLoading(false);
    }
  }

  // ── Clic en categoría (según modo) ───────────────────────────
  function handleCatClick(cat) {
    if (!cat) return;

    if (mode === 'edit') {
      setNombre(cat.nombre);
      setColor(cat.color);
      setEditId(cat.id);
      return;
    }

    if (mode === 'delete') {
      handleDelete(cat);
    }
  }

  async function handleDelete(cat) {
    try {
      await categories.remove(cat.id);
      setCats(cs => cs.filter(c => c.id !== cat.id));
      showToast('Se eliminaran datos asociados a la categoría.', 'warning', 4000);
      setMode('idle');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ── Opciones del dropdown ────────────────────────────────────
  function startEdit()   { setMode('edit');   setDropdown(false); showToast('Selecciona la categoria a editar.', 'warning', 5000); }
  function startDelete() { setMode('delete'); setDropdown(false); showToast('Selecciona la categoria a eliminar.', 'warning', 5000); }

  return (
    <div className={`categories-page ${isGasto ? 'gastos' : 'ingresos'}`}>
      {/* Botón volver */}
      <button className="btn-back" onClick={onBack}>← Volver</button>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      {/* Encabezado */}
      <div className="page-header" style={{ paddingTop: 40 }}>
        <h1 className="page-title">Categorías de {label}</h1>

        {/* Menú editar/eliminar */}
        <div className="options-menu">
          <button
            style={{ background:'none', border:'none', cursor:'pointer' }}
            onClick={() => setDropdown(d => !d)}
            title="Opciones"
          >
            <span style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display:'block', width:20, height:2, background:'#ffffff', borderRadius:2 }} />
              ))}
            </span>
          </button>

          {dropdown && (
            <div className="options-dropdown">
              <button onClick={startEdit}>Editar</button>
              <button className="danger" onClick={startDelete}>Eliminar</button>
            </div>
          )}
        </div>
      </div>

      {/* Formulario crear/editar */}
      <form className="category-form" onSubmit={handleCreate}>
        <input
          className="cat-input"
          placeholder="Nombre de Categoria"
          maxLength={15}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        {/* Color picker */}
        <label style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(213, 29, 179, 0.7)', fontSize:'1.5rem', cursor:'pointer' }}>
          Color
          <input
            ref={colorRef}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ cursor:'pointer' }}
          />
        </label>

        <button
          className="btn-crear"
          type="submit"
          disabled={loading || !nombre.trim() || cats.length >= MAX_CATS}
        >
          {mode === 'edit' ? 'Guardar' : 'Crear Categoria'}
        </button>
      </form>

      {/* Grid de categorías */}
      <div className="categories-grid">
        {slots.map((cat, idx) => (
          <div
            key={cat ? cat.id : `empty-${idx}`}
            className={`cat-slot ${cat ? '' : 'empty'} ${editId === cat?.id ? 'selected' : ''}`}
            onClick={() => cat && handleCatClick(cat)}
            title={cat ? cat.nombre : ''}
          >
            <div
              className="cat-circle"
              style={{ background: cat ? cat.color : undefined }}
            />
            {cat && <span className="cat-name">{cat.nombre}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
