// Importa la conexión a la base de datos desde el archivo conexion.js
const db = require ("../ConexionDB/conexion.js");

// Importa el módulo DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

// Define el modelo 'chats' con sus respectivos campos y configuraciones
const Tabla = db.define('chats',{

    // Campo 'id' de tipo entero, autoincremental, no nulo y clave primaria
    id: {
        type: DataTypes.INTEGER,  // Cambiar a BIGINT si esperas muchos registros
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    // Campo 'sitio_id' de tipo entero y puede ser nulo
    sitio_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Campo 'cliente_id' de tipo cadena de texto y no nulo
    cliente_id: {
        type: DataTypes.STRING,  // Debes usar el MISMO tipo que el id al que referencia
        allowNull: false
    },
    // Campo 'asesor_id' de tipo entero y puede ser nulo
    asesor_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }, 
    // Campo 'estado' de tipo enumeración con valores 'abierto', 'cerrado' y 'Atendido'
    estado: {
        type: DataTypes.ENUM('abierto', 'cerrado', 'Atendido'),
        allowNull: false,
        defaultValue: 'abierto'
    }
})

// Exporta el modelo 'chats' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Tabla;