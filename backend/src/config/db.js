// backend/src/config/db.js
const { Pool } = require('pg');

// Configuración de la conexión
const pool = new Pool({
  user: 'postgres',   // ej: postgres
  host: 'localhost',
  database: 'Rendix',            // el nombre exacto de tu base
  password: 'kraken',       // la contraseña de tu usuario de postgres
  port: 5432,                    // puerto por defecto de PostgreSQL
});

// Probar conexión
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL', err));

module.exports = pool;
