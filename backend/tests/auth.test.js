const request = require('supertest');
const { setup } = require('./helpers');

describe('Autenticación y permisos', () => {
  const { app, db, login } = setup();

  test('registra un cliente y guarda la contraseña encriptada con bcrypt', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Lando', apellido: 'Test', email: 'lando@test.com', password: 'Papaya2026' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.rol).toBe('cliente');
    expect(res.body.user.password_hash).toBeUndefined();

    const row = db.prepare('SELECT password_hash FROM usuarios WHERE email = ?').get('lando@test.com');
    expect(row.password_hash).not.toBe('Papaya2026');
    expect(row.password_hash).toMatch(/^\$2[aby]\$10\$/);
  });

  test('rechaza contraseñas débiles y emails duplicados', async () => {
    const debil = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'A', apellido: 'B', email: 'otro@test.com', password: '123' });
    expect(debil.status).toBe(400);

    const duplicado = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'A', apellido: 'B', email: 'cliente@boxbox.com', password: 'Segura2026' });
    expect(duplicado.status).toBe(409);
  });

  test('login correcto devuelve token; incorrecto devuelve 401', async () => {
    const ok = await request(app).post('/api/auth/login').send({ email: 'admin@boxbox.com', password: 'Admin123!' });
    expect(ok.status).toBe(200);
    expect(ok.body.user.rol).toBe('admin');

    const mal = await request(app).post('/api/auth/login').send({ email: 'admin@boxbox.com', password: 'incorrecta' });
    expect(mal.status).toBe(401);
    expect(mal.body.error).toBe('Email o contraseña incorrectos');
  });

  test('un cliente no puede acceder al panel administrativo (403) y sin token recibe 401', async () => {
    const token = await login('cliente@boxbox.com', 'Cliente123!');
    const prohibido = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${token}`);
    expect(prohibido.status).toBe(403);

    const sinToken = await request(app).get('/api/dashboard');
    expect(sinToken.status).toBe(401);

    const admin = await login('admin@boxbox.com', 'Admin123!');
    const ok = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${admin}`);
    expect(ok.status).toBe(200);
    expect(ok.body).toHaveProperty('ventasTotales');
  });
});
