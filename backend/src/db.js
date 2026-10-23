const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

function createDb(file = ':memory:') {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  const empty = db.prepare('SELECT COUNT(*) AS n FROM roles').get().n === 0;
  if (empty) seed(db);
  return db;
}

// Ejecuta fn dentro de una transacción; si algo falla se revierte todo.
function transaction(db, fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function seed(db) {
  transaction(db, () => {
    const rol = db.prepare('INSERT INTO roles (nombre, descripcion) VALUES (?, ?)');
    rol.run('admin', 'Acceso total: usuarios, catálogo, pedidos y reportes');
    rol.run('empleado', 'Gestiona productos, stock y pedidos');
    rol.run('cliente', 'Compra productos y consulta sus pedidos');

    const user = db.prepare(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, direccion, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    user.run('Admin', 'BoxBox', 'admin@boxbox.com', bcrypt.hashSync('Admin123!', SALT_ROUNDS), '3410000000', 'Rosario, Santa Fe', 1);
    user.run('Erika', 'Pits', 'empleado@boxbox.com', bcrypt.hashSync('Empleado123!', SALT_ROUNDS), '3410000001', 'Rosario, Santa Fe', 2);
    user.run('Carla', 'Cliente', 'cliente@boxbox.com', bcrypt.hashSync('Cliente123!', SALT_ROUNDS), '3410000002', 'Bv. Oroño 1234, Rosario', 3);

    const cat = db.prepare('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)');
    cat.run('Gorras', 'Gorras oficiales de pilotos y escuderías');
    cat.run('Remeras', 'Remeras y camisetas de equipo');
    cat.run('Buzos y camperas', 'Abrigo con estilo de pit lane');
    cat.run('Coleccionables', 'Modelos a escala, cascos y réplicas');
    cat.run('Accesorios', 'Llaveros, tazas, banderas y más');

    const prov = db.prepare('INSERT INTO proveedores (razon_social, cuit, email, telefono) VALUES (?, ?, ?, ?)');
    prov.run('Paddock Apparel SRL', '30-71234567-8', 'ventas@paddockapparel.com', '1140001000');
    prov.run('Scale Racing Models SA', '30-79876543-2', 'contacto@scaleracing.com', '1140002000');
    prov.run('Grid Merch Distribuidora', '30-70011223-4', 'pedidos@gridmerch.com', '3414003000');

    const prod = db.prepare(
      'INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo, escuderia, imagen, id_categoria, id_proveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const productos = [
      ['Gorra Rosso Corsa 2026', 'Gorra curva roja con escudo bordado y ajuste trasero.', 45000, 25, 5, 'Rosso Corsa', '/img/productos/gorra-rosso.jpg', 1, 1],
      ['Gorra Silver Arrows', 'Gorra plateada y negra, edición campeonato.', 43000, 18, 5, 'Silver Arrows', '/img/productos/gorra-silver.jpg', 1, 1],
      ['Gorra Papaya #4', 'Gorra naranja papaya con número de piloto.', 41000, 4, 5, 'Papaya Racing', '/img/productos/gorra-papaya.jpg', 1, 1],
      ['Remera Team Rosso', 'Remera técnica de algodón, réplica de equipo.', 52000, 30, 8, 'Rosso Corsa', '/img/productos/remera-rosso.jpg', 2, 1],
      ['Remera Bull Racing Navy', 'Remera azul noche con detalles en amarillo.', 50000, 22, 8, 'Bull Racing', '/img/productos/remera-bull.jpg', 2, 1],
      ['Remera Green Machine', 'Remera verde británico, corte slim.', 48000, 12, 8, 'Green Machine', '/img/productos/remera-green.jpg', 2, 3],
      ['Buzo Pit Crew', 'Buzo con capucha negro, estampado de mecánicos.', 89000, 10, 4, 'BOX BOX', '/img/productos/buzo-pitcrew.jpg', 3, 1],
      ['Campera Softshell Paddock', 'Campera impermeable con logos de sponsors.', 145000, 6, 3, 'Silver Arrows', '/img/productos/campera-paddock.jpg', 3, 3],
      ['Auto a escala 1:43 Rosso', 'Modelo a escala 1:43 del monoplaza 2025.', 120000, 8, 2, 'Rosso Corsa', '/img/productos/auto-143-rosso.jpg', 4, 2],
      ['Auto a escala 1:18 Silver', 'Modelo a escala 1:18 con detalles de carbono.', 310000, 3, 2, 'Silver Arrows', '/img/productos/auto-118-silver.jpg', 4, 2],
      ['Casco réplica mini 1:2', 'Casco réplica escala 1:2 con visor espejado.', 230000, 5, 2, 'Bull Racing', '/img/productos/casco-mini.jpg', 4, 2],
      ['Taza "Box Box"', 'Taza de cerámica 350 ml con la frase más famosa de la radio.', 15000, 40, 10, 'BOX BOX', '/img/productos/taza.jpg', 5, 3],
      ['Llavero volante', 'Llavero metálico con forma de volante.', 9000, 60, 10, 'BOX BOX', '/img/productos/llavero-volante.jpg', 5, 3],
      ['Bandera a cuadros 90x150', 'Bandera de llegada en tela, ideal para la tribuna.', 22000, 2, 5, 'BOX BOX', '/img/productos/bandera.jpg', 5, 3],
    ];
    for (const p of productos) prod.run(...p);

    // Pedidos históricos para que el dashboard tenga datos
    const ped = db.prepare(
      "INSERT INTO pedidos (id_usuario, fecha, estado, total, direccion_envio) VALUES (?, datetime('now', ?), ?, ?, ?)"
    );
    const det = db.prepare(
      'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)'
    );
    const pago = db.prepare(
      "INSERT INTO pagos (id_pedido, monto, marca_tarjeta, ultimos4, cuotas, estado, codigo_autorizacion, fecha) VALUES (?, ?, 'visa', '4242', 1, 'aprobado', ?, datetime('now', ?))"
    );
    const historico = [
      ['-20 days', 'entregado', [[1, 1], [12, 2]]],
      ['-14 days', 'entregado', [[9, 1]]],
      ['-9 days', 'enviado', [[4, 2], [13, 1]]],
      ['-5 days', 'enviado', [[7, 1]]],
      ['-2 days', 'pagado', [[2, 1], [5, 1]]],
      ['-1 days', 'pagado', [[11, 1]]],
    ];
    const precio = db.prepare('SELECT precio FROM productos WHERE id_producto = ?');
    historico.forEach(([offset, estado, items], i) => {
      const lineas = items.map(([id, cant]) => [id, cant, precio.get(id).precio]);
      const total = lineas.reduce((s, [, c, p]) => s + c * p, 0);
      const { lastInsertRowid } = ped.run(3, offset, estado, total, 'Bv. Oroño 1234, Rosario');
      for (const [id, cant, p] of lineas) det.run(lastInsertRowid, id, cant, p, cant * p);
      pago.run(lastInsertRowid, total, `AUT-SEED${i + 1}`, offset);
    });
  });
}

module.exports = { createDb, transaction, SALT_ROUNDS };
