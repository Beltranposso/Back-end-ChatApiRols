const express = require('express');
const { getAllMesnajes,getUMensjaes,createMensaje} = require('../Controllers/mensajes.js');

const router_2 = express.Router();

router_2.get('/',getAllMesnajes);
router_2.get('/:id',getUMensjaes);
router_2.post('/createMensaje/',createMensaje);

module.exports = router_2;
 