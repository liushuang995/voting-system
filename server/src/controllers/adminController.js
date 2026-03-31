const SuperAdmin = require('../models/SuperAdmin');
const AdminWhitelist = require('../models/AdminWhitelist');
const { success, error } = require('../utils/response');
const { generateToken } = require('../middlewares/auth');
const pool = require('../config/database');

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
    const { unionid, nickname, password } = req.body;
    if (!unionid || !password) {
      return error(res, '账号和密码不能为空');
    }
    await AdminWhitelist.create({
      unionid,
      nickname,
      password,
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

// 获取超管列表
exports.getSuperAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, status, created_at FROM super_admins ORDER BY created_at DESC'
    );
    success(res, rows);
  } catch (err) {
    console.error(err);
    error(res, '获取超管列表失败');
  }
};

// 创建超管
exports.createSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return error(res, '用户名和密码不能为空');
    }
    const id = await SuperAdmin.create({ username, password });
    success(res, { id });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, '用户名已存在');
    }
    error(res, '创建超管失败');
  }
};

// 删除超管
exports.deleteSuperAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return error(res, '不能删除自己');
    }
    await pool.query('DELETE FROM super_admins WHERE id = ?', [id]);
    success(res);
  } catch (err) {
    console.error(err);
    error(res, '删除超管失败');
  }
};