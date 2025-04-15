require('dotenv').config(); // Manejo de variables de entorno
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');

// Importar configuraciones
const configureCors = require('./config/corsConfig');
const configureRoutes = require('./config/routesConfig');
const configureSockets = require('./config/socketConfig');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de middlewares
app.use(express.json());
app.use(cookieParser());
app.use(configureCors);

// Configuración de rutas
configureRoutes(app);

// Configuración de sockets
configureSockets(io);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});