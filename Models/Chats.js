const db = require ("../ConexionDB/conexion.js") 
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid"); 


 const Tabla = db.define('chats',{

    id: {
        type: DataTypes.STRING,
        defaultValue: () => uuidv4(), // Generar un UUID por defecto
        allowNull: true,
        primaryKey: true    
    },
   sitio_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cliente_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    asesor_id: {
        type: DataTypes.STRING,
        allowNull: true
    }, 
    estado: {
        type: DataTypes.ENUM('Activo', 'Desconectado', 'Atendido'),
    }
   
})


module.exports = Tabla 