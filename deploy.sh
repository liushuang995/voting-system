#!/bin/bash
# ================================================
# 投票智投 - 一键部署脚本
# =============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_step() {
    echo -e "${GREEN}==>${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

echo_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# 检测操作系统
detect_os() {
    if [ -f /etc/alibaba-release ]; then
        echo "Alibaba Cloud Linux"
    elif [ -f /etc/redhat-release ]; then
        echo "CentOS/RHEL"
    elif [ -f /etc/debian_version ]; then
        echo "Debian/Ubuntu"
    else
        echo "Unknown"
    fi
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo_error "请使用 root 用户运行此脚本"
        exit 1
    fi
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo_error "命令 $1 未找到，请先安装"
        return 1
    fi
    return 0
}

# 安装依赖（CentOS/RHEL/Alibaba Cloud Linux）
install_dependencies_centos() {
    echo_step "安装系统依赖..."

    yum update -y

    # 安装 Node.js 18
    if ! command -v node &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    fi

    # 安装 MySQL 8.0
    if ! command -v mysql &> /dev/null; then
        yum install -y mysql mysql-server
        systemctl start mysqld
        systemctl enable mysqld
    fi

    # 安装 Nginx
    if ! command -v nginx &> /dev/null; then
        yum install -y nginx
        systemctl start nginx
        systemctl enable nginx
    fi

    # 安装 Git
    if ! command -v git &> /dev/null; then
        yum install -y git
    fi

    # 安装 PM2
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi

    echo_step "依赖安装完成"
}

# 安装依赖（Debian/Ubuntu）
install_dependencies_debian() {
    echo_step "安装系统依赖..."

    apt update -y

    # 安装 Node.js 18
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi

    # 安装 MySQL
    if ! command -v mysql &> /dev/null; then
        apt install -y mysql-server
        systemctl start mysql
        systemctl enable mysql
    fi

    # 安装 Nginx
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
    fi

    # 安装 Git
    if ! command -v git &> /dev/null; then
        apt install -y git
    fi

    # 安装 PM2
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi

    echo_step "依赖安装完成"
}

# 配置 MySQL
setup_mysql() {
    echo_step "配置 MySQL..."

    # 启动 MySQL
    OS=$(detect_os)
    if [[ "$OS" == "CentOS/RHEL" ]] || [[ "$OS" == "Alibaba Cloud Linux" ]]; then
        systemctl start mysqld
        systemctl enable mysqld
        sleep 5

        # 获取临时密码并修改
        # TEMP_PASS=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}')
        # mysql -u root -p"$TEMP_PASS" --connect-expired-password <<EOF
    fi

    echo_step "MySQL 配置完成"
}

# 获取项目
get_project() {
    echo_step "获取项目代码..."

    cd ~

    if [ -d "voting-system" ]; then
        echo_warn "voting-system 目录已存在，进入目录更新代码"
        cd voting-system
        git pull
    else
        echo "请设置 GITHUB_TOKEN 后自动克隆，或者手动上传代码"
        read -p "输入 GitHub Token（或者按回车跳过）: " GITHUB_TOKEN

        if [ -n "$GITHUB_TOKEN" ]; then
            git clone https://${GITHUB_TOKEN}@github.com/liushuang995/voting-system.git
        else
            echo_warn "请手动上传代码到 ~/voting-system"
        fi
    fi

    cd ~
}

# 配置环境变量
setup_env() {
    echo_step "配置环境变量..."

    if [ ! -f ~/voting-system/server/.env.example ]; then
        echo_error "找不到 .env.example 文件"
        return 1
    fi

    # 复制 env 文件
    if [ ! -f ~/voting-system/server/.env ]; then
        cp ~/voting-system/server/.env.example ~/voting-system/server/.env
    fi

    # 交互式设置密码
    read -p "MySQL 密码 [123456]: " DB_PASS
    DB_PASS=${DB_PASS:-123456}

    read -p "MySQL 用户名 [root]: " DB_USER
    DB_USER=${DB_USER:-root}

    read -p "MySQL 数据库名 [toupiao_db]: " DB_NAME
    DB_NAME=${DB_NAME:-toupiao_db}

    read -p "JWT Secret [随机生成]: " JWT_SECRET
    JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}

    read -p "服务器域名或IP []: " SERVER_HOST

    # 修改 .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" ~/voting-system/server/.env
    sed -i "s/DB_USER=.*/DB_USER=${DB_USER}/" ~/voting-system/server/.env
    sed -i "s/DB_NAME=.*/DB_NAME=${DB_NAME}/" ~/voting-system/server/.env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" ~/voting-system/server/.env
    sed -i "s/CLIENT_URL=.*/CLIENT_URL=http:\/\/${SERVER_HOST}/" ~/voting-system/server/.env

    echo_step "环境变量配置完成"
}

