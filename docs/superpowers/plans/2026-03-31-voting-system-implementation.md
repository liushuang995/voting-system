# 投票智投系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成投票智投系统的完整实现，包括管理后台（React + Ant Design）和微信投票前端

**Architecture:**
- 前后端分离架构：client/ (React) 和 server/ (Node.js + Express)
- 数据库：MySQL，通过 .env 配置连接
- 微信集成：JS-SDK + OAuth2.0 授权登录
- 本地开发：ngrok 内网穿透测试微信功能

**Tech Stack:**
- Frontend: React 18, Ant Design 5, React Router 6, Axios
- Backend: Node.js, Express 4, MySQL 8, jsonwebtoken, bcrypt
- WeChat: wechat-jssdk, qrcode
- Dev: nodemon, concurrently

---

## 项目文件结构

```
voting-system/
├── client/                          # React 前端
│   ├── src/
│   │   ├── api/                     # API 请求封装
│   │   │   └── index.js
│   │   ├── components/              # 公共组件
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── admin/               # 管理后台页面
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── VoteList.jsx
│   │   │   │   ├── VoteCreate.jsx
│   │   │   │   ├── VoteEdit.jsx
│   │   │   │   ├── VoteResults.jsx
│   │   │   │   ├── Whitelist.jsx
│   │   │   │   └── SuperAdmins.jsx
│   │   │   └── vote/               # 微信投票页面
│   │   │       ├── VotePage.jsx
│   │   │       └── VoteSuccess.jsx
│   │   ├── styles/
│   │   │   └── theme.js            # Ant Design 主题定制
│   │   ├── App.js
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── server/                          # Node.js 后端
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # 数据库配置
│   │   ├── models/                  # 数据模型
│   │   │   ├── SuperAdmin.js
│   │   │   ├── AdminWhitelist.js
│   │   │   ├── Vote.js
│   │   │   └── VoteRecord.js
│   │   ├── routes/                  # 路由
│   │   │   ├── admin.js
│   │   │   ├── votes.js
│   │   │   └── wechat.js
│   │   ├── controllers/             # 控制器
│   │   │   ├── adminController.js
│   │   │   ├── voteController.js
│   │   │   └── wechatController.js
│   │   ├── middlewares/             # 中间件
│   │   │   └── auth.js
│   │   ├── services/               # 业务逻辑
│   │   │   ├── wechatService.js
│   │   │   └── qrcodeService.js
│   │   ├── utils/
│   │   │   └── response.js
│   │   └── app.js
│   ├── .env                        # 环境变量
│   ├── .env.example
│   └── package.json
├── docs/
│   └── superpowers/
│       ├── specs/
│       └── plans/
├── requirements.md
└── README.md
```

---

## Task 1: 项目初始化 - 后端基础搭建

**Files:**
- Create: `server/package.json`
- Create: `server/src/app.js`
- Create: `server/src/config/database.js`
- Create: `server/.env.example`
- Create: `server/.env`

- [ ] **Step 1: 创建 server 目录结构和 package.json**

```bash
mkdir -p server/src/{config,models,routes,controllers,middlewares,services,utils}
cd server && npm init -y
```

```json
{
  "name": "voting-server",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

- [ ] **Step 2: 安装依赖**

```bash
cd server && npm install
```

- [ ] **Step 3: 创建 .env.example**

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=toupiao_db

# 服务器配置
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_in_production

# 微信配置
WECHAT_APPID=wx8453381924814a0d
WECHAT_APPSECRET=a3a2ba386812c7efbaa72fcf9ebda0d1

# 客户端地址（用于 CORS）
CLIENT_URL=http://localhost:3001
```

- [ ] **Step 4: 创建 .env（复制自 .env.example 并填入实际密码）**

- [ ] **Step 5: 创建数据库配置 server/src/config/database.js**

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

- [ ] **Step 6: 创建 Express 应用入口 server/src/app.js**

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
```

- [ ] **Step 7: 测试服务器启动**

```bash
cd server && npm run dev
```
Expected: `服务器运行在 http://localhost:3000`

- [ ] **Step 8: 提交**

```bash
git add server/package.json server/src server/.env.example && git commit -m "feat: 初始化后端项目结构"
```

---

## Task 2: 项目初始化 - 前端基础搭建

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/api/index.js`
- Create: `client/src/styles/theme.js`

- [ ] **Step 1: 创建 client 目录结构**

```bash
mkdir -p client/src/{api,components,pages/admin,pages/vote,styles} client/public
```

- [ ] **Step 2: 创建 client/package.json**

```json
{
  "name": "voting-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "antd": "^5.9.0",
    "axios": "^1.5.0",
    "@ant-design/icons": "^5.2.6"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.1.0",
    "vite": "^4.4.9"
  }
}
```

- [ ] **Step 3: 安装前端依赖**

```bash
cd client && npm install
```

- [ ] **Step 4: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>投票智投</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 6: 创建 src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/theme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </BrowserRouter>
);
```

- [ ] **Step 7: 创建 src/App.jsx**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 8: 创建 src/api/index.js**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

- [ ] **Step 9: 创建 src/styles/theme.js**

```javascript
export default {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4
  }
};
```

- [ ] **Step 10: 测试前端启动**

```bash
cd client && npm run dev
```
Expected: Vite dev server running at http://localhost:3001

- [ ] **Step 11: 提交**

```bash
git add client/package.json client/vite.config.js client/index.html client/src && git commit -m "feat: 初始化前端项目结构"
```

---

## Task 3: 数据库初始化

**Files:**
- Create: `server/src/models/init.js`
- Create: `docs/database/init.sql`

- [ ] **Step 1: 创建数据库初始化 SQL 脚本 docs/database/init.sql**

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS toupiao_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE toupiao_db;

