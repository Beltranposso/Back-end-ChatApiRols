


const MensajeModel = require('../Models/Mensajes.js');


exports.getAllMesnajes = async (req, res) => {
    try {
        const Users = await MensajeModel.findAll();
        res.json(Users);
    } catch (error) {
        console.log("Hubo un error al traer los Mensajes");
        res.json({
            "message": error.message
        });
    } 
};




exports.getUMensjaes = async (req, res) => {
    try {
        const user = await MensajeModel.findAll({
            where: { id: req.params.id  }
        });

        if (user.length === 0) {
            // Si no se encuentra ningún usuario, se retorna un JSON predeterminado
            return res.json({
                message: "No hay Mensjaes",
                id_card: req.params.id,
                data: null
            });
        }

        // Si se encuentran usuarios, se retorna el resultado
        res.json(user);
    } catch (error) {
        console.error("Hubo un error al traer los usuarios:", error.message);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

exports.createMensaje = async (req, res) => {
    try {
        const { chatId, contenido, enviadoPor,DateNow } = req.body;
      
        // Validación básica
        if (!chatId || !contenido || !enviadoPor) {
            return res.status(400).json({
                message: "Faltan datos requeridos (chatId, contenido o enviadoPor)."
            });
        }

        // Crear el mensaje
        const nuevoMensaje = await MensajeModel.create({
            chat_id: chatId,
            contenido: contenido,
            enviado_por: enviadoPor,
            createdAt: DateNow
        });
 
        res.status(201).json({
            message: "Mensaje creado exitosamente",
            data: nuevoMensaje
        });
    } catch (error) {
        console.error("❌ Error al crear el mensaje:", error.message);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};
