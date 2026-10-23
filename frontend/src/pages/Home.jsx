import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import { CATEGORY_PHOTOS } from '../photos';

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api('/productos').then((p) => setProductos(p.slice(0, 4))).catch(() => {});
    api('/categorias').then(setCategorias).catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-stripes" aria-hidden="true" />
        <div className="container hero-inner">
          <div>
            <span className="eyebrow eyebrow-light">Temporada 2026</span>
            <h1>
              Entrá a boxes.
              <br />
              <em>Salí con estilo.</em>
            </h1>
            <p className="lead">
              Gorras, remeras, modelos a escala y todo el merch del paddock. Elegí tu escudería y llevá la pasión de la
              Fórmula 1 a la calle.
            </p>
            <div className="hero-cta">
              <Link to="/tienda" className="btn btn-lg">
                Ver la tienda
              </Link>
              <Link to="/marca" className="btn btn-ghost btn-lg">
                Conocé la marca
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <img src="/img/hero.jpg" alt="Monoplaza de Fórmula 1 rojo visto de frente" />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Categorías</h2>
        </div>
        <div className="cat-grid">
          {categorias.map((c) => (
            <Link key={c.id_categoria} to={`/tienda?categoria=${c.id_categoria}`} className="cat-tile"
              style={CATEGORY_PHOTOS[c.nombre] ? { backgroundImage: `linear-gradient(180deg, rgba(14,14,20,.25), rgba(14,14,20,.92)), url(${CATEGORY_PHOTOS[c.nombre]})` } : undefined}>
              <strong>{c.nombre}</strong>
              <span className="muted small">{c.descripcion}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Destacados de la grilla</h2>
          <Link to="/tienda">Ver todo →</Link>
        </div>
        <div className="product-grid">
          {productos.map((p) => (
            <ProductCard key={p.id_producto} p={p} />
          ))}
        </div>
      </section>

      <section className="container section perks">
        <div><strong>Envíos a todo el país</strong><span className="muted">Despachamos en 48 h hábiles</span></div>
        <div><strong>Hasta 12 cuotas</strong><span className="muted">Con todas las tarjetas</span></div>
        <div><strong>Compra protegida</strong><span className="muted">10 días para arrepentirte</span></div>
      </section>
    </>
  );
}
