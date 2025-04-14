const express = require('express');
const {getAllChats,getUChat ,getChatByuser,getChaIdtByuser,getChatBycoordinador,createChat, AssesorEntraAlchat,getChatsAbiertos,getChatsCerrados} = require('../Controllers/chats.js');

const router = express.Router();

const {verificarSesion} = require('../verificacion/verificacionsecio.js');


router.get('/', verificarSesion, getAllChats);
router.get('/:id', verificarSesion, getUChat);
router.get('/chatByuser/u/', getChatByuser);
router.get('/chatByuser/c/:id', getChaIdtByuser);
router.get('/chatBycoordinador/c/', verificarSesion, getChatBycoordinador);
router.get('/chatAbiertos/A/',getChatsAbiertos);
router.get('/chatCerrados/C/', getChatsCerrados);
router.post('/createChat',createChat);
router.post('/AssesorEntraAlchat/:id',AssesorEntraAlchat);





module.exports = router;
   