-- 超管表
CREATE TABLE IF NOT EXISTS super_admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active', 'disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 管理员白名单表
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  unionid VARCHAR(100) NOT NULL UNIQUE,
  nickname VARCHAR(100),
  status ENUM('active', 'disabled') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT
);

-- 投票表
CREATE TABLE IF NOT EXISTS votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  type ENUM('single', 'multiple') NOT NULL DEFAULT 'single',
  options JSON NOT NULL,
  max_votes_per_user INT NOT NULL DEFAULT 1,
  end_time DATETIME,
  status ENUM('active', 'closed') DEFAULT 'active',
  share_title VARCHAR(100),
  share_desc VARCHAR(200),
  share_img VARCHAR(255),
  share_url VARCHAR(255) NOT NULL UNIQUE,
  qrcode VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_share_url (share_url),
  INDEX idx_status (status)
);

-- 投票记录表
CREATE TABLE IF NOT EXISTS vote_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vote_id INT NOT NULL,
  unionid VARCHAR(100) NOT NULL,
  nickname VARCHAR(100),
  avatar VARCHAR(255),
  options JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vote_id) REFERENCES votes(id) ON DELETE CASCADE,
  INDEX idx_vote_unionid (vote_id, unionid)
);
```

- [ ] **Step 2: 创建数据库初始化 JS 模块 server/src/models/init.js**

```javascript
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
```

- [ ] **Step 3: 执行数据库初始化**

```bash
cd server && node src/models/init.js
```
Expected: 数据库初始化完成

- [ ] **Step 4: 提交**

```bash
git add server/src/models/init.js docs/database/init.sql && git commit -m "feat: 添加数据库初始化脚本"
```

---

## Task 4: 超管登录功能

**Files:**
- Modify: `server/src/app.js`
- Create: `server/src/routes/admin.js`
- Create: `server/src/controllers/adminController.js`
- Create: `server/src/models/SuperAdmin.js`
- Create: `server/src/middlewares/auth.js`
- Create: `server/src/utils/response.js`
- Create: `client/src/pages/admin/Login.jsx`

- [ ] **Step 1: 创建统一响应工具 server/src/utils/response.js**

```javascript
exports.success = (res, data, message = '操作成功') => {
  res.json({ code: 0, message, data });
};

exports.error = (res, message = '操作失败', code = -1) => {
  res.json({ code, message });
};

exports.page = (res, { list, total, page, pageSize }) => {
  res.json({ code: 0, data: { list, total, page, pageSize } });
};
```

- [ ] **Step 2: 创建 SuperAdmin 模型 server/src/models/SuperAdmin.js**

```javascript
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
```

- [ ] **Step 3: 创建 JWT 中间件 server/src/middlewares/auth.js**

```javascript
const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, '未提供认证令牌', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, '令牌无效或已过期', 401);
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { auth, generateToken };
```

- [ ] **Step 4: 创建管理员控制器 server/src/controllers/adminController.js**

```javascript
const SuperAdmin = require('../models/SuperAdmin');
const { success, error } = require('../utils/response');
const { generateToken } = require('../middlewares/auth');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, '用户名和密码不能为空');
    }

    const admin = await SuperAdmin.findByUsername(username);
    if (!admin) {
      return error(res, '用户名或密码错误');
    }

    const isValid = await SuperAdmin.verifyPassword(password, admin.password);
    if (!isValid) {
      return error(res, '用户名或密码错误');
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      type: 'super_admin'
    });

    success(res, { token, username: admin.username });
  } catch (err) {
    console.error(err);
    error(res, '登录失败');
  }
};

exports.logout = async (req, res) => {
  success(res, null, '退出登录成功');
};
```

- [ ] **Step 5: 创建管理员路由 server/src/routes/admin.js**

```javascript
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/auth');

router.post('/login', adminController.login);
router.post('/logout', auth, adminController.logout);

module.exports = router;
```

- [ ] **Step 6: 更新 app.js 引入管理员路由**

```javascript
const adminRoutes = require('./routes/admin');

// 路由
app.use('/api/admin', adminRoutes);
```

- [ ] **Step 7: 创建管理员登录页面 client/src/pages/admin/Login.jsx**

```jsx
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import api from '../../api';

function Login() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', values);
      if (res.code === 0) {
        localStorage.setItem('token', res.data.token);
        message.success('登录成功');
        window.location.href = '/admin';
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="投票智投 - 超管登录" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
```

- [ ] **Step 8: 更新 App.jsx 添加登录路由**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/admin/votes" replace />} />
    </Routes>
  );
}
```

- [ ] **Step 9: 测试超管登录（需要先创建超管账号）**

先在 MySQL 中手动插入一个测试超管：
```sql
INSERT INTO super_admins (username, password) VALUES ('admin', '$2b$10$...'); -- 需要用 bcrypt 加密的密码
```

或使用 node 执行：
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(h => console.log(h))"
```

- [ ] **Step 10: 提交**

```bash
git add server/src/{models/SuperAdmin.js,controllers/adminController.js,routes/admin.js,middlewares/auth.js,utils/response.js,app.js} client/src/pages/admin/Login.jsx client/src/api/index.js client/src/App.jsx && git commit -m "feat: 超管登录功能"
```

---

## Task 5: 创建初始超管账号脚本

**Files:**
- Create: `server/scripts/createSuperAdmin.js`

- [ ] **Step 1: 创建创建超管脚本 server/scripts/createSuperAdmin.js**

```javascript
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
```

- [ ] **Step 2: 执行脚本创建超管**

```bash
cd server && node scripts/createSuperAdmin.js admin your_password
```

- [ ] **Step 3: 提交**

```bash
git add server/scripts/createSuperAdmin.js && git commit -m "scripts: 添加创建超管账号脚本"
```

---

## Task 6: 管理后台 Layout 和路由

**Files:**
- Create: `client/src/components/Layout.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: 创建 Layout 组件 client/src/components/Layout.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import api from '../api';

const { Header, Sider, Content } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 简单获取用户名逻辑，可根据实际 token 解析调整
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username);
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/admin/votes', icon: <BarChartOutlined />, label: '投票列表' },
    { key: '/admin/whitelist', icon: <TeamOutlined />, label: '白名单管理' },
    { key: '/admin/super-admins', icon: <SettingOutlined />, label: '超管管理' }
  ];

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>
          投票智投
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer' }}>{username?.[0]?.toUpperCase() || 'A'}</Avatar>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
```

- [ ] **Step 2: 更新 App.jsx 添加入口路由**

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import AdminLayout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="votes" replace />} />
      </Route>
      <Route path="/" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
```

