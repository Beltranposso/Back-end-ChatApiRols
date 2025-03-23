const Sitio = require('./Sitios.js');
const Usuario = require('./Usuarios.js');
const ClienteAnonimo = require('./UsuariosAnonimos.js');
const Chat = require('./Chats.js');
const Mensaje = require('./Mensajes.js');

// Relación: Sitio -> Usuarios
Sitio.hasMany(Usuario, {
    foreignKey: 'sitio_id',
    as: 'usuarios'
});
Usuario.belongsTo(Sitio, {
    foreignKey: 'sitio_id',
    as: 'sitio'
});

// Relación: Sitio -> Clientes Anónimos
Sitio.hasMany(ClienteAnonimo, {
    foreignKey: 'sitio_id',
    as: 'clientesAnonimos'
});
ClienteAnonimo.belongsTo(Sitio, {
    foreignKey: 'sitio_id',
    as: 'sitio'
});

// Relación: Sitio -> Chats
Sitio.hasMany(Chat, {
    foreignKey: 'sitio_id',
    as: 'chats'
});
Chat.belongsTo(Sitio, {
    foreignKey: 'sitio_id',
    as: 'sitio'
});

// Relación: Cliente Anónimo -> Chats
ClienteAnonimo.hasMany(Chat, {
    foreignKey: 'cliente_id',
    as: 'chats'
});
Chat.belongsTo(ClienteAnonimo, {
    foreignKey: 'cliente_id',
    as: 'cliente'
});

// Relación: Usuario (Asesor) -> Chats
Usuario.hasMany(Chat, {
    foreignKey: 'asesor_id',
    as: 'chatsAtendidos'
});
Chat.belongsTo(Usuario, {
    foreignKey: 'asesor_id',
    as: 'asesor'
});

// Relación: Chat -> Mensajes
Chat.hasMany(Mensaje, {
    foreignKey: 'chat_id',
    as: 'mensajes'
});
Mensaje.belongsTo(Chat, {
    foreignKey: 'chat_id',
    as: 'chat'
});

module.exports = {
    Sitio,
    Usuario,
    ClienteAnonimo,
    Chat,
    Mensaje
};