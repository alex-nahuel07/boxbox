import { Link } from 'react-router-dom';
import ProductArt from './ProductArt';
import { money } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const agotado = p.stock === 0;
  return (
    <article className="card product-card">
      <Link to={`/producto/${p.id_producto}`} className="product-media">
        <ProductArt imagen={p.imagen} escuderia={p.escuderia} alt={p.nombre} />
        {p.stock > 0 && p.stock <= p.stock_minimo && <span className="badge badge-warn">Últimas unidades</span>}
        {agotado && <span className="badge badge-off">Agotado</span>}
      </Link>
      <div className="product-body">
        <span className="eyebrow">{p.escuderia}</span>
        <Link to={`/producto/${p.id_producto}`} className="product-name">
          {p.nombre}
        </Link>
        <div className="product-foot">
          <strong className="price">{money(p.precio)}</strong>
          <button className="btn btn-sm" disabled={agotado} onClick={() => add(p)}>
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
