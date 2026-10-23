# BOX BOX Store 🏁

E-commerce de merchandising de Fórmula 1. Trabajo práctico en equipo de 2:
**Maquetado + Front-End** y **Documentación + Back-End**.

- **Front-End:** React 18 + Vite + React Router + `react-credit-cards-2`
- **Back-End:** Node.js + Express + SQLite (`node:sqlite`) + bcrypt + JWT
- **Pruebas:** Jest + Supertest (22 pruebas)
- **Documentación:** [`docs/DOCUMENTACION.md`](docs/DOCUMENTACION.md) (normas, requerimientos, DER, diagrama de BD, pruebas, despliegue)

## Requisitos
- Node.js **22.5 o superior** (se usa el módulo nativo `node:sqlite`, no hace falta instalar ninguna base de datos).

## Cómo ejecutarlo
```bash
npm run install:all
npm run dev
```
- Tienda: http://localhost:5173
- API: http://localhost:4000/api/health

La base `backend/data/boxbox.db` se crea sola con datos de ejemplo. Para reiniciarla, borrá esa carpeta.

## Usuarios de prueba
| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@boxbox.com | Admin123! |
| Empleado | empleado@boxbox.com | Empleado123! |
| Cliente | cliente@boxbox.com | Cliente123! |

## Tarjetas de prueba (pago simulado)
Cualquier nombre, vencimiento futuro (ej. `12/30`) y CVC `123`.

| Número | Resultado |
|---|---|
| 4242 4242 4242 4242 | Aprobada (Visa) |
| 5555 5555 5555 4444 | Aprobada (Mastercard) |
| 4000 0000 0000 0002 | Rechazada — fondos insuficientes |
| 4000 0000 0000 0069 | Rechazada — tarjeta denunciada |

## Pruebas
```bash
npm test
```

## Checklist de la consigna
| Etapa | Ítem | Dónde |
|---|---|---|
| 1 | Identidad de la empresa · Colorimetría · Mockup | Página `/marca` y Anexo B de la documentación |
| 2 | Login con permisos de usuario | `backend/src/middleware/auth.js`, roles admin/empleado/cliente |
| 2 | CRUD | Productos, categorías, proveedores y usuarios en `/admin` |
| 2 | Panel administrativo (Dashboard) | `/admin` |
| 2 | Encriptado de contraseña | bcrypt en `backend/src/routes/auth.js` |
| 2 | DER y diagrama de base de datos | `docs/DOCUMENTACION.md` §4.1 |
| 2 | Requerimientos funcionales y no funcionales | `docs/DOCUMENTACION.md` Anexo A |
| 2 | Al menos 3 tests de back-end | `backend/tests/` (22 pruebas) |
| 3 | Módulo de pago (simulación) con tarjeta | `/checkout` + `backend/src/utils/payment.js` |

## Estructura
```
backend/
  src/app.js            Express + rutas + manejo de errores
  src/db.js             Conexión SQLite, transacciones y datos iniciales
  src/schema.sql        Tablas, claves e índices
  src/routes/           auth, productos, categorías/proveedores, pedidos, usuarios, dashboard
  src/utils/payment.js  Pasarela de pago simulada (Luhn, vencimiento, CVC)
  tests/                Jest + Supertest
frontend/
  src/pages/            Tienda, producto, carrito, checkout, login, mis pedidos, marca
  src/pages/admin/      Dashboard y CRUDs
docs/DOCUMENTACION.md
```
