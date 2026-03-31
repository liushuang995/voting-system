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

// 获取超管列表
router.get('/super-admins', auth, adminController.getSuperAdmins);
// 创建超管
router.post('/super-admins', auth, adminController.createSuperAdmin);
// 删除超管
router.delete('/super-admins/:id', auth, adminController.deleteSuperAdmin);

module.exports = router;