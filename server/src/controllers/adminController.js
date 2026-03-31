const SuperAdmin = require('../models/SuperAdmin');
const AdminWhitelist = require('../models/AdminWhitelist');
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

// 获取白名单
exports.getWhitelist = async (req, res) => {
  try {
    const list = await AdminWhitelist.findAll();
    success(res, list);
  } catch (err) {
    console.error(err);
    error(res, '获取白名单失败');
  }
};

// 添加白名单
exports.addWhitelist = async (req, res) => {
  try {
    const { unionid, nickname } = req.body;
    if (!unionid) {
      return error(res, 'unionid不能为空');
    }
    await AdminWhitelist.create({
      unionid,
      nickname,
      created_by: req.user.id
    });
    success(res);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, '该用户已在白名单中');
    }
    error(res, '添加失败');
  }
};

// 删除白名单
exports.removeWhitelist = async (req, res) => {
  try {
    await AdminWhitelist.delete(req.params.id);
    success(res);
  } catch (err) {
    console.error(err);
    error(res, '删除失败');
  }
};