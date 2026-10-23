require('dotenv').config();
const path = require('path');
const { createDb } = require('./db');
const { createApp } = require('./app');

const PORT = process.env.API_PORT || 4000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'boxbox.db');

const db = createDb(DB_PATH);
createApp(db).listen(PORT, () => {
  console.log(`API BOX BOX escuchando en http://localhost:${PORT}`);
  console.log(`Base de datos: ${DB_PATH}`);
});
