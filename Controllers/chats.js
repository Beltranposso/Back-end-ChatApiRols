const ChatModel = require('../Models/Chats.js');
const {ClienteAnonimo, Chat,Mensaje,Usuario,Sitio} = require('../Models/Relaciones.js');

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
                     // Ordenar mensajes por fecha de creación
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



exports.createChat = async (req, res) => {

    try {
        const { nombre, correo, sitio_id } = req.body;

        // Validar que los datos requeridos estén presentes
        if (!nombre || !correo || !sitio_id) {
            return res.status(400).json({ message: "Nombre, correo y sitio_id (nombre del sitio) son obligatorios" });
        }

        // Buscar el sitio en la base de datos por su nombre
        const sitio = await Sitio.findOne({ where: { url: sitio_id } });

        // Verificar si el sitio existe
        if (!sitio) {
            return res.status(404).json({ message: "El sitio no existe en la base de datos" });
        }

        // Crear cliente anónimo en la base de datos con el ID del sitio encontrado
        const nuevoCliente = await ClienteAnonimo.create({ nombre, correo, sitio_id: sitio.id });

        // Crear un nuevo chat con el ID del cliente anónimo generado y el ID del sitio
        const nuevoChat = await ChatModel.create({cliente_id: nuevoCliente.id, sitio_id: sitio.id });

        res.status(201).json({
            message: "Chat creado con éxito",
            chat: nuevoChat
        });

    } catch (error) {
        console.error("Error al crear el chat anónimo:", error);
        res.status(500).json({ message: "Hubo un error al crear el chat" });
    }
};


exports.AssesorEntraAlchat = async (req, res) => {
    try {
        const { id } = req.params;
        const { idAsesor } = req.body;

        // Buscar el chat en la base de datos por su ID
        const chat = await ChatModel.findByPk(id);
 
        // Verificar si el chat existe
        if (!chat) {
            return res.status(404).json({ message: "El chat no existe en la base de datos" });
        }

        // Asignar el asesor al chat
        chat.asesor_id = idAsesor;
        await chat.save();

        res.status(200).json({ message: "Asesor asignado al chat con éxito" });
    } catch (error) {
        console.error("Error al asignar el asesor al chat:", error);
        res.status(500).json({ message: "Hubo un error al asignar el asesor al chat" });
    }
};



