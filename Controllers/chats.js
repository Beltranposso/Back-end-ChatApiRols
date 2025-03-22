const ChatModel = require('../Models/Chats.js');


exports.getAllChats = async (req, res) => {
    try {
        const Users = await ChatModel.findAll();
        res.json(Users);
    } catch (error) {
        console.log("Hubo un error al traer los Chats");
        res.json({
            "message": error.message
        });
    } 
};




exports.getUChat = async (req, res) => {
    try {
        const user = await ChatModel.findAll({
            where: { id: req.params.id  }
        });

        if (user.length === 0) {
            // Si no se encuentra ningún usuario, se retorna un JSON predeterminado
            return res.json({
                message: "No hay Chats",
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
