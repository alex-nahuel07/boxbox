const request = require('supertest');
const { setup } = require('./helpers');

describe('CRUD de productos', () => {
  const { app, login } = setup();
  let token;
  let id;

  beforeAll(async () => {
    token = await login('empleado@boxbox.com', 'Empleado123!');
  });

  const nuevo = {
    nombre: 'Gorra Test Racing',
    descripcion: 'Producto de prueba',
    precio: 30000,
    stock: 10,
    escuderia: 'Test Racing',
    id_categoria: 1,
    id_proveedor: 1,
  };

  test('el catálogo es público', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('crear (POST) un producto', async () => {
    const res = await request(app).post('/api/productos').set('Authorization', `Bearer ${token}`).send(nuevo);
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe(nuevo.nombre);
    expect(res.body.categoria).toBe('Gorras');
    id = res.body.id_producto;
  });

  test('leer (GET) el producto creado', async () => {
    const res = await request(app).get(`/api/productos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.precio).toBe(30000);
  });

  test('actualizar (PUT) precio y stock', async () => {
    const res = await request(app)
      .put(`/api/productos/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...nuevo, precio: 35000, stock: 3 });
    expect(res.status).toBe(200);
    expect(res.body.precio).toBe(35000);
    expect(res.body.stock).toBe(3);
  });

  test('valida datos: precio negativo, stock negativo y categoría inexistente', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    expect((await request(app).post('/api/productos').set(auth).send({ ...nuevo, precio: -5 })).status).toBe(400);
    expect((await request(app).post('/api/productos').set(auth).send({ ...nuevo, stock: -1 })).status).toBe(400);
    expect((await request(app).post('/api/productos').set(auth).send({ ...nuevo, id_categoria: 999 })).status).toBe(400);
  });

  test('eliminar (DELETE) hace baja lógica y el producto deja de aparecer en el catálogo', async () => {
    const del = await request(app).delete(`/api/productos/${id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
    const lista = await request(app).get('/api/productos');
    expect(lista.body.find((p) => p.id_producto === id)).toBeUndefined();
  });

  test('un cliente no puede crear productos', async () => {
    const cliente = await login('cliente@boxbox.com', 'Cliente123!');
    const res = await request(app).post('/api/productos').set('Authorization', `Bearer ${cliente}`).send(nuevo);
    expect(res.status).toBe(403);
  });
});
