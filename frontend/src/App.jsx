import { useState } from 'react';
import Login           from './components/Login';
import Register        from './components/Register';
import Home            from './components/Home';
import SideMenu        from './components/SideMenu';
import Categories      from './components/Categories';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard       from './components/Dashboard';
import Logo            from './components/Logo';
import { auth }        from './api/api';
import './styles/globals.css';

/*
  Páginas posibles:
  'login' | 'register' | 'home' |
  'categorias-gastos' | 'categorias-ingresos' |
  'registro-gastos'   | 'registro-ingresos'   |
  'lista-gastos'      | 'lista-ingresos'       |
  'dashboard'
*/

export default function App() {
  const [user,         setUser]         = useState(null);
  const [page,         setPage]         = useState('login');
  const [menuOpen,     setMenuOpen]     = useState(false);

  // ── Auth ──────────────────────────────────────────────────────
  function handleLogin(userData) {
    setUser(userData);
    setPage('home');
  }

  async function handleLogout() {
    try { await auth.logout(); } catch (_) {}
    setUser(null);
    setPage('login');
  }

  // ── Pantallas de autenticación ────────────────────────────────
  if (!user) {
    if (page === 'register') {
      return <Register onBack={() => setPage('login')} />;
    }
    return (
      <Login
        onLogin={handleLogin}
        onGoRegister={() => setPage('register')}
      />
    );
  }

  // ── Aplicación principal ──────────────────────────────────────
  // Determina qué componente renderizar según la página actual
  function renderPage() {
    switch (page) {
      case 'home':
        return <Home onNavigate={setPage} />;

      case 'categorias-gastos':
        return <Categories tipo="gasto"   onBack={() => setPage('home')} />;

      case 'categorias-ingresos':
        return <Categories tipo="ingreso" onBack={() => setPage('home')} />;

      case 'registro-gastos':
        return <TransactionForm tipo="gasto"   onBack={() => setPage('home')} />;

      case 'registro-ingresos':
        return <TransactionForm tipo="ingreso" onBack={() => setPage('home')} />;

      case 'lista-gastos':
        return <TransactionList tipo="gasto"   onBack={() => setPage('home')} />;

      case 'lista-ingresos':
        return <TransactionList tipo="ingreso" onBack={() => setPage('home')} />;

      case 'dashboard':
        return <Dashboard onBack={() => setPage('home')} />;

      default:
        return <Home onNavigate={setPage} />;
    }
  }

  return (
    <div className="app-shell">
      {/* Barra lateral (decorativa) */}
      <div className="sidebar" />

      {/* Contenido */}
      <div className="main-content">
        {/* Botón hamburguesa */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Abrir menú"
        >
          <div className="hamburger-lines">
            <span /><span /><span />
          </div>
          <span className="hamburger-label">Menú</span>
        </button>

        {/* Menú desplegable */}
        <SideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={setPage}
        />

        {/* Logo pequeño en home */}
        {page === 'home' && (
          <div style={{
            position:'absolute', bottom:12, left:14,
            display:'flex', flexDirection:'column', alignItems:'center',
            opacity:0.6, zIndex:10,
          }}>
            <Logo size={28} />
          </div>
        )}

        {/* Botón cerrar sesión (visible en home) */}
        {page === 'home' && (
          <button
            onClick={handleLogout}
            style={{
              position:'absolute', top:14, right:14,
              background:'rgba(255,255,255,0.1)', border:'none',
              borderRadius:8, color:'#fff', padding:'5px 10px',
              fontSize:'0.75rem', fontWeight:600, cursor:'pointer',
              zIndex:10,
            }}
          >
            Salir
          </button>
        )}

        {/* Página actual */}
        {renderPage()}
      </div>
    </div>
  );
}
