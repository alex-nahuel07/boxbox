import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, isStaff, logout } = useAuth();
  const { count } = useCart();
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" aria-label="Inicio">
          <Logo />
        </Link>
        <nav className="nav-links">
          <NavLink to="/tienda">Tienda</NavLink>
          <NavLink to="/marca">La marca</NavLink>
          {user && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
          {isStaff && <NavLink to="/admin">Panel</NavLink>}
        </nav>
        <div className="nav-actions">
          <Link to="/carrito" className="cart-btn" aria-label="Carrito">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
              <circle cx="10" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          {user ? (
            <div className="user-chip">
              <span>
                {user.nombre} <small>{user.rol}</small>
              </span>
              <button className="btn-link" onClick={logout}>
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="kerb" />
      <div className="container footer-inner">
        <div>
          <Logo size={28} />
          <p className="muted">Merch de motorsport para fanáticos de la Fórmula 1. Proyecto educativo — Escuela Gareis.</p>
        </div>
        <div className="muted small">
          <p>Defensa del Consumidor · Ley 24.240</p>
          <p>
            <Link to="/mis-pedidos">Botón de arrepentimiento</Link>
          </p>
          <p>
            Fotos: <Link to="/marca#creditos">Unsplash</Link>
          </p>
          <p>© {new Date().getFullYear()} BOX BOX Store</p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Protege rutas según sesión y rol
export function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container page">Cargando…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.rol))
    return (
      <div className="container page empty">
        <h2>Acceso denegado</h2>
        <p className="muted">Tu usuario no tiene permisos para ver esta sección.</p>
      </div>
    );
  return children;
}
