const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { SALT_ROUNDS } = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');
const { HttpError, isEmail, isStrongPassword, required } = require('../utils/validate');

const USER_SQL = `
  SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.password_hash, u.telefono, u.direccion, u.activo, r.nombre AS rol
  FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol`;

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

module.exports = (db) => {
  const router = Router();

  router.post('/register', (req, res) => {
    required(req.body, ['nombre', 'apellido', 'email', 'password']);
    const { nombre, apellido, password, telefono, direccion } = req.body;
    const email = String(req.body.email).trim().toLowerCase();
    if (!isEmail(email)) throw new HttpError(400, 'El email no tiene un formato válido');
    if (!isStrongPassword(password))
      throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    if (db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email))
      throw new HttpError(409, 'Ya existe una cuenta con ese email');

    const hash = bcrypt.hashSync(password, SALT_ROUNDS);
    const rolCliente = db.prepare("SELECT id_rol FROM roles WHERE nombre = 'cliente'").get().id_rol;
    const { lastInsertRowid } = db
      .prepare('INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, direccion, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(nombre.trim(), apellido.trim(), email, hash, telefono || null, direccion || null, rolCliente);

    const user = db.prepare(`${USER_SQL} WHERE u.id_usuario = ?`).get(lastInsertRowid);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  });

  router.post('/login', (req, res) => {
    required(req.body, ['email', 'password']);
    const email = String(req.body.email).trim().toLowerCase();
    const user = db.prepare(`${USER_SQL} WHERE u.email = ?`).get(email);
    // Mismo mensaje para email o contraseña incorrectos: no revela qué cuentas existen
    if (!user || !bcrypt.compareSync(req.body.password, user.password_hash))
      throw new HttpError(401, 'Email o contraseña incorrectos');
    if (!user.activo) throw new HttpError(403, 'La cuenta está deshabilitada');
    res.json({ token: signToken(user), user: publicUser(user) });
  });

  router.get('/me', requireAuth, (req, res) => {
    const user = db.prepare(`${USER_SQL} WHERE u.id_usuario = ?`).get(req.user.id);
    if (!user) throw new HttpError(404, 'Usuario no encontrado');
    res.json(publicUser(user));
  });

  return router;
};
