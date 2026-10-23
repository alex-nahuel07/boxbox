import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fecha, money } from '../api';

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/pedidos/mios').then(setPedidos).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="container page"><p className="alert alert-error">{error}</p></div>;
  if (!pedidos) return <div className="container page">Cargando…</div>;

  return (
    <div className="container page">
      <h1>Mis pedidos</h1>
      {pedidos.length === 0 && (
        <div className="empty">
          <p className="muted">Todavía no hiciste ninguna compra.</p>
          <Link to="/tienda" className="btn">Ir a la tienda</Link>
        </div>
      )}
      <div className="orders">
        {pedidos.map((p) => (
          <div key={p.id_pedido} className="card order">
            <div className="order-head">
              <div>
                <strong>Pedido #{p.id_pedido}</strong>
                <span className="muted small"> · {fecha(p.fecha)}</span>
              </div>
              <span className={`status status-${p.estado}`}>{p.estado}</span>
            </div>
            <ul className="order-items">
              {p.items.map((i) => (
                <li key={i.id_detalle}>
                  <span>{i.cantidad} × {i.nombre}</span>
                  <span>{money(i.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="order-foot">
              <span className="muted small">
                {p.pago && `${p.pago.marca_tarjeta} •••• ${p.pago.ultimos4} · ${p.pago.cuotas} cuota(s)`}
              </span>
              <strong>{money(p.total)}</strong>
            </div>
          </div>
        ))}
      </div>
      <p className="muted small">
        Botón de arrepentimiento (Res. 424/2020): podés solicitar la cancelación de tu compra dentro de los 10 días
        corridos escribiendo a arrepentimiento@boxbox.com con el número de pedido.
      </p>
    </div>
  );
}
