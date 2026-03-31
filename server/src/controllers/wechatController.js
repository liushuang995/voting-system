const WechatService = require('../services/wechatService');
const AdminWhitelist = require('../models/AdminWhitelist');
const { success, error } = require('../utils/response');
const { generateToken } = require('../middlewares/auth');

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
    const crypto = require('crypto');
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