const Sitio = require('../Models/Sitios.js');
const Chat = require('../Models/Chats.js');
const Mensaje = require('../Models/Mensajes.js');
const { translateText } = require('../services/tranlate.js');
const { traducirMensajeGemini } = require('../services/GeminisTraslate.js');
let cachedOrigins = new Set();
const connectedUsers = {};
 
// Función para obtener los orígenes permitidos desde la base de datos
const getAllowedOrigins = async () => {
    try {
        const sitios = await Sitio.findAll();
       
        return sitios.map(sitio => sitio.url);
    } catch (error) {
        console.error("❌ Error al obtener los sitios:", error);
        return [];
    }
};

// Actualizar orígenes permitidos
const updateAllowedOrigins = async () => {
    try {
        const sitios = await getAllowedOrigins();
        cachedOrigins = new Set([...sitios, "http://localhost:5173", "http://localhost"]);
        console.log("✅ Orígenes actualizados correctamente");
    } catch (error) {
        console.error("❌ Error al actualizar orígenes:", error);
    }
};

const clienteIdiomas = {};
// Configuración de sockets
const configureSockets = (io) => {
    updateAllowedOrigins();
    setInterval(updateAllowedOrigins, 60000);
    io.on("connection", async (socket) => {
        const { sitioId, userId, rol} = socket.handshake.query;
        const origin = socket.handshake.headers.origin;

        console.log(`🟢 Conexión: sitio=${sitioId}, usuario=${userId}, rol=${rol}, origin=${origin}`);

        if (origin && !cachedOrigins.has(origin)) {
            console.log(`❌ Origen bloqueado por CORS: ${origin}`);
            return socket.disconnect();
        }

        if (userId) connectedUsers[userId] = socket.id;

        // 🔐 Unirse a sala general del sitio (opcional)
        socket.join(`sitio_${sitioId}`);

        if (rol === "asesor" || rol === "coordinador") {
            socket.join(`asesores_${sitioId}`);
        }
     
        // 🔁 Evento para unirse a un chat específico
        socket.on("joinChat", (chatId) => {
            socket.join(`chat_${chatId}`);
            console.log(`🧩 Usuario ${userId} unido a chat_${chatId}`);
        });

        // 💬 Evento para recibir y reenviar un mensaje
        socket.on("respuesta", async (data) => {
            const { chatId, contenido, enviadoPor, createdAt, rol } = data;
          
            console.log(`💬 Mensaje recibido: "${contenido}" de ${enviadoPor} en chat ${chatId}`);
          
            try {
              const chat = await Chat.findOne({ where: { id: chatId } });
              if (!chat) return;
          
              let contenidoTraducido = contenido;
          
              if (enviadoPor === "cliente") {
                // Traducir al español para el asesor usando Gemini
                const resultado = await traducirMensajeGemini(contenido, "es", rol);
                contenidoTraducido = resultado.contenidoTraducido;
          
                // Guardar idioma detectado del cliente
                clienteIdiomas[chat.cliente_id] = resultado.idiomaDetectado;
          
                // Guardar mensaje traducido en base de datos
                await Mensaje.create({
                  chat_id: chatId,
                  contenido: contenidoTraducido,
                  enviado_por: enviadoPor,
                  createdAt: new Date(createdAt)
                });
          
                console.log(`🧠 Idioma del cliente detectado: ${resultado.idiomaDetectado}`);
              }
          
              if (enviadoPor === "asesor") {
                const idiomaCliente = clienteIdiomas[chat.cliente_id];
                console.log(`📘 Idioma del cliente desde el asesor: ${idiomaCliente}`);
          
                if (idiomaCliente) {
                  const resultado = await traducirMensajeGemini(contenido, idiomaCliente, rol);
                  contenidoTraducido = resultado.contenidoTraducido;
          
                  // Guardar mensaje traducido (si lo necesitas)
                  await Mensaje.create({
                    chat_id: chatId,
                    contenido: contenidoTraducido,
                    enviado_por: enviadoPor,
                    createdAt: new Date(createdAt)
                  });
          
                  console.log(`✅ Mensaje traducido al idioma del cliente: ${idiomaCliente}`);
                }
              }
          
              // Enviar mensaje traducido a la sala
              socket.to(`chat_${chatId}`).emit("mensaje", {
                chatId,
                contenido: contenidoTraducido,
                enviado_por: enviadoPor,
                createdAt
              });
          
              console.log(`📨 Mensaje reenviado a sala chat_${chatId}`);
            } catch (error) {
              console.error("❌ Error al manejar respuesta:", error);
            }
          });

        // 🔌 Desconexión
        socket.on("disconnect", () => {
            if (userId) delete connectedUsers[userId];
            console.log(`🔴 Usuario desconectado: ${userId}`);
        });
    });

};

module.exports = {
    configureSockets,
    cachedOrigins,
    updateAllowedOrigins,
    getAllowedOrigins
  };