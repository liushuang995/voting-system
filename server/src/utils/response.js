exports.success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

exports.error = (res, message = '操作失败', code = -1) => {
  res.json({ code, message });
};

exports.page = (res, { list, total, page, pageSize }) => {
  res.json({ code: 0, data: { list, total, page, pageSize } });
};