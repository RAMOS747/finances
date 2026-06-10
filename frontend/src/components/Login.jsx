import { useState } from 'react';
import Logo  from './Logo';
import Toast from './Toast';
import { auth } from '../api/api';

export default function Login({ onLogin, onGoRegister }) {
  const [usuario,    setUsuario]    = useState('');
  const [contrasena, setContrasena] = useState('');
  const [msg,        setMsg]        = useState(null);   // { text, type }
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!usuario || !contrasena) return;
    setLoading(true);
    try {
      const user = await auth.login(usuario, contrasena);
      // Mensaje de bienvenida → redirige en 2 s
      setMsg({ text: 'Bienvenido a Finances', type: 'success' });
      setTimeout(() => onLogin(user), 2000);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        {/* Logo */}
        <div className="logo-wrap">
          <Logo size={58} />
          <span className="logo-text">FINANCES</span>
        </div>

        {/* Campos */}
        <input
          className="auth-input"
          type="text"
          placeholder="usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          autoComplete="current-password"
        />

        {/* Notificación inline */}
        {msg && (
          <div className={`auth-msg ${msg.type}`}>{msg.text}</div>
        )}

        {/* Botón iniciar */}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Verificando…' : 'Iniciar Sesion'}
        </button>

        <hr className="auth-divider" />

        {/* Botón registrarse */}
        <button
          className="btn-secondary"
          type="button"
          onClick={onGoRegister}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
