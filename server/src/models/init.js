const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  // 先连接不带数据库，创建数据库
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  const fs = require('fs');
  const path = require('path');
  const sql = fs.readFileSync(
    path.join(__dirname, '../../docs/database/init.sql'),
    'utf8'
  );

  await connection.query(sql);
  await connection.end();
  console.log('数据库初始化完成');
}

initDatabase().catch(console.error);