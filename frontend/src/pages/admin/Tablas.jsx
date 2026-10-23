import { useEffect, useState } from 'react';
import { api } from '../../api';
import Modal from './Modal';

// CRUD genérico para tablas simples
function CrudTable({ title, endpoint, pk, columns }) {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api(endpoint).then(setRows).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [endpoint]);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing[pk]) await api(`${endpoint}/${editing[pk]}`, { method: 'PUT', body: editing });
      else await api(endpoint, { method: 'POST', body: editing });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (row) => {
    if (!confirm('¿Eliminar este registro?')) return;
    setError('');
    try {
      await api(`${endpoint}/${row[pk]}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="section-head">
        <h1>{title}</h1>
        <button className="btn" onClick={() => { setError(''); setEditing({}); }}>+ Nuevo</button>
      </div>
      {error && !editing && <p className="alert alert-error">{error}</p>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[pk]}>
                <td className="muted">{r[pk]}</td>
                {columns.map((c) => <td key={c.key}>{r[c.key]}</td>)}
                <td className="actions">
                  <button className="btn-link" onClick={() => { setError(''); setEditing({ ...r }); }}>Editar</button>
                  <button className="btn-link danger" onClick={() => remove(r)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <Modal title={editing[pk] ? `Editar` : `Nuevo registro`} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            {columns.map((c) => (
              <label key={c.key}>
                {c.label}
                <input className="input" required={c.required} type={c.type || 'text'} value={editing[c.key] ?? ''}
                  onChange={(e) => setEditing({ ...editing, [c.key]: e.target.value })} />
              </label>
            ))}
            {error && <p className="alert alert-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

export const AdminCategorias = () => (
  <CrudTable title="Categorías" endpoint="/categorias" pk="id_categoria"
    columns={[{ key: 'nombre', label: 'Nombre', required: true }, { key: 'descripcion', label: 'Descripción' }]} />
);

export const AdminProveedores = () => (
  <CrudTable title="Proveedores" endpoint="/proveedores" pk="id_proveedor"
    columns={[
      { key: 'razon_social', label: 'Razón social', required: true },
      { key: 'cuit', label: 'CUIT', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'telefono', label: 'Teléfono' },
    ]} />
);
