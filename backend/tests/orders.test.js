const request = require('supertest');
const { setup, TARJETA_OK, TARJETA_SIN_FONDOS } = require('./helpers');

describe('Compra con módulo de pago simulado', () => {
  const { app, db, login } = setup();
  let token;
  const stockDe = (id) => db.prepare('SELECT stock FROM productos WHERE id_producto = ?').get(id).stock;

  beforeAll(async () => {
    token = await login('cliente@boxbox.com', 'Cliente123!');
  });

  const comprar = (body) => request(app).post('/api/pedidos').set('Authorization', `Bearer ${token}`).send(body);
  const base = { direccion_envio: 'Bv. Oroño 1234, Rosario', cuotas: 3 };

  test('pago aprobado: crea el pedido, calcula el total con precios de la BD y descuenta stock', async () => {
    const antes = stockDe(12);
    const res = await comprar({
      ...base,
      items: [{ id_producto: 12, cantidad: 2, precio: 1 }], // el precio enviado por el cliente se ignora
      tarjeta: TARJETA_OK,
    });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(30000);
    expect(res.body.estado).toBe('pagado');
    expect(res.body.items).toHaveLength(1);
    expect(res.body.pago.estado).toBe('aprobado');
    expect(res.body.pago.ultimos4).toBe('4242');
    expect(res.body.pago.cuotas).toBe(3);
    expect(stockDe(12)).toBe(antes - 2);
  });

  test('nunca se guarda el número completo ni el CVC de la tarjeta', () => {
    const pago = db.prepare('SELECT * FROM pagos ORDER BY id_pago DESC LIMIT 1').get();
    expect(JSON.stringify(pago)).not.toContain('4242424242424242');
    expect(pago).not.toHaveProperty('cvc');
  });

  test('pago rechazado (fondos insuficientes): responde 402 y no modifica stock ni pedidos', async () => {
    const antes = stockDe(13);
    const pedidosAntes = db.prepare('SELECT COUNT(*) AS n FROM pedidos').get().n;
    const res = await comprar({ ...base, items: [{ id_producto: 13, cantidad: 1 }], tarjeta: TARJETA_SIN_FONDOS });

    expect(res.status).toBe(402);
    expect(res.body.error).toMatch(/Fondos insuficientes/);
    expect(stockDe(13)).toBe(antes);
    expect(db.prepare('SELECT COUNT(*) AS n FROM pedidos').get().n).toBe(pedidosAntes);
  });

  test('stock insuficiente: responde 409', async () => {
    const res = await comprar({ ...base, items: [{ id_producto: 14, cantidad: 999 }], tarjeta: TARJETA_OK });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Stock insuficiente/);
  });

  test('tarjeta inválida (Luhn) o vencida: responde 400', async () => {
    const invalida = await comprar({ ...base, items: [{ id_producto: 1, cantidad: 1 }], tarjeta: { ...TARJETA_OK, number: '4242 4242 4242 4241' } });
    expect(invalida.status).toBe(400);
    const vencida = await comprar({ ...base, items: [{ id_producto: 1, cantidad: 1 }], tarjeta: { ...TARJETA_OK, expiry: '01/20' } });
    expect(vencida.status).toBe(400);
  });

  test('sin iniciar sesión no se puede comprar', async () => {
    const res = await request(app).post('/api/pedidos').send({ ...base, items: [{ id_producto: 1, cantidad: 1 }], tarjeta: TARJETA_OK });
    expect(res.status).toBe(401);
  });

  test('cancelar un pedido devuelve el stock', async () => {
    const admin = await login('admin@boxbox.com', 'Admin123!');
    const compra = await comprar({ ...base, items: [{ id_producto: 4, cantidad: 3 }], tarjeta: TARJETA_OK });
    const antes = stockDe(4);
    const res = await request(app)
      .patch(`/api/pedidos/${compra.body.id_pedido}/estado`)
      .set('Authorization', `Bearer ${admin}`)
      .send({ estado: 'cancelado' });
    expect(res.status).toBe(200);
    expect(stockDe(4)).toBe(antes + 3);
  });
});
