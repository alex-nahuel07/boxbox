import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api';
import ProductArt from '../components/ProductArt';
import { useCart } from '../context/CartContext';
import { PHOTOS } from '../photos';

export function PhotoCredit({ src }) {
  const credit = PHOTOS[src];
  if (!credit) return null;
  const [autor, usuario, id] = credit;
  return (
    <p className="photo-credit">
      Foto: <a href={`https://unsplash.com/@${usuario}`} target="_blank" rel="noreferrer">{autor}</a> en{' '}
      <a href={`https://unsplash.com/photos/${id}`} target="_blank" rel="noreferrer">Unsplash</a>
    </p>
  );
}

export default function Producto() {
  const { id } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  const [cant, setCant] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api(`/productos/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container page empty"><h2>{error}</h2><Link to="/tienda">Volver a la tienda</Link></div>;
  if (!p) return <div className="container page">Cargando…</div>;

  const agotado = p.stock === 0 || !p.activo;
  return (
    <div className="container page">
      <Link to="/tienda" className="muted small">← Volver a la tienda</Link>
      <div className="product-detail">
        <div>
          <div className="detail-media card">
            <ProductArt imagen={p.imagen} escuderia={p.escuderia} alt={p.nombre} />
          </div>
          <PhotoCredit src={p.imagen} />
        </div>
        <div>
          <span className="eyebrow">{p.escuderia} · {p.categoria}</span>
          <h1>{p.nombre}</h1>
          <p className="detail-price">{money(p.precio)}</p>
          <p className="muted small">o 12 cuotas de {money(p.precio / 12)}</p>
          <p>{p.descripcion}</p>
          <p className={p.stock <= p.stock_minimo ? 'text-warn' : 'muted'}>
            {agotado ? 'Sin stock' : `Stock disponible: ${p.stock} unidades`}
          </p>
          {!agotado && (
            <div className="buy-row">
              <div className="qty">
                <button onClick={() => setCant(Math.max(1, cant - 1))} aria-label="Restar">−</button>
                <span>{cant}</span>
                <button onClick={() => setCant(Math.min(p.stock, cant + 1))} aria-label="Sumar">+</button>
              </div>
              <button
                className="btn btn-lg"
                onClick={() => {
                  add(p, cant);
                  setAdded(true);
                }}
              >
                Agregar al carrito
              </button>
            </div>
          )}
          {added && (
            <p className="alert alert-ok">
              Agregado al carrito. <Link to="/carrito">Ir al carrito →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
