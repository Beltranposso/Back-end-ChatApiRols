require('dotenv').config(); // Para manejar variables de entorno
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const cookie = require('cookie');
const  Usermodel  =require('./Models/Usuarios.js') ;
const Routerusers = require('./route/Usuarios.js');
const Routerchats = require('./route/Chats.js');
const Routermensajes = require('./route/Mensajes.js');
const RouterusuariosAnonimos = require('./route/usuariosAnonimos.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Permite conexiones desde cualquier origen (ajustar en producción)
    methods: ['GET', 'POST'],
  },
});
 
app.use(cors());
app.use(express.json());



app.use('/usuarios', Routerusers);
app.use('/chats', Routerchats);
app.use('/mensajes', Routermensajes);
app.use('/usuariosAnonimos', RouterusuariosAnonimos);

app.post('/login', async (req, res) => {
  try {
      const { NombreUsuario, Contraseña } = req.body;

      const user = await Usermodel.findOne({ 
          where: { 
              [Op.or]: [
                  { NombreUsuario },
                  { Contraseña } // **¡Ojo! Buscar por contraseña sin encriptar no es seguro**
              ]
          }
      });

      if (!user) {
          return res.status(401).json({ message: 'Credenciales incorrectas' });
      }

      if (Contraseña !== user.Contraseña) { 
          return res.status(401).json({ message: 'Credenciales incorrectas' });
      }

      // Obtener el rol directamente del campo "rol"
      const userCargo = user.rol;

      // Crear token incluyendo el campo 'id'
      const token = jwt.sign(
          { id: user.id, NombreUsuario: user.NombreUsuario, Nombre: user.Nombre, Cargo: userCargo },
          process.env.SECRET_KEY,
          { expiresIn: '1d' }
      );

      // Configurar la cookie del token
      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
          httpOnly: true,
          secure: true, // true en producción
          sameSite: 'lax', // 'strict' o 'lax' según sea necesario
          path: '/',
          maxAge: 86400, // 1 día en segundos
      }));

      // Respuesta con información adicional
      return res.status(200).json({
          message: 'Inicio de sesión exitoso',
          usuario: {
              id: user.id, 
              NombreUsuario: user.NombreUsuario,
              Nombre: user.Nombre,
              Cargo: userCargo 
          }
      });
  } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error en el servidor. Por favor intenta de nuevo más tarde.' });
  }
});




/* 
// Evento de conexión de un cliente al chat
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);
  
  // Escucha mensajes del cliente
  socket.on('mensaje', (data) => {
    console.log(`Mensaje recibido: ${data}`);
    io.emit('mensaje', data); // Reenvía el mensaje a todos los clientes conectados
    });
    
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      });
      }); */
      
       
      
      
      
      
      
      
      
      
      // Rutas de prueba
      app.get('/', (req, res) => {
        res.send('Servidor funcionando 🚀');
      });
      
      // Iniciar servidor
      const PORT = process.env.PORT || 3001;
      server.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
  