import { useEffect, useState } from 'react';
import { api, money } from '../../api';
import ProductArt, { TEAM_COLORS } from '../../components/ProductArt';
import Modal from './Modal';
import { PHOTOS } from '../../photos';

const TIPOS = ['cap', 'shirt', 'hoodie', 'car', 'helmet', 'mug', 'key', 'flag'];
const FOTOS = Object.keys(PHOTOS).filter((f) => f.startsWith('/img/productos/'));
const fotoLabel = (f) => f.split('/').pop().replace('.jpg', '').replace(/-/g, ' ');
const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: 5, escuderia: 'BOX BOX', imagen: FOTOS[0], id_categoria: '', id_proveedor: '', activo: 1 };

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api('/productos?todos=1').then(setProductos).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    api('/categorias').then(setCategorias);
    api('/proveedores').then(setProveedores);
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...editing, precio: Number(editing.precio), stock: Number(editing.stock), stock_minimo: Number(editing.stock_minimo) };
    try {
      if (editing.id_producto) await api(`/productos/${editing.id_producto}`, { method: 'PUT', body });
      else await api('/productos', { method: 'POST', body });
      setMsg(editing.id_producto ? 'Producto actualizado' : 'Producto creado');
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (p) => {
    if (!confirm(`¿Dar de baja "${p.nombre}"? Dejará de mostrarse en la tienda.`)) return;
    await api(`/productos/${p.id_producto}`, { method: 'DELETE' }).catch((e) => setError(e.message));
    setMsg('Producto dado de baja');
    load();
  };

  const f = (name) => ({ value: editing[name] ?? '', onChange: (e) => setEditing({ ...editing, [name]: e.target.value }) });

  return (
    <>
      <div className="section-head">
        <h1>Productos</h1>
        <button className="btn" onClick={() => { setError(''); setEditing({ ...VACIO }); }}>+ Nuevo producto</button>
      </div>
      {msg && <p className="alert alert-ok" onClick={() => setMsg('')}>{msg}</p>}
      {error && !editing && <p className="alert alert-error">{error}</p>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id_producto} className={p.activo ? '' : 'row-off'}>
                <td><ProductArt imagen={p.imagen} escuderia={p.escuderia} className="thumb-sm" /></td>
                <td><strong>{p.nombre}</strong><div className="muted small">{p.escuderia} · {p.proveedor}</div></td>
                <td>{p.categoria}</td>
                <td>{money(p.precio)}</td>
                <td className={p.stock <= p.stock_minimo ? 'text-warn' : ''}><b>{p.stock}</b></td>
                <td><span className={`status ${p.activo ? 'status-pagado' : 'status-cancelado'}`}>{p.activo ? 'activo' : 'baja'}</span></td>
                <td className="actions">
                  <button className="btn-link" onClick={() => { setError(''); setEditing({ ...p }); }}>Editar</button>
                  {!!p.activo && <button className="btn-link danger" onClick={() => remove(p)}>Baja</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id_producto ? 'Editar producto' : 'Nuevo producto'} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            <label>Nombre<input className="input" required {...f('nombre')} /></label>
            <label>Descripción<textarea className="input" rows="2" {...f('descripcion')} /></label>
            <div className="row-3">
              <label>Precio<input className="input" type="number" min="1" step="any" required {...f('precio')} /></label>
              <label>Stock<input className="input" type="number" min="0" required {...f('stock')} /></label>
              <label>Stock mínimo<input className="input" type="number" min="0" {...f('stock_minimo')} /></label>
            </div>
            <div className="row-2">
              <label>Categoría
                <select className="input" required {...f('id_categoria')}>
                  <option value="">Elegir…</option>
                  {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </label>
              <label>Proveedor
                <select className="input" required {...f('id_proveedor')}>
                  <option value="">Elegir…</option>
                  {proveedores.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>)}
                </select>
              </label>
            </div>
            <div className="row-2">
              <label>Escudería
                <select className="input" {...f('escuderia')}>
                  {Object.keys(TEAM_COLORS).map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label>Imagen
                <select className="input" {...f('imagen')}>
                  <optgroup label="Fotos">
                    {FOTOS.map((t) => <option key={t} value={t}>{fotoLabel(t)}</option>)}
                  </optgroup>
                  <optgroup label="Ilustraciones">
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                  {editing.imagen && !FOTOS.includes(editing.imagen) && !TIPOS.includes(editing.imagen) && (
                    <option value={editing.imagen}>{editing.imagen}</option>
                  )}
                </select>
              </label>
            </div>
            <label>o URL de una imagen propia
              <input className="input" placeholder="https://… o /img/productos/archivo.jpg" {...f('imagen')} />
            </label>
            <div className="img-preview">
              <ProductArt imagen={editing.imagen} escuderia={editing.escuderia} alt="Vista previa" />
            </div>
            {editing.id_producto && (
              <label className="check">
                <input type="checkbox" checked={!!Number(editing.activo)} onChange={(e) => setEditing({ ...editing, activo: e.target.checked ? 1 : 0 })} />
                Producto activo (visible en la tienda)
              </label>
            )}
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
