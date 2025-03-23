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
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Permite conexiones desde cualquier origen (ajustar en producción)
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ 
  /* origin: ['https://control360.co', 'https://controlvotantes360.co.control360.co'] */
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true // Si tu aplicación necesita cookies o autenticación basada en sesiones
}));
 
app.use(express.json());
app.use(cookieParser());

 
app.use('/usuarios', Routerusers);
app.use('/chats', Routerchats);
app.use('/mensajes', Routermensajes);
app.use('/usuariosAnonimos', RouterusuariosAnonimos);

app.post('/login', async (req, res) => {
  try {
      const { nombre, password } = req.body;

      if (!nombre || !password) {
          return res.status(400).json({ message: 'Faltan datos de inicio de sesión' });
      }

      // Buscar el usuario por nombre
      const user = await Usermodel.findOne({ where: { nombre } });

      if (!user) {
          return res.status(401).json({ message: 'Credenciales incorrectas' });
      }

      // Validar si la contraseña está almacenada en la base de datos
      if (!user.password) {
          return res.status(500).json({ message: 'Error: usuario sin contraseña almacenada' });
      }

      // Comparar la contraseña con bcrypt
     

      // Obtener el rol del usuario
      const userCargo = user.rol;

      // Crear token con información del usuario
      const token = jwt.sign(
          { id: user.id, Nombre: user.nombre, rol: user.rol },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
      );

      // Configurar la cookie del token
      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 86400,
      }));

      return res.status(200).json({
          message: 'Inicio de sesión exitoso',
          usuario: {
              id: user.id,
              Nombre: user.nombre,
              Cargo: user.rol
          }
      });

  } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error en el servidor. Por favor intenta de nuevo más tarde.' });
  }
});



app.get('/get-user-info', (req, res) => {
  const token = req.cookies.token; // Obtener el token de la cookie HttpOnly

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' }); // Si no hay token, responder con 401
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' }); // Si el token es inválido, responder con 403
    }

    // Extraer el rol (cargo) del token y devolverlo
    const { rol,nombre} = decoded;
    console.log("Cargo a devolver :", rol);
    res.json({ rol , nombre});
  });
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
  