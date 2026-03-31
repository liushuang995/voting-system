const pool = require('../config/database');

class Vote {
  static async findAll({ status, search, page = 1, pageSize = 10 }) {
    let where = '1=1';
    const params = [];

    if (status && status !== 'all') {
      where += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      where += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    const countSql = `SELECT COUNT(*) as total FROM votes WHERE ${where}`;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    const offset = (page - 1) * pageSize;
    const sql = `SELECT * FROM votes WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(sql, [...params, parseInt(pageSize), offset]);

    return { list: rows, total };
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM votes WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByShareUrl(shareUrl) {
    const [rows] = await pool.query('SELECT * FROM votes WHERE share_url = ?', [shareUrl]);
    return rows[0];
  }

  static async create(data) {
    const { title, description, type, options, max_votes_per_user, end_time, share_title, share_desc, share_img, share_url } = data;
    const [result] = await pool.query(
      `INSERT INTO votes (title, description, type, options, max_votes_per_user, end_time, share_title, share_desc, share_img, share_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, type, JSON.stringify(options), max_votes_per_user, end_time, share_title, share_desc, share_img, share_url]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        params.push(key === 'options' ? JSON.stringify(value) : value);
      }
    }
    params.push(id);
    await pool.query(`UPDATE votes SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async delete(id) {
    await pool.query('DELETE FROM votes WHERE id = ?', [id]);
  }

  static async getStats() {
    const [votes] = await pool.query('SELECT COUNT(*) as total FROM votes');
    const [participants] = await pool.query('SELECT COUNT(DISTINCT unionid) as total FROM vote_records');
    const [active] = await pool.query("SELECT COUNT(*) as total FROM votes WHERE status = 'active'");
    return {
      totalVotes: votes[0].total,
      totalParticipants: participants[0].total,
      activeVotes: active[0].total
    };
  }
}

module.exports = Vote;