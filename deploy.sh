#!/bin/bash
# ================================================
# 投票智投 - 服务器一键部署脚本
# =============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo_step() { echo -e "${GREEN}==>${NC} $1"; }

PROJECT_DIR="$HOME/voting-system"
DB_NAME="toupiao_db"
DB_PASS="123456"

deploy() {
    echo "========================================="
    echo "    投票智投 - 一键部署"
    echo "========================================="
    echo ""

    # 1. 拉取最新代码
    echo_step "1. 拉取最新代码..."
    cd "$PROJECT_DIR"
    git pull

    # 2. 安装后端依赖
    echo_step "2. 安装后端依赖..."
    cd "$PROJECT_DIR/server"
    npm install

    # 3. 安装前端依赖
    echo_step "3. 安装前端依赖..."
    cd "$PROJECT_DIR/client"
    npm install

    # 4. 构建前端
    echo_step "4. 构建前端..."
    npm run build

    # 5. 重启后端服务
    echo_step "5. 重启后端服务..."
    cd "$PROJECT_DIR/server"
    pm2 restart voting-server || pm2 start src/app.js --name voting-server

    echo ""
    echo "========================================="
    echo -e "${GREEN}部署完成！${NC}"
    echo "========================================="
    echo ""
    echo "访问地址: http://你的域名或IP"
    echo "查看日志: pm2 logs voting-server"
    echo ""
}

deploy
