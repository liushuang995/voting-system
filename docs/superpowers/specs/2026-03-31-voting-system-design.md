# 投票智投系统设计文档

## 1. 项目概述

- **项目名称**：投票智投
- **公众号名称**：投票智投
- **公众号ID**：gh_8d49870cfdd4
- **AppID**：wx8453381924814a0d
- **项目类型**：Web 投票管理平台
- **核心功能**：创建投票、微信分享投票、后台管理投票结果与明细
- **目标用户**：企业/商家向客户发起投票收集反馈
- **部署环境**：阿里云服务器

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + Ant Design | 管理后台 + 微信 H5 投票页 |
| 后端 | Node.js + Express | API 服务 |
| 数据库 | MySQL | 数据存储 |
| 微信集成 | 微信 JS-SDK + OAuth2.0 | 分享、授权登录 |
| 二维码 | qrcode | 生成投票二维码 |
| 本地开发 | ngrok | 内网穿透测试微信功能 |

### 2.2 项目结构

```
demo/
├── client/                      # React 前端
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   ├── pages/               # 页面
│   │   │   ├── admin/           # 管理后台页面
│   │   │   └── vote/            # 投票前端页面
│   │   ├── services/            # API 请求
│   │   ├── styles/              # 样式
│   │   └── App.js
│   ├── public/
│   └── package.json
├── server/                      # Node.js 后端
│   ├── src/
│   │   ├── routes/              # 路由
│   │   ├── controllers/        # 控制器
│   │   ├── models/              # 数据模型
│   │   ├── middlewares/         # 中间件
│   │   ├── services/            # 业务逻辑
│   │   ├── utils/               # 工具函数
│   │   └── app.js
│   ├── .env                     # 环境变量配置
│   └── package.json
├── docs/                        # 文档
│   └── superpowers/specs/       # 设计文档
├── requirements.md              # 需求文档
└── README.md                     # 项目说明
```

### 2.3 环境变量配置 (.env)

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

# 微信配置
WECHAT_APPID=wx8453381924814a0d
WECHAT_APPSECRET=a3a2ba386812c7efbaa72fcf9ebda0d1

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# 客户端地址（用于 CORS）
CLIENT_URL=http://localhost:3001
```

---

## 3. 数据库设计

### 3.1 表结构

#### 管理员白名单表 (admin_whitelist)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| unionid | VARCHAR(100) | 微信用户唯一标识 |
| nickname | VARCHAR(100) | 微信昵称 |
| status | ENUM('active', 'disabled') | 状态 |
| created_at | DATETIME | 添加时间 |
| created_by | INT | 添加人（超管ID） |

#### 超管表 (super_admins)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 密码（加密存储） |
| status | ENUM('active', 'disabled') | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### 投票表 (votes)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| title | VARCHAR(100) | 投票标题 |
| description | TEXT | 投票说明 |
| type | ENUM('single', 'multiple') | 单选/多选 |
| options | JSON | 选项列表 |
| max_votes_per_user | INT | 每位用户最大投票次数（0=无限） |
| end_time | DATETIME | 截止时间（NULL表示不限制） |
| status | ENUM('active', 'closed') | 状态 |
| share_title | VARCHAR(100) | 分享标题 |
| share_desc | VARCHAR(200) | 分享描述 |
| share_img | VARCHAR(255) | 分享封面图 |
| share_url | VARCHAR(255) | 分享链接 |
| qrcode | VARCHAR(255) | 二维码路径 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### 投票记录表 (vote_records)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键自增 |
| vote_id | INT | 关联投票ID |
| unionid | VARCHAR(100) | 微信用户唯一标识 |
| nickname | VARCHAR(100) | 微信昵称 |
| avatar | VARCHAR(255) | 微信头像 |
| options | JSON | 选择的选项 |
| created_at | DATETIME | 投票时间 |

---

## 4. API 接口设计

### 4.1 管理员接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/admin/login` | POST | 超管登录（用户名+密码） | 无 |
| `/api/admin/wechat/login` | GET | 微信公众号扫码登录 | 无 |
| `/api/admin/wechat/callback` | GET | 微信授权回调 | 无 |
| `/api/admin/logout` | POST | 退出登录 | JWT |
| `/api/admin/whitelist` | GET | 获取白名单 | 超管 |
| `/api/admin/whitelist` | POST | 添加白名单 | 超管 |
| `/api/admin/whitelist/:id` | DELETE | 删除白名单 | 超管 |
| `/api/admin/super-admins` | GET/POST | 超管管理 | 超管 |

