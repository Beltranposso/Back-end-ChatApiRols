// Importa la conexión a la base de datos desde el archivo conexion.js
const db = require ("../ConexionDB/conexion.js");

// Importa el módulo DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

// Define el modelo 'usuarios' con sus respectivos campos y configuraciones
const Tabla = db.define('usuarios',{

    // Campo 'id' de tipo entero, no nulo y clave primaria
    id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true
    },
    // Campo 'sitio_id' de tipo entero y no nulo
    sitio_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },   
    // Campo 'nombre' de tipo cadena de texto y no nulo
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'password' de tipo cadena de texto y no nulo
    password: { 
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'rol' de tipo cadena de texto y no nulo
    rol: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

// Exporta el modelo 'usuarios' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Tabla;