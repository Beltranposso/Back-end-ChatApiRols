// Importa la conexión a la base de datos desde el archivo conexion.js
const db = require ("../ConexionDB/conexion.js");

// Importa el módulo DataTypes de Sequelize para definir los tipos de datos de los campos
const { DataTypes } = require("sequelize");

// Define el modelo 'sitios' con sus respectivos campos y configuraciones
const Tabla = db.define('sitios',{

    // Campo 'id' de tipo entero, autoincremental, no nulo y clave primaria
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    // Campo 'url' de tipo cadena de texto y no nulo
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Campo 'nombre' de tipo cadena de texto y no nulo
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
   
})

// Exporta el modelo 'sitios' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Tabla;