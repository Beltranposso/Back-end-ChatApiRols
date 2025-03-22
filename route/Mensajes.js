const express = require('express');
const { getAllMesnajes,getUMensjaes} = require('../Controllers/mensajes.js');

const router_2 = express.Router();

router_2.get('/',getAllMesnajes);
router_2.get('/:id',getUMensjaes);

module.exports = router_2;
 