// Importa los modelos necesarios
const Sitio = require('./Sitios.js');
const Usuario = require('./Usuarios.js');
const ClienteAnonimo = require('./UsuariosAnonimos.js');
const Chat = require('./Chats.js');
const Mensaje = require('./Mensajes.js');

// Relación: Sitio -> Usuarios
// Un sitio puede tener muchos usuarios
Sitio.hasMany(Usuario, {
    foreignKey: 'sitio_id',
    as: 'usuarios'
});
// Un usuario pertenece a un sitio
Usuario.belongsTo(Sitio, {
    foreignKey: 'sitio_id',
    as: 'sitio'
});

// Relación: Sitio -> Clientes Anónimos
// Un sitio puede tener muchos clientes anónimos
Sitio.hasMany(ClienteAnonimo, {
    foreignKey: 'sitio_id',
    as: 'clientesAnonimos'
});
// Un cliente anónimo pertenece a un sitio
ClienteAnonimo.belongsTo(Sitio, {
    foreignKey: 'sitio_id',
    as: 'sitio'
});

// Relación: Sitio -> Chats
// Un sitio puede tener muchos chats
Sitio.hasMany(Chat, {
    foreignKey: 'sitio_id',
    as: 'chats'
});
// Un chat pertenece a un sitio
Chat.belongsTo(Sitio, {
    foreignKey: 'sitio_id',
    as: 'sitio'
});

// Relación: Cliente Anónimo -> Chats
// Un cliente anónimo puede tener muchos chats
ClienteAnonimo.hasMany(Chat, {
    foreignKey: 'cliente_id',
    as: 'chats'
});
// Un chat pertenece a un cliente anónimo
Chat.belongsTo(ClienteAnonimo, {
    foreignKey: 'cliente_id',
    as: 'cliente'
});

// Relación: Usuario (Asesor) -> Chats
// Un usuario (asesor) puede atender muchos chats
Usuario.hasMany(Chat, {
    foreignKey: 'asesor_id',
    as: 'chatsAtendidos'
});
// Un chat es atendido por un usuario (asesor)
Chat.belongsTo(Usuario, {
    foreignKey: 'asesor_id',
    as: 'asesor'
});

// Relación: Chat -> Mensajes
// Un chat puede tener muchos mensajes
Chat.hasMany(Mensaje, {
    foreignKey: 'chat_id',
    as: 'mensajes'
});
// Un mensaje pertenece a un chat
Mensaje.belongsTo(Chat, {
    foreignKey: 'chat_id',
    as: 'chat'
});

// Exporta los modelos y sus relaciones para que puedan ser utilizados en otras partes de la aplicación
module.exports = {
    Sitio,
    Usuario,
    ClienteAnonimo,
    Chat,
    Mensaje
};