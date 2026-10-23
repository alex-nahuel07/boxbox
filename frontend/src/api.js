// Cliente HTTP de la API. El token JWT se guarda en localStorage y se envía en cada pedido.
const TOKEN_KEY = 'boxbox_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo la API?');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Ocurrió un error inesperado');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const money = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);

export const fecha = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
