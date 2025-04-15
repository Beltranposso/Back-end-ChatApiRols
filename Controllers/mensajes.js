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
