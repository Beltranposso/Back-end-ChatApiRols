// Importa la conexión a la base de datos desde el archivo conexion.js
const db = require ("../ConexionDB/conexion.js");

// Importa el módulo DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

// Importa el módulo uuid para generar identificadores únicos
const { v4: uuidv4 } = require("uuid");

// Define el modelo 'clientes_anonimos' con sus respectivos campos y configuraciones
const Tabla = db.define('clientes_anonimos',{

    // Campo 'id' de tipo cadena de texto, con valor por defecto generado por uuid, no nulo y clave primaria
    id: {
        type: DataTypes.STRING,
        defaultValue: () => uuidv4(), // Generar un UUID por defecto
        allowNull: true,
        primaryKey: true
    },
    // Campo 'sitio_id' de tipo cadena de texto y no nulo
    sitio_id: {
        type: DataTypes.STRING,
        allowNull: false
    },   
    // Campo 'nombre' de tipo cadena de texto y no nulo
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'ip' de tipo cadena de texto y puede ser nulo
    ip: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

// Exporta el modelo 'clientes_anonimos' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Tabla;