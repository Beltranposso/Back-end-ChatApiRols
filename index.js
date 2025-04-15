require('dotenv').config(); // Manejo de variables de entorno
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Importar módulos
const sockets = require('./resource/sockets');
const authHandlers = require('./resource/authHandlers');


// Rutas
const Routerusers = require('./route/Usuarios.js');
const Routerchats = require('./route/Chats.js');
const Routermensajes = require('./route/Mensajes.js');
const RouterusuariosAnonimos = require('./route/usuariosAnonimos.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración de middlewares
app.use(express.json());
app.use(cookieParser());

// Configuración de CORS
const { configureCors } = require('./resource/corsConfig');
app.use(configureCors);

// Rutas
app.use('/usuarios', Routerusers);
app.use('/chats', Routerchats);
app.use('/mensajes', Routermensajes);
app.use('/usuariosAnonimos', RouterusuariosAnonimos);

// Autenticación y manejo de sesiones
authHandlers(app);

// Configuración de sockets
sockets(io);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando 🚀');
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});