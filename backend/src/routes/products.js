const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { HttpError, required } = require('../utils/validate');

const SELECT = `
  SELECT p.*, c.nombre AS categoria, pr.razon_social AS proveedor
  FROM productos p
  JOIN categorias c ON c.id_categoria = p.id_categoria
  JOIN proveedores pr ON pr.id_proveedor = p.id_proveedor`;

function parseProduct(body, db) {
  required(body, ['nombre', 'precio', 'stock', 'id_categoria', 'id_proveedor']);
  const precio = Number(body.precio);
  const stock = Number(body.stock);
  const stockMinimo = body.stock_minimo === undefined ? 5 : Number(body.stock_minimo);
  if (!(precio > 0)) throw new HttpError(400, 'El precio debe ser mayor a 0');
  if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, 'El stock debe ser un entero mayor o igual a 0');
  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) throw new HttpError(400, 'El stock mínimo no es válido');
  if (!db.prepare('SELECT 1 FROM categorias WHERE id_categoria = ?').get(body.id_categoria))
    throw new HttpError(400, 'La categoría no existe');
  if (!db.prepare('SELECT 1 FROM proveedores WHERE id_proveedor = ?').get(body.id_proveedor))
    throw new HttpError(400, 'El proveedor no existe');
  return [
    String(body.nombre).trim(),
    body.descripcion || null,
    precio,
    stock,
    stockMinimo,
    body.escuderia || null,
    body.imagen || 'cap',
    Number(body.id_categoria),
    Number(body.id_proveedor),
  ];
}

module.exports = (db) => {
  const router = Router();
  const staff = [requireAuth, requireRole('admin', 'empleado')];

  // Listado público con filtros: ?q=texto&categoria=id&todos=1 (todos incluye inactivos, solo staff lo usa)
  router.get('/', (req, res) => {
    const where = [];
    const params = [];
    if (req.query.todos !== '1') where.push('p.activo = 1');
    if (req.query.q) {
      where.push('(p.nombre LIKE ? OR p.escuderia LIKE ?)');
      params.push(`%${req.query.q}%`, `%${req.query.q}%`);
    }
    if (req.query.categoria) {
      where.push('p.id_categoria = ?');
      params.push(Number(req.query.categoria));
    }
    const sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.id_producto`;
    res.json(db.prepare(sql).all(...params));
  });

  router.get('/:id', (req, res) => {
    const prod = db.prepare(`${SELECT} WHERE p.id_producto = ?`).get(Number(req.params.id));
    if (!prod) throw new HttpError(404, 'Producto no encontrado');
    res.json(prod);
  });

  router.post('/', ...staff, (req, res) => {
    const values = parseProduct(req.body, db);
    const { lastInsertRowid } = db
      .prepare(
        'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, escuderia, imagen, id_categoria, id_proveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(...values);
    res.status(201).json(db.prepare(`${SELECT} WHERE p.id_producto = ?`).get(lastInsertRowid));
  });

  router.put('/:id', ...staff, (req, res) => {
    const id = Number(req.params.id);
    if (!db.prepare('SELECT 1 FROM productos WHERE id_producto = ?').get(id)) throw new HttpError(404, 'Producto no encontrado');
    const values = parseProduct(req.body, db);
    const activo = req.body.activo === undefined ? 1 : req.body.activo ? 1 : 0;
    db.prepare(
      `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, stock_minimo = ?, escuderia = ?, imagen = ?,
       id_categoria = ?, id_proveedor = ?, activo = ? WHERE id_producto = ?`
    ).run(...values, activo, id);
    res.json(db.prepare(`${SELECT} WHERE p.id_producto = ?`).get(id));
  });

  // Baja lógica: el producto queda en los pedidos históricos pero deja de venderse
  router.delete('/:id', ...staff, (req, res) => {
    const { changes } = db.prepare('UPDATE productos SET activo = 0 WHERE id_producto = ?').run(Number(req.params.id));
    if (!changes) throw new HttpError(404, 'Producto no encontrado');
    res.status(204).end();
  });

  return router;
};
