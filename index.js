// Config imports
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

// Model imports
const Sitio = require('./Models/Sitios.js');
const Chat = require('./Models/Chats.js');
const Mensaje = require('./Models/Mensajes.js');
const Usermodel = require('./Models/Usuarios.js');

// Route imports
const Routerusers = require('./route/Usuarios.js');
const Routerchats = require('./route/Chats.js');
const Routermensajes = require('./route/Mensajes.js');
const RouterusuariosAnonimos = require('./route/usuariosAnonimos.js');

// Service imports
const { translateText } = require('./services/tranlate.js');
const { login, logout } = require('./authRoutes/aouthRoes.js');
const { Get_Info } = require('./authRoutes/userPersonalinfo.js');

// Initialize app and server
const app = express();
const server = http.createServer(app);

// CORS and origins management
/**
 * Gets allowed origins from the database
 * @returns {Promise<string[]>} Array of allowed URLs
 */
const getAllowedOrigins = async () => {
    try {
        const sitios = await Sitio.findAll();
        return sitios.map(sitio => sitio.url);
    } catch (error) {
        console.error("❌ Error retrieving sites:", error);
        return [];
    }
};

// In-memory cache for allowed origins
let cachedOrigins = new Set();
const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost"];

/**
 * Updates the cached allowed origins
 */
const updateAllowedOrigins = async () => {
    try {
        const sitios = await getAllowedOrigins();
        cachedOrigins = new Set([...sitios, ...DEFAULT_ALLOWED_ORIGINS]);
        console.log("✅ Origins updated successfully");
    } catch (error) {
        console.error("❌ Error updating origins:", error);
    }
};

/**
 * Adds a new origin to the database if it doesn't exist
 * @param {string} origin - The origin URL to add
 */
const addAllowedOrigin = async (origin) => {
    try {
        const existe = await Sitio.findOne({ where: { url: origin } });
        if (!existe) {
            await Sitio.create({ url: origin });
            cachedOrigins.add(origin);
            console.log(`✅ Origin added: ${origin}`);
        }
    } catch (error) {
        console.error(`❌ Error adding origin: ${origin}`, error);
    }
};

// Initialize cached origins
updateAllowedOrigins();
// Update origins periodically (every minute)
setInterval(updateAllowedOrigins, 60000);

// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: async (origin, callback) => {
            if (!origin || cachedOrigins.has(origin)) {
                callback(null, true);
            } else {
                console.log(`❌ Origin blocked by CORS: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    }
});

// Middleware setup
app.use(async (req, res, next) => {
    // Get up-to-date origins for CORS
    const allowedOrigins = await getAllowedOrigins();
    
    const corsOptions = {
        origin: (origin, callback) => {
            if (!origin || DEFAULT_ALLOWED_ORIGINS.includes(origin) || allowedOrigins.includes(origin)) {
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

// Routes
app.post('/login', login);
app.post('/Logout', logout);
app.use('/usuarios', Routerusers);
app.use('/chats', Routerchats);
app.use('/mensajes', Routermensajes);
app.use('/usuariosAnonimos', RouterusuariosAnonimos);
app.get('/get-user-info', Get_Info);

// Track connected users
const connectedUsers = {};

// Socket.IO connection handling
io.on("connection", async (socket) => {
    const { sitioId, userId, rol } = socket.handshake.query;
    const origin = socket.handshake.headers.origin;

    console.log(`🟢 New connection from ${origin}, site: ${sitioId}, user: ${userId}, role: ${rol}`);

    // Add origin if new
    if (origin && !cachedOrigins.has(origin)) {
        await addAllowedOrigin(origin);
    }

    // Verify site exists
    const sitio = await Sitio.findByPk(sitioId);
    if (!sitio) {
        console.log(`⚠️ Warning: Site ${sitioId} not registered in DB.`);
    } else {
        console.log(`✅ Site ${sitioId} found.`);
    }

    // Track user connection
    if (userId) {
        connectedUsers[userId] = socket.id;
    }

    // Join site room
    socket.join(`sitio_${sitioId}`);

    // Advisors join advisor room
    if (rol === 'asesor' || rol === 'coordinador') {
        socket.join(`asesores_${sitioId}`);
        console.log(`📢 ${rol.toUpperCase()} connected on site ${sitioId}: ${userId}`);
    }

    // Handle message response
    socket.on('respuesta', async (data) => {
        const { chatId, contenido, enviadoPor, createdAt } = data;

        try {
            const chat = await Chat.findOne({ where: { id: chatId } });
            
            if (!chat) {
                console.log(`❌ Chat not found: ${chatId}`);
                return;
            }
        
            const { cliente_id } = chat;
        
            console.log(`📝 RESPONSE from ${enviadoPor} -> Client ${cliente_id}: "${contenido}"`);
        
            // Save to database
            await Mensaje.create({ 
                chat_id: chatId, 
                contenido, 
                enviado_por: enviadoPor 
            });
            
            // Translate message
            const translatedText = await translateText(
                contenido, 
                "en-GB", 
                "3bd481ab-293f-4ac8-a3cb-092066f0ea61:fx"
            );
      
            // Send to specific users
            socket.broadcast.emit('mensaje', {
                chatId, 
                translatedText,
                enviado_por: enviadoPor,
                createdAt
            });

            // Send to everyone
            io.emit('Mensaje23', {
                chatId, 
                contenido,
                enviado_por: enviadoPor,
                createdAt
            });
        } catch (error) {
            console.error("❌ Error handling response:", error);
        }
    });

    // Handle typing notifications
    socket.on('escribiendo', ({ chatId, userId }) => {
        console.log(`✍️ User ${userId} is typing in chat ${chatId}`);
        io.to(`sitio_${sitioId}`).emit('escribiendo', { chatId, userId });
    }); 

    socket.on('detenerEscribiendo', ({ chatId, userId }) => { 
        console.log(`🛑 User ${userId} stopped typing in chat ${chatId}`);
        io.to(`sitio_${sitioId}`).emit('detenerEscribiendo', { chatId, userId });
    });

    // Handle client messages
    socket.on("mensaje", async (data) => {
        try {
            const { chatId, contenido, enviadoPor } = data;
            console.log(`📩 Client sent message on site ${sitioId}:`, data);

            // Save to database
            await Mensaje.create({ 
                chat_id: chatId, 
                contenido, 
                enviado_por: enviadoPor 
            });
      
            console.log(`🔹 Emitting "mensaje" event to room asesores_${sitioId}`);
            
            // Send to advisors
            io.to(`asesores_${sitioId}`).emit("mensaje", data);
            
            // Send to the client in that chat
            const chat = await Chat.findOne({ where: { id: chatId } });
            if (chat && connectedUsers[chat.cliente_id]) {
                io.to(connectedUsers[chat.cliente_id]).emit("mensaje", data);
                console.log(`✅ Message sent to client ${chat.cliente_id}`);
            }
        } catch (error) {
            console.error("❌ Error handling message:", error);
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        if (userId) {
            console.log(`❌ User disconnected: ${userId}`);
            delete connectedUsers[userId];
        }
    });
});

// API endpoints
app.get('/translate/:text', async (req, res) => {
    try {
        const translatedText = await translateText(
            req.params.text, 
            "en-GB", 
            "3bd481ab-293f-4ac8-a3cb-092066f0ea61:fx"
        );
        
        res.json({ 
            originalText: req.params.text,
            translatedText 
        });
    } catch (error) {
        console.error("Error translating:", error);
        res.status(500).json({ 
            error: "Error translating text",
            details: error.message 
        });
    }
});

// Home route
app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Server running 🚀</title>
          <style>
            body {
              background-color: #f5f5f5;
              font-family: Arial, sans-serif;
              text-align: center;
              padding-top: 100px;
            }
            h1 {
              color: #333;
            }
          </style>
        </head>
        <body>
          <h1>Server running 🚀</h1>
          <p>Welcome to the backend of the application 🧠</p>
        </body>
      </html>
    `);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 