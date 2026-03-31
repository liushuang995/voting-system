# 投票智投部署指南

## 服务器要求

- **系统**: CentOS 7+ / Ubuntu 20.04+
- **配置**: 2核4G 起步
- **磁盘**: 40GB+ 系统盘

## 部署步骤

### 1. 服务器环境配置

#### 安装 Node.js 18

```bash
# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs
```

#### 安装 MySQL 8

```bash
# CentOS
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Ubuntu
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
```

#### 安装 Nginx

```bash
# CentOS
sudo yum install -y nginx

# Ubuntu
sudo apt install -y nginx
```

### 2. 数据库配置

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE toupiao_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 项目部署

```bash
# 创建项目目录
sudo mkdir -p /var/www/voting-system
cd /var/www/voting-system

# 拉取代码
sudo git clone https://github.com/liushuang995/voting-system.git .

# 安装依赖
cd server && npm install --production
cd ../client && npm install --production
```

### 4. 环境变量配置

```bash
cd server
sudo cp .env.example .env
sudo nano .env  # 编辑配置
```

### 5. 数据库初始化

```bash
cd server
node src/models/init.js
```

### 6. 构建前端

```bash
cd client
npm run build
```

前端构建产物在 `client/dist/` 目录。

### 7. Nginx 配置

创建 `/etc/nginx/conf.d/voting.conf`:

```nginx
server {
    listen 80;
    server_name your_domain.com;

    # 前端静态文件
    location / {
        root /var/www/voting-system/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 8. 使用 PM2 启动后端

```bash
cd server
npm install -g pm2
pm2 start src/app.js --name voting-api

# 设置开机启动
pm2 save
pm2 startup
```

### 9. HTTPS 配置（可选但推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

## 微信配置

### 1. JS 安全域名配置

在微信公众平台设置 JS 安全域名：
- 登录微信公众平台
- 进入「设置与开发」→「公众号设置」
- 点击「功能设置」
- 设置「JS接口安全域名」

### 2. 授权回调域名

设置「网页授权域名」

## 验证部署

1. 访问 http://your_domain.com/admin
2. 使用创建的超级管理员账号登录
3. 创建测试投票
4. 分享投票链接验证

## 常见问题

### 数据库连接失败
- 检查 `.env` 中的数据库配置
- 确保 MySQL 服务正常运行
- 检查防火墙端口 3306

### 前端资源加载失败
- 检查 Nginx 配置中的 root 路径
- 确保前端构建完成

### 微信分享不生效
- 确保已配置 JS 安全域名
- 确保服务器可通过 HTTPS 访问
