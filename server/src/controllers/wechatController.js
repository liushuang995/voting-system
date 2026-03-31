const https = require('https');
const crypto = require('crypto');
const WechatService = require('../services/wechatService');
const AdminWhitelist = require('../models/AdminWhitelist');
const { success, error } = require('../utils/response');
const { generateToken } = require('../middlewares/auth');
const Vote = require('../models/Vote');
const VoteRecord = require('../models/VoteRecord');

// 微信扫码登录
exports.wechatLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return error(res, '缺少code参数');
    }

    const wechatData = await WechatService.getUnionidByCode(code);
    const unionid = wechatData.unionid;

    // 检查白名单
    const whitelistUser = await AdminWhitelist.findByUnionid(unionid);
    if (!whitelistUser || whitelistUser.status !== 'active') {
      return error(res, '该用户未授权访问后台');
    }

    // 获取用户信息
    let nickname = whitelistUser.nickname;
    try {
      const accessToken = await WechatService.getAccessToken();
      const userInfo = await WechatService.getUserInfo(unionid, accessToken);
      if (userInfo.nickname) {
        nickname = userInfo.nickname;
      }
    } catch (e) {
      console.error('获取微信用户信息失败', e);
    }

    const token = generateToken({
      id: whitelistUser.id,
      unionid,
      nickname,
      type: 'wechat_admin'
    });

    success(res, { token, nickname });
  } catch (err) {
    console.error(err);
    error(res, '微信登录失败');
  }
};

// 获取 JS-SDK 配置
exports.getJssdkConfig = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return error(res, '缺少url参数');
    }

    const accessToken = await WechatService.getAccessToken();

    const jsapiTicketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const ticketData = await new Promise((resolve, reject) => {
      https.get(jsapiTicketUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    const jsapiTicket = ticketData.ticket;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = Math.random().toString(36).substring(2);
    const str = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = crypto.createHash('sha1').update(str).digest('hex');

    success(res, {
      appId: process.env.WECHAT_APPID,
      timestamp,
      nonceStr,
      signature
    });
  } catch (err) {
    console.error(err);
    error(res, '获取JS-SDK配置失败');
  }
};

// 提交投票
exports.submitVote = async (req, res) => {
  try {
    const { share_url, options } = req.body;

    if (!share_url || !options || options.length === 0) {
      return error(res, '参数错误');
    }

    const vote = await Vote.findByShareUrl(share_url);
    if (!vote) {
      return error(res, '投票不存在');
    }

    if (vote.status !== 'active') {
      return error(res, '投票已截止');
    }

    if (vote.end_time && new Date(vote.end_time) < new Date()) {
      return error(res, '投票已截止');
    }

    // 获取用户信息（如果已登录）
    const unionid = req.user?.unionid || 'anonymous';
    const nickname = req.user?.nickname || '微信用户';
    const avatar = req.user?.avatar || '';

    // 检查投票限制
    if (vote.max_votes_per_user > 0) {
      const voteCount = await VoteRecord.countByUnionid(vote.id, unionid);
      if (voteCount >= vote.max_votes_per_user) {
        return error(res, `您已投过票，本次投票次数已用完`);
      }
    }

    await VoteRecord.create({
      vote_id: vote.id,
      unionid,
      nickname,
      avatar,
      options
    });

    success(res);
  } catch (err) {
    console.error(err);
    error(res, '投票失败');
  }
};

// 获取投票状态
exports.getVoteStatus = async (req, res) => {
  try {
    const { voteId } = req.params;
    const unionid = req.user?.unionid;

    const vote = await Vote.findById(voteId);
    if (!vote) {
      return error(res, '投票不存在');
    }

    let remaining = -1;
    if (unionid && vote.max_votes_per_user > 0) {
      const count = await VoteRecord.countByUnionid(voteId, unionid);
      remaining = Math.max(0, vote.max_votes_per_user - count);
    }

    success(res, {
      canVote: remaining !== 0,
      remaining
    });
  } catch (err) {
    console.error(err);
    error(res, '获取状态失败');
  }
};

// 获取公开投票详情
exports.getPublicVote = async (req, res) => {
  try {
    const { shareUrl } = req.params;
    const vote = await Vote.findByShareUrl(shareUrl);
    if (!vote) {
      return error(res, '投票不存在');
    }
    success(res, vote);
  } catch (err) {
    console.error(err);
    error(res, '获取投票失败');
  }
};

// 白名单用户投票登录
exports.voterLogin = async (req, res) => {
  try {
    const { unionid, password } = req.body;
    if (!unionid || !password) {
      return error(res, '请输入账号和密码');
    }

    const user = await AdminWhitelist.findByUnionid(unionid);
    if (!user || user.status !== 'active') {
      return error(res, '用户未授权');
    }

    if (user.password !== password) {
      return error(res, '密码错误');
    }

    const token = generateToken({
      id: user.id,
      unionid: user.unionid,
      nickname: user.nickname || user.unionid,
      type: 'voter'
    });

    success(res, { token, nickname: user.nickname || user.unionid });
  } catch (err) {
    console.error(err);
    error(res, '登录失败');
  }
};

// 获取投票记录
exports.getVoteRecords = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const result = await VoteRecord.findByVoteId(id, page, pageSize);
    res.json({ code: 0, data: result });
  } catch (err) {
    console.error(err);
    error(res, '获取投票记录失败');
  }
};