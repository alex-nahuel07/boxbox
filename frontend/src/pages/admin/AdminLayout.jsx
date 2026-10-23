import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const links = [
    ['/admin', 'Dashboard', true],
    ['/admin/productos', 'Productos'],
    ['/admin/categorias', 'Categorías'],
    ['/admin/proveedores', 'Proveedores'],
    ['/admin/pedidos', 'Pedidos'],
  ];
  if (user.rol === 'admin') links.push(['/admin/usuarios', 'Usuarios']);

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/"><Logo /></Link>
        <span className="eyebrow eyebrow-light">Panel de control</span>
        <nav>
          {links.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}>{label}</NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <strong>{user.nombre} {user.apellido}</strong>
          <span className="muted small">{user.rol}</span>
          <div>
            <Link to="/" className="small">Ver tienda</Link> · <button className="btn-link small" onClick={logout}>Salir</button>
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
