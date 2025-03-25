const Usermodel = require('../Models/Usuarios.js');
const Sitiomo = require('../Models/Sitios.js');
const {Sitio, Usuario} = require('../Models/Relaciones.js');

exports.getAllUsers = async (req, res) => {
    try {
        const Users = await Usermodel.findAll();
        res.json(Users);
    } catch (error) {
        console.log("Hubo un error al traer los usuarios");
        res.json({
            "message": error.message
        });
    } 
};




exports.getUser = async (req, res) => {
    try {
        const user = await Usermodel.findAll({
            where: { id: req.params.id  }
        });

        if (user.length === 0) {
            // Si no se encuentra ningún usuario, se retorna un JSON predeterminado
            return res.json({
                message: "No hay usuarios",
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

exports.createUsers = async (req, res) => {
    console.log("📩 Datos recibidos:", req.body);

    try {
        const { nombreCoordinador, passwordCoordinador, urlSitio, SitioNombre } = req.body;

        // 1️⃣ Crear el sitio
        const nuevoSitio = await Sitio.create({ url: urlSitio, nombre: SitioNombre });

        console.log("✅ Sitio creado con ID:", nuevoSitio.id);

        if (!nuevoSitio || !nuevoSitio.id) {
            throw new Error("No se pudo crear el sitio.");
        }

        // 2️⃣ Crear el usuario asociado al sitio recién creado
        const nuevoCoordinador = await Usuario.create({
            sitio_id: nuevoSitio.id, // 👈 Aquí asignamos el ID del sitio
            nombre: nombreCoordinador,
            password: passwordCoordinador, // 🚨 Se recomienda encriptar
            rol: "Coordinador"
        });



        // ✅ Respuesta exitosa con código 200
        res.status(200).json({
            status: "success",
            message: "Sitio y usuario creados exitosamente",
            sitio: nuevoSitio,
            usuario: nuevoCoordinador
        });

    } catch (error) {
        console.error("❌ Error al crear sitio y usuario coordinador:", error);
        res.status(500).json({ status: "error", message: "Error al crear sitio y usuario", error });
    }
};


