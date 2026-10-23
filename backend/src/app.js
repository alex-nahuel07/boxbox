const express = require('express');
const cors = require('cors');
const { HttpError } = require('./utils/validate');
const simpleCrud = require('./routes/simpleCrud');

function createApp(db) {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', db: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', require('./routes/auth')(db));
  app.use('/api/productos', require('./routes/products')(db));
  app.use(
    '/api/categorias',
    simpleCrud(db, {
      table: 'categorias',
      pk: 'id_categoria',
      fields: ['nombre', 'descripcion'],
      requiredFields: ['nombre'],
      publicRead: true,
      inUse: 'SELECT 1 FROM productos WHERE id_categoria = ?',
    })
  );
  app.use(
    '/api/proveedores',
    simpleCrud(db, {
      table: 'proveedores',
      pk: 'id_proveedor',
      fields: ['razon_social', 'cuit', 'email', 'telefono'],
      requiredFields: ['razon_social', 'cuit'],
      publicRead: false,
      inUse: 'SELECT 1 FROM productos WHERE id_proveedor = ?',
    })
  );
  app.use('/api/pedidos', require('./routes/orders')(db));
  app.use('/api/usuarios', require('./routes/users')(db));
  app.use('/api/dashboard', require('./routes/dashboard')(db));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

  // Manejo centralizado de errores: al usuario nunca se le muestra el detalle interno
  app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };
