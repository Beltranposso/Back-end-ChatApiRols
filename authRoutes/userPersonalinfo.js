
const jwt = require('jsonwebtoken');
exports.Get_Info = (req, res) => {


 const token = req.cookies.token; // Obtener el token de la cookie HttpOnly

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' }); // Si no hay token, responder con 401
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' }); // Si el token es inválido, responder con 403
    }

    // Extraer el rol (cargo) del token y devolverlo
    const {id, rol,Nombre,Sitio_id} = decoded;
    console.log("Cargo a devolver :", Sitio_id);
    res.json({id, rol , Nombre,Sitio_id});
  });
};

