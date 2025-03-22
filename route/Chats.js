const express = require('express');
const {getAllChats,getUChat } = require('../Controllers/chats.js');

const router = express.Router();

router.get('/', getAllChats);
router.get('/:id', getUChat);

module.exports = router;
 