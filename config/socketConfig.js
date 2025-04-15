const Sitio = require('../Models/Sitios.js');
const Chat = require('../Models/Chats.js');
const Mensaje = require('../Models/Mensajes.js');
const { translateText } = require('../services/tranlate.js');

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

// Configuración de sockets
const configureSockets = (io) => {
    updateAllowedOrigins();
    setInterval(updateAllowedOrigins, 60000);

    io.on("connection", async (socket) => {
        const { sitioId, userId, rol } = socket.handshake.query;
        const origin = socket.handshake.headers.origin;

        console.log(`🟢 Nueva conexión desde ${origin}, sitio: ${sitioId}, usuario: ${userId}, rol: ${rol}`);

        if (origin && !cachedOrigins.has(origin)) {
            console.log(`❌ Origen bloqueado por CORS: ${origin}`);
            return socket.disconnect();
        }

        if (userId) connectedUsers[userId] = socket.id;

        socket.join(`sitio_${sitioId}`);
        if (rol === 'asesor' || rol === 'coordinador') {
            socket.join(`asesores_${sitioId}`);
        }

        socket.on('respuesta', async (data) => {
            const { chatId, contenido, enviadoPor, createdAt } = data;

            try {
                const chat = await Chat.findOne({ where: { id: chatId } });
                if (!chat) return;

                await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });

                const translatedText = await translateText(contenido, "en-GB", "3bd481ab-293f-4ac8-a3cb-092066f0ea61:fx");

                io.to(`sitio_${sitioId}`).emit('mensaje', { chatId, translatedText, enviado_por: enviadoPor, createdAt });
            } catch (error) {
                console.error("❌ Error al manejar respuesta:", error);
            }
        });

        socket.on("disconnect", () => {
            if (userId) delete connectedUsers[userId];
        });
    });
};

module.exports = configureSockets;