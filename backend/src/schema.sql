-- Esquema de base de datos BOX BOX Store (SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id_rol      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT NOT NULL UNIQUE,            -- admin | empleado | cliente
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre         TEXT NOT NULL,
  apellido       TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,                -- bcrypt, nunca texto plano
  telefono       TEXT,
  direccion      TEXT,
  id_rol         INTEGER NOT NULL REFERENCES roles(id_rol),
  activo         INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  fecha_alta     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       TEXT NOT NULL UNIQUE,
  descripcion  TEXT
);

CREATE TABLE IF NOT EXISTS proveedores (
  id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
  razon_social TEXT NOT NULL,
  cuit         TEXT NOT NULL UNIQUE,
  email        TEXT,
  telefono     TEXT
);

CREATE TABLE IF NOT EXISTS productos (
  id_producto  INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  precio       REAL NOT NULL CHECK (precio > 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
  escuderia    TEXT,
  imagen       TEXT,
  activo       INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria),
  id_proveedor INTEGER NOT NULL REFERENCES proveedores(id_proveedor)
);

CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido        INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario),
  fecha            TEXT NOT NULL DEFAULT (datetime('now')),
  estado           TEXT NOT NULL DEFAULT 'pagado'
                   CHECK (estado IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  total            REAL NOT NULL CHECK (total >= 0),
  direccion_envio  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
  id_detalle      INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido       INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  id_producto     INTEGER NOT NULL REFERENCES productos(id_producto),
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario REAL NOT NULL CHECK (precio_unitario > 0),
  subtotal        REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS pagos (
  id_pago        INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido      INTEGER NOT NULL UNIQUE REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  monto          REAL NOT NULL,
  metodo         TEXT NOT NULL DEFAULT 'tarjeta',
  marca_tarjeta  TEXT,                         -- visa, mastercard, amex...
  ultimos4       TEXT,                         -- nunca se guarda el número completo ni el CVC
  cuotas         INTEGER NOT NULL DEFAULT 1 CHECK (cuotas IN (1, 3, 6, 12)),
  estado         TEXT NOT NULL CHECK (estado IN ('aprobado', 'rechazado')),
  codigo_autorizacion TEXT,
  fecha          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(id_categoria);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(id_usuario);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido ON detalle_pedido(id_pedido);
