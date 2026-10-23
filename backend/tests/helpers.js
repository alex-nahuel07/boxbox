const request = require('supertest');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

// Cada archivo de test usa su propia base en memoria con los datos de ejemplo
function setup() {
  const db = createDb(':memory:');
  const app = createApp(db);
  const login = async (email, password) => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    return res.body.token;
  };
  return { db, app, login };
}

const TARJETA_OK = { number: '4242 4242 4242 4242', name: 'CARLA CLIENTE', expiry: '12/30', cvc: '123' };
const TARJETA_SIN_FONDOS = { number: '4000 0000 0000 0002', name: 'CARLA CLIENTE', expiry: '12/30', cvc: '123' };

module.exports = { setup, TARJETA_OK, TARJETA_SIN_FONDOS };
