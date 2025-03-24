const jwt = require('jsonwebtoken');

exports.verificarSesion = (req, res, next) => {
    const token = req.cookies.token; // Leer la cookie 'token'

    if (!token) {
        return res.status(401).json({ error: 'No autorizado, falta token' });
    }

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET); // Verificar el token con la clave secreta
        req.usuario = usuario; // Guardar datos del usuario en `req`
        next(); // Continuar con la petición
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};
  