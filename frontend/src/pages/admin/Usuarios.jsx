import { useEffect, useState } from 'react';
import { api, fecha } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';

export default function AdminUsuarios() {
  const { user: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [nuevo, setNuevo] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/usuarios').then(setUsuarios).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    api('/usuarios/roles').then(setRoles);
  }, []);

  const update = async (u, changes) => {
    setError('');
    try {
      await api(`/usuarios/${u.id_usuario}`, { method: 'PUT', body: changes });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/usuarios', { method: 'POST', body: nuevo });
      setNuevo(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const f = (name) => ({ value: nuevo[name] ?? '', onChange: (e) => setNuevo({ ...nuevo, [name]: e.target.value }) });

  return (
    <>
      <div className="section-head">
        <h1>Usuarios y permisos</h1>
        <button className="btn" onClick={() => { setError(''); setNuevo({ id_rol: 2 }); }}>+ Nuevo usuario</button>
      </div>
      {error && !nuevo && <p className="alert alert-error">{error}</p>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Usuario</th><th>Alta</th><th>Rol</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const self = u.id_usuario === yo.id_usuario;
              return (
                <tr key={u.id_usuario} className={u.activo ? '' : 'row-off'}>
                  <td className="muted">{u.id_usuario}</td>
                  <td><strong>{u.nombre} {u.apellido}</strong>{self && <span className="muted small"> (vos)</span>}<div className="muted small">{u.email}</div></td>
                  <td>{fecha(u.fecha_alta)}</td>
                  <td>
                    <select className="input input-sm" value={u.id_rol} disabled={self} onChange={(e) => update(u, { id_rol: Number(e.target.value) })}>
                      {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                    </select>
                  </td>
                  <td>
                    <label className="check">
                      <input type="checkbox" checked={!!u.activo} disabled={self} onChange={(e) => update(u, { activo: e.target.checked })} />
                      {u.activo ? 'Activo' : 'Deshabilitado'}
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="card roles-help">
        <h3>Permisos por rol</h3>
        <table className="table">
          <thead><tr><th>Acción</th><th>Cliente</th><th>Empleado</th><th>Admin</th></tr></thead>
          <tbody>
            <tr><td>Comprar y ver sus pedidos</td><td>✓</td><td>✓</td><td>✓</td></tr>
            <tr><td>Dashboard, productos, stock, categorías, proveedores</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Cambiar estado / cancelar pedidos</td><td>—</td><td>✓</td><td>✓</td></tr>
            <tr><td>Gestionar usuarios y roles</td><td>—</td><td>—</td><td>✓</td></tr>
          </tbody>
        </table>
      </div>
      {nuevo && (
        <Modal title="Nuevo usuario" onClose={() => setNuevo(null)}>
          <form className="form" onSubmit={create}>
            <div className="row-2">
              <label>Nombre<input className="input" required {...f('nombre')} /></label>
              <label>Apellido<input className="input" required {...f('apellido')} /></label>
            </div>
            <label>Email<input className="input" type="email" required {...f('email')} /></label>
            <div className="row-2">
              <label>Contraseña<input className="input" type="password" required autoComplete="new-password" {...f('password')} /></label>
              <label>Rol
                <select className="input" {...f('id_rol')}>
                  {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                </select>
              </label>
            </div>
            {error && <p className="alert alert-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setNuevo(null)}>Cancelar</button>
              <button className="btn">Crear</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
