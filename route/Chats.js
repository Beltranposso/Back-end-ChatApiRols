const express = require('express');
const {getAllChats,getUChat ,getChatByuser} = require('../Controllers/chats.js');

const router = express.Router();

router.get('/', getAllChats);
router.get('/:id', getUChat);
router.get('/chatByuser/u/', getChatByuser);

module.exports = router;
   