const express = require('express');
const router = express.Router();
const wechatController = require('../controllers/wechatController');
const { auth } = require('../middlewares/auth');

router.get('/login', wechatController.wechatLogin);
router.get('/config', wechatController.getJssdkConfig);

// 公开路由
router.get('/votes/public/:shareUrl', wechatController.getPublicVote);
router.post('/voter/login', wechatController.voterLogin);

// 需要认证的路由
router.post('/vote', auth, wechatController.submitVote);
router.get('/vote/status/:voteId', auth, wechatController.getVoteStatus);
router.get('/votes/:id/records', auth, wechatController.getVoteRecords);

module.exports = router;