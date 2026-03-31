const ExcelJS = require('exceljs');
const Vote = require('../models/Vote');
const VoteRecord = require('../models/VoteRecord');

class ExportService {
  static async exportVoteRecords(voteId, res) {
    let vote;
    let list = [];

    try {
      vote = await Vote.findById(voteId);
      if (!vote) {
        throw new Error('投票不存在');
      }
    } catch (err) {
      console.error('ExportService: Failed to find vote:', err);
      throw new Error('投票不存在');
    }

    try {
      const result = await VoteRecord.findByVoteId(voteId, 1, 10000);
      list = result.list;
    } catch (err) {
      console.error('ExportService: Failed to find records:', err);
      list = [];
    }

    let options = [];
    try {
      options = JSON.parse(vote.options || '[]');
    } catch (e) {
      options = [];
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('投票明细');

    sheet.columns = [
      { header: '序号', key: 'index', width: 10 },
      { header: '微信昵称', key: 'nickname', width: 30 },
      { header: '投票时间', key: 'created_at', width: 25 },
      { header: '选择的选项', key: 'selected_options', width: 50 }
    ];

    sheet.getRow(1).font = { bold: true };

    list.forEach((record, idx) => {
      let selectedLabels = '未知';
      try {
        const selectedOptions = JSON.parse(record.options || '[]');
        selectedLabels = selectedOptions.map(i => options[i] || `选项${i + 1}`).join(', ');
      } catch (e) {
        // ignore parse errors
      }

      sheet.addRow({
        index: idx + 1,
        nickname: record.nickname || '未知',
        created_at: new Date(record.created_at).toLocaleString('zh-CN'),
        selected_options: selectedLabels
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vote-${voteId}-records.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = ExportService;