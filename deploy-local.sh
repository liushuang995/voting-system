#!/bin/bash
set -e

GREEN='\033[0;32m'
NC='\033[0m'

echo_step() { echo -e "${GREEN}==>${NC} $1"; }

PROJECT_DIR="$HOME/voting-system"
DB_NAME="toupiao_db"
DB_PASS="123456"
SERVER_PORT=3000

main() {
    echo "投票智投 - 本地部署"

    # 检查项目
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "项目不存在，正在克隆..."
        git clone https://github.com/liushuang995/voting-system.git "$PROJECT_DIR"
    fi

    cd "$PROJECT_DIR"

    # 配置环境变量
    echo_step "配置环境变量..."
    cp server/.env.example server/.env 2>/dev/null || true

    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=${DB_PASS}|" server/.env
    sed -i "s|DB_NAME=.*|DB_NAME=${DB_NAME}|" server/.env
    sed -i "s|PORT=.*|PORT=${SERVER_PORT}|" server/.env
    sed -i "s|CLIENT_URL=.*|CLIENT_URL=http://localhost:5173|" server/.env

    # 安装后端依赖
    echo_step "安装后端依赖..."
    cd "$PROJECT_DIR/server"
    npm install

    # 初始化数据库
    echo_step "初始化数据库..."
    mkdir -p server/docs/database
    cp docs/database/init.sql server/docs/database/ 2>/dev/null || true
    node src/models/init.js

    # 创建超管
    echo_step "创建超管账号..."
    node scripts/createSuperAdmin.js

    # 安装前端依赖
    echo_step "安装前端依赖..."
    cd "$PROJECT_DIR/client"
    npm install

    # 构建前端
    echo_step "构建前端..."
    npm run build

    # 启动后端
    echo_step "启动后端..."
    cd "$PROJECT_DIR/server"
    pm2 delete voting-server 2>/dev/null || true
    pm2 start src/app.js --name voting-server

    echo ""
    echo "========================================"
    echo "本地部署完成！"
    echo "========================================"
    echo ""
    echo "后端 API: http://localhost:${SERVER_PORT}"
    echo "超管账号: admin"
    echo "超管密码: admin123"
    echo ""
    echo "查看日志: pm2 logs voting-server"
}

main "$@"
