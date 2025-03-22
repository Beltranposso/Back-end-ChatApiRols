const express = require('express');
const { getAllUsers,getUser} = require('../Controllers/usuarios.js');

const router = express.Router();

router.get('/',getAllUsers );
router.get('/:id',getUser );

module.exports = router;
 