### 4.2 投票接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/votes` | GET | 获取投票列表 | JWT |
| `/api/votes` | POST | 创建投票 | JWT |
| `/api/votes/:id` | GET | 投票详情 | JWT |
| `/api/votes/:id` | PUT | 编辑投票 | JWT |
| `/api/votes/:id` | DELETE | 删除投票 | JWT |
| `/api/votes/:id/results` | GET | 投票结果统计 | JWT |
| `/api/votes/:id/records` | GET | 投票明细记录 | JWT |
| `/api/votes/:id/export` | GET | 导出 Excel | JWT |

### 4.3 微信接口

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/wechat/config` | GET | 获取 JS-SDK 配置 | 无 |
| `/api/wechat/auth` | GET | 微信授权登录 | 无 |
| `/api/wechat/callback` | GET | 微信授权回调 | 无 |
| `/api/wechat/vote` | POST | 提交投票 | 微信用户 |
| `/api/wechat/vote/status/:voteId` | GET | 获取用户投票状态 | 微信用户 |

---

## 5. 前端页面设计

### 5.1 管理后台页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录页 | `/admin/login` | 超管登录 + 微信公众号扫码 |
| 管理后台首页 | `/admin` | 仪表盘统计 |
| 投票列表 | `/admin/votes` | 投票列表、筛选、搜索 |
| 创建投票 | `/admin/votes/create` | 创建投票表单 |
| 编辑投票 | `/admin/votes/:id/edit` | 编辑投票表单 |
| 投票结果 | `/admin/votes/:id/results` | 结果图表 + 明细 |
| 导出数据 | `/admin/votes/:id/export` | 导出 Excel |
| 白名单管理 | `/admin/whitelist` | 管理员白名单管理 |
| 超管管理 | `/admin/super-admins` | 超管账号管理 |

### 5.2 微信投票页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 投票首页 | `/vote/:shareUrl` | 投票详情 + 投票表单 |
| 投票成功 | `/vote/:shareUrl/success` | 投票成功提示 |

### 5.3 UI 风格

- 使用 Ant Design 默认组件
- 主题色定制：体现"投票智投"品牌
- Logo 和页面标题统一展示品牌信息

---

## 6. 开发计划

### 第一阶段：项目初始化
- [ ] 初始化 client 和 server 项目结构
- [ ] 配置 MySQL 数据库连接
- [ ] 配置环境变量
- [ ] 初始化数据库表

### 第二阶段：管理员登录
- [ ] 超管登录（用户名+密码）
- [ ] 微信公众号扫码登录
- [ ] 管理员白名单功能
- [ ] 超管管理功能

### 第三阶段：投票管理（管理后台）
- [ ] 创建投票页面
- [ ] 投票列表页面
- [ ] 编辑/删除投票
- [ ] 投票结果展示

### 第四阶段：投票功能（微信前端）
- [ ] 微信授权登录
- [ ] 投票页面展示
- [ ] 提交投票逻辑
- [ ] 投票限制控制

### 第五阶段：微信集成
- [ ] 微信 JS-SDK 配置
- [ ] 分享到朋友/朋友圈
- [ ] 生成投票二维码
- [ ] ngrok 本地测试

### 第六阶段：高级功能
- [ ] 导出 Excel
- [ ] 数据可视化图表
- [ ] 部署文档编写

---

## 7. 部署方案

### 7.1 阿里云服务器要求
- 系统盘：建议 40GB+
- 带宽：建议 2Mbps+
- 系统：CentOS 7+ / Ubuntu 20.04+

### 7.2 部署步骤（详细文档）
1. 服务器环境配置（Nginx、Node.js、MySQL）
2. 数据库创建和初始化
3. 前端构建和部署
4. 后端部署（PM2）
5. Nginx 反向代理配置
6. 微信公众平台配置（JS安全域名）
7. 验证测试

---

## 8. 微信开发注意事项

### 8.1 本地开发
- 使用 ngrok 暴露本地服务
- 微信 JS-SDK 需要真实域名（备案域名）
- 本地可测试授权登录，分享功能需线上验证

### 8.2 生产环境
- 微信 JS 安全域名配置
- 微信授权回调域名配置
- HTTPS 证书配置

---

*文档版本：v1.0*
*创建日期：2026-03-31*
*基于需求文档 v1.3*
