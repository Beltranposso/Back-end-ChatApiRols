const express = require('express');
const { getAllUsers,getUser,createUsers} = require('../Controllers/usuarios.js');

const router = express.Router();

router.get('/',getAllUsers );
router.get('/:id',getUser );
router.post('/createUsers/sitio',createUsers);

module.exports = router;
 