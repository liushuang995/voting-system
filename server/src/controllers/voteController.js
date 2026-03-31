const Vote = require('../models/Vote');
const { success, error, page } = require('../utils/response');
const crypto = require('crypto');
const QrcodeService = require('../services/qrcodeService');
const ExportService = require('../services/exportService');

exports.list = async (req, res) => {
  try {
    const { status, search, page: pageNum, pageSize } = req.query;
    // super_admin 可以看到所有投票，其他用户只看自己创建的
    const isAdmin = req.user?.type === 'super_admin';
    const result = await Vote.findAll({
      status,
      search,
      page: pageNum,
      pageSize,
      isAdmin,
      creatorUnionid: req.user?.unionid
    });
    page(res, { ...result, page: parseInt(pageNum) || 1, pageSize: parseInt(pageSize) || 10 });
  } catch (err) {
    console.error(err);
    error(res, '获取投票列表失败');
  }
};

exports.stats = async (req, res) => {
  try {
    const stats = await Vote.getStats();
    success(res, stats);
  } catch (err) {
    error(res, '获取统计数据失败');
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, type, options, max_votes_per_user, end_time, share_title, share_desc, share_img } = req.body;

    if (!title || !options || options.length < 2) {
      return error(res, '请填写完整的投票信息');
    }

    const share_url = crypto.randomBytes(8).toString('hex');
    const creator_unionid = req.user?.unionid || null;

    const id = await Vote.create({
      title, description, type, options, max_votes_per_user,
      end_time, share_title, share_desc, share_img, share_url, creator_unionid
    });

    // 生成二维码
    const qrcode = await QrcodeService.generate(share_url);
    await Vote.update(id, { qrcode });

    success(res, { id, share_url, qrcode });
  } catch (err) {
    console.error(err);
    error(res, '创建投票失败');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    await Vote.update(id, req.body);
    success(res);
  } catch (err) {
    error(res, '更新投票失败');
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await Vote.delete(id);
    success(res);
  } catch (err) {
    error(res, '删除投票失败');
  }
};

exports.detail = async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.id);
    if (!vote) {
      return error(res, '投票不存在');
    }
    success(res, vote);
  } catch (err) {
    error(res, '获取投票详情失败');
  }
};

// 获取投票记录明细
exports.records = async (req, res) => {
  try {
    const { id } = req.params;
    const { page: pageNum, pageSize } = req.query;
    const result = await Vote.getRecords(id, {
      page: parseInt(pageNum) || 1,
      pageSize: parseInt(pageSize) || 10
    });
    page(res, result);
  } catch (err) {
    console.error(err);
    error(res, '获取投票记录失败');
  }
};

// 导出投票记录
exports.exportRecords = async (req, res) => {
  try {
    const { id } = req.params;
    await ExportService.exportVoteRecords(id, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: err.message || '导出失败' });
  }
};