- [ ] **Step 3: 提交**

```bash
git add client/src/components/Layout.jsx client/src/App.jsx && git commit -m "feat: 添加管理后台布局组件"
```

---

## Task 7: 仪表盘页面

**Files:**
- Create: `client/src/pages/admin/Dashboard.jsx`

- [ ] **Step 1: 创建仪表盘页面 client/src/pages/admin/Dashboard.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BarChartOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api';

function Dashboard() {
  const [stats, setStats] = useState({ totalVotes: 0, totalParticipants: 0, activeVotes: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/votes/stats');
      if (res.code === 0) {
        setStats(res.data);
      }
    } catch (err) {
      // 暂时不处理
    }
  };

  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="投票总数" value={stats.totalVotes} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="参与人数" value={stats.totalParticipants} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="进行中投票" value={stats.activeVotes} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
```

- [ ] **Step 2: 更新路由添加仪表盘**

```jsx
// 在 App.jsx 的 AdminLayout 下添加
<Route path="votes" element={<VoteList />} />
```

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/admin/Dashboard.jsx && git commit -m "feat: 添加仪表盘页面"
```

---

## Task 8: 投票列表功能

**Files:**
- Create: `client/src/pages/admin/VoteList.jsx`
- Modify: `client/src/App.jsx` (添加路由)
- Create: `server/src/controllers/voteController.js`
- Create: `server/src/models/Vote.js`
- Create: `server/src/routes/votes.js`

- [ ] **Step 1: 创建 Vote 模型 server/src/models/Vote.js**

```javascript
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
```

- [ ] **Step 2: 创建投票控制器 server/src/controllers/voteController.js**

```javascript
const Vote = require('../models/Vote');
const { success, error, page } = require('../utils/response');
const crypto = require('crypto');

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

    success(res, { id, share_url });
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
```

- [ ] **Step 3: 创建投票路由 server/src/routes/votes.js**

```javascript
const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { auth } = require('../middlewares/auth');

router.use(auth);

router.get('/stats', voteController.stats);
router.get('/', voteController.list);
router.get('/:id', voteController.detail);
router.post('/', voteController.create);
router.put('/:id', voteController.update);
router.delete('/:id', voteController.remove);

module.exports = router;
```

- [ ] **Step 4: 更新 app.js 引入投票路由**

```javascript
const voteRoutes = require('./routes/votes');
app.use('/api/votes', voteRoutes);
```

- [ ] **Step 5: 创建投票列表页面 client/src/pages/admin/VoteList.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons';
import api from '../../api';

const { Option } = Select;

function VoteList() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVotes();
  }, [pagination.current, status]);

  const loadVotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/votes', { params: { status, page: pagination.current, pageSize: pagination.pageSize, search } });
      if (res.code === 0) {
        setVotes(res.data.list);
        setPagination({ ...pagination, total: res.data.total });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/votes/${id}`);
      if (res.code === 0) {
        message.success('删除成功');
        loadVotes();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type) => type === 'single' ? '单选' : '多选'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => status === 'active'
        ? <span style={{ color: '#52c41a' }}>进行中</span>
        : <span style={{ color: '#ff4d4f' }}>已截止</span>
    },
    { title: '创建时间', dataIndex: 'created_at', render: (t) => new Date(t).toLocaleString() },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<BarChartOutlined />} onClick={() => navigate(`/admin/votes/${record.id}/results`)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/votes/${record.id}/edit`)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>投票列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/votes/create')}>
          创建投票
        </Button>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索投票标题" onSearch={loadVotes} style={{ width: 200 }} />
        <Select value={status} onChange={setStatus} style={{ width: 120 }}>
          <Option value="all">全部</Option>
          <Option value="active">进行中</Option>
          <Option value="closed">已截止</Option>
        </Select>
        <Button onClick={loadVotes}>刷新</Button>
      </Space>
      <Table columns={columns} dataSource={votes} rowKey="id" loading={loading} pagination={pagination} onChange={setPagination} />
    </div>
  );
}

