// backend/src/app.js
const express = require('express');
const app = express();

// Para poder leer JSON en requests
app.use(express.json());

// Importar el router de usuarios
const usuariosRouter = require('./routes/usuarios');

// Usar el router en la ruta /usuarios
app.use('/usuarios', usuariosRouter);

// Levantar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
