const pool = require('../config/database');

class VoteRecord {
  static async create({ vote_id, unionid, nickname, avatar, options }) {
    const [result] = await pool.query(
      'INSERT INTO vote_records (vote_id, unionid, nickname, avatar, options) VALUES (?, ?, ?, ?, ?)',
      [vote_id, unionid, nickname, avatar, JSON.stringify(options)]
    );
    return result.insertId;
  }

  static async countByUnionid(vote_id, unionid) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM vote_records WHERE vote_id = ? AND unionid = ?',
      [vote_id, unionid]
    );
    return rows[0].count;
  }

  static async findByVoteId(vote_id, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      'SELECT * FROM vote_records WHERE vote_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [vote_id, parseInt(pageSize), offset]
    );
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM vote_records WHERE vote_id = ?',
      [vote_id]
    );
    return { list: rows, total: countResult[0].total };
  }
}

module.exports = VoteRecord;