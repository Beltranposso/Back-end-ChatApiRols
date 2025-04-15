const Chat  = require('../Models/Chats');
const Mensaje = require('../Models/Mensajes');
const Sitio = require('../Models/Sitios.js');
let allowedOrigins = new Set();
let usuariosConectados = {};

const getAllowedOrigins = async () => {
    const sitios = await Sitio.findAll();
    return sitios.map(sitio => sitio.url);
};

const actualizarAllowedOrigins = async () => {
    const sitios = await getAllowedOrigins();
    allowedOrigins = new Set(sitios);
    allowedOrigins.add("http://localhost:5173");
};

const addAllowedOrigin = async (origin) => {
    const existe = await Sitio.findOne({ where: { url: origin } });
    if (!existe) {
        await Sitio.create({ url: origin });
        allowedOrigins.add(origin);
        console.log(`✅ Origen agregado: ${origin}`);
    }
};

actualizarAllowedOrigins();
setInterval(actualizarAllowedOrigins, 60000);

module.exports = (io) => {
    io.on("connection", async (socket) => {
        const { sitioId, userId, rol } = socket.handshake.query;
        const origin = socket.handshake.headers.origin;

        console.log(`🟢 Nueva conexión desde ${origin}, sitio: ${sitioId}, usuario: ${userId}, rol: ${rol}`);

        if (allowedOrigins && origin && !allowedOrigins.has(origin)) {
            await addAllowedOrigin(origin);
        }

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
            const { chatId, contenido, enviadoPor, createdAt } = data;

            const chat = await Chat.findOne({ where: { id: chatId } });

            if (!chat) {
                console.log(`❌ Chat no encontrado: ${chatId}`);
                return;
            }

            await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });

            socket.broadcast.emit('mensaje', { chatId, contenido, enviado_por: enviadoPor, createdAt });
            io.emit('Mensaje23', { chatId, contenido, enviado_por: enviadoPor, createdAt });
        });

        socket.on('escribiendo', ({ chatId, userId }) => {
            io.to(`sitio_${sitioId}`).emit('escribiendo', { chatId, userId });
        });

        socket.on('detenerEscribiendo', ({ chatId, userId }) => {
            io.to(`sitio_${sitioId}`).emit('detenerEscribiendo', { chatId, userId });
        });

        socket.on("mensaje", async (data) => {
            const { chatId, contenido, enviadoPor } = data;

            await Mensaje.create({ chat_id: chatId, contenido, enviado_por: enviadoPor });

            io.to(`asesores_${sitioId}`).emit("mensaje", data);

            const chat = await Chat.findOne({ where: { id: chatId } });
            if (chat && usuariosConectados[chat.cliente_id]) {
                io.to(usuariosConectados[chat.cliente_id]).emit("mensaje", data);
            }
        });

        socket.on("disconnect", () => {
            delete usuariosConectados[userId];
        });
    });
};