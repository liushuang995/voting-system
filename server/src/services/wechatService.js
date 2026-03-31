const https = require('https');

class WechatService {
  static async getAccessToken() {
    const { WECHAT_APPID, WECHAT_APPSECRET } = process.env;
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.access_token) {
              resolve(parsed.access_token);
            } else {
              reject(new Error(parsed.errmsg || '获取access_token失败'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  static async getUserInfo(unionid, accessToken) {
    const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${unionid}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
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
  }

  static async getUnionidByCode(code) {
    const { WECHAT_APPID, WECHAT_APPSECRET } = process.env;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.unionid) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.errmsg || '获取unionid失败'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }
}

module.exports = WechatService;