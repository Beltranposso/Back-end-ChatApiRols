const db = require ("../ConexionDB/conexion.js") 
const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid"); 


 const Tabla = db.define('mensajes',{

    id: {
        type: DataTypes.STRING,
        defaultValue: () => uuidv4(), // Generar un UUID por defecto
        allowNull: true,
        primaryKey: true
    },
  chat_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contenido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enviado_por: {
        type: DataTypes.ENUM('Cliente', 'Asesor'),
        allowNull: false
    },createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    }

   
})

 
module.exports = Tabla       