const express = require('express');
const {getAllChats,getUChat ,getChatByuser,getChaIdtByuser,getChatBycoordinador} = require('../Controllers/chats.js');

const router = express.Router();

const {verificarSesion} = require('../verificacion/verificacionsecio.js');


router.get('/', verificarSesion, getAllChats);
router.get('/:id', verificarSesion, getUChat);
router.get('/chatByuser/u/', verificarSesion, getChatByuser);
router.get('/chatByuser/c/:id', verificarSesion, getChaIdtByuser);
router.get('/chatBycoordinador/c/', verificarSesion, getChatBycoordinador);

module.exports = router;
   