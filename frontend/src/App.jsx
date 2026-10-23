import { Route, Routes } from 'react-router-dom';
import { PublicLayout, RequireAuth } from './components/Layout';
import Home from './pages/Home';
import Tienda from './pages/Tienda';
import Producto from './pages/Producto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import { Login, Registro } from './pages/Auth';
import MisPedidos from './pages/MisPedidos';
import Marca from './pages/Marca';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProductos from './pages/admin/Productos';
import { AdminCategorias, AdminProveedores } from './pages/admin/Tablas';
import AdminPedidos from './pages/admin/Pedidos';
import AdminUsuarios from './pages/admin/Usuarios';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/producto/:id" element={<Producto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/marca" element={<Marca />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/mis-pedidos" element={<RequireAuth><MisPedidos /></RequireAuth>} />
        <Route path="*" element={<div className="container page empty"><h2>Página no encontrada</h2></div>} />
      </Route>
      <Route path="/admin" element={<RequireAuth roles={['admin', 'empleado']}><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="proveedores" element={<AdminProveedores />} />
        <Route path="pedidos" element={<AdminPedidos />} />
        <Route path="usuarios" element={<RequireAuth roles={['admin']}><AdminUsuarios /></RequireAuth>} />
      </Route>
    </Routes>
  );
}
