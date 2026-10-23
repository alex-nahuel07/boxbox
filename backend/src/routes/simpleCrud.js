const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const { HttpError, required } = require('../utils/validate');

// CRUD genérico para tablas simples (categorías y proveedores)
// table: nombre de tabla, pk: clave primaria, fields: columnas editables,
// requiredFields: obligatorias, publicRead: si el GET no requiere login
module.exports = (db, { table, pk, fields, requiredFields, publicRead, inUse }) => {
  const router = Router();
  const staff = [requireAuth, requireRole('admin', 'empleado')];
  const readGuard = publicRead ? [] : staff;

  const get = (id) => db.prepare(`SELECT * FROM ${table} WHERE ${pk} = ?`).get(id);
  const values = (body) => fields.map((f) => (body[f] === undefined || body[f] === '' ? null : String(body[f]).trim()));

  function save(fn) {
    try {
      return fn();
    } catch (err) {
      if (/UNIQUE/.test(err.message)) throw new HttpError(409, 'Ya existe un registro con esos datos');
      throw err;
    }
  }

  router.get('/', ...readGuard, (req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table} ORDER BY ${pk}`).all());
  });

  router.get('/:id', ...readGuard, (req, res) => {
    const row = get(Number(req.params.id));
    if (!row) throw new HttpError(404, 'Registro no encontrado');
    res.json(row);
  });

  router.post('/', ...staff, (req, res) => {
    required(req.body, requiredFields);
    const { lastInsertRowid } = save(() =>
      db.prepare(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`).run(...values(req.body))
    );
    res.status(201).json(get(lastInsertRowid));
  });

  router.put('/:id', ...staff, (req, res) => {
    const id = Number(req.params.id);
    if (!get(id)) throw new HttpError(404, 'Registro no encontrado');
    required(req.body, requiredFields);
    save(() => db.prepare(`UPDATE ${table} SET ${fields.map((f) => `${f} = ?`).join(', ')} WHERE ${pk} = ?`).run(...values(req.body), id));
    res.json(get(id));
  });

  router.delete('/:id', ...staff, (req, res) => {
    const id = Number(req.params.id);
    if (!get(id)) throw new HttpError(404, 'Registro no encontrado');
    if (db.prepare(inUse).get(id)) throw new HttpError(409, 'No se puede eliminar: tiene productos asociados');
    db.prepare(`DELETE FROM ${table} WHERE ${pk} = ?`).run(id);
    res.status(204).end();
  });

  return router;
};
