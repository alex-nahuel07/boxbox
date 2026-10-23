import { useEffect, useState } from 'react';
import { api, fecha, money } from '../../api';
import Modal from './Modal';

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/pedidos').then(setPedidos).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const cambiarEstado = async (p, estado) => {
    if (estado === 'cancelado' && !confirm(`¿Cancelar el pedido #${p.id_pedido}? Se devolverá el stock.`)) return;
    setError('');
    try {
      await api(`/pedidos/${p.id_pedido}/estado`, { method: 'PATCH', body: { estado } });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Pedidos</h1>
      {error && <p className="alert alert-error">{error}</p>}
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Unidades</th><th>Total</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id_pedido}>
                <td className="muted">{p.id_pedido}</td>
                <td>{fecha(p.fecha)}</td>
                <td>{p.cliente}<div className="muted small">{p.email}</div></td>
                <td>{p.unidades}</td>
                <td><b>{money(p.total)}</b></td>
                <td>
                  <select className={`input input-sm status-${p.estado}`} value={p.estado} disabled={p.estado === 'cancelado'}
                    onChange={(e) => cambiarEstado(p, e.target.value)}>
                    {ESTADOS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="actions">
                  <button className="btn-link" onClick={() => api(`/pedidos/${p.id_pedido}`).then(setDetalle)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detalle && (
        <Modal title={`Pedido #${detalle.id_pedido}`} onClose={() => setDetalle(null)}>
          <p className="muted small">{detalle.cliente} · {detalle.email} · {fecha(detalle.fecha)}</p>
          <p><b>Envío:</b> {detalle.direccion_envio}</p>
          <ul className="order-items">
            {detalle.items.map((i) => (
              <li key={i.id_detalle}><span>{i.cantidad} × {i.nombre} ({money(i.precio_unitario)})</span><span>{money(i.subtotal)}</span></li>
            ))}
          </ul>
          <div className="sum-row total"><span>Total</span><span>{money(detalle.total)}</span></div>
          {detalle.pago && (
            <p className="muted small">
              Pago {detalle.pago.estado} · {detalle.pago.marca_tarjeta} •••• {detalle.pago.ultimos4} · {detalle.pago.cuotas} cuota(s) ·{' '}
              <code>{detalle.pago.codigo_autorizacion}</code>
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
