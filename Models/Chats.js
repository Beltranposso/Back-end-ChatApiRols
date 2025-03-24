const db = require ("../ConexionDB/conexion.js") 
const { DataTypes, INTEGER } = require("sequelize");



 const Tabla = db.define('chats',{
 
    id: {  // ✅ Definir correctamente el id
        type: DataTypes.INTEGER,  // Cambiar a BIGINT si esperas muchos registros
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

   sitio_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cliente_id: {
        type: DataTypes.STRING,  // Debes usar el MISMO tipo que el id al que referencia
        allowNull: false
    },
    asesor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }, 
    estado: {
        type: DataTypes.ENUM('Activo', 'Desconectado', 'Atendido'),
    }
   
})


module.exports = Tabla 