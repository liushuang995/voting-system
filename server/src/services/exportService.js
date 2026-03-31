const ExcelJS = require('exceljs');
const Vote = require('../models/Vote');
const VoteRecord = require('../models/VoteRecord');

class ExportService {
  static async exportVoteRecords(voteId, res) {
    const vote = await Vote.findById(voteId);
    if (!vote) {
      throw new Error('投票不存在');
    }

    const { list } = await VoteRecord.findByVoteId(voteId, 1, 10000);
    const options = JSON.parse(vote.options || '[]');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('投票明细');

    // 设置列宽
    sheet.columns = [
      { header: '序号', key: 'index', width: 10 },
      { header: '微信昵称', key: 'nickname', width: 30 },
      { header: '投票时间', key: 'created_at', width: 25 },
      { header: '选择的选项', key: 'selected_options', width: 50 }
    ];

    // 添加表头样式
    sheet.getRow(1).font = { bold: true };

    // 数据行
    list.forEach((record, idx) => {
      const selectedOptions = JSON.parse(record.options || '[]');
      const selectedLabels = selectedOptions.map(i => options[i] || `选项${i + 1}`).join(', ');

      sheet.addRow({
        index: idx + 1,
        nickname: record.nickname || '未知',
        created_at: new Date(record.created_at).toLocaleString('zh-CN'),
        selected_options: selectedLabels
      });
    });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vote-${voteId}-records.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = ExportService;