const SuperAdmin = require('../models/SuperAdmin');
const { success, error } = require('../utils/response');
const { generateToken } = require('../middlewares/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, '用户名和密码不能为空');
    }

    const admin = await SuperAdmin.findByUsername(username);
    if (!admin) {
      return error(res, '用户名或密码错误');
    }

    const isValid = await SuperAdmin.verifyPassword(password, admin.password);
    if (!isValid) {
      return error(res, '用户名或密码错误');
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      type: 'super_admin'
    });

    success(res, { token, username: admin.username });
  } catch (err) {
    console.error(err);
    error(res, '登录失败');
  }
};

exports.logout = async (req, res) => {
  success(res, null, '退出登录成功');
};