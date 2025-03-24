const ChatModel = require('../Models/Chats.js');
const {ClienteAnonimo, Chat,Mensaje,Usuario} = require('../Models/Relaciones.js');

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
                message: "No hay Chats"
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


exports.getChatByuser = async (req, res) => {
    try {
        const chats = await ChatModel.findAll({

            attributes: ['id', 'estado'], // Solo obtenemos el ID y el estado del chat
                include: [
                {
                    model: ClienteAnonimo,
                    as: 'clientes',
                    as: 'cliente',
                    attributes: ['id', 'nombre','Estado'] // Obtenemos el ID y el nombre del cliente
                }
            ]
        });
        

        res.json(chats);
    } catch (error) {
        console.error('Error al obtener los chats:', error);
        res.status(500).json({ error: 'Error al obtener los chats' });
    }
};

exports.getChaIdtByuser = async (req, res) => {
    const { id } = req.params;
    try {
        const chat = await Chat.findOne({
            where: { id },
            attributes: ['id', 'estado'], // Obtener solo el ID y estado del chat
            include: [
                {
                    model: ClienteAnonimo,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'Estado'] // Obtener ID y nombre del cliente
                },{
                    model: Usuario,
                    as: 'asesor',
                    attributes: ['id', 'nombre', 'rol'],
                    // Solo trae chats que tengan un Usuario asignado
                },
                {
                    model: Mensaje,
                    as: 'mensajes',
                    attributes: ['id', 'contenido', 'enviado_por', 'createdAt'], // Obtener mensajes del chat
                    order: [['createdAt', 'ASC']] // Ordenar mensajes por fecha de creación
                }
            ]
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat no encontrado' });
        }

        res.json(chat);
    } catch (error) {
        console.error('Error al obtener el chat:', error);
        res.status(500).json({ error: 'Error al obtener el chat' });
    }
};



exports.getChatBycoordinador = async (req, res) => {
    try {
        const chats = await ChatModel.findAll({
            attributes: ['id', 'estado'], // Solo obtenemos el ID y el estado del chat
            include: [
                {
                    model: ClienteAnonimo,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'Estado'],
                    required: true // Solo trae chats que tengan un ClienteAnonimo
                },
                {
                    model: Usuario,
                    as: 'asesor',
                    attributes: ['id', 'nombre', 'rol'],
                    required: true // Solo trae chats que tengan un Usuario asignado
                }
            ]
        });

        res.json(chats);
    } catch (error) {
        console.error('Error al obtener los chats:', error);
        res.status(500).json({ error: 'Error al obtener los chats' });
    }
};
