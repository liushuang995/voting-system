#!/bin/bash
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo_step() { echo -e "${GREEN}==>${NC} $1"; }
echo_error() { echo -e "${RED}==> ERROR:${NC} $1"; }

PROJECT_DIR="/Users/liushuang/Desktop/刘爽文件/workplace/demo"
DB_HOST="127.0.0.1"
DB_PORT=3306
DB_NAME="toupiao_db"
DB_USER="root"
DB_PASS="root"
SERVER_PORT=3000
CLIENT_PORT=3001

main() {
    echo "========================================"
    echo "投票智投 - 本地部署脚本"
    echo "========================================"
    echo ""

    # 检查项目
    if [ ! -d "$PROJECT_DIR" ]; then
        echo_error "项目目录不存在: $PROJECT_DIR"
        exit 1
    fi

    cd "$PROJECT_DIR"

    # 检查 MAMP MySQL
    echo_step "检查 MySQL 数据库..."
    if ! mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" --ssl-mode=DISABLED -e "SELECT 1" > /dev/null 2>&1; then
        echo_error "无法连接到 MAMP MySQL (host=$DB_HOST, port=$DB_PORT)"
        echo "请确保 MAMP 已启动"
        exit 1
    fi
    echo "MySQL 连接成功"

    # 配置后端
    echo_step "配置后端环境变量..."
    cat > "$PROJECT_DIR/server/.env" << EOF
# 数据库配置
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

# 服务器配置
PORT=$SERVER_PORT
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_in_production

# 微信配置
WECHAT_APPID=wx8453381924814a0d
WECHAT_APPSECRET=a3a2ba386812c7efbaa72fcf9ebda0d1

# 客户端地址（用于 CORS）
CLIENT_URL=http://localhost:$CLIENT_PORT
EOF
    echo "后端配置完成"

    # 安装后端依赖
    echo_step "安装后端依赖..."
    cd "$PROJECT_DIR/server"
    npm install --silent 2>/dev/null || npm install

    # 初始化数据库
    echo_step "初始化数据库..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" --ssl-mode=DISABLED < "$PROJECT_DIR/docs/database/init.sql" 2>/dev/null || true

    # 创建超管账号
    echo_step "创建超管账号..."
    node -e "
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function create() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query('DELETE FROM super_admins WHERE username = ?', ['admin']);
    await conn.query('INSERT INTO super_admins (username, password) VALUES (?, ?)', ['admin', hash]);
    console.log('超管账号已创建: admin / admin123');
    await conn.end();
}
create().catch(console.error);
" 2>&1

    # 安装前端依赖
    echo_step "安装前端依赖..."
    cd "$PROJECT_DIR/client"
    npm install --silent 2>/dev/null || npm install

    # 停止旧服务
    echo_step "停止旧服务..."
    lsof -ti :$SERVER_PORT | xargs kill -9 2>/dev/null || true
    lsof -ti :$CLIENT_PORT | xargs kill -9 2>/dev/null || true
    sleep 1

    # 启动后端
    echo_step "启动后端服务..."
    cd "$PROJECT_DIR/server"
    node src/app.js > /dev/null 2>&1 &
    sleep 2

    # 启动前端
    echo_step "启动前端服务..."
    cd "$PROJECT_DIR/client"
    npm run dev > /dev/null 2>&1 &
    sleep 3

    # 检查服务状态
    echo ""
    echo_step "检查服务状态..."
    if lsof -i :$SERVER_PORT > /dev/null 2>&1; then
        echo "  后端 API: http://localhost:$SERVER_PORT ✓"
    else
        echo "  后端 API: http://localhost:$SERVER_PORT ✗ (启动失败)"
    fi

    if lsof -i :$CLIENT_PORT > /dev/null 2>&1; then
        echo "  前端页面: http://localhost:$CLIENT_PORT ✓"
    else
        echo "  前端页面: http://localhost:$CLIENT_PORT ✗ (启动失败)"
    fi

    echo ""
    echo "========================================"
    echo "本地部署完成！"
    echo "========================================"
    echo ""
    echo "访问地址:"
    echo "  前端: http://localhost:$CLIENT_PORT"
    echo "  后端: http://localhost:$SERVER_PORT"
    echo ""
    echo "超管账号: admin"
    echo "超管密码: admin123"
    echo ""
}

main "$@"
