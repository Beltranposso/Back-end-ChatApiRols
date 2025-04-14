
const Usermodel = require('../Models/Usuarios.js');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');





/**
 * Autenticar un usuario y generar un token de sesión.
 * 
 * @param {Object} req - Petición HTTP.
 * @param {Object} res - Respuesta HTTP.
 * 
 * @returns {Promise<void>}
 */

exports.login = async (req, res) => {
   
    try {
        const { nombre, password } = req.body;
  
        if (!nombre || !password) {
            return res.status(400).json({ message: 'Faltan datos de inicio de sesión' });
        }
  
        // Buscar el usuario por nombre
        const user = await Usermodel.findOne({ where: { nombre, password } });
  
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
  
        // Validar si la contraseña está almacenada en la base de datos
        if (!user.password) {
            return res.status(500).json({ message: 'Error: usuario sin contraseña almacenada' });
        }
  
        // Comparar la contraseña con bcrypt
       
  
        // Obtener el rol del usuario
        const userCargo = user.rol;
  
        // Crear token con información del usuario
        const token = jwt.sign(
            { id: user.id, Nombre:user.nombre, rol: user.rol,Sitio_id:user.sitio_id},
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
   
        // Configurar la cookie del token
        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 86400,
        }));
  
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            usuario: {
                id: user.id,
                Nombre: user.nombre,
                Cargo: user.rol
  
            }
        });
  
    } catch (error) {
        console.error('Error en el servidor:', error);
        return res.status(500).json({ message: 'Error en el servidor. Por favor intenta de nuevo más tarde.' });
    }


};

/* Función para cerrar sesión */
exports.logout = (req, res) => {
  try {
      res.setHeader('Set-Cookie', cookie.serialize('token', '', {
          httpOnly: true,
          secure: true, // Asegúrate de ajustarlo según el entorno
          sameSite: 'lax', // Igual que en el login
          path: '/',
          expires: new Date(0), // Fecha en el pasado para eliminar la cookie
      }));
      return res.status(200).json({ message: 'Sesión cerrada y cookie eliminada' });
  } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
  }
};









