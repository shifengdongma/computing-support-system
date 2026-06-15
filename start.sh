#!/bin/bash
#
# 算力支撑管理系统 - 生产部署启动脚本
# 启动 Mock 后端 (8080) + npm run build 构建前端 + Nginx 静态代理
#

# ============================================================
# 配置（可修改）
# ============================================================
PROJECT_DIR="/www/算力支撑管理系统"
NPM_BIN="/root/.nvm/versions/node/v18.20.5/bin"
PID_DIR="$PROJECT_DIR/.pids"
MOCK_PORT=8080

# ============================================================
# 环境检查
# ============================================================
export PATH="$NPM_BIN:$PATH"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}[ERROR]${NC} 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

if ! command -v node &>/dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js 未安装"
    exit 1
fi

mkdir -p "$PID_DIR"

echo "============================================"
echo "  算力支撑管理系统 v1.0"
echo "============================================"
echo ""

# ============================================================
# 1. 启动 Mock 后端 (端口 8080)
# ============================================================
echo "[1/2] 启动 Mock 后端 (端口 $MOCK_PORT)..."

# 先检查 PM2 管理的旧进程
pm2 stop mock-backend 2>/dev/null || true
pm2 delete mock-backend 2>/dev/null || true

# 再检查端口占用
if fuser -s ${MOCK_PORT}/tcp 2>/dev/null; then
    echo "  → 端口 $MOCK_PORT 被占用，释放旧进程..."
    fuser -k -9 ${MOCK_PORT}/tcp 2>/dev/null || true
    sleep 1
fi

if [ -f "$PID_DIR/mock-backend.pid" ]; then
    OLD_PID=$(cat "$PID_DIR/mock-backend.pid" 2>/dev/null)
    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
    fi
fi

cd "$PROJECT_DIR"
nohup node server/index.cjs > "$PID_DIR/mock-backend.log" 2>&1 &
MOCK_PID=$!
echo $MOCK_PID > "$PID_DIR/mock-backend.pid"
sleep 1

# 验证 Mock 后端是否启动
if kill -0 $MOCK_PID 2>/dev/null; then
    echo -e "  ${GREEN}→ Mock 后端已启动 (PID: $MOCK_PID)${NC}"
else
    echo -e "${RED}  ✗ Mock 后端启动失败，检查日志:${NC}"
    echo "     tail -20 $PID_DIR/mock-backend.log"
    tail -20 "$PID_DIR/mock-backend.log" 2>/dev/null
    exit 1
fi

# ============================================================
# 2. 构建前端
# ============================================================
echo ""
echo "[2/2] 构建前端 (npm run build)..."
echo "  (vue-tsc 类型检查 + vite build 打包)"

cd "$PROJECT_DIR"
if npm run build > "$PID_DIR/build.log" 2>&1; then
    echo -e "  ${GREEN}→ 前端构建成功 → dist/${NC}"
else
    echo -e "${RED}  ✗ 前端构建失败，检查日志:${NC}"
    echo "     tail -20 $PID_DIR/build.log"
    tail -20 "$PID_DIR/build.log" 2>/dev/null
    exit 1
fi

# ============================================================
# 3. 确保 Nginx 运行并加载配置
# ============================================================
echo ""
echo "[3/3] 检查 Nginx 代理..."

NGINX_BIN="/www/server/nginx/sbin/nginx"
NGINX_CONF="/www/server/panel/vhost/nginx/computing-support.conf"

if [ -f "$NGINX_CONF" ]; then
    echo "  → Nginx 配置文件已找到: $NGINX_CONF"
else
    echo -e "${RED}  ✗ Nginx 配置文件不存在，请创建: $NGINX_CONF${NC}"
    exit 1
fi

# 检查 Nginx 是否运行
if pgrep -x nginx > /dev/null; then
    echo "  → Nginx 已在运行，reload 配置..."
    $NGINX_BIN -s reload 2>/dev/null || true
else
    echo "  → 启动 Nginx..."
    $NGINX_BIN -c /www/server/nginx/conf/nginx.conf 2>/dev/null || true
fi

# 验证 Nginx 状态
sleep 1
if pgrep -x nginx > /dev/null; then
    echo -e "  ${GREEN}→ Nginx 运行正常${NC}"
else
    echo -e "${RED}  ✗ Nginx 启动失败${NC}"
    exit 1
fi

# ============================================================
# 4. 输出结果
# ============================================================
echo ""
echo "============================================"
echo -e "  ${GREEN}生产部署完成！${NC}"
echo ""
echo "  部署架构: Nginx(:8088) → dist/ (静态文件)"
echo "                        → /api → Mock后端(:8080)"
echo ""
echo "  访问地址: http://<服务器IP>:8088"
echo "  本机测试: http://localhost:8088"
echo ""
echo "============================================"
echo ""
echo "  管理命令:"
echo "     查看后端日志:          tail -f $PID_DIR/mock-backend.log"
echo "     查看构建日志:          cat $PID_DIR/build.log"
echo "     停止所有服务:          bash $PROJECT_DIR/stop.sh"
echo ""
