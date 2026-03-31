const pool = require('../config/database');
const bcrypt = require('bcrypt');

class SuperAdmin {
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM super_admins WHERE username = ? AND status = ?',
      [username, 'active']
    );
    return rows[0];
  }

  static async create({ username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO super_admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    return result.insertId;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = SuperAdmin;