# 初始化数据库
init_database() {
    echo_step "初始化数据库..."

    # 创建数据库
    mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME:-toupiao_db};
EOF

    # 复制并执行 init.sql
    mkdir -p ~/voting-system/server/docs/database
    if [ -f ~/voting-system/docs/database/init.sql ]; then
        cp ~/voting-system/docs/database/init.sql ~/voting-system/server/docs/database/
    fi

    if [ -f ~/voting-system/server/docs/database/init.sql ]; then
        mysql -u root ${DB_NAME:-toupiao_db} < ~/voting-system/server/docs/database/init.sql
    fi

    echo_step "数据库初始化完成"
}

# 安装后端依赖
install_server_deps() {
    echo_step "安装后端依赖..."

    cd ~/voting-system/server
    npm install

    echo_step "后端依赖安装完成"
}

# 安装前端依赖并构建
build_frontend() {
    echo_step "安装前端依赖并构建..."

    cd ~/voting-system/client
    npm install
    npm run build

    echo_step "前端构建完成"
}

# 配置 Nginx
setup_nginx() {
    echo_step "配置 Nginx..."

    SERVER_HOST=${SERVER_HOST:-$(hostname -I | awk '{print $1}')}

    cat > /etc/nginx/conf.d/voting.conf <<EOF
server {
    listen 80;
    server_name ${SERVER_HOST};

    client_max_body_size 100M;

    location / {
        root /root/voting-system/client/dist;
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

    # 测试配置并重载
    nginx -t && nginx -s reload

    echo_step "Nginx 配置完成"
}

# 启动服务
start_services() {
    echo_step "启动服务..."

    # 停止旧进程
    pm2 delete voting-server 2>/dev/null || true

    # 启动后端
    cd ~/voting-system/server
    pm2 start src/app.js --name voting-server
    pm2 save

    echo_step "服务启动完成"
}

# 创建超管账号
create_admin() {
    echo_step "创建超管账号..."

    cd ~/voting-system/server
    node scripts/createSuperAdmin.js

    echo_step "超管账号创建完成"
}

# 开放防火墙端口
open_firewall() {
    echo_step "开放防火墙端口..."

    OS=$(detect_os)

    if [[ "$OS" == "CentOS/RHEL" ]] || [[ "$OS" == "Alibaba Cloud Linux" ]]; then
        # CentOS/RHEL 使用 firewalld
        if command -v firewall-cmd &> /dev/null; then
            firewall-cmd --permanent --add-port=80/tcp
            firewall-cmd --reload
        fi
    elif [[ "$OS" == "Debian/Ubuntu" ]]; then
        # Ubuntu 使用 ufw
        if command -v ufw &> /dev/null; then
            ufw allow 80/tcp
            ufw reload
        fi
    fi

    echo_step "防火墙配置完成"
}

# 显示部署结果
show_result() {
    SERVER_HOST=${SERVER_HOST:-$(hostname -I | awk '{print $1}')}

    echo ""
    echo "========================================"
    echo -e "${GREEN}部署完成！${NC}"
    echo "========================================"
    echo ""
    echo "访问地址: http://${SERVER_HOST}"
    echo "超管账号: admin"
    echo "超管密码: 123456"
    echo ""
    echo "常用命令:"
    echo "  查看服务状态: pm2 status"
    echo "  查看后端日志: pm2 logs voting-server"
    echo "  重启后端服务: pm2 restart voting-server"
    echo "  重启 Nginx:   nginx -s reload"
    echo ""
}

# 主流程
main() {
    echo ""
    echo "========================================"
    echo "    投票智投 - 一键部署脚本"
    echo "========================================"
    echo ""

    check_root

    OS=$(detect_os)
    echo_step "检测到操作系统: $OS"

    # 如果是本地测试，跳过依赖安装
    if [ "$1" != "local" ]; then
        # 安装依赖
        if [[ "$OS" == "CentOS/RHEL" ]] || [[ "$OS" == "Alibaba Cloud Linux" ]]; then
            install_dependencies_centos
        elif [[ "$OS" == "Debian/Ubuntu" ]]; then
            install_dependencies_debian
        fi

        setup_mysql
        open_firewall
    fi

    get_project
    setup_env
    init_database
    install_server_deps
    build_frontend
    setup_nginx
    start_services
    create_admin

    show_result
}

# 运行
main "$@"
