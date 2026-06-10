import { useState } from 'react';
import { auth } from '../api/api';

export default function Register({ onBack }) {
  const [nombre,     setNombre]     = useState('');
  const [contrasena, setContrasena] = useState('');
  const [correo,     setCorreo]     = useState('');
  const [msg,        setMsg]        = useState(null);
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre || !contrasena || !correo) return;
    setLoading(true);
    try {
      const res = await auth.register(nombre, contrasena, correo);
      setMsg({ text: res.mensaje, type: 'success' });
      // Redirige al login en 2 s
      setTimeout(onBack, 2000);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
      // El mensaje de correo duplicado desaparece en 3 s
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <input
          className="auth-input"
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          autoComplete="new-password"
        />
        <input
          className="auth-input"
          type="email"
          placeholder="correo-@"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          autoComplete="email"
        />

        {/* Notificación inline */}
        {msg && (
          <div className={`auth-msg ${msg.type}`}>{msg.text}</div>
        )}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Registrando…' : 'Registrar Cuenta'}
        </button>
      </form>
    </div>
  );
}
