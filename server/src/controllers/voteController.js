const Vote = require('../models/Vote');
const { success, error, page } = require('../utils/response');
const crypto = require('crypto');
const QrcodeService = require('../services/qrcodeService');

exports.list = async (req, res) => {
  try {
    const { status, search, page: pageNum, pageSize } = req.query;
    const result = await Vote.findAll({ status, search, page: pageNum, pageSize });
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

    const id = await Vote.create({
      title, description, type, options, max_votes_per_user,
      end_time, share_title, share_desc, share_img, share_url
    });

    // 生成二维码
    const qrcode = await QrcodeService.generate(id, share_url);
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