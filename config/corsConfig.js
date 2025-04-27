const cors = require('cors');
const Sitio = require('../Models/Sitios.js');

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

// Middleware para configurar CORS dinámicamente
const configureCors = async (req, res, next) => {
    try {
        const fixedURL = ["http://localhost:5173", "http://localhost"];
        const allowedOrigins = await getAllowedOrigins();

        const corsOptions = {
            origin: (origin, callback) => {
                if (!origin || fixedURL.includes(origin) || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
        };

        cors(corsOptions)(req, res, next);
    } catch (error) {
        console.error("❌ Error al configurar CORS:", error);
        res.status(500).json({ message: "Error al configurar CORS" });
    }
};

module.exports = configureCors;