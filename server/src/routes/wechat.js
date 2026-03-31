const express = require('express');
const router = express.Router();
const wechatController = require('../controllers/wechatController');

router.get('/login', wechatController.wechatLogin);
router.get('/config', wechatController.getJssdkConfig);

module.exports = router;