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

const app = express();
const server = http.createServer(app);



const getAllowedOrigins = async () => {
    try {
        const sitios = await Sitio.findAll(); // Asegúrate de que el modelo Sitio esté bien definido
        return sitios.map(sitio => sitio.url);
    } catch (error) {
        console.error("❌ Error al obtener los sitios:", error);
        return []; // Devuelve un array vacío en caso de error
    }
}








const io = require('socket.io')(server, {
    cors: {
        origin: async (origin, callback) => {
            try {
                const allowedOrigins = await getAllowedOrigins(); 

                // Agregar siempre una URL fija permitida
                allowedOrigins.push("http://localhost:5173");

                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    console.log(`❌ Origen bloqueado por CORS: ${origin}`);
                    callback(new Error("Not allowed by CORS"));
                }
            } catch (error) {
                console.error("❌ Error al obtener los sitios:", error);
                callback(new Error("Error al validar CORS"));
            }
        }
    }
});
 
 





app.use(async (req, res, next) => {
    const fixedURL = ["http://localhost:5173", "http://localhost"]; // 🌍 URLs fijas permitidas

    // 🔍 Obtiene los dominios permitidos desde la base de datos
    const allowedOrigins = await getAllowedOrigins();

    const corsOptions = {
        origin: (origin, callback) => {
            if (!origin || fixedURL.includes(origin) || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    };

    cors(corsOptions)(req, res, next);
});
app.use(express.json());
app.use(cookieParser());
 
 
app.use('/usuarios', Routerusers);
app.use('/chats', Routerchats);
app.use('/mensajes', Routermensajes);
app.use('/usuariosAnonimos', RouterusuariosAnonimos);

// Función para agregar nuevos dominios cuando se instala el plugin de WordPress



app.post('/login', async (req, res) => {
  try {
      const { nombre, password } = req.body;

      if (!nombre || !password) {
          return res.status(400).json({ message: 'Faltan datos de inicio de sesión' });
      }

      // Buscar el usuario por nombre
      const user = await Usermodel.findOne({ where: { nombre, password } });

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
          { id: user.id, Nombre:user.nombre, rol: user.rol,Sitio_id:user.sitio_id},
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
    const {id, rol,Nombre,Sitio_id} = decoded;
    console.log("Cargo a devolver :", Sitio_id);
    res.json({id, rol , Nombre,Sitio_id});
  });
});

 
 


let allowedOrigins = new Set();
let usuariosConectados = {}; 
const actualizarAllowedOrigins = async () => {
    const sitios = await getAllowedOrigins();
    allowedOrigins = new Set(sitios);
    allowedOrigins.add("http://localhost:5173"); // URL permitida por defecto
};

const addAllowedOrigin = async (origin) => {
    try {
        const existe = await Sitio.findOne({ where: { url: origin } });
        if (!existe) {
            await Sitio.create({ url: origin });
            allowedOrigins.add(origin);
            console.log(`✅ Origen agregado: ${origin}`);
        }
    } catch (error) {
        console.error(`❌ Error al agregar origen: ${origin}`, error);
    }
};
 
// Llamar la función al inicio y actualizar cada 60 segundos
actualizarAllowedOrigins();
setInterval(actualizarAllowedOrigins, 60000);

io.on("connection", async (socket) => {
    const { sitioId, userId, rol } = socket.handshake.query; 
    const origin = socket.handshake.headers.origin;

    console.log(`🟢 Nueva conexión desde ${origin}, sitio: ${sitioId}, usuario: ${userId}, rol: ${rol}`);

    // ✅ Verificar que `allowedOrigins` esté definido antes de usarlo
    if (allowedOrigins && origin && !allowedOrigins.has(origin)) {
        await addAllowedOrigin(origin);
    }

    // 🔍 Verificar si el sitio existe en la base de datos (sin desconectar)
    const sitio = await Sitio.findByPk(sitioId);
    if (!sitio) {
        console.log(`⚠️ Advertencia: El sitio ${sitioId} no está registrado en la DB.`);
    } else {
        console.log(`✅ Sitio ${sitioId} encontrado.`);
    }

    if (userId) usuariosConectados[userId] = socket.id;

    socket.join(`sitio_${sitioId}`);
 
    if (rol === 'asesor' || rol === 'coordinador') {
        socket.join(`asesores_${sitioId}`);
        console.log(`📢 ${rol.toUpperCase()} conectado en sitio ${sitioId}: ${userId}`);
    } 
    
    
    
    
    socket.on('respuesta', async (data) => {
        const { chatId, contenido, enviadoPor,createdAt } = data;

        const chat = await Chat.findOne({ where: { id: chatId } });
        
        if (!chat) {
            console.log(`❌ Chat no encontrado: ${chatId}`);
            return;
        }
    
        const { cliente_id, asesor_id } = chat;
    
        console.log(`📝 RESPUESTA de ${enviadoPor} -> Cliente ${cliente_id}: "${contenido}"`);
    
        await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });
        

        // 🔹 Enviar a asesores
        socket.broadcast.emit('mensaje', {
                chatId, 
                contenido,
                enviado_por: enviadoPor,
                createdAt: createdAt,
            });


            io.emit('Mensaje23', {
                chatId, 
                contenido,
                enviado_por: enviadoPor,
                createdAt: createdAt,
            });
        // 🔹 Enviar al cliente si está conectado
   
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

    // 📌 Cliente envía un mensaje
    socket.on("mensaje", async (data) => {
        const { chatId, contenido, enviadoPor } = data;
        console.log(`📩 Cliente envió mensaje en sitio ${sitioId}:`, data);

        await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });
  
        console.log(`🔹 Emitiendo evento "mensaje" a la sala asesores_${sitioId}`);
        // Enviar a asesores
        io.to(`asesores_${sitioId}`).emit("mensaje", data);
        // 🔹 Enviar también al cliente que pertenece a ese chat
        const chat = await Chat.findOne({ where: { id: chatId } });
        if (chat && usuariosConectados[chat.cliente_id]) {
            io.to(usuariosConectados[chat.cliente_id]).emit("mensaje", data);
            console.log(`✅ Mensaje enviado al cliente ${chat.cliente_id}`);
        }
    });

    // Manejo de desconexión
    socket.on("disconnect", () => {
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
  