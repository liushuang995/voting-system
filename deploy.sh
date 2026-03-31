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
SERVER_IP=$(hostname -I | awk '{print $1}')

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

    # 5. 配置 Nginx
    echo_step "5. 配置 Nginx..."
    sudo tee /etc/nginx/conf.d/voting.conf > /dev/null <<EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    client_max_body_size 100M;

    location / {
        root ${PROJECT_DIR}/client/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

    # 6. 重载 Nginx
    echo_step "6. 重载 Nginx..."
    sudo nginx -t && sudo nginx -s reload

    # 7. 重启后端服务
    echo_step "7. 重启后端服务..."
    cd "$PROJECT_DIR/server"
    pm2 restart voting-server || pm2 start src/app.js --name voting-server
    pm2 save

    echo ""
    echo "========================================="
    echo -e "${GREEN}部署完成！${NC}"
    echo "========================================="
    echo ""
    echo "访问地址: http://${SERVER_IP}"
    echo "超管账号: admin"
    echo "超管密码: 123456"
    echo ""
    echo "常用命令:"
    echo "  查看后端日志: pm2 logs voting-server"
    echo "  重启后端:     pm2 restart voting-server"
    echo "  重启 Nginx:   sudo nginx -s reload"
    echo ""
}

deploy
