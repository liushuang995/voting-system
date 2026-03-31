# 投票智投

专业的投票管理平台。支持创建投票、微信分享、实时统计。

## 功能特性

- **管理后台** - React + Ant Design 构建的响应式管理界面
- **微信公众号扫码登录** - 支持管理员微信扫码认证
- **投票管理** - 支持创建单选/多选投票，灵活配置投票规则
- **微信分享** - 生成二维码和分享链接，便于微信传播
- **数据统计** - 实时查看投票结果和参与明细
- **Excel 导出** - 一键导出投票数据

## 技术栈

- **前端**: React 18, Ant Design 5, React Router 6, Vite
- **后端**: Node.js, Express, MySQL
- **微信**: 微信 JS-SDK, OAuth2.0 授权

## 项目结构

```
voting-system/
├── client/          # React 前端
├── server/         # Node.js 后端
├── docs/           # 文档
└── requirements.md # 需求文档
```

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/liushuang995/voting-system.git
cd voting-system

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 配置

1. 复制环境变量配置文件：
```bash
cd server
cp .env.example .env
```

2. 编辑 `.env` 文件，配置数据库和微信参数：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=toupiao_db
JWT_SECRET=your_jwt_secret
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret
```

### 数据库初始化

```bash
cd server
node src/models/init.js
```

### 创建管理员账号

```bash
cd server
node scripts/createSuperAdmin.js admin your_password
```

### 启动开发服务器

```bash
# 终端1: 启动后端
cd server
npm run dev

# 终端2: 启动前端
cd client
npm run dev
```

访问 http://localhost:3001/admin 登录管理后台。

## 部署

详见 [部署文档](docs/deployment/README.md)

## 许可证

MIT
