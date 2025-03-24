const db = require ("../ConexionDB/conexion.js") 
const { DataTypes } = require("sequelize");


 const Tabla = db.define('sitios',{

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    }
   
})


module.exports = Tabla 