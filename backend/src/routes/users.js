const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { SALT_ROUNDS } = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { HttpError, isEmail, isStrongPassword, required } = require('../utils/validate');

const SELECT = `
  SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.telefono, u.direccion, u.activo, u.fecha_alta, u.id_rol, r.nombre AS rol
  FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol`;

// Gestión de usuarios: solo el administrador
module.exports = (db) => {
  const router = Router();
  router.use(requireAuth, requireRole('admin'));

  const get = (id) => db.prepare(`${SELECT} WHERE u.id_usuario = ?`).get(id);
  const rolExists = (id) => db.prepare('SELECT 1 FROM roles WHERE id_rol = ?').get(id);

  router.get('/roles', (req, res) => res.json(db.prepare('SELECT * FROM roles').all()));

  router.get('/', (req, res) => res.json(db.prepare(`${SELECT} ORDER BY u.id_usuario`).all()));

  router.post('/', (req, res) => {
    required(req.body, ['nombre', 'apellido', 'email', 'password', 'id_rol']);
    const email = String(req.body.email).trim().toLowerCase();
    if (!isEmail(email)) throw new HttpError(400, 'El email no tiene un formato válido');
    if (!isStrongPassword(req.body.password)) throw new HttpError(400, 'La contraseña no cumple los requisitos de seguridad');
    if (!rolExists(req.body.id_rol)) throw new HttpError(400, 'Rol inexistente');
    if (db.prepare('SELECT 1 FROM usuarios WHERE email = ?').get(email)) throw new HttpError(409, 'Ya existe una cuenta con ese email');
    const { lastInsertRowid } = db
      .prepare('INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, direccion, id_rol) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(
        req.body.nombre.trim(),
        req.body.apellido.trim(),
        email,
        bcrypt.hashSync(req.body.password, SALT_ROUNDS),
        req.body.telefono || null,
        req.body.direccion || null,
        Number(req.body.id_rol)
      );
    res.status(201).json(get(lastInsertRowid));
  });

  router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = get(id);
    if (!user) throw new HttpError(404, 'Usuario no encontrado');
    const idRol = req.body.id_rol === undefined ? user.id_rol : Number(req.body.id_rol);
    const activo = req.body.activo === undefined ? user.activo : req.body.activo ? 1 : 0;
    if (!rolExists(idRol)) throw new HttpError(400, 'Rol inexistente');
    if (id === req.user.id && (activo === 0 || idRol !== user.id_rol))
      throw new HttpError(400, 'No puede quitarse permisos ni deshabilitar su propia cuenta');
    db.prepare('UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ?, id_rol = ?, activo = ? WHERE id_usuario = ?').run(
      req.body.nombre ?? user.nombre,
      req.body.apellido ?? user.apellido,
      req.body.telefono ?? user.telefono,
      req.body.direccion ?? user.direccion,
      idRol,
      activo,
      id
    );
    res.json(get(id));
  });

  // Baja lógica: la cuenta se deshabilita pero sus pedidos se conservan
  router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (id === req.user.id) throw new HttpError(400, 'No puede eliminar su propia cuenta');
    const { changes } = db.prepare('UPDATE usuarios SET activo = 0 WHERE id_usuario = ?').run(id);
    if (!changes) throw new HttpError(404, 'Usuario no encontrado');
    res.status(204).end();
  });

  return router;
};