export default VoteList;
```

- [ ] **Step 6: 更新 App.jsx 投票列表路由**

```jsx
<Route path="votes" element={<VoteList />} />
```

- [ ] **Step 7: 测试投票列表页面**

访问 http://localhost:3001/admin/votes

- [ ] **Step 8: 提交**

```bash
git add server/src/{models/Vote.js,controllers/voteController.js,routes/votes.js} client/src/pages/admin/VoteList.jsx && git commit -m "feat: 投票列表功能"
```

---

## Task 9: 创建投票页面

**Files:**
- Create: `client/src/pages/admin/VoteCreate.jsx`

- [ ] **Step 1: 创建创建投票页面 client/src/pages/admin/VoteCreate.jsx**

```jsx
import { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';
import moment from 'moment';

const { RangePicker } = DatePicker;

function VoteCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 20) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onFinish = async (values) => {
    const filteredOptions = options.filter(o => o.trim());
    if (filteredOptions.length < 2) {
      return message.error('至少需要2个选项');
    }

    setLoading(true);
    try {
      const res = await api.post('/votes', {
        ...values,
        options: filteredOptions,
        end_time: values.end_time?.endOf('day').toISOString()
      });
      if (res.code === 0) {
        message.success('创建成功');
        navigate('/admin/votes');
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>创建投票</h2>
      <Card>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="投票标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入投票标题（最多100字）" maxLength={100} />
          </Form.Item>

          <Form.Item name="description" label="投票说明">
            <Input.TextArea placeholder="选填，投票说明（最多500字）" maxLength={500} rows={3} />
          </Form.Item>

          <Form.Item name="type" label="投票类型" initialValue="single">
            <Select>
              <Select.Option value="single">单选</Select.Option>
              <Select.Option value="multiple">多选</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="投票选项">
            <Space direction="vertical" style={{ width: '100%' }}>
              {options.map((option, index) => (
                <Space key={index}>
                  <Input
                    placeholder={`选项${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={50}
                    style={{ width: 300 }}
                  />
                  {options.length > 2 && (
                    <Button icon={<DeleteOutlined />} onClick={() => removeOption(index)} danger />
                  )}
                </Space>
              ))}
              {options.length < 20 && (
                <Button icon={<PlusOutlined />} onClick={addOption}>添加选项</Button>
              )}
            </Space>
          </Form.Item>

          <Form.Item name="max_votes_per_user" label="每人投票次数" initialValue={1}>
            <Select>
              {[1, 2, 3, 5, 0].map(n => (
                <Select.Option key={n} value={n}>
                  {n === 0 ? '无限' : `${n}次`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="end_time" label="截止时间">
            <DatePicker showTime placeholder="不设置则不限制" />
          </Form.Item>

          <Form.Item name="share_title" label="分享标题">
            <Input placeholder="自定义分享标题（默认使用投票标题）" />
          </Form.Item>

          <Form.Item name="share_desc" label="分享描述">
            <Input placeholder="自定义分享描述" maxLength={200} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>创建</Button>
              <Button onClick={() => navigate('/admin/votes')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VoteCreate;
```

- [ ] **Step 2: 安装 moment.js**

```bash
cd client && npm install moment
```

- [ ] **Step 3: 更新 App.jsx 添加创建路由**

```jsx
<Route path="votes/create" element={<VoteCreate />} />
```

- [ ] **Step 4: 提交**

```bash
git add client/src/pages/admin/VoteCreate.jsx && git commit -m "feat: 创建投票页面"
```

---

## Task 10: 投票结果页面

**Files:**
- Create: `client/src/pages/admin/VoteResults.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: 创建投票结果页面 client/src/pages/admin/VoteResults.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Table, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../api';

function VoteResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);
  const [records, setRecords] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const voteRes = await api.get(`/votes/${id}`);
      if (voteRes.code === 0) {
        setVote(voteRes.data);
        const options = JSON.parse(voteRes.data.options);
        const initialResults = {};
        options.forEach((opt, idx) => {
          initialResults[idx] = { label: opt, count: 0, percentage: 0 };
        });
        setResults(initialResults);
      }

      const recordsRes = await api.get(`/votes/${id}/records`);
      if (recordsRes.code === 0) {
        setRecords(recordsRes.data.list);
        // 统计各选项票数
        const newResults = {};
        const options = JSON.parse(voteRes?.data?.options || '[]');
        options.forEach((opt, idx) => {
          newResults[idx] = { label: opt, count: 0, percentage: 0 };
        });
        recordsRes.data.list.forEach(record => {
          const selectedOptions = JSON.parse(record.options);
          selectedOptions.forEach(optIdx => {
            if (newResults[optIdx]) {
              newResults[optIdx].count++;
            }
          });
        });
        const total = recordsRes.data.list.length;
        Object.keys(newResults).forEach(idx => {
          newResults[idx].percentage = total > 0 ? Math.round((newResults[idx].count / total) * 100) : 0;
        });
        setResults(newResults);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { title: '微信昵称', dataIndex: 'nickname' },
    { title: '投票时间', dataIndex: 'created_at', render: (t) => new Date(t).toLocaleString() },
    { title: '选择选项', dataIndex: 'options', render: (opts) => {
      const parsed = JSON.parse(opts);
      return parsed.map(idx => results[idx]?.label).join(', ');
    }}
  ];

  if (!vote) return null;

  const options = JSON.parse(vote.options);
  const total = records.length;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/votes')}>返回</Button>
        <h2 style={{ margin: 0 }}>{vote.title}</h2>
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="投票人数">{total}</Card>
        </Col>
        <Col span={8}>
          <Card title="投票类型">{vote.type === 'single' ? '单选' : '多选'}</Card>
        </Col>
        <Col span={8}>
          <Card title="状态">{vote.status === 'active' ? '进行中' : '已截止'}</Card>
        </Col>
      </Row>

      <Card title="投票结果" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {Object.entries(results).map(([idx, { label, count, percentage }]) => (
            <Col span={12} key={idx}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100 }}>{label}</span>
                <Progress percent={percentage} format={() => `${count}票`} style={{ flex: 1 }} />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="投票明细">
        <Table columns={columns} dataSource={records} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>
    </div>
  );
}

export default VoteResults;
```

- [ ] **Step 2: 添加结果页面路由**

```jsx
<Route path="votes/:id/results" element={<VoteResults />} />
```

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/admin/VoteResults.jsx && git commit -m "feat: 投票结果页面"
```

---

## Task 11: 编辑投票页面

**Files:**
- Create: `client/src/pages/admin/VoteEdit.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: 创建编辑投票页面 client/src/pages/admin/VoteEdit.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api';

function VoteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vote, setVote] = useState(null);
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    loadVote();
  }, [id]);

  const loadVote = async () => {
    try {
      const res = await api.get(`/votes/${id}`);
      if (res.code === 0) {
        setVote(res.data);
        const opts = JSON.parse(res.data.options);
        setOptions(opts);
        form.setFieldsValue({
          title: res.data.title,
          description: res.data.description,
          type: res.data.type,
          max_votes_per_user: res.data.max_votes_per_user,
          end_time: res.data.end_time ? moment(res.data.end_time) : null,
          share_title: res.data.share_title,
          share_desc: res.data.share_desc
        });
      }
    } catch (err) {
      message.error('加载失败');
    }
  };

  const addOption = () => {
    if (options.length < 20) setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const onFinish = async (values) => {
    const filteredOptions = options.filter(o => o.trim());
    if (filteredOptions.length < 2) {
      return message.error('至少需要2个选项');
    }

    setLoading(true);
    try {
      const res = await api.put(`/votes/${id}`, {
        ...values,
        options: filteredOptions,
        end_time: values.end_time?.endOf('day').toISOString()
      });
      if (res.code === 0) {
        message.success('更新成功');
        navigate('/admin/votes');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/votes')}>返回</Button>
        <h2>编辑投票</h2>
      </Space>
      <Card>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="title" label="投票标题" rules={[{ required: true }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="description" label="投票说明">
            <Input.TextArea maxLength={500} rows={3} />
          </Form.Item>
          <Form.Item name="type" label="投票类型">
            <Select>
              <Select.Option value="single">单选</Select.Option>
              <Select.Option value="multiple">多选</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="投票选项">
            <Space direction="vertical">
              {options.map((option, index) => (
                <Space key={index}>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={50}
                    style={{ width: 300 }}
                  />
                  {options.length > 2 && (
                    <Button danger onClick={() => removeOption(index)}>删除</Button>
                  )}
                </Space>
              ))}
              {options.length < 20 && <Button onClick={addOption}>添加选项</Button>}
            </Space>
          </Form.Item>
          <Form.Item name="max_votes_per_user" label="每人投票次数">
            <Select>
              {[1, 2, 3, 5, 0].map(n => (
                <Select.Option key={n} value={n}>{n === 0 ? '无限' : `${n}次`}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="end_time" label="截止时间">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
              <Button onClick={() => navigate('/admin/votes')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VoteEdit;
```

- [ ] **Step 2: 添加编辑路由**

```jsx
<Route path="votes/:id/edit" element={<VoteEdit />} />
```

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/admin/VoteEdit.jsx && git commit -m "feat: 编辑投票页面"
```

---

## Task 12: 白名单管理页面

**Files:**
- Create: `client/src/pages/admin/Whitelist.jsx`
- Create: `server/src/models/AdminWhitelist.js`
- Create: `server/src/controllers/adminController.js` (添加白名单方法)
- Create: `server/src/routes/admin.js` (添加白名单路由)

- [ ] **Step 1: 创建白名单模型 server/src/models/AdminWhitelist.js**

```javascript
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

  static async create({ unionid, nickname, created_by }) {
    const [result] = await pool.query(
      'INSERT INTO admin_whitelist (unionid, nickname, created_by) VALUES (?, ?, ?)',
      [unionid, nickname, created_by]
    );
    return result.insertId;
  }

  static async delete(id) {
    await pool.query('DELETE FROM admin_whitelist WHERE id = ?', [id]);
  }
}

module.exports = AdminWhitelist;
```

- [ ] **Step 2: 更新管理员控制器 server/src/controllers/adminController.js**

```javascript
const AdminWhitelist = require('../models/AdminWhitelist');

// 获取白名单
exports.getWhitelist = async (req, res) => {
  try {
    const list = await AdminWhitelist.findAll();
    success(res, list);
  } catch (err) {
    error(res, '获取白名单失败');
  }
};

// 添加白名单
exports.addWhitelist = async (req, res) => {
  try {
    const { unionid, nickname } = req.body;
    if (!unionid) {
      return error(res, 'unionid不能为空');
    }
    await AdminWhitelist.create({
      unionid,
      nickname,
      created_by: req.user.id
    });
    success(res);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, '该用户已在白名单中');
    }
    error(res, '添加失败');
  }
};

// 删除白名单
exports.removeWhitelist = async (req, res) => {
  try {
    await AdminWhitelist.delete(req.params.id);
    success(res);
  } catch (err) {
    error(res, '删除失败');
  }
};
```

- [ ] **Step 3: 更新管理员路由 server/src/routes/admin.js**

```javascript
// 获取白名单列表
router.get('/whitelist', auth, adminController.getWhitelist);
// 添加白名单
router.post('/whitelist', auth, adminController.addWhitelist);
// 删除白名单
router.delete('/whitelist/:id', auth, adminController.removeWhitelist);
```

- [ ] **Step 4: 创建白名单页面 client/src/pages/admin/Whitelist.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import api from '../../api';

function Whitelist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/whitelist');
      if (res.code === 0) {
        setList(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await form.validateFields();
      const res = await api.post('/admin/whitelist', form.getFieldsValue());
      if (res.code === 0) {
        message.success('添加成功');
        setModalVisible(false);
        form.resetFields();
        loadData();
      }
    } catch (err) {
      message.error('添加失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/admin/whitelist/${id}`);
      if (res.code === 0) {
        message.success('删除成功');
        loadData();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'UnionID', dataIndex: 'unionid' },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '添加时间', dataIndex: 'created_at', render: (t) => new Date(t).toLocaleString() },
    {
      title: '操作',
      render: (_, record) => (
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>管理员白名单</h2>
        <Button type="primary" onClick={() => setModalVisible(true)}>添加管理员</Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal title="添加管理员" open={modalVisible} onOk={handleAdd} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="unionid" label="UnionID" rules={[{ required: true }]}>
            <Input placeholder="请输入微信 UnionID" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="管理员昵称（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Whitelist;
```

- [ ] **Step 5: 添加路由**

```jsx
<Route path="whitelist" element={<Whitelist />} />
```

- [ ] **Step 6: 提交**

```bash
git add server/src/{models/AdminWhitelist.js,controllers/adminController.js,routes/admin.js} client/src/pages/admin/Whitelist.jsx && git commit -m "feat: 白名单管理功能"
```

---

## Task 13: 超管管理页面

**Files:**
- Create: `client/src/pages/admin/SuperAdmins.jsx`

- [ ] **Step 1: 创建超管管理页面 client/src/pages/admin/SuperAdmins.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import api from '../../api';

function SuperAdmins() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/super-admins');
      if (res.code === 0) {
        setList(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await form.validateFields();
      const res = await api.post('/admin/super-admins', form.getFieldsValue());
      if (res.code === 0) {
        message.success('添加成功');
        setModalVisible(false);
        form.resetFields();
        loadData();
      }
    } catch (err) {
      message.error('添加失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username' },
    { title: '状态', dataIndex: 'status', render: (s) => s === 'active' ? '正常' : '禁用' },
    { title: '创建时间', dataIndex: 'created_at', render: (t) => new Date(t).toLocaleString() }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>超管管理</h2>
        <Button type="primary" onClick={() => setModalVisible(true)}>添加超管</Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal title="添加超管" open={modalVisible} onOk={handleAdd} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SuperAdmins;
```

- [ ] **Step 2: 添加超管 CRUD 路由和控制器**

在 adminController.js 添加：
```javascript
const SuperAdmin = require('../models/SuperAdmin');

exports.getSuperAdmins = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, status, created_at FROM super_admins');
    success(res, rows);
  } catch (err) {
    error(res, '获取失败');
  }
};

exports.createSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    await SuperAdmin.create({ username, password });
    success(res);
  } catch (err) {
    error(res, '创建失败');
  }
};
```

在 admin.js 添加路由：
```javascript
router.get('/super-admins', auth, adminController.getSuperAdmins);
router.post('/super-admins', auth, adminController.createSuperAdmin);
```

- [ ] **Step 3: 添加路由**

```jsx
<Route path="super-admins" element={<SuperAdmins />} />
```

- [ ] **Step 4: 提交**

```bash
git add client/src/pages/admin/SuperAdmins.jsx server/src/controllers/adminController.js server/src/routes/admin.js && git commit -m "feat: 超管管理页面"
```

---

## Task 14: 微信授权登录

**Files:**
- Create: `server/src/services/wechatService.js`
- Modify: `server/src/controllers/wechatController.js`
- Create: `server/src/routes/wechat.js`
- Modify: `server/src/app.js`

- [ ] **Step 1: 创建微信服务 server/src/services/wechatService.js**

```javascript
const https = require('https');

class WechatService {
  static async getAccessToken() {
    const { WECHAT_APPID, WECHAT_APPSECRET } = process.env;
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.access_token) {
              resolve(parsed.access_token);
            } else {
              reject(new Error(parsed.errmsg || '获取access_token失败'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  static async getUserInfo(unionid, accessToken) {
    const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${unionid}`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  static async getUnionidByCode(code) {
    const { WECHAT_APPID, WECHAT_APPSECRET } = process.env;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_APPSECRET}&code=${code}&grant_type=authorization_code`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.unionid) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.errmsg || '获取unionid失败'));
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }
}

module.exports = WechatService;
```

- [ ] **Step 2: 创建微信控制器 server/src/controllers/wechatController.js**

```javascript
const WechatService = require('../services/wechatService');
const AdminWhitelist = require('../models/AdminWhitelist');
const { success, error } = require('../utils/response');
const { generateToken } = require('../middlewares/auth');

// 微信扫码登录
exports.wechatLogin = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return error(res, '缺少code参数');
    }

    const wechatData = await WechatService.getUnionidByCode(code);
    const unionid = wechatData.unionid;

    // 检查白名单
    const whitelistUser = await AdminWhitelist.findByUnionid(unionid);
    if (!whitelistUser || whitelistUser.status !== 'active') {
      return error(res, '该用户未授权访问后台');
    }

    // 获取用户信息
    let nickname = whitelistUser.nickname;
    try {
      const accessToken = await WechatService.getAccessToken();
      const userInfo = await WechatService.getUserInfo(unionid, accessToken);
      if (userInfo.nickname) {
        nickname = userInfo.nickname;
      }
    } catch (e) {
      console.error('获取微信用户信息失败', e);
    }

    const token = generateToken({
      id: whitelistUser.id,
      unionid,
      nickname,
      type: 'wechat_admin'
    });

    success(res, { token, nickname });
  } catch (err) {
    console.error(err);
    error(res, '微信登录失败');
  }
};

// 获取 JS-SDK 配置
exports.getJssdkConfig = async (req, res) => {
  try {
    const { url } = req.query;
    const accessToken = await WechatService.getAccessToken();

    const jsapiTicketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
    const ticketData = await new Promise((resolve, reject) => {
      https.get(jsapiTicketUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const signature = generateSignature(jsapiTicket, url);

    success(res, {
      appId: process.env.WECHAT_APPID,
      timestamp: signature.timestamp,
      nonceStr: signature.nonceStr,
      signature: signature.signature
    });
  } catch (err) {
    console.error(err);
    error(res, '获取JS-SDK配置失败');
  }
};

function generateSignature(ticket, url) {
  const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const nonceStr = crypto.randomBytes(16).toString('hex');
  const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
  const signature = crypto.createHash('sha1').update(str).digest('hex');
  return { timestamp, nonceStr, signature };
}
```

- [ ] **Step 3: 创建微信路由 server/src/routes/wechat.js**

```javascript
const express = require('express');
const router = express.Router();
const wechatController = require('../controllers/wechatController');

router.get('/login', wechatController.wechatLogin);
router.get('/config', wechatController.getJssdkConfig);

module.exports = router;
```

- [ ] **Step 4: 更新 app.js**

```javascript
const wechatRoutes = require('./routes/wechat');
app.use('/api/wechat', wechatRoutes);
```

- [ ] **Step 5: 提交**

```bash
git add server/src/{services/wechatService.js,controllers/wechatController.js,routes/wechat.js} && git commit -m "feat: 微信授权登录"
```

---

## Task 15: 微信投票页面

**Files:**
- Create: `client/src/pages/vote/VotePage.jsx`
- Create: `client/src/pages/vote/VoteSuccess.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: 创建微信投票页面 client/src/pages/vote/VotePage.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Card, Button, Radio, Checkbox, Space, message, Result } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../../api';

function VotePage() {
  const { shareUrl } = useParams();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    loadVote();
  }, [shareUrl]);

  const loadVote = async () => {
    try {
      const res = await api.get(`/votes/public/${shareUrl}`);
      if (res.code === 0) {
        setVote(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      return message.error('请至少选择一个选项');
    }

    setLoading(true);
    try {
      const res = await api.post('/wechat/vote', {
        share_url: shareUrl,
        options: selected
      });
      if (res.code === 0) {
        setVoted(true);
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('投票失败');
    } finally {
      setLoading(false);
    }
  };

  if (!vote) return null;

  const options = JSON.parse(vote.options);

  if (voted) {
    return (
      <Result
        status="success"
        title="投票成功！"
        subTitle="感谢您的参与"
        extra={<Button type="primary" href="/">返回首页</Button>}
      />
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '0 16px' }}>
      <Card title={<h2 style={{ margin: 0 }}>{vote.title}</h2>}>
        {vote.description && (
          <p style={{ color: '#666', marginBottom: 16 }}>{vote.description}</p>
        )}

        <div style={{ marginBottom: 24 }}>
          <p style={{ marginBottom: 8 }}>投票类型：{vote.type === 'single' ? '单选' : '多选'}</p>
          <p>每人投票次数：{vote.max_votes_per_user === 0 ? '无限' : `${vote.max_votes_per_user}次`}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          {vote.type === 'single' ? (
            <Radio.Group value={selected[0]} onChange={(e) => setSelected([e.target.value])}>
              <Space direction="vertical">
                {options.map((opt, idx) => (
                  <Radio key={idx} value={idx}>{opt}</Radio>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <Checkbox.Group value={selected} onChange={(values) => setSelected(values)}>
              <Space direction="vertical">
                {options.map((opt, idx) => (
                  <Checkbox key={idx} value={idx}>{opt}</Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        </div>

        <Button type="primary" size="large" block loading={loading} onClick={handleSubmit}>
          提交投票
        </Button>
      </Card>
    </div>
  );
}

export default VotePage;
```

- [ ] **Step 2: 更新 App.jsx 添加微信投票路由**

```jsx
<Route path="/vote/:shareUrl" element={<VotePage />} />
```

- [ ] **Step 3: 提交**

```bash
git add client/src/pages/vote/VotePage.jsx && git commit -m "feat: 微信投票页面"
```

---

## Task 16: 投票提交接口

**Files:**
- Modify: `server/src/controllers/wechatController.js`
- Modify: `server/src/routes/wechat.js`
- Create: `server/src/models/VoteRecord.js`

- [ ] **Step 1: 创建投票记录模型 server/src/models/VoteRecord.js**

```javascript
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
```

- [ ] **Step 2: 更新微信控制器添加投票提交方法**

```javascript
const Vote = require('../models/Vote');
const VoteRecord = require('../models/VoteRecord');

// 提交投票
exports.submitVote = async (req, res) => {
  try {
    const { share_url, options } = req.body;
    const unionid = req.user?.unionid || 'anonymous'; // 微信用户unionid

    if (!share_url || !options || options.length === 0) {
      return error(res, '参数错误');
    }

    const vote = await Vote.findByShareUrl(share_url);
    if (!vote) {
      return error(res, '投票不存在');
    }

    if (vote.status !== 'active') {
      return error(res, '投票已截止');
    }

    if (vote.end_time && new Date(vote.end_time) < new Date()) {
      return error(res, '投票已截止');
    }

    // 检查投票限制
    if (vote.max_votes_per_user > 0) {
      const voteCount = await VoteRecord.countByUnionid(vote.id, unionid);
      if (voteCount >= vote.max_votes_per_user) {
        return error(res, `您已投过票，本次投票次数已用完`);
      }
    }

    await VoteRecord.create({
      vote_id: vote.id,
      unionid,
      nickname: req.user?.nickname || '微信用户',
      avatar: req.user?.avatar || '',
      options
    });

    success(res);
  } catch (err) {
    console.error(err);
    error(res, '投票失败');
  }
};

// 获取投票状态
exports.getVoteStatus = async (req, res) => {
  try {
    const { voteId } = req.params;
    const unionid = req.user?.unionid;

    const vote = await Vote.findById(voteId);
    if (!vote) {
      return error(res, '投票不存在');
    }

    let remaining = -1;
    if (unionid && vote.max_votes_per_user > 0) {
      const count = await VoteRecord.countByUnionid(voteId, unionid);
      remaining = Math.max(0, vote.max_votes_per_user - count);
    }

    success(res, {
      canVote: remaining !== 0,
      remaining
    });
  } catch (err) {
    error(res, '获取状态失败');
  }
};

// 获取公开投票详情
exports.getPublicVote = async (req, res) => {
  try {
    const { shareUrl } = req.params;
    const vote = await Vote.findByShareUrl(shareUrl);
    if (!vote) {
      return error(res, '投票不存在');
    }
    success(res, vote);
  } catch (err) {
    error(res, '获取投票失败');
  }
};
```

- [ ] **Step 3: 更新投票路由**

```javascript
router.get('/vote/status/:voteId', auth, wechatController.getVoteStatus);
router.post('/vote', auth, wechatController.submitVote);
router.get('/votes/public/:shareUrl', wechatController.getPublicVote);
```

- [ ] **Step 4: 提交**

```bash
git add server/src/models/VoteRecord.js server/src/controllers/wechatController.js server/src/routes/wechat.js && git commit -m "feat: 投票提交功能"
```

---

## Task 17: 生成二维码

**Files:**
- Create: `server/src/services/qrcodeService.js`
- Modify: `server/src/controllers/voteController.js`

- [ ] **Step 1: 创建二维码服务 server/src/services/qrcodeService.js**

```javascript
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

class QrcodeService {
  static async generate(voteId, shareUrl) {
    const uploadDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${shareUrl}.png`;
    const filePath = path.join(uploadDir, fileName);
    const publicUrl = `/uploads/qrcodes/${fileName}`;

    // 生成二维码指向投票页面
    const voteUrl = `${process.env.CLIENT_URL || 'http://localhost:3001'}/vote/${shareUrl}`;

    await QRCode.toFile(filePath, voteUrl, {
      width: 300,
      margin: 2
    });

    return publicUrl;
  }
}

module.exports = QrcodeService;
```

- [ ] **Step 2: 更新投票控制器在创建时生成二维码**

```javascript
const QrcodeService = require('../services/qrcodeService');

exports.create = async (req, res) => {
  try {
    // ... 现有逻辑 ...
    const id = await Vote.create({...});
    const share_url = /* 从创建结果获取 */;

    // 生成二维码
    const qrcode = await QrcodeService.generate(id, share_url);
    await Vote.update(id, { qrcode });

    success(res, { id, share_url, qrcode });
  } catch (err) {
    error(res, '创建投票失败');
  }
};
```

- [ ] **Step 3: 安装 qrcode 依赖**

```bash
cd server && npm install qrcode
```

- [ ] **Step 4: 提交**

```bash
git add server/src/services/qrcodeService.js && git commit -m "feat: 二维码生成服务"
```

---

## Task 18: 导出 Excel 功能

**Files:**
- Create: `server/src/services/exportService.js`
- Modify: `server/src/controllers/voteController.js`
- Modify: `server/src/routes/votes.js`

- [ ] **Step 1: 安装 exceljs**

```bash
cd server && npm install exceljs
```

- [ ] **Step 2: 创建导出服务 server/src/services/exportService.js**

```javascript
const ExcelJS = require('exceljs');
const VoteRecord = require('../models/VoteRecord');
const Vote = require('../models/Vote');

class ExportService {
  static async exportVoteRecords(voteId, res) {
    const vote = await Vote.findById(voteId);
    if (!vote) {
      throw new Error('投票不存在');
    }

    const { list } = await VoteRecord.findByVoteId(voteId, 1, 10000);
    const options = JSON.parse(vote.options);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('投票明细');

    // 表头
    sheet.columns = [
      { header: '序号', key: 'index', width: 10 },
      { header: '微信昵称', key: 'nickname', width: 30 },
      { header: '投票时间', key: 'created_at', width: 25 },
      { header: '选择的选项', key: 'selected_options', width: 50 }
    ];

    // 数据行
    list.forEach((record, idx) => {
      const selectedOptions = JSON.parse(record.options);
      const selectedLabels = selectedOptions.map(i => options[i] || `选项${i + 1}`).join(', ');

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
```

- [ ] **Step 3: 更新投票控制器**

```javascript
const ExportService = require('../services/exportService');

exports.exportRecords = async (req, res) => {
  try {
    const { id } = req.params;
    await ExportService.exportVoteRecords(id, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: -1, message: '导出失败' });
  }
};
```

- [ ] **Step 4: 更新投票路由**

```javascript
router.get('/:id/export', voteController.exportRecords);
```

- [ ] **Step 5: 前端添加导出按钮**

在 VoteResults.jsx 添加导出按钮：
```jsx
<Button icon={<DownloadOutlined />} onClick={() => window.open(`/api/votes/${id}/export`)}>
  导出Excel
</Button>
```

- [ ] **Step 6: 提交**

```bash
git add server/src/services/exportService.js server/src/controllers/voteController.js server/src/routes/votes.js && git commit -m "feat: Excel导出功能"
```

---

## Task 19: README 和部署文档

**Files:**
- Create: `README.md`
- Create: `docs/deployment/README.md`

- [ ] **Step 1: 创建 README.md**

```markdown
# 投票智投

专业的投票管理平台。支持创建投票、微信分享、实时统计。

## 功能特性

- 管理员后台（React + Ant Design）
- 微信公众号扫码登录
- 支持单选/多选投票
- 投票次数限制
- 二维码分享
- 数据导出

## 技术栈

- 前端：React 18, Ant Design 5, React Router 6
- 后端：Node.js, Express, MySQL
- 微信：JS-SDK, OAuth2.0

## 开发

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 本地开发

1. 克隆仓库
2. 安装依赖
3. 配置环境变量
4. 初始化数据库
5. 启动服务

详见 [部署文档](docs/deployment/README.md)
```

- [ ] **Step 2: 创建部署文档目录和文档**

```bash
mkdir -p docs/deployment
```

- [ ] **Step 3: 提交**

```bash
git add README.md docs/deployment/README.md && git commit -m "docs: 添加README和部署文档"
```

---

## Task 20: 最终测试和推送

- [ ] **Step 1: 全量测试所有功能**

- [ ] **Step 2: 推送到 GitHub**

```bash
git push origin main
```

- [ ] **Step 3: 创建 GitHub Release 或 Tag**

---

## 自检清单

在完成计划实施后，确认以下内容：

- [ ] 所有页面可访问
- [ ] 管理员可登录
- [ ] 可创建/编辑/删除投票
- [ ] 微信投票页面可访问
- [ ] 二维码生成正常
- [ ] 投票结果统计正确
- [ ] Excel 导出正常
- [ ] 部署文档完整

---

*计划版本：v1.0*
*创建日期：2026-03-31*
