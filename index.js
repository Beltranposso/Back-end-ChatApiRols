require('dotenv').config(); // Manejo de variables de entorno
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { translateText } = require('./services/tranlate.js');
const {traducirMensaje} = require('./services/GeminisTraslate.js');
// Importar configuraciones
const configureCors = require('./config/corsConfig');
const configureRoutes = require('./config/routesConfig');
const {configureSockets,getAllowedOrigins } = require('./config/socketConfig');
// Importar conexión a la base de datos
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: async (origin, callback) => {
        // Si no hay origen (como en conexiones directas), permitirlo
        if (!origin) return callback(null, true);
        
        // Siempre permitir conexiones locales para desarrollo
        if (origin === 'http://localhost' || origin === 'http://localhost:5173') {
          return callback(null, true);
        }
        
        try {
          // Obtener orígenes permitidos en tiempo real
          const allowedOrigins = await getAllowedOrigins();
          
          // Verificar si el origen está permitido
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          } else {
            console.log(`❌ Origen bloqueado por CORS en Socket.IO: ${origin}`);
            return callback(new Error('No permitido por CORS'));
          }
        } catch (error) {
          console.error("Error verificando origen:", error);
          // En caso de error, permitir el origen para evitar bloqueos inesperados
          // O puedes decidir bloquearlo por seguridad
          return callback(null, true);
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  

// Configuración de middlewares
app.use(express.json());
app.use(cookieParser());
app.use(configureCors);

// Configuración de rutas
configureRoutes(app);

// Configuración de sockets
configureSockets(io);
app.get('/translate/:text', async (req, res) => {
  try {
    const resultado = await traducirMensajeGemini(req.params.text, "en", "cliente");

    res.json({
      originalText: req.params.text,
      translatedText: resultado.contenidoTraducido,
      idiomaDetectado: resultado.idiomaDetectado
    });
  } catch (error) {
    console.error("❌ Error al traducir:", error);
    res.status(500).json({ error: "Error traduciendo el texto", detalles: error.message });
  }
});
// Ruta de prueba
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Servidor funcionando</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #4CAF50;
                    font-size: 24px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Servidor funcionando correctamente</h1>
            </div>
        </body>
        </html>
    `);
});


// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 