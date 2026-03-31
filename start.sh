#!/bin/bash
# ================================================
# 投票智投 - 一键启动脚本
# =============================================

PROJECT_DIR="$HOME/voting-system"

echo "启动投票智投服务..."

# 启动后端
cd "$PROJECT_DIR/server"
pm2 restart voting-server || pm2 start src/app.js --name voting-server

# 启动 Nginx（如果没运行）
sudo nginx -s reload 2>/dev/null || sudo nginx

echo "服务已启动"
echo "访问地址: http://你的服务器IP"
echo "查看日志: pm2 logs voting-server"
