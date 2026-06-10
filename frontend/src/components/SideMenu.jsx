// ── Menú lateral desplegable ──────────────────────────────────
export default function SideMenu({ open, onClose, onNavigate }) {

  function go(page) {
    onNavigate(page);
    onClose();
  }

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera */}
      {open && <div className="menu-overlay" onClick={onClose} />}

      <nav className={`side-menu ${open ? 'open' : ''}`}>
        <button onClick={() => go('categorias-gastos')}>
          Categorias Gastos
        </button>
        <button onClick={() => go('categorias-ingresos')}>
          Categorias Ingresos
        </button>
        <button onClick={() => go('dashboard')}>
          Dashboard
        </button>
      </nav>
    </>
  );
}
