const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');

router.post('/login', adminController.login);
router.post('/logout', auth, adminController.logout);

// 获取白名单列表
router.get('/whitelist', auth, adminController.getWhitelist);
// 添加白名单
router.post('/whitelist', auth, adminController.addWhitelist);
// 删除白名单
router.delete('/whitelist/:id', auth, adminController.removeWhitelist);

module.exports = router;