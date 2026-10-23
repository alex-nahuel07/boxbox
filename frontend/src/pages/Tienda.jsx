import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';

export default function Tienda() {
  const [params, setParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const categoria = params.get('categoria') || '';
  const q = params.get('q') || '';

  useEffect(() => {
    api('/categorias').then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (categoria) qs.set('categoria', categoria);
    if (q) qs.set('q', q);
    setLoading(true);
    api(`/productos?${qs}`)
      .then((p) => {
        setProductos(p);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [categoria, q]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div className="container page">
      <div className="section-head">
        <h1>Tienda</h1>
        <input
          className="input search"
          type="search"
          placeholder="Buscar producto o escudería…"
          defaultValue={q}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>
      <div className="chips">
        <button className={`chip ${!categoria ? 'active' : ''}`} onClick={() => update('categoria', '')}>
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id_categoria}
            className={`chip ${categoria === String(c.id_categoria) ? 'active' : ''}`}
            onClick={() => update('categoria', String(c.id_categoria))}
          >
            {c.nombre}
          </button>
        ))}
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {!loading && !error && productos.length === 0 && <p className="empty muted">No encontramos productos con ese filtro.</p>}
      <div className="product-grid">
        {productos.map((p) => (
          <ProductCard key={p.id_producto} p={p} />
        ))}
      </div>
    </div>
  );
}
