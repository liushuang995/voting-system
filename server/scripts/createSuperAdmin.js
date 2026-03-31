const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSuperAdmin() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await connection.query(
      'INSERT INTO super_admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    console.log(`超管账号创建成功: ${username} / ${password}`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('超管账号已存在');
    } else {
      throw err;
    }
  } finally {
    await connection.end();
  }
}

createSuperAdmin();