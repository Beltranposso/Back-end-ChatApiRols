const db = require ("../ConexionDB/conexion.js") 
const { DataTypes } = require("sequelize");



 const Tabla = db.define('usuarios',{

    id: {
        type: DataTypes.INTEGER,

        allowNull: true,
        primaryKey: true
    },
    sitio_id: {
        type: DataTypes.STRING,
        allowNull: false
    },   
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
 
    password: { 
        type: DataTypes.STRING,
        allowNull: false
    },rol: {
        type: DataTypes.STRING,
        allowNull: false
    }
   
})


module.exports = Tabla  