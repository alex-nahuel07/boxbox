import { Link, useNavigate } from 'react-router-dom';
import { money } from '../api';
import ProductArt from '../components/ProductArt';
import { useCart } from '../context/CartContext';

export default function Carrito() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0)
    return (
      <div className="container page empty">
        <h2>Tu carrito está vacío</h2>
        <p className="muted">Todavía no entraste a boxes.</p>
        <Link to="/tienda" className="btn">Ir a la tienda</Link>
      </div>
    );

  return (
    <div className="container page">
      <h1>Carrito</h1>
      <div className="checkout-grid">
        <div className="card">
          {items.map((i) => (
            <div key={i.id_producto} className="cart-row">
              <ProductArt imagen={i.imagen} escuderia={i.escuderia} className="thumb" />
              <div className="grow">
                <strong>{i.nombre}</strong>
                <div className="muted small">{money(i.precio)} c/u</div>
              </div>
              <div className="qty">
                <button onClick={() => setQty(i.id_producto, i.cantidad - 1)} aria-label="Restar">−</button>
                <span>{i.cantidad}</span>
                <button onClick={() => setQty(i.id_producto, i.cantidad + 1)} aria-label="Sumar">+</button>
              </div>
              <strong className="cart-sub">{money(i.precio * i.cantidad)}</strong>
              <button className="btn-link danger" onClick={() => remove(i.id_producto)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
        <aside className="card summary">
          <h3>Resumen</h3>
          <div className="sum-row"><span>Subtotal</span><span>{money(total)}</span></div>
          <div className="sum-row"><span>Envío</span><span className="text-ok">Gratis</span></div>
          <div className="sum-row total"><span>Total</span><span>{money(total)}</span></div>
          <button className="btn btn-lg btn-block" onClick={() => navigate('/checkout')}>
            Finalizar compra
          </button>
        </aside>
      </div>
    </div>
  );
}
