const { Router } = require('express');
const { transaction } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { HttpError, required } = require('../utils/validate');
const { processPayment } = require('../utils/payment');

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const CUOTAS = [1, 3, 6, 12];

module.exports = (db) => {
  const router = Router();
  const isStaff = (user) => user.rol === 'admin' || user.rol === 'empleado';

  function orderWithDetail(id) {
    const pedido = db
      .prepare(
        `SELECT pe.*, u.nombre || ' ' || u.apellido AS cliente, u.email
         FROM pedidos pe JOIN usuarios u ON u.id_usuario = pe.id_usuario WHERE pe.id_pedido = ?`
      )
      .get(id);
    if (!pedido) return null;
    pedido.items = db
      .prepare(
        `SELECT d.*, p.nombre, p.imagen FROM detalle_pedido d
         JOIN productos p ON p.id_producto = d.id_producto WHERE d.id_pedido = ?`
      )
      .all(id);
    pedido.pago = db.prepare('SELECT * FROM pagos WHERE id_pedido = ?').get(id) || null;
    return pedido;
  }

  router.use(requireAuth);

  // Checkout: valida carrito y stock, cobra con la pasarela simulada y registra el pedido.
  // Todo ocurre en una transacción: si el pago se rechaza no se descuenta stock ni se guarda nada.
  router.post('/', (req, res) => {
    required(req.body, ['items', 'direccion_envio', 'tarjeta']);
    const { items, direccion_envio, tarjeta } = req.body;
    const cuotas = Number(req.body.cuotas || 1);
    if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'El carrito está vacío');
    if (!CUOTAS.includes(cuotas)) throw new HttpError(400, 'Cantidad de cuotas no válida');

    const result = transaction(db, () => {
      const getProd = db.prepare('SELECT * FROM productos WHERE id_producto = ? AND activo = 1');
      const lineas = items.map(({ id_producto, cantidad }) => {
        const cant = Number(cantidad);
        if (!Number.isInteger(cant) || cant <= 0) throw new HttpError(400, 'Las cantidades deben ser enteros positivos');
        const prod = getProd.get(Number(id_producto));
        if (!prod) throw new HttpError(404, `El producto ${id_producto} no existe`);
        if (prod.stock < cant) throw new HttpError(409, `Stock insuficiente para "${prod.nombre}" (disponible: ${prod.stock})`);
        // El precio sale de la base de datos, nunca del cliente
        return { prod, cant, subtotal: prod.precio * cant };
      });
      const total = lineas.reduce((s, l) => s + l.subtotal, 0);

      const pago = processPayment(tarjeta, total);
      if (!pago.approved) {
        const msg = pago.errors ? pago.errors.join('. ') : `Pago rechazado: ${pago.reason}`;
        throw new HttpError(pago.errors ? 400 : 402, msg);
      }

      const { lastInsertRowid: idPedido } = db
        .prepare("INSERT INTO pedidos (id_usuario, estado, total, direccion_envio) VALUES (?, 'pagado', ?, ?)")
        .run(req.user.id, total, String(direccion_envio).trim());
      const insDet = db.prepare(
        'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)'
      );
      const updStock = db.prepare('UPDATE productos SET stock = stock - ? WHERE id_producto = ?');
      for (const l of lineas) {
        insDet.run(idPedido, l.prod.id_producto, l.cant, l.prod.precio, l.subtotal);
        updStock.run(l.cant, l.prod.id_producto);
      }
      db.prepare(
        "INSERT INTO pagos (id_pedido, monto, metodo, marca_tarjeta, ultimos4, cuotas, estado, codigo_autorizacion) VALUES (?, ?, 'tarjeta', ?, ?, ?, 'aprobado', ?)"
      ).run(idPedido, total, pago.brand, pago.last4, cuotas, pago.authorizationCode);
      return idPedido;
    });

    res.status(201).json(orderWithDetail(result));
  });

  router.get('/mios', (req, res) => {
    const ids = db.prepare('SELECT id_pedido FROM pedidos WHERE id_usuario = ? ORDER BY fecha DESC').all(req.user.id);
    res.json(ids.map(({ id_pedido }) => orderWithDetail(id_pedido)));
  });

  router.get('/', requireRole('admin', 'empleado'), (req, res) => {
    res.json(
      db
        .prepare(
          `SELECT pe.*, u.nombre || ' ' || u.apellido AS cliente, u.email,
                  (SELECT SUM(cantidad) FROM detalle_pedido d WHERE d.id_pedido = pe.id_pedido) AS unidades
           FROM pedidos pe JOIN usuarios u ON u.id_usuario = pe.id_usuario ORDER BY pe.fecha DESC`
        )
        .all()
    );
  });

  router.get('/:id', (req, res) => {
    const pedido = orderWithDetail(Number(req.params.id));
    if (!pedido) throw new HttpError(404, 'Pedido no encontrado');
    if (pedido.id_usuario !== req.user.id && !isStaff(req.user)) throw new HttpError(403, 'No puede ver este pedido');
    res.json(pedido);
  });

  // Cambio de estado; al cancelar se devuelve el stock
  router.patch('/:id/estado', requireRole('admin', 'empleado'), (req, res) => {
    const id = Number(req.params.id);
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) throw new HttpError(400, 'Estado no válido');
    transaction(db, () => {
      const pedido = db.prepare('SELECT * FROM pedidos WHERE id_pedido = ?').get(id);
      if (!pedido) throw new HttpError(404, 'Pedido no encontrado');
      if (pedido.estado === 'cancelado') throw new HttpError(409, 'El pedido ya está cancelado');
      if (estado === 'cancelado') {
        const det = db.prepare('SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ?').all(id);
        const upd = db.prepare('UPDATE productos SET stock = stock + ? WHERE id_producto = ?');
        for (const d of det) upd.run(d.cantidad, d.id_producto);
      }
      db.prepare('UPDATE pedidos SET estado = ? WHERE id_pedido = ?').run(estado, id);
    });
    res.json(orderWithDetail(id));
  });

  return router;
};
