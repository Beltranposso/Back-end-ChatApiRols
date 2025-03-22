const express = require('express');
const { getAllUsersAnonimos,getUserAnonimo} = require('../Controllers/usuariosanonimos.js');

const router = express.Router();

router.get('/',getAllUsersAnonimos );
router.get('/:id', getUserAnonimo);

module.exports = router;
 