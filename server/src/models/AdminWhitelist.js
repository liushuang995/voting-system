const pool = require('../config/database');

class AdminWhitelist {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM admin_whitelist ORDER BY created_at DESC');
    return rows;
  }

  static async findByUnionid(unionid) {
    const [rows] = await pool.query(
      'SELECT * FROM admin_whitelist WHERE unionid = ?',
      [unionid]
    );
    return rows[0];
  }

  static async create({ unionid, nickname, password, created_by }) {
    const [result] = await pool.query(
      'INSERT INTO admin_whitelist (unionid, nickname, password, created_by) VALUES (?, ?, ?, ?)',
      [unionid, nickname, password, created_by]
    );
    return result.insertId;
  }

  static async delete(id) {
    await pool.query('DELETE FROM admin_whitelist WHERE id = ?', [id]);
  }
}

module.exports = AdminWhitelist;