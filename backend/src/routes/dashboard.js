const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

// Métricas del panel administrativo
module.exports = (db) => {
  const router = Router();

  router.get('/', requireAuth, requireRole('admin', 'empleado'), (req, res) => {
    const one = (sql) => db.prepare(sql).get();
    const valid = "estado <> 'cancelado'";

    res.json({
      ventasTotales: one(`SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE ${valid}`).v,
      ventasMes: one(`SELECT COALESCE(SUM(total), 0) AS v FROM pedidos WHERE ${valid} AND fecha >= datetime('now', '-30 days')`).v,
      pedidos: one('SELECT COUNT(*) AS v FROM pedidos').v,
      pedidosPendientes: one("SELECT COUNT(*) AS v FROM pedidos WHERE estado IN ('pendiente', 'pagado')").v,
      clientes: one("SELECT COUNT(*) AS v FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol WHERE r.nombre = 'cliente'").v,
      productos: one('SELECT COUNT(*) AS v FROM productos WHERE activo = 1').v,
      stockBajo: db
        .prepare('SELECT id_producto, nombre, stock, stock_minimo FROM productos WHERE activo = 1 AND stock <= stock_minimo ORDER BY stock')
        .all(),
      ventasPorCategoria: db
        .prepare(
          `SELECT c.nombre AS categoria, COALESCE(SUM(CASE WHEN pe.id_pedido IS NOT NULL THEN d.subtotal END), 0) AS total
           FROM categorias c
           LEFT JOIN productos p ON p.id_categoria = c.id_categoria
           LEFT JOIN detalle_pedido d ON d.id_producto = p.id_producto
           LEFT JOIN pedidos pe ON pe.id_pedido = d.id_pedido AND pe.${valid}
           GROUP BY c.id_categoria ORDER BY total DESC`
        )
        .all(),
      ventasPorDia: db
        .prepare(
          `SELECT date(fecha) AS dia, SUM(total) AS total FROM pedidos
           WHERE ${valid} AND fecha >= datetime('now', '-30 days') GROUP BY date(fecha) ORDER BY dia`
        )
        .all(),
      topProductos: db
        .prepare(
          `SELECT p.nombre, SUM(d.cantidad) AS unidades FROM detalle_pedido d
           JOIN productos p ON p.id_producto = d.id_producto
           JOIN pedidos pe ON pe.id_pedido = d.id_pedido AND pe.${valid}
           GROUP BY p.id_producto ORDER BY unidades DESC LIMIT 5`
        )
        .all(),
    });
  });

  return router;
};
