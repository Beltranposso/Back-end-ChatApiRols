const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const Usermodel = require('../Models/Usuarios.js');

module.exports = (app) => {
    app.post('/login', async (req, res) => {
        try {
            const { nombre, password } = req.body;

            if (!nombre || !password) {
                return res.status(400).json({ message: 'Faltan datos de inicio de sesión' });
            }

            const user = await Usermodel.findOne({ where: { nombre, password } });

            if (!user) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            const token = jwt.sign(
                { id: user.id, Nombre: user.nombre, rol: user.rol, Sitio_id: user.sitio_id },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.setHeader('Set-Cookie', cookie.serialize('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 86400,
            }));

            return res.status(200).json({
                message: 'Inicio de sesión exitoso',
                usuario: { id: user.id, Nombre: user.nombre, Cargo: user.rol }
            });
        } catch (error) {
            console.error('Error en el servidor:', error);
            return res.status(500).json({ message: 'Error en el servidor. Por favor intenta de nuevo más tarde.' });
        }
    });

    app.post('/logout', (req, res) => {
        try {
            res.setHeader('Set-Cookie', cookie.serialize('token', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                expires: new Date(0),
            }));
            return res.status(200).json({ message: 'Sesión cerrada y cookie eliminada' });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
    });

    app.get('/get-user-info', (req, res) => {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            const { id, rol, Nombre, Sitio_id } = decoded;
            res.json({ id, rol, Nombre, Sitio_id });
        });
    });
};