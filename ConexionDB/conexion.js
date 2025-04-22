require("dotenv").config(); // Cargar variables de entorno
const { Sequelize } = require("sequelize");

const ConexionDB = new Sequelize(
    process.env.DB_NAME,     // Nombre de la BD
    process.env.DB_USER,     // Usuario
    process.env.DB_PASS,     // Contraseña
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || "mysql", // 🔥 Asegurar que haya un dialecto definido
        logging: true, // 🔇 Evita logs innecesarios de Sequelize en la consola
    }
);  
    
// Verificar conexión 
(async () => {
    try {
        await ConexionDB.authenticate();
        console.log("✅ Conexión a la base de datos exitosa.");
    } catch (error) {
        console.error("❌ Error de conexión a la base de datos:", error);
    }
})(); 

module.exports = ConexionDB;
