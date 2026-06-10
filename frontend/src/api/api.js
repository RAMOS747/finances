// ── Configuración base ────────────────────────────────────────
// En desarrollo usa el proxy de Vite (/api)
// En producción usa la URL del backend en InfinityFree
const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/api';

async function request(method, path, body = null) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(BASE + path, opts);
  const json = await res.json();

  if (!json.ok) {
    throw new Error(json.error || 'Error desconocido');
  }
  return json.data;
}

// ── Auth ──────────────────────────────────────────────────────
export const auth = {
  login:    (usuario, contrasena) => request('POST', '/auth/login.php',    { usuario, contrasena }),
  register: (nombre, contrasena, correo) => request('POST', '/auth/register.php', { nombre, contrasena, correo }),
  logout:   ()               => request('GET',  '/auth/logout.php'),
};

// ── Categorías ────────────────────────────────────────────────
export const categories = {
  getAll:  (tipo) => request('GET',    `/categories/index.php?tipo=${tipo}`),
  create:  (data) => request('POST',   '/categories/index.php', data),
  update:  (id, data) => request('PUT',    `/categories/index.php?id=${id}`, data),
  remove:  (id) => request('DELETE',  `/categories/index.php?id=${id}`),
};

// ── Transacciones ─────────────────────────────────────────────
export const transactions = {
  getAll: (tipo) => request('GET',    `/transactions/index.php?tipo=${tipo}`),
  create: (data) => request('POST',   '/transactions/index.php', data),
  remove: (id)   => request('DELETE', `/transactions/index.php?id=${id}`),
};

// ── Home (resumen semanal) ────────────────────────────────────
export const home = {
  getSummary: () => request('GET', '/home/index.php'),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboard = {
  getData: () => request('GET', '/dashboard/index.php'),
};
