const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');

router.post('/login', adminController.login);
router.post('/logout', auth, adminController.logout);

module.exports = router;