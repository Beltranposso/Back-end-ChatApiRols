// Importa la conexión a la base de datos desde el archivo conexion.js
const db = require ("../ConexionDB/conexion.js");

// Importa el módulo DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

// Importa el módulo uuid para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

// Define el modelo 'mensajes' con sus respectivos campos y configuraciones
const Tabla = db.define('mensajes',{

    // Campo 'id' de tipo cadena de texto, con valor por defecto generado por uuid, no nulo y clave primaria
    id: {
        type: DataTypes.STRING,
        defaultValue: () => uuidv4(), // Generar un UUID por defecto
        allowNull: true,
        primaryKey: true
    },
    // Campo 'chat_id' de tipo cadena de texto y no nulo
    chat_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'contenido' de tipo cadena de texto y no nulo
    contenido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'enviado_por' de tipo enumeración con valores 'Cliente' y 'Asesor', no nulo
    enviado_por: {
        type: DataTypes.ENUM('Cliente', 'Asesor'),
        allowNull: false
    },
    // Campo 'createdAt' de tipo fecha y no nulo
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
})

// Exporta el modelo 'mensajes' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Tabla;