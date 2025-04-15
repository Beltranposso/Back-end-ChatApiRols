// Importar rutas
const Routerusers = require('../route/Usuarios.js');
const Routerchats = require('../route/Chats.js');
const Routermensajes = require('../route/Mensajes.js');
const RouterusuariosAnonimos = require('../route/usuariosAnonimos.js');
const { login, logout } = require('../authRoutes/aouthRoes.js');
const { Get_Info } = require('../authRoutes/userPersonalinfo.js');
const { translateText } = require('../services/tranlate.js');

const configureRoutes = (app) => {
    // Rutas de autenticación
    app.post('/login', login);
    app.post('/Logout', logout);
    app.get('/get-user-info', Get_Info);

    // Rutas principales
    app.use('/usuarios', Routerusers);
    app.use('/chats', Routerchats);
    app.use('/mensajes', Routermensajes);
    app.use('/usuariosAnonimos', RouterusuariosAnonimos);

    // Ruta de traducción
    app.get('/translate/:text', async (req, res) => {
        try {
            const translatedText = await translateText(
                req.params.text,
                "en-GB",
                "3bd481ab-293f-4ac8-a3cb-092066f0ea61:fx"
            );
            res.json({ originalText: req.params.text, translatedText });
        } catch (error) {
            console.error("Error translating:", error);
            res.status(500).json({ error: "Error translating text", details: error.message });
        }
    });
};

module.exports = configureRoutes;