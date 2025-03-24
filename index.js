require('dotenv').config(); // Para manejar variables de entorno
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const cookie = require('cookie');
const  Usermodel  =require('./Models/Usuarios.js') ;
const Routerusers = require('./route/Usuarios.js');
const Mensaje = require('./Models/Mensajes.js');
const Chat = require('./Models/Chats.js');
const Routerchats = require('./route/Chats.js');
const Routermensajes = require('./route/Mensajes.js');
const Sitio = require('./Models/Sitios.js');
const RouterusuariosAnonimos = require('./route/usuariosAnonimos.js');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
      origin: (origin, callback) => {
          if (!origin || allowedOrigins.has(origin)) {
              return callback(null, true);
          }
          return callback(new Error("No autorizado por CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true
  }
});
const allowedOrigins = new Set(["http://localhost:5173"]);

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

// Función para agregar nuevos dominios cuando se instala el plugin de WordPress
function addAllowedOrigin(domain) {
  allowedOrigins.add(domain);
  console.log(`✅ Nuevo dominio autorizado: ${domain}`);
}



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
          { id: user.id, Nombre:user.nombre, rol: user.rol },
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

app.post('/Logout', (req, res) => {
  try {
      res.setHeader('Set-Cookie', cookie.serialize('token', '', {
          httpOnly: true,
          secure: true, // Asegúrate de ajustarlo según el entorno
          sameSite: 'lax', // Igual que en el login
          path: '/',
          expires: new Date(0), // Fecha en el pasado para eliminar la cookie
      }));
      return res.status(200).json({ message: 'Sesión cerrada y cookie eliminada' });
  } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
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
    const { rol,Nombre} = decoded;
    console.log("Cargo a devolver :", rol);
    res.json({ rol , Nombre});
  });
});


 




const usuariosConectados = {};
io.on('connection', async (socket) => {
    const { sitioId, userId, rol } = socket.handshake.query; // Recibir info
    const origin = socket.handshake.headers.origin;

    console.log(`🟢 Nueva conexión desde ${origin}, sitio: ${sitioId}, usuario: ${userId}, rol: ${rol}`);

    if (origin && !allowedOrigins.has(origin)) {
        addAllowedOrigin(origin);
    }

    const sitio = await Sitio.findByPk(sitioId);
    if (!sitio) {
        console.log("❌ Sitio no registrado. Desconectando...");
        return socket.disconnect();
    }

    if (userId) usuariosConectados[userId] = socket.id;

    socket.join(`sitio_${sitioId}`);

    if (rol === 'asesor' || rol === 'coordinador') {
        socket.join(`asesores_${sitioId}`);
        console.log(`📢 ${rol.toUpperCase()} conectado en sitio ${sitioId}: ${userId}`);
    }

    // 📌 Cliente envía un mensaje
    socket.on('mensaje', async (data) => {
        const { chatId, contenido, enviadoPor } = data;

        console.log(`📩 Cliente envió mensaje en sitio ${sitioId}:`, data);

        await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });

        // Enviar a asesores
        io.to(`asesores_${sitioId}`).emit('mensaje', data);

        // 🔹 Enviar también al cliente que pertenece a ese chat
        const chat = await Chat.findOne({ where: { id: chatId } });
        if (chat && usuariosConectados[chat.cliente_id]) {
            io.to(usuariosConectados[chat.cliente_id]).emit('mensaje', data);
            console.log(`✅ Mensaje enviado al cliente ${chat.cliente_id} (socket: ${usuariosConectados[chat.cliente_id]})`);
        }
    }); 

    // 📌 Asesor o Coordinador responde a un mensaje
    socket.on('respuesta', async (data) => {
        const { chatId, contenido, enviadoPor } = data;

        const chat = await Chat.findOne({ where: { id: chatId } });

        if (!chat) {
            console.log(`❌ Chat no encontrado: ${chatId}`);
            return;
        }

        const { cliente_id, asesor_id } = chat;

        console.log(`📝 RESPUESTA de ${enviadoPor} -> Cliente ${cliente_id}: "${contenido}"`);

        await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });

        // 🔹 Enviar a asesores
        io.to(`asesores_${sitioId}`).emit('mensaje', {
            chatId,
            contenido,
            enviado_por: enviadoPor
        });

        // 🔹 Enviar al cliente si está conectado
        if (usuariosConectados[cliente_id]) {
            io.to(usuariosConectados[cliente_id]).emit('mensaje', {
                chatId,
                contenido,
                enviado_por: enviadoPor,
                clienteId: cliente_id,
                asesorId: asesor_id,
            });
            console.log(`✅ Mensaje enviado al cliente ${cliente_id} (socket: ${usuariosConectados[cliente_id]})`);
        } else {
            console.log(`⚠️ Cliente ${cliente_id} no está conectado.`);
        }
    });

    // 📌 Notificar cuando un usuario está escribiendo
    socket.on('escribiendo', ({ chatId, userId }) => {
        console.log(`✍️ Usuario ${userId} está escribiendo en el chat ${chatId}`);
        io.to(`sitio_${sitioId}`).emit('escribiendo', { chatId, userId });
    });

    // 📌 Notificar cuando un usuario deja de escribir
    socket.on('detenerEscribiendo', ({ chatId, userId }) => {
        console.log(`🛑 Usuario ${userId} dejó de escribir en el chat ${chatId}`);
        io.to(`sitio_${sitioId}`).emit('detenerEscribiendo', { chatId, userId });
    }); 

    // Manejar desconexiones
    socket.on('disconnect', () => {
        console.log(`❌ Usuario desconectado: ${userId}`);
        delete usuariosConectados[userId];
    });
});
      
       
      
      
      
      
      
      // Rutas de prueba
      app.get('/', (req, res) => {
        res.send('Servidor funcionando 🚀');
      });
      
      // Iniciar servidor
      const PORT = process.env.PORT || 3001;
      server.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
  