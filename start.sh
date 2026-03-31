#!/bin/bash
# ================================================
# 投票智投 - 一键启动脚本
# =============================================

PROJECT_DIR="$HOME/voting-system"

echo "启动投票智投服务..."

# 启动后端
cd "$PROJECT_DIR/server"
pm2 restart voting-server || pm2 start src/app.js --name voting-server

# 启动前端开发服务器
cd "$PROJECT_DIR/client"
npm run dev
